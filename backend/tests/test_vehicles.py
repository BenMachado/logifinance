"""Vehicle + Driver CRUD tests with tenant isolation."""
import pytest


async def _register_and_login(client, email="owner@logi.com"):
    await client.post(
        "/api/v1/auth/register",
        json={
            "company_name": "Logi X",
            "full_name": "Owner",
            "email": email,
            "password": "pass12345",
        },
    )
    r = await client.post(
        "/api/v1/auth/login", json={"email": email, "password": "pass12345"}
    )
    return r.json()["access_token"]


def _auth(token):
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_create_and_list_driver(client):
    token = await _register_and_login(client)
    r = await client.post(
        "/api/v1/drivers",
        json={"full_name": "Carlos Silva", "phone": "+5511999990000"},
        headers=_auth(token),
    )
    assert r.status_code == 201, r.text
    driver_id = r.json()["id"]

    r = await client.get("/api/v1/drivers", headers=_auth(token))
    assert r.status_code == 200
    res = r.json()
    assert res["total"] == 1
    assert len(res["items"]) == 1
    assert res["items"][0]["id"] == driver_id


@pytest.mark.asyncio
async def test_create_and_list_vehicle(client):
    token = await _register_and_login(client)

    # Create driver
    dr = await client.post(
        "/api/v1/drivers",
        json={"full_name": "João Souza", "phone": "+5511988887777"},
        headers=_auth(token),
    )
    driver_id = dr.json()["id"]

    # Create vehicle linked to driver
    r = await client.post(
        "/api/v1/vehicles",
        json={"plate": "ABC-1D23", "model": "Scania R450", "driver_id": driver_id},
        headers=_auth(token),
    )
    assert r.status_code == 201, r.text
    vid = r.json()["id"]

    r = await client.get("/api/v1/vehicles", headers=_auth(token))
    assert r.status_code == 200
    res = r.json()
    assert any(v["id"] == vid for v in res["items"])


@pytest.mark.asyncio
async def test_vehicle_plate_uniqueness_within_company(client):
    token = await _register_and_login(client)
    payload = {"plate": "XYZ-9999", "model": "Volvo FH"}
    r1 = await client.post("/api/v1/vehicles", json=payload, headers=_auth(token))
    assert r1.status_code == 201
    r2 = await client.post("/api/v1/vehicles", json=payload, headers=_auth(token))
    assert r2.status_code == 409


@pytest.mark.asyncio
async def test_tenant_isolation_on_vehicles(client):
    # Two different companies
    token_a = await _register_and_login(client, email="a@co.com")
    token_b = await _register_and_login(client, email="b@co.com")

    await client.post(
        "/api/v1/vehicles", json={"plate": "AAA-1111", "model": "M1"}, headers=_auth(token_a)
    )
    await client.post(
        "/api/v1/vehicles", json={"plate": "BBB-2222", "model": "M2"}, headers=_auth(token_b)
    )

    r = await client.get("/api/v1/vehicles", headers=_auth(token_a))
    plates = [v["plate"] for v in r.json()["items"]]
    assert "AAA-1111" in plates
    assert "BBB-2222" not in plates


@pytest.mark.asyncio
async def test_vehicle_search(client):
    token = await _register_and_login(client)
    await client.post(
        "/api/v1/vehicles", json={"plate": "AAA-1111", "model": "Scania"}, headers=_auth(token)
    )
    await client.post(
        "/api/v1/vehicles", json={"plate": "BBB-2222", "model": "Volvo"}, headers=_auth(token)
    )
    r = await client.get("/api/v1/vehicles?q=AAA", headers=_auth(token))
    res = r.json()
    assert res["total"] == 1
    assert len(res["items"]) == 1
