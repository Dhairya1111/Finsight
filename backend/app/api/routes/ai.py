from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.ai.provider import AIProvider, get_ai_provider
from app.api.routes.economics import economic_provider
from app.api.routes.events import get_event
from app.api.routes.finance import get_demo_finance_summary
from app.api.routes.markets import market_provider
from app.core.config import Settings, get_settings
from app.core.exceptions import ProviderError
from app.schemas.ai import AIAnalysisRequest, AIAnalysisResponse
from app.services.providers.economic import EconomicDataProvider
from app.services.providers.market import MarketDataProvider

router = APIRouter()


def ai_provider(settings: Settings = Depends(get_settings)) -> AIProvider:
    return get_ai_provider(settings)


@router.post("/analyze", response_model=AIAnalysisResponse)
def analyze_with_ai(
    payload: AIAnalysisRequest,
    ai: AIProvider = Depends(ai_provider),
    market: MarketDataProvider = Depends(market_provider),
    economics: EconomicDataProvider = Depends(economic_provider),
) -> AIAnalysisResponse:
    references: list[str] = []
    context_parts: list[str] = []
    try:
        if payload.domain == "markets" and payload.symbol:
            company = market.get_company(payload.symbol)
            context_parts.append(
                f"{company.name} latest price is {company.latest_price} {company.currency}. Revenue is {company.revenue}, EPS is {company.eps}, revenue growth is {company.revenue_growth}, and profit margin is {company.profit_margin}."
            )
            references.append(f"Market data: {company.source.name}")
        elif payload.domain == "economics" and payload.indicator_id:
            indicator = economics.get_indicator(payload.indicator_id)
            context_parts.append(
                f"{indicator.label} for {indicator.country} is {indicator.latest_value} {indicator.units} as of {indicator.latest_date}. Frequency: {indicator.frequency}."
            )
            references.append(f"Economic data: {indicator.source.name}")
        elif payload.domain == "finance":
            summary = get_demo_finance_summary()
            context_parts.append(
                f"Total income is {summary.total_income}, total expenses are {summary.total_expenses}, net savings are {summary.net_savings}, savings rate is {summary.savings_rate}, and spending trend is {summary.spending_trend}."
            )
            references.append("Demo finance dataset")
        elif payload.domain == "events" and payload.event_id:
            event = get_event(payload.event_id)
            context_parts.append(
                f"Event {event.title} spans {event.date_range[0]} to {event.date_range[1]}. {event.summary} Relevant indicators: {', '.join(event.relevant_indicators)}."
            )
            references.append("Curated event notes")
        else:
            context_parts.append(
                "General educational financial and economic analysis mode. Only verified in-app facts should be treated as evidence."
            )
        return ai.analyze(payload.question, " ".join(context_parts), references)
    except ProviderError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
