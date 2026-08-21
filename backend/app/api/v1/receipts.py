"""Receipt endpoints — WhatsApp webhook (simulated), review queue, confirm/reject."""
from datetime import datetime, timezone
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_company_id, db_session
from app.models.cost_entry import CostCategory, CostEntry, CostSource
from app.models.receipt import Receipt, ReceiptStatus
from app.models.vehicle import Vehicle
from app.schemas.pagination import PaginatedResponse
from app.schemas.receipt import (
    ReceiptConfirm,
    ReceiptRead,
    ReceiptSimulateWhatsApp,
)
from app.services.whatsapp_service import (
    receive_receipt_from_whatsapp,
    receive_simulated_message,
)
from app.utils.file_upload import save_upload

router = APIRouter(prefix="/receipts", tags=["receipts"])


@router.get("", response_model=PaginatedResponse[ReceiptRead])
async def list_receipts(
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
    status_filter: ReceiptStatus | None = Query(None, alias="status"),
    vehicle_id: int | None = Query(None, description="Filter by vehicle_id"),
    page: int = Query(1, ge=1, description="Número da página"),
    page_size: int = Query(20, ge=1, le=100, description="Itens por página"),
) -> PaginatedResponse[ReceiptRead]:
    count_stmt = select(func.count(Receipt.id)).where(Receipt.company_id == company_id)
    stmt = select(Receipt).where(Receipt.company_id == company_id)
    if status_filter:
        count_stmt = count_stmt.where(Receipt.status == status_filter)
        stmt = stmt.where(Receipt.status == status_filter)
    if vehicle_id is not None:
        count_stmt = count_stmt.where(Receipt.vehicle_id == vehicle_id)
        stmt = stmt.where(Receipt.vehicle_id == vehicle_id)

    total = (await db.execute(count_stmt)).scalar() or 0
    offset = (page - 1) * page_size
    stmt = stmt.order_by(Receipt.received_at.desc()).offset(offset).limit(page_size)
    result = await db.execute(stmt)
    items = list(result.scalars().all())
    return PaginatedResponse.create(items=items, total=total, page=page, page_size=page_size)


@router.post("/whatsapp/simulate", response_model=ReceiptRead, status_code=status.HTTP_201_CREATED)
async def simulate_whatsapp(
    payload: ReceiptSimulateWhatsApp,
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> Receipt:
    """Dev-only endpoint that fakes a driver sending a message with a receipt."""
    return await receive_simulated_message(db, company_id, payload)


@router.post("/whatsapp/webhook", status_code=status.HTTP_201_CREATED)
async def whatsapp_webhook(
    sender_name: str = Form(...),
    sender_phone: Optional[str] = Form(None),
    plate_hint: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> ReceiptRead:
    """Real-shape endpoint that would be wired to WhatsApp Cloud API.

    Accepts a multipart upload (the image), runs OCR, and creates a PENDING Receipt.
    """
    saved_path, _public_url = await save_upload(file, company_id, subdir="receipts")
    receipt = await receive_receipt_from_whatsapp(
        db=db,
        company_id=company_id,
        sender_name=sender_name,
        sender_phone=sender_phone,
        image_path=str(saved_path),
        original_filename=file.filename or "upload",
        plate_hint=plate_hint,
    )
    return ReceiptRead.model_validate(receipt)


@router.post("/{receipt_id}/confirm", response_model=ReceiptRead)
async def confirm_receipt(
    receipt_id: int,
    payload: ReceiptConfirm,
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> Receipt:
    """Approve a pending receipt: create a CostEntry, mark Receipt as confirmed."""
    receipt = await db.get(Receipt, receipt_id)
    if not receipt or receipt.company_id != company_id:
        raise HTTPException(status_code=404, detail="Receipt not found")
    if receipt.status != ReceiptStatus.PENDING:
        raise HTTPException(status_code=400, detail="Receipt already reviewed")

    vehicle = await db.get(Vehicle, payload.vehicle_id)
    if not vehicle or vehicle.company_id != company_id:
        raise HTTPException(status_code=400, detail="Veículo inválido")

    cost = CostEntry(
        company_id=company_id,
        vehicle_id=payload.vehicle_id,
        trip_id=payload.trip_id,
        receipt_id=receipt.id,
        category=payload.category,
        source=CostSource.WHATSAPP_OCR,
        amount=payload.amount,
        description=payload.description or f"Recibo de {receipt.sender_name}",
        incurred_on=payload.incurred_on or datetime.now(timezone.utc).date(),
    )
    db.add(cost)
    receipt.status = ReceiptStatus.CONFIRMED
    receipt.vehicle_id = payload.vehicle_id
    receipt.reviewed_at = datetime.now(timezone.utc)
    await db.flush()
    # The reverse relationship cost.receipt_id already points to this receipt.
    await db.commit()
    await db.refresh(receipt)
    return receipt


@router.post("/{receipt_id}/reject", response_model=ReceiptRead)
async def reject_receipt(
    receipt_id: int,
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> Receipt:
    receipt = await db.get(Receipt, receipt_id)
    if not receipt or receipt.company_id != company_id:
        raise HTTPException(status_code=404, detail="Receipt not found")
    if receipt.status != ReceiptStatus.PENDING:
        raise HTTPException(status_code=400, detail="Receipt already reviewed")
    receipt.status = ReceiptStatus.REJECTED
    receipt.reviewed_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(receipt)
    return receipt
