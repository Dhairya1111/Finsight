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
    <div className="app-card app-card-tilt rounded-[24px] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
          {hint ? (
            <p className="mt-2 text-xs leading-6 text-slate-500">{hint}</p>
          ) : null}
        </div>
        {icon ? (
          <div className="rounded-2xl bg-gradient-to-br from-violet-100 via-white to-teal-100 p-3 text-violet-700 shadow-[0_10px_24px_rgba(91,33,182,0.12)]">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
