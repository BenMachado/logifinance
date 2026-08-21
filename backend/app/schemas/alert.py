"""CostAlert schemas."""
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.cost_alert import AlertSeverity


class CostAlertRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    vehicle_id: int
    trip_id: Optional[int] = None
    severity: AlertSeverity
    title: str
    message: str
    actual_margin: Decimal
    expected_margin: Decimal
    is_resolved: bool
    created_at: datetime
