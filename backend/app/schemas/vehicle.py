"""Vehicle schemas."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.vehicle import VehicleStatus


class VehicleBase(BaseModel):
    plate: str = Field(..., min_length=5, max_length=20)
    model: str = Field(..., min_length=1, max_length=120)
    year: Optional[int] = Field(None, ge=1900, le=2100)
    driver_id: Optional[int] = None
    status: VehicleStatus = VehicleStatus.ACTIVE


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    plate: Optional[str] = Field(None, min_length=5, max_length=20)
    model: Optional[str] = Field(None, min_length=1, max_length=120)
    year: Optional[int] = Field(None, ge=1900, le=2100)
    driver_id: Optional[int] = None
    status: Optional[VehicleStatus] = None


class VehicleRead(VehicleBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    created_at: datetime
