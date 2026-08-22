import {
  Activity,
  ArrowRight,
  Banknote,
  BriefcaseBusiness,
  ChartCandlestick,
  Landmark,
  Sparkles,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import { AreaTrendChart } from "../charts/AreaTrendChart";
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

const workspaceLinks = [
  {
    to: "/finance",
    title: "Personal finance",
    text: "Upload a CSV or manually add transactions without leaving the dashboard experience.",
    icon: BriefcaseBusiness,
  },
  {
    to: "/markets",
    title: "Market analysis",
    text: "Compare companies, price history, and growth metrics in a dedicated analyst view.",
    icon: ChartCandlestick,
  },
  {
    to: "/economics",
    title: "Economic dashboard",
    text: "Monitor inflation, GDP growth, exchange rates, and other India-focused macro signals.",
    icon: Landmark,
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
  const gdpGrowth = useMemo(
    () => indicators.data?.find((item) => item.id === "gdp_growth"),
    [indicators.data],
  );
  const latestMonthlyWindow = useMemo(
    () => finance.data?.monthly.slice(-8) ?? [],
    [finance.data],
  );
  const categoryHighlights = useMemo(
    () =>
      finance.data?.categories.slice(0, 6).map((item) => ({
        category: item.category,
        amount: item.amount,
      })) ?? [],
    [finance.data],
  );
  const inflationTrend = useMemo(
    () => inflation?.series.slice(-10) ?? [],
    [inflation],
  );
  const revenueTrend = useMemo(
    () =>
      markets.data?.metrics_series.map((point) => ({
        year: point.year,
        revenue: point.revenue / 1_000_000_000,
      })) ?? [],
    [markets.data],
  );

  const hasError = finance.error || markets.error || indicators.error;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          eyebrow="Dashboard"
          title="See the full FinSight workspace at a glance"
          description="The main dashboard now keeps your core analytics front and center, while navigation remains anchored in the sidebar for faster movement between tools."
        />
        <DemoBadge />
      </div>

      {finance.loading || markets.loading || indicators.loading ? (
        <LoadingState label="Loading your analytics workspace…" />
      ) : null}

      {hasError ? (
        <div className="grid gap-4">
          {finance.error ? (
            <ErrorState message={finance.error} onRetry={finance.reload} />
          ) : null}
          {markets.error ? (
            <ErrorState message={markets.error} onRetry={markets.reload} />
          ) : null}
          {indicators.error ? (
            <ErrorState
              message={indicators.error}
              onRetry={indicators.reload}
            />
          ) : null}
        </div>
      ) : null}

      {finance.data && markets.data && inflation && gdpGrowth ? (
        <>
          <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.35fr)_380px]">
            <section className="rounded-[32px] border border-white/8 bg-gradient-to-br from-brand-500/12 via-slate-900/85 to-slate-950 p-6 shadow-card lg:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <DemoBadge label="Main dashboard" />
                    <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                      Main page stays visible beside the sidebar
                    </span>
                  </div>
                  <h3 className="text-3xl font-semibold tracking-tight text-white">
                    A cleaner control room for personal finance, markets, and
                    macro trends.
                  </h3>
                  <p className="text-sm leading-7 text-slate-300 md:text-base">
                    Jump to modules from the left sidebar, or stay here for a
                    high-level snapshot of savings, market pricing, and India’s
                    macro backdrop.
                  </p>
                </div>
                <div className="rounded-3xl border border-white/8 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Active sources
                  </p>
                  <p className="mt-2">
                    Demo transactions · Demo market snapshot · World Bank macro
                    snapshot
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Savings rate"
                  value={formatPercent(finance.data.savings_rate)}
                  hint="Calculated from the current finance dataset."
                  icon={<Banknote className="h-5 w-5" />}
                />
                <StatCard
                  label="Apple latest price"
                  value={`${markets.data.latest_price?.toFixed(2) ?? "—"} ${markets.data.currency}`}
                  hint="Provider-driven market snapshot."
                  icon={<Activity className="h-5 w-5" />}
                />
                <StatCard
                  label="India CPI inflation"
                  value={formatPercent((inflation.latest_value ?? 0) / 100)}
                  hint={`Latest year: ${inflation.latest_date ?? "—"}`}
                  icon={<Landmark className="h-5 w-5" />}
                />
                <StatCard
                  label="Net savings"
                  value={formatCompactCurrency(finance.data.net_savings, "INR")}
                  hint="Income minus expenses across the selected data."
                  icon={<Sparkles className="h-5 w-5" />}
                />
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
                <ChartCard
                  title="Monthly net savings"
                  subtitle="A fast visual read of whether cash-flow health is improving or weakening."
                >
                  <AreaTrendChart
                    data={latestMonthlyWindow}
                    xKey="month"
                    yKey="net_savings"
                    color="#22c55e"
                  />
                </ChartCard>

                <div className="space-y-4">
                  {workspaceLinks.map(({ to, title, text, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      className="block rounded-3xl border border-white/8 bg-slate-950/60 p-5 transition hover:border-brand-400/35 hover:bg-slate-950"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="inline-flex rounded-2xl bg-brand-500/10 p-3 text-brand-200">
                            <Icon className="h-5 w-5" />
                          </div>
                          <h4 className="mt-4 text-lg font-semibold text-white">
                            {title}
                          </h4>
                          <p className="mt-2 text-sm leading-7 text-slate-400">
                            {text}
                          </p>
                        </div>
                        <ArrowRight className="mt-1 h-5 w-5 text-slate-500" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            <div className="space-y-4 2xl:sticky 2xl:top-24 2xl:self-start">
              <section className="rounded-3xl border border-white/8 bg-slate-900/75 p-5 shadow-card">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Quick read
                </p>
                <div className="mt-4 space-y-4 text-sm text-slate-300">
                  <div className="rounded-2xl border border-white/8 bg-slate-950/60 p-4">
                    <p className="text-slate-400">Transactions analyzed</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {formatNumber(finance.data.transaction_count, 0)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-slate-950/60 p-4">
                    <p className="text-slate-400">Top expense category</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {finance.data.categories[0]?.category ?? "—"}
                    </p>
                    <p className="mt-1 text-slate-400">
                      {formatCompactCurrency(
                        finance.data.categories[0]?.amount,
                        "INR",
                      )}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-slate-950/60 p-4">
                    <p className="text-slate-400">GDP growth snapshot</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {formatNumber(gdpGrowth.latest_value)}
                    </p>
                    <p className="mt-1 text-slate-400">
                      {gdpGrowth.units} · {gdpGrowth.latest_date}
                    </p>
                  </div>
                </div>
              </section>

              <SourceNote source={finance.data.source} />
              <SourceNote source={markets.data.source} />
              <SourceNote source={inflation.source} />
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <ChartCard
              title="Expense concentration"
              subtitle="Which categories dominate the current personal-finance dataset?"
            >
              <BarTrendChart
                data={categoryHighlights}
                xKey="category"
                yKey="amount"
                color="#38bdf8"
              />
            </ChartCard>
            <ChartCard
              title="Inflation trend"
              subtitle="Recent annual CPI inflation values from the selected economics provider."
            >
              <LineTrendChart
                data={inflationTrend}
                xKey="date"
                yKey="value"
                color="#f97316"
              />
            </ChartCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <ChartCard
              title="Revenue trend for Apple"
              subtitle="Revenue values shown in billions and paired with the current market overview module."
            >
              <BarTrendChart
                data={revenueTrend}
                xKey="year"
                yKey="revenue"
                color="#8b5cf6"
              />
            </ChartCard>
            <section className="rounded-3xl border border-white/8 bg-slate-900/75 p-6 shadow-card">
              <h3 className="text-lg font-semibold text-white">
                Why this layout is better
              </h3>
              <div className="mt-4 grid gap-3 text-sm leading-7 text-slate-400">
                <div className="rounded-2xl border border-white/8 bg-slate-950/60 p-4">
                  <p className="font-medium text-slate-100">
                    Sidebar-first navigation
                  </p>
                  <p className="mt-2">
                    All major tools stay anchored on the left so the dashboard
                    itself remains the main canvas instead of appearing below
                    other controls.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-slate-950/60 p-4">
                  <p className="font-medium text-slate-100">
                    Primary content stays front and center
                  </p>
                  <p className="mt-2">
                    The large control-room panel surfaces the main page at the
                    top, while smaller widgets act as supporting context.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-slate-950/60 p-4">
                  <p className="font-medium text-slate-100">
                    Faster workflow for personal finance
                  </p>
                  <p className="mt-2">
                    The personal finance page now includes manual transaction
                    entry alongside CSV upload, so you can type values directly
                    instead of depending only on a file.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
