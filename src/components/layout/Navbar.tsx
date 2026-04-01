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
  { name: "Motor Insurance", href: "/apply/insurance?category=Motor%20Insurance" },
  { name: "Health Insurance", href: "/apply/insurance?category=Health%20Insurance" },
  { name: "Travel Insurance", href: "/apply/insurance?category=Travel%20Insurance" },
  { name: "Fire Insurance", href: "/apply/insurance?category=Fire%20Insurance" },
  { name: "Marine Insurance", href: "/apply/insurance?category=Marine%20Insurance" },
  { name: "Workmen Compensation", href: "/apply/insurance?category=Workmen%20Compensation" },
  { name: "Life Insurance", href: "/apply/insurance?category=Life%20Insurance" },
];

const primaryLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileSection, setOpenMobileSection] = useState<"loans" | "insurance" | null>(null);
  const location = useLocation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const queryClient = useQueryClient();
  const { isAuthenticated, isAdmin, logout } = useAuth();

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenMobileSection(null);
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
  const mobilePrimaryLinks = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Apply Now", href: "/apply" },
  ];
  const mobileLinkClass = (href: string) =>
    `block rounded-3xl px-5 py-4 text-xl font-medium transition-colors ${
      location.pathname === href
        ? "bg-accent/15 text-accent"
        : "text-foreground/75 hover:bg-white/5 hover:text-foreground"
    }`;

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
                <DropdownMenuItem asChild>
                  <Link to="/apply/insurance" className="cursor-pointer font-semibold text-primary">
                    Apply for Insurance
                  </Link>
                </DropdownMenuItem>
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
          <div className="fixed inset-0 z-[60] lg:hidden">
            <div className="absolute inset-0 bg-[#0f1318]/95 backdrop-blur-xl" />
            <div className="absolute inset-x-0 top-0 border-b border-white/10 bg-[linear-gradient(180deg,rgba(247,165,26,0.12),rgba(247,165,26,0.02)_65%,transparent)] px-4 pb-6 pt-6">
              <div className="mx-auto flex max-w-7xl items-center justify-between">
                <Link
                  to="/"
                  className="flex min-w-0 items-center gap-3"
                  aria-label="AcreCap home"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent shadow-[0_0_30px_rgba(247,165,26,0.15)]">
                    <Leaf className="h-6 w-6" />
                  </div>
                  <span className="truncate text-3xl font-bold text-white">
                    AcreCap<span className="text-accent">Finance</span>
                  </span>
                </Link>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="h-8 w-8" />
                </button>
              </div>
            </div>

            <div className="relative mx-auto flex h-full max-w-7xl flex-col overflow-y-auto px-4 pb-6 pt-32">
              <div className="space-y-2">
                {mobilePrimaryLinks.map((item) => (
                  <Link key={item.href} to={item.href} className={mobileLinkClass(item.href)}>
                    {item.label}
                  </Link>
                ))}

                <button
                  onClick={() =>
                    setOpenMobileSection((current) => (current === "loans" ? null : "loans"))
                  }
                  className={`flex w-full items-center justify-between rounded-3xl px-5 py-4 text-left text-xl font-medium transition-colors ${
                    openMobileSection === "loans"
                      ? "bg-white/5 text-white"
                      : "text-foreground/75 hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <span>Loans</span>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      openMobileSection === "loans" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openMobileSection === "loans" && (
                  <div className="space-y-1 pb-2 pl-3">
                    {loanTypes.map((loan) => (
                      <Link
                        key={loan.href}
                        to={loan.href}
                        className="block rounded-2xl px-4 py-3 text-base text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        {loan.name}
                      </Link>
                    ))}
                  </div>
                )}

                <button
                  onClick={() =>
                    setOpenMobileSection((current) =>
                      current === "insurance" ? null : "insurance"
                    )
                  }
                  className={`flex w-full items-center justify-between rounded-3xl px-5 py-4 text-left text-xl font-medium transition-colors ${
                    openMobileSection === "insurance"
                      ? "bg-white/5 text-white"
                      : "text-foreground/75 hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <span>Insurance</span>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      openMobileSection === "insurance" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openMobileSection === "insurance" && (
                  <div className="space-y-1 pb-2 pl-3">
                    <Link
                      to="/apply/insurance"
                      className="block rounded-2xl bg-accent/15 px-4 py-3 text-base font-semibold text-accent"
                    >
                      Apply for Insurance
                    </Link>
                    {insuranceTypes.map((insurance) => (
                      <Link
                        key={insurance.href}
                        to={insurance.href}
                        className="block rounded-2xl px-4 py-3 text-base text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        {insurance.name}
                      </Link>
                    ))}
                  </div>
                )}

                <Link to={adminLink} className={mobileLinkClass(adminLink)}>
                  Admin
                </Link>
                {isAuthenticated && !isAdmin && (
                  <Link to={actionLink.href} className={mobileLinkClass(actionLink.href)}>
                    {actionLink.label}
                  </Link>
                )}
              </div>

              <div className="mt-auto pt-8">
                <div className="border-t border-white/10 pt-6">
                  {isAuthenticated ? (
                    <Button
                      variant="accent"
                      className="h-16 w-full rounded-3xl text-lg font-bold"
                      onClick={() => void handleLogout()}
                    >
                      Logout
                    </Button>
                  ) : (
                    <Button variant="accent" className="h-16 w-full rounded-3xl text-lg font-bold" asChild>
                      <Link to="/auth">Login / Register</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
