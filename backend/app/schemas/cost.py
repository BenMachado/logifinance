"""CostEntry schemas."""
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.cost_entry import CostCategory, CostSource


class CostEntryCreate(BaseModel):
    vehicle_id: int
    trip_id: Optional[int] = None
    category: CostCategory = CostCategory.OTHER
    source: CostSource = CostSource.MANUAL
    amount: Decimal = Field(..., ge=0, max_digits=14, decimal_places=2)
    description: Optional[str] = Field(None, max_length=255)
    incurred_on: date


class CostEntryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    vehicle_id: int
    trip_id: Optional[int] = None
    receipt_id: Optional[int] = None
    category: CostCategory
    source: CostSource
    amount: Decimal
    description: Optional[str] = None
    incurred_on: date
    created_at: datetime
