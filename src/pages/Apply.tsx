import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, ArrowLeft, Check, Phone, Building2, User, Banknote, FileText } from 'lucide-react';

const steps = [
  { id: 1, title: 'Basic Details', icon: User },
  { id: 2, title: 'Business Info', icon: Building2 },
  { id: 3, title: 'Loan Details', icon: Banknote },
  { id: 4, title: 'Documents', icon: FileText },
];

import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { sendStatusEmail } from '@/lib/email';
import { logActivity } from '@/lib/sync';



// Helpers to validate optional PAN/GST without blocking submission
const isValidPAN = (v: string | null | undefined) => {
  if (!v) return false;
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(v);
};
const isValidGSTIN = (v: string | null | undefined) => {
  if (!v) return false;
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i.test(v);
};

export default function Apply() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    city: '',
    businessName: '',
    businessType: '',
    annualTurnover: '',
    yearsInBusiness: '',
    loanAmount: '',
    loanPurpose: '',
    tenure: '',
    panNumber: '',
    gstNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const Step1Schema = z.object({
    name: z.string().min(2, 'Name is required'),
    mobile: z.string().regex(/^\+?\d{10,15}$/i, 'Valid mobile number is required'),
    email: z.string().email('Valid email is required'),
    city: z.string().min(2, 'City is required'),
  });
  const Step2Schema = z.object({
    businessName: z.string().min(2, 'Business name is required'),
    businessType: z.string().min(2, 'Business type is required'),
    annualTurnover: z.string().min(1, 'Annual turnover is required'),
    yearsInBusiness: z.string().min(1, 'Years in business is required'),
  });
  const Step3Schema = z.object({
    loanAmount: z.string().min(1, 'Loan amount is required'),
    tenure: z.string().min(1, 'Tenure is required'),
    loanPurpose: z.string().min(2, 'Loan purpose is required'),
  });
  const Step4Schema = z.object({
    panNumber: z.string().optional().refine((v) => !v || /^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(v), {
      message: 'Invalid PAN format',
    }),
    gstNumber: z.string().optional().refine((v) => !v || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i.test(v), {
      message: 'Invalid GST format',
    }),
  });

  const validateField = (name: string, value: string) => {
    try {
      const obj: any = { [name]: value };
      let schema: z.ZodSchema<any> | null = null;
      if (['name','mobile','email','city'].includes(name)) schema = Step1Schema.pick({ [name]: true } as any);
      else if (['businessName','businessType','annualTurnover','yearsInBusiness'].includes(name)) schema = Step2Schema.pick({ [name]: true } as any);
      else if (['loanAmount','tenure','loanPurpose'].includes(name)) schema = Step3Schema.pick({ [name]: true } as any);
      else if (['panNumber','gstNumber'].includes(name)) schema = Step4Schema.pick({ [name]: true } as any);
      if (!schema) return;
      schema.parse(obj);
      setErrors((prev) => ({ ...prev, [name]: '' }));
    } catch (e) {
      const err = e as z.ZodError;
      const msg = err.issues[0]?.message || 'Invalid value';
      setErrors((prev) => ({ ...prev, [name]: msg }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const normalizedValue = (name === 'panNumber' || name === 'gstNumber')
      ? value.toUpperCase().replace(/\s+/g, '')
      : value;
    setFormData({ ...formData, [name]: normalizedValue });
    validateField(name, normalizedValue);
  };

  const validateStep = (step: number) => {
    try {
      if (step === 1) Step1Schema.parse(formData);
      if (step === 2) Step2Schema.parse(formData);
      if (step === 3) Step3Schema.parse(formData);
      if (step === 4) {
        // Soft validation: do not block submission for optional PAN/GST
        const res = Step4Schema.safeParse(formData);
        if (!res.success) {
          const fieldErrors: Record<string, string> = {};
          res.error.issues.forEach((issue) => {
            const path = issue.path[0]?.toString();
            if (path) fieldErrors[path] = issue.message;
          });
          setErrors((prev) => ({ ...prev, ...fieldErrors }));
        }
        return true;
      }
      return true;
    } catch (e) {
      const err = e as z.ZodError;
      const fieldErrors: Record<string, string> = {};
      err.issues.forEach((issue) => {
        const path = issue.path[0]?.toString();
        if (path) fieldErrors[path] = issue.message;
      });
      setErrors((prev) => ({ ...prev, ...fieldErrors }));
      // Focus the first invalid field for better accessibility
      const firstInvalid = Object.keys(fieldErrors)[0];
      if (firstInvalid) {
        const el = document.getElementById(firstInvalid);
        if (el && 'focus' in el) (el as HTMLElement).focus();
      }
      toast({ title: 'Please fix the highlighted fields', description: 'Some required information is missing or invalid.', variant: 'destructive' });
      return false;
    }
  };

  const handleNext = async () => {
    const valid = validateStep(currentStep);
    if (!valid) return;
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final submit
      try {
        setSubmitting(true);
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user?.id || null;
        const sanitizedPan = isValidPAN(formData.panNumber) ? formData.panNumber : null;
        const sanitizedGst = isValidGSTIN(formData.gstNumber) ? formData.gstNumber : null;
        const payload = {
          user_id: userId,
          name: formData.name,
          mobile: formData.mobile,
          email: formData.email,
          city: formData.city,
          businessName: formData.businessName,
          businessType: formData.businessType,
          annualTurnover: formData.annualTurnover,
          yearsInBusiness: formData.yearsInBusiness,
          loanAmount: formData.loanAmount,
          loanPurpose: formData.loanPurpose,
          tenure: formData.tenure,
          panNumber: sanitizedPan,
          gstNumber: sanitizedGst,
          status: 'pending' as const,
        };

        // Remote insert only
        let createdId: string | null = null;
        let createdAt: string | null = null;
        try {
          const token = sessionData.session?.access_token ?? (sessionData.session as any)?.access_token;
          // Build primary base from env and define fallback to Render; ensure single /api segment
          const makeApiBase = (raw: string | undefined) => {
            if (!raw) return null;
            const noSlash = raw.trim().replace(/\/+$/, '');
            const base = noSlash.endsWith('/api') ? noSlash : `${noSlash}/api`;
            return base || null;
          };
          const primaryBase = makeApiBase(import.meta.env.VITE_BACKEND_URL as string | undefined);
          const fallbackBase = makeApiBase('https://acrecap-full-stack.onrender.com');
          const urlFor = (base: string | null, path: string) => {
            const p = path.replace(/^\/+/, '');
            return `${base}/${p}`;
          };

          // Attempt primary backend first (if defined), otherwise use fallback directly
          const doPost = async (base: string | null) => {
            const res = await fetch(urlFor(base!, 'submissions'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify(payload),
            });
            const json = await res.json().catch(() => ({}));
            return { res, json } as const;
          };

          let res, json;
          if (primaryBase) {
            try {
              ({ res, json } = await doPost(primaryBase));
            } catch (networkErr) {
              // Network failure: try fallback
              ({ res, json } = await doPost(fallbackBase));
            }
            if (!res.ok) {
              // Some hosts may return 404 not_found if API route unavailable; retry fallback once
              if (res.status === 404 && fallbackBase && primaryBase !== fallbackBase) {
                ({ res, json } = await doPost(fallbackBase));
              }
            }
          } else {
            ({ res, json } = await doPost(fallbackBase));
          }

          if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
          const data = json?.submission;
          createdId = data?.id ?? null;
          createdAt = data?.created_at ?? null;
          if (!createdId) throw new Error('No submission id returned');
        } catch (insertErr: any) {
          toast({ title: 'Submission failed', description: insertErr?.message || 'Unable to submit your application right now. Please try again.', variant: 'destructive' });
          setSubmitting(false);
          return;
        }

        // Optional: Google Sheets webhook sync
        const submissionForExport = { id: createdId!, created_at: createdAt!, ...payload };
        const sheetsWebhook = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL as string | undefined;
        if (sheetsWebhook) {
          fetch(sheetsWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submissionForExport),
          }).catch(() => {});
        }
        // Optional: Admin notification webhook
        const adminWebhook = import.meta.env.VITE_ADMIN_NOTIFICATION_WEBHOOK_URL as string | undefined;
        if (adminWebhook) {
          fetch(adminWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'new_submission', submission: submissionForExport }),
          }).catch(() => {});
        }
        // Send acknowledgment email (pending status)
        sendStatusEmail({
          id: submissionForExport.id,
          name: submissionForExport.name,
          email: submissionForExport.email,
          mobile: submissionForExport.mobile,
          city: submissionForExport.city,
          businessName: submissionForExport.businessName,
          businessType: submissionForExport.businessType,
          loanAmount: submissionForExport.loanAmount,
          loanPurpose: submissionForExport.loanPurpose,
          tenure: submissionForExport.tenure,
          created_at: submissionForExport.created_at,
          status: 'pending',
        }, 'pending');
        await logActivity('apply_submit', { id: submissionForExport.id });
        setSubmitting(false);
        navigate(`/thank-you?id=${submissionForExport.id}`);
      } catch (e: any) {
        setSubmitting(false);
        toast({ title: 'Submission failed', description: e?.message || 'Unknown error', variant: 'destructive' });
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };



  if (isSubmitted) {
    return (
      <Layout>
        <section className="section-padding min-h-[80vh] flex items-center">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-8 animate-scale-in">
                <Check className="w-12 h-12 text-success" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 animate-fade-up">
                Application Submitted!
              </h1>
              <p className="text-lg text-muted-foreground mb-8 animate-fade-up-delayed">
                Thank you for your application. Our team will review your details and contact you within 24 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up-delayed">
                <Button variant="outline" size="lg" asChild>
                  <a href="tel:+919999999999">
                    <Phone className="w-5 h-5 mr-2" />
                    Call Us Now
                  </a>
                </Button>
                <Button variant="accent" size="lg" asChild>
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="section-padding">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Apply for a Loan
              </h1>
              <p className="text-lg text-muted-foreground">
                Fill in your details below. It only takes a few minutes.
              </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-12">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                        currentStep >= step.id
                          ? 'bg-primary text-primary-foreground shadow-glow'
                          : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {currentStep > step.id ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 hidden sm:block ${
                        currentStep >= step.id ? 'text-primary font-medium' : 'text-muted-foreground'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-12 sm:w-24 h-1 mx-2 rounded-full transition-all ${
                        currentStep > step.id ? 'bg-primary' : 'bg-secondary'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Form Card */}
            <div className="glass-card p-6 sm:p-10">
              {/* Step 1: Basic Details */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Personal Information</h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        aria-invalid={!!errors.name}
                        aria-describedby="error-name"
                      />
                      {errors.name && <p id="error-name" className="text-sm text-destructive mt-1">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile">Mobile Number *</Label>
                      <Input
                        id="mobile"
                        name="mobile"
                        placeholder="+91 98765 43210"
                        value={formData.mobile}
                        onChange={handleChange}
                        type="tel"
                        inputMode="tel"
                        aria-invalid={!!errors.mobile}
                        aria-describedby="error-mobile"
                      />
                      {errors.mobile && <p id="error-mobile" className="text-sm text-destructive mt-1">{errors.mobile}</p>}
                      {/* WhatsApp note removed */}
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
                        aria-invalid={!!errors.email}
                        aria-describedby="error-email"
                      />
                      {errors.email && <p id="error-email" className="text-sm text-destructive mt-1">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="Enter your city"
                        value={formData.city}
                        onChange={handleChange}
                        aria-invalid={!!errors.city}
                        aria-describedby="error-city"
                      />
                      {errors.city && <p id="error-city" className="text-sm text-destructive mt-1">{errors.city}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Business Info */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Business Information</h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input
                        id="businessName"
                        name="businessName"
                        placeholder="Enter business name"
                        value={formData.businessName}
                        onChange={handleChange}
                        aria-invalid={!!errors.businessName}
                        aria-describedby="error-businessName"
                      />
                      {errors.businessName && <p id="error-businessName" className="text-sm text-destructive mt-1">{errors.businessName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type *</Label>
                      <Input
                        id="businessType"
                        name="businessType"
                        placeholder="e.g., Manufacturing, Trading"
                        value={formData.businessType}
                        onChange={handleChange}
                        aria-invalid={!!errors.businessType}
                        aria-describedby="error-businessType"
                      />
                      {errors.businessType && <p id="error-businessType" className="text-sm text-destructive mt-1">{errors.businessType}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="annualTurnover">Annual Turnover *</Label>
                      <Input
                        id="annualTurnover"
                        name="annualTurnover"
                        placeholder="e.g., ₹50 Lakhs"
                        value={formData.annualTurnover}
                        onChange={handleChange}
                        inputMode="numeric"
                        aria-invalid={!!errors.annualTurnover}
                        aria-describedby="error-annualTurnover"
                      />
                      {errors.annualTurnover && <p id="error-annualTurnover" className="text-sm text-destructive mt-1">{errors.annualTurnover}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearsInBusiness">Years in Business *</Label>
                      <Input
                        id="yearsInBusiness"
                        name="yearsInBusiness"
                        placeholder="e.g., 5 years"
                        value={formData.yearsInBusiness}
                        onChange={handleChange}
                        inputMode="numeric"
                        aria-invalid={!!errors.yearsInBusiness}
                        aria-describedby="error-yearsInBusiness"
                      />
                      {errors.yearsInBusiness && <p id="error-yearsInBusiness" className="text-sm text-destructive mt-1">{errors.yearsInBusiness}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Loan Details */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Loan Requirements</h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="loanAmount">Loan Amount Required *</Label>
                      <Input
                        id="loanAmount"
                        name="loanAmount"
                        placeholder="e.g., ₹25,00,000"
                        value={formData.loanAmount}
                        onChange={handleChange}
                        inputMode="numeric"
                        aria-invalid={!!errors.loanAmount}
                        aria-describedby="error-loanAmount"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tenure">Preferred Tenure *</Label>
                      <Input
                        id="tenure"
                        name="tenure"
                        placeholder="e.g., 36 months"
                        value={formData.tenure}
                        onChange={handleChange}
                        inputMode="numeric"
                        aria-invalid={!!errors.tenure}
                        aria-describedby="error-tenure"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="loanPurpose">Purpose of Loan *</Label>
                      <Input
                        id="loanPurpose"
                        name="loanPurpose"
                        placeholder="e.g., Business expansion, Working capital"
                        value={formData.loanPurpose}
                        onChange={handleChange}
                        aria-invalid={!!errors.loanPurpose}
                        aria-describedby="error-loanPurpose"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Documents */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Document Details (Optional)</h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="panNumber">PAN Number</Label>
                      <Input
                        id="panNumber"
                        name="panNumber"
                        placeholder="ABCDE1234F"
                        value={formData.panNumber}
                        onChange={handleChange}
                        aria-invalid={!!errors.panNumber}
                        aria-describedby="error-panNumber"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gstNumber">GST Number</Label>
                      <Input
                        id="gstNumber"
                        name="gstNumber"
                        placeholder="22AAAAA0000A1Z5"
                        value={formData.gstNumber}
                        onChange={handleChange}
                        aria-invalid={!!errors.gstNumber}
                        aria-describedby="error-gstNumber"
                      />
                      {errors.gstNumber && <p id="error-gstNumber" className="text-sm text-destructive mt-1">{errors.gstNumber} (optional)</p>}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    These details help us process your application faster. You can also provide them later.
                  </p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-10 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentStep === 1 || submitting}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button variant="accent" onClick={handleNext} disabled={submitting}>
                  {submitting ? 'Submitting…' : currentStep === 4 ? 'Submit Application' : 'Next Step'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
