import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, ChevronDown, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logActivity } from '@/lib/sync';
import { useQueryClient } from '@tanstack/react-query';

const loanTypes = [{
  name: 'Business Loan',
  href: '/loans/business'
}, {
  name: 'Property Loan',
  href: '/loans/property'
}, {
  name: 'Project Loan',
  href: '/loans/project'
}, {
  name: 'Personal Loan',
  href: '/loans/personal'
}, {
  name: 'Home Loan',
  href: '/loans/home'
}, {
  name: 'CC / OD Loan',
  href: '/loans/cc-od'
}, {
  name: 'Machinery Loan',
  href: '/loans/machinery'
}];
const insuranceTypes = [{
  name: 'Motor Insurance',
  href: '/insurance/motor'
}, {
  name: 'Health Insurance',
  href: '/insurance/health'
}, {
  name: 'Travel Insurance',
  href: '/insurance/travel'
}, {
  name: 'Fire Insurance',
  href: '/insurance/fire'
}, {
  name: 'Marine Insurance',
  href: '/insurance/marine'
}, {
  name: 'Workmen Compensation',
  href: '/insurance/workmen'
}, {
  name: 'Life Insurance',
  href: '/insurance/life'
}];
export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const queryClient = useQueryClient();
  const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS as string | undefined)?.split(',').map(e => e.trim().toLowerCase()).filter(Boolean) || [];
  const isAdmin = !!userEmail && ADMIN_EMAILS.includes(userEmail);
  const adminUsername = isAdmin && userEmail ? userEmail.split('@')[0] : null;

  useEffect(() => {
    const syncProfile = async (token?: string | null) => {
      try {
        if (!token) return;
        await fetch('/api/users/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      } catch {}
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authed = !!session?.user;
      setIsAuthenticated(authed);
      setUserEmail(session?.user?.email?.toLowerCase() ?? null);
      if (authed) {
        const token = session?.access_token ?? (session as any)?.access_token;
        await syncProfile(token);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const authed = !!session?.user;
      setIsAuthenticated(authed);
      setUserEmail(session?.user?.email?.toLowerCase() ?? null);
      if (authed) {
        const token = session?.access_token ?? (session as any)?.access_token;
        await syncProfile(token);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const clearSupabaseAuthStorage = () => {
    try {
      // Remove Supabase auth tokens from localStorage to guarantee client-side logout
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i) || '';
        if (k.startsWith('sb-') || k.includes('supabase')) keys.push(k);
      }
      keys.forEach((k) => localStorage.removeItem(k));
    } catch {}
  };

  const teardownRealtime = () => {
    try {
      const channels = (supabase as any).getChannels?.() || [];
      channels.forEach((ch: any) => (supabase as any).removeChannel?.(ch));
      // Some clients also support removeAllChannels
      (supabase as any).removeAllChannels?.();
    } catch {}
  };

  const handleLogout = async () => {
    let logoutError: string | null = null;

    // First check current session
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      // Terminate server session
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          const msg = error.message || '';
          const isNoSession = /Auth session missing|No active session|No current session/i.test(msg);
          if (!isNoSession) logoutError = msg;
        }
      } catch (e: any) {
        logoutError = typeof e?.message === 'string' ? e.message : null;
      }
    }

    // Regardless of server result, tear down client state
    teardownRealtime();
    clearSupabaseAuthStorage();

    try { queryClient.clear(); } catch {}

    // Force UI to show dashboard for logged-out users
    setIsAuthenticated(false);
    setUserEmail(null);

    if (logoutError) {
      toast({ title: 'Logout failed', description: logoutError, variant: 'destructive' });
      // Still navigate to home to satisfy requirement
      navigate('/');
      return;
    }

    toast({ title: 'Logged out', description: 'You have been logged out.' });
    navigate('/');
  };

  return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="container-custom">
            <div className="flex items-center justify-between h-16 md:h-20">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-soft group-hover:shadow-glow transition-shadow duration-300">
                  <Leaf className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">AcreCap</span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-1">
                <Link to="/" className="px-4 py-2 text-sm font-bold text-foreground hover:text-primary transition-colors">
                  Home
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-foreground hover:text-primary transition-colors">
                    Loans <ChevronDown className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 bg-card/95 backdrop-blur-xl border-border/50">
                    {loanTypes.map(loan => <DropdownMenuItem key={loan.href} asChild>
                        <Link to={loan.href} className="cursor-pointer font-semibold">
                          {loan.name}
                        </Link>
                      </DropdownMenuItem>)}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-foreground hover:text-primary transition-colors">
                    Insurance <ChevronDown className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 bg-card/95 backdrop-blur-xl border-border/50">
                    {insuranceTypes.map(insurance => <DropdownMenuItem key={insurance.href} asChild>
                        <Link to={insurance.href} className="cursor-pointer font-semibold">
                          {insurance.name}
                        </Link>
                      </DropdownMenuItem>)}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Link to="/about" className="px-4 py-2 text-sm font-bold text-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
                <Link to="/contact" className="px-4 py-2 text-sm font-bold text-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
                {/* Admin link visible only to authenticated admins */}
                {isAuthenticated && isAdmin && (
                  <>
                    {/* Remove Admin Users link; keep only Admin */}
                    <Link to="/admin" className="px-4 py-2 text-sm font-bold text-foreground hover:text-primary transition-colors">
                      Admin
                    </Link>
                    {/* Removed Admin Users */}
                  </>
                )}
                {/* Dashboard visible only to authenticated non-admin users */}
                {isAuthenticated && !isAdmin && (
                  <Link to="/dashboard" className="px-4 py-2 text-sm font-bold text-foreground hover:text-primary transition-colors">
                    Dashboard
                  </Link>
                )}
                {/* Show Admin login link when not authenticated */}
                {!isAuthenticated && (
                  <Link to="/admin/login" className="px-4 py-2 text-sm font-bold text-foreground hover:text-primary transition-colors">
                    Admin
                  </Link>
                )}
                {/* Removed Profile from navbar */}
                {/* <Link to="/profile" className="px-4 py-2 text-sm font-bold text-foreground hover:text-primary transition-colors">Profile</Link> */}
                {/* Auth buttons removed here to avoid duplicate Login/Logout; right-side actions handle auth buttons */}
                {/* Auth buttons removed here to avoid duplicate Login/Logout; right-side actions handle auth buttons */}
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center gap-2 md:gap-3">
                {/* Theme toggle */}
                <Button variant="ghost" size="icon" className="rounded-xl" onClick={toggleTheme} aria-label="Toggle theme">
                  {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </Button>
                {isAdmin && adminUsername && (
                  // Admin label removed for clean look
                  null
                )}
                {isAuthenticated ? (
                  <button onClick={handleLogout} className="px-4 py-2 text-sm font-bold text-foreground hover:text-primary transition-colors" aria-label="Logout">
                    Logout
                  </button>
                ) : (
                  <Link to="/auth" className="px-4 py-2 text-sm font-bold text-foreground hover:text-primary transition-colors" aria-label="Login">
                    Login
                  </Link>
                )}
                {/* Removed Profile from navbar */}
                {/* <Link to="/profile" className="px-4 py-2 text-sm font-bold text-foreground hover:text-primary transition-colors">Profile</Link> */}
                {/* Auth buttons removed here to avoid duplicate Login/Logout; right-side actions handle auth buttons */}
                {/* Auth buttons removed here to avoid duplicate Login/Logout; right-side actions handle auth buttons */}
              </div>

                <Button variant="accent" className="hidden md:flex" asChild>
                  <Link to="/apply">Apply Now</Link>
                </Button>

                {/* Mobile Menu Button */}
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 lg:hidden rounded-xl bg-secondary hover:bg-secondary/80 transition-colors" aria-label="Toggle menu">
                  {isMobileMenuOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-border/50 animate-fade-in"> 
                <div className="flex flex-col gap-2">
                  <Link to="/" className="px-4 py-3 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-secondary rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    Home
                  </Link>
                  
                  <div className="px-4 py-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Loans</p>
                    <div className="grid grid-cols-2 gap-1">
                      {loanTypes.map(loan => <Link key={loan.href} to={loan.href} className="px-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-secondary rounded-lg transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                          {loan.name}
                        </Link>)}
                    </div>
                  </div>

                  <div className="px-4 py-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Insurance</p>
                    <div className="grid grid-cols-2 gap-1">
                      {insuranceTypes.map(insurance => <Link key={insurance.href} to={insurance.href} className="px-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-secondary rounded-lg transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                          {insurance.name}
                        </Link>)}
                    </div>
                  </div>

                  <Link to="/about" className="px-4 py-3 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-secondary rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    About Us
                  </Link>
                  <Link to="/contact" className="px-4 py-3 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-secondary rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    Contact
                  </Link>
                  {/* Mobile: Authenticated */}
                  {isAuthenticated ? (
                    <>
                      {/* Admin-only buttons */}
                      {isAdmin && (
                        <>
                          <Link to="/admin" className="px-4 py-3 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-secondary rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                            Admin
                          </Link>
                          {/* Removed Admin Users */}
                        </>
                      )}
                      {/* Non-admin users see Dashboard */}
                      {isAuthenticated && !isAdmin && (
                        <Link to="/dashboard" className="px-4 py-3 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-secondary rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                          Dashboard
                        </Link>
                      )}
                      {/* Removed Profile from mobile navbar */}
                      {/* <Link to="/profile" className="px-4 py-3 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-secondary rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Profile</Link> */}
                      <button className="px-4 py-3 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-secondary rounded-xl transition-colors" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>
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
          </nav>
        );
};