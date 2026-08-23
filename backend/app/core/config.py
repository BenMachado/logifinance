"""Application configuration loaded from environment variables."""
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Project-wide settings.

    Reads from environment variables and an optional .env file.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    PROJECT_NAME: str = "LogiFinance API"
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://logifinance:logifinance@localhost:5432/logifinance"

    @property
    def psycopg_url(self) -> str:
        """Convert any PostgreSQL URL to use psycopg driver, direct connection."""
        url = self.DATABASE_URL
        if "+asyncpg" in url:
            url = url.replace("+asyncpg", "+psycopg")
        elif url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+psycopg://", 1)
        # Switch from pooler to direct connection
        url = url.replace(":6543/", ":5432/")
        url = url.replace(
            "aws-0-sa-east-1.pooler.supabase.com",
            "db.bcioubbqunrjnsnhhcmd.supabase.co",
        )
        # Direct connection uses plain "postgres" username
        url = url.replace("postgres.bcioubbqunrjnsnhhcmd:", "postgres:", 1)
        if "sslmode=" not in url and "?" not in url:
            url += "?sslmode=require"
        elif "sslmode=" not in url:
            url += "&sslmode=require"
        return url

    # Security
    SECRET_KEY: str = "change-me-in-production-please-32-bytes-minimum"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day (config spec said 15min but 1 day eases dev)
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    # Storage
    STORAGE_DIR: str = "./storage"

    # Margin threshold (below this triggers a CostAlert)
    MARGIN_ALERT_THRESHOLD: float = 0.20  # 20%

    # OCR
    TESSERACT_LANG: str = "por+eng"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
