import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";

export default function ForgotPassword() {
  const [params] = useSearchParams();
  const audience = params.get("audience") === "admin" ? "admin" : "user";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiFetch("auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), audience }),
      });
      toast({
        title: "Reset email sent",
        description: "If the email exists, a password reset link has been sent.",
      });
      setEmail("");
    } catch (error: any) {
      const message =
        error?.message === "password_reset_email_not_configured"
          ? "Password reset email service is not configured yet."
          : error?.message === "password_reset_email_failed"
          ? "We could not send the reset email right now. Please try again."
          : error?.message || "Unable to process password reset right now.";
      toast({
        title: "Request failed",
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
            <h1 className="mb-2 text-2xl font-bold">
              {audience === "admin" ? "Admin Forgot Password" : "Forgot Password"}
            </h1>
            <p className="mb-6 text-muted-foreground">
              Enter your email and we will send you a password reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  placeholder={audience === "admin" ? "admin@example.com" : "you@example.com"}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
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
