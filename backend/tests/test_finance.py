from pathlib import Path

import pandas as pd
import pytest

from app.analytics.personal_finance import analyze_transactions, normalize_transactions, validate_transactions_df
from app.core.exceptions import ValidationError

DATA_PATH = Path(__file__).resolve().parents[2] / "data" / "sample" / "transactions_demo.csv"


def test_validate_transactions_missing_columns() -> None:
    df = pd.DataFrame([{"Date": "2024-01-01"}])
    with pytest.raises(ValidationError):
        validate_transactions_df(df)


def test_analyze_transactions_demo_dataset() -> None:
    df = pd.read_csv(DATA_PATH)
    normalized = normalize_transactions(df)
    summary = analyze_transactions(normalized, "test", is_demo=True)
    assert summary.total_income > 0
    assert summary.total_expenses > 0
    assert len(summary.monthly) >= 12
    assert summary.transaction_count == len(df)
