from __future__ import annotations

from io import BytesIO

import pandas as pd

from app.core.exceptions import ValidationError
from app.schemas.common import SourceMeta
from app.schemas.finance import CategoryPoint, FinanceSummary, MonthlyPoint, RecurringExpense

REQUIRED_COLUMNS = {"Date", "Description", "Category", "Amount", "Type", "Account"}
DEFAULT_BUDGETS = {
    "Housing": 26000,
    "Groceries": 12000,
    "Dining": 7000,
    "Transport": 5000,
    "Utilities": 6000,
    "Shopping": 9000,
    "Health": 5000,
    "Investments": 15000,
}


def read_transactions_csv(content: bytes) -> pd.DataFrame:
    try:
        df = pd.read_csv(BytesIO(content))
    except Exception as exc:  # pragma: no cover - pandas error surface varies
        raise ValidationError("The uploaded file could not be parsed as CSV.") from exc
    validate_transactions_df(df)
    return normalize_transactions(df)


def validate_transactions_df(df: pd.DataFrame) -> None:
    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise ValidationError(f'Missing required columns: {", ".join(sorted(missing))}')
    if df.empty:
        raise ValidationError("The transaction dataset is empty.")


def normalize_transactions(df: pd.DataFrame) -> pd.DataFrame:
    normalized = df.copy()
    normalized["Date"] = pd.to_datetime(normalized["Date"], errors="coerce")
    if normalized["Date"].isna().any():
        raise ValidationError("One or more transaction dates are invalid.")
    normalized["Amount"] = pd.to_numeric(normalized["Amount"], errors="coerce")
    if normalized["Amount"].isna().any():
        raise ValidationError("One or more transaction amounts are invalid.")
    normalized["Type"] = normalized["Type"].str.lower().str.strip()
    normalized["Category"] = normalized["Category"].fillna("Uncategorized").str.strip()
    normalized["month"] = normalized["Date"].dt.to_period("M").astype(str)
    return normalized.sort_values("Date")


def analyze_transactions(df: pd.DataFrame, source_note: str, is_demo: bool) -> FinanceSummary:
    income_df = df[df["Type"] == "income"]
    expense_df = df[df["Type"] == "expense"]

    total_income = float(income_df["Amount"].sum())
    total_expenses = float(abs(expense_df["Amount"].sum()))
    net_savings = total_income - total_expenses
    savings_rate = None if total_income == 0 else net_savings / total_income

    monthly = (
        df.assign(income=df["Amount"].where(df["Type"] == "income", 0.0))
        .assign(expenses=(-df["Amount"]).where(df["Type"] == "expense", 0.0))
        .groupby("month", as_index=False)[["income", "expenses"]]
        .sum()
    )
    monthly["net_savings"] = monthly["income"] - monthly["expenses"]
    monthly["savings_rate"] = monthly.apply(
        lambda row: None if row["income"] == 0 else row["net_savings"] / row["income"], axis=1
    )
    monthly_points = [MonthlyPoint(**record) for record in monthly.to_dict(orient="records")]

    category = (
        expense_df.assign(abs_amount=expense_df["Amount"].abs())
        .groupby("Category", as_index=False)["abs_amount"]
        .sum()
        .sort_values("abs_amount", ascending=False)
    )
    total_spend = category["abs_amount"].sum() or 1
    category_points = [
        CategoryPoint(
            category=row["Category"], amount=float(row["abs_amount"]), share=float(row["abs_amount"] / total_spend)
        )
        for _, row in category.iterrows()
    ]

    recurring = (
        expense_df.assign(abs_amount=expense_df["Amount"].abs())
        .groupby(["Description", "Category"])["abs_amount"]
        .agg(["count", "mean"])
        .reset_index()
        .sort_values(["count", "mean"], ascending=[False, False])
    )
    recurring_points = [
        RecurringExpense(
            description=row["Description"],
            category=row["Category"],
            occurrences=int(row["count"]),
            average_amount=float(row["mean"]),
        )
        for _, row in recurring[recurring["count"] >= 3].head(8).iterrows()
    ]

    trend = "stable"
    if len(monthly) >= 2:
        recent = monthly["expenses"].tail(3).mean()
        prior = monthly["expenses"].head(min(3, len(monthly))).mean()
        if recent > prior * 1.1:
            trend = "upward"
        elif recent < prior * 0.9:
            trend = "downward"

    budget_comparison = []
    latest_month = monthly["month"].iloc[-1]
    latest_expenses = expense_df[expense_df["month"] == latest_month].assign(
        abs_amount=expense_df[expense_df["month"] == latest_month]["Amount"].abs()
    )
    grouped_latest = (
        latest_expenses.groupby("Category", as_index=False)["abs_amount"].sum()
        if not latest_expenses.empty
        else pd.DataFrame(columns=["Category", "abs_amount"])
    )
    budget_lookup = {row["Category"]: row["abs_amount"] for _, row in grouped_latest.iterrows()}
    for category_name, budget in DEFAULT_BUDGETS.items():
        actual = float(budget_lookup.get(category_name, 0.0))
        share = None if budget == 0 else actual / budget
        budget_comparison.append(CategoryPoint(category=category_name, amount=actual, share=share or 0.0))

    return FinanceSummary(
        total_income=round(total_income, 2),
        total_expenses=round(total_expenses, 2),
        net_savings=round(net_savings, 2),
        savings_rate=round(savings_rate, 4) if savings_rate is not None else None,
        transaction_count=len(df),
        recurring_expenses=recurring_points,
        spending_trend=trend,
        monthly=monthly_points,
        categories=category_points,
        budget_comparison=budget_comparison,
        source=SourceMeta(name="FinSight personal finance engine", is_demo=is_demo, note=source_note),
    )
