import { useEffect, useState } from "react";

import { LineTrendChart } from "../charts/LineTrendChart";
import { ChartCard } from "../components/ChartCard";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { SectionHeading } from "../components/SectionHeading";
import { SourceNote } from "../components/SourceNote";
import { StatCard } from "../components/StatCard";
import { useAsyncData } from "../hooks/useAsyncData";
import { api } from "../services/api";
import { formatPercent } from "../utils/format";

export function EventsPage() {
  const events = useAsyncData(api.events);
  const [selectedEvent, setSelectedEvent] = useState("covid-19-shock-2020");
  const analysis = useAsyncData(() => api.analyzeEvent(selectedEvent), false);

  useEffect(() => {
    void analysis.reload();
  }, [selectedEvent, analysis]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          eyebrow="Economic event analyzer"
          title="Investigate major shocks without overstating causality"
          description="FinSight uses careful language and focuses on associations, timing, before/after comparisons, and possible transmission mechanisms."
        />
        <select
          value={selectedEvent}
          onChange={(event) => setSelectedEvent(event.target.value)}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
          aria-label="Select event"
        >
          {(events.data ?? []).map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
      </div>

      {events.loading ? <LoadingState label="Loading event catalog…" /> : null}
      {events.error ? (
        <ErrorState message={events.error} onRetry={events.reload} />
      ) : null}
      {analysis.loading ? (
        <LoadingState label="Analyzing event window…" />
      ) : null}
      {analysis.error ? (
        <ErrorState message={analysis.error} onRetry={analysis.reload} />
      ) : null}

      {analysis.data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Before-window return"
              value={formatPercent(analysis.data.before_period_return)}
            />
            <StatCard
              label="During-window return"
              value={formatPercent(analysis.data.during_period_return)}
            />
            <StatCard
              label="Recovery return"
              value={formatPercent(analysis.data.recovery_period_return)}
            />
            <StatCard
              label="Volatility change"
              value={formatPercent(analysis.data.volatility_change)}
              hint="Annualized approximation on monthly returns."
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
            <ChartCard
              title={analysis.data.event.title}
              subtitle={analysis.data.event.summary}
            >
              <LineTrendChart
                data={analysis.data.market_series}
                xKey="date"
                yKey="value"
                color="#f59e0b"
              />
            </ChartCard>
            <section className="rounded-3xl border border-white/8 bg-slate-900/75 p-5 shadow-card">
              <h3 className="text-lg font-semibold text-white">
                Transmission mechanisms
              </h3>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-400">
                {analysis.data.event.transmission_mechanisms.map((item) => (
                  <li
                    key={item}
                    className="rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs uppercase tracking-[0.24em] text-slate-500">
                Note
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                {analysis.data.event.notes}
              </p>
            </section>
          </div>

          <SourceNote source={analysis.data.source} />
        </>
      ) : null}
    </div>
  );
}
