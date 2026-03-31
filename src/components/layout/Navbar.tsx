import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  Leaf,
  Shield,
  LayoutDashboard,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

const loanTypes = [
  { name: "Business Loan", href: "/loans/business" },
  { name: "Property Loan", href: "/loans/property" },
  { name: "Project Loan", href: "/loans/project" },
  { name: "Personal Loan", href: "/loans/personal" },
  { name: "Home Loan", href: "/loans/home" },
  { name: "CC / OD Loan", href: "/loans/cc-od" },
  { name: "Machinery Loan", href: "/loans/machinery" },
];

const insuranceTypes = [
  { name: "Motor Insurance", href: "/insurance/motor" },
  { name: "Health Insurance", href: "/insurance/health" },
  { name: "Travel Insurance", href: "/insurance/travel" },
  { name: "Fire Insurance", href: "/insurance/fire" },
  { name: "Marine Insurance", href: "/insurance/marine" },
  { name: "Workmen Compensation", href: "/insurance/workmen" },
  { name: "Life Insurance", href: "/insurance/life" },
];

const primaryLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const queryClient = useQueryClient();
  const { isAuthenticated, isAdmin, logout } = useAuth();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      queryClient.clear();
      toast({ title: "Logged out", description: "You have been logged out." });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error?.message || "Unable to log out right now.",
        variant: "destructive",
      });
    }
  };

  const actionLink = isAuthenticated
    ? isAdmin
      ? { label: "Admin", href: "/admin", icon: Shield }
      : { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }
    : { label: "Admin", href: "/admin/login", icon: Shield };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between gap-3 md:h-20">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2.5 group"
            aria-label="AcreCap home"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-soft transition-shadow duration-300 group-hover:shadow-glow">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="truncate text-base font-bold text-foreground sm:text-xl">
              AcreCap
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {primaryLinks.slice(0, 1).map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="px-4 py-2 text-sm font-bold text-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-foreground transition-colors hover:text-primary">
                Loans <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-56 border-border/50 bg-card/95 backdrop-blur-xl"
              >
                {loanTypes.map((loan) => (
                  <DropdownMenuItem key={loan.href} asChild>
                    <Link to={loan.href} className="cursor-pointer font-semibold">
                      {loan.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-foreground transition-colors hover:text-primary">
                Insurance <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-56 border-border/50 bg-card/95 backdrop-blur-xl"
              >
                {insuranceTypes.map((insurance) => (
                  <DropdownMenuItem key={insurance.href} asChild>
                    <Link to={insurance.href} className="cursor-pointer font-semibold">
                      {insurance.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {primaryLinks.slice(1).map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="px-4 py-2 text-sm font-bold text-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}

            <Link
              to={actionLink.href}
              className="px-4 py-2 text-sm font-bold text-foreground transition-colors hover:text-primary"
            >
              {actionLink.label}
            </Link>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="hidden px-3 py-2 text-sm font-bold text-foreground transition-colors hover:text-primary sm:inline-flex"
                aria-label="Logout"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/auth"
                className="hidden px-3 py-2 text-sm font-bold text-foreground transition-colors hover:text-primary sm:inline-flex"
                aria-label="Login"
              >
                Login
              </Link>
            )}

            <Button variant="accent" className="hidden md:flex" asChild>
              <Link to="/apply">Apply Now</Link>
            </Button>

            <button
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary transition-colors hover:bg-secondary/80 lg:hidden"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-foreground" />
              ) : (
                <Menu className="h-5 w-5 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="animate-fade-in border-t border-border/50 pb-5 pt-4 lg:hidden">
            <div className="rounded-3xl border border-border/50 bg-card/80 p-3 shadow-soft backdrop-blur-xl">
              <div className="mb-3 grid grid-cols-2 gap-2">
                <Button variant="accent" className="w-full" asChild>
                  <Link to="/apply">
                    Apply Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to={actionLink.href}>{actionLink.label}</Link>
                </Button>
              </div>

              <div className="grid gap-1">
                {primaryLinks.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="rounded-2xl px-4 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="mt-4 rounded-2xl bg-background/50 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Loans
                </p>
                <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {loanTypes.map((loan) => (
                    <Link
                      key={loan.href}
                      to={loan.href}
                      className="rounded-xl px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      {loan.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-3 rounded-2xl bg-background/50 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Insurance
                </p>
                <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {insuranceTypes.map((insurance) => (
                    <Link
                      key={insurance.href}
                      to={insurance.href}
                      className="rounded-xl px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      {insurance.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-2xl bg-background/50 px-4 py-3">
                <span className="text-sm font-medium text-foreground/80">
                  {isAuthenticated ? "Signed in" : "Account"}
                </span>
                {isAuthenticated ? (
                  <button
                    className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
                    onClick={() => void handleLogout()}
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
