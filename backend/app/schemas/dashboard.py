"""Dashboard aggregate response schemas."""
from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel


class DashboardKPIs(BaseModel):
    """Top-line KPIs shown in the dashboard header cards."""

    gross_revenue: Decimal
    total_cost: Decimal
    net_profit: Decimal
    avg_margin: float  # 0.0 .. 1.0
    fleet_size: int
    active_trips: int
    period_label: str  # e.g. "Agosto, 2026"


class VehiclePerformanceRow(BaseModel):
    """One row in the 'Desempenho por Veículo & Rota' table."""

    vehicle_id: int
    plate: str
    model: str
    route: str  # "SP - RJ" or sum of last routes
    gross_revenue: Decimal
    total_cost: Decimal
    net_profit: Decimal
    margin_pct: float  # 0.0 .. 1.0
    status: str  # "profit" | "alert" | "neutral"


class VehiclePerformance(BaseModel):
    rows: List[VehiclePerformanceRow]


class WhatsAppReceiptEntry(BaseModel):
    """One entry in the WhatsApp Bot history panel."""

    id: int
    sender_name: str
    received_at: datetime
    original_filename: str
    image_path: str
    extracted_amount: Optional[Decimal] = None
    extracted_plate: Optional[str] = None
    vehicle_id: Optional[int] = None
    status: str  # "pending" | "confirmed" | "rejected"
