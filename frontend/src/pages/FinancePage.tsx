import {
  CalendarDays,
  Check,
  ChevronDown,
  Copy,
  Mic,
  MicOff,
  PencilLine,
  RefreshCcw,
  Save,
  Share2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  ChangeEvent,
  FormEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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
import type {
  LedgerTransaction,
  ManualTransactionInput,
  VoiceEntryResponse,
} from "../types/api";
import {
  formatCompactCurrency,
  formatCurrency,
  formatNumber,
  formatPercent,
} from "../utils/format";

const expenseCategories = [
  "Housing",
  "Groceries",
  "Dining",
  "Transport",
  "Fuel",
  "Utilities",
  "Internet & Mobile",
  "Shopping",
  "Health",
  "Insurance",
  "Entertainment",
  "Travel",
  "Education",
  "Subscriptions",
  "Bills",
  "EMI / Loans",
  "Taxes",
  "Family",
  "Gifts",
  "Pets",
  "Business",
  "Savings Transfer",
  "Investments",
  "Charity",
  "Other Expense",
];

const incomeCategories = [
  "Salary",
  "Bonus",
  "Freelance",
  "Business Income",
  "Interest",
  "Dividend",
  "Rental Income",
  "Refund",
  "Cashback",
  "Other Income",
];

const defaultAccounts = [
  "Primary Checking",
  "Savings Account",
  "Cash",
  "Credit Card",
  "UPI Wallet",
  "Brokerage",
  "Business Account",
  "Joint Account",
  "Emergency Fund",
  "Loan Account",
  "Other Account",
];

type TransactionDraft = ManualTransactionInput;

const initialDraft: TransactionDraft = {
  date: new Date().toISOString().slice(0, 10),
  description: "",
  category: "Groceries",
  amount: 0,
  type: "expense",
  account: "Primary Checking",
};

export function FinancePage() {
  const finance = useAsyncData(api.financeSummary);
  const transactions = useAsyncData(api.financeTransactions);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<TransactionDraft>(initialDraft);

  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceMessage, setVoiceMessage] = useState<string | null>(null);
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const hasSavedTransactions = (transactions.data?.length ?? 0) > 0;
  const speechSupported = Boolean(getSpeechRecognitionConstructor());

  const categoryOptions = useMemo(() => {
    const existing = (transactions.data ?? []).map((item) => item.category);
    return Array.from(
      new Set([...expenseCategories, ...incomeCategories, ...existing]),
    ).sort();
  }, [transactions.data]);

  const accountOptions = useMemo(() => {
    const existing = (transactions.data ?? []).map((item) => item.account);
    return Array.from(new Set([...defaultAccounts, ...existing])).sort();
  }, [transactions.data]);

  const topCategories = useMemo(
    () =>
      finance.data?.categories.slice(0, 6).map((item) => ({
        category: item.category,
        amount: item.amount,
      })) ?? [],
    [finance.data],
  );

  const currentDatasetLabel = hasSavedTransactions
    ? "Personal ledger active"
    : "Demo data active";

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const handleDraftChange = <K extends keyof TransactionDraft>(
    key: K,
    value: TransactionDraft[K],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setDraft(initialDraft);
    setFormError(null);
  };

  const refreshFinanceState = async (
    summaryOverride?: Awaited<ReturnType<typeof api.financeSummary>>,
  ) => {
    if (summaryOverride) {
      finance.setData(summaryOverride);
    } else {
      await finance.reload();
    }
    await transactions.reload();
  };

  const validateDraft = () => {
    if (!draft.date) return "Please choose a date.";
    if (!draft.description.trim()) return "Please enter a description.";
    if (!draft.category.trim()) return "Please choose a category.";
    if (!draft.account.trim()) return "Please choose an account.";
    if (!Number.isFinite(draft.amount) || draft.amount <= 0) {
      return "Amount must be greater than zero.";
    }
    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateDraft();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const payload: ManualTransactionInput = {
        ...draft,
        description: draft.description.trim(),
        category: draft.category.trim(),
        account: draft.account.trim(),
        amount: Number(draft.amount),
      };

      if (editingId !== null) {
        await api.updateTransaction(editingId, payload);
      } else {
        await api.createTransaction(payload);
      }

      await refreshFinanceState();
      resetForm();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to save transaction.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFormError(null);
    try {
      const summary = await api.uploadFinanceCsv(file);
      await refreshFinanceState(summary);
      resetForm();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleDelete = async (transactionId: number) => {
    setFormError(null);
    try {
      await api.deleteTransaction(transactionId);
      await refreshFinanceState();
      if (editingId === transactionId) {
        resetForm();
      }
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to remove transaction.",
      );
    }
  };

  const handleEdit = (transaction: LedgerTransaction) => {
    setEditingId(transaction.id);
    setFormError(null);
    setDraft({
      date: transaction.date,
      description: transaction.description,
      category: transaction.category,
      amount: transaction.amount,
      type: transaction.type,
      account: transaction.account,
    });
  };

  const handleResetToDemo = async () => {
    setFormError(null);
    setShareMessage(null);
    try {
      const summary = await api.resetTransactions();
      await refreshFinanceState(summary);
      resetForm();
      setShareLink("");
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to restore demo data.",
      );
    }
  };

  const applyVoiceResultToDraft = (result: VoiceEntryResponse) => {
    const transaction = result.parsed_transaction;
    setDraft({
      date: transaction.date,
      description: transaction.description,
      category: transaction.category,
      amount: transaction.amount,
      type: transaction.type,
      account: transaction.account,
    });
    setVoiceMessage(
      [result.message, ...result.warnings].filter(Boolean).join(" "),
    );
  };

  const saveVoiceEntry = async (transcript: string) => {
    if (!transcript.trim()) {
      setVoiceMessage("No speech detected. Please try again.");
      return;
    }

    setVoiceProcessing(true);
    setVoiceMessage("Processing voice entry...");
    setFormError(null);

    try {
      const result = await api.createVoiceEntry(transcript);
      applyVoiceResultToDraft(result);
      await refreshFinanceState();
      setEditingId(null);
    } catch (error) {
      setVoiceMessage(
        error instanceof Error
          ? error.message
          : "Unable to process the voice entry.",
      );
    } finally {
      setVoiceProcessing(false);
    }
  };

  const handleVoiceCapture = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognitionCtor = getSpeechRecognitionConstructor();
    if (!SpeechRecognitionCtor) {
      setVoiceMessage(
        "Speech recognition is not supported in this browser preview.",
      );
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    let finalTranscript = "";

    recognition.onstart = () => {
      setIsRecording(true);
      setVoiceTranscript("");
      setVoiceMessage("Listening... say one transaction clearly.");
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();
      setVoiceTranscript(transcript);
      finalTranscript = transcript;
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      setIsRecording(false);
      setVoiceMessage(`Voice input failed: ${event.error}`);
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (finalTranscript.trim()) {
        void saveVoiceEntry(finalTranscript);
      }
    };

    recognition.start();
  };

  const handleCreateShareLink = async () => {
    setShareMessage(null);
    setCopied(false);
    try {
      const response = await api.createShareLink();
      const absoluteUrl = new URL(
        response.share_path,
        window.location.origin,
      ).toString();
      setShareLink(absoluteUrl);
      setShareMessage("Share link created. Anyone with the link can view it.");
    } catch (error) {
      setShareMessage(
        error instanceof Error ? error.message : "Unable to create share link.",
      );
    }
  };

  const handleCopyShareLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setShareMessage("Copy failed. You can still copy the link manually.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          eyebrow="Ledger"
          title="Transactions and cash flow"
          description="Add your own transactions, edit them later, upload a CSV, or start from the demo dataset. Once you begin saving your own ledger, the app automatically switches away from demo data."
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void handleResetToDemo()}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCcw className="h-4 w-4" />
            Restore demo
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
        <LoadingState label="Loading ledger…" />
      ) : null}
      {finance.error ? (
        <ErrorState message={finance.error} onRetry={finance.reload} />
      ) : null}
      {transactions.error ? (
        <ErrorState
          message={transactions.error}
          onRetry={transactions.reload}
        />
      ) : null}

      {finance.data ? (
        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.3fr)_390px]">
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
                    Track every transaction in one working ledger.
                  </h3>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                    Summary cards and charts use the active ledger dataset. If
                    you save your own transactions, those become the primary
                    dataset automatically.
                  </p>
                </div>
                <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-right text-sm text-slate-600">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Current source
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {finance.data.source.is_demo
                      ? "Demo sample"
                      : "Saved ledger"}
                  </p>
                  <p className="mt-1">
                    {formatNumber(finance.data.transaction_count, 0)}{" "}
                    transactions
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
                subtitle="Converted to positive values for easier reading."
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
                title="Net savings"
                subtitle="Quick view of the monthly balance trend."
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
                subtitle="Where most of the money is going in the active ledger."
              >
                <BarTrendChart
                  data={topCategories}
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
                  Repeated descriptions can highlight subscriptions, rent, or
                  other regular commitments.
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
                          {formatCurrency(item.average_amount, "INR")} average
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                      No recurring pattern detected in the active ledger yet.
                    </div>
                  )}
                </div>
              </section>
            </div>

            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Saved transactions
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Add, edit, and delete entries directly from the ledger.
                  </p>
                </div>
                {hasSavedTransactions ? (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                    {transactions.data?.length ?? 0} saved
                  </span>
                ) : null}
              </div>

              {transactions.loading && !transactions.data ? (
                <div className="mt-4">
                  <LoadingState label="Loading saved transactions…" />
                </div>
              ) : null}

              {hasSavedTransactions ? (
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
                        <th className="px-4 py-2 font-medium text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(transactions.data ?? []).map((transaction) => (
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
                          <td className="border-y border-slate-200 px-4 py-3">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                transaction.type === "income"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              {transaction.type}
                            </span>
                          </td>
                          <td
                            className={`border-y border-slate-200 px-4 py-3 font-semibold ${
                              transaction.type === "income"
                                ? "text-emerald-700"
                                : "text-rose-700"
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCurrency(transaction.amount, "INR")}
                          </td>
                          <td className="rounded-r-2xl border-y border-r border-slate-200 px-4 py-3 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleEdit(transaction)}
                                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
                                aria-label={`Edit ${transaction.description}`}
                              >
                                <PencilLine className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  void handleDelete(transaction.id)
                                }
                                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-rose-300 hover:text-rose-600"
                                aria-label={`Delete ${transaction.description}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-7 text-slate-500">
                  No saved personal transactions yet. The dashboard is currently
                  using demo data. Add a transaction, speak one, or upload a CSV
                  to switch to your own ledger.
                </div>
              )}
            </section>

            <SourceNote source={finance.data.source} />
          </div>

          <div className="space-y-6 2xl:sticky 2xl:top-24 2xl:self-start">
            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Voice entry
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">
                    Speak a transaction
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleVoiceCapture}
                  disabled={!speechSupported || voiceProcessing}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isRecording
                      ? "bg-rose-600 text-white hover:bg-rose-500"
                      : "bg-blue-700 text-white hover:bg-blue-600"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {isRecording ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                  {isRecording ? "Stop" : "Record"}
                </button>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Example: “Spent 500 on groceries using upi today” or “Received
                salary 85000 in bank”. The app converts your speech to text,
                interprets it, and saves the transaction.
              </p>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Transcript
                </p>
                <p className="mt-2 min-h-[48px] text-sm text-slate-700">
                  {voiceTranscript || "Nothing recorded yet."}
                </p>
              </div>
              {voiceMessage ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-blue-50 px-4 py-3 text-sm text-slate-700">
                  {voiceMessage}
                </div>
              ) : null}
              {!speechSupported ? (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Voice entry depends on browser speech recognition support.
                </div>
              ) : null}
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {editingId === null
                      ? "Add transaction"
                      : "Edit transaction"}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">
                    {editingId === null
                      ? "Save a ledger entry"
                      : "Update selected entry"}
                  </h3>
                </div>
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                  <CalendarDays className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                Categories and accounts use app-style dropdowns so entry stays
                fast and consistent.
              </p>

              {formError ? (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {formError}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Date">
                    <input
                      type="date"
                      value={draft.date}
                      onChange={(event) =>
                        handleDraftChange("date", event.target.value)
                      }
                      className={inputClassName}
                    />
                  </Field>
                  <Field label="Type">
                    <select
                      value={draft.type}
                      onChange={(event) =>
                        handleDraftChange(
                          "type",
                          event.target.value as TransactionDraft["type"],
                        )
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
                      handleDraftChange("description", event.target.value)
                    }
                    placeholder="Rent, salary, groceries, freelance payment"
                    className={inputClassName}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField
                    label="Category"
                    value={draft.category}
                    onChange={(value) => handleDraftChange("category", value)}
                    options={categoryOptions}
                    groups={[
                      {
                        label: "Expense categories",
                        options: expenseCategories,
                      },
                      { label: "Income categories", options: incomeCategories },
                    ]}
                  />
                  <SelectField
                    label="Account"
                    value={draft.account}
                    onChange={(value) => handleDraftChange("account", value)}
                    options={accountOptions}
                  />
                </div>

                <Field label="Amount">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={draft.amount || ""}
                    onChange={(event) =>
                      handleDraftChange(
                        "amount",
                        Number(event.target.value || 0),
                      )
                    }
                    placeholder="0.00"
                    className={inputClassName}
                  />
                </Field>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {editingId === null ? (
                      <Save className="h-4 w-4" />
                    ) : (
                      <PencilLine className="h-4 w-4" />
                    )}
                    {saving
                      ? "Saving…"
                      : editingId === null
                        ? "Save transaction"
                        : "Update transaction"}
                  </button>
                  {editingId !== null ? (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Share ledger
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">
                    Create a view-only link
                  </h3>
                </div>
                <Share2 className="h-5 w-5 text-blue-700" />
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Generate a link so others can view your current saved expenses,
                income, and summary in read-only mode.
              </p>
              <button
                type="button"
                onClick={() => void handleCreateShareLink()}
                disabled={!hasSavedTransactions}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Share2 className="h-4 w-4" />
                Generate share link
              </button>
              {!hasSavedTransactions ? (
                <p className="mt-3 text-sm text-slate-500">
                  Save at least one personal transaction before sharing.
                </p>
              ) : null}
              {shareMessage ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {shareMessage}
                </div>
              ) : null}
              {shareLink ? (
                <div className="mt-4 space-y-3">
                  <input
                    readOnly
                    value={shareLink}
                    className={inputClassName}
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => void handleCopyShareLink()}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copied ? "Copied" : "Copy link"}
                    </button>
                    <a
                      href={shareLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex flex-1 items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Open shared view
                    </a>
                  </div>
                </div>
              ) : null}
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

function SelectField({
  label,
  value,
  onChange,
  options,
  groups,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  groups?: { label: string; options: string[] }[];
}) {
  const valueExists = options.includes(value);

  return (
    <label className="block text-sm text-slate-700">
      {label}
      <div className="relative mt-2">
        <select
          value={valueExists ? value : value || (options[0] ?? "")}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClassName} appearance-none pr-10`}
        >
          {groups?.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </optgroup>
          ))}
          {!groups
            ? options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))
            : null}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </label>
  );
}

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

type SpeechRecognitionResultLike = {
  0?: { transcript?: string };
};

type SpeechRecognitionEventLike = {
  results: Iterable<SpeechRecognitionResultLike>;
};

type SpeechRecognitionErrorEventLike = {
  error: string;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100";
