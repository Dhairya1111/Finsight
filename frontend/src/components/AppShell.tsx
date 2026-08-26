import {
  ArrowUpRight,
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  ChartCandlestick,
  ChevronLeft,
  ChevronRight,
  Home,
  Landmark,
  Menu,
  ReceiptText,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

import { cn } from "../utils/cn";

const SIDEBAR_STORAGE_KEY = "finsight-sidebar-collapsed";

const navItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: Home,
    description: "Business snapshot",
  },
  {
    to: "/finance",
    label: "Ledger",
    icon: ReceiptText,
    description: "Transactions & cash flow",
  },
  {
    to: "/markets",
    label: "Markets",
    icon: ChartCandlestick,
    description: "Company analysis",
  },
  {
    to: "/economics",
    label: "Economics",
    icon: Landmark,
    description: "India macro data",
  },
  {
    to: "/events",
    label: "Events",
    icon: Sparkles,
    description: "Major market events",
  },
  {
    to: "/simulator",
    label: "Simulator",
    icon: BrainCircuit,
    description: "What-if scenarios",
  },
  {
    to: "/ai",
    label: "AI Analyst",
    icon: Bot,
    description: "Q&A on verified data",
  },
  {
    to: "/ml",
    label: "ML Lab",
    icon: BriefcaseBusiness,
    description: "Model metrics demo",
  },
];

const shortcuts = [
  { to: "/finance", label: "Add transaction" },
  { to: "/markets", label: "Compare companies" },
  { to: "/economics", label: "View indicators" },
];

export function AppShell() {
  const location = useLocation();
  const activeItem =
    navItems.find((item) => location.pathname.startsWith(item.to)) ??
    navItems[0];
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  });

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {mobileSidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-20 bg-slate-900/30 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      ) : null}

      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside
          id="app-sidebar"
          className={cn(
            "fixed inset-y-0 left-0 z-30 overflow-y-auto overflow-x-hidden overscroll-contain border-r border-slate-200 bg-white transition-all duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0",
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
            sidebarCollapsed ? "md:w-0 md:border-r-0" : "w-72 md:w-[290px]",
          )}
          aria-hidden={sidebarCollapsed && !mobileSidebarOpen}
        >
          <div className="flex h-full w-72 flex-col px-5 py-5 md:w-[290px] md:px-5 md:py-6">
            <div className="rounded-[24px] bg-blue-700 px-5 py-5 text-white shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100">
                    FinSight
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold">
                    Business dashboard
                  </h1>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSidebarCollapsed(true)}
                    className="hidden rounded-xl border border-white/20 p-2 text-blue-100 transition hover:bg-white/10 md:inline-flex"
                    aria-label="Collapse sidebar"
                    title="Collapse sidebar"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="rounded-xl border border-white/20 p-2 text-blue-100 transition hover:bg-white/10 md:hidden"
                    aria-label="Close sidebar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm leading-6 text-blue-100">
                Ledger-style financial workspace inspired by practical business
                apps.
              </p>
            </div>

            <div className="mt-6">
              <p className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Navigation
              </p>
              <nav className="mt-3 grid gap-2">
                {navItems.map(({ to, label, icon: Icon, description }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `group rounded-[18px] border px-4 py-3 transition ${
                        isActive
                          ? "border-blue-200 bg-blue-50 text-blue-900"
                          : "border-transparent bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50"
                      }`
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-3">
                        <span className="rounded-xl bg-slate-100 p-2 text-slate-600 group-hover:bg-white">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-medium">
                            {label}
                          </span>
                          <span className="block text-xs text-slate-500">
                            {description}
                          </span>
                        </span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="mt-6 rounded-[22px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Quick actions
              </p>
              <div className="mt-3 grid gap-2">
                {shortcuts.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:text-blue-800"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 md:px-8 lg:px-10">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-controls="app-sidebar"
                  aria-label={
                    mobileSidebarOpen ? "Close navigation" : "Open navigation"
                  }
                  aria-expanded={mobileSidebarOpen}
                  onClick={() => setMobileSidebarOpen((current) => !current)}
                  className="inline-flex rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 md:hidden"
                >
                  {mobileSidebarOpen ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Menu className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  aria-controls="app-sidebar"
                  aria-label={
                    sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
                  }
                  aria-expanded={!sidebarCollapsed}
                  onClick={() => setSidebarCollapsed((current) => !current)}
                  className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 md:inline-flex"
                >
                  {sidebarCollapsed ? (
                    <>
                      <ChevronRight className="h-4 w-4" />
                      <span>Show menu</span>
                    </>
                  ) : (
                    <>
                      <ChevronLeft className="h-4 w-4" />
                      <span>Hide menu</span>
                    </>
                  )}
                </button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                    {activeItem.label}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {activeItem.description}
                  </p>
                </div>
              </div>
              <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Live workspace
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
