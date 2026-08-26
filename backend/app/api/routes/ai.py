from __future__ import annotations

import json
from urllib.request import Request, urlopen

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.ai.provider import AIProvider, get_ai_provider
from app.api.routes.economics import economic_provider
from app.api.routes.events import get_event
from app.api.routes.finance import get_finance_summary
from app.api.routes.markets import market_provider
from app.core.config import Settings, get_settings
from app.core.database import get_db
from app.core.exceptions import ProviderError
from app.schemas.ai import AIAnalysisRequest, AIAnalysisResponse
from app.services.providers.economic import EconomicDataProvider
from app.services.providers.market import MarketDataProvider

router = APIRouter()

QUESTION_KEYWORDS = {
    "gdp": "gdp_growth",
    "growth": "gdp_growth",
    "inflation": "cpi_inflation",
    "cpi": "cpi_inflation",
    "unemployment": "unemployment",
    "jobs": "unemployment",
    "fdi": "fdi_gdp",
    "exports": "exports_gdp",
    "imports": "imports_gdp",
    "government spending": "gov_spending_gdp",
    "fiscal": "gov_spending_gdp",
    "exchange": "exchange_rate",
    "rupee": "exchange_rate",
    "interest": "lending_rate",
    "repo": "lending_rate",
    "manufacturing": "manufacturing_share",
}


def ai_provider(settings: Settings = Depends(get_settings)) -> AIProvider:
    return get_ai_provider(settings)


def _infer_indicator_id(question: str) -> str | None:
    lower_question = question.lower()
    for keyword, indicator_id in QUESTION_KEYWORDS.items():
        if keyword in lower_question:
            return indicator_id
    return None


def _fetch_brent_crude_snapshot() -> tuple[float | None, str | None]:
    request = Request(
        "https://query1.finance.yahoo.com/v8/finance/chart/BZ=F?interval=1d&range=1mo",
        headers={"User-Agent": "Mozilla/5.0"},
    )
    try:
        payload = json.loads(urlopen(request, timeout=20).read().decode())
        result = payload["chart"]["result"][0]
        price = result["meta"].get("regularMarketPrice")
        timestamp = result["meta"].get("regularMarketTime")
        if price is None or timestamp is None:
            return None, None
        as_of = __import__("datetime").datetime.fromtimestamp(timestamp).date().isoformat()
        return float(price), as_of
    except Exception:  # pragma: no cover
        return None, None


@router.post("/analyze", response_model=AIAnalysisResponse)
def analyze_with_ai(
    payload: AIAnalysisRequest,
    ai: AIProvider = Depends(ai_provider),
    market: MarketDataProvider = Depends(market_provider),
    economics: EconomicDataProvider = Depends(economic_provider),
    db: Session = Depends(get_db),
) -> AIAnalysisResponse:
    references: list[str] = []
    context_parts: list[str] = []
    question = payload.question.strip()
    lower_question = question.lower()

    try:
        if payload.domain == "markets":
            symbol = payload.symbol or "AAPL"
            company = market.get_company(symbol)
            context_parts.append(
                f"{company.name} latest price is {company.latest_price} {company.currency}. Market cap is {company.market_cap}. Revenue is {company.revenue}. EPS is {company.eps}. Revenue growth is {company.revenue_growth}. Earnings growth is {company.earnings_growth}. Profit margin is {company.profit_margin}."
            )
            references.append(f"Market data: {company.source.name}")
        elif payload.domain == "economics":
            if any(keyword in lower_question for keyword in ["oil", "crude", "petrol", "diesel"]):
                oil_price, as_of = _fetch_brent_crude_snapshot()
                if oil_price is not None and as_of is not None:
                    context_parts.append(
                        f"FinSight currently tracks Brent crude as a global oil benchmark. The latest available Brent crude price is {oil_price} USD per barrel as of {as_of}. FinSight does not currently store city-level India petrol or diesel retail prices, so any answer should clearly distinguish global crude benchmarks from Indian retail fuel prices."
                    )
                    references.append("Commodity proxy: Yahoo Finance Brent crude futures (BZ=F)")
                else:
                    context_parts.append(
                        "FinSight does not currently have a verified live oil-price value available for this request. The app should say that India retail petrol and diesel prices are not stored in the current economics dataset instead of guessing."
                    )
            indicator_id = payload.indicator_id or _infer_indicator_id(question)
            if indicator_id is not None:
                indicator = economics.get_indicator(indicator_id)
                context_parts.append(
                    f"{indicator.label} for {indicator.country} is {indicator.latest_value} {indicator.units} as of {indicator.latest_date}. Frequency: {indicator.frequency}."
                )
                references.append(f"Economic data: {indicator.source.name}")
            if not context_parts:
                available = ", ".join(sorted(indicator.id for indicator in economics.list_indicators()))
                context_parts.append(
                    f"No exact dataset match was identified for this economics question. Available indicator ids are: {available}. The answer should say when the requested data is not available instead of guessing."
                )
        elif payload.domain == "finance":
            summary = get_finance_summary(db)
            context_parts.append(
                f"Total income is {summary.total_income}. Total expenses are {summary.total_expenses}. Net savings are {summary.net_savings}. Savings rate is {summary.savings_rate}. Spending trend is {summary.spending_trend}. Transaction count is {summary.transaction_count}."
            )
            references.append(f"Finance data: {summary.source.name}")
        elif payload.domain == "events":
            event = get_event(payload.event_id or "covid-19-shock-2020")
            context_parts.append(
                f"Event {event.title} spans {event.date_range[0]} to {event.date_range[1]}. {event.summary} Relevant indicators: {', '.join(event.relevant_indicators)}."
            )
            references.append("Curated event notes")
        else:
            context_parts.append(
                "Answer only from verified FinSight data. If the requested fact is unavailable, say that clearly and suggest a relevant module instead of guessing."
            )

        return ai.analyze(question, " ".join(context_parts), references)
    except ProviderError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
