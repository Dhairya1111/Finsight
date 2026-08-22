import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { CalendarDays, Plus, RefreshCcw, Trash2, Upload } from "lucide-react";

import { AreaTrendChart } from "../charts/AreaTrendChart";
import { BarTrendChart } from "../charts/BarTrendChart";
import { ChartCard } from "../components/ChartCard";
import { DemoBadge } from "../components/DemoBadge";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { SectionHeading } from "../components/SectionHeading";
import { SourceNote } from "../components/SourceNote";
import { StatCard } from "../components/StatCard";
import { useAsyncData } from "../hooks/useAsyncData";
import { api } from "../services/api";
import type { ManualTransactionInput } from "../types/api";
import {
  formatCompactCurrency,
  formatNumber,
  formatPercent,
} from "../utils/format";

const categorySuggestions = [
  "Housing",
  "Groceries",
  "Dining",
  "Transport",
  "Utilities",
  "Shopping",
  "Health",
  "Income",
  "Investments",
  "Education",
  "Travel",
  "Entertainment",
];

const accountSuggestions = [
  "Primary Checking",
  "Savings Account",
  "Credit Card",
  "Cash",
  "Brokerage",
  "UPI Wallet",
];

type ManualTransactionDraft = {
  date: string;
  description: string;
  category: string;
  amount: string;
  type: "income" | "expense";
  account: string;
};

const initialDraft: ManualTransactionDraft = {
  date: new Date().toISOString().slice(0, 10),
  description: "",
  category: "Groceries",
  amount: "",
  type: "expense",
  account: "Primary Checking",
};

export function FinancePage() {
  const finance = useAsyncData(api.financeSummary);
  const [uploading, setUploading] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);
  const [draft, setDraft] = useState(initialDraft);
  const [manualTransactions, setManualTransactions] = useState<
    ManualTransactionInput[]
  >([]);

  const manualTotal = useMemo(
    () =>
      manualTransactions.reduce((sum, transaction) => {
        const signedValue =
          transaction.type === "income"
            ? transaction.amount
            : -transaction.amount;
        return sum + signedValue;
      }, 0),
    [manualTransactions],
  );

  const currentDatasetLabel = useMemo(() => {
    if (!finance.data) return "";
    if (finance.data.source.is_demo) return "Demo dataset loaded";
    if (finance.data.source.note?.includes("Uploaded file")) {
      return "Uploaded CSV in view";
    }
    if (finance.data.source.note?.includes("Manual transaction entries")) {
      return "Manual entries in view";
    }
    return "Custom dataset in view";
  }, [finance.data]);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setManualError(null);
    try {
      const result = await api.uploadFinanceCsv(file);
      finance.setData(result);
    } catch (error) {
      setManualError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleAddTransaction = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setManualError(null);

    const parsedAmount = Number(draft.amount);
    if (!draft.description.trim()) {
      setManualError("Please enter a description for the transaction.");
      return;
    }
    if (!draft.category.trim()) {
      setManualError("Please choose or enter a category.");
      return;
    }
    if (!draft.account.trim()) {
      setManualError("Please choose or enter an account.");
      return;
    }
    if (!draft.date) {
      setManualError("Please choose a valid date.");
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setManualError("Amount must be a positive number.");
      return;
    }

    setManualTransactions((current) => [
      {
        date: draft.date,
        description: draft.description.trim(),
        category: draft.category.trim(),
        amount: parsedAmount,
        type: draft.type,
        account: draft.account.trim(),
      },
      ...current,
    ]);
    setDraft((current) => ({ ...current, description: "", amount: "" }));
  };

  const handleAnalyzeManual = async () => {
    if (!manualTransactions.length) {
      setManualError("Add at least one manual transaction before analyzing.");
      return;
    }

    setManualLoading(true);
    setManualError(null);
    try {
      const result = await api.analyzeManualTransactions(manualTransactions);
      finance.setData(result);
    } catch (error) {
      setManualError(
        error instanceof Error ? error.message : "Manual analysis failed.",
      );
    } finally {
      setManualLoading(false);
    }
  };

  const handleResetDemo = async () => {
    setManualError(null);
    const result = await api.financeSummary();
    finance.setData(result);
  };

  const removeManualTransaction = (indexToRemove: number) => {
    setManualTransactions((current) =>
      current.filter((_, index) => index !== indexToRemove),
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          eyebrow="Personal finance analyzer"
          title="Upload, review, or manually enter transactions"
          description="You can still upload a CSV, but you can now also type personal transaction values directly into the dashboard and analyze them instantly."
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void handleResetDemo()}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCcw className="h-4 w-4" />
            Load demo data
          </button>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-blue-700 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-blue-600">
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading…" : "Upload CSV"}
            <input
              className="hidden"
              type="file"
              accept=".csv"
              onChange={handleUpload}
            />
          </label>
        </div>
      </div>

      {finance.loading ? (
        <LoadingState label="Crunching transaction analytics…" />
      ) : null}
      {finance.error ? (
        <ErrorState message={finance.error} onRetry={finance.reload} />
      ) : null}

      {finance.data ? (
        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.3fr)_390px]">
          <div className="min-w-0 space-y-6">
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    {finance.data.source.is_demo ? <DemoBadge /> : null}
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                      {currentDatasetLabel}
                    </span>
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-900 md:text-3xl">
                    Keep the analysis view up front while editing your data.
                  </h3>
                  <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                    The charts and summaries stay in the main canvas, while the
                    right-side panel is dedicated to adding or adjusting
                    transactions. This keeps the page readable even when you are
                    actively entering values.
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Current dataset stats
                  </p>
                  <p className="mt-2">
                    {formatNumber(finance.data.transaction_count, 0)}{" "}
                    transactions
                  </p>
                  <p className="text-slate-400">
                    Trend: {finance.data.spending_trend}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Total income"
                  value={formatCompactCurrency(
                    finance.data.total_income,
                    "INR",
                  )}
                />
                <StatCard
                  label="Total expenses"
                  value={formatCompactCurrency(
                    finance.data.total_expenses,
                    "INR",
                  )}
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
            </section>

            <div className="grid min-w-0 gap-6 xl:grid-cols-2">
              <ChartCard
                title="Monthly income vs expenses"
                subtitle="Negative outflows are converted to positive expense magnitudes for readability."
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
                subtitle="Useful for spotting improving or deteriorating cash-flow patterns over time."
              >
                <AreaTrendChart
                  data={finance.data.monthly}
                  xKey="month"
                  yKey="net_savings"
                  color="#22c55e"
                />
              </ChartCard>
            </div>

            <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
              <ChartCard
                title="Category-wise spending"
                subtitle="Which categories dominate the currently loaded dataset?"
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

              <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">
                  Recurring expenses detected
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Repeated descriptions can signal subscriptions or habitual
                  spending patterns worth reviewing.
                </p>
                <div className="mt-5 space-y-3">
                  {finance.data.recurring_expenses.length ? (
                    finance.data.recurring_expenses.map((item) => (
                      <div
                        key={`${item.description}-${item.category}`}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-medium text-slate-900">
                              {item.description}
                            </p>
                            <p className="text-sm text-slate-400">
                              {item.category}
                            </p>
                          </div>
                          <div className="text-right text-sm text-slate-600">
                            <p>{item.occurrences} occurrences</p>
                            <p>
                              {formatCompactCurrency(
                                item.average_amount,
                                "INR",
                              )}{" "}
                              average
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                      No recurring patterns detected.
                    </div>
                  )}
                </div>
              </section>
            </div>

            <SourceNote source={finance.data.source} />
          </div>

          <div className="space-y-6 2xl:sticky 2xl:top-24 2xl:self-start">
            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Manual transaction entry
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">
                    Add personal values directly
                  </h3>
                </div>
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                  <CalendarDays className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                Enter positive amounts. FinSight will automatically treat
                expenses as outflows and income as inflows during analysis.
              </p>

              <form onSubmit={handleAddTransaction} className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm text-slate-600">
                    Date
                    <input
                      type="date"
                      value={draft.date}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          date: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-300"
                    />
                  </label>
                  <label className="text-sm text-slate-600">
                    Type
                    <select
                      value={draft.type}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          type: event.target.value as "income" | "expense",
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-300"
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </label>
                </div>

                <label className="block text-sm text-slate-600">
                  Description
                  <input
                    type="text"
                    value={draft.description}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Rent, salary, groceries, freelance payment..."
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-300"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm text-slate-600">
                    Category
                    <input
                      list="finance-categories"
                      value={draft.category}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          category: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-300"
                    />
                  </label>
                  <label className="text-sm text-slate-600">
                    Account
                    <input
                      list="finance-accounts"
                      value={draft.account}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          account: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-300"
                    />
                  </label>
                </div>

                <label className="block text-sm text-slate-600">
                  Amount
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={draft.amount}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        amount: event.target.value,
                      }))
                    }
                    placeholder="0.00"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-300"
                  />
                </label>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-blue-600"
                >
                  <Plus className="h-4 w-4" />
                  Add transaction
                </button>
              </form>

              <datalist id="finance-categories">
                {categorySuggestions.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
              <datalist id="finance-accounts">
                {accountSuggestions.map((account) => (
                  <option key={account} value={account} />
                ))}
              </datalist>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Pending manual dataset
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">
                    {manualTransactions.length} queued transactions
                  </h3>
                </div>
                <div className="rounded-2xl border border-white/8 bg-slate-950/70 px-3 py-2 text-right text-sm text-slate-600">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    Net impact
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {formatCompactCurrency(manualTotal, "INR")}
                  </p>
                </div>
              </div>

              {manualError ? (
                <div className="mt-4 rounded-2xl border border-rose-500/25 bg-rose-500/5 px-4 py-3 text-sm text-rose-100">
                  {manualError}
                </div>
              ) : null}

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => void handleAnalyzeManual()}
                  disabled={manualLoading}
                  className="inline-flex flex-1 items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {manualLoading ? "Analyzing…" : "Analyze manual entries"}
                </button>
                <button
                  type="button"
                  onClick={() => setManualTransactions([])}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Clear
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {manualTransactions.length ? (
                  manualTransactions.map((transaction, index) => (
                    <div
                      key={`${transaction.date}-${transaction.description}-${index}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-slate-900">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-slate-400">
                            {transaction.category} · {transaction.account}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">
                            {transaction.date} · {transaction.type}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-semibold text-slate-900">
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCompactCurrency(transaction.amount, "INR")}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeManualTransaction(index)}
                            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:border-rose-300 hover:text-rose-600"
                            aria-label={`Remove ${transaction.description}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-7 text-slate-500">
                    No manual transactions added yet. Add a few rows here, then
                    click{" "}
                    <span className="font-medium text-slate-900">
                      Analyze manual entries
                    </span>
                    to replace the current summary with your own values.
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}
