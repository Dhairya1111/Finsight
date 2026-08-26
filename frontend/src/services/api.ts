import type {
  AIAnalysisResponse,
  CompanyComparisonRow,
  CompanyHistoryResponse,
  CompanyOverview,
  CompanySearchResult,
  EconomicEvent,
  EventAnalysisResponse,
  FinanceSummary,
  IndicatorResponse,
  LedgerTransaction,
  ManualTransactionInput,
  MLDemoResponse,
  ScenarioOutput,
  ShareLinkResponse,
  SharedLedgerResponse,
  VoiceEntryResponse,
} from "../types/api";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, options);
  if (!response.ok) {
    const payload = await response
      .json()
      .catch(() => ({ detail: "Request failed." }));
    throw new Error(payload.detail ?? "Request failed.");
  }
  return response.json() as Promise<T>;
}

export const api = {
  financeSummary: () => request<FinanceSummary>("/finance/summary"),
  financeTransactions: () =>
    request<LedgerTransaction[]>("/finance/transactions"),
  createTransaction: (transaction: ManualTransactionInput) =>
    request<LedgerTransaction>("/finance/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transaction),
    }),
  updateTransaction: (id: number, transaction: ManualTransactionInput) =>
    request<LedgerTransaction>(`/finance/transactions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transaction),
    }),
  deleteTransaction: (id: number) =>
    request<{ message: string }>(`/finance/transactions/${id}`, {
      method: "DELETE",
    }),
  createVoiceEntry: (text: string) =>
    request<VoiceEntryResponse>("/finance/voice-entry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }),
  createShareLink: () =>
    request<ShareLinkResponse>("/finance/share", { method: "POST" }),
  getSharedLedger: (token: string) =>
    request<SharedLedgerResponse>(`/finance/shared/${token}`),
  resetTransactions: () =>
    request<FinanceSummary>("/finance/reset", { method: "POST" }),
  uploadFinanceCsv: (file: File) => {
    const body = new FormData();
    body.append("file", file);
    return request<FinanceSummary>("/finance/upload", {
      method: "POST",
      body,
    });
  },
  analyzeManualTransactions: (transactions: ManualTransactionInput[]) =>
    request<FinanceSummary>("/finance/analyze-manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactions }),
    }),
  listCompanies: () => request<{ symbols: string[] }>("/markets/companies"),
  searchCompanies: (query: string) =>
    request<CompanySearchResult[]>(
      `/markets/search?query=${encodeURIComponent(query)}`,
    ),
  companyOverview: (symbol: string) =>
    request<CompanyOverview>(`/markets/company/${symbol}`),
  companyHistory: (symbol: string) =>
    request<CompanyHistoryResponse>(`/markets/company/${symbol}/history`),
  compareCompanies: (symbols: string[]) => {
    const params = new URLSearchParams();
    symbols.forEach((symbol) => params.append("symbols", symbol));
    return request<CompanyComparisonRow[]>(
      `/markets/compare?${params.toString()}`,
    );
  },
  indicators: () => request<IndicatorResponse[]>("/economics/indicators"),
  indicator: (indicatorId: string) =>
    request<IndicatorResponse>(`/economics/indicators/${indicatorId}`),
  events: () => request<EconomicEvent[]>("/events"),
  analyzeEvent: (eventId: string) =>
    request<EventAnalysisResponse>(`/events/analyze/${eventId}`, {
      method: "POST",
    }),
  runScenario: (payload: Record<string, number>) =>
    request<ScenarioOutput>("/simulation/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  askAI: (payload: Record<string, string>) =>
    request<AIAnalysisResponse>("/ai/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  mlDemo: () => request<MLDemoResponse>("/ml/risk-demo"),
};
