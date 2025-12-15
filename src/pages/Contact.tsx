import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const contactInfo = [
  {
    icon: MapPin,
    title: 'Visit Us',
    details: ['123 Finance Street', 'Business District', 'Mumbai 400001'],
  },
  {
    icon: Phone,
    title: 'Call Us',
    details: ['+91 99999 99999', '+91 88888 88888'],
  },
  {
    icon: Mail,
    title: 'Email Us',
    details: ['info@finleaf.com', 'support@finleaf.com'],
  },
  {
    icon: Clock,
    title: 'Working Hours',
    details: ['Mon - Fri: 9:00 AM - 6:00 PM', 'Sat: 10:00 AM - 4:00 PM'],
  },
];

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Message Sent!',
      description: 'We will get back to you within 24 hours.',
    });
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  // WhatsApp redirection removed

  return (
    <Layout>
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-primary/5 via-ocean/5 to-accent/5">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              Get in Touch
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              We're Here to{' '}
              <span className="gradient-text">Help You</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Have questions about our services? Our team is ready to assist you. Reach out to us through any of the channels below.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              {contactInfo.map((info, i) => (
                <div key={i} className="glass-card p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <info.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{info.title}</h3>
                      {info.details.map((detail, j) => (
                        <p key={j} className="text-sm text-muted-foreground">{detail}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex flex-col gap-2">
                <Button variant="outline" className="w-full" size="lg" asChild>
                  <a href="https://wa.me/919696255795?text=Hello%21%20I%20would%20like%20detailed%20information%20about%20the%20loan.%20Please%20share%20eligibility%20criteria%2C%20interest%20rates%2C%20required%20documents%2C%20tenure%20options%2C%20and%20processing%20time.%20Thank%20you." target="_blank" rel="noopener noreferrer">
                    <Phone className="w-5 h-5 mr-2" />
                    Chat on WhatsApp
                  </a>
                </Button>
                <Button variant="accent" className="w-full" size="lg" asChild>
                  <a href="mailto:support@AcreCap.com">
                    <Mail className="w-5 h-5 mr-2" />
                    Email Us
                  </a>
                </Button>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="glass-card p-6 sm:p-10">
                <h2 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="How can we help?"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us more about your inquiry..."
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <Button type="submit" variant="accent" size="lg">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-96 bg-secondary">
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Interactive map would be displayed here</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
