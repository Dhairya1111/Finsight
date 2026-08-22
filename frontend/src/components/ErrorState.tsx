export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-6 text-sm text-rose-100">
      <p className="font-medium">Unable to load this section.</p>
      <p className="mt-2 text-rose-100/80">{message}</p>
      {onRetry ? (
        <button
          className="mt-4 rounded-full border border-rose-400/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-rose-100 transition hover:bg-rose-500/10"
          onClick={onRetry}
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
