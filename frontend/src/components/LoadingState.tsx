export function LoadingState({ label = "Loading data…" }: { label?: string }) {
  return (
    <div className="app-card app-loader-shell flex min-h-[260px] items-center justify-center rounded-[28px] px-6 py-8 text-slate-700">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex justify-center">
          <div className="app-loader-orbit">
            <div className="app-loader-ring" />
            <div className="app-loader-ring-reverse" />
            <div className="app-loader-core" />
          </div>
        </div>
        <p className="mt-6 text-base font-semibold text-slate-900">{label}</p>
        <p className="mt-2 text-sm leading-7 text-slate-500">
          Refreshing live data, charts, and summaries with a smoother loading
          flow.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="app-loader-skeleton h-11 rounded-2xl" />
          <div className="app-loader-skeleton h-11 rounded-2xl" />
          <div className="app-loader-skeleton h-11 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
