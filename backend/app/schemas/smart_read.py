"""Schemas para o endpoint de Leitura Inteligente de Arquivos."""
from __future__ import annotations

from datetime import date as date_type
from decimal import Decimal
from typing import List, Literal, Optional

from pydantic import BaseModel, Field

from app.models.cost_entry import CostCategory, CostSource


FileType = Literal["spreadsheet", "pdf", "image", "unknown"]


class SmartReadItem(BaseModel):
    """Um item financeiro extraído do arquivo — pré-formatado para virar CostEntry."""

    line: int = Field(..., description="Linha de origem na planilha/tabela (1-indexed)")
    amount: Optional[Decimal] = Field(None, description="Valor monetário extraído")
    incurred_on: Optional[date_type] = Field(None, description="Data do custo (se identificada)")
    category: CostCategory = Field(CostCategory.OTHER, description="Categoria sugerida")
    description: Optional[str] = Field(None, description="Descrição / observação")
    plate: Optional[str] = Field(None, description="Placa do veículo (se identificada)")
    raw_text: Optional[str] = Field(None, description="Texto bruto da linha/célula")
    confidence: float = Field(0.5, ge=0.0, le=1.0, description="Confiança da extração (0-1)")


class SmartReadSummary(BaseModel):
    """Resumo estatístico dos itens extraídos."""

    total_items: int
    items_with_amount: int
    items_with_date: int
    total_amount: Optional[Decimal] = None
    by_category: dict[str, int] = Field(default_factory=dict)


class SmartReadResponse(BaseModel):
    file_type: FileType
    detected_format: str = Field(..., description="Ex: 'xlsx', 'csv', 'pdf', 'jpg'")
    filename: str
    message_summary: Optional[str] = Field(None, description="Resumo em PT-BR do conteúdo textual")
    items: List[SmartReadItem]
    summary: SmartReadSummary
    raw_text_preview: Optional[str] = Field(None, description="Trecho do texto extraído (OCR/PDF)")


class SmartReadBatchImportRequest(BaseModel):
    items: List["SmartReadBatchItem"]


class SmartReadBatchItem(BaseModel):
    vehicle_id: int
    trip_id: Optional[int] = None
    category: CostCategory = CostCategory.OTHER
    source: CostSource = CostSource.UPLOAD
    amount: Decimal = Field(..., ge=0)
    description: Optional[str] = Field(None, max_length=255)
    incurred_on: date_type


class SmartReadBatchImportResponse(BaseModel):
    created: int
    failed: int
    errors: List[str] = Field(default_factory=list)


SmartReadBatchImportRequest.model_rebuild()
