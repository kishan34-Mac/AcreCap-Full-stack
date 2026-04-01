import { Link } from "react-router-dom";
import { ArrowRight, Shield, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden py-10 sm:py-0 lg:min-h-[90vh]">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-ocean/5 to-accent/5 animate-gradient" />

      {/* Floating Elements - Hidden on mobile for performance */}
      <div className="absolute -left-20 top-0 hidden h-72 w-72 rounded-full bg-primary/10 blur-3xl animate-float sm:block" />
      <div className="absolute -bottom-10 -right-20 hidden h-96 w-96 rounded-full bg-ocean/10 blur-3xl animate-float-delayed sm:block" />
      <div className="absolute left-1/2 top-1/2 hidden h-64 w-64 rounded-full bg-accent/10 blur-3xl animate-pulse-soft sm:block" />

      {/* Grid Pattern - Optimized for mobile */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.1)_1px,transparent_1px)] bg-[size:2rem_2rem] sm:bg-[size:2.75rem_2.75rem] lg:bg-[size:4rem_4rem]" />

      <div className="container-custom relative z-10">
        <div className="grid items-start gap-6 sm:gap-8 lg:grid-cols-2 lg:items-center lg:gap-20">
          {/* Content */}
          <div className="text-center lg:text-left w-full">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-2 py-1.5 text-[10px] font-medium text-primary animate-fade-up sm:mb-4 sm:px-3 sm:py-2 sm:text-xs">
              <Shield className="h-3 w-3" />
              <span className="hidden xs:inline">
                Trusted by 10,000+ Customers
              </span>
              <span className="inline xs:hidden">Trusted Partner</span>
            </div>

            <h1 className="text-balance mb-3 text-xl font-bold leading-tight text-foreground animate-fade-up sm:mb-4 sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
              Instant Business Loans with{" "}
              <span className="gradient-text">Minimal Documentation</span>
            </h1>

            <p className="mx-auto mb-4 max-w-xl text-xs leading-5 text-muted-foreground animate-fade-up-delayed sm:mb-6 sm:text-sm sm:leading-6 md:text-base lg:mx-0">
              Fast approval • Best rates • Expert guidance. Get the financial
              support you need to grow your business.
            </p>

            <div className="flex flex-col gap-2 animate-fade-up-delayed sm:flex-row sm:justify-center sm:gap-3 lg:justify-start">
              <Button
                variant="hero"
                size="sm"
                className="w-full sm:w-auto text-xs sm:text-sm"
                asChild
              >
                <Link to="/apply">
                  Apply Now
                  <ArrowRight className="ml-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Link>
              </Button>
              <Button
                variant="accent"
                size="sm"
                className="w-full sm:w-auto text-xs sm:text-sm"
                asChild
              >
                <a
                  href="https://wa.me/918460847083?text=Hello%21%20I%20would%20like%20detailed%20information%20about%20the%20loan.%20Please%20share%20eligibility%20criteria%2C%20interest%20rates%2C%20required%20documents%2C%20tenure%20options%2C%20and%20processing%20time.%20Thank%20you."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chat on WhatsApp
                </a>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-5 grid grid-cols-1 gap-2 animate-fade-up-delayed sm:mt-6 sm:grid-cols-3 sm:gap-3 lg:mt-10">
              {[
                { icon: Clock, label: "Approval", value: "24H" },
                { icon: TrendingUp, label: "Rate", value: "10.5%+" },
                { icon: Shield, label: "Secure", value: "100%" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center gap-2 rounded-lg border border-border/50 bg-card/50 px-2 py-2 text-left shadow-soft backdrop-blur-sm sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-3 lg:justify-start"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:h-10 sm:w-10 sm:rounded-xl">
                    <stat.icon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground sm:text-xs">
                      {stat.label}
                    </p>
                    <p className="text-xs font-bold text-foreground sm:text-sm">
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative hidden lg:block w-full">
            <div className="relative z-10 glass-card p-6 animate-scale-in lg:p-8">
              <div className="space-y-4 lg:space-y-6">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center lg:w-16 lg:h-16 lg:rounded-2xl">
                    <TrendingUp className="w-7 h-7 text-primary-foreground lg:w-8 lg:h-8" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground lg:text-sm">
                      Loan Amount
                    </p>
                    <p className="text-xl font-bold text-foreground lg:text-2xl">
                      ₹50,00,000
                    </p>
                  </div>
                </div>

                <div className="h-1.5 bg-secondary rounded-full overflow-hidden lg:h-2">
                  <div className="h-full w-3/4 bg-gradient-to-r from-primary to-success rounded-full" />
                </div>

                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  <div className="p-3 rounded-lg bg-secondary/50 lg:p-4 lg:rounded-xl">
                    <p className="text-[10px] text-muted-foreground lg:text-xs">
                      EMI/Month
                    </p>
                    <p className="text-base font-bold text-foreground lg:text-lg">
                      ₹1,12,500
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50 lg:p-4 lg:rounded-xl">
                    <p className="text-[10px] text-muted-foreground lg:text-xs">
                      Tenure
                    </p>
                    <p className="text-base font-bold text-foreground lg:text-lg">
                      60 Months
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-success/10 border border-success/20">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-success" />
                    <span className="text-sm font-medium text-success">
                      Pre-approved
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    2 min ago
                  </span>
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
                  <p className="text-sm font-medium text-foreground">
                    Quick Disbursal
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Within 48 hours
                  </p>
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
                  <p className="text-xl font-bold text-foreground">
                    ₹50,00,000
                  </p>
                </div>
              </div>

              <div className="mb-4 h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-primary to-success" />
              </div>

              <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
                <div className="rounded-xl bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">EMI/Month</p>
                  <p className="text-base font-bold text-foreground">
                    ₹1,12,500
                  </p>
                </div>
                <div className="rounded-xl bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Tenure</p>
                  <p className="text-base font-bold text-foreground">
                    60 Months
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
