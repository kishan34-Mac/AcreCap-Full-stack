import { useEffect } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Any global layout effects can go here
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      {/* pt-16 for mobile, pt-20 for md and up */}
      <main className="pt-16 pb-8 md:pt-20 md:pb-16">{children}</main>
      <Footer />
    </div>
  );
};
