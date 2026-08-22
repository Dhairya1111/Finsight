from __future__ import annotations

from pydantic import BaseModel, Field

from app.schemas.common import SourceMeta


class TransactionRecord(BaseModel):
    date: str
    description: str
    category: str
    amount: float
    type: str
    account: str


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
