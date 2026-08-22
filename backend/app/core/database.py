"""Async SQLAlchemy engine, session factory, and declarative Base."""
from typing import AsyncGenerator

from sqlalchemy import event
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""

    pass


engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    future=True,
    connect_args={"statement_cache_size": 0},
)


@event.listens_for(engine.sync_engine, "connect")
def _disable_prepared_stmts(dbapi_conn, connection_record):
    """Ensure prepared statements are disabled for PgBouncer compatibility."""
    try:
        dbapi_conn.statement_cache_size = 0
    except AttributeError:
        pass

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields a transactional async session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
