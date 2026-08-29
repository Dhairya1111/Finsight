import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "./components/AppShell";
import { LoadingState } from "./components/LoadingState";
import { ProtectedRoute } from "./components/ProtectedRoute";

const LandingPage = lazy(() =>
  import("./pages/LandingPage").then((module) => ({
    default: module.LandingPage,
  })),
);
const LoginPage = lazy(() =>
  import("./pages/LoginPage").then((module) => ({ default: module.LoginPage })),
);
const DashboardHome = lazy(() =>
  import("./pages/DashboardHome").then((module) => ({
    default: module.DashboardHome,
  })),
);
const FinancePage = lazy(() =>
  import("./pages/FinancePage").then((module) => ({
    default: module.FinancePage,
  })),
);
const MarketsPage = lazy(() =>
  import("./pages/MarketsPage").then((module) => ({
    default: module.MarketsPage,
  })),
);
const EconomicsPage = lazy(() =>
  import("./pages/EconomicsPage").then((module) => ({
    default: module.EconomicsPage,
  })),
);
const EventsPage = lazy(() =>
  import("./pages/EventsPage").then((module) => ({
    default: module.EventsPage,
  })),
);
const SimulatorPage = lazy(() =>
  import("./pages/SimulatorPage").then((module) => ({
    default: module.SimulatorPage,
  })),
);
const AIAnalystPage = lazy(() =>
  import("./pages/AIAnalystPage").then((module) => ({
    default: module.AIAnalystPage,
  })),
);
const MLDemoPage = lazy(() =>
  import("./pages/MLDemoPage").then((module) => ({
    default: module.MLDemoPage,
  })),
);
const SharedLedgerPage = lazy(() =>
  import("./pages/SharedLedgerPage").then((module) => ({
    default: module.SharedLedgerPage,
  })),
);

function App() {
  return (
    <Suspense fallback={<LoadingState label="Loading FinSight…" />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/welcome" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/shared/ledger/:token" element={<SharedLedgerPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/markets" element={<MarketsPage />} />
            <Route path="/economics" element={<EconomicsPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/simulator" element={<SimulatorPage />} />
            <Route path="/ai" element={<AIAnalystPage />} />
            <Route path="/ml" element={<MLDemoPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
