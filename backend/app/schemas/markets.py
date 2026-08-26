from __future__ import annotations

from pydantic import BaseModel

from app.schemas.common import SourceMeta


class PricePoint(BaseModel):
    date: str
    close: float


class CompanyMetricSeriesPoint(BaseModel):
    year: int
    revenue: float
    eps: float
    profit_margin: float


class CompanySearchResult(BaseModel):
    symbol: str
    name: str
    exchange: str
    sector: str | None = None
    industry: str | None = None


class CompanyOverview(BaseModel):
    symbol: str
    name: str
    sector: str
    exchange: str
    currency: str
    latest_price: float | None = None
    market_cap: float | None = None
    revenue: float | None = None
    eps: float | None = None
    pe_ratio: float | None = None
    pb_ratio: float | None = None
    roe: float | None = None
    debt: float | None = None
    cash: float | None = None
    profit_margin: float | None = None
    revenue_growth: float | None = None
    earnings_growth: float | None = None
    source: SourceMeta
    metrics_series: list[CompanyMetricSeriesPoint]


class CompanyHistoryResponse(BaseModel):
    symbol: str
    history: list[PricePoint]
    source: SourceMeta


class CompanyComparisonRow(BaseModel):
    metric: str
    values: dict[str, float | None]
