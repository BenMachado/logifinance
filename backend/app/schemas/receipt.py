"""Receipt schemas."""
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.cost_entry import CostCategory
from app.models.receipt import ReceiptStatus


class ReceiptCreate(BaseModel):
    """Used by the manual 'send image' endpoint (multipart already)."""

    sender_name: str = Field(..., min_length=1, max_length=120)
    sender_phone: Optional[str] = Field(None, max_length=30)
    vehicle_id: Optional[int] = None
    driver_id: Optional[int] = None
    suggested_category: Optional[CostCategory] = None


class ReceiptSimulateWhatsApp(BaseModel):
    """Payload for the simulated WhatsApp webhook — no real image, just text."""

    sender_name: str = Field(..., min_length=1, max_length=120)
    sender_phone: str = Field(..., min_length=8, max_length=30)
    vehicle_plate: Optional[str] = Field(None, max_length=20)
    text: str = Field(..., description="OCR-style text or message body")
    amount: Optional[Decimal] = Field(None, ge=0, max_digits=14, decimal_places=2)
    suggested_category: CostCategory = CostCategory.OTHER


class ReceiptConfirm(BaseModel):
    """Payload to confirm a pending receipt → creates a CostEntry."""

    vehicle_id: int
    category: CostCategory
    amount: Decimal = Field(..., ge=0, max_digits=14, decimal_places=2)
    description: Optional[str] = Field(None, max_length=255)
    incurred_on: Optional[date] = None
    trip_id: Optional[int] = None


class ReceiptRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    vehicle_id: Optional[int] = None
    driver_id: Optional[int] = None
    sender_name: str
    sender_phone: Optional[str] = None
    image_path: str
    original_filename: str
    ocr_text: Optional[str] = None
    extracted_amount: Optional[Decimal] = None
    extracted_plate: Optional[str] = None
    suggested_category: str
    status: ReceiptStatus
    received_at: datetime
    reviewed_at: Optional[datetime] = None
