import { BarTrendChart } from "../charts/BarTrendChart";
import { ChartCard } from "../components/ChartCard";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { SectionHeading } from "../components/SectionHeading";
import { StatCard } from "../components/StatCard";
import { useAsyncData } from "../hooks/useAsyncData";
import { api } from "../services/api";
import { formatPercent } from "../utils/format";

export function MLDemoPage() {
  const ml = useAsyncData(api.mlDemo);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="ML lab"
        title="Model comparison demo"
        description="A simple evaluation screen for the synthetic risk dataset. This is here to show workflow and metrics, not to make real financial decisions."
      />

      {ml.loading && !ml.data ? (
        <LoadingState label="Loading model results…" />
      ) : null}
      {ml.error ? <ErrorState message={ml.error} onRetry={ml.reload} /> : null}

      {ml.data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {ml.data.metrics.map((metric) => (
              <StatCard
                key={metric.name}
                label={metric.name}
                value={formatPercent(metric.f1)}
                hint={`Accuracy ${formatPercent(metric.accuracy)} · Precision ${formatPercent(metric.precision)}`}
              />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
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
                color="#2563eb"
              />
            </ChartCard>

            <section className="app-card app-card-tilt rounded-[24px] p-5 text-sm text-slate-600">
              <h3 className="text-lg font-semibold text-slate-900">
                Evaluation notes
              </h3>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  True negative: {ml.data.confusion_matrix.true_negative}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  False positive: {ml.data.confusion_matrix.false_positive}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  False negative: {ml.data.confusion_matrix.false_negative}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  True positive: {ml.data.confusion_matrix.true_positive}
                </div>
              </div>
              <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 leading-7 text-amber-800">
                {ml.data.note}
              </p>
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
