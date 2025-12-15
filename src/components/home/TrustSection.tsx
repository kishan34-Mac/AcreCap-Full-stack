import { Clock, Shield, Users, Handshake, CheckCircle2, TrendingUp } from 'lucide-react';

const trustFactors = [
  {
    icon: Clock,
    title: 'Fast Approval',
    description: 'Get loan approval within 24 hours with minimal documentation required.',
    stat: '24 hrs',
  },
  {
    icon: Shield,
    title: 'Secure Data',
    description: 'Bank-grade encryption ensures your personal data is always protected.',
    stat: '100%',
  },
  {
    icon: Users,
    title: 'Expert Advisors',
    description: 'Dedicated financial experts guide you through every step of the process.',
    stat: '50+',
  },
  {
    icon: Handshake,
    title: 'Trusted Partners',
    description: 'We partner with leading banks and NBFCs for the best rates.',
    stat: '25+',
  },
];

const achievements = [
  { value: '₹500Cr+', label: 'Loans Disbursed' },
  { value: '10,000+', label: 'Happy Customers' },
  { value: '98%', label: 'Approval Rate' },
  { value: '4.9/5', label: 'Customer Rating' },
];

export const TrustSection = () => {
  return (
    <section className="section-padding">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium mb-4">
            Why Choose Us
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Trusted by Thousands of{' '}
            <span className="gradient-text">Businesses</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            We've helped thousands of businesses and individuals achieve their financial goals with our transparent and efficient services.
          </p>
        </div>

        {/* Trust Factors Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {trustFactors.map((factor, i) => (
            <div
              key={i}
              className="glass-card-hover p-6 text-center group"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <factor.icon className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary mb-2">{factor.stat}</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{factor.title}</h3>
              <p className="text-sm text-muted-foreground">{factor.description}</p>
            </div>
          ))}
        </div>

        {/* Achievements Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-8 md:p-12">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:2rem_2rem]" />
          </div>

          <div className="relative z-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {achievements.map((achievement, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-2">
                    {achievement.value}
                  </div>
                  <p className="text-sm sm:text-base text-primary-foreground/80">{achievement.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-foreground mb-6">What Sets Us Apart</h3>
            {[
              'Lowest interest rates in the market',
              'Zero hidden charges or fees',
              'Flexible repayment options',
              'Dedicated relationship manager',
              'Online application & tracking',
              'Quick disbursal within 48 hours',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                </div>
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>

          <div className="glass-card p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-accent" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground">Growth Partner</h4>
                <p className="text-sm text-muted-foreground">More than just a lender</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              We don't just provide loans – we become your financial growth partner. Our expert advisors work closely with you to understand your needs and recommend the best solutions. From application to disbursal, we ensure a smooth and transparent journey.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
