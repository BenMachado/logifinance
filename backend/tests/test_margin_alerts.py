"""Margin service unit tests + dashboard KPI tests."""
import pytest
from decimal import Decimal
from datetime import date

from app.services.margin_service import _safe_margin


def test_safe_margin_basic():
    assert _safe_margin(Decimal("100"), Decimal("70")) == pytest.approx(0.30)
    assert _safe_margin(Decimal("0"), Decimal("50")) == 0.0
    assert _safe_margin(Decimal("-1"), Decimal("0")) == 0.0


async def _setup(client, with_trip=True):
    await client.post(
        "/api/v1/auth/register",
        json={
            "company_name": "Margin Co",
            "full_name": "Owner",
            "email": "m@m.com",
            "password": "pass12345",
        },
    )
    r = await client.post(
        "/api/v1/auth/login", json={"email": "m@m.com", "password": "pass12345"}
    )
    auth = {"Authorization": f"Bearer {r.json()['access_token']}"}
    r = await client.post(
        "/api/v1/vehicles", json={"plate": "MGN-0001", "model": "M"}, headers=auth
    )
    vid = r.json()["id"]
    if not with_trip:
        return auth, vid, None
    r = await client.post(
        "/api/v1/trips",
        json={
            "vehicle_id": vid,
            "origin": "A",
            "destination": "B",
            "gross_revenue": 10000,
            "scheduled_date": str(date.today()),
        },
        headers=auth,
    )
    return auth, vid, r.json()["id"]


@pytest.mark.asyncio
async def test_dashboard_kpis_endpoint(client):
    auth, vid, trip_id = await _setup(client)
    # Add a cost
    await client.post(
        "/api/v1/costs",
        json={
            "vehicle_id": vid,
            "trip_id": trip_id,
            "category": "fuel",
            "amount": 3000,
            "incurred_on": str(date.today()),
        },
        headers=auth,
    )
    # Complete trip
    await client.post(f"/api/v1/trips/{trip_id}/complete", headers=auth)

    r = await client.get("/api/v1/dashboard/kpis", headers=auth)
    assert r.status_code == 200
    data = r.json()
    assert float(data["gross_revenue"]) == 10000.0
    assert float(data["total_cost"]) == 3000.0
    assert float(data["net_profit"]) == 7000.0
    assert data["avg_margin"] == pytest.approx(0.7)


@pytest.mark.asyncio
async def test_vehicle_performance_rows(client):
    auth, vid, trip_id = await _setup(client)
    await client.post(
        "/api/v1/costs",
        json={
            "vehicle_id": vid,
            "trip_id": trip_id,
            "category": "fuel",
            "amount": 9500,  # 5% margin -> below 10% (half of 20% threshold) -> alert
            "incurred_on": str(date.today()),
        },
        headers=auth,
    )
    await client.post(f"/api/v1/trips/{trip_id}/complete", headers=auth)

    r = await client.get("/api/v1/dashboard/vehicle-performance", headers=auth)
    assert r.status_code == 200
    rows = r.json()["rows"]
    assert len(rows) == 1
    assert rows[0]["plate"] == "MGN-0001"
    assert rows[0]["status"] == "alert"


@pytest.mark.asyncio
async def test_alerts_count(client):
    auth, vid, trip_id = await _setup(client)
    await client.post(
        "/api/v1/costs",
        json={
            "vehicle_id": vid,
            "trip_id": trip_id,
            "category": "fuel",
            "amount": 9500,
            "incurred_on": str(date.today()),
        },
        headers=auth,
    )
    await client.post(f"/api/v1/trips/{trip_id}/complete", headers=auth)

    r = await client.get("/api/v1/dashboard/alerts/count", headers=auth)
    assert r.json()["count"] >= 1


@pytest.mark.asyncio
async def test_resolve_alert(client):
    auth, vid, trip_id = await _setup(client)
    await client.post(
        "/api/v1/costs",
        json={
            "vehicle_id": vid,
            "trip_id": trip_id,
            "category": "fuel",
            "amount": 9500,
            "incurred_on": str(date.today()),
        },
        headers=auth,
    )
    await client.post(f"/api/v1/trips/{trip_id}/complete", headers=auth)
    alerts_res = (await client.get("/api/v1/alerts", headers=auth)).json()
    alerts = alerts_res["items"]
    assert len(alerts) > 0
    alert_id = alerts[0]["id"]
    r = await client.post(f"/api/v1/alerts/{alert_id}/resolve", headers=auth)
    assert r.status_code == 200
    # Now list without resolved
    r = await client.get("/api/v1/alerts", headers=auth)
    assert r.json()["items"] == []
