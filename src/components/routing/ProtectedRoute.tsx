import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const BACKEND = import.meta.env.VITE_BACKEND_URL as string | undefined;

export const ProtectedRoute = ({ children, requireAdmin }: ProtectedRouteProps) => {
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let alive = true;

    const check = async () => {
      setLoading(true);

      const { data } = await supabase.auth.getSession();
      const session = data.session;

      const token = session?.access_token ?? null;
      const authed = !!session?.user;

      if (!alive) return;

      setIsAuthenticated(authed);

      // Not logged in OR not admin route → no need to check admin
      if (!authed || !requireAdmin) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Logged in + requireAdmin → must verify role from backend
      if (!BACKEND || !token) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BACKEND}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
          cache: "no-store",
        });

        if (!alive) return;

        if (res.status === 401) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const json = await res.json().catch(() => ({}));
        if (!alive) return;

        setIsAdmin(json?.profile?.role === "admin");
      } catch {
        if (!alive) return;
        setIsAdmin(false);
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    // ✅ correct destructuring for supabase-js v2
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      check();
    });

    check();

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, [requireAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Checking authentication…
      </div>
    );
  }

  if (!isAuthenticated) {
    return requireAdmin ? (
      <Navigate to="/admin/login" replace state={{ from: location }} />
    ) : (
      <Navigate to="/auth" replace state={{ from: location }} />
    );
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};
