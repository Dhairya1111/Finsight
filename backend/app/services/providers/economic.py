from __future__ import annotations

import json
from abc import ABC, abstractmethod
from pathlib import Path
from urllib.request import urlopen

from app.core.config import Settings
from app.core.exceptions import ProviderError
from app.schemas.common import SourceMeta
from app.schemas.economics import IndicatorPoint, IndicatorResponse

DATA_PATH = Path(__file__).resolve().parents[4] / "data" / "sample" / "economic_indicators_india.json"


class EconomicDataProvider(ABC):
    @abstractmethod
    def list_indicators(self) -> list[IndicatorResponse]: ...

    @abstractmethod
    def get_indicator(self, indicator_id: str) -> IndicatorResponse: ...


class DemoEconomicProvider(EconomicDataProvider):
    def __init__(self) -> None:
        self.payload = json.loads(DATA_PATH.read_text())

    def _build(self, record: dict, is_demo: bool = True) -> IndicatorResponse:
        series = [IndicatorPoint(**point) for point in record["series"]]
        latest = series[-1] if series else None
        return IndicatorResponse(
            id=record["id"],
            label=record["label"],
            units=record["units"],
            frequency=record["frequency"],
            country=record["country"],
            latest_value=latest.value if latest else None,
            latest_date=latest.date if latest else None,
            series=series,
            source=SourceMeta(
                name=record["source"],
                url=record.get("source_url"),
                last_updated=record.get("last_updated"),
                is_demo=is_demo,
                note="Bundled snapshot for offline/demo use." if is_demo else None,
            ),
        )

    def list_indicators(self) -> list[IndicatorResponse]:
        return [self._build(record) for record in self.payload.values()]

    def get_indicator(self, indicator_id: str) -> IndicatorResponse:
        try:
            return self._build(self.payload[indicator_id])
        except KeyError as exc:
            raise ProviderError(f"Unknown indicator: {indicator_id}") from exc


class WorldBankEconomicProvider(DemoEconomicProvider):
    def get_indicator(self, indicator_id: str) -> IndicatorResponse:
        try:
            record = self.payload[indicator_id]
        except KeyError as exc:
            raise ProviderError(f"Unknown indicator: {indicator_id}") from exc
        url = f"https://api.worldbank.org/v2/country/IND/indicator/{record['code']}?format=json&per_page=80"
        try:
            meta, entries = json.loads(urlopen(url, timeout=30).read().decode())
        except Exception as exc:
            raise ProviderError("Unable to fetch World Bank data.") from exc
        series = [
            IndicatorPoint(date=item["date"], value=float(item["value"]))
            for item in entries
            if item["value"] is not None
        ]
        series.sort(key=lambda point: point.date)
        latest = series[-1] if series else None
        return IndicatorResponse(
            id=record["id"],
            label=record["label"],
            units=record["units"],
            frequency=record["frequency"],
            country=record["country"],
            latest_value=latest.value if latest else None,
            latest_date=latest.date if latest else None,
            series=series,
            source=SourceMeta(
                name="World Bank Open Data",
                url=record.get("source_url"),
                last_updated=meta["lastupdated"],
                is_demo=False,
            ),
        )

    def list_indicators(self) -> list[IndicatorResponse]:
        return [self.get_indicator(key) for key in self.payload.keys()]


def get_economic_provider(settings: Settings) -> EconomicDataProvider:
    if settings.economic_provider == "world_bank":
        return WorldBankEconomicProvider()
    return DemoEconomicProvider()
