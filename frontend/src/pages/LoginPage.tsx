import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { LoadingState } from "../components/LoadingState";
import { SectionHeading } from "../components/SectionHeading";
import { useAuth } from "../context/useAuth";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, login, register, signInWithGoogle } =
    useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? "/dashboard";
  const googleConfigured = Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
  );

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
              description="Your account unlocks personal ledger storage, protected routes, and shareable finance views."
            />
          </div>

          <div className="mt-6 grid gap-3">
            <button
              type="button"
              disabled={!googleConfigured || submitting}
              onClick={async () => {
                setError(null);
                setSubmitting(true);
                try {
                  await signInWithGoogle();
                } catch (err) {
                  setError(
                    err instanceof Error
                      ? err.message
                      : "Google sign-in could not be started.",
                  );
                } finally {
                  setSubmitting(false);
                }
              }}
              className="inline-flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600">
                G
              </span>
              {submitting ? "Connecting to Google…" : "Continue with Google"}
            </button>

            {!googleConfigured ? (
              <p className="text-xs text-slate-500">
                Supabase client settings are missing, so Google sign-in is not
                available yet.
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                If Google sign-in does not open, enable the Google provider in
                Supabase Authentication and add its OAuth credentials there.
              </p>
            )}
          </div>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-slate-400">
            <div className="h-px flex-1 bg-slate-200" />
            <span>or continue with email</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
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
              <div className="relative mt-2">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-slate-900 outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-100"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label className="block text-sm text-slate-700">
              Password
              <div className="relative mt-2">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-12 text-slate-900 outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-100"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minimum 8 characters"
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </label>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-600">
              <div className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-red-600" />
                <span>Your session is kept on this device after sign-in.</span>
              </div>
            </div>

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