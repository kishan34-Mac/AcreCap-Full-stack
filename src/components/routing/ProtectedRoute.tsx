import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

// optional fallback (keep if you want)
const ADMIN_EMAILS =
  (import.meta.env.VITE_ADMIN_EMAILS as string | undefined)
    ?.split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean) || [];

const BACKEND = import.meta.env.VITE_BACKEND_URL as string | undefined;

export const ProtectedRoute = ({ children, requireAdmin }: ProtectedRouteProps) => {
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let alive = true;

    const compute = async () => {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!alive) return;

      const token = session?.access_token ?? null;
      const email = session?.user?.email?.toLowerCase() ?? null;

      setIsAuthenticated(!!session?.user);
      setSessionEmail(email);

      // default
      let admin = false;

      // If admin route requested, verify admin
      if (requireAdmin && token) {
        // 1) Preferred: backend role
        if (BACKEND) {
          try {
            const res = await fetch(`${BACKEND}/api/users/me`, {
              headers: { Authorization: `Bearer ${token}` },
              credentials: "include",
            });
            const json = await res.json();
            admin = json?.profile?.role === "admin";
          } catch {
            admin = false;
          }
        }

        // 2) Fallback: env email list (optional)
        if (!admin && email) {
          admin = ADMIN_EMAILS.includes(email);
        }
      }

      setIsAdmin(admin);
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      compute();
    });

    compute();

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

  // Not logged in
  if (!isAuthenticated) {
    // admin pages -> admin login
    if (requireAdmin) {
      return <Navigate to="/admin/login" replace state={{ from: location }} />;
    }
    // normal protected pages -> user login
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  // Logged in but not admin
  if (requireAdmin && !isAdmin) {
    // you can also Navigate to="/auth" if you want
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};
