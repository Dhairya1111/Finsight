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
  const [headerCondensed, setHeaderCondensed] = useState(false);
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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      setHeaderCondensed(window.scrollY > 48);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location.pathname]);

  return (
    <div className="app-shell-bg min-h-screen text-slate-900">
      {mobileSidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-20 bg-slate-900/25 backdrop-blur-[2px] md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      ) : null}

      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside
          id="app-sidebar"
          className={cn(
            "app-sidebar-shell fixed inset-y-0 left-0 z-30 overflow-y-auto overflow-x-hidden overscroll-contain border-r border-white/70 transition-all duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0",
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
            sidebarCollapsed ? "md:w-0 md:border-r-0" : "w-72 md:w-[290px]",
          )}
          aria-hidden={sidebarCollapsed && !mobileSidebarOpen}
        >
          <div className="flex min-h-full w-72 flex-col px-5 py-5 pb-8 md:w-[290px] md:px-5 md:py-6 md:pb-8">
            <div className="app-sidebar-hero rounded-[28px] px-5 py-5 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">
                    FinSight
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold">
                    Smart finance workspace
                  </h1>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="rounded-xl border border-white/20 bg-white/10 p-2 text-emerald-50 transition hover:bg-white/20 md:hidden"
                    aria-label="Close sidebar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm leading-6 text-emerald-50/90">
                Markets, ledger, macro data, and AI tools in one connected app.
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
                          ? "border-emerald-200 bg-white/70 text-slate-900 shadow-[0_12px_28px_rgba(6,95,70,0.10)]"
                          : "border-transparent bg-white/35 text-slate-700 hover:border-emerald-200/70 hover:bg-white/70"
                      }`
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-3">
                        <span className="rounded-xl bg-gradient-to-br from-emerald-50 to-amber-50 p-2 text-emerald-700 transition group-hover:from-emerald-100 group-hover:to-amber-100">
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
                      <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:rotate-6 group-hover:text-emerald-600" />
                    </div>
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="app-subtle-panel mt-6 rounded-[22px] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Quick actions
              </p>
              <div className="mt-3 grid gap-2">
                {shortcuts.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="rounded-2xl border border-white/80 bg-white/65 px-4 py-3 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:text-emerald-700"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="app-topbar sticky top-0 z-10 border-b border-white/70 bg-white/65 backdrop-blur-xl">
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
                  className="inline-flex rounded-xl border border-white/70 bg-white/70 p-2 text-slate-600 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:bg-white md:hidden"
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
                  className={cn(
                    "hidden items-center overflow-hidden rounded-2xl border border-white/80 bg-gradient-to-r from-white/90 via-amber-50 to-amber-50 text-slate-700 shadow-[0_14px_30px_rgba(6,95,70,0.10)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(6,95,70,0.14)] md:inline-flex",
                    headerCondensed
                      ? "gap-0 px-2.5 py-2.5"
                      : "gap-2 px-4 py-2.5",
                  )}
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-amber-500 text-white shadow-[0_10px_20px_rgba(6,95,70,0.18)]">
                    {sidebarCollapsed ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronLeft className="h-4 w-4" />
                    )}
                  </span>
                  <span
                    className={cn(
                      "whitespace-nowrap text-sm font-semibold transition-all duration-200",
                      headerCondensed
                        ? "max-w-0 translate-x-1 opacity-0"
                        : "max-w-[120px] translate-x-0 opacity-100",
                    )}
                  >
                    {sidebarCollapsed ? "Show menu" : "Hide menu"}
                  </span>
                </button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                    {activeItem.label}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {activeItem.description}
                  </p>
                </div>
              </div>
              <div className="rounded-full border border-white/70 bg-gradient-to-r from-emerald-50 via-white to-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 shadow-[0_12px_28px_rgba(6,95,70,0.08)]">
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
