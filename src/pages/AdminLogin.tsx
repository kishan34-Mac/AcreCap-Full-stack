import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const fromPath =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname || "/admin";

  const handleLogin = async () => {
    try {
      setLoading(true);
      const user = await login({ email: email.trim(), password, audience: "admin" });

      if (user.role !== "admin") {
        await logout();
        toast({
          title: "Access denied",
          description: "This account is not authorized for admin access.",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Welcome", description: "Admin login successful." });
      navigate(fromPath, { replace: true });
    } catch (error: any) {
      const message =
        error?.message === "admin_access_required"
          ? "Only the configured admin account can sign in here."
          : error?.message === "invalid_credentials"
          ? "Invalid admin email or password."
          : error?.message || "Unable to sign in.";
      toast({
        title: "Login failed",
        description: message,
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
              Enter the admin email and password to access the panel.
            </p>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input id="email" type="email" value={email} placeholder="admin@example.com" onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} />
              </div>

              <Button className="w-full" onClick={handleLogin} disabled={loading}>
                {loading ? "Signing in..." : "Login"}
              </Button>

              <div className="text-center text-sm">
                <Link to="/forgot-password?audience=admin" className="text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

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
