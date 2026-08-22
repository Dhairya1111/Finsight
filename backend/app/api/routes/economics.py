from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.core.config import Settings, get_settings
from app.core.exceptions import ProviderError
from app.schemas.economics import IndicatorResponse
from app.services.providers.economic import EconomicDataProvider, get_economic_provider

router = APIRouter()


def economic_provider(settings: Settings = Depends(get_settings)) -> EconomicDataProvider:
    return get_economic_provider(settings)


@router.get("/indicators", response_model=list[IndicatorResponse])
def list_indicators(provider: EconomicDataProvider = Depends(economic_provider)) -> list[IndicatorResponse]:
    return provider.list_indicators()


@router.get("/indicators/{indicator_id}", response_model=IndicatorResponse)
def get_indicator(indicator_id: str, provider: EconomicDataProvider = Depends(economic_provider)) -> IndicatorResponse:
    try:
        return provider.get_indicator(indicator_id)
    except ProviderError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
