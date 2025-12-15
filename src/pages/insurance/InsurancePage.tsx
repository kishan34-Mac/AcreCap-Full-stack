import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Car, Heart, Plane, Flame, Ship, HardHat, UserCheck, Bike, Truck } from 'lucide-react';

const insuranceData: Record<string, {
  title: string;
  description: string;
  icon: typeof Car;
  types?: { name: string; icon: typeof Car }[];
  benefits: string[];
  coverage: string[];
  whyChoose: string[];
}> = {
  motor: {
    title: 'Motor Insurance',
    description: 'Comprehensive motor insurance for all types of vehicles. Protect your vehicle against accidents, theft, and third-party liabilities with our extensive coverage options.',
    icon: Car,
    types: [
      { name: 'Bike Insurance', icon: Bike },
      { name: 'Car Insurance', icon: Car },
      { name: 'Commercial Vehicles', icon: Truck },
    ],
    benefits: ['Cashless claims at 5000+ garages', 'Quick claim settlement', '24/7 roadside assistance', 'No claim bonus protection', 'Personal accident cover'],
    coverage: ['Own damage cover', 'Third-party liability', 'Theft protection', 'Natural calamities', 'Personal accident'],
    whyChoose: ['Instant policy issuance', 'Best premium rates', 'Hassle-free claims', 'Expert support'],
  },
  health: {
    title: 'Health Insurance',
    description: 'Secure your health and your family\'s well-being with comprehensive health insurance plans. Coverage for hospitalization, critical illness, and more.',
    icon: Heart,
    benefits: ['Cashless treatment at 10,000+ hospitals', 'Pre & post hospitalization cover', 'No room rent capping', 'Free health checkups', 'Tax benefits under 80D'],
    coverage: ['Hospitalization expenses', 'Day care procedures', 'Ambulance charges', 'Organ donor expenses', 'AYUSH treatments'],
    whyChoose: ['Family floater options', 'Lifelong renewability', 'Quick claim settlement', 'Wide hospital network'],
  },
  life: {
    title: 'Life Insurance',
    description: 'Protect your loved ones\' future with our comprehensive life insurance solutions. From term plans to retirement savings, we have the right coverage for every stage of life.',
    icon: UserCheck,
    types: [
      { name: 'Term Life Insurance', icon: UserCheck },
      { name: 'Retirement Plans', icon: UserCheck },
      { name: 'Child Future Plans', icon: UserCheck },
      { name: 'Income Savings Plans', icon: UserCheck },
    ],
    benefits: ['High sum assured at low premium', 'Tax benefits under 80C', 'Flexible premium payment', 'Riders for added protection', 'Easy claim process'],
    coverage: ['Death benefit', 'Critical illness cover', 'Accidental death benefit', 'Premium waiver', 'Maturity benefits'],
    whyChoose: ['Comprehensive coverage', 'Affordable premiums', 'Trusted insurers', 'Expert guidance'],
  },
  travel: {
    title: 'Travel Insurance',
    description: 'Travel worry-free with our comprehensive travel insurance plans. Coverage for medical emergencies, trip cancellation, lost baggage, and more.',
    icon: Plane,
    benefits: ['Worldwide coverage', 'Medical evacuation', 'Trip cancellation cover', 'Lost baggage compensation', '24/7 assistance'],
    coverage: ['Medical expenses abroad', 'Emergency evacuation', 'Trip interruption', 'Passport loss', 'Flight delay'],
    whyChoose: ['Instant policy', 'Affordable plans', 'Multiple destinations', 'Easy claims'],
  },
  fire: {
    title: 'Fire Insurance',
    description: 'Protect your property and assets from fire and allied perils. Comprehensive coverage for your home, office, or industrial premises.',
    icon: Flame,
    benefits: ['Covers fire & lightning', 'Explosion coverage', 'Natural disaster cover', 'Business interruption', 'Debris removal'],
    coverage: ['Building structure', 'Machinery & equipment', 'Stock & inventory', 'Furniture & fixtures', 'Valuable documents'],
    whyChoose: ['Quick assessment', 'Fair claim settlement', 'Expert surveyors', 'Affordable premium'],
  },
  marine: {
    title: 'Marine Insurance',
    description: 'Protect your cargo and shipments with our comprehensive marine insurance. Coverage for goods in transit by sea, air, or land.',
    icon: Ship,
    benefits: ['Door-to-door coverage', 'All risks protection', 'Quick claim settlement', 'Global coverage', 'Flexible policies'],
    coverage: ['Cargo damage', 'Theft & pilferage', 'Natural disasters', 'Shipping accidents', 'Customs duty'],
    whyChoose: ['International coverage', 'Multiple transit modes', 'Competitive rates', 'Expert support'],
  },
  workmen: {
    title: 'Workmen Compensation',
    description: 'Protect your employees with comprehensive workmen compensation insurance. Mandatory coverage for workplace injuries and occupational diseases.',
    icon: HardHat,
    benefits: ['Legal compliance', 'Employee welfare', 'Medical expense cover', 'Disability benefits', 'Death compensation'],
    coverage: ['Workplace accidents', 'Occupational diseases', 'Temporary disability', 'Permanent disability', 'Fatal accidents'],
    whyChoose: ['Statutory compliance', 'Comprehensive cover', 'Quick claims', 'All industries'],
  },
};

export default function InsurancePage() {
  const { type } = useParams<{ type: string }>();
  const insurance = type ? insuranceData[type] : null;

  if (!insurance) {
    return (
      <Layout>
        <section className="section-padding min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Insurance type not found</h1>
            <Button asChild>
              <Link to="/">Go Home</Link>
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  const Icon = insurance.icon;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-ocean/5 via-primary/5 to-accent/5">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-20 h-20 rounded-2xl bg-ocean/10 flex items-center justify-center mx-auto mb-6">
              <Icon className="w-10 h-10 text-ocean" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              {insurance.title}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              {insurance.description}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="hero" size="lg" asChild>
                <Link to="/contact">
                  Get Quote
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/contact">Talk to Expert</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Types (if applicable) */}
      {insurance.types && (
        <section className="section-padding bg-secondary/30">
          <div className="container-custom">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              Our {insurance.title} Products
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {insurance.types.map((insuranceType, i) => (
                <div key={i} className="glass-card-hover p-6 text-center cursor-pointer">
                  <div className="w-16 h-16 rounded-xl bg-ocean/10 flex items-center justify-center mx-auto mb-4">
                    <insuranceType.icon className="w-8 h-8 text-ocean" />
                  </div>
                  <h3 className="font-semibold text-foreground">{insuranceType.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Benefits & Coverage */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Benefits */}
            <div className="glass-card p-8">
              <h3 className="text-xl font-bold text-foreground mb-6">Key Benefits</h3>
              <ul className="space-y-4">
                {insurance.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center mt-0.5">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Coverage */}
            <div className="glass-card p-8">
              <h3 className="text-xl font-bold text-foreground mb-6">What's Covered</h3>
              <ul className="space-y-4">
                {insurance.coverage.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-ocean/20 flex items-center justify-center mt-0.5">
                      <Check className="w-4 h-4 text-ocean" />
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Why Choose */}
            <div className="glass-card p-8">
              <h3 className="text-xl font-bold text-foreground mb-6">Why Choose Us</h3>
              <ul className="space-y-4">
                {insurance.whyChoose.map((reason, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-ocean">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold text-ocean-foreground mb-4">
            Get Your {insurance.title} Quote Today
          </h2>
          <p className="text-ocean-foreground/80 mb-8 max-w-xl mx-auto">
            Compare plans from top insurers and get the best coverage at the most competitive prices.
          </p>
          <Button size="xl" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
            <Link to="/contact">
              Get Free Quote
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
