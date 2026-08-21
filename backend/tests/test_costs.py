"""Cost entry, CSV export, and filtering tests."""
import pytest
from datetime import date, timedelta


async def _setup(client):
    await client.post(
        "/api/v1/auth/register",
        json={
            "company_name": "CostCo",
            "full_name": "Owner",
            "email": "cost@test.com",
            "password": "pass12345",
        },
    )
    r = await client.post(
        "/api/v1/auth/login", json={"email": "cost@test.com", "password": "pass12345"}
    )
    token = r.json()["access_token"]
    auth = {"Authorization": f"Bearer {token}"}
    r = await client.post(
        "/api/v1/vehicles", json={"plate": "CST-0001", "model": "Volvo"}, headers=auth
    )
    return auth, r.json()["id"]


@pytest.mark.asyncio
async def test_create_cost_entry(client):
    auth, vid = await _setup(client)
    r = await client.post(
        "/api/v1/costs",
        json={
            "vehicle_id": vid,
            "category": "fuel",
            "amount": 500,
            "description": "Diesel",
            "incurred_on": str(date.today()),
        },
        headers=auth,
    )
    assert r.status_code == 201, r.text
    data = r.json()
    assert float(data["amount"]) == 500.0
    assert data["category"] == "fuel"
    assert data["vehicle_id"] == vid


@pytest.mark.asyncio
async def test_create_cost_invalid_vehicle(client):
    auth, _ = await _setup(client)
    r = await client.post(
        "/api/v1/costs",
        json={
            "vehicle_id": 99999,
            "category": "fuel",
            "amount": 100,
            "incurred_on": str(date.today()),
        },
        headers=auth,
    )
    assert r.status_code == 400


@pytest.mark.asyncio
async def test_list_costs_with_pagination(client):
    auth, vid = await _setup(client)
    for i in range(5):
        await client.post(
            "/api/v1/costs",
            json={
                "vehicle_id": vid,
                "category": "fuel",
                "amount": 100 + i,
                "incurred_on": str(date.today()),
            },
            headers=auth,
        )
    r = await client.get("/api/v1/costs?page=1&page_size=2", headers=auth)
    assert r.status_code == 200
    data = r.json()
    assert data["total"] == 5
    assert len(data["items"]) == 2
    assert data["total_pages"] == 3


@pytest.mark.asyncio
async def test_filter_costs_by_category(client):
    auth, vid = await _setup(client)
    await client.post(
        "/api/v1/costs",
        json={"vehicle_id": vid, "category": "fuel", "amount": 100, "incurred_on": str(date.today())},
        headers=auth,
    )
    await client.post(
        "/api/v1/costs",
        json={"vehicle_id": vid, "category": "toll", "amount": 50, "incurred_on": str(date.today())},
        headers=auth,
    )
    r = await client.get("/api/v1/costs?category=fuel", headers=auth)
    assert r.json()["total"] == 1
    assert r.json()["items"][0]["category"] == "fuel"


@pytest.mark.asyncio
async def test_filter_costs_by_date_range(client):
    auth, vid = await _setup(client)
    today = date.today()
    yesterday = today - timedelta(days=1)
    await client.post(
        "/api/v1/costs",
        json={"vehicle_id": vid, "category": "fuel", "amount": 100, "incurred_on": str(yesterday)},
        headers=auth,
    )
    await client.post(
        "/api/v1/costs",
        json={"vehicle_id": vid, "category": "fuel", "amount": 200, "incurred_on": str(today)},
        headers=auth,
    )
    r = await client.get(f"/api/v1/costs?date_from={today}&date_to={today}", headers=auth)
    assert r.json()["total"] == 1
    assert float(r.json()["items"][0]["amount"]) == 200.0


@pytest.mark.asyncio
async def test_filter_costs_by_vehicle(client):
    auth, vid1 = await _setup(client)
    r = await client.post(
        "/api/v1/vehicles", json={"plate": "CST-0002", "model": "Scania"}, headers=auth
    )
    vid2 = r.json()["id"]
    await client.post(
        "/api/v1/costs",
        json={"vehicle_id": vid1, "category": "fuel", "amount": 100, "incurred_on": str(date.today())},
        headers=auth,
    )
    await client.post(
        "/api/v1/costs",
        json={"vehicle_id": vid2, "category": "fuel", "amount": 200, "incurred_on": str(date.today())},
        headers=auth,
    )
    r = await client.get(f"/api/v1/costs?vehicle_id={vid1}", headers=auth)
    assert r.json()["total"] == 1


@pytest.mark.asyncio
async def test_cost_breakdown(client):
    auth, vid = await _setup(client)
    await client.post(
        "/api/v1/costs",
        json={"vehicle_id": vid, "category": "fuel", "amount": 500, "incurred_on": str(date.today())},
        headers=auth,
    )
    await client.post(
        "/api/v1/costs",
        json={"vehicle_id": vid, "category": "toll", "amount": 150, "incurred_on": str(date.today())},
        headers=auth,
    )
    r = await client.get("/api/v1/costs/breakdown", headers=auth)
    assert r.status_code == 200
    breakdown = r.json()
    categories = {item["category"]: item["total"] for item in breakdown}
    assert categories["fuel"] == 500.0
    assert categories["toll"] == 150.0


@pytest.mark.asyncio
async def test_export_csv(client):
    auth, vid = await _setup(client)
    await client.post(
        "/api/v1/costs",
        json={"vehicle_id": vid, "category": "fuel", "amount": 999.99, "incurred_on": str(date.today())},
        headers=auth,
    )
    r = await client.get("/api/v1/costs/export/csv", headers=auth)
    assert r.status_code == 200
    assert "text/csv" in r.headers["content-type"]
    assert "999.99" in r.text
    assert "fuel" in r.text


@pytest.mark.asyncio
async def test_cost_tenant_isolation(client):
    # Company A
    r = await client.post(
        "/api/v1/auth/register",
        json={"company_name": "CompA", "full_name": "AdminA", "email": "aiso@test.com", "password": "pass12345"},
    )
    assert r.status_code == 201, f"Register A failed: {r.text}"
    login_a = await client.post("/api/v1/auth/login", json={"email": "aiso@test.com", "password": "pass12345"})
    assert login_a.status_code == 200, f"Login A failed: {login_a.text}"
    auth_a = {"Authorization": f"Bearer {login_a.json()['access_token']}"}

    # Company B
    r = await client.post(
        "/api/v1/auth/register",
        json={"company_name": "CompB", "full_name": "AdminB", "email": "biso@test.com", "password": "pass12345"},
    )
    assert r.status_code == 201, f"Register B failed: {r.text}"
    login_b = await client.post("/api/v1/auth/login", json={"email": "biso@test.com", "password": "pass12345"})
    assert login_b.status_code == 200, f"Login B failed: {login_b.text}"
    auth_b = {"Authorization": f"Bearer {login_b.json()['access_token']}"}

    r_a = await client.post("/api/v1/vehicles", json={"plate": "ISO-1111", "model": "M"}, headers=auth_a)
    r_b = await client.post("/api/v1/vehicles", json={"plate": "ISO-2222", "model": "N"}, headers=auth_b)

    await client.post(
        "/api/v1/costs",
        json={"vehicle_id": r_a.json()["id"], "category": "fuel", "amount": 100, "incurred_on": str(date.today())},
        headers=auth_a,
    )
    await client.post(
        "/api/v1/costs",
        json={"vehicle_id": r_b.json()["id"], "category": "fuel", "amount": 200, "incurred_on": str(date.today())},
        headers=auth_b,
    )

    r = await client.get("/api/v1/costs", headers=auth_a)
    assert r.json()["total"] == 1
    assert float(r.json()["items"][0]["amount"]) == 100.0
