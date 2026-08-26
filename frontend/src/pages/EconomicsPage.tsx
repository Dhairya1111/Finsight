import { useMemo, useState } from "react";

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
import { formatNumber } from "../utils/format";

const headlineIds = [
  "gdp_growth",
  "cpi_inflation",
  "unemployment",
  "exchange_rate",
];

export function EconomicsPage() {
  const indicators = useAsyncData(api.indicators);
  const [selected, setSelected] = useState("gdp_growth");
  const detail = useAsyncData(() => api.indicator(selected), {
    deps: [selected],
  });

  const headline = useMemo(
    () =>
      indicators.data?.filter((item) => headlineIds.includes(item.id)) ?? [],
    [indicators.data],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          eyebrow="Economics"
          title="India macro dashboard"
          description="Clean indicator views with source, frequency, units, and update notes kept visible."
        />
        <div className="flex items-center gap-3">
          {detail.data?.source.is_demo ? <DemoBadge /> : null}
          <select
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-300"
            aria-label="Select indicator"
          >
            {(indicators.data ?? []).map((indicator) => (
              <option key={indicator.id} value={indicator.id}>
                {indicator.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {indicators.loading && !indicators.data ? (
        <LoadingState label="Loading macro dataset…" />
      ) : null}
      {indicators.error ? (
        <ErrorState message={indicators.error} onRetry={indicators.reload} />
      ) : null}
      {detail.error ? (
        <ErrorState message={detail.error} onRetry={detail.reload} />
      ) : null}

      {headline.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {headline.map((item) => (
            <StatCard
              key={item.id}
              label={item.label}
              value={formatNumber(item.latest_value)}
              hint={`${item.units} · ${item.latest_date}`}
            />
          ))}
        </div>
      ) : null}

      {detail.data ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_340px]">
          <ChartCard
            title={detail.data.label}
            subtitle={`${detail.data.country} · ${detail.data.frequency} · ${detail.data.units}`}
          >
            {detail.loading && !detail.data ? (
              <LoadingState label="Loading selected indicator…" />
            ) : (
              <AreaTrendChart
                data={detail.data.series}
                xKey="date"
                yKey="value"
                color="#2563eb"
              />
            )}
          </ChartCard>

          <div className="space-y-4">
            <section className="app-card app-card-tilt rounded-[24px] p-5">
              <h3 className="text-lg font-semibold text-slate-900">
                Indicator details
              </h3>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-slate-500">Latest value</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {formatNumber(detail.data.latest_value)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-slate-500">Latest date</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {detail.data.latest_date}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-slate-500">Units / frequency</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {detail.data.units} · {detail.data.frequency}
                  </p>
                </div>
              </div>
            </section>
            <SourceNote source={detail.data.source} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
