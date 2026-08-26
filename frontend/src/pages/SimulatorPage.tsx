import { useState } from "react";

import { BarTrendChart } from "../charts/BarTrendChart";
import { ChartCard } from "../components/ChartCard";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { SectionHeading } from "../components/SectionHeading";
import { StatCard } from "../components/StatCard";
import { useAsyncData } from "../hooks/useAsyncData";
import { api } from "../services/api";
import { formatNumber } from "../utils/format";

const defaultPayload = {
  repo_rate: 6.5,
  crude_oil: 78,
  inflation: 5.1,
  government_spending_change: 0,
};

const scenarioFields = [
  { key: "repo_rate", label: "Repo rate", min: 3, max: 12, step: 0.1 },
  { key: "crude_oil", label: "Crude oil (USD)", min: 40, max: 160, step: 1 },
  { key: "inflation", label: "Inflation", min: 0, max: 12, step: 0.1 },
  {
    key: "government_spending_change",
    label: "Government spending change (%)",
    min: -20,
    max: 20,
    step: 1,
  },
] as const;

export function SimulatorPage() {
  const [payload, setPayload] = useState(defaultPayload);
  const simulation = useAsyncData(() => api.runScenario(payload), {
    deps: [
      payload.repo_rate,
      payload.crude_oil,
      payload.inflation,
      payload.government_spending_change,
    ],
  });

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Simulator"
        title="What-if scenario tool"
        description="A simple educational model for exploring directional changes in growth, inflation, sentiment, and currency pressure."
      />

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Assumptions</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Adjust values below. The result refreshes automatically and remains
            a simplified classroom-style model.
          </p>
          <div className="mt-5 space-y-5">
            {scenarioFields.map((field) => (
              <label key={field.key} className="block">
                <div className="mb-2 flex items-center justify-between text-sm text-slate-700">
                  <span>{field.label}</span>
                  <span className="font-medium text-blue-700">
                    {payload[field.key]}
                  </span>
                </div>
                <input
                  type="range"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={payload[field.key]}
                  onChange={(event) =>
                    setPayload((current) => ({
                      ...current,
                      [field.key]: Number(event.target.value),
                    }))
                  }
                  className="w-full accent-blue-700"
                />
              </label>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          {simulation.error ? (
            <ErrorState
              message={simulation.error}
              onRetry={simulation.reload}
            />
          ) : null}

          {simulation.loading && !simulation.data ? (
            <LoadingState label="Running scenario…" />
          ) : null}

          {simulation.data ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="GDP growth"
                  value={formatNumber(simulation.data.scenario.gdp_growth)}
                />
                <StatCard
                  label="CPI inflation"
                  value={formatNumber(simulation.data.scenario.cpi_inflation)}
                />
                <StatCard
                  label="Equity sentiment"
                  value={formatNumber(
                    simulation.data.scenario.equity_sentiment,
                  )}
                />
                <StatCard
                  label="Currency pressure"
                  value={formatNumber(
                    simulation.data.scenario.currency_pressure,
                  )}
                />
              </div>

              <ChartCard
                title="Difference from baseline"
                subtitle="Positive and negative shifts relative to the baseline case."
              >
                <BarTrendChart
                  data={[
                    "gdp_growth",
                    "cpi_inflation",
                    "equity_sentiment",
                    "currency_pressure",
                  ].map((key) => ({
                    metric: key,
                    value: simulation.data?.differences[key] ?? null,
                  }))}
                  xKey="metric"
                  yKey="value"
                  color="#2563eb"
                />
              </ChartCard>

              <section className="rounded-[24px] border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-900 shadow-sm">
                <h3 className="text-lg font-semibold text-amber-900">
                  Model assumptions
                </h3>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  {simulation.data.assumptions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="mt-4">{simulation.data.methodology}</p>
              </section>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
