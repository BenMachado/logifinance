"""Trip creation and margin check tests."""
import pytest
from datetime import date, timedelta


async def _setup_company_with_vehicle(client):
    await client.post(
        "/api/v1/auth/register",
        json={
            "company_name": "TripCo",
            "full_name": "Owner",
            "email": "t@trip.com",
            "password": "pass12345",
        },
    )
    r = await client.post(
        "/api/v1/auth/login", json={"email": "t@trip.com", "password": "pass12345"}
    )
    token = r.json()["access_token"]
    auth = {"Authorization": f"Bearer {token}"}

    r = await client.post(
        "/api/v1/vehicles", json={"plate": "TRP-2026", "model": "Mercedes Actros"}, headers=auth
    )
    vid = r.json()["id"]
    return auth, vid


@pytest.mark.asyncio
async def test_create_and_complete_trip_with_alert(client):
    auth, vid = await _setup_company_with_vehicle(client)

    trip_payload = {
        "vehicle_id": vid,
        "origin": "São Paulo",
        "destination": "Rio de Janeiro",
        "gross_revenue": 10000,
        "scheduled_date": str(date.today()),
    }
    r = await client.post("/api/v1/trips", json=trip_payload, headers=auth)
    assert r.status_code == 201, r.text
    trip_id = r.json()["id"]

    # Add an outrageous cost > 80% of revenue (margin will be ~5%)
    r = await client.post(
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
    assert r.status_code == 201, r.text

    # Complete the trip
    r = await client.post(f"/api/v1/trips/{trip_id}/complete", headers=auth)
    assert r.status_code == 200, r.text

    # Alert should exist
    r = await client.get("/api/v1/alerts", headers=auth)
    assert r.status_code == 200
    alerts = r.json()["items"]
    assert len(alerts) >= 1
    assert alerts[0]["vehicle_id"] == vid
    assert float(alerts[0]["actual_margin"]) < 0.20


@pytest.mark.asyncio
async def test_completing_healthy_trip_resolves_no_alert(client):
    auth, vid = await _setup_company_with_vehicle(client)
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
    trip_id = r.json()["id"]

    # small cost = healthy margin
    await client.post(
        "/api/v1/costs",
        json={
            "vehicle_id": vid,
            "trip_id": trip_id,
            "category": "fuel",
            "amount": 2000,
            "incurred_on": str(date.today()),
        },
        headers=auth,
    )
    r = await client.post(f"/api/v1/trips/{trip_id}/complete", headers=auth)
    assert r.status_code == 200

    r = await client.get("/api/v1/alerts", headers=auth)
    assert r.json()["items"] == []
