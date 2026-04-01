import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Check, Phone } from "lucide-react";
import {
  apiFetch,
  getSubmissionPrimaryLabel,
  getSubmissionPrimaryValue,
  getSubmissionTitle,
  getSubmissionTypeLabel,
  type Submission,
} from "@/lib/api";

export default function ThankYou() {
  const [params] = useSearchParams();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const submissionId = params.get("id");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!submissionId) return;
      try {
        const { submission } = await apiFetch<{ submission: Submission }>(`submissions/${submissionId}`, { method: "GET" });
        if (mounted) setSubmission(submission);
      } catch {
        if (mounted) setSubmission(null);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [submissionId]);

  return (
    <Layout>
      <section className="section-padding min-h-[80vh] flex items-center">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-8 animate-scale-in">
              <Check className="w-12 h-12 text-success" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 animate-fade-up">Application Submitted!</h1>
            <p className="text-lg text-muted-foreground mb-8 animate-fade-up-delayed">
              Thank you for your application. Our team will review your details and contact you within 24 hours.
            </p>

            {submission && (
              <div className="glass-card p-6 text-left mb-8 animate-fade-up-delayed">
                <h2 className="text-xl font-semibold mb-4">Submission Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Application Type:</span> {getSubmissionTypeLabel(submission)}</div>
                  <div><span className="text-muted-foreground">Name:</span> {submission.name}</div>
                  <div><span className="text-muted-foreground">Mobile:</span> {submission.mobile}</div>
                  <div><span className="text-muted-foreground">Email:</span> {submission.email}</div>
                  <div><span className="text-muted-foreground">City:</span> {submission.city}</div>
                  <div><span className="text-muted-foreground">Product:</span> {getSubmissionTitle(submission)}</div>
                  <div><span className="text-muted-foreground">{getSubmissionPrimaryLabel(submission)}:</span> {getSubmissionPrimaryValue(submission)}</div>
                  {submission.applicationType === "loan" ? (
                    <>
                      <div><span className="text-muted-foreground">Business Type:</span> {submission.businessType || "-"}</div>
                      <div><span className="text-muted-foreground">Turnover:</span> {submission.annualTurnover || "-"}</div>
                      <div><span className="text-muted-foreground">Years:</span> {submission.yearsInBusiness || "-"}</div>
                      <div><span className="text-muted-foreground">Purpose:</span> {submission.loanPurpose || "-"}</div>
                      <div><span className="text-muted-foreground">Tenure:</span> {submission.tenure || "-"}</div>
                      {submission.panNumber && <div><span className="text-muted-foreground">PAN:</span> {submission.panNumber}</div>}
                      {submission.gstNumber && <div><span className="text-muted-foreground">GST:</span> {submission.gstNumber}</div>}
                    </>
                  ) : (
                    <>
                      <div><span className="text-muted-foreground">Plan:</span> {submission.insurancePlan || "-"}</div>
                      <div><span className="text-muted-foreground">Policy Term:</span> {submission.policyTerm || "-"}</div>
                      <div><span className="text-muted-foreground">Coverage Purpose:</span> {submission.insurancePurpose || "-"}</div>
                      {submission.existingPolicyProvider && (
                        <div><span className="text-muted-foreground">Existing Provider:</span> {submission.existingPolicyProvider}</div>
                      )}
                      {submission.notes && (
                        <div className="sm:col-span-2"><span className="text-muted-foreground">Notes:</span> {submission.notes}</div>
                      )}
                    </>
                  )}
                  <div><span className="text-muted-foreground">Status:</span> {submission.status}</div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up-delayed">
              <Button variant="outline" size="lg" asChild>
                <a href="https://wa.me/918460847083?text=Hello%21%20I%20would%20like%20detailed%20information%20about%20the%20loan.%20Please%20share%20eligibility%20criteria%2C%20interest%20rates%2C%20required%20documents%2C%20tenure%20options%2C%20and%20processing%20time.%20Thank%20you." target="_blank" rel="noopener noreferrer">
                  <Phone className="w-5 h-5 mr-2" />
                  Chat on WhatsApp
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
