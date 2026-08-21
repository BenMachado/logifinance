"""Trip endpoints — CRUD + 'conclude' triggers margin check + alert generation."""
import csv
import io
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_company_id, db_session
from app.models.company import Company
from app.models.cost_alert import CostAlert
from app.models.cost_entry import CostEntry, CostSource
from app.models.driver import Driver
from app.models.maintenance import MaintenanceRecord
from app.models.trip import Trip, TripStatus
from app.models.vehicle import Vehicle
from app.schemas.pagination import PaginatedResponse
from app.schemas.trip import TripCreate, TripRead, TripUpdate
from app.services.margin_service import (
    maybe_create_alert_for_trip,
    resolve_expected_margin,
)

router = APIRouter(prefix="/trips", tags=["trips"])


async def _validate_vehicle_and_driver(
    db: AsyncSession, company_id: int, vehicle_id: int, driver_id: int | None
) -> Vehicle:
    vehicle = await db.get(Vehicle, vehicle_id)
    if not vehicle or vehicle.company_id != company_id:
        raise HTTPException(status_code=400, detail="Veículo inválido")
    if driver_id is not None:
        driver = await db.get(Driver, driver_id)
        if not driver or driver.company_id != company_id:
            raise HTTPException(status_code=400, detail="Motorista inválido")
    return vehicle


@router.get("", response_model=PaginatedResponse[TripRead])
async def list_trips(
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
    q: str | None = Query(None, description="Search by origin/destination/notes"),
    status_filter: TripStatus | None = Query(None, alias="status"),
    vehicle_id: int | None = Query(None, description="Filter by vehicle_id"),
    date_from: date | None = Query(None, description="scheduled_date >= date_from"),
    date_to: date | None = Query(None, description="scheduled_date <= date_to"),
    page: int = Query(1, ge=1, description="Número da página"),
    page_size: int = Query(20, ge=1, le=100, description="Itens por página"),
) -> PaginatedResponse[TripRead]:
    count_stmt = select(func.count(Trip.id)).where(Trip.company_id == company_id)
    stmt = select(Trip).where(Trip.company_id == company_id)
    if q:
        like = f"%{q}%"
        condition = or_(Trip.origin.ilike(like), Trip.destination.ilike(like), Trip.notes.ilike(like))
        count_stmt = count_stmt.where(condition)
        stmt = stmt.where(condition)
    if status_filter:
        count_stmt = count_stmt.where(Trip.status == status_filter)
        stmt = stmt.where(Trip.status == status_filter)
    if vehicle_id is not None:
        count_stmt = count_stmt.where(Trip.vehicle_id == vehicle_id)
        stmt = stmt.where(Trip.vehicle_id == vehicle_id)
    if date_from is not None:
        count_stmt = count_stmt.where(Trip.scheduled_date >= date_from)
        stmt = stmt.where(Trip.scheduled_date >= date_from)
    if date_to is not None:
        count_stmt = count_stmt.where(Trip.scheduled_date <= date_to)
        stmt = stmt.where(Trip.scheduled_date <= date_to)

    total = (await db.execute(count_stmt)).scalar() or 0
    offset = (page - 1) * page_size
    stmt = stmt.order_by(Trip.scheduled_date.desc()).offset(offset).limit(page_size)
    result = await db.execute(stmt)
    items = list(result.scalars().all())
    return PaginatedResponse.create(items=items, total=total, page=page, page_size=page_size)


@router.post("", response_model=TripRead, status_code=status.HTTP_201_CREATED)
async def create_trip(
    payload: TripCreate,
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> Trip:
    await _validate_vehicle_and_driver(db, company_id, payload.vehicle_id, payload.driver_id)
    trip = Trip(company_id=company_id, **payload.model_dump())
    db.add(trip)
    await db.commit()
    await db.refresh(trip)
    return trip


@router.get("/{trip_id}", response_model=TripRead)
async def get_trip(
    trip_id: int,
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> Trip:
    trip = await db.get(Trip, trip_id)
    if not trip or trip.company_id != company_id:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.patch("/{trip_id}", response_model=TripRead)
async def update_trip(
    trip_id: int,
    payload: TripUpdate,
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> Trip:
    trip = await db.get(Trip, trip_id)
    if not trip or trip.company_id != company_id:
        raise HTTPException(status_code=404, detail="Trip not found")
    data = payload.model_dump(exclude_unset=True)
    if "vehicle_id" in data or "driver_id" in data:
        await _validate_vehicle_and_driver(
            db, company_id, data.get("vehicle_id", trip.vehicle_id), data.get("driver_id", trip.driver_id)
        )
    for k, v in data.items():
        setattr(trip, k, v)
    await db.commit()
    await db.refresh(trip)
    return trip


@router.post("/{trip_id}/complete", response_model=TripRead)
async def complete_trip(
    trip_id: int,
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> Trip:
    """Mark a trip as completed and run the margin check (may create a CostAlert)."""
    trip = await db.get(Trip, trip_id)
    if not trip or trip.company_id != company_id:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.status == TripStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Trip already completed")

    vehicle = await db.get(Vehicle, trip.vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=400, detail="Vehicle missing")

    company = await db.get(Company, company_id)
    expected = resolve_expected_margin(company.expected_margin if company else None)

    trip.status = TripStatus.COMPLETED
    trip.completed_at = datetime.now(timezone.utc)
    await db.flush()

    await maybe_create_alert_for_trip(db, trip, vehicle, expected)
    await db.commit()
    await db.refresh(trip)
    return trip


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trip(
    trip_id: int,
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> None:
    trip = await db.get(Trip, trip_id)
    if not trip or trip.company_id != company_id:
        raise HTTPException(status_code=404, detail="Trip not found")
    await db.delete(trip)
    await db.commit()


@router.get("/export/csv")
async def export_trips_csv(
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
    status_filter: TripStatus | None = Query(None, alias="status"),
    vehicle_id: int | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
) -> StreamingResponse:
    """Export filtered trips as CSV download."""
    stmt = select(Trip).where(Trip.company_id == company_id)
    if status_filter:
        stmt = stmt.where(Trip.status == status_filter)
    if vehicle_id is not None:
        stmt = stmt.where(Trip.vehicle_id == vehicle_id)
    if date_from is not None:
        stmt = stmt.where(Trip.scheduled_date >= date_from)
    if date_to is not None:
        stmt = stmt.where(Trip.scheduled_date <= date_to)
    stmt = stmt.order_by(Trip.scheduled_date.desc())
    result = await db.execute(stmt)
    trips = list(result.scalars().all())

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Origem", "Destino", "Receita Bruta (R$)", "Distância (km)",
        "Data Agendada", "Status", "Veículo ID", "Motorista ID", "Notas",
    ])
    for t in trips:
        writer.writerow([
            t.id,
            t.origin,
            t.destination,
            str(t.gross_revenue),
            t.distance_km if t.distance_km is not None else "",
            t.scheduled_date.isoformat(),
            t.status.value,
            t.vehicle_id,
            t.driver_id if t.driver_id is not None else "",
            t.notes or "",
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=viagens_{date.today().isoformat()}.csv"},
    )
