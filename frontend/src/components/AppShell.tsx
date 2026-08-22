import {
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  ChartCandlestick,
  Home,
  Landmark,
  Menu,
  Sparkles,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: Home },
  { to: "/finance", label: "Personal Finance", icon: BriefcaseBusiness },
  { to: "/markets", label: "Markets", icon: ChartCandlestick },
  { to: "/economics", label: "Economics", icon: Landmark },
  { to: "/events", label: "Events", icon: Sparkles },
  { to: "/simulator", label: "Simulator", icon: BrainCircuit },
  { to: "/ai", label: "AI Analyst", icon: Bot },
  { to: "/ml", label: "ML Lab", icon: BrainCircuit },
];

export function AppShell() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-white/8 bg-slate-950/95 px-5 py-5 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-300">
                FinSight
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-white">
                Financial intelligence
              </h1>
            </div>
            <div className="rounded-2xl border border-white/10 p-2 text-slate-400 lg:hidden">
              <Menu className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Educational analytics for markets, economics, and personal finance.
            Never investment advice.
          </p>
          <nav className="mt-6 grid gap-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                    isActive
                      ? "bg-brand-500/15 text-white shadow-card"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="mt-6 rounded-3xl border border-white/8 bg-white/5 p-4 text-sm text-slate-300">
            <p className="font-medium text-white">Demo-ready workflow</p>
            <p className="mt-2 leading-7 text-slate-400">
              Explore sample transactions, bundled company snapshots, public
              macro datasets, scenario modelling, and fallback AI commentary.
            </p>
          </div>
        </aside>
        <main className="flex-1 px-5 py-6 md:px-8 lg:px-10 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
