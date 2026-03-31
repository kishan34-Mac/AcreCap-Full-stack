import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  apiFetch,
  getStoredAuthToken,
  getStoredAuthUser,
  setStoredAuthToken,
  setStoredAuthUser,
  type AuthUser,
} from "@/lib/api";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  refreshSession: () => Promise<void>;
  login: (payload: {
    email: string;
    password: string;
    audience?: "user" | "admin";
  }) => Promise<AuthUser>;
  signup: (payload: {
    name: string;
    email: string;
    password: string;
  }) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredAuthUser());
  const [loading, setLoading] = useState(() => !getStoredAuthUser());

  const refreshSession = async () => {
    try {
      const data = await apiFetch<{ user: AuthUser | null }>("auth/session", {
        method: "GET",
      });
      setUser(data.user);
      setStoredAuthUser(data.user);
    } catch {
      if (!getStoredAuthToken()) {
        setUser(null);
        setStoredAuthUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshSession();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
      refreshSession,
      login: async ({ email, password, audience = "user" }) => {
        const data = await apiFetch<{ user: AuthUser; token: string }>("auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password, audience }),
        });
        setStoredAuthToken(data.token);
        setStoredAuthUser(data.user);
        setUser(data.user);
        return data.user;
      },
      signup: async ({ name, email, password }) => {
        const data = await apiFetch<{ user: AuthUser; token: string }>("auth/signup", {
          method: "POST",
          body: JSON.stringify({ name, email, password }),
        });
        setStoredAuthToken(data.token);
        setStoredAuthUser(data.user);
        setUser(data.user);
        return data.user;
      },
      logout: async () => {
        await apiFetch("auth/logout", { method: "POST" });
        setStoredAuthToken(null);
        setStoredAuthUser(null);
        setUser(null);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
