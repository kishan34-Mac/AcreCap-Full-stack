import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CTASection = () => {
  return (
    <section className="section-padding bg-gradient-to-br from-primary via-primary/95 to-primary/90 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      </div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-ocean/20 rounded-full blur-3xl" />

      <div className="container-custom relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg sm:text-xl text-primary-foreground/80 mb-10">
            Take the first step towards your financial goals. Apply now and get approved within 24 hours with minimal documentation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="xl"
              className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-accent-glow"
              asChild
            >
              <Link to="/apply">
                Apply Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>

            <Button variant="accent" size="lg" asChild>
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
