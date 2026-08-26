from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.common import SourceMeta


class TransactionRecord(BaseModel):
    date: str
    description: str
    category: str
    amount: float
    type: str
    account: str


class LedgerTransactionBase(BaseModel):
    date: str
    description: str
    category: str
    amount: float = Field(gt=0)
    type: Literal["income", "expense"]
    account: str


class ManualTransactionInput(LedgerTransactionBase):
    pass


class ManualTransactionRequest(BaseModel):
    transactions: list[ManualTransactionInput] = Field(min_length=1)


class LedgerTransactionUpdate(LedgerTransactionBase):
    pass


class LedgerTransactionResponse(LedgerTransactionBase):
    id: int
    created_at: str
    updated_at: str


class VoiceNarrationRequest(BaseModel):
    text: str = Field(min_length=3, max_length=500)


class VoiceEntryResponse(BaseModel):
    transcript: str
    parsed_transaction: LedgerTransactionResponse
    message: str
    warnings: list[str] = Field(default_factory=list)


class ShareLinkResponse(BaseModel):
    token: str
    share_path: str
    created_at: str


class MonthlyPoint(BaseModel):
    month: str
    income: float = 0
    expenses: float = 0
    net_savings: float = 0
    savings_rate: float | None = None


class CategoryPoint(BaseModel):
    category: str
    amount: float
    share: float


class RecurringExpense(BaseModel):
    description: str
    category: str
    occurrences: int
    average_amount: float


class FinanceSummary(BaseModel):
    total_income: float
    total_expenses: float
    net_savings: float
    savings_rate: float | None = None
    transaction_count: int
    recurring_expenses: list[RecurringExpense]
    spending_trend: str
    monthly: list[MonthlyPoint]
    categories: list[CategoryPoint]
    source: SourceMeta
    budget_comparison: list[CategoryPoint] = Field(default_factory=list)


class SharedLedgerResponse(BaseModel):
    title: str
    created_at: str
    summary: FinanceSummary
    transactions: list[LedgerTransactionResponse]
