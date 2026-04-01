// Email notification utility for loan application status updates
// Generates mobile-responsive HTML and plain text, and posts to a webhook for delivery.

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface SubmissionInfo {
  id: string;
  applicationType: 'loan' | 'insurance';
  name: string;
  email: string;
  mobile: string;
  city: string;
  businessName?: string | null;
  businessType?: string | null;
  loanAmount?: string | null;
  loanPurpose?: string | null;
  tenure?: string | null;
  insuranceCategory?: string | null;
  insurancePlan?: string | null;
  coverageAmount?: string | null;
  policyTerm?: string | null;
  insurancePurpose?: string | null;
  created_at?: string;
  status?: SubmissionStatus;
}

export function buildStatusEmail(sub: SubmissionInfo, status: SubmissionStatus) {
  const company = 'AcreCap';
  const greetingName = sub.name?.trim() || 'Valued Customer';
  const isInsurance = sub.applicationType === 'insurance';
  const applicationLabel = isInsurance ? 'insurance application' : 'loan application';
  const amountLabel = isInsurance ? 'Coverage Amount' : 'Loan Amount';
  const purposeLabel = isInsurance ? 'Coverage Purpose' : 'Purpose';
  const termLabel = isInsurance ? 'Policy Term' : 'Tenure';
  const amountValue = isInsurance ? sub.coverageAmount : sub.loanAmount;
  const purposeValue = isInsurance ? sub.insurancePurpose : sub.loanPurpose;
  const termValue = isInsurance ? sub.policyTerm : sub.tenure;
  const productLabel = isInsurance ? sub.insuranceCategory || 'Insurance' : sub.businessName || 'Loan';

  const isApproved = status === 'approved';
  const subject = isApproved
    ? `Good news! Your ${applicationLabel} has been approved`
    : status === 'rejected'
    ? `Update on your ${applicationLabel}`
    : `We received your ${applicationLabel}`;

  const nextSteps = isApproved
    ? `<ul style="margin:0; padding-left:18px">
         <li>Our team will contact you within 24 hours to verify details</li>
         <li>Keep your submitted information and supporting documents ready for verification</li>
         <li>We’ll share the next approval and issuance steps shortly</li>
       </ul>`
    : `<p style="margin:0">While we’re unable to proceed right now, here are some options you can consider:</p>
       <ul style="margin:0; padding-left:18px">
         <li>Review and update the submitted details</li>
         <li>Share additional supporting documents if requested</li>
         <li>Discuss alternative products or revised requirements with our team</li>
       </ul>
       <p style="margin:0">Reply to this email and our team will help you with the best available alternatives.</p>`;

  const details = `
    <table role="presentation" width="100%" style="border-collapse:collapse; margin-top:16px">
      <tr>
        <td style="padding:8px 12px; background:#f9fafb; border:1px solid #e5e7eb">Application ID</td>
        <td style="padding:8px 12px; border:1px solid #e5e7eb">${sub.id}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px; background:#f9fafb; border:1px solid #e5e7eb">Name</td>
        <td style="padding:8px 12px; border:1px solid #e5e7eb">${sub.name}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px; background:#f9fafb; border:1px solid #e5e7eb">Application Type</td>
        <td style="padding:8px 12px; border:1px solid #e5e7eb">${isInsurance ? 'Insurance' : 'Loan'}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px; background:#f9fafb; border:1px solid #e5e7eb">${isInsurance ? 'Policy / Product' : 'Business / Product'}</td>
        <td style="padding:8px 12px; border:1px solid #e5e7eb">${productLabel}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px; background:#f9fafb; border:1px solid #e5e7eb">${amountLabel}</td>
        <td style="padding:8px 12px; border:1px solid #e5e7eb">${amountValue || '-'}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px; background:#f9fafb; border:1px solid #e5e7eb">${purposeLabel}</td>
        <td style="padding:8px 12px; border:1px solid #e5e7eb">${purposeValue || '-'}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px; background:#f9fafb; border:1px solid #e5e7eb">${termLabel}</td>
        <td style="padding:8px 12px; border:1px solid #e5e7eb">${termValue || '-'}</td>
      </tr>
    </table>
  `;

  const intro = isApproved
    ? `<p style="margin:0">Congratulations ${greetingName}! We’re excited to share that your ${applicationLabel} has been <strong>approved</strong>.</p>`
    : status === 'rejected'
    ? `<p style="margin:0">Hello ${greetingName}, thank you for applying with ${company}. After careful review, we’re unable to approve your ${applicationLabel} at this time.</p>`
    : `<p style="margin:0">Hello ${greetingName}, thank you for applying with ${company}. Your ${applicationLabel} is currently under review. We’ll reach out shortly.</p>`;

  const html = `
<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>${subject}</title>
  <style>
    /* Mobile responsiveness */
    @media only screen and (max-width: 600px) {
      .container { padding: 16px !important; }
      .card { padding: 16px !important; }
      h1 { font-size: 20px !important; }
      p { font-size: 15px !important; }
    }
    .btn { display:inline-block; padding:12px 16px; border-radius:8px; text-decoration:none; }
    .btn-primary { background:#10b981; color:#ffffff; }
    .btn-outline { border:1px solid #10b981; color:#10b981; }
  </style>
</head>
<body style="margin:0; background:#f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji'; color:#111827;">
  <div style="max-width:640px; margin:0 auto; padding:24px" class="container">
    <div style="background:#ffffff; border-radius:12px; padding:24px; box-shadow:0 1px 3px rgba(0,0,0,0.08)" class="card">
      <h1 style="margin:0 0 8px">${subject}</h1>
      ${intro}
      <div style="height:12px"></div>
      ${details}
      <div style="height:16px"></div>
      ${nextSteps}
      <div style="height:16px"></div>
      <p style="margin:0">If you have any questions, simply reply to this email. We’re here to help.</p>
      <div style="height:16px"></div>
      <div>
        ${isApproved
          ? `<a class="btn btn-primary" href="https://wa.me/918460847083?text=Hello%20I%20have%20received%20my%20application%20approval%20email%20and%20would%20like%20to%20know%20the%20next%20steps" target="_blank" rel="noopener">Chat with us</a>`
          : `<a class="btn btn-outline" href="https://wa.me/918460847083?text=Hello%20I%20received%20an%20update%20on%20my%20application%20and%20would%20like%20to%20discuss%20alternative%20options" target="_blank" rel="noopener">Discuss options</a>`}
      </div>
      <div style="height:24px"></div>
      <p style="margin:0; color:#6b7280">Regards,<br/>${company} Team</p>
    </div>
    <p style="margin:16px 0 0; text-align:center; color:#6b7280; font-size:12px">This is an automated notification for your application ${sub.id}. If you didn’t initiate this request, please ignore.</p>
  </div>
</body>
</html>
`;

  const text = `${subject}\n\n` +
    (isApproved
      ? `Congratulations ${greetingName}! Your ${applicationLabel} has been approved. Next steps: verification call, keep your documents ready, and we’ll share the next issuance steps.\n\n`
      : status === 'rejected'
      ? `Hello ${greetingName}, we’re unable to approve your ${applicationLabel} at this time. Reply and we’ll help you review the next options.\n\n`
      : `Hello ${greetingName}, your ${applicationLabel} is under review. We’ll contact you shortly.\n\n`) +
    `Application ID: ${sub.id}\nApplication Type: ${isInsurance ? 'Insurance' : 'Loan'}\nProduct: ${productLabel}\n${amountLabel}: ${amountValue || '-'}\n${purposeLabel}: ${purposeValue || '-'}\n${termLabel}: ${termValue || '-'}\n\nRegards, ${company} Team`;

  return { subject, html, text };
}

export async function sendStatusEmail(sub: SubmissionInfo, status: SubmissionStatus) {
  const webhook = import.meta.env.VITE_STATUS_EMAIL_WEBHOOK_URL as string | undefined;
  if (!webhook) {
    // No webhook configured; skip silently
    return { skipped: true } as const;
  }
  const payload = buildStatusEmail(sub, status);
  const body = {
    type: 'status_email',
    to: sub.email,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
    meta: { submissionId: sub.id, status },
  };
  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return { ok: res.ok } as const;
  } catch (e) {
    // Swallow network errors to avoid blocking admin actions
    return { ok: false, error: (e as Error).message } as const;
  }
}
