import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { LoadingState } from "../components/LoadingState";
import { SectionHeading } from "../components/SectionHeading";
import { useAuth } from "../context/useAuth";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? "/dashboard";

  if (loading) {
    return <LoadingState label="Loading account access…" />;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await register({ email, full_name: fullName, password });
      }
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-shell-bg min-h-screen px-5 py-8 text-slate-900 md:px-8 lg:px-10">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr,1.05fr]">
        <section className="app-card app-card-tilt rounded-[30px] p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-700">
            FinSight Access
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-900">
            Sign in to your finance workspace.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
            Use your account to access your saved ledger, voice entries, company
            watchlists, and shared finance views on any device.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["Secure login", "JWT-based account access"],
              ["Personal ledger", "Your own saved transactions"],
              ["Deployment-ready", "Prepared for Render + PostgreSQL"],
            ].map(([label, value]) => (
              <div key={label} className="app-subtle-panel rounded-[22px] p-4">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 font-semibold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="app-card app-card-tilt rounded-[30px] p-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                mode === "login"
                  ? "bg-gradient-to-r from-blue-900 to-red-600 text-white"
                  : "app-subtle-panel text-slate-700"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                mode === "register"
                  ? "bg-gradient-to-r from-blue-900 to-red-600 text-white"
                  : "app-subtle-panel text-slate-700"
              }`}
            >
              Create account
            </button>
          </div>

          <div className="mt-6">
            <SectionHeading
              eyebrow={mode === "login" ? "Welcome back" : "New account"}
              title={mode === "login" ? "Sign in" : "Create your account"}
              description="Once authenticated, the app loads your personal ledger data and protected finance features."
            />
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "register" ? (
              <label className="block text-sm text-slate-700">
                Full name
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-100"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Your name"
                  required
                />
              </label>
            ) : null}

            <label className="block text-sm text-slate-700">
              Email
              <input
                type="email"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-100"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="block text-sm text-slate-700">
              Password
              <input
                type="password"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-100"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimum 8 characters"
                required
                minLength={8}
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-900 to-red-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(30,58,138,0.16)] transition hover:from-blue-800 hover:to-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Please wait…"
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
