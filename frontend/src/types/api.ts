export type SourceMeta = {
  name: string;
  url?: string | null;
  data_date?: string | null;
  last_updated?: string | null;
  is_demo: boolean;
  note?: string | null;
};

export type MonthlyPoint = {
  month: string;
  income: number;
  expenses: number;
  net_savings: number;
  savings_rate?: number | null;
};

export type CategoryPoint = {
  category: string;
  amount: number;
  share: number;
};

export type RecurringExpense = {
  description: string;
  category: string;
  occurrences: number;
  average_amount: number;
};

export type ManualTransactionInput = {
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  account: string;
};

export type LedgerTransaction = ManualTransactionInput & {
  id: number;
  created_at: string;
  updated_at: string;
};

export type FinanceSummary = {
  total_income: number;
  total_expenses: number;
  net_savings: number;
  savings_rate?: number | null;
  transaction_count: number;
  recurring_expenses: RecurringExpense[];
  spending_trend: string;
  monthly: MonthlyPoint[];
  categories: CategoryPoint[];
  budget_comparison: CategoryPoint[];
  source: SourceMeta;
};

export type PricePoint = { date: string; close: number };

export type CompanyMetricSeriesPoint = {
  year: number;
  revenue: number;
  eps: number;
  profit_margin: number;
};

export type CompanySearchResult = {
  symbol: string;
  name: string;
  exchange: string;
  sector?: string | null;
  industry?: string | null;
};

export type CompanyOverview = {
  symbol: string;
  name: string;
  sector: string;
  exchange: string;
  currency: string;
  latest_price?: number | null;
  market_cap?: number | null;
  revenue?: number | null;
  eps?: number | null;
  pe_ratio?: number | null;
  pb_ratio?: number | null;
  roe?: number | null;
  debt?: number | null;
  cash?: number | null;
  profit_margin?: number | null;
  revenue_growth?: number | null;
  earnings_growth?: number | null;
  source: SourceMeta;
  metrics_series: CompanyMetricSeriesPoint[];
};

export type CompanyHistoryResponse = {
  symbol: string;
  history: PricePoint[];
  source: SourceMeta;
};

export type CompanyComparisonRow = {
  metric: string;
  values: Record<string, number | null>;
};

export type IndicatorPoint = {
  date: string;
  value: number;
};

export type IndicatorResponse = {
  id: string;
  label: string;
  units: string;
  frequency: string;
  country: string;
  latest_value?: number | null;
  latest_date?: string | null;
  source: SourceMeta;
  series: IndicatorPoint[];
};

export type EconomicEvent = {
  id: string;
  title: string;
  date_range: string[];
  summary: string;
  transmission_mechanisms: string[];
  relevant_indicators: string[];
  notes: string;
};

export type EventAnalysisResponse = {
  event: EconomicEvent;
  before_period_return?: number | null;
  during_period_return?: number | null;
  recovery_period_return?: number | null;
  volatility_change?: number | null;
  market_series: IndicatorPoint[];
  indicator_snapshots: Record<string, Record<string, number | null>>;
  source: SourceMeta;
};

export type ScenarioOutput = {
  baseline: Record<string, number>;
  scenario: Record<string, number>;
  differences: Record<string, number>;
  assumptions: string[];
  methodology: string;
};

export type AIAnalysisResponse = {
  answer: string;
  bullets: string[];
  caveats: string[];
  references: string[];
  used_fallback: boolean;
};

export type MLDemoResponse = {
  metrics: {
    name: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
  }[];
  best_model: string;
  confusion_matrix: {
    true_negative: number;
    false_positive: number;
    false_negative: number;
    true_positive: number;
  };
  feature_importance: Record<string, number>;
  note: string;
};
