"""Trip schemas."""
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.trip import TripStatus


class TripBase(BaseModel):
    vehicle_id: int
    driver_id: Optional[int] = None
    origin: str = Field(..., min_length=1, max_length=120)
    destination: str = Field(..., min_length=1, max_length=120)
    cargo_description: Optional[str] = Field(None, max_length=255)
    gross_revenue: Decimal = Field(Decimal("0"), ge=0, max_digits=14, decimal_places=2)
    distance_km: Optional[int] = Field(None, ge=0)
    scheduled_date: date
    notes: Optional[str] = Field(None, max_length=500)


class TripCreate(TripBase):
    pass


class TripUpdate(BaseModel):
    vehicle_id: Optional[int] = None
    driver_id: Optional[int] = None
    origin: Optional[str] = Field(None, max_length=120)
    destination: Optional[str] = Field(None, max_length=120)
    cargo_description: Optional[str] = Field(None, max_length=255)
    gross_revenue: Optional[Decimal] = Field(None, ge=0, max_digits=14, decimal_places=2)
    distance_km: Optional[int] = Field(None, ge=0)
    scheduled_date: Optional[date] = None
    status: Optional[TripStatus] = None
    notes: Optional[str] = Field(None, max_length=500)


class TripRead(TripBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    status: TripStatus
    completed_at: Optional[datetime] = None
    created_at: datetime
