"""Pagination, filtering, and edge case tests for all list endpoints."""
import pytest
from datetime import date, timedelta


async def _setup(client, email="pg@test.com"):
    await client.post(
        "/api/v1/auth/register",
        json={
            "company_name": "PgCo",
            "full_name": "Owner",
            "email": email,
            "password": "pass12345",
        },
    )
    r = await client.post(
        "/api/v1/auth/login", json={"email": email, "password": "pass12345"}
    )
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ── Vehicles ──────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_vehicles_pagination(client):
    auth = await _setup(client)
    for i in range(5):
        await client.post(
            "/api/v1/vehicles",
            json={"plate": f"PGV-{i:04d}", "model": f"M{i}"},
            headers=auth,
        )
    r = await client.get("/api/v1/vehicles?page=2&page_size=2", headers=auth)
    data = r.json()
    assert data["total"] == 5
    assert len(data["items"]) == 2
    assert data["page"] == 2


@pytest.mark.asyncio
async def test_vehicles_status_filter(client):
    auth = await _setup(client)
    await client.post(
        "/api/v1/vehicles",
        json={"plate": "STS-0001", "model": "M", "status": "active"},
        headers=auth,
    )
    await client.post(
        "/api/v1/vehicles",
        json={"plate": "STS-0002", "model": "N", "status": "maintenance"},
        headers=auth,
    )
    r = await client.get("/api/v1/vehicles?status=active", headers=auth)
    assert r.json()["total"] == 1
    assert r.json()["items"][0]["plate"] == "STS-0001"


# ── Drivers ───────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_drivers_pagination(client):
    auth = await _setup(client)
    for i in range(4):
        await client.post(
            "/api/v1/drivers",
            json={"full_name": f"Driver {i}", "phone": f"+551199999{i:04d}"},
            headers=auth,
        )
    r = await client.get("/api/v1/drivers?page=1&page_size=2", headers=auth)
    data = r.json()
    assert data["total"] == 4
    assert len(data["items"]) == 2


@pytest.mark.asyncio
async def test_drivers_search_by_phone(client):
    auth = await _setup(client)
    await client.post(
        "/api/v1/drivers",
        json={"full_name": "Maria", "phone": "+5511987654321"},
        headers=auth,
    )
    await client.post(
        "/api/v1/drivers",
        json={"full_name": "Joao", "phone": "+5511912345678"},
        headers=auth,
    )
    r = await client.get("/api/v1/drivers?q=98765", headers=auth)
    assert r.json()["total"] == 1
    assert r.json()["items"][0]["full_name"] == "Maria"


# ── Trips ─────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_trips_pagination(client):
    auth = await _setup(client)
    r = await client.post(
        "/api/v1/vehicles", json={"plate": "TRG-0001", "model": "M"}, headers=auth
    )
    vid = r.json()["id"]
    for i in range(6):
        await client.post(
            "/api/v1/trips",
            json={
                "vehicle_id": vid,
                "origin": f"City{i}",
                "destination": f"Dest{i}",
                "gross_revenue": 1000,
                "scheduled_date": str(date.today()),
            },
            headers=auth,
        )
    r = await client.get("/api/v1/trips?page=1&page_size=3", headers=auth)
    data = r.json()
    assert data["total"] == 6
    assert len(data["items"]) == 3


@pytest.mark.asyncio
async def test_trips_status_filter(client):
    auth = await _setup(client)
    r = await client.post(
        "/api/v1/vehicles", json={"plate": "TRF-0001", "model": "M"}, headers=auth
    )
    vid = r.json()["id"]
    r = await client.post(
        "/api/v1/trips",
        json={
            "vehicle_id": vid,
            "origin": "A",
            "destination": "B",
            "gross_revenue": 1000,
            "scheduled_date": str(date.today()),
        },
        headers=auth,
    )
    trip_id = r.json()["id"]
    # Complete one trip
    await client.post(f"/api/v1/trips/{trip_id}/complete", headers=auth)

    r = await client.get("/api/v1/trips?status=completed", headers=auth)
    assert r.json()["total"] == 1

    r = await client.get("/api/v1/trips?status=in_progress", headers=auth)
    assert r.json()["total"] == 0


@pytest.mark.asyncio
async def test_trips_date_filter(client):
    auth = await _setup(client)
    r = await client.post(
        "/api/v1/vehicles", json={"plate": "TRD-0001", "model": "M"}, headers=auth
    )
    vid = r.json()["id"]
    today = date.today()
    yesterday = today - timedelta(days=1)
    await client.post(
        "/api/v1/trips",
        json={
            "vehicle_id": vid,
            "origin": "A",
            "destination": "B",
            "gross_revenue": 1000,
            "scheduled_date": str(yesterday),
        },
        headers=auth,
    )
    await client.post(
        "/api/v1/trips",
        json={
            "vehicle_id": vid,
            "origin": "C",
            "destination": "D",
            "gross_revenue": 2000,
            "scheduled_date": str(today),
        },
        headers=auth,
    )
    r = await client.get(f"/api/v1/trips?date_from={today}&date_to={today}", headers=auth)
    assert r.json()["total"] == 1


@pytest.mark.asyncio
async def test_trips_vehicle_filter(client):
    auth = await _setup(client)
    r1 = await client.post(
        "/api/v1/vehicles", json={"plate": "TRV-0001", "model": "M"}, headers=auth
    )
    r2 = await client.post(
        "/api/v1/vehicles", json={"plate": "TRV-0002", "model": "N"}, headers=auth
    )
    vid1, vid2 = r1.json()["id"], r2.json()["id"]
    await client.post(
        "/api/v1/trips",
        json={"vehicle_id": vid1, "origin": "A", "destination": "B", "gross_revenue": 1000, "scheduled_date": str(date.today())},
        headers=auth,
    )
    await client.post(
        "/api/v1/trips",
        json={"vehicle_id": vid2, "origin": "C", "destination": "D", "gross_revenue": 2000, "scheduled_date": str(date.today())},
        headers=auth,
    )
    r = await client.get(f"/api/v1/trips?vehicle_id={vid1}", headers=auth)
    assert r.json()["total"] == 1


# ── Maintenance ───────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_maintenance_crud(client):
    auth = await _setup(client)
    r = await client.post(
        "/api/v1/vehicles", json={"plate": "MNT-0001", "model": "M"}, headers=auth
    )
    vid = r.json()["id"]
    # Create
    r = await client.post(
        "/api/v1/maintenance",
        json={
            "vehicle_id": vid,
            "type": "preventive",
            "description": "Troca de óleo",
            "cost": 500,
            "performed_on": str(date.today()),
        },
        headers=auth,
    )
    assert r.status_code == 201, r.text
    rec_id = r.json()["id"]

    # Read
    r = await client.get(f"/api/v1/maintenance/{rec_id}", headers=auth)
    assert r.status_code == 200
    assert r.json()["description"] == "Troca de óleo"

    # Update
    r = await client.patch(
        f"/api/v1/maintenance/{rec_id}",
        json={"description": "Troca de óleo + filtro"},
        headers=auth,
    )
    assert r.status_code == 200
    assert r.json()["description"] == "Troca de óleo + filtro"

    # Delete
    r = await client.delete(f"/api/v1/maintenance/{rec_id}", headers=auth)
    assert r.status_code == 204

    r = await client.get(f"/api/v1/maintenance/{rec_id}", headers=auth)
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_maintenance_generates_cost_entry(client):
    auth = await _setup(client)
    r = await client.post(
        "/api/v1/vehicles", json={"plate": "MNC-0001", "model": "M"}, headers=auth
    )
    vid = r.json()["id"]
    r = await client.post(
        "/api/v1/maintenance",
        json={
            "vehicle_id": vid,
            "type": "corrective",
            "description": "Reparo motor",
            "cost": 3000,
            "performed_on": str(date.today()),
        },
        headers=auth,
    )
    assert r.status_code == 201
    rec_id = r.json()["id"]
    assert r.json()["cost_entry_id"] is not None

    # Cost entry should exist
    r = await client.get(f"/api/v1/costs?vehicle_id={vid}", headers=auth)
    assert r.json()["total"] == 1
    assert float(r.json()["items"][0]["amount"]) == 3000.0


@pytest.mark.asyncio
async def test_maintenance_vehicle_filter(client):
    auth = await _setup(client)
    r1 = await client.post(
        "/api/v1/vehicles", json={"plate": "MVF-0001", "model": "M"}, headers=auth
    )
    r2 = await client.post(
        "/api/v1/vehicles", json={"plate": "MVF-0002", "model": "N"}, headers=auth
    )
    vid1, vid2 = r1.json()["id"], r2.json()["id"]
    await client.post(
        "/api/v1/maintenance",
        json={"vehicle_id": vid1, "type": "preventive", "description": "A", "performed_on": str(date.today())},
        headers=auth,
    )
    await client.post(
        "/api/v1/maintenance",
        json={"vehicle_id": vid2, "type": "corrective", "description": "B", "performed_on": str(date.today())},
        headers=auth,
    )
    r = await client.get(f"/api/v1/maintenance?vehicle_id={vid1}", headers=auth)
    assert r.json()["total"] == 1


@pytest.mark.asyncio
async def test_maintenance_type_filter(client):
    auth = await _setup(client)
    r = await client.post(
        "/api/v1/vehicles", json={"plate": "MTF-0001", "model": "M"}, headers=auth
    )
    vid = r.json()["id"]
    await client.post(
        "/api/v1/maintenance",
        json={"vehicle_id": vid, "type": "preventive", "description": "A", "performed_on": str(date.today())},
        headers=auth,
    )
    await client.post(
        "/api/v1/maintenance",
        json={"vehicle_id": vid, "type": "corrective", "description": "B", "performed_on": str(date.today())},
        headers=auth,
    )
    r = await client.get("/api/v1/maintenance?type=preventive", headers=auth)
    assert r.json()["total"] == 1


# ── Receipts ──────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_receipts_status_filter(client):
    auth = await _setup(client, email="rcpt@test.com")
    r = await client.post(
        "/api/v1/vehicles", json={"plate": "RCP-0001", "model": "M"}, headers=auth
    )
    vid = r.json()["id"]
    # Create two receipts
    r1 = await client.post(
        "/api/v1/receipts/whatsapp/simulate",
        json={"sender_name": "A", "sender_phone": "+5511999990001", "vehicle_plate": "RCP-0001", "text": "R$ 100"},
        headers=auth,
    )
    r2 = await client.post(
        "/api/v1/receipts/whatsapp/simulate",
        json={"sender_name": "B", "sender_phone": "+5511999990002", "vehicle_plate": "RCP-0001", "text": "R$ 200"},
        headers=auth,
    )
    rid1 = r1.json()["id"]
    rid2 = r2.json()["id"]
    # Confirm one
    await client.post(
        f"/api/v1/receipts/{rid2}/confirm",
        json={"vehicle_id": vid, "category": "fuel", "amount": 200},
        headers=auth,
    )
    r = await client.get("/api/v1/receipts?status=pending", headers=auth)
    assert r.json()["total"] == 1
    assert r.json()["items"][0]["id"] == rid1
    r = await client.get("/api/v1/receipts?status=confirmed", headers=auth)
    assert r.json()["total"] == 1
    assert r.json()["items"][0]["id"] == rid2


@pytest.mark.asyncio
async def test_receipts_pagination(client):
    auth = await _setup(client, email="rcpt2@test.com")
    for i in range(4):
        await client.post(
            "/api/v1/receipts/whatsapp/simulate",
            json={"sender_name": f"D{i}", "sender_phone": f"+551199999{i:04d}", "text": f"R$ {100+i}"},
            headers=auth,
        )
    r = await client.get("/api/v1/receipts?page=1&page_size=2", headers=auth)
    data = r.json()
    assert data["total"] == 4
    assert len(data["items"]) == 2


# ── Alerts ────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_alerts_pagination(client):
    auth = await _setup(client, email="alrt@test.com")
    r = await client.post(
        "/api/v1/vehicles", json={"plate": "ALT-0001", "model": "M"}, headers=auth
    )
    vid = r.json()["id"]
    # Create 3 trips with low margins
    for i in range(3):
        r = await client.post(
            "/api/v1/trips",
            json={
                "vehicle_id": vid,
                "origin": f"A{i}",
                "destination": f"B{i}",
                "gross_revenue": 1000,
                "scheduled_date": str(date.today()),
            },
            headers=auth,
        )
        trip_id = r.json()["id"]
        await client.post(
            "/api/v1/costs",
            json={"vehicle_id": vid, "trip_id": trip_id, "category": "fuel", "amount": 950, "incurred_on": str(date.today())},
            headers=auth,
        )
        await client.post(f"/api/v1/trips/{trip_id}/complete", headers=auth)

    r = await client.get("/api/v1/alerts?page=1&page_size=2", headers=auth)
    data = r.json()
    assert data["total"] >= 3
    assert len(data["items"]) == 2


# ── Auth edge cases ───────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_login_nonexistent_email(client):
    r = await client.post(
        "/api/v1/auth/login", json={"email": "no@exist.com", "password": "pass12345"}
    )
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_register_missing_fields(client):
    r = await client.post(
        "/api/v1/auth/register",
        json={"company_name": "X"},
    )
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_me_with_invalid_token(client):
    r = await client.get(
        "/api/v1/auth/me", headers={"Authorization": "Bearer invalid.token.here"}
    )
    assert r.status_code == 401
