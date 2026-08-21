"""Maintenance schemas."""
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.maintenance import MaintenanceType


class MaintenanceBase(BaseModel):
    vehicle_id: int
    type: MaintenanceType = MaintenanceType.PREVENTIVE
    description: str = Field(..., min_length=1, max_length=500)
    cost: Decimal = Field(Decimal("0"), ge=0, max_digits=14, decimal_places=2)
    performed_on: date
    next_due: Optional[date] = None


class MaintenanceCreate(MaintenanceBase):
    pass


class MaintenanceUpdate(BaseModel):
    type: Optional[MaintenanceType] = None
    description: Optional[str] = Field(None, max_length=500)
    cost: Optional[Decimal] = Field(None, ge=0, max_digits=14, decimal_places=2)
    performed_on: Optional[date] = None
    next_due: Optional[date] = None


class MaintenanceRead(MaintenanceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    cost_entry_id: Optional[int] = None
    created_at: datetime
