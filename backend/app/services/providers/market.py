from __future__ import annotations

import json
from abc import ABC, abstractmethod
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

from app.core.config import Settings
from app.core.exceptions import ProviderError
from app.schemas.common import SourceMeta
from app.schemas.markets import (
    CompanyComparisonRow,
    CompanyHistoryResponse,
    CompanyMetricSeriesPoint,
    CompanyOverview,
    PricePoint,
)

DATA_PATH = Path(__file__).resolve().parents[4] / "data" / "sample" / "market_demo.json"


class MarketDataProvider(ABC):
    @abstractmethod
    def list_symbols(self) -> list[str]: ...

    @abstractmethod
    def get_company(self, symbol: str) -> CompanyOverview: ...

    @abstractmethod
    def get_history(self, symbol: str) -> CompanyHistoryResponse: ...

    def compare_companies(self, symbols: list[str]) -> list[CompanyComparisonRow]:
        companies = [self.get_company(symbol) for symbol in symbols]
        metrics = [
            ("Latest price", "latest_price"),
            ("Market cap", "market_cap"),
            ("Revenue", "revenue"),
            ("EPS", "eps"),
            ("P/E", "pe_ratio"),
            ("P/B", "pb_ratio"),
            ("ROE", "roe"),
            ("Debt", "debt"),
            ("Cash", "cash"),
            ("Profit margin", "profit_margin"),
            ("Revenue growth", "revenue_growth"),
            ("Earnings growth", "earnings_growth"),
        ]
        return [
            CompanyComparisonRow(
                metric=label, values={company.symbol: getattr(company, field) for company in companies}
            )
            for label, field in metrics
        ]


class DemoMarketProvider(MarketDataProvider):
    def __init__(self) -> None:
        self.payload = json.loads(DATA_PATH.read_text())

    def list_symbols(self) -> list[str]:
        return sorted(self.payload.keys())

    def _get_payload(self, symbol: str) -> dict:
        try:
            return self.payload[symbol.upper()]
        except KeyError as exc:
            raise ProviderError(f"Unsupported demo symbol: {symbol}") from exc

    def get_company(self, symbol: str) -> CompanyOverview:
        item = self._get_payload(symbol)
        fundamentals = item["fundamentals"]
        return CompanyOverview(
            symbol=symbol.upper(),
            name=item["name"],
            sector=item["sector"],
            exchange=item["exchange"],
            currency=item["currency"],
            latest_price=item.get("latest_price"),
            market_cap=fundamentals.get("market_cap"),
            revenue=fundamentals.get("revenue"),
            eps=fundamentals.get("eps"),
            pe_ratio=fundamentals.get("pe_ratio"),
            pb_ratio=fundamentals.get("pb_ratio"),
            roe=fundamentals.get("roe"),
            debt=fundamentals.get("debt"),
            cash=fundamentals.get("cash"),
            profit_margin=fundamentals.get("profit_margin"),
            revenue_growth=fundamentals.get("revenue_growth"),
            earnings_growth=fundamentals.get("earnings_growth"),
            metrics_series=[CompanyMetricSeriesPoint(**point) for point in item["revenue_series"]],
            source=SourceMeta(
                name="FinSight demo market dataset",
                data_date=fundamentals.get("as_of_date"),
                is_demo=True,
                note=item.get("source_note"),
            ),
        )

    def get_history(self, symbol: str) -> CompanyHistoryResponse:
        item = self._get_payload(symbol)
        return CompanyHistoryResponse(
            symbol=symbol.upper(),
            history=[PricePoint(**point) for point in item["history"]],
            source=SourceMeta(
                name="Yahoo Finance chart snapshot bundled with FinSight demo",
                is_demo=True,
                note=item.get("source_note"),
            ),
        )


class YahooChartMarketProvider(DemoMarketProvider):
    def _fetch_chart(self, symbol: str) -> dict:
        safe_symbol = quote(symbol.upper())
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{safe_symbol}?interval=1mo&range=5y&includePrePost=false"
        req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
        try:
            payload = json.loads(urlopen(req, timeout=30).read().decode())
            return payload["chart"]["result"][0]
        except Exception as exc:
            raise ProviderError("Failed to retrieve market price history from Yahoo chart endpoint.") from exc

    def get_company(self, symbol: str) -> CompanyOverview:
        company = super().get_company(symbol)
        chart = self._fetch_chart(symbol)
        company.latest_price = chart.get("meta", {}).get("regularMarketPrice", company.latest_price)
        company.exchange = chart.get("meta", {}).get("fullExchangeName", company.exchange)
        company.currency = chart.get("meta", {}).get("currency", company.currency)
        company.source = SourceMeta(
            name="Yahoo Finance chart endpoint + FinSight demo fundamentals",
            url="https://finance.yahoo.com",
            is_demo=False,
            note="Price history is fetched live without an API key. Fundamental fields remain demo unless another provider is added.",
        )
        return company

    def get_history(self, symbol: str) -> CompanyHistoryResponse:
        chart = self._fetch_chart(symbol)
        closes = chart["indicators"]["quote"][0]["close"]
        history = [
            PricePoint(date=__import__("datetime").date.fromtimestamp(ts).isoformat(), close=round(close, 2))
            for ts, close in zip(chart["timestamp"], closes, strict=False)
            if close is not None
        ]
        return CompanyHistoryResponse(
            symbol=symbol.upper(),
            history=history,
            source=SourceMeta(
                name="Yahoo Finance chart endpoint",
                url="https://finance.yahoo.com",
                is_demo=False,
            ),
        )


def get_market_provider(settings: Settings) -> MarketDataProvider:
    if settings.market_provider == "yahoo":
        return YahooChartMarketProvider()
    return DemoMarketProvider()
