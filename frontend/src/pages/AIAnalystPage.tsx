import { FormEvent, useState } from "react";

import { DemoBadge } from "../components/DemoBadge";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { SectionHeading } from "../components/SectionHeading";
import { api } from "../services/api";
import type { AIAnalysisResponse } from "../types/api";

export function AIAnalystPage() {
  const [question, setQuestion] = useState(
    "Compare Apple and Microsoft using the verified FinSight data.",
  );
  const [domain, setDomain] = useState("markets");
  const [symbol, setSymbol] = useState("AAPL");
  const [answer, setAnswer] = useState<AIAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: Record<string, string> = { question, domain };
      if (domain === "markets") payload.symbol = symbol;
      if (domain === "events") payload.event_id = "covid-19-shock-2020";
      const response = await api.askAI(payload);
      setAnswer(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          eyebrow="AI analyst"
          title="Ask about your data"
          description="This tool stays grounded in FinSight data. In demo mode, responses use a conservative fallback system instead of pretending to know extra facts."
        />
        <DemoBadge label="Fallback available" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]"
      >
        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="space-y-4">
            <label className="block text-sm text-slate-700">
              Domain
              <select
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-300"
              >
                <option value="markets">Markets</option>
                <option value="economics">Economics</option>
                <option value="finance">Personal finance</option>
                <option value="events">Economic events</option>
                <option value="general">General</option>
              </select>
            </label>

            {domain === "markets" ? (
              <label className="block text-sm text-slate-700">
                Symbol
                <select
                  value={symbol}
                  onChange={(event) => setSymbol(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-300"
                >
                  <option value="AAPL">AAPL</option>
                  <option value="MSFT">MSFT</option>
                  <option value="INFY.NS">INFY.NS</option>
                </select>
              </label>
            ) : null}

            <label className="block text-sm text-slate-700">
              Question
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                rows={8}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-300"
              />
            </label>

            <button
              type="submit"
              className="rounded-full bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Run analysis
            </button>
          </div>
        </section>

        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          {loading ? <LoadingState label="Preparing analysis…" /> : null}
          {error ? <ErrorState message={error} /> : null}

          {answer ? (
            <div className="space-y-5 text-sm leading-7 text-slate-700">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Summary
                </p>
                <p className="mt-3 whitespace-pre-wrap text-base text-slate-900">
                  {answer.answer}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Notes
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  {answer.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Caveats
                  </p>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
                    {answer.caveats.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    References
                  </p>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
                    {answer.references.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : !loading ? (
            <div className="flex min-h-[280px] items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
              Ask a question to see the analysis here.
            </div>
          ) : null}
        </section>
      </form>
    </div>
  );
}
