import { useEffect, useMemo, useState } from "react";

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
import {
  formatCompactCurrency,
  formatNumber,
  formatPercent,
} from "../utils/format";

const defaultSymbols = ["AAPL", "MSFT", "INFY.NS"];

export function MarketsPage() {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const companies = useAsyncData(api.listCompanies);
  const overview = useAsyncData(
    () => api.companyOverview(selectedSymbol),
    false,
  );
  const history = useAsyncData(() => api.companyHistory(selectedSymbol), false);
  const comparison = useAsyncData(() => api.compareCompanies(defaultSymbols));

  useEffect(() => {
    void overview.reload();
    void history.reload();
  }, [selectedSymbol, overview, history]);

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
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          eyebrow="Stock & company analyzer"
          title="Review price history, profitability trends, and valuation context"
          description="FinSight keeps live/demo data separate and labels sample fundamentals explicitly. Historical price series can be swapped through the market provider abstraction."
        />
        <select
          value={selectedSymbol}
          onChange={(event) => setSelectedSymbol(event.target.value)}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
          aria-label="Select company"
        >
          {(companies.data?.symbols ?? defaultSymbols).map((symbol) => (
            <option key={symbol} value={symbol}>
              {symbol}
            </option>
          ))}
        </select>
      </div>

      {(overview.loading || history.loading) && (
        <LoadingState label="Loading market data…" />
      )}
      {overview.error ? (
        <ErrorState message={overview.error} onRetry={overview.reload} />
      ) : null}
      {history.error ? (
        <ErrorState message={history.error} onRetry={history.reload} />
      ) : null}

      {overview.data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Latest price"
              value={formatCompactCurrency(
                overview.data.latest_price,
                overview.data.currency,
              )}
              hint={`${overview.data.symbol} · ${overview.data.exchange}`}
            />
            <StatCard
              label="Market cap"
              value={formatCompactCurrency(
                overview.data.market_cap,
                overview.data.currency,
              )}
            />
            <StatCard
              label="Revenue growth"
              value={formatPercent(overview.data.revenue_growth)}
            />
            <StatCard
              label="ROE"
              value={formatPercent(overview.data.roe)}
              hint={`P/E ${formatNumber(overview.data.pe_ratio)}`}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <ChartCard
              title="Historical price"
              subtitle="Monthly close series from the configured provider."
            >
              <LineTrendChart
                data={history.data?.history ?? []}
                xKey="date"
                yKey="close"
                color="#38bdf8"
              />
            </ChartCard>
            <ChartCard
              title="Revenue growth trend"
              subtitle="Demo fundamentals are bundled for offline exploration and clearly labeled."
            >
              <BarTrendChart
                data={revenueChart}
                xKey="year"
                yKey="revenue"
                color="#22c55e"
              />
            </ChartCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr,0.85fr]">
            <ChartCard
              title="EPS trajectory"
              subtitle="Useful for combining profitability and valuation narratives."
            >
              <LineTrendChart
                data={epsChart}
                xKey="year"
                yKey="eps"
                color="#f59e0b"
              />
            </ChartCard>
            <SourceNote source={overview.data.source} />
          </div>
        </>
      ) : null}

      <section className="rounded-3xl border border-white/8 bg-slate-900/75 p-5 shadow-card">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-white">Comparison table</h3>
          <p className="text-sm text-slate-400">
            Default demo basket: AAPL, MSFT, and INFY.NS.
          </p>
        </div>
        {comparison.loading ? (
          <div className="py-6 text-sm text-slate-400">Loading comparison…</div>
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
                      className="px-4 py-2 font-medium text-slate-300"
                    >
                      {symbol}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.data.map((row) => (
                  <tr key={row.metric} className="rounded-2xl bg-slate-950/60">
                    <td className="rounded-l-2xl px-4 py-3 text-slate-200">
                      {row.metric}
                    </td>
                    {defaultSymbols.map((symbol, index) => (
                      <td
                        key={symbol}
                        className={`${index === defaultSymbols.length - 1 ? "rounded-r-2xl" : ""} px-4 py-3 text-slate-400`}
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
