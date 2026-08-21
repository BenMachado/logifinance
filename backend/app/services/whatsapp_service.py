"""Simulated WhatsApp webhook receiver.

In the MVP this is just a callable that accepts (image, sender_name, sender_phone, ...)
and persists a Receipt. When real WhatsApp Business API integration is wired up,
the webhook handler will feed into the same function.
"""
from datetime import datetime
from decimal import Decimal
from pathlib import Path
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.cost_entry import CostCategory
from app.models.driver import Driver
from app.models.receipt import Receipt, ReceiptStatus
from app.models.vehicle import Vehicle
from app.schemas.receipt import ReceiptSimulateWhatsApp
from app.services.ocr_service import detect_amount, detect_category, detect_plate
from app.utils.file_upload import save_upload


async def _resolve_vehicle_by_plate(
    db: AsyncSession, company_id: int, plate: str | None
) -> Optional[Vehicle]:
    if not plate:
        return None
    result = await db.execute(
        select(Vehicle).where(
            Vehicle.company_id == company_id,
            Vehicle.plate == plate.upper(),
        )
    )
    return result.scalar_one_or_none()


async def _resolve_driver_by_phone(
    db: AsyncSession, company_id: int, phone: str | None
) -> Optional[Driver]:
    if not phone:
        return None
    digits = "".join(c for c in phone if c.isdigit())
    if not digits:
        return None
    result = await db.execute(
        select(Driver).where(Driver.company_id == company_id)
    )
    for driver in result.scalars().all():
        if "".join(c for c in driver.phone if c.isdigit()) == digits:
            return driver
    return None


async def receive_receipt_from_whatsapp(
    db: AsyncSession,
    company_id: int,
    sender_name: str,
    sender_phone: str | None,
    image_path: str,
    original_filename: str,
    plate_hint: str | None = None,
    raw_text: str | None = None,
) -> Receipt:
    """Run OCR on the saved image, persist a Receipt row in PENDING state.

    The caller (webhook or manual upload) is responsible for saving the file first.
    """
    from app.services.ocr_service import get_ocr_service

    text = raw_text
    if text is None:
        try:
            text = get_ocr_service().extract(image_path)
        except Exception as exc:  # OCR may fail on bad images
            text = f"[OCR error: {exc}]"

    amount = detect_amount(text or "")
    plate = detect_plate(text or "") or (plate_hint.upper() if plate_hint else None)
    category = detect_category(text or "")

    vehicle = await _resolve_vehicle_by_plate(db, company_id, plate)
    driver = await _resolve_driver_by_phone(db, company_id, sender_phone)

    receipt = Receipt(
        company_id=company_id,
        vehicle_id=vehicle.id if vehicle else None,
        driver_id=driver.id if driver else None,
        sender_name=sender_name,
        sender_phone=sender_phone,
        image_path=str(image_path),
        original_filename=original_filename,
        ocr_text=text,
        extracted_amount=amount,
        extracted_plate=plate,
        suggested_category=category,
        status=ReceiptStatus.PENDING,
    )
    db.add(receipt)
    await db.flush()
    await db.refresh(receipt)
    return receipt


async def receive_simulated_message(
    db: AsyncSession,
    company_id: int,
    payload: ReceiptSimulateWhatsApp,
) -> Receipt:
    """Variant for the dev 'simulate WhatsApp' button: no real image, just text.

    We still create a Receipt with an empty image_path and the supplied text as OCR
    output — the review flow is identical.
    """
    amount = payload.amount or detect_amount(payload.text or "")
    plate = detect_plate(payload.text or "") or (payload.vehicle_plate.upper() if payload.vehicle_plate else None)
    category = (
        payload.suggested_category.value
        if payload.suggested_category
        else detect_category(payload.text or "")
    )
    vehicle = await _resolve_vehicle_by_plate(db, company_id, plate)
    driver = await _resolve_driver_by_phone(db, company_id, payload.sender_phone)

    receipt = Receipt(
        company_id=company_id,
        vehicle_id=vehicle.id if vehicle else None,
        driver_id=driver.id if driver else None,
        sender_name=payload.sender_name,
        sender_phone=payload.sender_phone,
        image_path="",  # no image in simulation
        original_filename="(simulado)",
        ocr_text=payload.text,
        extracted_amount=amount,
        extracted_plate=plate,
        suggested_category=category,
        status=ReceiptStatus.PENDING,
    )
    db.add(receipt)
    await db.flush()
    await db.refresh(receipt)
    return receipt
