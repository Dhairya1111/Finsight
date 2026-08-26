import {
  ArrowRight,
  BarChart3,
  Bot,
  BrainCircuit,
  ChartCandlestick,
  Database,
  GitBranch,
  Landmark,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

import { DemoBadge } from "../components/DemoBadge";
import { SectionHeading } from "../components/SectionHeading";

const githubUrl =
  import.meta.env.VITE_GITHUB_URL ??
  "https://github.com/your-username/finsight";

const features = [
  {
    title: "Ledger and personal finance",
    icon: BarChart3,
    description:
      "Track spending, savings, recurring expenses, and monthly cash flow from demo, uploaded, or manually entered transactions.",
  },
  {
    title: "Market analysis",
    icon: ChartCandlestick,
    description:
      "Review price history, key metrics, and comparison tables for selected companies.",
  },
  {
    title: "Economic dashboard",
    icon: Landmark,
    description:
      "Explore India-focused macro indicators with clear units, dates, and source notes.",
  },
  {
    title: "Scenario simulator",
    icon: BrainCircuit,
    description:
      "Test simplified what-if assumptions for rates, inflation, oil, and government spending.",
  },
  {
    title: "AI analyst",
    icon: Bot,
    description:
      "Ask plain-language questions grounded in verified app data with a safe fallback mode.",
  },
  {
    title: "Open-source build quality",
    icon: GitBranch,
    description:
      "Structured backend, typed frontend, tests, provider abstractions, and deployment setup.",
  },
];

const stack = [
  "React",
  "TypeScript",
  "FastAPI",
  "Pandas",
  "SQLite",
  "Tailwind CSS",
  "Recharts",
  "scikit-learn",
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
              FinSight
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Explore markets. Understand economies. Analyze your finances.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 md:inline-flex"
            >
              View on GitHub
            </a>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-blue-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Open App
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1.1fr,0.9fr] lg:px-8 lg:py-16">
          <div className="space-y-6">
            <DemoBadge label="Demo mode included" />
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
                Financial intelligence without the spreadsheet chaos.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-slate-600">
                FinSight brings together transaction analysis, market research,
                economic indicators, scenario modelling, and AI-assisted notes
                in one clean workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
              >
                Explore dashboard
              </Link>
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Repository
              </a>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Works offline", "Bundled demo datasets"],
                ["Finance tools", "Manual entry + CSV upload"],
                ["Architecture", "Frontend + backend + providers"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Product snapshot</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                  Built like a practical finance app
                </h2>
              </div>
              <DemoBadge />
            </div>

            <div className="mt-6 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Ledger</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    Manual entries, upload, and summaries
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Start with demo data or add your own transactions directly
                    in the finance module.
                  </p>
                </div>
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Market data</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    Comparison and historical context
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Track price history, EPS, revenue trends, and demo or
                    live-like providers.
                  </p>
                </div>
              </div>
              <div className="rounded-[22px] border border-slate-200 bg-blue-50 p-5">
                <p className="text-sm text-blue-700">Economic intelligence</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">
                  India-focused indicators with dates, units, and source notes
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-700">
                  GDP growth, inflation, unemployment, exchange rate, and other
                  macro indicators are shown with traceable metadata.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <SectionHeading
            eyebrow="Features"
            title="A cleaner product direction"
            description="The UI is intentionally simpler and more useful, taking cues from practical bookkeeping and finance tools rather than flashy concept dashboards."
          />

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map(({ title, icon: Icon, description }) => (
              <article
                key={title}
                className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="inline-flex rounded-2xl bg-blue-50 p-3 text-blue-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-6 py-14 lg:grid-cols-[1fr,1fr] lg:px-8">
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-blue-700">
              <Database className="h-5 w-5" />
              <h3 className="text-lg font-semibold text-slate-900">
                Tech stack
              </h3>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {stack.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-blue-700">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="text-lg font-semibold text-slate-900">
                Important note
              </h3>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              FinSight is an educational and research-oriented project. It does
              not provide personalized financial advice, lending decisions, or
              reliable real-world forecasting.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
