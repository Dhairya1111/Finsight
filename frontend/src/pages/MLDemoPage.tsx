import { BarTrendChart } from "../charts/BarTrendChart";
import { ChartCard } from "../components/ChartCard";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { SectionHeading } from "../components/SectionHeading";
import { useAsyncData } from "../hooks/useAsyncData";
import { api } from "../services/api";
import { formatPercent } from "../utils/format";

export function MLDemoPage() {
  const ml = useAsyncData(api.mlDemo);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Machine learning demo"
        title="Compare simple classification models on a synthetic risk dataset"
        description="This module exists to demonstrate model evaluation workflow, not to make real-world lending or financial predictions."
      />

      {ml.loading ? <LoadingState label="Training demo models…" /> : null}
      {ml.error ? <ErrorState message={ml.error} onRetry={ml.reload} /> : null}

      {ml.data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {ml.data.metrics.map((metric) => (
              <div
                key={metric.name}
                className="rounded-3xl border border-white/8 bg-slate-900/75 p-5 shadow-card"
              >
                <p className="text-sm text-slate-400">{metric.name}</p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {formatPercent(metric.f1)}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  F1 score · accuracy {formatPercent(metric.accuracy)}
                </p>
              </div>
            ))}
          </div>
          <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
            <ChartCard
              title="Feature importance"
              subtitle={`Best model: ${ml.data.best_model}`}
            >
              <BarTrendChart
                data={Object.entries(ml.data.feature_importance).map(
                  ([feature, value]) => ({ feature, value }),
                )}
                xKey="feature"
                yKey="value"
                color="#8b5cf6"
              />
            </ChartCard>
            <section className="rounded-3xl border border-white/8 bg-slate-900/75 p-5 shadow-card text-sm text-slate-300">
              <h3 className="text-lg font-semibold text-white">
                Evaluation notes
              </h3>
              <div className="mt-4 space-y-2 text-slate-400">
                <p>True negative: {ml.data.confusion_matrix.true_negative}</p>
                <p>False positive: {ml.data.confusion_matrix.false_positive}</p>
                <p>False negative: {ml.data.confusion_matrix.false_negative}</p>
                <p>True positive: {ml.data.confusion_matrix.true_positive}</p>
              </div>
              <p className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-500/5 p-4 leading-7 text-amber-100">
                {ml.data.note}
              </p>
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
