import { useEffect } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Any global layout effects can go here
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-20 pb-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};
