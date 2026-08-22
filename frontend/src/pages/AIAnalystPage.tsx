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
      if (domain === "economics") payload.indicator_id = "gdp_growth";
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
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          eyebrow="AI financial analyst"
          title="Ask context-aware questions against verified in-app data"
          description="The AI provider abstraction supports remote LLM integration via environment variables, but the app remains usable in deterministic fallback mode when no API key is configured."
        />
        <DemoBadge label="Fallback mode available" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 xl:grid-cols-[0.85fr,1.15fr]"
      >
        <section className="rounded-3xl border border-white/8 bg-slate-900/75 p-5 shadow-card">
          <div className="space-y-4">
            <label className="block text-sm text-slate-300">
              Domain
              <select
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none"
              >
                <option value="markets">Markets</option>
                <option value="economics">Economics</option>
                <option value="finance">Personal finance</option>
                <option value="events">Economic events</option>
                <option value="general">General</option>
              </select>
            </label>
            {domain === "markets" ? (
              <label className="block text-sm text-slate-300">
                Symbol
                <select
                  value={symbol}
                  onChange={(event) => setSymbol(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none"
                >
                  <option value="AAPL">AAPL</option>
                  <option value="MSFT">MSFT</option>
                  <option value="INFY.NS">INFY.NS</option>
                </select>
              </label>
            ) : null}
            <label className="block text-sm text-slate-300">
              Question
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                rows={7}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none"
              />
            </label>
            <button
              type="submit"
              className="rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-400"
            >
              Analyze
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-white/8 bg-slate-900/75 p-5 shadow-card">
          {loading ? (
            <LoadingState label="Generating grounded analysis…" />
          ) : null}
          {error ? <ErrorState message={error} /> : null}
          {answer ? (
            <div className="space-y-5 text-sm leading-7 text-slate-300">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-300">
                  Summary
                </p>
                <p className="mt-3 whitespace-pre-wrap text-base text-slate-100">
                  {answer.answer}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-300">
                  Key points
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  {answer.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-300">
                  Caveats
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-400">
                  {answer.caveats.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-300">
                  References
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-400">
                  {answer.references.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : !loading ? (
            <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-dashed border-white/10 text-sm text-slate-400">
              Ask a question to see the AI analyst response here.
            </div>
          ) : null}
        </section>
      </form>
    </div>
  );
}
