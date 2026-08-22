from __future__ import annotations

from pydantic import BaseModel, Field


class ScenarioInput(BaseModel):
    repo_rate: float = Field(ge=0, le=20)
    crude_oil: float = Field(ge=10, le=250)
    inflation: float = Field(ge=-5, le=20)
    government_spending_change: float = Field(ge=-50, le=50)


class ScenarioOutput(BaseModel):
    baseline: dict[str, float]
    scenario: dict[str, float]
    differences: dict[str, float]
    assumptions: list[str]
    methodology: str
