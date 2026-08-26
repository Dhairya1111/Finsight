from __future__ import annotations

from datetime import date
from pathlib import Path

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.analytics.personal_finance import (
    analyze_transactions,
    normalize_transactions,
    read_transactions_csv,
)
from app.core.config import get_settings
from app.core.database import get_db
from app.core.exceptions import ValidationError
from app.models.upload import LedgerTransaction
from app.schemas.common import ApiMessage
from app.schemas.finance import (
    FinanceSummary,
    LedgerTransactionBase,
    LedgerTransactionResponse,
    LedgerTransactionUpdate,
    ManualTransactionRequest,
)

router = APIRouter()
DATA_PATH = Path(__file__).resolve().parents[4] / "data" / "sample" / "transactions_demo.csv"


def _ledger_transaction_to_response(transaction: LedgerTransaction) -> LedgerTransactionResponse:
    return LedgerTransactionResponse(
        id=transaction.id,
        date=transaction.transaction_date.isoformat(),
        description=transaction.description,
        category=transaction.category,
        amount=transaction.amount,
        type=transaction.type,
        account=transaction.account,
        created_at=transaction.created_at.isoformat(),
        updated_at=transaction.updated_at.isoformat(),
    )


def _load_demo_summary() -> FinanceSummary:
    df = pd.read_csv(DATA_PATH)
    normalized = normalize_transactions(df)
    return analyze_transactions(normalized, "Bundled demo transaction dataset.", is_demo=True)


def _ledger_transactions_query() -> select:
    return select(LedgerTransaction).order_by(
        LedgerTransaction.transaction_date.desc(),
        LedgerTransaction.id.desc(),
    )


def _db_transactions_to_dataframe(transactions: list[LedgerTransaction]) -> pd.DataFrame:
    rows = [
        {
            "Date": transaction.transaction_date.isoformat(),
            "Description": transaction.description,
            "Category": transaction.category,
            "Amount": transaction.amount if transaction.type == "income" else -abs(transaction.amount),
            "Type": transaction.type,
            "Account": transaction.account,
        }
        for transaction in transactions
    ]
    return normalize_transactions(pd.DataFrame(rows))


def _parse_transaction_date(value: str) -> date:
    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid transaction date.") from exc


def _persist_dataframe_as_transactions(df: pd.DataFrame, db: Session) -> list[LedgerTransaction]:
    db.query(LedgerTransaction).delete()
    transactions: list[LedgerTransaction] = []
    for row in df.to_dict(orient="records"):
        transaction = LedgerTransaction(
            transaction_date=_parse_transaction_date(str(row["Date"])[:10]),
            description=str(row["Description"]).strip(),
            category=str(row["Category"]).strip(),
            amount=abs(float(row["Amount"])),
            type=str(row["Type"]).strip().lower(),
            account=str(row["Account"]).strip(),
        )
        db.add(transaction)
        transactions.append(transaction)
    db.commit()
    for transaction in transactions:
        db.refresh(transaction)
    return transactions


def _stored_summary(db: Session) -> FinanceSummary | None:
    transactions = db.execute(_ledger_transactions_query()).scalars().all()
    if not transactions:
        return None
    df = _db_transactions_to_dataframe(transactions)
    return analyze_transactions(
        df,
        "Saved ledger transactions from the local FinSight workspace.",
        is_demo=False,
    )


@router.get("/summary", response_model=FinanceSummary)
def get_finance_summary(db: Session = Depends(get_db)) -> FinanceSummary:
    stored = _stored_summary(db)
    if stored is not None:
        return stored
    return _load_demo_summary()


@router.get("/transactions", response_model=list[LedgerTransactionResponse])
def list_transactions(db: Session = Depends(get_db)) -> list[LedgerTransactionResponse]:
    transactions = db.execute(_ledger_transactions_query()).scalars().all()
    return [_ledger_transaction_to_response(transaction) for transaction in transactions]


@router.post(
    "/transactions",
    response_model=LedgerTransactionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_transaction(
    payload: LedgerTransactionBase,
    db: Session = Depends(get_db),
) -> LedgerTransactionResponse:
    transaction = LedgerTransaction(
        transaction_date=_parse_transaction_date(payload.date),
        description=payload.description.strip(),
        category=payload.category.strip(),
        amount=abs(payload.amount),
        type=payload.type,
        account=payload.account.strip(),
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return _ledger_transaction_to_response(transaction)


@router.put("/transactions/{transaction_id}", response_model=LedgerTransactionResponse)
def update_transaction(
    transaction_id: int,
    payload: LedgerTransactionUpdate,
    db: Session = Depends(get_db),
) -> LedgerTransactionResponse:
    transaction = db.get(LedgerTransaction, transaction_id)
    if transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found.")

    transaction.transaction_date = date.fromisoformat(payload.date)
    transaction.description = payload.description.strip()
    transaction.category = payload.category.strip()
    transaction.amount = abs(payload.amount)
    transaction.type = payload.type
    transaction.account = payload.account.strip()

    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return _ledger_transaction_to_response(transaction)


@router.delete("/transactions/{transaction_id}", response_model=ApiMessage)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
) -> ApiMessage:
    transaction = db.get(LedgerTransaction, transaction_id)
    if transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found.")
    db.delete(transaction)
    db.commit()
    return ApiMessage(message="Transaction removed.")


@router.post("/reset", response_model=FinanceSummary)
def reset_transactions(db: Session = Depends(get_db)) -> FinanceSummary:
    db.query(LedgerTransaction).delete()
    db.commit()
    return _load_demo_summary()


@router.post("/upload", response_model=FinanceSummary)
async def upload_transactions(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> FinanceSummary:
    settings = get_settings()
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV uploads are supported.")

    content = await file.read()
    if len(content) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds {settings.max_upload_mb} MB limit.",
        )

    try:
        df = read_transactions_csv(content)
    except ValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    _persist_dataframe_as_transactions(df, db)
    stored = _stored_summary(db)
    if stored is None:
        raise HTTPException(status_code=500, detail="Failed to store uploaded transactions.")
    return stored


@router.post("/analyze-manual", response_model=FinanceSummary)
def analyze_manual_transactions(
    payload: ManualTransactionRequest,
    db: Session = Depends(get_db),
) -> FinanceSummary:
    rows = [
        {
            "Date": transaction.date,
            "Description": transaction.description,
            "Category": transaction.category,
            "Amount": abs(transaction.amount) if transaction.type == "income" else -abs(transaction.amount),
            "Type": transaction.type,
            "Account": transaction.account,
        }
        for transaction in payload.transactions
    ]

    try:
        normalized = normalize_transactions(pd.DataFrame(rows))
    except ValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    _persist_dataframe_as_transactions(normalized, db)
    stored = _stored_summary(db)
    if stored is None:
        raise HTTPException(status_code=500, detail="Failed to analyze manual transactions.")
    return stored
