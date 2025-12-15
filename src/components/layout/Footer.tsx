import { Link } from 'react-router-dom';
import { Leaf, Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
export const Footer = () => {
  return <footer className="bg-secondary/50 border-t border-border/50">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-soft">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">AcreCap</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your trusted partner for loans and insurance. Fast approvals, best rates, and expert guidance for all your financial needs.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => <a key={i} href="#" className="w-10 h-10 rounded-xl bg-background/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>)}
            </div>
          </div>

          {/* Quick Links - Loans */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Loans</h3>
            <ul className="space-y-3">
              {[{
              name: 'Business Loan',
              href: '/loans/business'
            }, {
              name: 'Property Loan',
              href: '/loans/property'
            }, {
              name: 'Personal Loan',
              href: '/loans/personal'
            }, {
              name: 'Home Loan',
              href: '/loans/home'
            }, {
              name: 'Machinery Loan',
              href: '/loans/machinery'
            }].map(link => <li key={link.href}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>)}
            </ul>
          </div>

          {/* Quick Links - Insurance */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Insurance</h3>
            <ul className="space-y-3">
              {[{
              name: 'Motor Insurance',
              href: '/insurance/motor'
            }, {
              name: 'Health Insurance',
              href: '/insurance/health'
            }, {
              name: 'Life Insurance',
              href: '/insurance/life'
            }, {
              name: 'Travel Insurance',
              href: '/insurance/travel'
            }, {
              name: 'Fire Insurance',
              href: '/insurance/fire'
            }].map(link => <li key={link.href}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>)}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  123 Finance Street, Business District, Mumbai 400001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <a href="tel:+919999999999" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  +91 99999 99999
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <a href="mailto:info@finleaf.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  info@finleaf.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} FinLeaf. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>;
};