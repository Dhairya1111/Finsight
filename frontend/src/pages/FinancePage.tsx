import { ChangeEvent, FormEvent, ReactNode, useMemo, useState } from "react";
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

  const manualTotal = useMemo(
    () =>
      manualTransactions.reduce((sum, item) => {
        const signed = item.type === "income" ? item.amount : -item.amount;
        return sum + signed;
      }, 0),
    [manualTransactions],
  );

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
    if (!draft.date) return setManualError("Please choose a valid date.");
    if (!draft.description.trim()) {
      return setManualError("Please enter a description.");
    }
    if (!draft.category.trim())
      return setManualError("Please enter a category.");
    if (!draft.account.trim())
      return setManualError("Please enter an account.");
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return setManualError("Amount must be a positive number.");
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
      setManualError("Add at least one transaction before analyzing.");
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          eyebrow="Ledger"
          title="Transactions and cash flow"
          description="Upload a CSV or enter transactions manually. The summary and charts update from whichever dataset is currently active."
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
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600">
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

      {finance.loading && !finance.data ? (
        <LoadingState label="Loading ledger summary…" />
      ) : null}
      {finance.error ? (
        <ErrorState message={finance.error} onRetry={finance.reload} />
      ) : null}

      {finance.data ? (
        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.3fr)_380px]">
          <div className="min-w-0 space-y-6">
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    {finance.data.source.is_demo ? <DemoBadge /> : null}
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                      {currentDatasetLabel}
                    </span>
                  </div>
                  <h3 className="mt-4 text-3xl font-semibold text-slate-900">
                    Keep the summary visible while you work.
                  </h3>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                    The main panel shows the current financial picture. The side
                    panel is reserved for adding personal entries so the page
                    behaves more like a working app than a concept dashboard.
                  </p>
                </div>
                <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-right text-sm text-slate-600">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Transactions analyzed
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {formatNumber(finance.data.transaction_count, 0)}
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

            <div className="grid gap-6 xl:grid-cols-2">
              <ChartCard
                title="Monthly expenses"
                subtitle="Converted to positive values for readability."
              >
                <BarTrendChart
                  data={finance.data.monthly.map((item) => ({
                    month: item.month,
                    expenses: item.expenses,
                  }))}
                  xKey="month"
                  yKey="expenses"
                  color="#2563eb"
                />
              </ChartCard>
              <ChartCard
                title="Monthly net savings"
                subtitle="Quick read on whether the monthly balance is improving."
              >
                <AreaTrendChart
                  data={finance.data.monthly}
                  xKey="month"
                  yKey="net_savings"
                  color="#16a34a"
                />
              </ChartCard>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
              <ChartCard
                title="Category spending"
                subtitle="Top categories in the current dataset."
              >
                <BarTrendChart
                  data={finance.data.categories.map((item) => ({
                    category: item.category,
                    amount: item.amount,
                  }))}
                  xKey="category"
                  yKey="amount"
                  color="#ea580c"
                />
              </ChartCard>

              <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">
                  Recurring expenses
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Repeated descriptions can point to rent, subscriptions, or
                  regular bills.
                </p>
                <div className="mt-4 space-y-3">
                  {finance.data.recurring_expenses.length ? (
                    finance.data.recurring_expenses.map((item) => (
                      <div
                        key={`${item.description}-${item.category}`}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <p className="font-medium text-slate-900">
                          {item.description}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.category}
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                          {item.occurrences} entries ·{" "}
                          {formatCompactCurrency(item.average_amount, "INR")}{" "}
                          avg
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                      No recurring pattern detected in the current dataset.
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
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Manual entry
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">
                    Add personal transactions
                  </h3>
                </div>
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                  <CalendarDays className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                Use positive amounts. The app treats income and expense
                differently based on the selected type.
              </p>

              <form onSubmit={handleAddTransaction} className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Date">
                    <input
                      type="date"
                      value={draft.date}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          date: event.target.value,
                        }))
                      }
                      className={inputClassName}
                    />
                  </Field>
                  <Field label="Type">
                    <select
                      value={draft.type}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          type: event.target.value as "income" | "expense",
                        }))
                      }
                      className={inputClassName}
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </Field>
                </div>

                <Field label="Description">
                  <input
                    type="text"
                    value={draft.description}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Rent, salary, groceries, freelance payment"
                    className={inputClassName}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Category">
                    <input
                      list="finance-categories"
                      value={draft.category}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          category: event.target.value,
                        }))
                      }
                      className={inputClassName}
                    />
                  </Field>
                  <Field label="Account">
                    <input
                      list="finance-accounts"
                      value={draft.account}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          account: event.target.value,
                        }))
                      }
                      className={inputClassName}
                    />
                  </Field>
                </div>

                <Field label="Amount">
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
                    className={inputClassName}
                  />
                </Field>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
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
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Pending entries
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">
                    {manualTransactions.length} queued transactions
                  </h3>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-right">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Net impact
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {formatCompactCurrency(manualTotal, "INR")}
                  </p>
                </div>
              </div>

              {manualError ? (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {manualError}
                </div>
              ) : null}

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => void handleAnalyzeManual()}
                  disabled={manualLoading}
                  className="inline-flex flex-1 items-center justify-center rounded-2xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
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
                          <p className="mt-1 text-sm text-slate-500">
                            {transaction.category} · {transaction.account}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                            {transaction.date} · {transaction.type}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p
                            className={`text-sm font-semibold ${
                              transaction.type === "income"
                                ? "text-emerald-700"
                                : "text-rose-700"
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCompactCurrency(transaction.amount, "INR")}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              setManualTransactions((current) =>
                                current.filter(
                                  (_, itemIndex) => itemIndex !== index,
                                ),
                              )
                            }
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
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-7 text-slate-500">
                    No manual transactions added yet. Add entries here and click
                    <span className="font-medium text-slate-900">
                      {" "}
                      Analyze manual entries
                    </span>
                    to view your own summary.
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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm text-slate-700">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-300";
