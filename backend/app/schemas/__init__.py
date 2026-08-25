"""Pydantic schemas package.

Exports every schema for convenient imports: `from app.schemas import ...`.
"""
from app.schemas.alert import CostAlertRead
from app.schemas.auth import (
    CompanyRegisterRead,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    Token,
    UserRead,
)
from app.schemas.cost import CostEntryCreate, CostEntryRead
from app.schemas.dashboard import (
    DashboardKPIs,
    VehiclePerformance,
    VehiclePerformanceRow,
    WhatsAppReceiptEntry,
)
from app.schemas.driver import DriverCreate, DriverRead, DriverUpdate
from app.schemas.maintenance import (
    MaintenanceCreate,
    MaintenanceRead,
    MaintenanceUpdate,
)
from app.schemas.payment import (
    CheckoutRequest,
    CheckoutResponse,
    PlanPricing,
    SubscriptionRead,
    WebhookAck,
)
from app.schemas.receipt import (
    ReceiptConfirm,
    ReceiptCreate,
    ReceiptRead,
    ReceiptSimulateWhatsApp,
)
from app.schemas.trip import TripCreate, TripRead, TripUpdate
from app.schemas.vehicle import VehicleCreate, VehicleRead, VehicleUpdate

__all__ = [
    "RegisterRequest",
    "LoginRequest",
    "RefreshRequest",
    "Token",
    "UserRead",
    "CompanyRegisterRead",
    "DriverCreate",
    "DriverRead",
    "DriverUpdate",
    "VehicleCreate",
    "VehicleRead",
    "VehicleUpdate",
    "TripCreate",
    "TripRead",
    "TripUpdate",
    "CostEntryCreate",
    "CostEntryRead",
    "ReceiptCreate",
    "ReceiptRead",
    "ReceiptConfirm",
    "ReceiptSimulateWhatsApp",
    "MaintenanceCreate",
    "MaintenanceRead",
    "MaintenanceUpdate",
    "CostAlertRead",
    "DashboardKPIs",
    "VehiclePerformanceRow",
    "VehiclePerformance",
    "WhatsAppReceiptEntry",
    "CheckoutRequest",
    "CheckoutResponse",
    "PlanPricing",
    "SubscriptionRead",
    "WebhookAck",
]
