import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  Clock,
  Shield,
  TrendingUp,
  Building2,
  Home,
  User,
  Banknote,
  CreditCard,
  Cog,
  FileText,
  CircleDollarSign,
  BadgeCheck,
} from "lucide-react";

type LoanEntry = {
  title: string;
  description: string;
  icon: typeof Building2;
  features: string[];
  eligibility: string[];
  documents: string[];
  interestRate: string;
  tenure: string;
  maxAmount: string;
  useCases: string[];
  process: string[];
  faq: { question: string; answer: string }[];
};

const loanData: Record<string, LoanEntry> = {
  business: {
    title: "Business Loan",
    description:
      "Fuel business growth with quick and flexible funding for working capital, expansion, inventory, marketing, vendor payouts, and operational stability.",
    icon: Building2,
    features: [
      "No collateral required up to eligible limits",
      "Flexible repayment options",
      "Quick approval support",
      "Minimal documentation guidance",
      "Competitive lender comparisons",
    ],
    eligibility: [
      "Business vintage of 2+ years",
      "Minimum turnover of around ₹25 Lakhs",
      "Healthy banking and repayment track",
      "Valid business and tax documentation",
    ],
    documents: [
      "PAN Card and Aadhaar",
      "Business registration proof",
      "Bank statements",
      "ITR and financials",
      "GST returns where applicable",
    ],
    interestRate: "From 10.5% p.a.",
    tenure: "Up to 60 months",
    maxAmount: "Up to ₹5 Crore",
    useCases: [
      "Working capital and cash flow support",
      "Business expansion and branch setup",
      "Inventory purchase",
      "Marketing and hiring",
    ],
    process: [
      "Discuss business profile and funding need",
      "Shortlist lender options",
      "Submit documents and eligibility details",
      "Get sanction support and guided disbursal",
    ],
    faq: [
      {
        question: "Can I get a business loan without collateral?",
        answer:
          "Yes, many unsecured business loan options are available depending on turnover, banking history, and credit profile.",
      },
      {
        question: "How quickly can the loan be processed?",
        answer:
          "Processing time depends on documentation and lender policy, but we help reduce delays by preparing the file correctly from the start.",
      },
    ],
  },
  property: {
    title: "Property Loan",
    description:
      "Unlock funds against residential or commercial property while continuing to retain ownership, with larger eligibility and longer repayment flexibility.",
    icon: Banknote,
    features: [
      "High-value funding linked to property value",
      "Lower rates than many unsecured options",
      "Long repayment tenure",
      "Residential and commercial property accepted",
      "Useful for personal or business liquidity needs",
    ],
    eligibility: [
      "Clear property ownership and title chain",
      "Acceptable credit and repayment profile",
      "Income or cash-flow support",
      "Property in lender-approved category",
    ],
    documents: [
      "Property ownership documents",
      "Identity and address proof",
      "Income proof or financials",
      "Bank statements",
      "Valuation and legal papers as required",
    ],
    interestRate: "From 9.5% p.a.",
    tenure: "Up to 15 years",
    maxAmount: "Up to ₹10 Crore",
    useCases: [
      "Business expansion",
      "Debt consolidation",
      "Large personal funding needs",
      "Working capital backed by property",
    ],
    process: [
      "Assess property and funding requirement",
      "Review legal and valuation feasibility",
      "Match with suitable lenders",
      "Coordinate sanction and disbursal",
    ],
    faq: [
      {
        question: "Can I use the funds for business needs?",
        answer:
          "Yes. Loan against property can often be used for business growth, working capital, or other eligible financial needs.",
      },
      {
        question: "Do I lose ownership of the property?",
        answer:
          "No. The property remains in your ownership while being offered as security to the lender.",
      },
    ],
  },
  project: {
    title: "Project Loan",
    description:
      "Structured project funding for construction, infrastructure, manufacturing expansion, and large capital expenditure backed by viability and execution planning.",
    icon: FileText,
    features: [
      "Customized repayment structures",
      "Large-ticket financing support",
      "Progress-based disbursement planning",
      "Technical and financial review support",
      "Structured lender coordination",
    ],
    eligibility: [
      "Detailed project report",
      "Promoter contribution readiness",
      "Viable financial projections",
      "Clear execution and approval path",
    ],
    documents: [
      "Detailed project report",
      "Cost and revenue estimates",
      "Promoter KYC and entity documents",
      "Approvals and permits",
      "Projected financial statements",
    ],
    interestRate: "From 11% p.a.",
    tenure: "Up to 10 years",
    maxAmount: "Up to ₹50 Crore",
    useCases: [
      "Factory setup or expansion",
      "Infrastructure or commercial projects",
      "Capex-led growth plans",
      "Large-scale execution funding",
    ],
    process: [
      "Review project feasibility and size",
      "Align financial structure and lender appetite",
      "Prepare lender-ready documentation",
      "Support sanction, compliance, and phased disbursal",
    ],
    faq: [
      {
        question: "Do you help prepare the lender presentation?",
        answer:
          "Yes. We help refine the project file, funding ask, and financial story before lender discussions.",
      },
      {
        question: "Is promoter contribution necessary?",
        answer:
          "In most project finance structures, yes. Lenders usually expect a defined promoter contribution.",
      },
    ],
  },
  personal: {
    title: "Personal Loan",
    description:
      "Access quick unsecured funding for medical needs, weddings, travel, education, emergencies, and planned lifestyle expenses with clear repayment visibility.",
    icon: User,
    features: [
      "No collateral required",
      "Fast approval support",
      "Flexible end-use",
      "Simple documentation",
      "Affordable EMI planning",
    ],
    eligibility: [
      "Age and income as per lender policy",
      "Salaried or self-employed profile",
      "Healthy repayment history",
      "Valid KYC and banking documents",
    ],
    documents: [
      "PAN Card and Aadhaar",
      "Salary slips or income proof",
      "Bank statements",
      "Employment or business proof",
    ],
    interestRate: "From 10.99% p.a.",
    tenure: "Up to 60 months",
    maxAmount: "Up to ₹40 Lakhs",
    useCases: [
      "Medical emergencies",
      "Wedding or family expenses",
      "Travel and education needs",
      "Home improvement",
    ],
    process: [
      "Check profile and required amount",
      "Match with suitable lenders",
      "Complete digital documentation",
      "Track approval and disbursal",
    ],
    faq: [
      {
        question: "Do I need collateral for a personal loan?",
        answer:
          "No. Personal loans are generally unsecured and approved based on profile, income, and credit history.",
      },
      {
        question: "Can I prepay the loan?",
        answer:
          "Many lenders allow part-payment or foreclosure, though charges depend on lender terms.",
      },
    ],
  },
  home: {
    title: "Home Loan",
    description:
      "Buy, build, renovate, or transfer your home loan with structured support for property funding, eligibility improvement, and long-tenure affordability.",
    icon: Home,
    features: [
      "High funding eligibility",
      "Long repayment tenure",
      "Balance transfer and top-up options",
      "Support for purchase, construction, and renovation",
      "Tax-saving potential under applicable law",
    ],
    eligibility: [
      "Stable income and repayment ability",
      "Good credit profile",
      "Property in lender-acceptable area",
      "Required property and applicant documents",
    ],
    documents: [
      "Identity and address proof",
      "Income proof",
      "Property papers",
      "Builder or seller documents",
      "Bank statements",
    ],
    interestRate: "From 8.5% p.a.",
    tenure: "Up to 30 years",
    maxAmount: "Up to ₹10 Crore",
    useCases: [
      "Home purchase",
      "House construction",
      "Renovation and extension",
      "Balance transfer with top-up",
    ],
    process: [
      "Check budget, income, and property stage",
      "Compare lenders and rates",
      "Coordinate legal and technical checks",
      "Support sanction and disbursal milestones",
    ],
    faq: [
      {
        question: "Can I shift my existing home loan?",
        answer:
          "Yes. Balance transfer options can reduce rate burden and may allow an additional top-up in eligible cases.",
      },
      {
        question: "Do you help with under-construction properties?",
        answer:
          "Yes. We help review builder documents and lender fit for under-construction purchases where supported.",
      },
    ],
  },
  "cc-od": {
    title: "CC / OD Loan",
    description:
      "Use revolving credit for business operations and working capital management, paying interest primarily on utilized funds rather than the entire sanctioned line.",
    icon: CreditCard,
    features: [
      "Interest typically charged on utilized amount",
      "Flexible withdrawals and repayments",
      "Useful for ongoing business cycles",
      "Renewable working capital support",
      "Better liquidity control",
    ],
    eligibility: [
      "Established business operations",
      "Banking and turnover history",
      "Adequate collateral or stock support where needed",
      "Healthy cash-flow profile",
    ],
    documents: [
      "Business financial statements",
      "Stock statements",
      "Collateral papers where applicable",
      "Bank statements",
      "GST and tax records",
    ],
    interestRate: "From 11% p.a.",
    tenure: "Renewable annually",
    maxAmount: "Up to ₹5 Crore",
    useCases: [
      "Managing receivable cycles",
      "Inventory-led businesses",
      "Vendor and payroll timing gaps",
      "Seasonal working capital requirements",
    ],
    process: [
      "Understand operating cycle and fund usage",
      "Assess banking and financial strength",
      "Prepare lender file and stock details",
      "Support sanction and limit setup",
    ],
    faq: [
      {
        question: "How is CC/OD different from a term loan?",
        answer:
          "A term loan is disbursed as a fixed loan with EMI repayment, while CC/OD works like a revolving facility for flexible business use.",
      },
      {
        question: "Can new businesses get CC/OD?",
        answer:
          "It is generally easier for established businesses with financial track record, but eligibility varies by lender and collateral profile.",
      },
    ],
  },
  machinery: {
    title: "Machinery Loan",
    description:
      "Finance machinery, tools, and equipment upgrades to improve productivity, quality, and output while spreading capital cost over manageable repayments.",
    icon: Cog,
    features: [
      "Support for new or eligible used machinery",
      "Flexible structure based on asset type",
      "Capex-focused funding",
      "Quick processing with quotations",
      "Useful for manufacturing and service businesses",
    ],
    eligibility: [
      "Business vintage and stable operations",
      "Clear machinery requirement",
      "Healthy financial profile",
      "Quotation or proforma invoice availability",
    ],
    documents: [
      "Proforma invoice",
      "Business documents",
      "Financial statements",
      "Bank statements",
      "KYC documents",
    ],
    interestRate: "From 10% p.a.",
    tenure: "Up to 84 months",
    maxAmount: "Up to ₹3 Crore",
    useCases: [
      "Plant and machine upgrades",
      "Production expansion",
      "Replacement of outdated equipment",
      "Productivity and quality improvement",
    ],
    process: [
      "Review equipment need and quotation",
      "Assess business capacity and lender fit",
      "Prepare documentation and asset file",
      "Support approval and vendor payment flow",
    ],
    faq: [
      {
        question: "Can the lender pay the supplier directly?",
        answer:
          "Yes. In many machinery loans, payment is made directly to the equipment supplier after approval.",
      },
      {
        question: "Do you finance imported machinery too?",
        answer:
          "Yes, depending on lender policy, invoice structure, and business profile.",
      },
    ],
  },
};

export default function LoanPage() {
  const { type } = useParams<{ type: string }>();
  const loan = type ? loanData[type] : null;

  if (!loan) {
    return (
      <Layout>
        <section className="section-padding min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-foreground">
              Loan type not found
            </h1>
            <Button asChild>
              <Link to="/">Go Home</Link>
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  const Icon = loan.icon;

  return (
    <Layout>
      <section className="section-padding bg-gradient-to-br from-primary/5 via-ocean/5 to-accent/5">
        <div className="container-custom">
          <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Icon className="h-4 w-4" />
                Loan Products
              </div>
              <h1 className="text-balance mb-4 text-3xl font-bold text-foreground sm:mb-6 sm:text-5xl">
                {loan.title}
              </h1>
              <p className="mb-6 text-sm leading-6 text-muted-foreground sm:mb-8 sm:text-lg sm:leading-8">
                {loan.description}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <Button variant="hero" size="lg" className="w-full sm:w-auto" asChild>
                  <Link to="/apply">
                    Apply Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
                  <Link to="/contact">Talk to Expert</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {[
                {
                  icon: TrendingUp,
                  label: "Interest Rate",
                  value: loan.interestRate,
                },
                {
                  icon: Clock,
                  label: "Tenure",
                  value: loan.tenure,
                },
                {
                  icon: CircleDollarSign,
                  label: "Maximum Amount",
                  value: loan.maxAmount,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="glass-card flex items-center gap-4 p-5 sm:p-6"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <stat.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-lg font-bold text-foreground sm:text-xl">
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid gap-5 md:grid-cols-3 md:gap-8">
            <div className="glass-card p-5 sm:p-6 lg:p-8">
              <h3 className="mb-6 text-xl font-bold text-foreground">
                Key Features
              </h3>
              <ul className="space-y-4">
                {loan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-success/20">
                      <Check className="h-4 w-4 text-success" />
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-5 sm:p-6 lg:p-8">
              <h3 className="mb-6 text-xl font-bold text-foreground">
                Eligibility
              </h3>
              <ul className="space-y-4">
                {loan.eligibility.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-5 sm:p-6 lg:p-8">
              <h3 className="mb-6 text-xl font-bold text-foreground">
                Documents Required
              </h3>
              <ul className="space-y-4">
                {loan.documents.map((doc) => (
                  <li key={doc} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-ocean/20">
                      <Check className="h-4 w-4 text-ocean" />
                    </div>
                    <span className="text-muted-foreground">{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-secondary/30">
        <div className="container-custom">
          <div className="grid gap-5 lg:grid-cols-2 lg:gap-8">
            <div className="glass-card p-5 sm:p-6 lg:p-8">
              <h3 className="mb-6 text-2xl font-bold text-foreground">
                Best Use Cases
              </h3>
              <div className="grid gap-3">
                {loan.useCases.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-border/50 bg-background/60 px-4 py-3 text-muted-foreground"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5 sm:p-6 lg:p-8">
              <h3 className="mb-6 text-2xl font-bold text-foreground">
                Why Customers Choose AcreCap
              </h3>
              <div className="grid gap-4">
                {[
                  "Lender comparison instead of one-bank selling",
                  "Documentation help to reduce rejection risk",
                  "Hands-on follow-up until decision stage",
                  "Guidance on EMI, tenure, and affordability",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary/15">
                      <BadgeCheck className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-muted-foreground">{item}</p>
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
            <h2 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
              How the Loan Process Works
            </h2>
            <p className="text-muted-foreground">
              We keep the process simple, transparent, and lender-ready from the
              first conversation to the final disbursal.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
            {loan.process.map((step, index) => (
              <div key={step} className="glass-card p-5 sm:p-6">
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
            <h2 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              A few practical questions borrowers usually ask before applying.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
            {loan.faq.map((item) => (
              <div key={item.question} className="glass-card p-5 sm:p-7">
                <div className="mb-3 flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
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

      <section className="section-padding bg-primary">
        <div className="container-custom text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary-foreground">
            Ready to Apply for {loan.title}?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-primary-foreground/80">
            Share your requirement and we will help you choose the right lender,
            structure the application properly, and move faster with fewer
            surprises.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <Button
              size="xl"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 sm:w-auto"
              asChild
            >
              <Link to="/apply">
                Start Application
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="w-full border-white/30 bg-transparent text-white hover:bg-white/10 sm:w-auto"
              asChild
            >
              <Link to="/contact">Talk to Expert</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
