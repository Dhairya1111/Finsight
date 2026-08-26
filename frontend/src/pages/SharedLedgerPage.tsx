import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

import { BarTrendChart } from "../charts/BarTrendChart";
import { ChartCard } from "../components/ChartCard";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { SourceNote } from "../components/SourceNote";
import { StatCard } from "../components/StatCard";
import { useAsyncData } from "../hooks/useAsyncData";
import { api } from "../services/api";
import {
  formatCompactCurrency,
  formatCurrency,
  formatPercent,
} from "../utils/format";

export function SharedLedgerPage() {
  const { token = "" } = useParams();
  const shared = useAsyncData(() => api.getSharedLedger(token), {
    deps: [token],
  });

  const categoryData = useMemo(
    () =>
      shared.data?.summary.categories.slice(0, 6).map((item) => ({
        category: item.category,
        amount: item.amount,
      })) ?? [],
    [shared.data],
  );

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900 md:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              Shared ledger view
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              Read-only expense and income summary
            </h1>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              This link shows a shared view of the saved ledger data.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Open FinSight
          </Link>
        </div>

        {shared.loading && !shared.data ? (
          <LoadingState label="Loading shared ledger…" />
        ) : null}
        {shared.error ? (
          <ErrorState message={shared.error} onRetry={shared.reload} />
        ) : null}

        {shared.data ? (
          <>
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {shared.data.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Shared on{" "}
                    {new Date(shared.data.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Total income"
                  value={formatCompactCurrency(
                    shared.data.summary.total_income,
                    "INR",
                  )}
                />
                <StatCard
                  label="Total expenses"
                  value={formatCompactCurrency(
                    shared.data.summary.total_expenses,
                    "INR",
                  )}
                />
                <StatCard
                  label="Net savings"
                  value={formatCompactCurrency(
                    shared.data.summary.net_savings,
                    "INR",
                  )}
                />
                <StatCard
                  label="Savings rate"
                  value={formatPercent(shared.data.summary.savings_rate)}
                />
              </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <ChartCard
                title="Category breakdown"
                subtitle="Top spending categories in the shared ledger."
              >
                <BarTrendChart
                  data={categoryData}
                  xKey="category"
                  yKey="amount"
                  color="#2563eb"
                />
              </ChartCard>
              <SourceNote source={shared.data.summary.source} />
            </div>

            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Transactions
              </h3>
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2 text-sm">
                  <thead>
                    <tr className="text-left text-slate-500">
                      <th className="px-4 py-2 font-medium">Date</th>
                      <th className="px-4 py-2 font-medium">Description</th>
                      <th className="px-4 py-2 font-medium">Category</th>
                      <th className="px-4 py-2 font-medium">Account</th>
                      <th className="px-4 py-2 font-medium">Type</th>
                      <th className="px-4 py-2 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shared.data.transactions.map((transaction) => (
                      <tr key={transaction.id} className="bg-slate-50">
                        <td className="rounded-l-2xl border-y border-l border-slate-200 px-4 py-3 text-slate-700">
                          {transaction.date}
                        </td>
                        <td className="border-y border-slate-200 px-4 py-3 font-medium text-slate-900">
                          {transaction.description}
                        </td>
                        <td className="border-y border-slate-200 px-4 py-3 text-slate-700">
                          {transaction.category}
                        </td>
                        <td className="border-y border-slate-200 px-4 py-3 text-slate-700">
                          {transaction.account}
                        </td>
                        <td className="border-y border-slate-200 px-4 py-3 text-slate-700">
                          {transaction.type}
                        </td>
                        <td className="rounded-r-2xl border-y border-r border-slate-200 px-4 py-3 font-semibold text-slate-900">
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount, "INR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
