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
    title: "Market intelligence",
    icon: ChartCandlestick,
    description:
      "Review company snapshots, price history, valuation signals, and side-by-side comparisons through a clean analyst-style workspace.",
  },
  {
    title: "Economic explorer",
    icon: Landmark,
    description:
      "Track India-focused macro indicators with clear source attribution, frequency labels, and historical context.",
  },
  {
    title: "Personal finance",
    icon: BarChart3,
    description:
      "Upload transaction CSVs or use the bundled demo dataset to inspect spending, savings, recurring costs, and budgeting patterns.",
  },
  {
    title: "Scenario simulator",
    icon: BrainCircuit,
    description:
      "Experiment with simple what-if macro assumptions to explore directional effects on growth, inflation, sentiment, and currency pressure.",
  },
  {
    title: "AI analyst",
    icon: Bot,
    description:
      "Ask structured questions over verified in-app data using a provider abstraction with safe fallback mode when no API key is configured.",
  },
  {
    title: "Open-source engineering",
    icon: GitBranch,
    description:
      "Clean architecture, reproducible demo mode, FastAPI docs, TypeScript frontend, testing, CI, and deployment-ready configuration.",
  },
];

const stacks = [
  "React + TypeScript + Vite",
  "Tailwind CSS + Recharts",
  "FastAPI + Pydantic",
  "Pandas + NumPy + scikit-learn",
  "SQLite + SQLAlchemy",
  "Docker + GitHub Actions",
];

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="bg-glow">
        <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-300">
              FinSight
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Explore markets. Understand economies. Analyze your finances.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-full border border-white/10 px-5 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 md:inline-flex"
            >
              View on GitHub
            </a>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-400"
            >
              Explore Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <main>
          <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-20 pt-10 lg:grid-cols-[1.2fr,0.8fr] lg:px-8 lg:pb-28 lg:pt-14">
            <div className="space-y-6">
              <DemoBadge label="Portfolio-grade fintech project" />
              <div className="space-y-5">
                <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white md:text-6xl lg:text-7xl">
                  Financial intelligence without the spreadsheet chaos.
                </h1>
                <p className="max-w-3xl text-lg leading-9 text-slate-300">
                  Analyze markets, explore economic trends, understand financial
                  data, and experiment with economic scenarios in one
                  interactive platform.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                >
                  Explore Dashboard
                </Link>
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
                >
                  View on GitHub
                </a>
              </div>
              <div className="grid gap-4 pt-4 sm:grid-cols-3">
                {[
                  ["Modules", "7 core analytics workspaces"],
                  ["Demo mode", "Works without API keys"],
                  ["Design", "Recruiter-ready open-source polish"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-3xl border border-white/8 bg-white/5 p-5 backdrop-blur"
                  >
                    <p className="text-sm text-slate-400">{label}</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-card backdrop-blur">
              <div className="flex items-center justify-between border-b border-white/8 pb-4">
                <div>
                  <p className="text-sm text-slate-400">Live product preview</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">
                    FinSight Dashboard Shell
                  </h2>
                </div>
                <DemoBadge />
              </div>
              <div className="mt-6 grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/8 bg-slate-950/80 p-5">
                    <p className="text-sm text-slate-400">Markets</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      Compare fundamentals
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-500">
                      Historical price curves, valuation metrics, revenue/EPS
                      trends, and AI-assisted summaries.
                    </p>
                  </div>
                  <div className="rounded-3xl border border-white/8 bg-slate-950/80 p-5">
                    <p className="text-sm text-slate-400">Economics</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      India-focused macro signals
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-500">
                      GDP growth, inflation, unemployment, exchange rates,
                      government spending, exports, imports, and more.
                    </p>
                  </div>
                </div>
                <div className="rounded-3xl border border-white/8 bg-gradient-to-br from-brand-500/10 via-white/5 to-emerald-400/10 p-5">
                  <p className="text-sm text-slate-300">AI Analyst</p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    Context-aware explanations grounded in verified app data
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    Fallback mode stays functional offline and avoids pretending
                    to know facts the application does not have.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
            <SectionHeading
              eyebrow="Core features"
              title="Built to demonstrate finance + data + engineering depth"
              description="FinSight is intentionally structured like a serious open-source portfolio product rather than a toy dashboard."
            />
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {features.map(({ title, icon: Icon, description }) => (
                <article
                  key={title}
                  className="rounded-3xl border border-white/8 bg-slate-900/70 p-6 shadow-card backdrop-blur"
                >
                  <div className="inline-flex rounded-2xl bg-brand-500/10 p-3 text-brand-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-white">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[0.9fr,1.1fr] lg:px-8">
            <div className="rounded-[2rem] border border-white/8 bg-slate-900/70 p-8 shadow-card">
              <SectionHeading
                eyebrow="Technology stack"
                title="Modern, practical, and easy to run"
                description="The stack emphasizes readability, rapid iteration, typing, and a realistic path from local demo mode to deployment."
              />
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {stacks.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-slate-300"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/8 bg-slate-900/70 p-8 shadow-card">
              <SectionHeading
                eyebrow="Architecture"
                title="Provider abstractions, analytics services, and API-first design"
                description="Market, economics, and AI integrations are separated through provider interfaces so demo data and live sources can coexist without tightly coupling the product to one vendor."
              />
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {[
                  {
                    icon: Database,
                    title: "Data layer",
                    text: "Sample datasets, provider adapters, SQLAlchemy models, Pandas analytics.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Safety",
                    text: "CSV validation, clear disclaimers, no hard-coded secrets, bounded uploads, useful user errors.",
                  },
                ].map(({ icon: Icon, title, text }) => (
                  <div
                    key={title}
                    className="rounded-3xl border border-white/8 bg-slate-950/70 p-5"
                  >
                    <Icon className="h-5 w-5 text-brand-200" />
                    <h3 className="mt-4 text-lg font-semibold text-white">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-400">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="border-t border-white/8">
            <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
              <div className="rounded-[2rem] border border-amber-300/20 bg-amber-500/5 p-6 text-sm leading-7 text-amber-100">
                <p className="font-semibold uppercase tracking-[0.2em]">
                  Disclaimer
                </p>
                <p className="mt-3">
                  FinSight is an educational and research-oriented project. It
                  does not provide personalized financial advice, investment
                  recommendations, or reliable real-world forecasting.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
