import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CTASection = () => {
  return (
    <section className="section-padding relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/90">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      </div>
      <div className="absolute right-0 top-0 hidden h-96 w-96 rounded-full bg-accent/20 blur-3xl sm:block" />
      <div className="absolute bottom-0 left-0 hidden h-72 w-72 rounded-full bg-ocean/20 blur-3xl sm:block" />

      <div className="container-custom relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-balance mb-4 text-2xl font-bold text-primary-foreground sm:mb-6 sm:text-4xl lg:text-5xl">
            Ready to Get Started?
          </h2>
          <p className="mb-8 text-sm leading-6 text-primary-foreground/80 sm:mb-10 sm:text-xl sm:leading-8">
            Take the first step towards your financial goals. Apply now and get approved within 24 hours with minimal documentation.
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Button
              size="xl"
              className="w-full bg-accent text-accent-foreground shadow-accent-glow hover:bg-accent/90 sm:w-auto"
              asChild
            >
              <Link to="/apply">
                Apply Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button variant="accent" size="lg" className="w-full sm:w-auto" asChild>
              <a href="https://wa.me/919696255795?text=Hello%21%20I%20would%20like%20detailed%20information%20about%20the%20loan.%20Please%20share%20eligibility%20criteria%2C%20interest%20rates%2C%20required%20documents%2C%20tenure%20options%2C%20and%20processing%20time.%20Thank%20you." target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
            </Button>
          </div>

          <p className="mt-8 text-sm text-primary-foreground/60">
            No hidden charges • 100% secure • Expert guidance
          </p>
        </div>
      </div>
    </section>
  );
};
