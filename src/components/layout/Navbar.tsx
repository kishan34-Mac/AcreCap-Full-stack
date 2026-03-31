import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Sun, Moon, ChevronDown, Leaf } from "lucide-react";
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

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const queryClient = useQueryClient();
  const { isAuthenticated, isAdmin, logout } = useAuth();

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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-soft group-hover:shadow-glow transition-shadow duration-300">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">AcreCap</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            <Link to="/" className="px-4 py-2 text-sm font-bold text-foreground hover:text-primary transition-colors">
              Home
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-foreground hover:text-primary transition-colors">
                Loans <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-card/95 backdrop-blur-xl border-border/50">
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
              <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-foreground hover:text-primary transition-colors">
                Insurance <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-card/95 backdrop-blur-xl border-border/50">
                {insuranceTypes.map((insurance) => (
                  <DropdownMenuItem key={insurance.href} asChild>
                    <Link to={insurance.href} className="cursor-pointer font-semibold">
                      {insurance.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/about" className="px-4 py-2 text-sm font-bold text-foreground hover:text-primary transition-colors">
              About Us
            </Link>
            <Link to="/contact" className="px-4 py-2 text-sm font-bold text-foreground hover:text-primary transition-colors">
              Contact
            </Link>
            {isAuthenticated && isAdmin && (
              <Link to="/admin" className="px-4 py-2 text-sm font-bold text-foreground hover:text-primary transition-colors">
                Admin
              </Link>
            )}
            {isAuthenticated && !isAdmin && (
              <Link to="/dashboard" className="px-4 py-2 text-sm font-bold text-foreground hover:text-primary transition-colors">
                Dashboard
              </Link>
            )}
            {!isAuthenticated && (
              <Link to="/admin/login" className="px-4 py-2 text-sm font-bold text-foreground hover:text-primary transition-colors">
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>
            {isAuthenticated ? (
              <button onClick={handleLogout} className="px-4 py-2 text-sm font-bold text-foreground hover:text-primary transition-colors" aria-label="Logout">
                Logout
              </button>
            ) : (
              <Link to="/auth" className="px-4 py-2 text-sm font-bold text-foreground hover:text-primary transition-colors" aria-label="Login">
                Login
              </Link>
            )}

            <Button variant="accent" className="hidden md:flex" asChild>
              <Link to="/apply">Apply Now</Link>
            </Button>

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 lg:hidden rounded-xl bg-secondary hover:bg-secondary/80 transition-colors" aria-label="Toggle menu">
              {isMobileMenuOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-2">
              <Link to="/" className="px-4 py-3 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-secondary rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Home
              </Link>

              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Loans</p>
                <div className="grid grid-cols-2 gap-1">
                  {loanTypes.map((loan) => (
                    <Link key={loan.href} to={loan.href} className="px-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-secondary rounded-lg transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                      {loan.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Insurance</p>
                <div className="grid grid-cols-2 gap-1">
                  {insuranceTypes.map((insurance) => (
                    <Link key={insurance.href} to={insurance.href} className="px-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-secondary rounded-lg transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                      {insurance.name}
                    </Link>
                  ))}
                </div>
              </div>

              <Link to="/about" className="px-4 py-3 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-secondary rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                About Us
              </Link>
              <Link to="/contact" className="px-4 py-3 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-secondary rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Contact
              </Link>

              {isAuthenticated ? (
                <>
                  {isAdmin ? (
                    <Link to="/admin" className="px-4 py-3 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-secondary rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                      Admin
                    </Link>
                  ) : (
                    <Link to="/dashboard" className="px-4 py-3 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-secondary rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                      Dashboard
                    </Link>
                  )}
                  <button className="px-4 py-3 text-sm font-medium text-left text-foreground/80 hover:text-foreground hover:bg-secondary rounded-xl transition-colors" onClick={() => { void handleLogout(); setIsMobileMenuOpen(false); }}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/admin/login" className="px-4 py-3 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-secondary rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    Admin
                  </Link>
                  <Link to="/auth" className="px-4 py-3 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-secondary rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    Login
                  </Link>
                </>
              )}

              <div className="flex gap-2 px-4 pt-2">
                <Button variant="accent" className="flex-1" asChild>
                  <Link to="/apply" onClick={() => setIsMobileMenuOpen(false)}>
                    Apply Now
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
