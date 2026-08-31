const MARKET_SELECTION_KEY = "finsight-selected-market-company";

export type SelectedMarketCompany = {
  symbol: string;
  name: string;
};

const fallbackSelection: SelectedMarketCompany = {
  symbol: "NVDA",
  name: "NVIDIA Corporation",
};

export function getSelectedMarketCompany(): SelectedMarketCompany {
  if (typeof window === "undefined") {
    return fallbackSelection;
  }

  try {
    const raw = window.localStorage.getItem(MARKET_SELECTION_KEY);
    if (!raw) return fallbackSelection;
    const parsed = JSON.parse(raw) as Partial<SelectedMarketCompany>;
    if (!parsed.symbol || !parsed.name) return fallbackSelection;
    return { symbol: parsed.symbol, name: parsed.name };
  } catch {
    return fallbackSelection;
  }
}

export function setSelectedMarketCompany(company: SelectedMarketCompany) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MARKET_SELECTION_KEY, JSON.stringify(company));
  } catch {
    // ignore storage issues
  }
}
