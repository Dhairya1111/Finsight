from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class AIAnalysisRequest(BaseModel):
    question: str = Field(min_length=5, max_length=1000)
    domain: Literal["markets", "economics", "finance", "events", "general"] = "general"
    symbol: str | None = None
    indicator_id: str | None = None
    event_id: str | None = None


class AIAnalysisResponse(BaseModel):
    answer: str
    bullets: list[str]
    caveats: list[str]
    references: list[str]
    used_fallback: bool
