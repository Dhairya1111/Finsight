from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings

settings = get_settings()
connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    from app.models.upload import LedgerShare, LedgerTransaction, TransactionUpload  # noqa: F401
    from app.models.user import User  # noqa: F401

    if settings.database_url.startswith("sqlite"):
        _reset_legacy_sqlite_schema_if_needed()
    Base.metadata.create_all(bind=engine)


def _reset_legacy_sqlite_schema_if_needed() -> None:
    inspector = inspect(engine)
    table_names = set(inspector.get_table_names())
    requires_reset = False

    if "users" not in table_names:
        requires_reset = True
    if "ledger_transactions" in table_names:
        ledger_columns = {column["name"] for column in inspector.get_columns("ledger_transactions")}
        if "owner_id" not in ledger_columns:
            requires_reset = True
    if "ledger_shares" in table_names:
        share_columns = {column["name"] for column in inspector.get_columns("ledger_shares")}
        if "owner_id" not in share_columns:
            requires_reset = True

    if not requires_reset:
        return

    with engine.begin() as connection:
        for table_name in ["ledger_shares", "ledger_transactions", "transaction_uploads", "users"]:
            connection.execute(text(f"DROP TABLE IF EXISTS {table_name}"))
