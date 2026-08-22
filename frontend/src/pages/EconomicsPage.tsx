import { useEffect, useMemo, useState } from "react";

import { AreaTrendChart } from "../charts/AreaTrendChart";
import { ChartCard } from "../components/ChartCard";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { SectionHeading } from "../components/SectionHeading";
import { SourceNote } from "../components/SourceNote";
import { StatCard } from "../components/StatCard";
import { useAsyncData } from "../hooks/useAsyncData";
import { api } from "../services/api";
import { formatNumber } from "../utils/format";

export function EconomicsPage() {
  const indicators = useAsyncData(api.indicators);
  const [selected, setSelected] = useState("gdp_growth");
  const detail = useAsyncData(() => api.indicator(selected), false);

  useEffect(() => {
    void detail.reload();
  }, [selected, detail]);

  const headline = useMemo(
    () =>
      indicators.data?.filter((item) =>
        [
          "gdp_growth",
          "cpi_inflation",
          "unemployment",
          "exchange_rate",
        ].includes(item.id),
      ) ?? [],
    [indicators.data],
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          eyebrow="Economic intelligence dashboard"
          title="Track India-focused macro indicators with source clarity"
          description="Each indicator includes its source, units, frequency, date, and a historical series snapshot. FinSight bundles a public-data snapshot for demo mode and supports a live World Bank provider."
        />
        <select
          value={selected}
          onChange={(event) => setSelected(event.target.value)}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
          aria-label="Select indicator"
        >
          {(indicators.data ?? []).map((indicator) => (
            <option key={indicator.id} value={indicator.id}>
              {indicator.label}
            </option>
          ))}
        </select>
      </div>

      {indicators.loading ? (
        <LoadingState label="Loading macro dataset…" />
      ) : null}
      {indicators.error ? (
        <ErrorState message={indicators.error} onRetry={indicators.reload} />
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

      {detail.loading ? (
        <LoadingState label="Loading selected indicator…" />
      ) : null}
      {detail.error ? (
        <ErrorState message={detail.error} onRetry={detail.reload} />
      ) : null}

      {detail.data ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
          <ChartCard
            title={detail.data.label}
            subtitle={`${detail.data.country} · ${detail.data.frequency} · ${detail.data.units}`}
          >
            <AreaTrendChart
              data={detail.data.series}
              xKey="date"
              yKey="value"
              color="#38bdf8"
            />
          </ChartCard>
          <div className="space-y-4">
            <section className="rounded-3xl border border-white/8 bg-slate-900/75 p-5 shadow-card">
              <h3 className="text-lg font-semibold text-white">
                Indicator notes
              </h3>
              <div className="mt-4 space-y-2 text-sm leading-7 text-slate-400">
                <p>
                  <span className="text-slate-200">Latest value:</span>{" "}
                  {formatNumber(detail.data.latest_value)}
                </p>
                <p>
                  <span className="text-slate-200">Date:</span>{" "}
                  {detail.data.latest_date}
                </p>
                <p>
                  <span className="text-slate-200">Units:</span>{" "}
                  {detail.data.units}
                </p>
                <p>
                  <span className="text-slate-200">Frequency:</span>{" "}
                  {detail.data.frequency}
                </p>
              </div>
            </section>
            <SourceNote source={detail.data.source} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
