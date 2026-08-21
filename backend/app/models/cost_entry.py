"""CostEntry model — operational cost linked to a vehicle/trip."""
import enum
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class CostCategory(str, enum.Enum):
    FUEL = "fuel"  # Diesel
    TOLL = "toll"  # Pedágio
    MAINTENANCE = "maintenance"
    FOOD = "food"  # Diárias
    INSURANCE = "insurance"
    TAX = "tax"
    OTHER = "other"


class CostSource(str, enum.Enum):
    WHATSAPP_OCR = "whatsapp_ocr"
    MANUAL = "manual"
    UPLOAD = "upload"
    SYSTEM = "system"  # e.g. from a completed trip or maintenance record


class CostEntry(Base):
    __tablename__ = "cost_entries"

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"), index=True, nullable=False
    )
    vehicle_id: Mapped[int] = mapped_column(
        ForeignKey("vehicles.id", ondelete="CASCADE"), index=True, nullable=False
    )
    trip_id: Mapped[int | None] = mapped_column(
        ForeignKey("trips.id", ondelete="SET NULL"), nullable=True, index=True
    )
    receipt_id: Mapped[int | None] = mapped_column(
        ForeignKey("receipts.id", ondelete="SET NULL"), nullable=True
    )
    category: Mapped[CostCategory] = mapped_column(
        Enum(CostCategory), default=CostCategory.OTHER, nullable=False, index=True
    )
    source: Mapped[CostSource] = mapped_column(
        Enum(CostSource), default=CostSource.MANUAL, nullable=False
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    incurred_on: Mapped[date] = mapped_column(Date, nullable=False, index=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    company = relationship("Company", back_populates="cost_entries")
    vehicle = relationship("Vehicle", back_populates="cost_entries")
    trip = relationship("Trip", back_populates="cost_entries")
    receipt = relationship("Receipt", back_populates="cost_entries")
    maintenance_record = relationship("MaintenanceRecord", back_populates="cost_entry")
