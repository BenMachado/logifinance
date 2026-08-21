"""Cost entry endpoints — manual creation, listing, filtering, CSV export."""
import csv
import io
from datetime import date, date as date_type
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_company_id, db_session
from app.models.cost_entry import CostCategory, CostEntry
from app.models.vehicle import Vehicle
from app.schemas.cost import CostEntryCreate, CostEntryRead
from app.schemas.pagination import PaginatedResponse

router = APIRouter(prefix="/costs", tags=["costs"])


@router.get("", response_model=PaginatedResponse[CostEntryRead])
async def list_costs(
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
    vehicle_id: int | None = None,
    trip_id: int | None = None,
    category: CostCategory | None = None,
    date_from: date_type | None = Query(None, description="incurred_on >= date_from"),
    date_to: date_type | None = Query(None, description="incurred_on <= date_to"),
    start: date_type | None = Query(None, description="Alias for date_from"),
    end: date_type | None = Query(None, description="Alias for date_to"),
    page: int = Query(1, ge=1, description="Número da página"),
    page_size: int = Query(20, ge=1, le=100, description="Itens por página"),
) -> PaginatedResponse[CostEntryRead]:
    eff_start = date_from or start
    eff_end = date_to or end

    count_stmt = select(func.count(CostEntry.id)).where(CostEntry.company_id == company_id)
    stmt = select(CostEntry).where(CostEntry.company_id == company_id)
    if vehicle_id is not None:
        count_stmt = count_stmt.where(CostEntry.vehicle_id == vehicle_id)
        stmt = stmt.where(CostEntry.vehicle_id == vehicle_id)
    if trip_id is not None:
        count_stmt = count_stmt.where(CostEntry.trip_id == trip_id)
        stmt = stmt.where(CostEntry.trip_id == trip_id)
    if category is not None:
        count_stmt = count_stmt.where(CostEntry.category == category)
        stmt = stmt.where(CostEntry.category == category)
    if eff_start is not None:
        count_stmt = count_stmt.where(CostEntry.incurred_on >= eff_start)
        stmt = stmt.where(CostEntry.incurred_on >= eff_start)
    if eff_end is not None:
        count_stmt = count_stmt.where(CostEntry.incurred_on <= eff_end)
        stmt = stmt.where(CostEntry.incurred_on <= eff_end)

    total = (await db.execute(count_stmt)).scalar() or 0
    offset = (page - 1) * page_size
    stmt = stmt.order_by(CostEntry.incurred_on.desc()).offset(offset).limit(page_size)
    result = await db.execute(stmt)
    items = list(result.scalars().all())
    return PaginatedResponse.create(items=items, total=total, page=page, page_size=page_size)


@router.post("", response_model=CostEntryRead, status_code=status.HTTP_201_CREATED)
async def create_cost(
    payload: CostEntryCreate,
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> CostEntry:
    vehicle = await db.get(Vehicle, payload.vehicle_id)
    if not vehicle or vehicle.company_id != company_id:
        raise HTTPException(status_code=400, detail="Veículo inválido")
    cost = CostEntry(company_id=company_id, **payload.model_dump())
    db.add(cost)
    await db.commit()
    await db.refresh(cost)
    return cost


@router.get("/breakdown")
async def cost_breakdown(
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
    start: date_type | None = None,
    end: date_type | None = None,
) -> list[dict]:
    """Group costs by category for the Fluxo de Caixa page."""
    stmt = (
        select(CostEntry.category, func.coalesce(func.sum(CostEntry.amount), 0))
        .where(CostEntry.company_id == company_id)
        .group_by(CostEntry.category)
    )
    if start:
        stmt = stmt.where(CostEntry.incurred_on >= start)
    if end:
        stmt = stmt.where(CostEntry.incurred_on <= end)
    result = await db.execute(stmt)
    return [{"category": row[0].value, "total": float(row[1])} for row in result.all()]


@router.get("/export/csv")
async def export_costs_csv(
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
    vehicle_id: int | None = None,
    category: CostCategory | None = None,
    date_from: date_type | None = None,
    date_to: date_type | None = None,
) -> StreamingResponse:
    """Export filtered costs as CSV download."""
    stmt = select(CostEntry).where(CostEntry.company_id == company_id)
    if vehicle_id is not None:
        stmt = stmt.where(CostEntry.vehicle_id == vehicle_id)
    if category is not None:
        stmt = stmt.where(CostEntry.category == category)
    if date_from is not None:
        stmt = stmt.where(CostEntry.incurred_on >= date_from)
    if date_to is not None:
        stmt = stmt.where(CostEntry.incurred_on <= date_to)
    stmt = stmt.order_by(CostEntry.incurred_on.desc())
    result = await db.execute(stmt)
    costs = list(result.scalars().all())

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Categoria", "Valor (R$)", "Descrição", "Data", "Fonte", "Veículo ID", "Viagem ID"])
    for c in costs:
        writer.writerow([
            c.id,
            c.category.value,
            str(c.amount),
            c.description,
            c.incurred_on.isoformat(),
            c.source.value,
            c.vehicle_id or "",
            c.trip_id or "",
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=custos_{date.today().isoformat()}.csv"},
    )
