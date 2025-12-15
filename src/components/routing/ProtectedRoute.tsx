import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS as string | undefined)?.split(',').map(e => e.trim().toLowerCase()).filter(Boolean) || [];

export const ProtectedRoute = ({ children, requireAdmin }: ProtectedRouteProps) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      setIsAuthenticated(!!session?.user);
      setUserEmail(session?.user?.email?.toLowerCase() ?? null);
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
      setUserEmail(session?.user?.email?.toLowerCase() ?? null);
    });

    init();
    return () => {
      subscription.unsubscribe();
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Checking authentication…</div>;
  }

  // If route requires admin and user is not authenticated, redirect to admin login
  if (requireAdmin && !isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  // For non-admin-required routes, keep existing behavior when unauthenticated
  if (!requireAdmin && !isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Admin-only guard: redirect non-admins to admin login
  if (requireAdmin) {
    const email = userEmail;
    const isAdmin = !!email && ADMIN_EMAILS.includes(email);
    if (!isAdmin) {
      return <Navigate to="/admin/login" replace state={{ from: location }} />;
    }
  }

  return <>{children}</>;
};