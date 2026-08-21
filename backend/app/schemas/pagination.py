"""Pagination schemas for LogiFinance."""
from typing import Generic, Sequence, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: Sequence[T] = Field(default_factory=list, description="Lista de itens da página atual")
    total: int = Field(..., description="Total de itens cadastrados")
    page: int = Field(..., ge=1, description="Número da página atual")
    page_size: int = Field(..., ge=1, le=100, description="Quantidade de itens por página")
    total_pages: int = Field(..., ge=0, description="Total de páginas disponíveis")

    @classmethod
    def create(cls, items: Sequence[T], total: int, page: int, page_size: int):
        total_pages = (total + page_size - 1) // page_size if total > 0 else 0
        return cls(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )
