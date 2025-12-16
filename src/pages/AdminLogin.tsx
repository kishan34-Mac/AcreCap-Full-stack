import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const BACKEND = import.meta.env.VITE_BACKEND_URL as string | undefined;

async function fetchMe(accessToken: string) {
  if (!BACKEND) throw new Error("Missing VITE_BACKEND_URL");
  const res = await fetch(`${BACKEND}/api/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: "include",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || "Failed to fetch profile");
  return json;
}

async function syncUser(accessToken: string) {
  if (!BACKEND) throw new Error("Missing VITE_BACKEND_URL");
  await fetch(`${BACKEND}/api/users/sync`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: "include",
  });
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in and admin, go to /admin
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      try {
        await syncUser(token);
        const me = await fetchMe(token);
        if (me?.profile?.role === "admin") {
          navigate("/admin", { replace: true });
        }
      } catch {
        // ignore auto-redirect errors
      }
    })();
  }, [navigate]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        toast({
          title: "Login error",
          description: "No session token after login.",
          variant: "destructive",
        });
        return;
      }

      await syncUser(token);
      const me = await fetchMe(token);

      if (me?.profile?.role !== "admin") {
        toast({
          title: "Access denied",
          description: "This account is not authorized for admin access.",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Welcome", description: "Admin login successful." });
      navigate("/admin", { replace: true });
    } catch (e: any) {
      toast({
        title: "Login error",
        description: e?.message || "Unexpected error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="section-padding">
        <div className="container-custom max-w-lg">
          <div className="glass-card p-6">
            <h1 className="text-2xl font-bold mb-1">Admin Login</h1>
            <p className="text-muted-foreground mb-6">
              Enter your admin credentials to access the panel.
            </p>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Username (email)</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  placeholder="admin@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button className="w-full" onClick={handleLogin} disabled={loading}>
                {loading ? "Signing in..." : "Login"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <span>Not an admin?</span>{" "}
                <Link to="/auth" className="text-primary hover:underline">
                  Go to user login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
