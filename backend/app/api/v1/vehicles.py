"""Vehicle endpoints — CRUD with search + pagination."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_company_id, db_session
from app.models.driver import Driver
from app.models.vehicle import Vehicle, VehicleStatus
from app.schemas.pagination import PaginatedResponse
from app.schemas.vehicle import VehicleCreate, VehicleRead, VehicleUpdate

router = APIRouter(prefix="/vehicles", tags=["vehicles"])


async def _validate_driver_belongs_to_company(db: AsyncSession, driver_id: int | None, company_id: int) -> None:
    if driver_id is None:
        return
    driver = await db.get(Driver, driver_id)
    if not driver or driver.company_id != company_id:
        raise HTTPException(status_code=400, detail="Motorista não pertence a esta empresa")


@router.get("/count/total")
async def count_vehicles(
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> dict:
    result = await db.execute(
        select(func.count(Vehicle.id)).where(
            Vehicle.company_id == company_id,
            Vehicle.status == VehicleStatus.ACTIVE,
        )
    )
    return {"total": result.scalar() or 0}


@router.get("", response_model=PaginatedResponse[VehicleRead])
async def list_vehicles(
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
    q: str | None = Query(None, description="Search by plate or model"),
    status_filter: VehicleStatus | None = Query(None, alias="status"),
    page: int = Query(1, ge=1, description="Número da página"),
    page_size: int = Query(20, ge=1, le=100, description="Itens por página"),
) -> PaginatedResponse[VehicleRead]:
    count_stmt = select(func.count(Vehicle.id)).where(Vehicle.company_id == company_id)
    stmt = select(Vehicle).where(Vehicle.company_id == company_id)
    if q:
        like = f"%{q}%"
        condition = or_(Vehicle.plate.ilike(like), Vehicle.model.ilike(like))
        count_stmt = count_stmt.where(condition)
        stmt = stmt.where(condition)
    if status_filter:
        count_stmt = count_stmt.where(Vehicle.status == status_filter)
        stmt = stmt.where(Vehicle.status == status_filter)

    total = (await db.execute(count_stmt)).scalar() or 0
    offset = (page - 1) * page_size
    stmt = stmt.order_by(Vehicle.plate).offset(offset).limit(page_size)
    result = await db.execute(stmt)
    items = list(result.scalars().all())
    return PaginatedResponse.create(items=items, total=total, page=page, page_size=page_size)


@router.post("", response_model=VehicleRead, status_code=status.HTTP_201_CREATED)
async def create_vehicle(
    payload: VehicleCreate,
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> Vehicle:
    await _validate_driver_belongs_to_company(db, payload.driver_id, company_id)

    existing = await db.execute(
        select(Vehicle).where(
            Vehicle.company_id == company_id, Vehicle.plate == payload.plate
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Placa já cadastrada")

    vehicle = Vehicle(company_id=company_id, **payload.model_dump())
    db.add(vehicle)
    await db.commit()
    await db.refresh(vehicle)
    return vehicle


@router.get("/{vehicle_id}", response_model=VehicleRead)
async def get_vehicle(
    vehicle_id: int,
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> Vehicle:
    vehicle = await db.get(Vehicle, vehicle_id)
    if not vehicle or vehicle.company_id != company_id:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


@router.patch("/{vehicle_id}", response_model=VehicleRead)
async def update_vehicle(
    vehicle_id: int,
    payload: VehicleUpdate,
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> Vehicle:
    vehicle = await db.get(Vehicle, vehicle_id)
    if not vehicle or vehicle.company_id != company_id:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    data = payload.model_dump(exclude_unset=True)
    if "driver_id" in data:
        await _validate_driver_belongs_to_company(db, data["driver_id"], company_id)
    if "plate" in data and data["plate"] != vehicle.plate:
        dup = await db.execute(
            select(Vehicle).where(
                Vehicle.company_id == company_id, Vehicle.plate == data["plate"]
            )
        )
        if dup.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="Placa já cadastrada")
    for k, v in data.items():
        setattr(vehicle, k, v)
    await db.commit()
    await db.refresh(vehicle)
    return vehicle


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vehicle(
    vehicle_id: int,
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> None:
    vehicle = await db.get(Vehicle, vehicle_id)
    if not vehicle or vehicle.company_id != company_id:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    await db.delete(vehicle)
    await db.commit()
