"""File upload helpers — stores files locally under STORAGE_DIR."""
import os
import secrets
from pathlib import Path
from typing import Tuple

from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

# Whitelist of MIME types the WhatsApp bot / manual upload accept.
ALLOWED_MIME_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
}
MAX_BYTES = 50 * 1024 * 1024  # 50 MB


def ensure_storage_dir(company_id: int) -> Path:
    base = Path(settings.STORAGE_DIR) / f"company_{company_id}"
    base.mkdir(parents=True, exist_ok=True)
    return base


async def save_upload(
    upload: UploadFile,
    company_id: int,
    subdir: str = "receipts",
) -> Tuple[Path, str]:
    """Persist an upload to STORAGE_DIR and return (absolute_path, public_url).

    The returned public_url is what the frontend should use to load the image.
    In dev this maps to a FastAPI static mount; in production we'd swap to S3.
    """

    if upload.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Tipo de arquivo não suportado: {upload.content_type}",
        )

    target_dir = ensure_storage_dir(company_id) / subdir
    target_dir.mkdir(parents=True, exist_ok=True)

    ext = ALLOWED_MIME_TYPES[upload.content_type]
    safe_name = f"{secrets.token_hex(8)}{ext}"
    dest = target_dir / safe_name

    size = 0
    with dest.open("wb") as fp:
        while chunk := await upload.read(1024 * 1024):
            size += len(chunk)
            if size > MAX_BYTES:
                fp.close()
                dest.unlink(missing_ok=True)
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail="Arquivo excede 50MB",
                )
            fp.write(chunk)

    public_url = f"/storage/company_{company_id}/{subdir}/{safe_name}"
    return dest, public_url
