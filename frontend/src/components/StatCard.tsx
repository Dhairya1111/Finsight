import { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/8 bg-slate-900/75 p-5 shadow-card backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
          {hint ? (
            <p className="mt-2 text-xs leading-6 text-slate-500">{hint}</p>
          ) : null}
        </div>
        {icon ? (
          <div className="rounded-2xl bg-white/5 p-3 text-brand-200">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
