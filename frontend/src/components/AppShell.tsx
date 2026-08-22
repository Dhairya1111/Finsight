import {
  ArrowUpRight,
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  ChartCandlestick,
  Home,
  Landmark,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

const navItems = [
  {
    to: "/dashboard",
    label: "Overview",
    icon: Home,
    description:
      "Portfolio-grade control room for finance, markets, and macro data.",
  },
  {
    to: "/finance",
    label: "Personal Finance",
    icon: BriefcaseBusiness,
    description:
      "Upload or manually enter transactions and review savings behaviour.",
  },
  {
    to: "/markets",
    label: "Markets",
    icon: ChartCandlestick,
    description: "Compare companies, price history, and valuation context.",
  },
  {
    to: "/economics",
    label: "Economics",
    icon: Landmark,
    description:
      "Track India-focused macro indicators with public source metadata.",
  },
  {
    to: "/events",
    label: "Events",
    icon: Sparkles,
    description: "Study major shocks, timelines, and before/after snapshots.",
  },
  {
    to: "/simulator",
    label: "Simulator",
    icon: BrainCircuit,
    description: "Experiment with simplified what-if macro scenarios.",
  },
  {
    to: "/ai",
    label: "AI Analyst",
    icon: Bot,
    description:
      "Ask context-grounded questions using verified application data.",
  },
  {
    to: "/ml",
    label: "ML Lab",
    icon: BrainCircuit,
    description: "Compare model metrics on the synthetic risk demo dataset.",
  },
];

const quickActions = [
  { to: "/finance", label: "Add transactions" },
  { to: "/markets", label: "Compare companies" },
  { to: "/economics", label: "Track macro data" },
];

export function AppShell() {
  const location = useLocation();
  const activeItem =
    navItems.find((item) => location.pathname.startsWith(item.to)) ??
    navItems[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-[1680px] md:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="border-b border-white/8 bg-slate-950/95 px-5 py-5 backdrop-blur md:sticky md:top-0 md:h-screen md:overflow-y-auto md:border-b-0 md:border-r md:px-6 md:py-6">
          <div className="rounded-[28px] border border-white/8 bg-gradient-to-br from-brand-500/15 via-slate-900 to-slate-950 p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-300">
              FinSight
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-white">
              Financial intelligence
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Analyze your transactions, compare companies, explore macro data,
              and test scenarios from one clean workspace.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Navigation
            </p>
            <nav className="grid gap-2">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `group flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
                      isActive
                        ? "border-brand-400/40 bg-brand-500/12 text-white shadow-card"
                        : "border-white/5 bg-white/[0.03] text-slate-400 hover:border-white/10 hover:bg-white/6 hover:text-slate-100"
                    }`
                  }
                >
                  <span className="flex items-center gap-3">
                    <span className="rounded-xl bg-white/5 p-2 text-brand-200">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>{label}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 opacity-40 transition group-hover:opacity-100" />
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="mt-6 rounded-3xl border border-white/8 bg-white/[0.03] p-5 text-sm text-slate-300">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Quick actions
            </p>
            <div className="mt-4 grid gap-2">
              {quickActions.map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="rounded-2xl border border-white/8 bg-slate-950/70 px-4 py-3 text-slate-300 transition hover:border-brand-400/40 hover:text-white"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-emerald-300/15 bg-emerald-500/5 p-5 text-sm leading-7 text-emerald-100">
            <div className="flex items-center gap-2 text-emerald-200">
              <ShieldCheck className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em]">
                Demo-ready + safe
              </p>
            </div>
            <p className="mt-3 text-emerald-50/85">
              Demo data is clearly labeled, manual transaction entry is
              supported, and FinSight avoids presenting itself as financial
              advice.
            </p>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-white/8 bg-slate-950/85 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8 lg:px-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-300">
                  {activeItem.label}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {activeItem.description}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Educational mode
              </div>
            </div>
          </header>

          <main className="min-w-0 px-5 py-6 md:px-8 lg:px-10 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
