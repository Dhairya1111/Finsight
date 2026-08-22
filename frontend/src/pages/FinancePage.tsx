import { ChangeEvent, useState } from "react";

import { AreaTrendChart } from "../charts/AreaTrendChart";
import { BarTrendChart } from "../charts/BarTrendChart";
import { ChartCard } from "../components/ChartCard";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { SectionHeading } from "../components/SectionHeading";
import { SourceNote } from "../components/SourceNote";
import { StatCard } from "../components/StatCard";
import { useAsyncData } from "../hooks/useAsyncData";
import { api } from "../services/api";
import { formatCompactCurrency, formatPercent } from "../utils/format";

export function FinancePage() {
  const finance = useAsyncData(api.financeSummary);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await api.uploadFinanceCsv(file);
      finance.setData(result);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          eyebrow="Personal finance analyzer"
          title="Turn transaction history into actionable budgeting context"
          description="Upload a CSV with Date, Description, Category, Amount, Type, and Account — or use the bundled demo dataset to inspect recurring expenses, monthly cash flow, and savings behaviour."
        />
        <label className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10">
          <input
            className="hidden"
            type="file"
            accept=".csv"
            onChange={handleUpload}
          />
          {uploading ? "Uploading…" : "Upload CSV"}
        </label>
      </div>

      {finance.loading ? (
        <LoadingState label="Crunching transaction analytics…" />
      ) : null}
      {finance.error ? (
        <ErrorState message={finance.error} onRetry={finance.reload} />
      ) : null}

      {finance.data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total income"
              value={formatCompactCurrency(finance.data.total_income, "INR")}
            />
            <StatCard
              label="Total expenses"
              value={formatCompactCurrency(finance.data.total_expenses, "INR")}
            />
            <StatCard
              label="Net savings"
              value={formatCompactCurrency(finance.data.net_savings, "INR")}
            />
            <StatCard
              label="Savings rate"
              value={formatPercent(finance.data.savings_rate)}
              hint={`Trend: ${finance.data.spending_trend}`}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <ChartCard
              title="Monthly income vs expenses"
              subtitle="Negative values are converted to expense magnitudes for clarity."
            >
              <BarTrendChart
                data={finance.data.monthly.map((item) => ({
                  month: item.month,
                  expenses: item.expenses,
                  income: item.income,
                }))}
                xKey="month"
                yKey="expenses"
                color="#f97316"
              />
            </ChartCard>
            <ChartCard
              title="Net savings trajectory"
              subtitle="Useful for spotting improving or deteriorating cash-flow patterns."
            >
              <AreaTrendChart
                data={finance.data.monthly}
                xKey="month"
                yKey="net_savings"
                color="#22c55e"
              />
            </ChartCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr,0.85fr]">
            <ChartCard
              title="Category-wise spending"
              subtitle="Which categories dominate the sample expense base?"
            >
              <BarTrendChart
                data={finance.data.categories.map((item) => ({
                  category: item.category,
                  amount: item.amount,
                }))}
                xKey="category"
                yKey="amount"
                color="#38bdf8"
              />
            </ChartCard>
            <section className="rounded-3xl border border-white/8 bg-slate-900/75 p-5 shadow-card">
              <h3 className="text-lg font-semibold text-white">
                Recurring expenses detected
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                High-frequency expense descriptions can indicate subscriptions
                or stable monthly bills.
              </p>
              <div className="mt-5 space-y-3">
                {finance.data.recurring_expenses.length ? (
                  finance.data.recurring_expenses.map((item) => (
                    <div
                      key={`${item.description}-${item.category}`}
                      className="rounded-2xl border border-white/8 bg-slate-950/60 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-white">
                            {item.description}
                          </p>
                          <p className="text-sm text-slate-400">
                            {item.category}
                          </p>
                        </div>
                        <div className="text-right text-sm text-slate-300">
                          <p>{item.occurrences} occurrences</p>
                          <p>
                            {formatCompactCurrency(item.average_amount, "INR")}{" "}
                            average
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-slate-400">
                    No recurring patterns detected.
                  </div>
                )}
              </div>
            </section>
          </div>

          <SourceNote source={finance.data.source} />
        </>
      ) : null}
    </div>
  );
}
