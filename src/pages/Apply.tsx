import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Check, Building2, User, Banknote, FileText } from "lucide-react";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendStatusEmail } from "@/lib/email";
import { logActivity } from "@/lib/sync";
import { apiFetch, type Submission } from "@/lib/api";

const steps = [
  { id: 1, title: "Basic Details", icon: User },
  { id: 2, title: "Business Info", icon: Building2 },
  { id: 3, title: "Loan Details", icon: Banknote },
  { id: 4, title: "Documents", icon: FileText },
];

const isValidPAN = (v: string | null | undefined) =>
  !!v && /^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(v);
const isValidGSTIN = (v: string | null | undefined) =>
  !!v && /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i.test(v);

export default function Apply() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    city: "",
    businessName: "",
    businessType: "",
    annualTurnover: "",
    yearsInBusiness: "",
    loanAmount: "",
    loanPurpose: "",
    tenure: "",
    panNumber: "",
    gstNumber: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const Step1Schema = z.object({
    name: z.string().min(2, "Name is required"),
    mobile: z.string().regex(/^\+?\d{10,15}$/i, "Valid mobile number is required"),
    email: z.string().email("Valid email is required"),
    city: z.string().min(2, "City is required"),
  });
  const Step2Schema = z.object({
    businessName: z.string().min(2, "Business name is required"),
    businessType: z.string().min(2, "Business type is required"),
    annualTurnover: z.string().min(1, "Annual turnover is required"),
    yearsInBusiness: z.string().min(1, "Years in business is required"),
  });
  const Step3Schema = z.object({
    loanAmount: z.string().min(1, "Loan amount is required"),
    tenure: z.string().min(1, "Tenure is required"),
    loanPurpose: z.string().min(2, "Loan purpose is required"),
  });
  const Step4Schema = z.object({
    panNumber: z.string().optional().refine((v) => !v || isValidPAN(v), {
      message: "Invalid PAN format",
    }),
    gstNumber: z.string().optional().refine((v) => !v || isValidGSTIN(v), {
      message: "Invalid GST format",
    }),
  });

  const validateField = (name: string, value: string) => {
    try {
      const obj = { [name]: value };
      let schema: z.ZodSchema | null = null;
      if (["name", "mobile", "email", "city"].includes(name)) schema = Step1Schema.pick({ [name]: true } as never);
      if (["businessName", "businessType", "annualTurnover", "yearsInBusiness"].includes(name)) schema = Step2Schema.pick({ [name]: true } as never);
      if (["loanAmount", "tenure", "loanPurpose"].includes(name)) schema = Step3Schema.pick({ [name]: true } as never);
      if (["panNumber", "gstNumber"].includes(name)) schema = Step4Schema.pick({ [name]: true } as never);
      if (!schema) return;
      schema.parse(obj);
      setErrors((prev) => ({ ...prev, [name]: "" }));
    } catch (error) {
      const zodError = error as z.ZodError;
      setErrors((prev) => ({ ...prev, [name]: zodError.issues[0]?.message || "Invalid value" }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const normalizedValue =
      name === "panNumber" || name === "gstNumber"
        ? value.toUpperCase().replace(/\s+/g, "")
        : value;
    setFormData((prev) => ({ ...prev, [name]: normalizedValue }));
    validateField(name, normalizedValue);
  };

  const validateStep = (step: number) => {
    try {
      if (step === 1) Step1Schema.parse(formData);
      if (step === 2) Step2Schema.parse(formData);
      if (step === 3) Step3Schema.parse(formData);
      if (step === 4) Step4Schema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      const zodError = error as z.ZodError;
      const nextErrors: Record<string, string> = {};
      zodError.issues.forEach((issue) => {
        const key = String(issue.path[0] || "");
        if (key) nextErrors[key] = issue.message;
      });
      setErrors((prev) => ({ ...prev, ...nextErrors }));
      toast({
        title: "Please fix the highlighted fields",
        description: "Some required information is missing or invalid.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;

    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
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
        panNumber: isValidPAN(formData.panNumber) ? formData.panNumber : null,
        gstNumber: isValidGSTIN(formData.gstNumber) ? formData.gstNumber : null,
        status: "pending" as const,
      };

      const { submission } = await apiFetch<{ submission: Submission }>("submissions", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      sendStatusEmail(
        {
          id: submission.id,
          name: submission.name,
          email: submission.email,
          mobile: submission.mobile,
          city: submission.city,
          businessName: submission.businessName,
          businessType: submission.businessType,
          loanAmount: submission.loanAmount,
          loanPurpose: submission.loanPurpose,
          tenure: submission.tenure,
          created_at: submission.createdAt,
          status: "pending",
        },
        "pending"
      );

      await logActivity("apply_submit", { id: submission.id });
      navigate(`/thank-you?id=${submission.id}`);
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error?.message || "Unable to submit your application right now.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  return (
    <Layout>
      <section className="section-padding">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Apply for a Loan</h1>
              <p className="text-lg text-muted-foreground">
                Fill in your details below. It only takes a few minutes.
              </p>
            </div>

            <div className="flex items-center justify-between mb-12">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${currentStep >= step.id ? "bg-primary text-primary-foreground shadow-glow" : "bg-secondary text-muted-foreground"}`}>
                      {currentStep > step.id ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                    </div>
                    <span className={`text-xs mt-2 hidden sm:block ${currentStep >= step.id ? "text-primary font-medium" : "text-muted-foreground"}`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 sm:w-24 h-1 mx-2 rounded-full transition-all ${currentStep > step.id ? "bg-primary" : "bg-secondary"}`} />
                  )}
                </div>
              ))}
            </div>

            <div className="glass-card p-6 sm:p-10">
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Personal Information</h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {[
                      ["name", "Full Name *", "Enter your full name"],
                      ["mobile", "Mobile Number *", "+91 98765 43210"],
                      ["email", "Email *", "Enter your email"],
                      ["city", "City *", "Enter your city"],
                    ].map(([name, label, placeholder]) => (
                      <div className="space-y-2" key={name}>
                        <Label htmlFor={name}>{label}</Label>
                        <Input id={name} name={name} placeholder={placeholder} value={(formData as any)[name]} onChange={handleChange} />
                        {errors[name] && <p className="text-sm text-destructive">{errors[name]}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Business Information</h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {[
                      ["businessName", "Business Name *", "Enter business name"],
                      ["businessType", "Business Type *", "Retail, Trading, Manufacturing"],
                      ["annualTurnover", "Annual Turnover *", "Enter annual turnover"],
                      ["yearsInBusiness", "Years In Business *", "Number of years"],
                    ].map(([name, label, placeholder]) => (
                      <div className="space-y-2" key={name}>
                        <Label htmlFor={name}>{label}</Label>
                        <Input id={name} name={name} placeholder={placeholder} value={(formData as any)[name]} onChange={handleChange} />
                        {errors[name] && <p className="text-sm text-destructive">{errors[name]}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Loan Details</h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {[
                      ["loanAmount", "Loan Amount Required *", "Enter required amount"],
                      ["tenure", "Preferred Tenure *", "e.g. 24 months"],
                      ["loanPurpose", "Loan Purpose *", "Working capital, machinery, expansion"],
                    ].map(([name, label, placeholder]) => (
                      <div className="space-y-2" key={name}>
                        <Label htmlFor={name}>{label}</Label>
                        <Input id={name} name={name} placeholder={placeholder} value={(formData as any)[name]} onChange={handleChange} />
                        {errors[name] && <p className="text-sm text-destructive">{errors[name]}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Documents</h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {[
                      ["panNumber", "PAN Number", "ABCDE1234F"],
                      ["gstNumber", "GST Number", "22ABCDE1234F1Z5"],
                    ].map(([name, label, placeholder]) => (
                      <div className="space-y-2" key={name}>
                        <Label htmlFor={name}>{label}</Label>
                        <Input id={name} name={name} placeholder={placeholder} value={(formData as any)[name]} onChange={handleChange} />
                        {errors[name] && <p className="text-sm text-destructive">{errors[name]}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-10 gap-4">
                <Button variant="outline" onClick={handlePrev} disabled={currentStep === 1 || submitting}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button variant="accent" onClick={() => void handleNext()} disabled={submitting}>
                  {currentStep === 4 ? (submitting ? "Submitting..." : "Submit Application") : "Next"}
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
