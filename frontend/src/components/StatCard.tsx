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
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
          {hint ? (
            <p className="mt-2 text-xs leading-6 text-slate-500">{hint}</p>
          ) : null}
        </div>
        {icon ? (
          <div className="rounded-2xl bg-sky-50 p-3 text-sky-700">{icon}</div>
        ) : null}
      </div>
    </div>
  );
}
