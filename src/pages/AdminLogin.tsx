import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS as string | undefined)?.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean) || [];

  useEffect(() => {
    // If already authenticated and an admin, go straight to /admin
    supabase.auth.getSession().then(({ data: { session } }) => {
      const email = session?.user?.email?.toLowerCase() ?? null;
      const isAdmin = !!email && ADMIN_EMAILS.includes(email);
      if (session?.user && isAdmin) {
        navigate("/admin", { replace: true });
      }
    });
  }, [navigate]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({ title: "Login failed", description: "Invalid email or password.", variant: "destructive" });
        } else if (error.message.toLowerCase().includes("invalid api key")) {
          toast({ title: "Supabase configuration error", description: "Invalid API key. Check .env.", variant: "destructive" });
        } else {
          toast({ title: "Login error", description: error.message, variant: "destructive" });
        }
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const authedEmail = session?.user?.email?.toLowerCase() ?? null;
      const isAdmin = !!authedEmail && ADMIN_EMAILS.includes(authedEmail);
      if (!isAdmin) {
        toast({ title: "Access denied", description: "This account is not authorized for admin access.", variant: "destructive" });
        return;
      }

      toast({ title: "Welcome", description: "Admin login successful." });
      navigate("/admin", { replace: true });
    } catch (e: any) {
      toast({ title: "Login error", description: e?.message || "Unexpected error", variant: "destructive" });
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
            <p className="text-muted-foreground mb-6">Enter your admin credentials to access the panel.</p>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Username (email)</Label>
                <Input id="email" type="email" value={email} placeholder="admin@example.com" onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button className="w-full" onClick={handleLogin} disabled={loading}>
                {loading ? "Signing in..." : "Login"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                <span>Not an admin?</span> <Link to="/auth" className="text-primary hover:underline">Go to user login</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}