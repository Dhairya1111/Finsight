import type { SourceMeta } from "../types/api";

import { DemoBadge } from "./DemoBadge";

export function SourceNote({ source }: { source: SourceMeta }) {
  return (
    <div className="app-subtle-panel rounded-[20px] p-4 text-sm text-slate-600">
      <div className="mb-2 flex flex-wrap items-center gap-3">
        {source.is_demo ? <DemoBadge /> : null}
        <span className="font-medium text-slate-800">
          Source: {source.name}
        </span>
      </div>
      <div className="space-y-1">
        {source.url ? (
          <a
            className="text-emerald-700 underline-offset-4 hover:underline"
            href={source.url}
            target="_blank"
            rel="noreferrer"
          >
            {source.url}
          </a>
        ) : null}
        {source.data_date ? <p>Data date: {source.data_date}</p> : null}
        {source.last_updated ? (
          <p>Last updated: {source.last_updated}</p>
        ) : null}
        {source.note ? <p>{source.note}</p> : null}
      </div>
    </div>
  );
}
