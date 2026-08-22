import { useEffect, useState } from "react";

import { BarTrendChart } from "../charts/BarTrendChart";
import { ChartCard } from "../components/ChartCard";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { SectionHeading } from "../components/SectionHeading";
import { useAsyncData } from "../hooks/useAsyncData";
import { api } from "../services/api";
import { formatNumber } from "../utils/format";

const defaultPayload = {
  repo_rate: 6.5,
  crude_oil: 78,
  inflation: 5.1,
  government_spending_change: 0,
};

export function SimulatorPage() {
  const [payload, setPayload] = useState(defaultPayload);
  const simulation = useAsyncData(() => api.runScenario(payload), false);
  const { reload } = simulation;
  const scenarioData = simulation.data;

  useEffect(() => {
    void reload();
  }, [
    payload.repo_rate,
    payload.crude_oil,
    payload.inflation,
    payload.government_spending_change,
    reload,
  ]);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="What-if economic simulator"
        title="Explore simple directional macro scenarios"
        description="This is intentionally presented as an educational sensitivity model, not a real forecasting engine. Adjust the assumptions and compare against a fixed baseline scenario."
      />

      <div className="grid gap-6 xl:grid-cols-[0.85fr,1.15fr]">
        <section className="rounded-3xl border border-white/8 bg-slate-900/75 p-5 shadow-card">
          <div className="space-y-5">
            {[
              {
                key: "repo_rate",
                label: "Repo rate",
                min: 3,
                max: 12,
                step: 0.1,
              },
              {
                key: "crude_oil",
                label: "Crude oil (USD)",
                min: 40,
                max: 160,
                step: 1,
              },
              {
                key: "inflation",
                label: "Inflation",
                min: 0,
                max: 12,
                step: 0.1,
              },
              {
                key: "government_spending_change",
                label: "Government spending change",
                min: -20,
                max: 20,
                step: 1,
              },
            ].map((field) => (
              <label key={field.key} className="block">
                <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                  <span>{field.label}</span>
                  <span className="text-brand-200">
                    {payload[field.key as keyof typeof payload]}
                  </span>
                </div>
                <input
                  type="range"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={payload[field.key as keyof typeof payload]}
                  onChange={(event) =>
                    setPayload((current) => ({
                      ...current,
                      [field.key]: Number(event.target.value),
                    }))
                  }
                  className="w-full accent-sky-400"
                />
              </label>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          {simulation.loading ? (
            <LoadingState label="Running scenario…" />
          ) : null}
          {simulation.error ? (
            <ErrorState
              message={simulation.error}
              onRetry={simulation.reload}
            />
          ) : null}
          {scenarioData ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ["GDP growth", scenarioData.scenario.gdp_growth],
                  ["CPI inflation", scenarioData.scenario.cpi_inflation],
                  ["Equity sentiment", scenarioData.scenario.equity_sentiment],
                  [
                    "Currency pressure",
                    scenarioData.scenario.currency_pressure,
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-3xl border border-white/8 bg-slate-900/75 p-5 shadow-card"
                  >
                    <p className="text-sm text-slate-400">{label}</p>
                    <p className="mt-3 text-2xl font-semibold text-white">
                      {formatNumber(value as number)}
                    </p>
                  </div>
                ))}
              </div>
              <ChartCard
                title="Baseline vs scenario"
                subtitle="Comparing modeled macro outputs, not predicting the real economy."
              >
                <BarTrendChart
                  data={[
                    "gdp_growth",
                    "cpi_inflation",
                    "equity_sentiment",
                    "currency_pressure",
                  ].map((key) => ({
                    metric: key,
                    value: scenarioData.differences[key],
                  }))}
                  xKey="metric"
                  yKey="value"
                  color="#38bdf8"
                />
              </ChartCard>
              <section className="rounded-3xl border border-amber-300/20 bg-amber-500/5 p-5 text-sm leading-7 text-amber-100">
                <h3 className="text-lg font-semibold">Model assumptions</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  {scenarioData.assumptions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="mt-4 text-amber-100/85">
                  {scenarioData.methodology}
                </p>
              </section>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
