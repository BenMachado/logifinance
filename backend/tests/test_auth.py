"""Auth endpoint tests."""
import pytest


@pytest.mark.asyncio
async def test_register_and_login(client):
    # Register a new company + admin user
    payload = {
        "company_name": "TransLogi LTDA",
        "cnpj": "12.345.678/0001-90",
        "full_name": "Admin User",
        "email": "admin@translogi.com",
        "password": "strongpass123",
    }
    r = await client.post("/api/v1/auth/register", json=payload)
    assert r.status_code == 201, r.text
    data = r.json()
    assert data["company_name"] == "TransLogi LTDA"
    assert data["user"]["email"] == "admin@translogi.com"
    assert data["user"]["is_admin"] is True

    # Login
    r = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@translogi.com", "password": "strongpass123"},
    )
    assert r.status_code == 200, r.text
    tokens = r.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens

    # Wrong password
    r = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@translogi.com", "password": "wrong"},
    )
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_register_duplicate_email(client):
    payload = {
        "company_name": "C1",
        "full_name": "U1",
        "email": "dup@test.com",
        "password": "pass12345",
    }
    r1 = await client.post("/api/v1/auth/register", json=payload)
    assert r1.status_code == 201
    r2 = await client.post("/api/v1/auth/register", json=payload)
    assert r2.status_code == 409


@pytest.mark.asyncio
async def test_me_requires_token(client):
    r = await client.get("/api/v1/auth/me")
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_me_returns_user(client):
    await client.post(
        "/api/v1/auth/register",
        json={
            "company_name": "C2",
            "full_name": "User 2",
            "email": "u2@test.com",
            "password": "pass12345",
        },
    )
    login = await client.post(
        "/api/v1/auth/login", json={"email": "u2@test.com", "password": "pass12345"}
    )
    token = login.json()["access_token"]
    r = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["email"] == "u2@test.com"
