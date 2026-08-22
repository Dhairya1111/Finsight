from __future__ import annotations

from pydantic import BaseModel


class ModelMetric(BaseModel):
    name: str
    accuracy: float
    precision: float
    recall: float
    f1: float


class ConfusionMatrix(BaseModel):
    true_negative: int
    false_positive: int
    false_negative: int
    true_positive: int


class MLDemoResponse(BaseModel):
    metrics: list[ModelMetric]
    best_model: str
    confusion_matrix: ConfusionMatrix
    feature_importance: dict[str, float]
    note: str
