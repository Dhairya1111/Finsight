from __future__ import annotations

from abc import ABC, abstractmethod
from functools import lru_cache

import yfinance as yf

from app.core.config import Settings
from app.core.exceptions import ProviderError
from app.schemas.common import SourceMeta
from app.schemas.markets import (
    CompanyComparisonRow,
    CompanyHistoryResponse,
    CompanyMetricSeriesPoint,
    CompanyOverview,
    CompanySearchResult,
    PricePoint,
)

POPULAR_COMPANIES = [
    ("AAPL", "Apple Inc."),
    ("MSFT", "Microsoft Corporation"),
    ("NVDA", "NVIDIA Corporation"),
    ("GOOGL", "Alphabet Inc."),
    ("AMZN", "Amazon.com, Inc."),
    ("META", "Meta Platforms, Inc."),
    ("TSLA", "Tesla, Inc."),
    ("INFY.NS", "Infosys Limited"),
    ("TCS.NS", "Tata Consultancy Services Limited"),
    ("RELIANCE.NS", "Reliance Industries Limited"),
]
POPULAR_SYMBOLS = [symbol for symbol, _ in POPULAR_COMPANIES]


class MarketDataProvider(ABC):
    @abstractmethod
    def list_symbols(self) -> list[str]: ...

    @abstractmethod
    def search_companies(self, query: str, limit: int = 8) -> list[CompanySearchResult]: ...

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
                metric=label,
                values={company.symbol: getattr(company, field) for company in companies},
            )
            for label, field in metrics
        ]


class DemoMarketProvider(MarketDataProvider):
    def list_symbols(self) -> list[str]:
        return POPULAR_SYMBOLS

    def search_companies(self, query: str, limit: int = 8) -> list[CompanySearchResult]:
        del query
        return [
            CompanySearchResult(
                symbol=symbol,
                name=name,
                exchange="Market",
                sector=None,
                industry=None,
            )
            for symbol, name in POPULAR_COMPANIES[:limit]
        ]

    def get_company(self, symbol: str) -> CompanyOverview:
        raise ProviderError("Demo market provider is disabled for live company analysis.")

    def get_history(self, symbol: str) -> CompanyHistoryResponse:
        raise ProviderError("Demo market provider is disabled for live company analysis.")


class YahooFinanceMarketProvider(MarketDataProvider):
    def list_symbols(self) -> list[str]:
        return POPULAR_SYMBOLS

    def search_companies(self, query: str, limit: int = 8) -> list[CompanySearchResult]:
        trimmed = query.strip()
        if not trimmed:
            return [self._build_search_result(symbol, name) for symbol, name in POPULAR_COMPANIES[:limit]]

        results: list[CompanySearchResult] = []
        try:
            search = yf.Search(query=trimmed, max_results=limit)
            quotes = search.quotes or []
            for item in quotes:
                if item.get("quoteType") != "EQUITY":
                    continue
                symbol = item.get("symbol")
                name = item.get("longname") or item.get("shortname") or symbol
                if not symbol or not name:
                    continue
                results.append(
                    CompanySearchResult(
                        symbol=symbol,
                        name=name,
                        exchange=item.get("exchDisp") or item.get("exchange") or "Unknown",
                        sector=item.get("sectorDisp") or item.get("sector"),
                        industry=item.get("industryDisp") or item.get("industry"),
                    )
                )
        except Exception:
            results = []

        if results:
            return results[:limit]

        fallback_matches = [
            self._build_search_result(symbol, name)
            for symbol, name in POPULAR_COMPANIES
            if trimmed.lower() in symbol.lower() or trimmed.lower() in name.lower()
        ]
        if fallback_matches:
            return fallback_matches[:limit]

        return [self._build_search_result(symbol, name) for symbol, name in POPULAR_COMPANIES[:limit]]

    def get_company(self, symbol: str) -> CompanyOverview:
        info, income_stmt = self._load_company_data(symbol)
        metrics_series = self._build_metrics_series(income_stmt)

        name = info.get("longName") or info.get("shortName") or symbol.upper()
        sector = info.get("sectorDisp") or info.get("sector") or "Unspecified"
        exchange = info.get("fullExchangeName") or info.get("exchange") or "Unknown"
        currency = info.get("currency") or "USD"
        latest_price = info.get("currentPrice") or info.get("regularMarketPrice")
        market_cap = info.get("marketCap")
        revenue = info.get("totalRevenue") or self._latest_series_value(metrics_series, "revenue")
        eps = info.get("trailingEps") or self._latest_series_value(metrics_series, "eps")

        return CompanyOverview(
            symbol=symbol.upper(),
            name=name,
            sector=sector,
            exchange=exchange,
            currency=currency,
            latest_price=self._safe_float(latest_price),
            market_cap=self._safe_float(market_cap),
            revenue=self._safe_float(revenue),
            eps=self._safe_float(eps),
            pe_ratio=self._safe_float(info.get("trailingPE")),
            pb_ratio=self._safe_float(info.get("priceToBook")),
            roe=self._safe_float(info.get("returnOnEquity")),
            debt=self._safe_float(info.get("totalDebt")),
            cash=self._safe_float(info.get("totalCash")),
            profit_margin=self._safe_float(info.get("profitMargins")),
            revenue_growth=self._safe_float(info.get("revenueGrowth")),
            earnings_growth=self._safe_float(info.get("earningsGrowth")),
            metrics_series=metrics_series,
            source=SourceMeta(
                name="Yahoo Finance live market data",
                url="https://finance.yahoo.com",
                is_demo=False,
                note="Company metrics and price history are fetched live from Yahoo Finance through FinSight's provider layer.",
            ),
        )

    def get_history(self, symbol: str) -> CompanyHistoryResponse:
        ticker = yf.Ticker(symbol)
        try:
            history = ticker.history(period="5y", interval="1mo", auto_adjust=False)
        except Exception as exc:  # pragma: no cover
            raise ProviderError("Unable to retrieve company price history.") from exc
        if history.empty or "Close" not in history:
            raise ProviderError("No price history was returned for this company.")

        points = [
            PricePoint(date=index.date().isoformat(), close=round(float(row["Close"]), 2))
            for index, row in history.iterrows()
            if row.get("Close") is not None
        ]
        return CompanyHistoryResponse(
            symbol=symbol.upper(),
            history=points,
            source=SourceMeta(
                name="Yahoo Finance live price history",
                url="https://finance.yahoo.com",
                is_demo=False,
            ),
        )

    @staticmethod
    @lru_cache(maxsize=128)
    def _load_company_data(symbol: str):
        ticker = yf.Ticker(symbol)
        try:
            info = ticker.info
            income_stmt = ticker.income_stmt
        except Exception as exc:  # pragma: no cover
            raise ProviderError("Unable to load company fundamentals.") from exc
        if not info:
            raise ProviderError("No company data was returned for this symbol.")
        return info, income_stmt

    @staticmethod
    def _safe_float(value: object) -> float | None:
        if value is None:
            return None
        try:
            return float(value)
        except (TypeError, ValueError):
            return None

    @staticmethod
    def _latest_series_value(
        series: list[CompanyMetricSeriesPoint],
        field: str,
    ) -> float | None:
        if not series:
            return None
        return float(getattr(series[-1], field))

    @staticmethod
    def _metric_row(income_stmt, candidates: list[str]):
        if income_stmt is None or income_stmt.empty:
            return None
        for candidate in candidates:
            if candidate in income_stmt.index:
                return income_stmt.loc[candidate]
        return None

    def _build_metrics_series(self, income_stmt) -> list[CompanyMetricSeriesPoint]:
        if income_stmt is None or income_stmt.empty:
            return []

        revenue_row = self._metric_row(income_stmt, ["Total Revenue", "Operating Revenue"])
        eps_row = self._metric_row(income_stmt, ["Diluted EPS", "Basic EPS"])
        net_income_row = self._metric_row(
            income_stmt,
            [
                "Net Income Common Stockholders",
                "Net Income",
                "Net Income From Continuing Operation Net Minority Interest",
            ],
        )

        columns = sorted(income_stmt.columns)
        series: list[CompanyMetricSeriesPoint] = []
        for column in columns[-6:]:
            revenue = self._safe_float(revenue_row.get(column)) if revenue_row is not None else None
            eps = self._safe_float(eps_row.get(column)) if eps_row is not None else None
            net_income = self._safe_float(net_income_row.get(column)) if net_income_row is not None else None
            if revenue is None:
                continue
            profit_margin = 0.0
            if revenue and net_income is not None:
                profit_margin = net_income / revenue
            series.append(
                CompanyMetricSeriesPoint(
                    year=column.year,
                    revenue=revenue,
                    eps=eps or 0.0,
                    profit_margin=profit_margin,
                )
            )
        return series

    @staticmethod
    def _build_search_result(symbol: str, name: str) -> CompanySearchResult:
        return CompanySearchResult(
            symbol=symbol,
            name=name,
            exchange="Popular",
            sector=None,
            industry=None,
        )


def get_market_provider(settings: Settings) -> MarketDataProvider:
    if settings.market_provider == "demo":
        return DemoMarketProvider()
    return YahooFinanceMarketProvider()
