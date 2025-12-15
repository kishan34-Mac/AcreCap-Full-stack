import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Apply from "./pages/Apply";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import LoanPage from "./pages/loans/LoanPage";
import InsurancePage from "./pages/insurance/InsurancePage";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import ThankYou from "./pages/ThankYou";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
// import Profile from "./pages/Profile";
import AdminUsers from "./pages/AdminUsers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/apply" element={<ProtectedRoute><Apply /></ProtectedRoute>} />
            <Route path="/thank-you" element={<ProtectedRoute><ThankYou /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>} />
            {/* Removed Profile route */}
            {/* <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} /> */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/loans/:type" element={<LoanPage />} />
            <Route path="/insurance/:type" element={<InsurancePage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
