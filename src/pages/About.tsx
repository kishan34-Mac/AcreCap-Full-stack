import { Layout } from '@/components/layout/Layout';
import { Shield, Target, Heart, Award, Users, TrendingUp } from 'lucide-react';

const values = [
  {
    icon: Shield,
    title: 'Trust & Transparency',
    description: 'We believe in complete transparency with no hidden charges or surprises.',
  },
  {
    icon: Target,
    title: 'Customer Focus',
    description: 'Your financial goals are our priority. We tailor solutions to your needs.',
  },
  {
    icon: Heart,
    title: 'Integrity',
    description: 'We conduct business with the highest ethical standards and integrity.',
  },
  {
    icon: Award,
    title: 'Excellence',
    description: 'We strive for excellence in every interaction and service we provide.',
  },
];

const team = [
  { name: 'Rajesh Kumar', role: 'Founder & CEO', experience: '20+ years in Finance' },
  { name: 'Priya Sharma', role: 'Head of Loans', experience: '15+ years in Banking' },
  { name: 'Amit Patel', role: 'Insurance Director', experience: '18+ years in Insurance' },
  { name: 'Sneha Reddy', role: 'Customer Success', experience: '10+ years in Service' },
];

export default function About() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-primary/5 via-ocean/5 to-accent/5">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              About FinLeaf
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Your Trusted Financial Partner Since{' '}
              <span className="gradient-text">2010</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              For over a decade, we've been helping businesses and individuals achieve their financial dreams through transparent, efficient, and customer-centric services.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  FinLeaf was founded with a simple mission: to make financial services accessible, transparent, and hassle-free for everyone. What started as a small lending firm has grown into a comprehensive financial services company.
                </p>
                <p>
                  Over the years, we've helped thousands of businesses secure funding for growth, and countless families protect their futures through our insurance solutions. Our success is built on the trust of our customers and our commitment to their success.
                </p>
                <p>
                  Today, we partner with over 25 leading banks and insurance companies to bring you the best products at competitive rates. Our team of experts works tirelessly to ensure you get the right solution for your unique needs.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Users, value: '10,000+', label: 'Happy Customers' },
                { icon: TrendingUp, value: '₹500Cr+', label: 'Loans Disbursed' },
                { icon: Shield, value: '25+', label: 'Partner Banks' },
                { icon: Award, value: '14+', label: 'Years Experience' },
              ].map((stat, i) => (
                <div key={i} className="glass-card p-6 text-center">
                  <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-secondary/30">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Our Core Values
            </h2>
            <p className="text-muted-foreground">
              These principles guide everything we do and how we serve our customers.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <div key={i} className="glass-card-hover p-6 text-center">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Leadership Team
            </h2>
            <p className="text-muted-foreground">
              Meet the experts who lead our mission to transform financial services.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <div key={i} className="glass-card p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-foreground">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                <p className="text-primary text-sm font-medium">{member.role}</p>
                <p className="text-xs text-muted-foreground mt-1">{member.experience}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
