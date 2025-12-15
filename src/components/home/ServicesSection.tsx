import { Link } from 'react-router-dom';
import { ArrowRight, Banknote, Shield, Building2, User, Home, CreditCard, Cog, Car, Heart, Plane, Flame, Ship, HardHat, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const loanServices = [
  { icon: Building2, name: 'Business Loan', desc: 'Fuel your business growth', href: '/loans/business' },
  { icon: Home, name: 'Home Loan', desc: 'Own your dream home', href: '/loans/home' },
  { icon: User, name: 'Personal Loan', desc: 'For all your personal needs', href: '/loans/personal' },
  { icon: Banknote, name: 'Property Loan', desc: 'Unlock property value', href: '/loans/property' },
  { icon: CreditCard, name: 'CC / OD Loan', desc: 'Flexible credit line', href: '/loans/cc-od' },
  { icon: Cog, name: 'Machinery Loan', desc: 'Upgrade your equipment', href: '/loans/machinery' },
];

const insuranceServices = [
  { icon: Car, name: 'Motor Insurance', desc: 'Complete vehicle protection', href: '/insurance/motor' },
  { icon: Heart, name: 'Health Insurance', desc: 'Secure your health', href: '/insurance/health' },
  { icon: UserCheck, name: 'Life Insurance', desc: 'Protect your loved ones', href: '/insurance/life' },
  { icon: Plane, name: 'Travel Insurance', desc: 'Safe journeys always', href: '/insurance/travel' },
  { icon: Flame, name: 'Fire Insurance', desc: 'Asset protection', href: '/insurance/fire' },
  { icon: HardHat, name: 'WC Policy', desc: 'Employee protection', href: '/insurance/workmen' },
];

export const ServicesSection = () => {
  return (
    <section className="section-padding bg-secondary/30">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Our Services
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Financial Solutions for{' '}
            <span className="gradient-text">Every Need</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From business loans to comprehensive insurance coverage, we provide end-to-end financial solutions tailored to your requirements.
          </p>
        </div>

        {/* Loans Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Banknote className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Loan Products</h3>
            </div>
            <Link to="/loans" className="hidden sm:flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loanServices.map((service, i) => (
              <Link
                key={i}
                to={service.href}
                className="glass-card-hover p-6 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <service.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {service.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">{service.desc}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Insurance Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ocean to-ocean/80 flex items-center justify-center">
                <Shield className="w-6 h-6 text-ocean-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Insurance Products</h3>
            </div>
            <Link to="/insurance" className="hidden sm:flex items-center gap-2 text-ocean font-medium hover:gap-3 transition-all">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {insuranceServices.map((service, i) => (
              <Link
                key={i}
                to={service.href}
                className="glass-card-hover p-6 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-ocean/10 flex items-center justify-center group-hover:bg-ocean/20 transition-colors">
                    <service.icon className="w-7 h-7 text-ocean" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-foreground mb-1 group-hover:text-ocean transition-colors">
                      {service.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">{service.desc}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-ocean group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button variant="accent" size="lg" asChild>
            <Link to="/apply">
              Get Started Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
