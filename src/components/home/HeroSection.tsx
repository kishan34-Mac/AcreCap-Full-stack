import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const HeroSection = () => {


  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-ocean/5 to-accent/5 animate-gradient" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-ocean/10 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse-soft" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-up">
              <Shield className="w-4 h-4" />
              Trusted by 10,000+ Customers
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-fade-up">
              Instant Business Loans with{' '}
              <span className="gradient-text">Minimal Documentation</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-up-delayed">
              Fast approval • Best rates • Expert guidance. Get the financial support you need to grow your business.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-up-delayed">
              <Button variant="hero" size="xl" asChild>
                <Link to="/apply">
                  Apply Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="accent" size="xl" asChild>
                <a href="https://wa.me/919696255795?text=Hello%21%20I%20would%20like%20detailed%20information%20about%20the%20loan.%20Please%20share%20eligibility%20criteria%2C%20interest%20rates%2C%20required%20documents%2C%20tenure%20options%2C%20and%20processing%20time.%20Thank%20you." target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 justify-center lg:justify-start mt-12 animate-fade-up-delayed">
              {[
                { icon: Clock, label: 'Fast Approval', value: '24 Hours' },
                { icon: TrendingUp, label: 'Interest Rate', value: 'From 10.5%' },
                { icon: Shield, label: 'Secure Process', value: '100% Safe' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-lg font-bold text-foreground">{stat.value}</p>
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
        </div>
      </div>
    </section>
  );
};
