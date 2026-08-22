export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
      <p className="font-medium">Unable to load this section.</p>
      <p className="mt-2 text-rose-700">{message}</p>
      {onRetry ? (
        <button
          className="mt-4 rounded-full border border-rose-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700 transition hover:bg-rose-100"
          onClick={onRetry}
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
