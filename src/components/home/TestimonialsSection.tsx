import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    id: 1,
    name: 'Rajesh Sharma',
    role: 'Business Owner',
    company: 'Sharma Enterprises',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    text: 'AcreCap helped me secure a business loan within just 3 days. The process was incredibly smooth and the team was extremely professional. Highly recommend their services!',
  },
  {
    id: 2,
    name: 'Priya Patel',
    role: 'Entrepreneur',
    company: 'TechStart Solutions',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    text: 'Getting health insurance for my family was a breeze with AcreCap. They explained all the options clearly and helped us choose the perfect plan. Outstanding service!',
  },
  {
    id: 3,
    name: 'Amit Kumar',
    role: 'Factory Owner',
    company: 'Kumar Manufacturing',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    text: 'I needed a machinery loan urgently for expanding my factory. AcreCap made it happen with minimal documentation. Their expertise in financial services is unmatched.',
  },
  {
    id: 4,
    name: 'Sunita Verma',
    role: 'Real Estate Developer',
    company: 'Verma Properties',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    text: 'For my property loan needs, AcreCap was the perfect partner. They negotiated the best rates and handled everything professionally. Will definitely use them again!',
  },
  {
    id: 5,
    name: 'Vikram Singh',
    role: 'Transport Business',
    company: 'Singh Logistics',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    text: 'Motor insurance for my entire fleet was handled efficiently by AcreCap. Great coverage options and competitive premiums. Excellent customer support throughout!',
  },
];

export const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  return (
    <section className="py-20 md:py-28 bg-secondary/30">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            What Our <span className="text-primary">Clients Say</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it. Hear from our satisfied customers who have achieved their financial goals with us.
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Quote Icon */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center z-10">
            <Quote className="w-8 h-8 text-primary" />
          </div>

          {/* Main Card */}
          <div className="glass-card rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

            <div className="relative z-10">
              {/* Avatar */}
              <div className="mb-6">
                <img
                  src={testimonials[currentIndex].image}
                  alt={testimonials[currentIndex].name}
                  className="w-20 h-20 rounded-full mx-auto object-cover ring-4 ring-primary/20 shadow-glow"
                />
              </div>

              {/* Rating */}
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-lg md:text-xl text-foreground/90 leading-relaxed mb-8 max-w-2xl mx-auto">
                "{testimonials[currentIndex].text}"
              </p>

              {/* Author Info */}
              <div>
                <h4 className="text-xl font-bold text-foreground">
                  {testimonials[currentIndex].name}
                </h4>
                <p className="text-muted-foreground">
                  {testimonials[currentIndex].role} at {testimonials[currentIndex].company}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 rounded-full shadow-soft bg-background/80 backdrop-blur-sm"
            onClick={goToPrevious}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 rounded-full shadow-soft bg-background/80 backdrop-blur-sm"
            onClick={goToNext}
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          {/* Dots Navigation */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-primary w-8'
                    : 'bg-primary/30 hover:bg-primary/50'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          {[
            { value: '10,000+', label: 'Happy Customers' },
            { value: '₹500Cr+', label: 'Loans Disbursed' },
            { value: '98%', label: 'Approval Rate' },
            { value: '4.9/5', label: 'Customer Rating' },
          ].map((stat, index) => (
            <div key={index} className="text-center p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50">
              <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
