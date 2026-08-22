from __future__ import annotations

from functools import lru_cache
from pathlib import Path

import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from app.schemas.ml import ConfusionMatrix, MLDemoResponse, ModelMetric

DATA_PATH = Path(__file__).resolve().parents[3] / "data" / "sample" / "credit_risk_demo.csv"


@lru_cache
def evaluate_risk_models() -> MLDemoResponse:
    df = pd.read_csv(DATA_PATH)
    x = df.drop(columns=["risk_flag"])
    y = df["risk_flag"]
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.25, random_state=42, stratify=y)

    logistic = Pipeline(
        [
            ("scaler", StandardScaler()),
            ("model", LogisticRegression(max_iter=1000)),
        ]
    )
    forest = RandomForestClassifier(n_estimators=200, max_depth=6, random_state=42)

    models = {"Logistic Regression": logistic, "Random Forest": forest}
    metrics: list[ModelMetric] = []
    best_name = ""
    best_f1 = -1.0
    best_preds = None
    best_model = None
    for name, model in models.items():
        model.fit(x_train, y_train)
        preds = model.predict(x_test)
        current_f1 = f1_score(y_test, preds)
        metrics.append(
            ModelMetric(
                name=name,
                accuracy=round(accuracy_score(y_test, preds), 4),
                precision=round(precision_score(y_test, preds), 4),
                recall=round(recall_score(y_test, preds), 4),
                f1=round(current_f1, 4),
            )
        )
        if current_f1 > best_f1:
            best_f1 = current_f1
            best_name = name
            best_preds = preds
            best_model = model

    tn, fp, fn, tp = confusion_matrix(y_test, best_preds).ravel()
    if best_name == "Random Forest":
        importances = best_model.feature_importances_
        feature_importance = {
            feature: round(float(value), 4) for feature, value in zip(x.columns, importances, strict=False)
        }
    else:
        coef = abs(best_model.named_steps["model"].coef_[0])
        feature_importance = {feature: round(float(value), 4) for feature, value in zip(x.columns, coef, strict=False)}

    return MLDemoResponse(
        metrics=metrics,
        best_model=best_name,
        confusion_matrix=ConfusionMatrix(
            true_negative=int(tn),
            false_positive=int(fp),
            false_negative=int(fn),
            true_positive=int(tp),
        ),
        feature_importance=feature_importance,
        note="Synthetic educational credit-risk style dataset. It is not suitable for real lending or financial decision-making.",
    )
