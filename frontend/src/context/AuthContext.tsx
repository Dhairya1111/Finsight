import { ReactNode, useEffect, useMemo, useState } from "react";

import { api, authStorage } from "../services/api";
import type { AuthUser } from "../types/api";
import { AuthContext } from "./auth-shared";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = authStorage.getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const profile = await api.me();
      setUser(profile);
    } catch {
      authStorage.clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshUser();
  }, []);

  const login = async (payload: { email: string; password: string }) => {
    const response = await api.login(payload);
    authStorage.setToken(response.access_token);
    setUser(response.user);
  };

  const register = async (payload: {
    email: string;
    full_name: string;
    password: string;
  }) => {
    const response = await api.register(payload);
    authStorage.setToken(response.access_token);
    setUser(response.user);
  };

  const logout = () => {
    authStorage.clearToken();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
