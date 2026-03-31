import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const HeroSection = () => {
  return (
    <section className="relative flex min-h-[auto] items-start overflow-hidden py-8 sm:min-h-[82svh] sm:items-center sm:py-0 lg:min-h-[90vh]">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-ocean/5 to-accent/5 animate-gradient" />
      
      {/* Floating Elements */}
      <div className="absolute left-0 top-16 hidden h-72 w-72 rounded-full bg-primary/10 blur-3xl animate-float sm:block" />
      <div className="absolute bottom-10 right-0 hidden h-96 w-96 rounded-full bg-ocean/10 blur-3xl animate-float-delayed sm:block" />
      <div className="absolute left-1/2 top-1/2 hidden h-64 w-64 rounded-full bg-accent/10 blur-3xl animate-pulse-soft sm:block" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.18)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.18)_1px,transparent_1px)] bg-[size:2.75rem_2.75rem] sm:bg-[size:4rem_4rem]" />

      <div className="container-custom relative z-10">
        <div className="grid items-start gap-8 sm:gap-10 lg:grid-cols-2 lg:items-center lg:gap-20">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-[11px] font-medium text-primary animate-fade-up sm:mb-6 sm:px-4 sm:text-sm">
              <Shield className="h-4 w-4" />
              Trusted by 10,000+ Customers
            </div>

            <h1 className="text-balance mb-4 text-[1.9rem] font-bold leading-[1.08] text-foreground animate-fade-up sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
              Instant Business Loans with{' '}
              <span className="gradient-text">Minimal Documentation</span>
            </h1>

            <p className="mx-auto mb-6 max-w-xl text-sm leading-6 text-muted-foreground animate-fade-up-delayed sm:mb-8 sm:text-lg sm:leading-7 md:text-xl lg:mx-0">
              Fast approval • Best rates • Expert guidance. Get the financial support you need to grow your business.
            </p>

            <div className="flex flex-col gap-3 animate-fade-up-delayed sm:flex-row sm:justify-center lg:justify-start">
              <Button variant="hero" size="xl" className="w-full sm:w-auto" asChild>
                <Link to="/apply">
                  Apply Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="accent" size="xl" className="w-full sm:w-auto" asChild>
                <a href="https://wa.me/919696255795?text=Hello%21%20I%20would%20like%20detailed%20information%20about%20the%20loan.%20Please%20share%20eligibility%20criteria%2C%20interest%20rates%2C%20required%20documents%2C%20tenure%20options%2C%20and%20processing%20time.%20Thank%20you." target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-1 gap-3 animate-fade-up-delayed sm:grid-cols-3 sm:gap-4 lg:mt-12">
              {[
                { icon: Clock, label: 'Fast Approval', value: '24 Hours' },
                { icon: TrendingUp, label: 'Interest Rate', value: 'From 10.5%' },
                { icon: Shield, label: 'Secure Process', value: '100% Safe' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-center gap-3 rounded-2xl border border-border/50 bg-card/70 px-4 py-3 text-left shadow-soft backdrop-blur-sm lg:justify-start">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
                    <p className="text-base font-bold text-foreground sm:text-lg">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative hidden lg:block">
            <div className="relative z-10 glass-card p-8 animate-scale-in">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Loan Amount</p>
                    <p className="text-2xl font-bold text-foreground">₹50,00,000</p>
                  </div>
                </div>

                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-primary to-success rounded-full" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-secondary/50">
                    <p className="text-xs text-muted-foreground">EMI/Month</p>
                    <p className="text-lg font-bold text-foreground">₹1,12,500</p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/50">
                    <p className="text-xs text-muted-foreground">Tenure</p>
                    <p className="text-lg font-bold text-foreground">60 Months</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-success/10 border border-success/20">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-success" />
                    <span className="text-sm font-medium text-success">Pre-approved</span>
                  </div>
                  <span className="text-xs text-muted-foreground">2 min ago</span>
                </div>
              </div>
            </div>

            {/* Decorative Cards */}
            <div className="absolute -top-4 -right-4 w-32 h-32 glass-card animate-float flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">98%</p>
                <p className="text-xs text-muted-foreground">Approval Rate</p>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 w-40 glass-card p-4 animate-float-delayed">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Quick Disbursal</p>
                  <p className="text-xs text-muted-foreground">Within 48 hours</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:hidden">
            <div className="glass-card p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80">
                  <TrendingUp className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Loan Amount</p>
                  <p className="text-xl font-bold text-foreground">₹50,00,000</p>
                </div>
              </div>

              <div className="mb-4 h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-primary to-success" />
              </div>

              <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
                <div className="rounded-xl bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">EMI/Month</p>
                  <p className="text-base font-bold text-foreground">₹1,12,500</p>
                </div>
                <div className="rounded-xl bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Tenure</p>
                  <p className="text-base font-bold text-foreground">60 Months</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
