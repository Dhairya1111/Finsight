import { Activity, Banknote, Landmark, Sparkles } from "lucide-react";
import { useMemo } from "react";

import { AreaTrendChart } from "../charts/AreaTrendChart";
import { ChartCard } from "../components/ChartCard";
import { DemoBadge } from "../components/DemoBadge";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { SectionHeading } from "../components/SectionHeading";
import { SourceNote } from "../components/SourceNote";
import { StatCard } from "../components/StatCard";
import { useAsyncData } from "../hooks/useAsyncData";
import { api } from "../services/api";
import { formatCompactCurrency, formatPercent } from "../utils/format";

export function DashboardHome() {
  const finance = useAsyncData(api.financeSummary);
  const markets = useAsyncData(() => api.companyOverview("AAPL"));
  const indicators = useAsyncData(api.indicators);

  const inflation = useMemo(
    () => indicators.data?.find((item) => item.id === "cpi_inflation"),
    [indicators.data],
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          eyebrow="Dashboard"
          title="Welcome to FinSight"
          description="A polished sandbox for personal finance analytics, market intelligence, macroeconomic exploration, and AI-assisted explanations."
        />
        <DemoBadge />
      </div>

      {finance.loading || markets.loading || indicators.loading ? (
        <LoadingState label="Loading your analytics workspace…" />
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

      {finance.data && markets.data && inflation ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Savings rate"
              value={formatPercent(finance.data.savings_rate)}
              hint="Calculated from demo transaction data."
              icon={<Banknote className="h-5 w-5" />}
            />
            <StatCard
              label="Apple demo price"
              value={`${markets.data.latest_price?.toFixed(2) ?? "—"} ${markets.data.currency}`}
              hint="Latest price from the selected provider."
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
              hint="Income minus expenses across the sample period."
              icon={<Sparkles className="h-5 w-5" />}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.25fr,0.75fr]">
            <ChartCard
              title="Monthly net savings"
              subtitle="The bundled sample dataset makes the app useful immediately after clone."
            >
              <AreaTrendChart
                data={finance.data.monthly}
                xKey="month"
                yKey="net_savings"
                color="#22c55e"
              />
            </ChartCard>
            <div className="space-y-4">
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
