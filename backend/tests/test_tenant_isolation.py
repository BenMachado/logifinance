"""Tenant isolation tests for trips, drivers, receipts, maintenance, and alerts.

These tests verify that company_id filtering prevents cross-tenant data access
on list endpoints, get-by-id, and update/delete operations.
"""
from datetime import date

import pytest


async def _register(client, email: str, company_name: str) -> dict:
    """Register a new company + admin user; return {Authorization header, vehicle_id}."""
    r = await client.post(
        "/api/v1/auth/register",
        json={
            "company_name": company_name,
            "full_name": "Admin",
            "email": email,
            "password": "pass12345",
        },
    )
    assert r.status_code == 201, r.text
    login = await client.post(
        "/api/v1/auth/login", json={"email": email, "password": "pass12345"}
    )
    token = login.json()["access_token"]
    auth = {"Authorization": f"Bearer {token}"}

    # Each company gets its own vehicle
    r = await client.post(
        "/api/v1/vehicles",
        json={"plate": email.split("@")[0].upper() + "-0001", "model": "M"},
        headers=auth,
    )
    assert r.status_code == 201, r.text
    vid = r.json()["id"]
    return {"auth": auth, "vehicle_id": vid}


# ── Drivers ───────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_drivers_tenant_isolation_on_list(client):
    a = await _register(client, "drv_a@iso.com", "DrvA")
    b = await _register(client, "drv_b@iso.com", "DrvB")

    await client.post(
        "/api/v1/drivers",
        json={"full_name": "Driver A", "phone": "+5511911111111"},
        headers=a["auth"],
    )
    await client.post(
        "/api/v1/drivers",
        json={"full_name": "Driver B", "phone": "+5511922222222"},
        headers=b["auth"],
    )

    r = await client.get("/api/v1/drivers", headers=a["auth"])
    assert r.status_code == 200
    data = r.json()
    assert data["total"] == 1
    assert data["items"][0]["full_name"] == "Driver A"


@pytest.mark.asyncio
async def test_drivers_tenant_isolation_on_get(client):
    a = await _register(client, "drvg_a@iso.com", "DrvGA")
    b = await _register(client, "drvg_b@iso.com", "DrvGB")

    r = await client.post(
        "/api/v1/drivers",
        json={"full_name": "Driver B Only", "phone": "+5511933333333"},
        headers=b["auth"],
    )
    b_driver_id = r.json()["id"]

    # Company A tries to fetch Company B's driver
    r = await client.get(f"/api/v1/drivers/{b_driver_id}", headers=a["auth"])
    assert r.status_code == 404


# ── Trips ─────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_trips_tenant_isolation_on_list(client):
    a = await _register(client, "trp_a@iso.com", "TrpA")
    b = await _register(client, "trp_b@iso.com", "TrpB")

    await client.post(
        "/api/v1/trips",
        json={
            "vehicle_id": a["vehicle_id"],
            "origin": "OriginA",
            "destination": "DestA",
            "gross_revenue": 1000,
            "scheduled_date": str(date.today()),
        },
        headers=a["auth"],
    )
    await client.post(
        "/api/v1/trips",
        json={
            "vehicle_id": b["vehicle_id"],
            "origin": "OriginB",
            "destination": "DestB",
            "gross_revenue": 2000,
            "scheduled_date": str(date.today()),
        },
        headers=b["auth"],
    )

    r = await client.get("/api/v1/trips", headers=a["auth"])
    data = r.json()
    assert data["total"] == 1
    assert data["items"][0]["origin"] == "OriginA"


@pytest.mark.asyncio
async def test_trips_tenant_isolation_on_get(client):
    a = await _register(client, "trpg_a@iso.com", "TrpGA")
    b = await _register(client, "trpg_b@iso.com", "TrpGB")

    r = await client.post(
        "/api/v1/trips",
        json={
            "vehicle_id": b["vehicle_id"],
            "origin": "X",
            "destination": "Y",
            "gross_revenue": 1500,
            "scheduled_date": str(date.today()),
        },
        headers=b["auth"],
    )
    b_trip_id = r.json()["id"]

    # Company A tries to fetch Company B's trip
    r = await client.get(f"/api/v1/trips/{b_trip_id}", headers=a["auth"])
    assert r.status_code == 404


# ── Receipts ──────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_receipts_tenant_isolation_on_list(client):
    a = await _register(client, "rcp_a@iso.com", "RcpA")
    b = await _register(client, "rcp_b@iso.com", "RcpB")

    await client.post(
        "/api/v1/receipts/whatsapp/simulate",
        json={
            "sender_name": "Sender A",
            "sender_phone": "+5511944444444",
            "vehicle_plate": "RCPA-0001",
            "text": "R$ 100",
        },
        headers=a["auth"],
    )
    await client.post(
        "/api/v1/receipts/whatsapp/simulate",
        json={
            "sender_name": "Sender B",
            "sender_phone": "+5511955555555",
            "vehicle_plate": "RCPB-0001",
            "text": "R$ 200",
        },
        headers=b["auth"],
    )

    r = await client.get("/api/v1/receipts", headers=a["auth"])
    data = r.json()
    assert data["total"] == 1
    assert data["items"][0]["sender_name"] == "Sender A"


# ── Maintenance ───────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_maintenance_tenant_isolation_on_list(client):
    a = await _register(client, "mnt_a@iso.com", "MntA")
    b = await _register(client, "mnt_b@iso.com", "MntB")

    await client.post(
        "/api/v1/maintenance",
        json={
            "vehicle_id": a["vehicle_id"],
            "type": "preventive",
            "description": "Manutenção A",
            "performed_on": str(date.today()),
        },
        headers=a["auth"],
    )
    await client.post(
        "/api/v1/maintenance",
        json={
            "vehicle_id": b["vehicle_id"],
            "type": "corrective",
            "description": "Manutenção B",
            "performed_on": str(date.today()),
        },
        headers=b["auth"],
    )

    r = await client.get("/api/v1/maintenance", headers=a["auth"])
    data = r.json()
    assert data["total"] == 1
    assert data["items"][0]["description"] == "Manutenção A"


@pytest.mark.asyncio
async def test_maintenance_tenant_isolation_on_get(client):
    a = await _register(client, "mntg_a@iso.com", "MntGA")
    b = await _register(client, "mntg_b@iso.com", "MntGB")

    r = await client.post(
        "/api/v1/maintenance",
        json={
            "vehicle_id": b["vehicle_id"],
            "type": "preventive",
            "description": "B only",
            "performed_on": str(date.today()),
        },
        headers=b["auth"],
    )
    b_maint_id = r.json()["id"]

    # Company A tries to fetch Company B's maintenance record
    r = await client.get(f"/api/v1/maintenance/{b_maint_id}", headers=a["auth"])
    assert r.status_code == 404


# ── Alerts ────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_alerts_tenant_isolation(client):
    a = await _register(client, "alt_a@iso.com", "AltA")
    b = await _register(client, "alt_b@iso.com", "AltB")

    # Generate an alert for company B: trip with very low margin
    r = await client.post(
        "/api/v1/trips",
        json={
            "vehicle_id": b["vehicle_id"],
            "origin": "A",
            "destination": "B",
            "gross_revenue": 1000,
            "scheduled_date": str(date.today()),
        },
        headers=b["auth"],
    )
    b_trip_id = r.json()["id"]
    await client.post(
        "/api/v1/costs",
        json={
            "vehicle_id": b["vehicle_id"],
            "trip_id": b_trip_id,
            "category": "fuel",
            "amount": 950,
            "incurred_on": str(date.today()),
        },
        headers=b["auth"],
    )
    await client.post(f"/api/v1/trips/{b_trip_id}/complete", headers=b["auth"])

    # Company A sees no alerts
    r = await client.get("/api/v1/alerts", headers=a["auth"])
    assert r.json()["total"] == 0
    assert r.json()["items"] == []

    # Company B sees its own alert
    r = await client.get("/api/v1/alerts", headers=b["auth"])
    assert r.json()["total"] >= 1


@pytest.mark.asyncio
async def test_alerts_tenant_isolation_on_resolve(client):
    a = await _register(client, "altr_a@iso.com", "AltRA")
    b = await _register(client, "altr_b@iso.com", "AltRB")

    # Create an alert for company B
    r = await client.post(
        "/api/v1/trips",
        json={
            "vehicle_id": b["vehicle_id"],
            "origin": "A",
            "destination": "B",
            "gross_revenue": 1000,
            "scheduled_date": str(date.today()),
        },
        headers=b["auth"],
    )
    b_trip_id = r.json()["id"]
    await client.post(
        "/api/v1/costs",
        json={
            "vehicle_id": b["vehicle_id"],
            "trip_id": b_trip_id,
            "category": "fuel",
            "amount": 950,
            "incurred_on": str(date.today()),
        },
        headers=b["auth"],
    )
    await client.post(f"/api/v1/trips/{b_trip_id}/complete", headers=b["auth"])

    b_alerts = (await client.get("/api/v1/alerts", headers=b["auth"])).json()["items"]
    assert len(b_alerts) >= 1
    b_alert_id = b_alerts[0]["id"]

    # Company A tries to resolve Company B's alert — must 404
    r = await client.post(f"/api/v1/alerts/{b_alert_id}/resolve", headers=a["auth"])
    assert r.status_code == 404

    # Alert still belongs to company B and is unresolved
    r = await client.get("/api/v1/alerts", headers=b["auth"])
    items = r.json()["items"]
    assert any(a["id"] == b_alert_id for a in items)
