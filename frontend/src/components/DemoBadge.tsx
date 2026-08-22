export function DemoBadge({ label = "Demo Data" }: { label?: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
      {label}
    </span>
  );
}
