import { useMemo, useState } from "react";

import { BarTrendChart } from "../charts/BarTrendChart";
import { LineTrendChart } from "../charts/LineTrendChart";
import { ChartCard } from "../components/ChartCard";
import { DemoBadge } from "../components/DemoBadge";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { SectionHeading } from "../components/SectionHeading";
import { SourceNote } from "../components/SourceNote";
import { StatCard } from "../components/StatCard";
import { useAsyncData } from "../hooks/useAsyncData";
import { api } from "../services/api";
import {
  formatCompactCurrency,
  formatNumber,
  formatPercent,
} from "../utils/format";

const defaultSymbols = ["AAPL", "MSFT", "INFY.NS"];

export function MarketsPage() {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const companies = useAsyncData(api.listCompanies);
  const overview = useAsyncData(() => api.companyOverview(selectedSymbol), {
    deps: [selectedSymbol],
  });
  const history = useAsyncData(() => api.companyHistory(selectedSymbol), {
    deps: [selectedSymbol],
  });
  const comparison = useAsyncData(() => api.compareCompanies(defaultSymbols));

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          eyebrow="Markets"
          title="Company analysis"
          description="A straightforward view of price history, basic fundamentals, and comparison data. Data sources remain visible so demo values are never mistaken for live advisory data."
        />
        <div className="flex items-center gap-3">
          {overview.data?.source.is_demo ? <DemoBadge /> : null}
          <select
            value={selectedSymbol}
            onChange={(event) => setSelectedSymbol(event.target.value)}
            className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-300"
            aria-label="Select company"
          >
            {(companies.data?.symbols ?? defaultSymbols).map((symbol) => (
              <option key={symbol} value={symbol}>
                {symbol}
              </option>
            ))}
          </select>
        </div>
      </div>

      {companies.error ? (
        <ErrorState message={companies.error} onRetry={companies.reload} />
      ) : null}
      {overview.error ? (
        <ErrorState message={overview.error} onRetry={overview.reload} />
      ) : null}
      {history.error ? (
        <ErrorState message={history.error} onRetry={history.reload} />
      ) : null}

      {overview.loading && !overview.data ? (
        <LoadingState label="Loading company summary…" />
      ) : null}

      {overview.data ? (
        <>
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {overview.data.exchange}
                </p>
                <h3 className="mt-1 text-3xl font-semibold text-slate-900">
                  {overview.data.name}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {overview.data.symbol} · {overview.data.sector}
                </p>
              </div>
              <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Latest price
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {formatCompactCurrency(
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
              />
              <StatCard
                label="Revenue"
                value={formatCompactCurrency(
                  overview.data.revenue,
                  overview.data.currency,
                )}
              />
              <StatCard label="EPS" value={formatNumber(overview.data.eps)} />
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
              subtitle="Monthly closes from the selected provider."
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
              subtitle="Revenue shown in billions for easier reading."
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
              subtitle="Useful for reviewing earnings progress over time."
            >
              <LineTrendChart
                data={epsChart}
                xKey="year"
                yKey="eps"
                color="#ea580c"
              />
            </ChartCard>
            <div className="space-y-4">
              <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">
                  Metric notes
                </h3>
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
                </div>
              </section>
              <SourceNote source={overview.data.source} />
            </div>
          </div>
        </>
      ) : null}

      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">
            Comparison table
          </h3>
          <p className="text-sm text-slate-600">
            Side-by-side demo comparison for the default watchlist.
          </p>
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
                  {defaultSymbols.map((symbol) => (
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
                    {defaultSymbols.map((symbol, index) => (
                      <td
                        key={symbol}
                        className={`border-y border-slate-200 px-4 py-3 text-slate-600 ${
                          index === defaultSymbols.length - 1
                            ? "rounded-r-2xl border-r"
                            : ""
                        }`}
                      >
                        {typeof row.values[symbol] === "number"
                          ? formatNumber(row.values[symbol])
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
