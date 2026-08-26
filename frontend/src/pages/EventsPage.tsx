import { useState } from "react";

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
import { formatPercent } from "../utils/format";

export function EventsPage() {
  const events = useAsyncData(api.events);
  const [selectedEvent, setSelectedEvent] = useState("covid-19-shock-2020");
  const analysis = useAsyncData(() => api.analyzeEvent(selectedEvent), {
    deps: [selectedEvent],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          eyebrow="Events"
          title="Event analysis"
          description="Review how selected market and macro series moved around major events without overstating causality."
        />
        <div className="flex items-center gap-3">
          <DemoBadge />
          <select
            value={selectedEvent}
            onChange={(event) => setSelectedEvent(event.target.value)}
            className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-red-300"
            aria-label="Select event"
          >
            {(events.data ?? []).map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {events.loading && !events.data ? (
        <LoadingState label="Loading events…" />
      ) : null}
      {events.error ? (
        <ErrorState message={events.error} onRetry={events.reload} />
      ) : null}
      {analysis.error ? (
        <ErrorState message={analysis.error} onRetry={analysis.reload} />
      ) : null}

      {analysis.data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Before period"
              value={formatPercent(analysis.data.before_period_return)}
            />
            <StatCard
              label="Event window"
              value={formatPercent(analysis.data.during_period_return)}
            />
            <StatCard
              label="Recovery window"
              value={formatPercent(analysis.data.recovery_period_return)}
            />
            <StatCard
              label="Volatility change"
              value={formatPercent(analysis.data.volatility_change)}
              hint="Approximate annualized shift in monthly volatility"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
            <ChartCard
              title={analysis.data.event.title}
              subtitle={analysis.data.event.summary}
            >
              {analysis.loading && !analysis.data ? (
                <LoadingState label="Analyzing selected event…" />
              ) : (
                <LineTrendChart
                  data={analysis.data.market_series}
                  xKey="date"
                  yKey="value"
                  color="#2563eb"
                />
              )}
            </ChartCard>

            <section className="app-card app-card-tilt rounded-[24px] p-5">
              <h3 className="text-lg font-semibold text-slate-900">
                Interpretation notes
              </h3>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                {analysis.data.event.transmission_mechanisms.map((item) => (
                  <li
                    key={item}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-7 text-blue-900">
                {analysis.data.event.notes}
              </div>
            </section>
          </div>

          <SourceNote source={analysis.data.source} />
        </>
      ) : analysis.loading ? (
        <LoadingState label="Analyzing selected event…" />
      ) : null}
    </div>
  );
}
