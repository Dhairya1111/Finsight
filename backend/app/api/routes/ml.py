from __future__ import annotations

from fastapi import APIRouter

from app.analytics.ml_demo import evaluate_risk_models
from app.schemas.ml import MLDemoResponse

router = APIRouter()


@router.get("/risk-demo", response_model=MLDemoResponse)
def get_risk_demo() -> MLDemoResponse:
    return evaluate_risk_models()
