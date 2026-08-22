from __future__ import annotations

from pathlib import Path

import pandas as pd
from fastapi import APIRouter, File, HTTPException, UploadFile

from app.analytics.personal_finance import analyze_transactions, normalize_transactions, read_transactions_csv
from app.core.config import get_settings
from app.core.exceptions import ValidationError
from app.schemas.finance import FinanceSummary

router = APIRouter()
DATA_PATH = Path(__file__).resolve().parents[4] / "data" / "sample" / "transactions_demo.csv"


@router.get("/summary", response_model=FinanceSummary)
def get_demo_finance_summary() -> FinanceSummary:
    df = pd.read_csv(DATA_PATH)
    normalized = normalize_transactions(df)
    return analyze_transactions(normalized, "Bundled demo transaction dataset.", is_demo=True)


@router.post("/upload", response_model=FinanceSummary)
async def upload_transactions(file: UploadFile = File(...)) -> FinanceSummary:
    settings = get_settings()
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV uploads are supported.")
    content = await file.read()
    if len(content) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File exceeds {settings.max_upload_mb} MB limit.")
    try:
        df = read_transactions_csv(content)
    except ValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return analyze_transactions(df, f"Uploaded file: {file.filename}", is_demo=False)
