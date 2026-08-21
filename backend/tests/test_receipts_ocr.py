"""OCR utility + receipt flow tests using the simulated WhatsApp endpoint."""
import pytest
from decimal import Decimal

from app.services.ocr_service import (
    detect_amount,
    detect_category,
    detect_plate,
    parse_brazilian_amount,
)


def test_parse_brazilian_amount():
    assert parse_brazilian_amount("1.234,56") == Decimal("1234.56")
    assert parse_brazilian_amount("R$ 850,00") == Decimal("850")
    assert parse_brazilian_amount("1234.56") == Decimal("1234.56")
    assert parse_brazilian_amount("0,99") == Decimal("0.99")
    assert parse_brazilian_amount("garbage") is None


def test_detect_amount_picks_largest():
    text = """
    POSTO IPIRANGA
    Gasolina Aditivada
    Litros: 45.20
    Unitario: 5.89
    TOTAL R$ 850,00
    """
    assert detect_amount(text) == Decimal("850")


def test_detect_plate_mercosul_and_old():
    assert detect_plate("Caminhao ABC-1D23") == "ABC-1D23"
    assert detect_plate("PLACA DEF-5678") == "DEF-5678"
    assert detect_plate("sem placa aqui") is None


def test_detect_category():
    assert detect_category("Posto Ipiranga Diesel") == "fuel"
    assert detect_category("Pedagio BR-116") == "toll"
    assert detect_category("Oficina mecanica troca oleo") == "maintenance"
    assert detect_category("Recibo qualquer") == "other"


async def _setup_company_with_vehicle(client):
    await client.post(
        "/api/v1/auth/register",
        json={
            "company_name": "OCR Co",
            "full_name": "Owner",
            "email": "o@ocr.com",
            "password": "pass12345",
        },
    )
    r = await client.post(
        "/api/v1/auth/login", json={"email": "o@ocr.com", "password": "pass12345"}
    )
    token = r.json()["access_token"]
    auth = {"Authorization": f"Bearer {token}"}
    r = await client.post(
        "/api/v1/vehicles", json={"plate": "OCR-1234", "model": "Scania"}, headers=auth
    )
    return auth, r.json()["id"]


@pytest.mark.asyncio
async def test_simulated_whatsapp_receipt_creates_pending(client):
    auth, vid = await _setup_company_with_vehicle(client)
    r = await client.post(
        "/api/v1/receipts/whatsapp/simulate",
        json={
            "sender_name": "Motorista Carlos",
            "sender_phone": "+5511999990000",
            "vehicle_plate": "OCR-1234",
            "text": "Posto Shell\nDiesel S-10\nTotal: R$ 850,00",
            "amount": 850,
            "suggested_category": "fuel",
        },
        headers=auth,
    )
    assert r.status_code == 201, r.text
    receipt = r.json()
    assert receipt["status"] == "pending"
    assert receipt["extracted_plate"] == "OCR-1234"
    assert float(receipt["extracted_amount"]) == 850.0
    assert receipt["vehicle_id"] == vid


@pytest.mark.asyncio
async def test_confirm_receipt_creates_cost_entry(client):
    auth, vid = await _setup_company_with_vehicle(client)
    r = await client.post(
        "/api/v1/receipts/whatsapp/simulate",
        json={
            "sender_name": "Motorista Joao",
            "sender_phone": "+5511999991111",
            "text": "Pedagio BR-116 R$ 145,50",
            "amount": 145.50,
            "suggested_category": "toll",
        },
        headers=auth,
    )
    receipt_id = r.json()["id"]

    r = await client.post(
        f"/api/v1/receipts/{receipt_id}/confirm",
        json={
            "vehicle_id": vid,
            "category": "toll",
            "amount": 145.50,
        },
        headers=auth,
    )
    assert r.status_code == 200, r.text
    assert r.json()["status"] == "confirmed"

    r = await client.get(f"/api/v1/costs?vehicle_id={vid}", headers=auth)
    assert r.status_code == 200
    assert any(c["source"] == "whatsapp_ocr" for c in r.json()["items"])


@pytest.mark.asyncio
async def test_reject_receipt(client):
    auth, _ = await _setup_company_with_vehicle(client)
    r = await client.post(
        "/api/v1/receipts/whatsapp/simulate",
        json={
            "sender_name": "X",
            "sender_phone": "+5511999990000",
            "text": "Recibo qualquer",
        },
        headers=auth,
    )
    rid = r.json()["id"]
    r = await client.post(f"/api/v1/receipts/{rid}/reject", headers=auth)
    assert r.status_code == 200
    assert r.json()["status"] == "rejected"
