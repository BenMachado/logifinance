"""Endpoint de Leitura Inteligente de Arquivos."""
from __future__ import annotations

import tempfile
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_company_id, db_session
from app.models.cost_entry import CostEntry
from app.models.vehicle import Vehicle
from app.schemas.cost import CostEntryRead
from app.schemas.smart_read import (
    SmartReadBatchImportRequest,
    SmartReadBatchImportResponse,
    SmartReadResponse,
)
from app.services import smart_reader
from app.services.smart_reader import detect_file_type
from app.utils.file_upload import MAX_BYTES, ensure_storage_dir

router = APIRouter(prefix="/smart-read", tags=["smart-read"])


_ALLOWED_EXT = {"xlsx", "xls", "csv", "pdf", "jpg", "jpeg", "png", "webp"}


def _save_upload_to_tmp(upload: UploadFile, filename: str) -> Path:
    """Salva upload num arquivo temporário respeitando MAX_BYTES."""
    suffix = Path(filename or "upload").suffix or ""
    fd, tmp_path = tempfile.mkstemp(suffix=suffix, prefix="smart_read_")
    p = Path(tmp_path)
    size = 0
    with p.open("wb") as fp:
        while chunk := upload.file.read(1024 * 1024):
            size += len(chunk)
            if size > MAX_BYTES:
                fp.close()
                p.unlink(missing_ok=True)
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail="Arquivo excede 50MB",
                )
            fp.write(chunk)
    try:
        from os import close
        close(fd)
    except Exception:
        pass
    return p


@router.post("", response_model=SmartReadResponse)
async def smart_read(
    file: Optional[UploadFile] = File(None),
    url: Optional[str] = Form(None),
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> SmartReadResponse:
    """Aceita upload OU link e devolve os itens extraídos para revisão.

    Pelo menos um dos campos ``file`` ou ``url`` deve ser informado.
    """
    if not file and not url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Envie um arquivo via upload OU informe o campo 'url'.",
        )

    tmp_path: Optional[Path] = None
    cleanup = False

    try:
        if file is not None:
            filename = file.filename or "upload"
            file_type, detected_format = detect_file_type(filename, file.content_type)
            tmp_path = _save_upload_to_tmp(file, filename)
            cleanup = True
        else:
            assert url is not None
            file_type, detected_format = detect_file_type(url)
            tmp_path = smart_reader.parse_remote_url(url)[2]
            cleanup = True
            filename = url.rsplit("/", 1)[-1] or "remote"

        if file_type == "unknown":
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="Tipo de arquivo não suportado. Use xlsx, xls, csv, pdf, jpg, png ou webp.",
            )

        items, summary, message_summary, raw_text = smart_reader.read_file(tmp_path, file_type, detected_format)

        return SmartReadResponse(
            file_type=file_type,  # type: ignore[arg-type]
            detected_format=detected_format,
            filename=filename,
            message_summary=message_summary,
            items=items,
            summary=summary,
            raw_text_preview=raw_text,
        )
    finally:
        if cleanup and tmp_path is not None:
            try:
                tmp_path.unlink(missing_ok=True)
            except Exception:
                pass


@router.post("/import", response_model=SmartReadBatchImportResponse)
async def smart_read_import(
    payload: SmartReadBatchImportRequest,
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> SmartReadBatchImportResponse:
    """Importa em lote os itens confirmados como CostEntry."""
    created = 0
    failed = 0
    errors: List[str] = []

    for idx, item in enumerate(payload.items, start=1):
        vehicle = await db.get(Vehicle, item.vehicle_id)
        if not vehicle or vehicle.company_id != company_id:
            failed += 1
            errors.append(f"Linha {idx}: veículo inválido")
            continue
        try:
            entry = CostEntry(
                company_id=company_id,
                vehicle_id=item.vehicle_id,
                trip_id=item.trip_id,
                category=item.category,
                source=item.source,
                amount=item.amount,
                description=item.description,
                incurred_on=item.incurred_on,
            )
            db.add(entry)
            await db.flush()
            created += 1
        except Exception as exc:  # noqa: BLE001
            failed += 1
            errors.append(f"Linha {idx}: {exc}")

    if created:
        await db.commit()

    return SmartReadBatchImportResponse(created=created, failed=failed, errors=errors)
