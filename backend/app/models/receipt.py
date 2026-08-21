"""Receipt model — raw receipt received (image + OCR data) awaiting review."""
import enum
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ReceiptStatus(str, enum.Enum):
    PENDING = "pending"  # Awaiting review
    CONFIRMED = "confirmed"  # Approved → CostEntry created
    REJECTED = "rejected"  # Discarded


class Receipt(Base):
    __tablename__ = "receipts"

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"), index=True, nullable=False
    )
    vehicle_id: Mapped[int | None] = mapped_column(
        ForeignKey("vehicles.id", ondelete="SET NULL"), nullable=True, index=True
    )
    driver_id: Mapped[int | None] = mapped_column(
        ForeignKey("drivers.id", ondelete="SET NULL"), nullable=True
    )
    sender_name: Mapped[str] = mapped_column(String(120), nullable=False)
    sender_phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    image_path: Mapped[str] = mapped_column(String(500), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    ocr_text: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    extracted_amount: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    extracted_plate: Mapped[str | None] = mapped_column(String(20), nullable=True)
    suggested_category: Mapped[str] = mapped_column(String(40), default="other", nullable=False)
    status: Mapped[ReceiptStatus] = mapped_column(
        Enum(ReceiptStatus), default=ReceiptStatus.PENDING, nullable=False, index=True
    )
    received_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    company = relationship("Company", back_populates="receipts")
    vehicle = relationship("Vehicle", back_populates="receipts")
    driver = relationship("Driver")
    cost_entries = relationship("CostEntry", back_populates="receipt")
