import {
  ArrowRight,
  BarChart3,
  Bot,
  BrainCircuit,
  ChartCandlestick,
  Database,
  Landmark,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

import { DemoBadge } from "../components/DemoBadge";
import { SectionHeading } from "../components/SectionHeading";

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
    title: "Reliable data workflows",
    icon: Database,
    description:
      "Typed APIs, traceable sources, saved ledger records, and structured analytics across the platform.",
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
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-700">
              FinSight
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Explore markets. Understand economies. Track your finances.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-900 to-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(30,58,138,0.16)] transition hover:from-blue-700 hover:to-red-500"
          >
            Open app
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1.1fr,0.9fr] lg:px-8 lg:py-16">
          <div className="space-y-6">
            <DemoBadge label="Starts with demo data" />
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
                A personal finance and market intelligence workspace.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-slate-600">
                FinSight combines transaction tracking, company analysis,
                economic indicators, event context, scenario modelling, and AI
                assistance in one clean product experience.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-900 to-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(30,58,138,0.16)] transition hover:from-blue-700 hover:to-red-500"
              >
                Explore dashboard
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Saved ledger", "Add and manage your own transactions"],
                ["Market data", "Readable numbers in K / M / B / T format"],
                ["Traceable data", "Sources stay visible across modules"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="app-card app-card-tilt rounded-[24px] p-5"
                >
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="app-card app-card-tilt rounded-[28px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Product snapshot</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                  Built to be used, not just showcased
                </h2>
              </div>
              <DemoBadge />
            </div>

            <div className="mt-6 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="app-subtle-panel rounded-[22px] p-5">
                  <p className="text-sm text-slate-500">Ledger</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    Add, edit, delete, and upload transactions
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Start with demo data, then move into your own saved ledger
                    without clutter or fake dashboard noise.
                  </p>
                </div>
                <div className="app-subtle-panel rounded-[22px] p-5">
                  <p className="text-sm text-slate-500">Markets</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    Price history and comparable metrics
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Review market cap, revenue, EPS, margins, and trends in a
                    more readable analyst layout.
                  </p>
                </div>
              </div>
              <div className="rounded-[22px] border border-slate-200 bg-red-50 p-5">
                <p className="text-sm text-red-700">Economic intelligence</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">
                  Indicator views with dates, units, and source notes
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-700">
                  Macroeconomic data stays tied to clear metadata, and the AI
                  layer is expected to say when data is unavailable instead of
                  inventing an answer.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <SectionHeading
            eyebrow="Features"
            title="A cleaner product direction"
            description="The interface is intentionally simpler and more useful, taking cues from practical finance and bookkeeping products rather than flashy concept dashboards."
          />

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map(({ title, icon: Icon, description }) => (
              <article
                key={title}
                className="app-card app-card-tilt rounded-[24px] p-6"
              >
                <div className="inline-flex rounded-2xl bg-red-50 p-3 text-red-700">
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
          <div className="app-card app-card-tilt rounded-[24px] p-6">
            <div className="flex items-center gap-3 text-red-700">
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

          <div className="app-card app-card-tilt rounded-[24px] p-6">
            <div className="flex items-center gap-3 text-red-700">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="text-lg font-semibold text-slate-900">
                Important note
              </h3>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              FinSight is built for serious analysis workflows. It does not use
              your data to generate personalized financial advice, and source
              notes remain visible so figures can be verified.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
