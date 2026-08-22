from __future__ import annotations

from pydantic import BaseModel

from app.schemas.common import SourceMeta


class IndicatorPoint(BaseModel):
    date: str
    value: float


class IndicatorResponse(BaseModel):
    id: str
    label: str
    units: str
    frequency: str
    country: str
    latest_value: float | None
    latest_date: str | None
    source: SourceMeta
    series: list[IndicatorPoint]


class EconomicEvent(BaseModel):
    id: str
    title: str
    date_range: list[str]
    summary: str
    transmission_mechanisms: list[str]
    relevant_indicators: list[str]
    notes: str


class EventAnalysisResponse(BaseModel):
    event: EconomicEvent
    before_period_return: float | None
    during_period_return: float | None
    recovery_period_return: float | None
    volatility_change: float | None
    market_series: list[IndicatorPoint]
    indicator_snapshots: dict[str, dict[str, float | None]]
    source: SourceMeta
