export function LoadingState({ label = "Loading data…" }: { label?: string }) {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-white/10 bg-slate-900/60 text-sm text-slate-400">
      {label}
    </div>
  );
}
