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


@pytest.mark.asyncio
async def test_export_trips_csv(client):
    auth, vid = await _setup_company_with_vehicle(client)
    await client.post(
        "/api/v1/trips",
        json={
            "vehicle_id": vid,
            "origin": "São Paulo",
            "destination": "Curitiba",
            "gross_revenue": 2500.50,
            "distance_km": 400,
            "scheduled_date": str(date.today()),
        },
        headers=auth,
    )
    r = await client.get("/api/v1/trips/export/csv", headers=auth)
    assert r.status_code == 200
    assert "text/csv" in r.headers["content-type"]
    assert "attachment" in r.headers["content-disposition"]
    assert "São Paulo" in r.text
    assert "Curitiba" in r.text
    assert "2500.50" in r.text
    assert "in_progress" in r.text


@pytest.mark.asyncio
async def test_export_trips_csv_tenant_isolation(client):
    """CSV export must filter by company_id — company A cannot see B's trips."""
    # Company A
    await client.post(
        "/api/v1/auth/register",
        json={"company_name": "TripA", "full_name": "OA", "email": "tisoa@t.com", "password": "pass12345"},
    )
    login_a = await client.post("/api/v1/auth/login", json={"email": "tisoa@t.com", "password": "pass12345"})
    auth_a = {"Authorization": f"Bearer {login_a.json()['access_token']}"}
    r = await client.post("/api/v1/vehicles", json={"plate": "TA-0001", "model": "M"}, headers=auth_a)
    vid_a = r.json()["id"]

    # Company B
    await client.post(
        "/api/v1/auth/register",
        json={"company_name": "TripB", "full_name": "OB", "email": "tisob@t.com", "password": "pass12345"},
    )
    login_b = await client.post("/api/v1/auth/login", json={"email": "tisob@t.com", "password": "pass12345"})
    auth_b = {"Authorization": f"Bearer {login_b.json()['access_token']}"}
    r = await client.post("/api/v1/vehicles", json={"plate": "TB-0001", "model": "M"}, headers=auth_b)
    vid_b = r.json()["id"]

    await client.post(
        "/api/v1/trips",
        json={"vehicle_id": vid_a, "origin": "OriginA", "destination": "DestA", "gross_revenue": 100, "scheduled_date": str(date.today())},
        headers=auth_a,
    )
    await client.post(
        "/api/v1/trips",
        json={"vehicle_id": vid_b, "origin": "OriginB", "destination": "DestB", "gross_revenue": 200, "scheduled_date": str(date.today())},
        headers=auth_b,
    )

    r = await client.get("/api/v1/trips/export/csv", headers=auth_a)
    assert "OriginA" in r.text
    assert "OriginB" not in r.text
