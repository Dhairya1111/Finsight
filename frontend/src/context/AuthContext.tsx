import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import type { AuthUser } from "../types/api";
import { supabase } from "../lib/supabase";
import { AuthContext } from "./auth-shared";

function mapSupabaseUser(user: SupabaseUser | null): AuthUser | null {
  if (!user || !user.email) return null;

  return {
    id: user.id,
    email: user.email,
    full_name:
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email.split("@")[0],
    created_at: user.created_at ?? new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback((session: Session | null) => {
    setUser(mapSupabaseUser(session?.user ?? null));
    setLoading(false);
  }, []);

  const refreshUser = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    applySession(session);
  }, [applySession]);

  useEffect(() => {
    void refreshUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [applySession, refreshUser]);

  const login = useCallback(
    async (payload: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: payload.email,
        password: payload.password,
      });

      if (error) throw new Error(error.message);
      applySession(data.session);
    },
    [applySession],
  );

  const register = useCallback(
    async (payload: { email: string; full_name: string; password: string }) => {
      const { data, error } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
          data: { full_name: payload.full_name },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw new Error(error.message);
      applySession(data.session ?? null);
    },
    [applySession],
  );

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) throw new Error(error.message);
  }, []);

  const logout = useCallback(() => {
    void supabase.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      signInWithGoogle,
      logout,
      refreshUser,
    }),
    [user, loading, login, register, signInWithGoogle, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
