import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { ServicesSection } from '@/components/home/ServicesSection';
import { TrustSection } from '@/components/home/TrustSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { EMICalculator } from '@/components/home/EMICalculator';
import { CTASection } from '@/components/home/CTASection';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <ServicesSection />
      <TrustSection />
      <TestimonialsSection />
      <EMICalculator />
      <CTASection />
    </Layout>
  );
};

export default Index;
