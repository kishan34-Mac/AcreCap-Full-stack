import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Clock, Shield, TrendingUp, Building2, Home, User, Banknote, CreditCard, Cog, FileText } from 'lucide-react';

const loanData: Record<string, {
  title: string;
  description: string;
  icon: typeof Building2;
  features: string[];
  eligibility: string[];
  documents: string[];
  interestRate: string;
  tenure: string;
  maxAmount: string;
}> = {
  business: {
    title: 'Business Loan',
    description: 'Fuel your business growth with quick and flexible business loans. Whether you need working capital, want to expand, or require funds for new equipment, we have got you covered.',
    icon: Building2,
    features: ['No collateral required up to ₹75 Lakhs', 'Flexible repayment options', 'Quick approval in 24 hours', 'Minimal documentation', 'Competitive interest rates'],
    eligibility: ['Business vintage of 2+ years', 'Minimum turnover of ₹25 Lakhs', 'Good credit score (650+)', 'Valid GST registration'],
    documents: ['PAN Card & Aadhaar', 'Business registration proof', 'Bank statements (6 months)', 'ITR for last 2 years', 'GST returns'],
    interestRate: 'From 10.5% p.a.',
    tenure: 'Up to 60 months',
    maxAmount: 'Up to ₹5 Crore',
  },
  property: {
    title: 'Property Loan',
    description: 'Unlock the value of your property with our loan against property. Get substantial funds at attractive interest rates while retaining ownership of your asset.',
    icon: Banknote,
    features: ['Up to 70% of property value', 'Lower interest rates', 'Long tenure options', 'Both residential & commercial', 'No prepayment charges'],
    eligibility: ['Property ownership', 'Clear property title', 'Good credit history', 'Stable income source'],
    documents: ['Property documents', 'Identity & address proof', 'Income proof', 'Bank statements', 'Property valuation report'],
    interestRate: 'From 9.5% p.a.',
    tenure: 'Up to 15 years',
    maxAmount: 'Up to ₹10 Crore',
  },
  project: {
    title: 'Project Loan',
    description: 'Finance your large-scale projects with our tailored project financing solutions. Ideal for construction, infrastructure, and industrial projects.',
    icon: FileText,
    features: ['Customized repayment structure', 'Large funding capacity', 'Expert project assessment', 'Progress-based disbursement', 'Technical assistance'],
    eligibility: ['Detailed project report', 'Proven track record', 'Adequate promoter contribution', 'Viable project proposal'],
    documents: ['Project report', 'Cost estimates', 'Statutory approvals', 'Promoter documents', 'Financial projections'],
    interestRate: 'From 11% p.a.',
    tenure: 'Up to 10 years',
    maxAmount: 'Up to ₹50 Crore',
  },
  personal: {
    title: 'Personal Loan',
    description: 'Get instant personal loans for all your needs - be it a wedding, vacation, medical emergency, or home renovation. Quick approval with minimal documentation.',
    icon: User,
    features: ['No collateral required', 'Instant approval', 'Flexible usage', 'Quick disbursal', 'Affordable EMIs'],
    eligibility: ['Age 21-58 years', 'Salaried or self-employed', 'Good credit score (700+)', 'Stable income'],
    documents: ['PAN Card & Aadhaar', 'Salary slips (3 months)', 'Bank statements (6 months)', 'Employment proof'],
    interestRate: 'From 10.99% p.a.',
    tenure: 'Up to 60 months',
    maxAmount: 'Up to ₹40 Lakhs',
  },
  home: {
    title: 'Home Loan',
    description: 'Turn your dream home into reality with our affordable home loans. Whether buying, constructing, or renovating, we make home ownership accessible.',
    icon: Home,
    features: ['Up to 90% funding', 'Longest tenure options', 'Tax benefits available', 'Balance transfer facility', 'Top-up loan option'],
    eligibility: ['Age 21-65 years', 'Stable employment', 'Good credit score', 'Property in approved area'],
    documents: ['Identity & address proof', 'Income documents', 'Property documents', 'Builder agreements', 'Approved plan'],
    interestRate: 'From 8.5% p.a.',
    tenure: 'Up to 30 years',
    maxAmount: 'Up to ₹10 Crore',
  },
  'cc-od': {
    title: 'CC / OD Loan',
    description: 'Access flexible credit with our Cash Credit and Overdraft facilities. Pay interest only on the amount utilized, perfect for managing working capital needs.',
    icon: CreditCard,
    features: ['Pay interest only on usage', 'Revolving credit line', 'Easy renewal process', 'No fixed EMI', 'Flexible withdrawal'],
    eligibility: ['Established business', 'Good banking relationship', 'Adequate security', 'Positive cash flows'],
    documents: ['Business financials', 'Stock statements', 'Collateral documents', 'Bank statements', 'GST returns'],
    interestRate: 'From 11% p.a.',
    tenure: 'Renewable annually',
    maxAmount: 'Up to ₹5 Crore',
  },
  machinery: {
    title: 'Machinery Loan',
    description: 'Upgrade your business with the latest machinery and equipment. Our machinery loans help you stay competitive with modern technology and equipment.',
    icon: Cog,
    features: ['Up to 100% equipment cost', 'Quick processing', 'New & used machinery', 'Tax benefits', 'Flexible repayment'],
    eligibility: ['Business vintage 2+ years', 'Profitable operations', 'Good credit history', 'Valid quotations'],
    documents: ['Proforma invoice', 'Business documents', 'Financial statements', 'Bank statements', 'KYC documents'],
    interestRate: 'From 10% p.a.',
    tenure: 'Up to 84 months',
    maxAmount: 'Up to ₹3 Crore',
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
            <h1 className="text-2xl font-bold text-foreground mb-4">Loan type not found</h1>
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
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-primary/5 via-ocean/5 to-accent/5">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Icon className="w-4 h-4" />
                Loan Products
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                {loan.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                {loan.description}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/apply">
                    Apply Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/contact">Talk to Expert</Link>
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-4">
              {[
                { icon: TrendingUp, label: 'Interest Rate', value: loan.interestRate },
                { icon: Clock, label: 'Tenure', value: loan.tenure },
                { icon: Shield, label: 'Loan Amount', value: loan.maxAmount },
              ].map((stat, i) => (
                <div key={i} className="glass-card p-6 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features & Details */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Features */}
            <div className="glass-card p-8">
              <h3 className="text-xl font-bold text-foreground mb-6">Key Features</h3>
              <ul className="space-y-4">
                {loan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center mt-0.5">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Eligibility */}
            <div className="glass-card p-8">
              <h3 className="text-xl font-bold text-foreground mb-6">Eligibility</h3>
              <ul className="space-y-4">
                {loan.eligibility.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Documents */}
            <div className="glass-card p-8">
              <h3 className="text-xl font-bold text-foreground mb-6">Documents Required</h3>
              <ul className="space-y-4">
                {loan.documents.map((doc, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-ocean/20 flex items-center justify-center mt-0.5">
                      <Check className="w-4 h-4 text-ocean" />
                    </div>
                    <span className="text-muted-foreground">{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Ready to Apply?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Get your {loan.title.toLowerCase()} approved within 24 hours. Our experts will guide you through the entire process.
          </p>
          <Button size="xl" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
            <Link to="/apply">
              Start Application
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
