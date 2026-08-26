import { Activity, Banknote, Landmark, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import { AreaTrendChart } from "../charts/AreaTrendChart";
import { BarTrendChart } from "../charts/BarTrendChart";
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

const quickLinks = [
  {
    to: "/finance",
    label: "Open ledger",
    helper: "Add or upload transactions",
  },
  {
    to: "/markets",
    label: "Open markets",
    helper: "Company snapshots & comparison",
  },
  {
    to: "/economics",
    label: "Open economics",
    helper: "Inflation, GDP, exchange rate",
  },
];

export function DashboardHome() {
  const finance = useAsyncData(api.financeSummary);
  const markets = useAsyncData(() => api.companyOverview("AAPL"));
  const indicators = useAsyncData(api.indicators);

  const inflation = useMemo(
    () => indicators.data?.find((item) => item.id === "cpi_inflation"),
    [indicators.data],
  );
  const gdp = useMemo(
    () => indicators.data?.find((item) => item.id === "gdp_growth"),
    [indicators.data],
  );
  const categories = useMemo(
    () =>
      finance.data?.categories.slice(0, 5).map((item) => ({
        category: item.category,
        amount: item.amount,
      })) ?? [],
    [finance.data],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          eyebrow="Dashboard"
          title="Business snapshot"
          description="A cleaner, ledger-style overview with navigation kept in the sidebar and the main workspace visible at the top."
        />
        <DemoBadge
          label={
            finance.data?.source.is_demo
              ? "Sample workspace"
              : "Live ledger workspace"
          }
        />
      </div>

      {finance.loading || markets.loading || indicators.loading ? (
        <LoadingState label="Loading dashboard…" />
      ) : null}
      {finance.error ? (
        <ErrorState message={finance.error} onRetry={finance.reload} />
      ) : null}
      {markets.error ? (
        <ErrorState message={markets.error} onRetry={markets.reload} />
      ) : null}
      {indicators.error ? (
        <ErrorState message={indicators.error} onRetry={indicators.reload} />
      ) : null}

      {finance.data && markets.data && inflation && gdp ? (
        <>
          <section className="app-card app-card-tilt rounded-[28px] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <DemoBadge
                    label={
                      finance.data.source.is_demo
                        ? "Current workspace"
                        : "Using your saved transactions"
                    }
                  />
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                    Main content fixed in the primary canvas
                  </span>
                </div>
                <h3 className="mt-4 text-3xl font-semibold text-slate-900">
                  See cash flow, market context, and macro signals in one place.
                </h3>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                  This layout is intentionally simpler and more practical — less
                  “AI showcase”, more working dashboard.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                {quickLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="app-subtle-panel rounded-[20px] px-4 py-3 text-sm transition hover:border-red-200 hover:bg-white/80"
                  >
                    <p className="font-medium text-slate-900">{item.label}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.helper}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Net savings"
                value={formatCompactCurrency(finance.data.net_savings, "INR")}
                hint="Income minus expenses"
                icon={<Banknote className="h-5 w-5" />}
              />
              <StatCard
                label="Savings rate"
                value={formatPercent(finance.data.savings_rate)}
                hint={`Trend: ${finance.data.spending_trend}`}
                icon={<Sparkles className="h-5 w-5" />}
              />
              <StatCard
                label="Apple price"
                value={`${markets.data.latest_price?.toFixed(2) ?? "—"} ${markets.data.currency}`}
                hint="Market module snapshot"
                icon={<Activity className="h-5 w-5" />}
              />
              <StatCard
                label="India CPI"
                value={formatPercent((inflation.latest_value ?? 0) / 100)}
                hint={`Latest: ${inflation.latest_date ?? "—"}`}
                icon={<Landmark className="h-5 w-5" />}
              />
            </div>
          </section>

          <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.35fr)_360px]">
            <div className="min-w-0 space-y-6">
              <ChartCard
                title="Monthly net savings"
                subtitle="Simple trend of how much is left after expenses each month."
              >
                <AreaTrendChart
                  data={finance.data.monthly}
                  xKey="month"
                  yKey="net_savings"
                  color="#16a34a"
                />
              </ChartCard>

              <div className="grid gap-6 xl:grid-cols-2">
                <ChartCard
                  title="Expense by category"
                  subtitle="Top categories from the current finance dataset."
                >
                  <BarTrendChart
                    data={categories}
                    xKey="category"
                    yKey="amount"
                    color="#2563eb"
                  />
                </ChartCard>
                <section className="app-card app-card-tilt rounded-[24px] p-5">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Quick summary
                  </h3>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-slate-500">Transactions analyzed</p>
                      <p className="mt-1 text-2xl font-semibold text-slate-900">
                        {formatNumber(finance.data.transaction_count, 0)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-slate-500">Top spending head</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {finance.data.categories[0]?.category ?? "—"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-slate-500">GDP growth</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {formatNumber(gdp.latest_value)} {gdp.units}
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="space-y-4 2xl:sticky 2xl:top-24 2xl:self-start">
              <SourceNote source={finance.data.source} />
              <SourceNote source={markets.data.source} />
              <SourceNote source={inflation.source} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
