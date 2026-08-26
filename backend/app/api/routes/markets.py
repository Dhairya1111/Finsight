from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.config import Settings, get_settings
from app.core.exceptions import ProviderError
from app.schemas.markets import (
    CompanyComparisonRow,
    CompanyHistoryResponse,
    CompanyOverview,
    CompanySearchResult,
)
from app.services.providers.market import MarketDataProvider, get_market_provider

router = APIRouter()


def market_provider(settings: Settings = Depends(get_settings)) -> MarketDataProvider:
    return get_market_provider(settings)


@router.get("/companies")
def list_companies(
    provider: MarketDataProvider = Depends(market_provider),
) -> dict[str, list[str]]:
    return {"symbols": provider.list_symbols()}


@router.get("/search", response_model=list[CompanySearchResult])
def search_companies(
    query: str = Query(..., min_length=1),
    limit: int = Query(8, ge=1, le=12),
    provider: MarketDataProvider = Depends(market_provider),
) -> list[CompanySearchResult]:
    try:
        return provider.search_companies(query, limit)
    except ProviderError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/company/{symbol}", response_model=CompanyOverview)
def get_company(
    symbol: str,
    provider: MarketDataProvider = Depends(market_provider),
) -> CompanyOverview:
    try:
        return provider.get_company(symbol)
    except ProviderError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/company/{symbol}/history", response_model=CompanyHistoryResponse)
def get_company_history(
    symbol: str,
    provider: MarketDataProvider = Depends(market_provider),
) -> CompanyHistoryResponse:
    try:
        return provider.get_history(symbol)
    except ProviderError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/compare", response_model=list[CompanyComparisonRow])
def compare_companies(
    symbols: list[str] = Query(
        ...,
        description="Repeat the symbols query parameter for multi-company comparison.",
    ),
    provider: MarketDataProvider = Depends(market_provider),
) -> list[CompanyComparisonRow]:
    try:
        return provider.compare_companies(symbols)
    except ProviderError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
