"""Maintenance endpoints — CRUD + automatic CostEntry generation."""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_company_id, db_session
from app.models.cost_entry import CostCategory, CostEntry, CostSource
from app.models.maintenance import MaintenanceRecord, MaintenanceType
from app.models.vehicle import Vehicle
from app.schemas.maintenance import MaintenanceCreate, MaintenanceRead, MaintenanceUpdate
from app.schemas.pagination import PaginatedResponse

router = APIRouter(prefix="/maintenance", tags=["maintenance"])


async def _ensure_vehicle(db: AsyncSession, vehicle_id: int, company_id: int) -> Vehicle:
    vehicle = await db.get(Vehicle, vehicle_id)
    if not vehicle or vehicle.company_id != company_id:
        raise HTTPException(status_code=400, detail="Veículo inválido")
    return vehicle


@router.get("", response_model=PaginatedResponse[MaintenanceRead])
async def list_maintenance(
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
    vehicle_id: int | None = None,
    type_filter: MaintenanceType | None = Query(None, alias="type"),
    page: int = Query(1, ge=1, description="Número da página"),
    page_size: int = Query(20, ge=1, le=100, description="Itens por página"),
) -> PaginatedResponse[MaintenanceRead]:
    count_stmt = select(func.count(MaintenanceRecord.id)).where(MaintenanceRecord.company_id == company_id)
    stmt = select(MaintenanceRecord).where(MaintenanceRecord.company_id == company_id)
    if vehicle_id:
        count_stmt = count_stmt.where(MaintenanceRecord.vehicle_id == vehicle_id)
        stmt = stmt.where(MaintenanceRecord.vehicle_id == vehicle_id)
    if type_filter:
        count_stmt = count_stmt.where(MaintenanceRecord.type == type_filter)
        stmt = stmt.where(MaintenanceRecord.type == type_filter)

    total = (await db.execute(count_stmt)).scalar() or 0
    offset = (page - 1) * page_size
    stmt = stmt.order_by(MaintenanceRecord.performed_on.desc()).offset(offset).limit(page_size)
    result = await db.execute(stmt)
    items = list(result.scalars().all())
    return PaginatedResponse.create(items=items, total=total, page=page, page_size=page_size)


@router.post("", response_model=MaintenanceRead, status_code=status.HTTP_201_CREATED)
async def create_maintenance(
    payload: MaintenanceCreate,
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> MaintenanceRecord:
    await _ensure_vehicle(db, payload.vehicle_id, company_id)
    rec = MaintenanceRecord(company_id=company_id, **payload.model_dump())
    db.add(rec)
    await db.flush()

    if payload.cost and payload.cost > 0:
        cost = CostEntry(
            company_id=company_id,
            vehicle_id=payload.vehicle_id,
            category=CostCategory.MAINTENANCE,
            source=CostSource.SYSTEM,
            amount=payload.cost,
            description=f"Manutenção: {payload.description}",
            incurred_on=payload.performed_on,
        )
        db.add(cost)
        await db.flush()
        rec.cost_entry_id = cost.id

    await db.commit()
    await db.refresh(rec)
    return rec


@router.get("/{rec_id}", response_model=MaintenanceRead)
async def get_maintenance(
    rec_id: int,
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> MaintenanceRecord:
    rec = await db.get(MaintenanceRecord, rec_id)
    if not rec or rec.company_id != company_id:
        raise HTTPException(status_code=404, detail="Not found")
    return rec


@router.patch("/{rec_id}", response_model=MaintenanceRead)
async def update_maintenance(
    rec_id: int,
    payload: MaintenanceUpdate,
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> MaintenanceRecord:
    rec = await db.get(MaintenanceRecord, rec_id)
    if not rec or rec.company_id != company_id:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(rec, k, v)
    await db.commit()
    await db.refresh(rec)
    return rec


@router.delete("/{rec_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_maintenance(
    rec_id: int,
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> None:
    rec = await db.get(MaintenanceRecord, rec_id)
    if not rec or rec.company_id != company_id:
        raise HTTPException(status_code=404, detail="Not found")
    await db.delete(rec)
    await db.commit()
