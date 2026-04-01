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
  {
    name: "Motor Insurance",
    href: "/apply/insurance?category=Motor%20Insurance",
  },
  {
    name: "Health Insurance",
    href: "/apply/insurance?category=Health%20Insurance",
  },
  {
    name: "Travel Insurance",
    href: "/apply/insurance?category=Travel%20Insurance",
  },
  {
    name: "Fire Insurance",
    href: "/apply/insurance?category=Fire%20Insurance",
  },
  {
    name: "Marine Insurance",
    href: "/apply/insurance?category=Marine%20Insurance",
  },
  {
    name: "Workmen Compensation",
    href: "/apply/insurance?category=Workmen%20Compensation",
  },
  {
    name: "Life Insurance",
    href: "/apply/insurance?category=Life%20Insurance",
  },
];

const primaryLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const location = useLocation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const queryClient = useQueryClient();
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const [isLoansOpen, setIsLoansOpen] = useState(false);
  const [isInsuranceOpen, setIsInsuranceOpen] = useState(false);

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

  const adminLink = isAdmin ? "/admin" : "/admin/login";

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
                    <Link
                      to={loan.href}
                      className="cursor-pointer font-semibold"
                    >
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
                <DropdownMenuItem asChild>
                  <Link
                    to="/apply/insurance"
                    className="cursor-pointer font-semibold text-primary"
                  >
                    Apply for Insurance
                  </Link>
                </DropdownMenuItem>
                {insuranceTypes.map((insurance) => (
                  <DropdownMenuItem key={insurance.href} asChild>
                    <Link
                      to={insurance.href}
                      className="cursor-pointer font-semibold"
                    >
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
          <div className="animate-fade-in border-t border-border/50 lg:hidden">
            {/* Scrollable Mobile Menu Container */}
            <div className="mobile-menu-scroll max-h-[calc(100vh-80px)] overflow-y-auto pb-4 pt-4">
              <div className="px-3">
                {/* Action Buttons */}
                <div className="mb-4 grid grid-cols-2 gap-2">
                  <Button variant="accent" className="w-full" asChild>
                    <Link to="/apply">
                      Apply Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={adminLink}>Admin</Link>
                  </Button>
                </div>

                {isAuthenticated && !isAdmin && (
                  <div className="mb-4">
                    <Button variant="secondary" className="w-full" asChild>
                      <Link to={actionLink.href}>{actionLink.label}</Link>
                    </Button>
                  </div>
                )}

                {/* Primary Navigation Links */}
                <div className="mb-4 rounded-2xl bg-card/50 p-3">
                  <div className="space-y-1">
                    {primaryLinks.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className="block rounded-xl px-4 py-3 text-sm font-medium text-foreground/80 transition-all hover:bg-secondary hover:text-foreground"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Loans Section - Collapsible */}
                <div className="mb-3 rounded-2xl border border-border/30 bg-card/40 p-3">
                  <button
                    onClick={() =>
                      setExpandedSection(
                        expandedSection === "loans" ? null : "loans",
                      )
                    }
                    className="flex w-full items-center justify-between rounded-xl hover:bg-secondary/50 px-2 py-2 transition-colors"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      🏦 Loans ({loanTypes.length})
                    </p>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        expandedSection === "loans" ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {expandedSection === "loans" && (
                    <div className="mt-2 grid gap-1 sm:grid-cols-2">
                      {loanTypes.map((loan) => (
                        <Link
                          key={loan.href}
                          to={loan.href}
                          className="rounded-lg px-3 py-2.5 text-sm text-foreground/80 transition-all hover:bg-primary/10 hover:text-foreground"
                        >
                          {loan.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Insurance Section - Collapsible */}
                <div className="mb-3 rounded-2xl border border-border/30 bg-card/40 p-3">
                  <button
                    onClick={() =>
                      setExpandedSection(
                        expandedSection === "insurance" ? null : "insurance",
                      )
                    }
                    className="flex w-full items-center justify-between rounded-xl hover:bg-secondary/50 px-2 py-2 transition-colors"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      🛡️ Insurance ({insuranceTypes.length})
                    </p>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        expandedSection === "insurance" ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {expandedSection === "insurance" && (
                    <div className="mt-2 space-y-1">
                      <Link
                        to="/apply/insurance"
                        className="block rounded-lg bg-primary/10 px-3 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary/15"
                      >
                        Apply for Insurance
                      </Link>
                      <div className="grid gap-1 sm:grid-cols-2">
                        {insuranceTypes.map((insurance) => (
                          <Link
                            key={insurance.href}
                            to={insurance.href}
                            className="rounded-lg px-3 py-2.5 text-sm text-foreground/80 transition-all hover:bg-primary/10 hover:text-foreground"
                          >
                            {insurance.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Account Section */}
                <div className="rounded-2xl border border-border/30 bg-card/40 p-3">
                  <div className="flex items-center justify-between rounded-xl px-2 py-2">
                    <span className="text-sm font-medium text-foreground/80">
                      👤 {isAuthenticated ? "Signed in" : "Account"}
                    </span>
                    {isAuthenticated ? (
                      <button
                        className="text-sm font-semibold text-destructive transition-colors hover:text-destructive/80"
                        onClick={() => void handleLogout()}
                      >
                        Logout
                      </button>
                    ) : (
                      <Link
                        to="/auth"
                        className="text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                      >
                        Login
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
