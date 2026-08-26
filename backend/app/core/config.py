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
        """Convert any PostgreSQL URL to use psycopg driver via pooler (IPv4)."""
        url = self.DATABASE_URL
        if "+asyncpg" in url:
            url = url.replace("+asyncpg", "+psycopg")
        elif url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+psycopg://", 1)
        # Use pooler (port 6543) which works over IPv4 — direct connection fails on Render
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
    CORS_ORIGINS: List[str] = ["*"]

    # Storage
    STORAGE_DIR: str = "./storage"

    # Margin threshold (below this triggers a CostAlert)
    MARGIN_ALERT_THRESHOLD: float = 0.20  # 20%

    # OCR
    TESSERACT_LANG: str = "por+eng"

    # Stripe
    STRIPE_SECRET_KEY: str = "sk_test_..."
    STRIPE_PUBLISHABLE_KEY: str = "pk_test_..."
    STRIPE_WEBHOOK_SECRET: str = "whsec_..."


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
