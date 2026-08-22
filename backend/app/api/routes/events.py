from __future__ import annotations

import json
from datetime import date
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException

from app.analytics.metrics import volatility
from app.api.routes.economics import economic_provider
from app.core.exceptions import ProviderError
from app.schemas.common import SourceMeta
from app.schemas.economics import EconomicEvent, EventAnalysisResponse, IndicatorPoint
from app.services.providers.economic import EconomicDataProvider

router = APIRouter()
EVENTS_PATH = Path(__file__).resolve().parents[4] / "data" / "sample" / "economic_events.json"
NIFTY_PATH = Path(__file__).resolve().parents[4] / "data" / "sample" / "nifty50_history_demo.json"


def _load_events() -> list[EconomicEvent]:
    return [EconomicEvent(**item) for item in json.loads(EVENTS_PATH.read_text())]


@router.get("", response_model=list[EconomicEvent])
def list_events() -> list[EconomicEvent]:
    return _load_events()


@router.get("/{event_id}", response_model=EconomicEvent)
def get_event(event_id: str) -> EconomicEvent:
    for event in _load_events():
        if event.id == event_id:
            return event
    raise HTTPException(status_code=404, detail="Unknown event identifier.")


@router.post("/analyze/{event_id}", response_model=EventAnalysisResponse)
def analyze_event(event_id: str, provider: EconomicDataProvider = Depends(economic_provider)) -> EventAnalysisResponse:
    event = get_event(event_id)
    market_payload = json.loads(NIFTY_PATH.read_text())
    series = [IndicatorPoint(date=item["date"], value=item["close"]) for item in market_payload["history"]]
    start = date.fromisoformat(event.date_range[0])
    end = date.fromisoformat(event.date_range[1])
    before = [point for point in series if date.fromisoformat(point.date) < start][-6:]
    during = [point for point in series if start <= date.fromisoformat(point.date) <= end]
    recovery = [point for point in series if date.fromisoformat(point.date) > end][:6]

    def period_return(points: list[IndicatorPoint]) -> float | None:
        if len(points) < 2 or points[0].value == 0:
            return None
        return round((points[-1].value / points[0].value) - 1, 4)

    def period_vol(points: list[IndicatorPoint]) -> float | None:
        if len(points) < 2:
            return None
        returns = [(points[i].value / points[i - 1].value) - 1 for i in range(1, len(points)) if points[i - 1].value]
        return round(volatility(returns) or 0.0, 4)

    snapshots: dict[str, dict[str, float | None]] = {}
    for indicator_id in event.relevant_indicators:
        try:
            indicator = provider.get_indicator(indicator_id)
        except ProviderError:
            continue
        before_value = next((p.value for p in reversed(indicator.series) if int(p.date) <= start.year - 1), None)
        during_value = next((p.value for p in indicator.series if int(p.date) >= start.year), None)
        after_value = next(
            (p.value for p in indicator.series if int(p.date) >= min(end.year + 1, int(indicator.series[-1].date))),
            None,
        )
        snapshots[indicator_id] = {
            "before": before_value,
            "during_or_latest": during_value,
            "after_or_recent": after_value,
        }

    return EventAnalysisResponse(
        event=event,
        before_period_return=period_return(before),
        during_period_return=period_return(during),
        recovery_period_return=period_return(recovery),
        volatility_change=(
            None
            if period_vol(during) is None or period_vol(before) is None
            else round((period_vol(during) or 0) - (period_vol(before) or 0), 4)
        ),
        market_series=before + during + recovery,
        indicator_snapshots=snapshots,
        source=SourceMeta(
            name="NIFTY 50 demo history + selected macro indicators",
            is_demo=True,
            note="Event analysis shows associations over chosen windows and does not prove causality.",
        ),
    )
