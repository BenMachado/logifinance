"""OCR service abstraction.

Implementation defaults to Tesseract via pytesseract. Swap by implementing
OCRServiceProtocol and registering in the factory below.
"""
from __future__ import annotations

import re
from abc import ABC, abstractmethod
from decimal import Decimal
from pathlib import Path
from typing import Optional, Tuple

from app.core.config import settings

# Common Brazilian currency formats
_AMOUNT_RE = re.compile(
    r"(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2}|\d+[.,]\d{2})",
    re.IGNORECASE,
)
# Brazilian Mercosul/old plate: ABC-1D23 or ABC-1234
_PLATE_RE = re.compile(r"\b([A-Z]{3})-?(\d[A-Z]\d{2}|\d{4})\b", re.IGNORECASE)


class OCRServiceProtocol(ABC):
    """Abstract interface so we can swap Tesseract for Google Vision / Textract later."""

    @abstractmethod
    def extract(self, image_path: str | Path) -> str:
        """Return raw OCR text for the given image."""


class TesseractOCRService(OCRServiceProtocol):
    """Tesseract-backed OCR (por+eng)."""

    def __init__(self, lang: str | None = None) -> None:
        self.lang = lang or settings.TESSERACT_LANG

    def extract(self, image_path: str | Path) -> str:
        try:
            import pytesseract  # type: ignore
            from PIL import Image  # type: ignore
        except ImportError as exc:  # pragma: no cover - env-only
            raise RuntimeError(
                "pytesseract/Pillow not installed. Run `pip install -r requirements.txt` "
                "and install the `tesseract-ocr` system package."
            ) from exc

        image = Image.open(image_path)
        return pytesseract.image_to_string(image, lang=self.lang)


def parse_brazilian_amount(raw: str) -> Optional[Decimal]:
    """Parse '1.234,56' or '1234.56' or 'R$ 1.234,56' into Decimal."""
    if not raw:
        return None
    cleaned = raw.replace("R$", "").replace("r$", "").strip()
    if "," in cleaned and cleaned.rfind(",") > cleaned.rfind("."):
        cleaned = cleaned.replace(".", "").replace(",", ".")
    else:
        cleaned = cleaned.replace(",", "")
    try:
        return Decimal(cleaned)
    except Exception:
        return None


def detect_amount(text: str) -> Optional[Decimal]:
    """Look for the most 'total-like' amount in OCR text.

    Heuristic: pick the largest currency-like number in the text (totals tend to be the biggest).
    """
    if not text:
        return None
    candidates: list[Decimal] = []
    for m in _AMOUNT_RE.finditer(text):
        amt = parse_brazilian_amount(m.group(1))
        if amt is not None and amt > 0:
            candidates.append(amt)
    if not candidates:
        return None
    return max(candidates)


def detect_plate(text: str) -> Optional[str]:
    if not text:
        return None
    m = _PLATE_RE.search(text.upper())
    if not m:
        return None
    return f"{m.group(1)}-{m.group(2).upper()}"


def detect_category(text: str) -> str:
    """Best-effort category suggestion from OCR text."""
    t = text.lower()
    if any(k in t for k in ["posto", "combustivel", "combustível", "diesel", "gasolina", "litro", "l."]):
        return "fuel"
    if any(k in t for k in ["pedagio", "pedágio", "praca", "praça", "tag", "concessionaria", "concessionária"]):
        return "toll"
    if any(k in t for k in ["oficina", "mecan", "pneu", "oleo", "óleo", "manutencao", "manutenção"]):
        return "maintenance"
    if any(k in t for k in ["refeicao", "refeição", "almoco", "almoço", "janta", "hotel"]):
        return "food"
    return "other"


def extract_structured(image_path: str | Path, raw_text: str | None = None) -> dict:
    """Return {'text', 'amount', 'plate', 'category'} from an image.

    The factory is responsible for actually running OCR; this function only parses.
    """
    service = get_ocr_service()
    text = raw_text if raw_text is not None else service.extract(image_path)
    return {
        "text": text,
        "amount": detect_amount(text),
        "plate": detect_plate(text),
        "category": detect_category(text),
    }


# ----- factory -----
_default_service: OCRServiceProtocol | None = None


def get_ocr_service() -> OCRServiceProtocol:
    global _default_service
    if _default_service is None:
        _default_service = TesseractOCRService()
    return _default_service


def set_ocr_service(service: OCRServiceProtocol) -> None:
    """Inject a different OCR backend (mainly for tests)."""
    global _default_service
    _default_service = service
