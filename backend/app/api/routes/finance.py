from __future__ import annotations

import re
import secrets
from datetime import date, timedelta
from pathlib import Path

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.analytics.personal_finance import analyze_transactions, normalize_transactions, read_transactions_csv
from app.core.config import get_settings
from app.core.database import get_db
from app.core.exceptions import ValidationError
from app.core.security import get_current_user
from app.models.upload import LedgerShare, LedgerTransaction
from app.models.user import User
from app.schemas.common import ApiMessage
from app.schemas.finance import (
    FinanceSummary,
    LedgerTransactionBase,
    LedgerTransactionResponse,
    LedgerTransactionUpdate,
    ManualTransactionRequest,
    SharedLedgerResponse,
    ShareLinkResponse,
    VoiceEntryResponse,
    VoiceNarrationRequest,
)

router = APIRouter()
DATA_PATH = Path(__file__).resolve().parents[4] / "data" / "sample" / "transactions_demo.csv"

EXPENSE_CATEGORY_KEYWORDS = {
    "rent": "Housing",
    "grocer": "Groceries",
    "supermarket": "Groceries",
    "food": "Dining",
    "dinner": "Dining",
    "lunch": "Dining",
    "breakfast": "Dining",
    "coffee": "Dining",
    "restaurant": "Dining",
    "uber": "Transport",
    "ola": "Transport",
    "taxi": "Transport",
    "metro": "Transport",
    "bus": "Transport",
    "fuel": "Fuel",
    "petrol": "Fuel",
    "diesel": "Fuel",
    "electricity": "Utilities",
    "water": "Utilities",
    "internet": "Internet & Mobile",
    "mobile": "Internet & Mobile",
    "phone bill": "Internet & Mobile",
    "shopping": "Shopping",
    "amazon": "Shopping",
    "medical": "Health",
    "doctor": "Health",
    "pharmacy": "Health",
    "insurance": "Insurance",
    "movie": "Entertainment",
    "netflix": "Subscriptions",
    "spotify": "Subscriptions",
    "loan": "EMI / Loans",
    "emi": "EMI / Loans",
    "tax": "Taxes",
    "gift": "Gifts",
    "pet": "Pets",
    "investment": "Investments",
    "sip": "Investments",
    "charity": "Charity",
}

INCOME_CATEGORY_KEYWORDS = {
    "salary": "Salary",
    "bonus": "Bonus",
    "freelance": "Freelance",
    "business income": "Business Income",
    "interest": "Interest",
    "dividend": "Dividend",
    "rent received": "Rental Income",
    "refund": "Refund",
    "cashback": "Cashback",
}

ACCOUNT_KEYWORDS = {
    "upi": "UPI Wallet",
    "gpay": "UPI Wallet",
    "google pay": "UPI Wallet",
    "phonepe": "UPI Wallet",
    "paytm": "UPI Wallet",
    "cash": "Cash",
    "credit card": "Credit Card",
    "card": "Credit Card",
    "brokerage": "Brokerage",
    "business account": "Business Account",
    "joint account": "Joint Account",
    "savings": "Savings Account",
    "bank": "Primary Checking",
    "checking": "Primary Checking",
}

INCOME_HINTS = ["income", "received", "credited", "salary", "bonus", "refund", "cashback", "earned"]
EXPENSE_HINTS = ["spent", "paid", "debited", "bought", "purchase", "expense", "recharge", "bill"]


@router.get("/summary", response_model=FinanceSummary)
def get_finance_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FinanceSummary:
    stored = _stored_summary(db, current_user.id)
    if stored is not None:
        return stored
    return _load_demo_summary()


@router.get("/transactions", response_model=list[LedgerTransactionResponse])
def list_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[LedgerTransactionResponse]:
    transactions = db.execute(_ledger_transactions_query(current_user.id)).scalars().all()
    return [_ledger_transaction_to_response(transaction) for transaction in transactions]


@router.post(
    "/transactions",
    response_model=LedgerTransactionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_transaction(
    payload: LedgerTransactionBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> LedgerTransactionResponse:
    transaction = _create_transaction_record(payload, db, current_user.id)
    return _ledger_transaction_to_response(transaction)


@router.put("/transactions/{transaction_id}", response_model=LedgerTransactionResponse)
def update_transaction(
    transaction_id: int,
    payload: LedgerTransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> LedgerTransactionResponse:
    transaction = db.get(LedgerTransaction, transaction_id)
    if transaction is None or transaction.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Transaction not found.")

    transaction.transaction_date = _parse_transaction_date(payload.date)
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
    current_user: User = Depends(get_current_user),
) -> ApiMessage:
    transaction = db.get(LedgerTransaction, transaction_id)
    if transaction is None or transaction.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Transaction not found.")
    db.delete(transaction)
    db.commit()
    return ApiMessage(message="Transaction removed.")


@router.post("/voice-entry", response_model=VoiceEntryResponse)
def create_voice_entry(
    payload: VoiceNarrationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> VoiceEntryResponse:
    parsed_input, warnings = _parse_voice_narration(payload.text)
    transaction = _create_transaction_record(parsed_input, db, current_user.id)
    response = _ledger_transaction_to_response(transaction)
    message = (
        f"Added {response.type} entry for {response.description} worth {response.amount:.2f} in {response.account}."
    )
    return VoiceEntryResponse(
        transcript=payload.text,
        parsed_transaction=response,
        message=message,
        warnings=warnings,
    )


@router.post("/share", response_model=ShareLinkResponse)
def create_share_link(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ShareLinkResponse:
    transactions = db.execute(_ledger_transactions_query(current_user.id)).scalars().all()
    if not transactions:
        raise HTTPException(status_code=400, detail="Add at least one saved transaction before sharing your ledger.")

    token = secrets.token_urlsafe(12)
    share = LedgerShare(token=token, title=f"{current_user.full_name}'s ledger", owner_id=current_user.id)
    db.add(share)
    db.commit()
    db.refresh(share)
    return ShareLinkResponse(
        token=share.token,
        share_path=f"/shared/ledger/{share.token}",
        created_at=share.created_at.isoformat(),
    )


@router.get("/shared/{token}", response_model=SharedLedgerResponse)
def get_shared_ledger(token: str, db: Session = Depends(get_db)) -> SharedLedgerResponse:
    share = db.execute(select(LedgerShare).where(LedgerShare.token == token)).scalar_one_or_none()
    if share is None:
        raise HTTPException(status_code=404, detail="Shared ledger not found.")

    transactions = db.execute(_ledger_transactions_query(share.owner_id)).scalars().all()
    if not transactions:
        raise HTTPException(status_code=404, detail="No ledger data is available for this share.")

    summary = _stored_summary(db, share.owner_id)
    if summary is None:
        raise HTTPException(status_code=404, detail="No ledger data is available for this share.")

    return SharedLedgerResponse(
        title=share.title,
        created_at=share.created_at.isoformat(),
        summary=summary,
        transactions=[_ledger_transaction_to_response(transaction) for transaction in transactions],
    )


@router.post("/reset", response_model=FinanceSummary)
def reset_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FinanceSummary:
    db.query(LedgerTransaction).filter(LedgerTransaction.owner_id == current_user.id).delete()
    db.commit()
    return _load_demo_summary()


@router.post("/upload", response_model=FinanceSummary)
async def upload_transactions(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FinanceSummary:
    settings = get_settings()
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV uploads are supported.")

    content = await file.read()
    if len(content) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File exceeds {settings.max_upload_mb} MB limit.")

    try:
        df = read_transactions_csv(content)
    except ValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    _persist_dataframe_as_transactions(df, db, current_user.id)
    stored = _stored_summary(db, current_user.id)
    if stored is None:
        raise HTTPException(status_code=500, detail="Failed to store uploaded transactions.")
    return stored


@router.post("/analyze-manual", response_model=FinanceSummary)
def analyze_manual_transactions(
    payload: ManualTransactionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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

    _persist_dataframe_as_transactions(normalized, db, current_user.id)
    stored = _stored_summary(db, current_user.id)
    if stored is None:
        raise HTTPException(status_code=500, detail="Failed to analyze manual transactions.")
    return stored


def _create_transaction_record(payload: LedgerTransactionBase, db: Session, owner_id: int) -> LedgerTransaction:
    transaction = LedgerTransaction(
        owner_id=owner_id,
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
    return transaction


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


def _ledger_transactions_query(owner_id: int):
    return (
        select(LedgerTransaction)
        .where(LedgerTransaction.owner_id == owner_id)
        .order_by(
            LedgerTransaction.transaction_date.desc(),
            LedgerTransaction.id.desc(),
        )
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


def _persist_dataframe_as_transactions(df: pd.DataFrame, db: Session, owner_id: int) -> list[LedgerTransaction]:
    db.query(LedgerTransaction).filter(LedgerTransaction.owner_id == owner_id).delete()
    transactions: list[LedgerTransaction] = []
    for row in df.to_dict(orient="records"):
        transaction = LedgerTransaction(
            owner_id=owner_id,
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


def _stored_summary(db: Session, owner_id: int) -> FinanceSummary | None:
    transactions = db.execute(_ledger_transactions_query(owner_id)).scalars().all()
    if not transactions:
        return None
    df = _db_transactions_to_dataframe(transactions)
    return analyze_transactions(
        df,
        "Saved ledger transactions from the local FinSight workspace.",
        is_demo=False,
    )


def _parse_voice_narration(text: str) -> tuple[LedgerTransactionBase, list[str]]:
    cleaned = " ".join(text.strip().split())
    lower_text = cleaned.lower()
    warnings: list[str] = []

    amount = _extract_amount(lower_text)
    if amount is None:
        raise HTTPException(
            status_code=400, detail="Could not detect an amount in the spoken entry. Please mention a number."
        )

    transaction_type = _infer_transaction_type(lower_text)
    category = _infer_category(lower_text, transaction_type)
    account = _infer_account(lower_text)
    transaction_date = _infer_date(lower_text)
    description = _infer_description(cleaned, category)

    if "today" not in lower_text and "yesterday" not in lower_text and transaction_date == date.today():
        warnings.append("Date not detected, so today was used.")
    if account == "Primary Checking":
        warnings.append("Account not clearly detected, so Primary Checking was used.")

    payload = LedgerTransactionBase(
        date=transaction_date.isoformat(),
        description=description,
        category=category,
        amount=amount,
        type=transaction_type,
        account=account,
    )
    return payload, warnings


def _extract_amount(text: str) -> float | None:
    match = re.search(r"(?:₹|rs\.?|inr)?\s*([0-9][0-9,]*(?:\.\d+)?)\s*([kmb])?", text)
    if not match:
        return None
    raw_amount = float(match.group(1).replace(",", ""))
    suffix = match.group(2)
    if suffix == "k":
        raw_amount *= 1_000
    elif suffix == "m":
        raw_amount *= 1_000_000
    elif suffix == "b":
        raw_amount *= 1_000_000_000
    return round(raw_amount, 2)


def _infer_transaction_type(text: str) -> str:
    if any(keyword in text for keyword in INCOME_HINTS):
        return "income"
    if any(keyword in text for keyword in EXPENSE_HINTS):
        return "expense"
    if "add" in text and "subtract" not in text:
        return "income"
    return "expense"


def _infer_category(text: str, transaction_type: str) -> str:
    keyword_map = INCOME_CATEGORY_KEYWORDS if transaction_type == "income" else EXPENSE_CATEGORY_KEYWORDS
    for keyword, category in keyword_map.items():
        if keyword in text:
            return category
    return "Other Income" if transaction_type == "income" else "Other Expense"


def _infer_account(text: str) -> str:
    for keyword, account in ACCOUNT_KEYWORDS.items():
        if keyword in text:
            return account
    return "Primary Checking"


def _infer_date(text: str) -> date:
    if "yesterday" in text:
        return date.today() - timedelta(days=1)
    iso_match = re.search(r"(20\d{2}-\d{2}-\d{2})", text)
    if iso_match:
        return date.fromisoformat(iso_match.group(1))
    dmy_match = re.search(r"(\d{2})/(\d{2})/(20\d{2})", text)
    if dmy_match:
        day, month, year = dmy_match.groups()
        return date(int(year), int(month), int(day))
    return date.today()


def _infer_description(text: str, fallback: str) -> str:
    for pattern in [r"for ([a-zA-Z ]+)", r"on ([a-zA-Z ]+)", r"from ([a-zA-Z ]+)"]:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            phrase = match.group(1).strip().title()
            phrase = re.sub(
                r"\b(Today|Yesterday|Via|Using|With|By|Upi|Cash|Card|Bank|Account|Credit)\b",
                "",
                phrase,
            ).strip()
            phrase = re.sub(r"\s+", " ", phrase)
            if phrase:
                return phrase[:80]
    return fallback
