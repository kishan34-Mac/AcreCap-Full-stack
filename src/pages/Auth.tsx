import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Leaf, Eye, EyeOff } from "lucide-react";
import { z } from "zod";

const authSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").optional(),
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, signup } = useAuth();

  const redirectPath =
    ((location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname as string | undefined) || "/";

  const validate = () => {
    const parsed = authSchema.safeParse({
      name: isLogin ? undefined : name,
      email,
      password,
    });

    if (parsed.success) {
      setErrors({});
      return true;
    }

    const nextErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      const key = String(issue.path[0] || "form");
      nextErrors[key] = issue.message;
    });
    setErrors(nextErrors);
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsLoading(true);
      if (isLogin) {
        await login({ email: email.trim(), password });
        toast({ title: "Welcome back", description: "You have logged in successfully." });
      } else {
        await signup({ name: name.trim(), email: email.trim(), password });
        toast({ title: "Account created", description: "Your account is ready." });
      }
      navigate(redirectPath, { replace: true });
    } catch (error: any) {
      const message =
        error?.message === "email_already_registered"
          ? "This email is already registered. Please log in instead."
          : error?.message === "invalid_credentials"
          ? "Invalid email or password."
          : error?.message || "Unable to complete your request.";
      toast({ title: "Authentication failed", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <section className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-glow">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">AcreCap</span>
            </Link>
          </div>

          <div className="glass-card rounded-3xl p-8">
            <div className="flex rounded-xl bg-secondary p-1 mb-8">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${isLogin ? "bg-background text-foreground shadow-soft" : "text-muted-foreground"}`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${!isLogin ? "bg-background text-foreground shadow-soft" : "text-muted-foreground"}`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
}
