import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const audience = params.get("audience") === "admin" ? "admin" : "user";
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast({
        title: "Invalid reset link",
        description: "This password reset link is missing a token.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Weak password",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please enter the same password in both fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await apiFetch("auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      toast({
        title: "Password updated",
        description: "Your password has been reset successfully.",
      });
      navigate(audience === "admin" ? "/admin/login" : "/auth", { replace: true });
    } catch (error: any) {
      const message =
        error?.message === "invalid_or_expired_token"
          ? "This reset link is invalid or has expired."
          : error?.message || "Unable to reset password right now.";
      toast({
        title: "Reset failed",
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
          <div className="glass-card p-6 sm:p-8">
            <h1 className="mb-2 text-2xl font-bold">Reset Password</h1>
            <p className="mb-6 text-muted-foreground">
              Set a new password for your {audience === "admin" ? "admin" : "user"} account.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              <Link
                to={audience === "admin" ? "/admin/login" : "/auth"}
                className="text-primary hover:underline"
              >
                Back to {audience === "admin" ? "admin login" : "login"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
