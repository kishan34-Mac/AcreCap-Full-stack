import { useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Building2,
  User,
  Banknote,
  FileText,
  Shield,
  ClipboardList,
} from "lucide-react";
import { z } from "zod";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendStatusEmail } from "@/lib/email";
import { logActivity } from "@/lib/sync";
import { apiFetch, type Submission } from "@/lib/api";

type ApplicationType = "loan" | "insurance";

const loanSteps = [
  { id: 1, title: "Basic Details", icon: User },
  { id: 2, title: "Business Info", icon: Building2 },
  { id: 3, title: "Loan Details", icon: Banknote },
  { id: 4, title: "Documents", icon: FileText },
];

const insuranceSteps = [
  { id: 1, title: "Basic Details", icon: User },
  { id: 2, title: "Insurance Info", icon: Shield },
  { id: 3, title: "Additional Info", icon: ClipboardList },
];

const insuranceCategoryOptions = [
  "Motor Insurance",
  "Health Insurance",
  "Travel Insurance",
  "Fire Insurance",
  "Marine Insurance",
  "Workmen Compensation",
  "Life Insurance",
];

const isValidPAN = (v: string | null | undefined) =>
  !!v && /^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(v);
const isValidGSTIN = (v: string | null | undefined) =>
  !!v && /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i.test(v);

const LoanStep1Schema = z.object({
  name: z.string().min(2, "Name is required"),
  mobile: z.string().regex(/^\+?\d{10,15}$/i, "Valid mobile number is required"),
  email: z.string().email("Valid email is required"),
  city: z.string().min(2, "City is required"),
});

const LoanStep2Schema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  businessType: z.string().min(2, "Business type is required"),
  annualTurnover: z.string().min(1, "Annual turnover is required"),
  yearsInBusiness: z.string().min(1, "Years in business is required"),
});

const LoanStep3Schema = z.object({
  loanAmount: z.string().min(1, "Loan amount is required"),
  tenure: z.string().min(1, "Tenure is required"),
  loanPurpose: z.string().min(2, "Loan purpose is required"),
});

const LoanStep4Schema = z.object({
  panNumber: z.string().optional().refine((v) => !v || isValidPAN(v), {
    message: "Invalid PAN format",
  }),
  gstNumber: z.string().optional().refine((v) => !v || isValidGSTIN(v), {
    message: "Invalid GST format",
  }),
});

const InsuranceStep2Schema = z.object({
  insuranceCategory: z.string().min(2, "Insurance type is required"),
  insurancePlan: z.string().min(2, "Plan type is required"),
  coverageAmount: z.string().min(1, "Coverage amount is required"),
  policyTerm: z.string().min(1, "Policy term is required"),
});

const InsuranceStep3Schema = z.object({
  insurancePurpose: z.string().min(2, "Coverage purpose is required"),
  existingPolicyProvider: z.string().optional(),
  notes: z.string().optional(),
});

const emptyForm = {
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
  insuranceCategory: "",
  insurancePlan: "",
  coverageAmount: "",
  policyTerm: "",
  insurancePurpose: "",
  existingPolicyProvider: "",
  notes: "",
};

export default function Apply() {
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const initialType =
    location.pathname === "/apply/insurance" || params.get("type") === "insurance"
      ? "insurance"
      : "loan";
  const [applicationType, setApplicationType] = useState<ApplicationType>(initialType);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const steps = useMemo(
    () => (applicationType === "insurance" ? insuranceSteps : loanSteps),
    [applicationType]
  );

  const totalSteps = steps.length;

  const validateField = (name: string, value: string) => {
    try {
      const obj = { [name]: value };
      let schema: z.ZodSchema | null = null;

      if (["name", "mobile", "email", "city"].includes(name)) {
        schema = LoanStep1Schema.pick({ [name]: true } as never);
      } else if (applicationType === "loan" && ["businessName", "businessType", "annualTurnover", "yearsInBusiness"].includes(name)) {
        schema = LoanStep2Schema.pick({ [name]: true } as never);
      } else if (applicationType === "loan" && ["loanAmount", "tenure", "loanPurpose"].includes(name)) {
        schema = LoanStep3Schema.pick({ [name]: true } as never);
      } else if (applicationType === "loan" && ["panNumber", "gstNumber"].includes(name)) {
        schema = LoanStep4Schema.pick({ [name]: true } as never);
      } else if (applicationType === "insurance" && ["insuranceCategory", "insurancePlan", "coverageAmount", "policyTerm"].includes(name)) {
        schema = InsuranceStep2Schema.pick({ [name]: true } as never);
      } else if (applicationType === "insurance" && ["insurancePurpose", "existingPolicyProvider", "notes"].includes(name)) {
        schema = InsuranceStep3Schema.pick({ [name]: true } as never);
      }

      if (!schema) return;
      schema.parse(obj);
      setErrors((prev) => ({ ...prev, [name]: "" }));
    } catch (error) {
      const zodError = error as z.ZodError;
      setErrors((prev) => ({
        ...prev,
        [name]: zodError.issues[0]?.message || "Invalid value",
      }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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
      if (step === 1) {
        LoanStep1Schema.parse(formData);
      } else if (applicationType === "loan" && step === 2) {
        LoanStep2Schema.parse(formData);
      } else if (applicationType === "loan" && step === 3) {
        LoanStep3Schema.parse(formData);
      } else if (applicationType === "loan" && step === 4) {
        LoanStep4Schema.parse(formData);
      } else if (applicationType === "insurance" && step === 2) {
        InsuranceStep2Schema.parse(formData);
      } else if (applicationType === "insurance" && step === 3) {
        InsuranceStep3Schema.parse(formData);
      }

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

  const switchType = (type: ApplicationType) => {
    if (type === applicationType) return;
    setApplicationType(type);
    setCurrentStep(1);
    setErrors({});
    setFormData(emptyForm);
    if (type === "insurance") {
      navigate("/apply/insurance", { replace: true });
      setParams({ type: "insurance" });
    } else {
      navigate("/apply", { replace: true });
      setParams({});
    }
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    try {
      setSubmitting(true);
      const payload =
        applicationType === "loan"
          ? {
              applicationType,
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
            }
          : {
              applicationType,
              name: formData.name,
              mobile: formData.mobile,
              email: formData.email,
              city: formData.city,
              insuranceCategory: formData.insuranceCategory,
              insurancePlan: formData.insurancePlan,
              coverageAmount: formData.coverageAmount,
              policyTerm: formData.policyTerm,
              insurancePurpose: formData.insurancePurpose,
              existingPolicyProvider: formData.existingPolicyProvider || null,
              notes: formData.notes || null,
              status: "pending" as const,
            };

      const { submission } = await apiFetch<{ submission: Submission }>("submissions", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      sendStatusEmail(
        {
          id: submission.id,
          applicationType: submission.applicationType,
          name: submission.name,
          email: submission.email,
          mobile: submission.mobile,
          city: submission.city,
          businessName: submission.businessName,
          businessType: submission.businessType,
          loanAmount: submission.loanAmount,
          loanPurpose: submission.loanPurpose,
          tenure: submission.tenure,
          insuranceCategory: submission.insuranceCategory,
          insurancePlan: submission.insurancePlan,
          coverageAmount: submission.coverageAmount,
          policyTerm: submission.policyTerm,
          insurancePurpose: submission.insurancePurpose,
          created_at: submission.createdAt,
          status: "pending",
        },
        "pending"
      );

      await logActivity("apply_submit", { id: submission.id, type: submission.applicationType });
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
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 text-center sm:mb-12">
              <h1 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                Apply for {applicationType === "insurance" ? "Insurance" : "a Loan"}
              </h1>
              <p className="text-sm text-muted-foreground sm:text-lg">
                Choose the product type and fill in your details. It only takes a few minutes.
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8">
              <Button
                variant={applicationType === "loan" ? "accent" : "outline"}
                className="w-full"
                onClick={() => switchType("loan")}
              >
                Loan Form
              </Button>
              <Button
                variant={applicationType === "insurance" ? "accent" : "outline"}
                className="w-full"
                onClick={() => switchType("insurance")}
              >
                Insurance Form
              </Button>
            </div>

            <div className="mb-8 overflow-x-auto pb-2 sm:mb-12">
              <div
                className="flex items-center justify-between"
                style={{ minWidth: applicationType === "insurance" ? 480 : 640 }}
              >
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all sm:h-12 sm:w-12 ${
                          currentStep >= step.id
                            ? "bg-primary text-primary-foreground shadow-glow"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {currentStep > step.id ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <step.icon className="h-5 w-5" />
                        )}
                      </div>
                      <span
                        className={`mt-2 text-[11px] sm:text-xs ${
                          currentStep >= step.id
                            ? "font-medium text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`mx-2 h-1 w-12 rounded-full transition-all sm:w-24 ${
                          currentStep > step.id ? "bg-primary" : "bg-secondary"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5 sm:p-10">
              {currentStep === 1 && (
                <div className="animate-fade-in space-y-6">
                  <h2 className="mb-6 text-xl font-semibold text-foreground">
                    Personal Information
                  </h2>
                  <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
                    {[
                      ["name", "Full Name *", "Enter your full name"],
                      ["mobile", "Mobile Number *", "+91 98765 43210"],
                      ["email", "Email *", "Enter your email"],
                      ["city", "City *", "Enter your city"],
                    ].map(([name, label, placeholder]) => (
                      <div className="space-y-2" key={name}>
                        <Label htmlFor={name}>{label}</Label>
                        <Input
                          id={name}
                          name={name}
                          placeholder={placeholder}
                          value={(formData as any)[name]}
                          onChange={handleChange}
                        />
                        {errors[name] && (
                          <p className="text-sm text-destructive">{errors[name]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {applicationType === "loan" && currentStep === 2 && (
                <div className="animate-fade-in space-y-6">
                  <h2 className="mb-6 text-xl font-semibold text-foreground">
                    Business Information
                  </h2>
                  <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
                    {[
                      ["businessName", "Business Name *", "Enter business name"],
                      ["businessType", "Business Type *", "Retail, Trading, Manufacturing"],
                      ["annualTurnover", "Annual Turnover *", "Enter annual turnover"],
                      ["yearsInBusiness", "Years In Business *", "Number of years"],
                    ].map(([name, label, placeholder]) => (
                      <div className="space-y-2" key={name}>
                        <Label htmlFor={name}>{label}</Label>
                        <Input
                          id={name}
                          name={name}
                          placeholder={placeholder}
                          value={(formData as any)[name]}
                          onChange={handleChange}
                        />
                        {errors[name] && (
                          <p className="text-sm text-destructive">{errors[name]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {applicationType === "loan" && currentStep === 3 && (
                <div className="animate-fade-in space-y-6">
                  <h2 className="mb-6 text-xl font-semibold text-foreground">
                    Loan Details
                  </h2>
                  <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
                    {[
                      ["loanAmount", "Loan Amount Required *", "Enter required amount"],
                      ["tenure", "Preferred Tenure *", "e.g. 24 months"],
                      ["loanPurpose", "Loan Purpose *", "Working capital, machinery, expansion"],
                    ].map(([name, label, placeholder]) => (
                      <div className="space-y-2" key={name}>
                        <Label htmlFor={name}>{label}</Label>
                        <Input
                          id={name}
                          name={name}
                          placeholder={placeholder}
                          value={(formData as any)[name]}
                          onChange={handleChange}
                        />
                        {errors[name] && (
                          <p className="text-sm text-destructive">{errors[name]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {applicationType === "loan" && currentStep === 4 && (
                <div className="animate-fade-in space-y-6">
                  <h2 className="mb-6 text-xl font-semibold text-foreground">Documents</h2>
                  <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
                    {[
                      ["panNumber", "PAN Number", "ABCDE1234F"],
                      ["gstNumber", "GST Number", "22ABCDE1234F1Z5"],
                    ].map(([name, label, placeholder]) => (
                      <div className="space-y-2" key={name}>
                        <Label htmlFor={name}>{label}</Label>
                        <Input
                          id={name}
                          name={name}
                          placeholder={placeholder}
                          value={(formData as any)[name]}
                          onChange={handleChange}
                        />
                        {errors[name] && (
                          <p className="text-sm text-destructive">{errors[name]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {applicationType === "insurance" && currentStep === 2 && (
                <div className="animate-fade-in space-y-6">
                  <h2 className="mb-6 text-xl font-semibold text-foreground">
                    Insurance Details
                  </h2>
                  <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="insuranceCategory">Insurance Type *</Label>
                      <select
                        id="insuranceCategory"
                        name="insuranceCategory"
                        className="w-full rounded-md border border-border bg-background p-2.5 text-sm"
                        value={formData.insuranceCategory}
                        onChange={handleChange}
                      >
                        <option value="">Select insurance type</option>
                        {insuranceCategoryOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      {errors.insuranceCategory && (
                        <p className="text-sm text-destructive">{errors.insuranceCategory}</p>
                      )}
                    </div>
                    {[
                      ["insurancePlan", "Plan Type *", "Individual, Family, Comprehensive"],
                      ["coverageAmount", "Coverage Amount *", "Enter desired coverage"],
                      ["policyTerm", "Policy Term *", "1 year, 5 years, annual renewal"],
                    ].map(([name, label, placeholder]) => (
                      <div className="space-y-2" key={name}>
                        <Label htmlFor={name}>{label}</Label>
                        <Input
                          id={name}
                          name={name}
                          placeholder={placeholder}
                          value={(formData as any)[name]}
                          onChange={handleChange}
                        />
                        {errors[name] && (
                          <p className="text-sm text-destructive">{errors[name]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {applicationType === "insurance" && currentStep === 3 && (
                <div className="animate-fade-in space-y-6">
                  <h2 className="mb-6 text-xl font-semibold text-foreground">
                    Additional Information
                  </h2>
                  <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="insurancePurpose">Coverage Purpose *</Label>
                      <Input
                        id="insurancePurpose"
                        name="insurancePurpose"
                        placeholder="Family protection, health cover, vehicle renewal, business asset cover"
                        value={formData.insurancePurpose}
                        onChange={handleChange}
                      />
                      {errors.insurancePurpose && (
                        <p className="text-sm text-destructive">{errors.insurancePurpose}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="existingPolicyProvider">Existing Policy Provider</Label>
                      <Input
                        id="existingPolicyProvider"
                        name="existingPolicyProvider"
                        placeholder="Current insurer, if any"
                        value={formData.existingPolicyProvider}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <textarea
                        id="notes"
                        name="notes"
                        className="min-h-28 w-full rounded-md border border-border bg-background p-3 text-sm"
                        placeholder="Add claim history, renewal notes, dependent details, or anything important"
                        value={formData.notes}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:justify-between sm:gap-4">
                <Button
                  className="w-full sm:w-auto"
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentStep === 1 || submitting}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  variant="accent"
                  onClick={() => void handleNext()}
                  disabled={submitting}
                >
                  {currentStep === totalSteps
                    ? submitting
                      ? "Submitting..."
                      : "Submit Application"
                    : "Next"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
