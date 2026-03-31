import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  Car,
  Heart,
  Plane,
  Flame,
  Ship,
  HardHat,
  UserCheck,
  Bike,
  Truck,
  ShieldCheck,
  Clock3,
  FileText,
  Headphones,
} from "lucide-react";

type InsuranceEntry = {
  title: string;
  description: string;
  icon: typeof Car;
  types?: { name: string; icon: typeof Car }[];
  benefits: string[];
  coverage: string[];
  whyChoose: string[];
  idealFor: string[];
  exclusions: string[];
  process: string[];
  faq: { question: string; answer: string }[];
};

const insuranceData: Record<string, InsuranceEntry> = {
  motor: {
    title: "Motor Insurance",
    description:
      "Comprehensive motor insurance for private cars, bikes, and commercial vehicles with protection against accident damage, theft, third-party liability, and unexpected repairs.",
    icon: Car,
    types: [
      { name: "Bike Insurance", icon: Bike },
      { name: "Car Insurance", icon: Car },
      { name: "Commercial Vehicles", icon: Truck },
    ],
    benefits: [
      "Cashless claims at 5000+ garages",
      "Quick claim registration and tracking",
      "24/7 roadside assistance",
      "No-claim bonus support",
      "Personal accident cover",
    ],
    coverage: [
      "Own damage cover",
      "Third-party liability",
      "Theft and total loss",
      "Natural calamities and riots",
      "Personal accident for owner-driver",
    ],
    whyChoose: [
      "Fast policy issuance",
      "Competitive premiums",
      "Guidance on add-ons and IDV",
      "Dedicated support for renewals and claims",
    ],
    idealFor: [
      "Private vehicle owners",
      "Bike riders and daily commuters",
      "Fleet and transport operators",
      "Businesses using commercial vehicles",
    ],
    exclusions: [
      "Normal wear and tear",
      "Driving without a valid license",
      "Driving under the influence",
      "Mechanical or electrical breakdown without add-on cover",
    ],
    process: [
      "Share vehicle and policy details",
      "Compare insurer options and add-ons",
      "Receive the best-fit quote",
      "Issue policy instantly with digital documents",
    ],
    faq: [
      {
        question: "Do you help with expired policy renewal?",
        answer:
          "Yes. We assist with renewals, inspection requirements, and insurer selection for lapsed policies.",
      },
      {
        question: "Can I add zero depreciation cover?",
        answer:
          "Yes. We help you choose add-ons like zero dep, engine protect, roadside assistance, and return to invoice.",
      },
    ],
  },
  health: {
    title: "Health Insurance",
    description:
      "Protect your family against rising medical costs with health plans covering hospitalization, surgeries, daycare procedures, emergency treatment, and long-term renewal support.",
    icon: Heart,
    benefits: [
      "Cashless treatment at 10,000+ hospitals",
      "Pre and post hospitalization cover",
      "No room rent capping in select plans",
      "Annual preventive health checkups",
      "Tax benefits under Section 80D",
    ],
    coverage: [
      "Hospitalization expenses",
      "Day care procedures",
      "Ambulance charges",
      "Organ donor expenses",
      "AYUSH treatment in eligible plans",
    ],
    whyChoose: [
      "Family floater and individual options",
      "Lifelong renewability support",
      "Claim guidance from our team",
      "Wide hospital and insurer network",
    ],
    idealFor: [
      "Individuals and families",
      "Senior citizens requiring long-term support",
      "Young professionals building protection early",
      "Parents securing cashless healthcare access",
    ],
    exclusions: [
      "Waiting period conditions",
      "Cosmetic treatment unless medically required",
      "Non-prescribed treatment",
      "Expenses outside policy coverage terms",
    ],
    process: [
      "Understand family size, age, and coverage need",
      "Compare sum insured, waiting periods, and hospitals",
      "Choose the right plan and riders",
      "Get issued policy and support documentation",
    ],
    faq: [
      {
        question: "Which is better: family floater or individual plans?",
        answer:
          "It depends on age mix, budget, and medical history. We guide you based on family profile and coverage goals.",
      },
      {
        question: "Do you help with porting an old policy?",
        answer:
          "Yes. We help compare options and coordinate the porting process where applicable.",
      },
    ],
  },
  life: {
    title: "Life Insurance",
    description:
      "Build long-term protection and future certainty with term insurance, retirement planning, child plans, and income-oriented life solutions structured around your family goals.",
    icon: UserCheck,
    types: [
      { name: "Term Life Insurance", icon: UserCheck },
      { name: "Retirement Plans", icon: UserCheck },
      { name: "Child Future Plans", icon: UserCheck },
      { name: "Income Savings Plans", icon: UserCheck },
    ],
    benefits: [
      "High cover at affordable premium",
      "Tax benefits under Section 80C",
      "Riders for extra protection",
      "Flexible premium payment terms",
      "Structured family financial protection",
    ],
    coverage: [
      "Death benefit",
      "Critical illness riders",
      "Accidental death benefit",
      "Premium waiver rider",
      "Maturity benefits for applicable plans",
    ],
    whyChoose: [
      "Goal-based plan selection",
      "Trusted insurer options",
      "Clear premium vs cover guidance",
      "Support through underwriting and issuance",
    ],
    idealFor: [
      "Primary earning members",
      "Parents planning for children",
      "Professionals building long-term security",
      "Families seeking income replacement cover",
    ],
    exclusions: [
      "Non-disclosed material information",
      "Suicide clause during initial policy period",
      "Lapsed policies without revival",
      "Specific rider exclusions as per insurer terms",
    ],
    process: [
      "Assess income, liabilities, and family goals",
      "Choose coverage amount and plan type",
      "Complete underwriting and medicals if needed",
      "Issue policy with nominee setup support",
    ],
    faq: [
      {
        question: "How much life cover should I take?",
        answer:
          "Usually 10 to 15 times annual income is a starting point, but liabilities and future goals matter more. We help calculate it properly.",
      },
      {
        question: "Can I combine term cover and savings plans?",
        answer:
          "Yes. Many customers use term cover for protection and separate savings products for wealth or retirement goals.",
      },
    ],
  },
  travel: {
    title: "Travel Insurance",
    description:
      "Travel with confidence using plans built for medical emergencies abroad, trip cancellation, delayed baggage, passport loss, and emergency assistance during domestic or international travel.",
    icon: Plane,
    benefits: [
      "Worldwide protection",
      "Medical emergency assistance",
      "Trip cancellation and interruption cover",
      "Lost baggage and passport support",
      "24/7 helpline during travel",
    ],
    coverage: [
      "Medical treatment abroad",
      "Emergency evacuation",
      "Trip interruption",
      "Passport loss assistance",
      "Flight delay support",
    ],
    whyChoose: [
      "Fast policy issuance for urgent travel",
      "Single-trip and multi-trip options",
      "Affordable plans for leisure and business",
      "Support with insurer documentation",
    ],
    idealFor: [
      "International travellers",
      "Students travelling abroad",
      "Business travellers",
      "Families taking vacations",
    ],
    exclusions: [
      "Known medical conditions unless covered",
      "Travel against medical advice",
      "High-risk adventure activities in standard plans",
      "Loss due to negligence in some cases",
    ],
    process: [
      "Share destination, trip duration, and traveller age",
      "Compare policy options and cover limits",
      "Choose the right travel plan",
      "Receive digital policy instantly",
    ],
    faq: [
      {
        question: "Is travel insurance mandatory?",
        answer:
          "Some countries and visa categories require it. Even where optional, it is strongly recommended for medical and trip-related risks.",
      },
      {
        question: "Can I buy travel insurance at the last minute?",
        answer:
          "Yes, in most cases you can buy it shortly before departure as long as the trip has not already started.",
      },
    ],
  },
  fire: {
    title: "Fire Insurance",
    description:
      "Protect your premises, stock, machinery, and business continuity from fire and allied perils through property-focused fire insurance built for homes, offices, shops, and industrial sites.",
    icon: Flame,
    benefits: [
      "Fire and lightning protection",
      "Explosion and implosion cover",
      "Natural calamity support",
      "Business interruption options",
      "Debris removal expenses",
    ],
    coverage: [
      "Building structure",
      "Plant and machinery",
      "Stock and inventory",
      "Furniture and fixtures",
      "Important records and documents",
    ],
    whyChoose: [
      "Structured cover for business risk",
      "Fast assessment support",
      "Affordable premium planning",
      "Guidance on sum insured calculation",
    ],
    idealFor: [
      "Factories and workshops",
      "Retail stores and warehouses",
      "Commercial offices",
      "Property owners with valuable assets",
    ],
    exclusions: [
      "War and nuclear risks",
      "Intentional damage",
      "Wear and tear",
      "Uninsured consequential loss",
    ],
    process: [
      "Review property and asset profile",
      "Estimate correct replacement value",
      "Choose coverage and extensions",
      "Issue policy with declaration support",
    ],
    faq: [
      {
        question: "Do you cover only fire damage?",
        answer:
          "No. Depending on the plan, allied perils like explosion, storm, flood, and impact damage may also be covered.",
      },
      {
        question: "Can stock and machinery be covered in one policy?",
        answer:
          "Yes. We help structure the right sections and asset values under the chosen fire policy.",
      },
    ],
  },
  marine: {
    title: "Marine Insurance",
    description:
      "Cover your cargo and goods in transit against loss, theft, damage, and shipping risk with marine insurance structured for domestic and international movement.",
    icon: Ship,
    benefits: [
      "Door-to-door cover",
      "All-risk protection in eligible plans",
      "Fast claim support",
      "Global and domestic transit coverage",
      "Flexible policy formats",
    ],
    coverage: [
      "Cargo damage in transit",
      "Theft and pilferage",
      "Natural calamity impact",
      "Transit accidents",
      "Customs duty in applicable scenarios",
    ],
    whyChoose: [
      "Support for importers and exporters",
      "Single transit and annual plans",
      "Competitive insurer options",
      "Documentation support for claims",
    ],
    idealFor: [
      "Import/export businesses",
      "Manufacturers shipping inventory",
      "Distributors and wholesalers",
      "Companies moving high-value goods",
    ],
    exclusions: [
      "Improper packing",
      "Delay-related commercial loss",
      "Ordinary leakage or wear",
      "Inherent vice of goods",
    ],
    process: [
      "Understand shipment type and route",
      "Assess value and risk profile",
      "Select annual or single-transit policy",
      "Issue cover note and policy documents",
    ],
    faq: [
      {
        question: "Do you cover inland transit too?",
        answer:
          "Yes. We can arrange inland transit cover along with broader marine cargo protection where needed.",
      },
      {
        question: "What if I ship frequently?",
        answer:
          "An annual marine open policy may be a better fit for frequent shipments than buying one cover at a time.",
      },
    ],
  },
  workmen: {
    title: "Workmen Compensation",
    description:
      "Meet statutory obligations and protect employees with workmen compensation insurance covering workplace injury, disability, occupational illness, and accidental death compensation.",
    icon: HardHat,
    benefits: [
      "Helps meet statutory requirements",
      "Protects employer liability",
      "Medical and compensation support",
      "Coverage for disability cases",
      "Financial support for fatal claims",
    ],
    coverage: [
      "Workplace accidents",
      "Occupational diseases",
      "Temporary disability",
      "Permanent disability",
      "Fatal injury compensation",
    ],
    whyChoose: [
      "Essential for labour-heavy operations",
      "Useful across multiple industries",
      "Expert claim and policy support",
      "Structured employer risk protection",
    ],
    idealFor: [
      "Factories and industrial units",
      "Construction businesses",
      "Contractors and labour-intensive firms",
      "Businesses with field or shop-floor employees",
    ],
    exclusions: [
      "Intentional self-injury",
      "Injury outside covered employment conditions",
      "Non-work-related incidents",
      "Excluded diseases or circumstances as per policy terms",
    ],
    process: [
      "Review employee roles and wage details",
      "Estimate liability exposure",
      "Choose the right compensation cover",
      "Issue policy with payroll-aligned setup",
    ],
    faq: [
      {
        question: "Is this mandatory for every business?",
        answer:
          "It depends on employee category and business operations, but many labour-oriented businesses should maintain this cover to manage statutory risk.",
      },
      {
        question: "Can this be taken for contract workers?",
        answer:
          "Yes, subject to policy structure and employer liability exposure. We help define that correctly.",
      },
    ],
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
            <h1 className="mb-4 text-2xl font-bold text-foreground">
              Insurance type not found
            </h1>
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
      <section className="section-padding bg-gradient-to-br from-ocean/5 via-primary/5 to-accent/5">
        <div className="container-custom">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-ocean/10 px-4 py-2 text-sm font-medium text-ocean">
                <ShieldCheck className="h-4 w-4" />
                Insurance Solutions
              </div>
              <h1 className="mb-6 text-4xl font-bold text-foreground sm:text-5xl">
                {insurance.title}
              </h1>
              <p className="mb-8 text-lg leading-8 text-muted-foreground">
                {insurance.description}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/contact">
                    Get Quote
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/contact">Talk to Expert</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {[
                {
                  icon: Icon,
                  label: "Protection Focus",
                  value: insurance.coverage[0],
                },
                {
                  icon: Clock3,
                  label: "Support Model",
                  value: "Quick guidance and policy issuance",
                },
                {
                  icon: Headphones,
                  label: "Assistance",
                  value: "Help with insurer comparison and claims",
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="glass-card flex items-center gap-4 p-6"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ocean/10">
                    <card.icon className="h-7 w-7 text-ocean" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className="text-lg font-bold text-foreground">
                      {card.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {insurance.types && (
        <section className="section-padding bg-secondary/30">
          <div className="container-custom">
            <div className="mb-10 max-w-2xl">
              <h2 className="mb-3 text-3xl font-bold text-foreground">
                {insurance.title} Plans We Help With
              </h2>
              <p className="text-muted-foreground">
                Explore the most relevant plan options for your use case and let
                us help match you with the right insurer and premium structure.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {insurance.types.map((insuranceType) => (
                <div
                  key={insuranceType.name}
                  className="glass-card-hover p-6 text-center"
                >
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-ocean/10">
                    <insuranceType.icon className="h-8 w-8 text-ocean" />
                  </div>
                  <h3 className="font-semibold text-foreground">
                    {insuranceType.name}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="glass-card p-8">
              <h3 className="mb-6 text-xl font-bold text-foreground">
                Key Benefits
              </h3>
              <ul className="space-y-4">
                {insurance.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-success/20">
                      <Check className="h-4 w-4 text-success" />
                    </div>
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-8">
              <h3 className="mb-6 text-xl font-bold text-foreground">
                What's Covered
              </h3>
              <ul className="space-y-4">
                {insurance.coverage.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-ocean/20">
                      <Check className="h-4 w-4 text-ocean" />
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-8">
              <h3 className="mb-6 text-xl font-bold text-foreground">
                Why Choose Us
              </h3>
              <ul className="space-y-4">
                {insurance.whyChoose.map((reason) => (
                  <li key={reason} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-secondary/30">
        <div className="container-custom">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="glass-card p-8">
              <h3 className="mb-6 text-2xl font-bold text-foreground">
                Ideal For
              </h3>
              <div className="grid gap-3">
                {insurance.idealFor.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-border/50 bg-background/60 px-4 py-3 text-muted-foreground"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-8">
              <h3 className="mb-6 text-2xl font-bold text-foreground">
                Common Exclusions
              </h3>
              <div className="grid gap-3">
                {insurance.exclusions.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-border/50 bg-background/60 px-4 py-3 text-muted-foreground"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="mb-10 max-w-2xl">
            <h2 className="mb-3 text-3xl font-bold text-foreground">
              How We Help You Get Covered
            </h2>
            <p className="text-muted-foreground">
              We simplify the process from plan selection to policy issuance, so
              you get the right protection without confusing paperwork.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {insurance.process.map((step, index) => (
              <div key={step} className="glass-card p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">
                  {index + 1}
                </div>
                <p className="font-medium text-foreground">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-secondary/30">
        <div className="container-custom">
          <div className="mb-10 max-w-2xl">
            <h2 className="mb-3 text-3xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Common questions customers ask before choosing a policy.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {insurance.faq.map((item) => (
              <div key={item.question} className="glass-card p-7">
                <div className="mb-3 flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-ocean/10">
                    <FileText className="h-5 w-5 text-ocean" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {item.question}
                  </h3>
                </div>
                <p className="text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-ocean">
        <div className="container-custom text-center">
          <h2 className="mb-4 text-3xl font-bold text-ocean-foreground">
            Get Your {insurance.title} Quote Today
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-ocean-foreground/80">
            Tell us your need and we will help compare insurers, explain
            coverage, and guide you toward the best-fit protection plan.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="xl"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              asChild
            >
              <Link to="/contact">
                Get Free Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10"
              asChild
            >
              <Link to="/about">Why Choose AcreCap</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
