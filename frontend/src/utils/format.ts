export const formatCurrency = (
  value: number | null | undefined,
  currency = "USD",
) => {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: Math.abs(value) >= 100 ? 0 : 2,
  }).format(value);
};

export const formatCompactCurrency = (
  value: number | null | undefined,
  currency = "USD",
) => {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
};

export const formatPercent = (
  value: number | null | undefined,
  fractionDigits = 1,
) => {
  if (value === null || value === undefined) return "—";
  return `${(value * 100).toFixed(fractionDigits)}%`;
};

export const formatNumber = (
  value: number | null | undefined,
  maximumFractionDigits = 2,
) => {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(
    value,
  );
};

export const formatCompactNumber = (
  value: number | null | undefined,
  maximumFractionDigits = 1,
) => {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits,
  }).format(value);
};
