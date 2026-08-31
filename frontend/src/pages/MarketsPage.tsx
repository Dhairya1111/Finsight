import {
  Building2,
  PencilLine,
  Plus,
  Search,
  TrendingUp,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { BarTrendChart } from "../charts/BarTrendChart";
import { LineTrendChart } from "../charts/LineTrendChart";
import { ChartCard } from "../components/ChartCard";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { SectionHeading } from "../components/SectionHeading";
import { SourceNote } from "../components/SourceNote";
import { StatCard } from "../components/StatCard";
import { useAsyncData } from "../hooks/useAsyncData";
import { api } from "../services/api";
import type { CompanySearchResult } from "../types/api";
import {
  formatCompactCurrency,
  formatCompactNumber,
  formatNumber,
  formatPercent,
} from "../utils/format";
import {
  getSelectedMarketCompany,
  setSelectedMarketCompany,
} from "../utils/marketSelection";

const defaultComparisonSymbols = ["AAPL", "MSFT", "NVDA"];
const percentageMetrics = new Set([
  "ROE",
  "Profit margin",
  "Revenue growth",
  "Earnings growth",
]);
const ratioMetrics = new Set(["Latest price", "EPS", "P/E", "P/B"]);
const sizeMetrics = new Set(["Market cap", "Revenue", "Debt", "Cash"]);

function formatComparisonMetric(metric: string, value: number | null) {
  if (value === null) return "—";
  if (percentageMetrics.has(metric)) return formatPercent(value);
  if (sizeMetrics.has(metric)) return formatCompactNumber(value);
  if (ratioMetrics.has(metric)) return formatNumber(value);
  return Math.abs(value) >= 1000
    ? formatCompactNumber(value)
    : formatNumber(value);
}

export function MarketsPage() {
  const initialCompany = getSelectedMarketCompany();
  const [selectedSymbol, setSelectedSymbol] = useState(initialCompany.symbol);
  const [selectedCompanyName, setSelectedCompanyName] = useState(
    initialCompany.name,
  );
  const [searchQuery, setSearchQuery] = useState(
    initialCompany.name.replace(/ Inc\.$/, ""),
  );
  const [searchOpen, setSearchOpen] = useState(true);
  const [comparisonSymbols, setComparisonSymbols] = useState(
    defaultComparisonSymbols,
  );

  const companies = useAsyncData(api.listCompanies);
  const searchResults = useAsyncData(
    () =>
      searchOpen && searchQuery.trim().length >= 1
        ? api.searchCompanies(searchQuery)
        : Promise.resolve<CompanySearchResult[]>([]),
    { deps: [searchOpen, searchQuery] },
  );
  const overview = useAsyncData(() => api.companyOverview(selectedSymbol), {
    deps: [selectedSymbol],
  });
  const history = useAsyncData(() => api.companyHistory(selectedSymbol), {
    deps: [selectedSymbol],
  });
  const comparison = useAsyncData(
    () => api.compareCompanies(comparisonSymbols),
    { deps: [comparisonSymbols.join("|")] },
  );

  const revenueChart = useMemo(
    () =>
      overview.data?.metrics_series.map((item) => ({
        year: item.year,
        revenue: item.revenue / 1_000_000_000,
      })) ?? [],
    [overview.data],
  );

  const epsChart = useMemo(
    () =>
      overview.data?.metrics_series.map((item) => ({
        year: item.year,
        eps: item.eps,
      })) ?? [],
    [overview.data],
  );

  const searchSuggestions = useMemo(() => {
    const seen = new Set<string>();
    const liveResults = searchResults.data ?? [];
    const merged = [
      ...liveResults,
      ...(companies.data?.symbols ?? []).map((symbol) => ({
        symbol,
        name: symbol,
        exchange: "Popular",
        sector: null,
        industry: null,
      })),
    ];

    return merged.filter((item) => {
      if (seen.has(item.symbol)) return false;
      seen.add(item.symbol);
      return true;
    });
  }, [companies.data, searchResults.data]);

  const addSelectedToComparison = () => {
    setComparisonSymbols((current) => {
      if (current.includes(selectedSymbol)) return current;
      const next = [...current, selectedSymbol];
      return next.slice(-4);
    });
  };

  const removeComparisonSymbol = (symbol: string) => {
    setComparisonSymbols((current) =>
      current.filter((item) => item !== symbol),
    );
  };

  const handlePickCompany = (company: CompanySearchResult) => {
    setSelectedSymbol(company.symbol);
    setSelectedCompanyName(company.name);
    setSelectedMarketCompany({ symbol: company.symbol, name: company.name });
    setSearchQuery(company.name);
    setSearchOpen(false);
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Markets"
        title="Company analysis"
        description="Search for a listed company by name, pick the right symbol, and FinSight will load the current market data, financial metrics, and charts automatically."
      />

      <section className="app-card app-card-tilt rounded-[28px] p-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            {searchOpen ? (
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700">
                  Search company
                </label>
                <div className="relative mt-2">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Type Apple, Nvidia, Infosys, Reliance, Microsoft..."
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-slate-900 outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-100"
                  />
                </div>

                {searchQuery.trim().length >= 1 ? (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {searchResults.loading && !searchResults.data?.length ? (
                      <div className="px-4 py-4 text-sm text-slate-500">
                        Searching companies...
                      </div>
                    ) : searchSuggestions.length ? (
                      <div className="max-h-72 overflow-y-auto">
                        {searchSuggestions.map((company) => (
                          <button
                            key={company.symbol}
                            type="button"
                            onClick={() => handlePickCompany(company)}
                            className="flex w-full items-start justify-between gap-4 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50"
                          >
                            <span>
                              <span className="block font-medium text-slate-900">
                                {company.name}
                              </span>
                              <span className="mt-1 block text-xs text-slate-500">
                                {company.symbol} · {company.exchange}
                                {company.sector ? ` · ${company.sector}` : ""}
                              </span>
                            </span>
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                              {company.symbol}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-4 text-sm text-slate-500">
                        No listed company matches found.
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="app-subtle-panel rounded-[24px] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Selected company
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-sm font-semibold text-blue-900">
                    {selectedSymbol}
                  </span>
                  <span className="text-lg font-semibold text-slate-900">
                    {selectedCompanyName}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Search results are hidden after selection so you can focus on
                  the company view.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <PencilLine className="h-4 w-4" />
                  Change company
                </button>
              </div>
            )}
          </div>

          <div className="app-subtle-panel rounded-[24px] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Company action
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {selectedSymbol}
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              The selected company drives the current metrics, history, and
              charts. You can also add it to the comparison table below.
            </p>
            <button
              type="button"
              onClick={addSelectedToComparison}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-900 to-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(30,58,138,0.16)] transition hover:from-blue-700 hover:to-rose-500"
            >
              <Plus className="h-4 w-4" />
              Add to comparison
            </button>
          </div>
        </div>
      </section>

      {companies.error ? (
        <ErrorState message={companies.error} onRetry={companies.reload} />
      ) : null}
      {searchResults.error ? (
        <ErrorState
          message={searchResults.error}
          onRetry={searchResults.reload}
        />
      ) : null}
      {overview.error ? (
        <ErrorState message={overview.error} onRetry={overview.reload} />
      ) : null}
      {history.error ? (
        <ErrorState message={history.error} onRetry={history.reload} />
      ) : null}

      {overview.loading && !overview.data ? (
        <LoadingState label="Loading company data…" />
      ) : null}

      {overview.data ? (
        <>
          <section className="app-card app-card-tilt rounded-[28px] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                  <Building2 className="h-3.5 w-3.5" />
                  Live market data
                </div>
                <h3 className="mt-4 text-3xl font-semibold text-slate-900">
                  {overview.data.name}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {overview.data.symbol} · {overview.data.exchange} ·{" "}
                  {overview.data.sector}
                </p>
              </div>
              <div className="app-subtle-panel rounded-[20px] px-4 py-3 text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Latest price
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {formatCurrencyValue(
                    overview.data.latest_price,
                    overview.data.currency,
                  )}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Market cap"
                value={formatCompactCurrency(
                  overview.data.market_cap,
                  overview.data.currency,
                )}
                hint="Auto-fetched live"
              />
              <StatCard
                label="Revenue"
                value={formatCompactCurrency(
                  overview.data.revenue,
                  overview.data.currency,
                )}
                hint="Latest available annual total"
              />
              <StatCard
                label="EPS"
                value={formatNumber(overview.data.eps)}
                hint="Trailing or latest reported EPS"
              />
              <StatCard
                label="ROE"
                value={formatPercent(overview.data.roe)}
                hint={`P/E ${formatNumber(overview.data.pe_ratio)} · P/B ${formatNumber(overview.data.pb_ratio)}`}
              />
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <ChartCard
              title="Price history"
              subtitle="Monthly market closes loaded automatically for the selected company."
            >
              {history.loading && !history.data ? (
                <LoadingState label="Loading price history…" />
              ) : (
                <LineTrendChart
                  data={history.data?.history ?? []}
                  xKey="date"
                  yKey="close"
                  color="#2563eb"
                />
              )}
            </ChartCard>
            <ChartCard
              title="Revenue trend"
              subtitle="Annual total revenue in billions for easier comparison."
            >
              <BarTrendChart
                data={revenueChart}
                xKey="year"
                yKey="revenue"
                color="#16a34a"
              />
            </ChartCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <ChartCard
              title="EPS trend"
              subtitle="Latest reported annual EPS values for the selected company."
            >
              <LineTrendChart
                data={epsChart}
                xKey="year"
                yKey="eps"
                color="#ea580c"
              />
            </ChartCard>
            <div className="space-y-4">
              <section className="app-card app-card-tilt rounded-[24px] p-5">
                <div className="flex items-center gap-2 text-slate-900">
                  <TrendingUp className="h-4 w-4 text-red-700" />
                  <h3 className="text-lg font-semibold">Research snapshot</h3>
                </div>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-slate-500">Profit margin</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {formatPercent(overview.data.profit_margin)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-slate-500">Revenue growth</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {formatPercent(overview.data.revenue_growth)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-slate-500">Earnings growth</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {formatPercent(overview.data.earnings_growth)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-slate-500">
                      Previous close / price move
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {formatCurrencyValue(
                        overview.data.previous_close,
                        overview.data.currency,
                      )}
                      {overview.data.price_change !== null &&
                      overview.data.price_change !== undefined
                        ? ` · ${overview.data.price_change >= 0 ? "+" : ""}${formatCurrencyValue(
                            overview.data.price_change,
                            overview.data.currency,
                          )}`
                        : ""}
                    </p>
                    {overview.data.price_change_percent !== null &&
                    overview.data.price_change_percent !== undefined ? (
                      <p className="mt-1 text-xs text-slate-500">
                        {formatPercent(overview.data.price_change_percent)} from
                        previous close
                      </p>
                    ) : null}
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-slate-500">Cash / debt</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {formatCompactCurrency(
                        overview.data.cash,
                        overview.data.currency,
                      )}{" "}
                      cash ·{" "}
                      {formatCompactCurrency(
                        overview.data.debt,
                        overview.data.currency,
                      )}{" "}
                      debt
                    </p>
                  </div>
                </div>
              </section>
              <SourceNote source={overview.data.source} />
            </div>
          </div>
        </>
      ) : null}

      <section className="app-card app-card-tilt rounded-[24px] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Comparison table
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Add companies from the search flow to compare current live
              metrics.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {comparisonSymbols.map((symbol) => (
              <span
                key={symbol}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700"
              >
                {symbol}
                {comparisonSymbols.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeComparisonSymbol(symbol)}
                    className="rounded-full text-slate-400 transition hover:text-slate-700"
                    aria-label={`Remove ${symbol} from comparison`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </span>
            ))}
          </div>
        </div>

        {comparison.loading && !comparison.data ? (
          <div className="py-6 text-sm text-slate-500">Loading comparison…</div>
        ) : null}
        {comparison.error ? (
          <ErrorState message={comparison.error} onRetry={comparison.reload} />
        ) : null}

        {comparison.data ? (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="px-4 py-2 font-medium">Metric</th>
                  {comparisonSymbols.map((symbol) => (
                    <th
                      key={symbol}
                      className="px-4 py-2 font-medium text-slate-700"
                    >
                      {symbol}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.data.map((row) => (
                  <tr key={row.metric} className="bg-slate-50">
                    <td className="rounded-l-2xl border-y border-l border-slate-200 px-4 py-3 font-medium text-slate-800">
                      {row.metric}
                    </td>
                    {comparisonSymbols.map((symbol, index) => (
                      <td
                        key={symbol}
                        className={`border-y border-slate-200 px-4 py-3 text-slate-600 ${
                          index === comparisonSymbols.length - 1
                            ? "rounded-r-2xl border-r"
                            : ""
                        }`}
                      >
                        {typeof row.values[symbol] === "number"
                          ? formatComparisonMetric(
                              row.metric,
                              row.values[symbol],
                            )
                          : "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function formatCurrencyValue(
  value: number | null | undefined,
  currency: string,
) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}
