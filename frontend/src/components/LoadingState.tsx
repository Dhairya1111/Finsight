export function LoadingState({ label = "Loading data…" }: { label?: string }) {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-white text-sm text-slate-500 shadow-sm">
      {label}
    </div>
  );
}
