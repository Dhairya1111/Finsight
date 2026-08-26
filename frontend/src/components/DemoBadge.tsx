export function DemoBadge({ label = "Demo Data" }: { label?: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-red-200 bg-gradient-to-r from-blue-50 to-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-red-700 shadow-[0_6px_16px_rgba(91,33,182,0.08)]">
      {label}
    </span>
  );
}
