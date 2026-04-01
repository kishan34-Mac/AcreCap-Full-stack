import type { Express } from "express";
import crypto from "crypto";
import { z } from "zod";
import { storage } from "./storage";
import { signAuthToken } from "./auth";
import { requireAdmin, requireAuth } from "./auth";

const profileUpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  phone: z.string().min(8).max(20).optional(),
});

const roleUpdateSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["user", "admin"]),
});

const authSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().email().max(160),
  password: z.string().min(6).max(200),
});

const authAudienceSchema = z.enum(["user", "admin"]).default("user");
const forgotPasswordSchema = z.object({
  email: z.string().trim().email().max(160),
  audience: authAudienceSchema.optional(),
});
const resetPasswordSchema = z.object({
  token: z.string().min(20).max(500),
  password: z.string().min(6).max(200),
});

const submissionBaseSchema = z.object({
  applicationType: z.enum(["loan", "insurance"]),
  name: z.string().min(1).max(120),
  mobile: z.string().min(8).max(20),
  email: z.string().email().max(160),
  city: z.string().min(1).max(120),
  panNumber: z.string().nullable().optional(),
  gstNumber: z.string().nullable().optional(),
  status: z.enum(["pending", "approved", "rejected"]).default("pending"),
});

const loanSubmissionSchema = submissionBaseSchema.extend({
  applicationType: z.literal("loan"),
  businessName: z.string().min(1).max(160),
  businessType: z.string().min(1).max(160),
  annualTurnover: z.string().min(1).max(160),
  yearsInBusiness: z.string().min(1).max(60),
  loanAmount: z.string().min(1).max(120),
  loanPurpose: z.string().min(1).max(200),
  tenure: z.string().min(1).max(60),
});

const insuranceSubmissionSchema = submissionBaseSchema.extend({
  applicationType: z.literal("insurance"),
  insuranceCategory: z.string().min(1).max(120),
  insurancePlan: z.string().min(1).max(160),
  coverageAmount: z.string().min(1).max(120),
  policyTerm: z.string().min(1).max(80),
  insurancePurpose: z.string().min(1).max(200),
  existingPolicyProvider: z.string().max(160).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
  panNumber: z.string().nullable().optional(),
  gstNumber: z.string().nullable().optional(),
});

const submissionSchema = z.discriminatedUnion("applicationType", [
  loanSubmissionSchema,
  insuranceSubmissionSchema,
]);

const serializeSessionUser = (user: Awaited<ReturnType<typeof storage.getUser>>) =>
  user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      }
    : null;

const isDatabaseUnavailable = (error: unknown) => {
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes("mongoose") ||
    message.includes("mongo") ||
    message.includes("server selection") ||
    message.includes("buffering timed out") ||
    message.includes("topology")
  );
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const isReservedAdminEmail = (email: string) => {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return !!adminEmail && normalizeEmail(email) === adminEmail;
};

const getAppBaseUrl = () =>
  process.env.FRONTEND_URL?.trim() ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
  "http://localhost:5173";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const sendPasswordResetEmail = async ({
  email,
  name,
  link,
  audience,
}: {
  email: string;
  name: string;
  link: string;
  audience: "user" | "admin";
}) => {
  const webhook = process.env.PASSWORD_RESET_EMAIL_WEBHOOK_URL?.trim();
  if (!webhook) {
    console.log(`Password reset link for ${email}: ${link}`);
    return;
  }

  const safeName = escapeHtml(name || "there");
  const safeLink = escapeHtml(link);
  const subject =
    audience === "admin" ? "Reset your admin password" : "Reset your password";
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; background: #f5f7f8; padding: 24px; color: #12251b;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 24px;">
          <h1 style="margin-top: 0;">${subject}</h1>
          <p>Hello ${safeName},</p>
          <p>We received a request to reset your ${audience} password for AcreCap.</p>
          <p>
            <a href="${safeLink}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#f7a51a;color:#12251b;text-decoration:none;font-weight:700;">
              Reset Password
            </a>
          </p>
          <p>If you did not request this, you can safely ignore this email.</p>
          <p>This link will expire in 30 minutes.</p>
        </div>
      </body>
    </html>
  `;
  const text = `Hello ${name || "there"},\n\nUse this link to reset your password: ${link}\n\nThis link expires in 30 minutes.`;

  await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "password_reset_email",
      to: email,
      subject,
      html,
      text,
      meta: { audience },
    }),
  }).catch((error) => {
    console.error("Password reset email failed:", error);
  });
};

export async function registerRoutes(app: Express): Promise<void> {
  const persistSession = (req: any) =>
    new Promise<void>((resolve, reject) => {
      req.session.save((error: unknown) => {
        if (error) reject(error);
        else resolve();
      });
    });

  const persistSessionInBackground = (req: any) => {
    void persistSession(req).catch((error) => {
      console.error("Session save failed:", error);
    });
  };

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  app.get("/api/auth/session", async (req, res) => {
    if (!req.userId) {
      return res.json({ user: null });
    }

    try {
      const user = await storage.getUser(req.userId);
      return res.json({ user: serializeSessionUser(user) });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    const parsed = authSchema.extend({
      name: z.string().trim().min(2).max(120),
    }).safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation_error", details: parsed.error.flatten() });
    }

    try {
      const normalizedEmail = normalizeEmail(parsed.data.email);
      if (isReservedAdminEmail(normalizedEmail)) {
        return res.status(403).json({ error: "reserved_admin_email" });
      }

      const existing = await storage.getUserByEmail(normalizedEmail);
      if (existing) {
        return res.status(409).json({ error: "email_already_registered" });
      }

      const user = await storage.createUser({ ...parsed.data, email: normalizedEmail });
      req.session.user = { id: user.id, email: user.email, role: user.role };
      const token = signAuthToken(req.session.user);
      persistSessionInBackground(req);
      return res.status(201).json({ user: serializeSessionUser(user), token });
    } catch (error: any) {
      if (isDatabaseUnavailable(error)) {
        return res.status(503).json({ error: "database_unavailable" });
      }
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const parsed = authSchema
      .pick({ email: true, password: true })
      .extend({ audience: authAudienceSchema.optional() })
      .safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation_error", details: parsed.error.flatten() });
    }

    try {
      const normalizedEmail = normalizeEmail(parsed.data.email);
      const audience = parsed.data.audience ?? "user";

      if (audience === "user" && isReservedAdminEmail(normalizedEmail)) {
        return res.status(403).json({ error: "admin_login_required" });
      }

      const user = await storage.verifyUser(normalizedEmail, parsed.data.password);
      if (!user) {
        return res.status(401).json({ error: "invalid_credentials" });
      }

      if (audience === "user" && user.role === "admin") {
        return res.status(403).json({ error: "admin_login_required" });
      }

      if (audience === "admin" && user.role !== "admin") {
        return res.status(403).json({ error: "admin_access_required" });
      }

      req.session.user = { id: user.id, email: user.email, role: user.role };
      const token = signAuthToken(req.session.user);
      persistSessionInBackground(req);
      return res.json({ user: serializeSessionUser(user), token });
    } catch (error: any) {
      if (isDatabaseUnavailable(error)) {
        return res.status(503).json({ error: "database_unavailable" });
      }
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((error) => {
      if (error) {
        res.status(500).json({ error: "logout_failed" });
        return;
      }

      res.clearCookie("acrecap.sid");
      res.json({ ok: true });
    });
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation_error", details: parsed.error.flatten() });
    }

    const email = normalizeEmail(parsed.data.email);
    const audience = parsed.data.audience ?? "user";

    try {
      const user = await storage.getUserByEmail(email);
      const shouldIssueReset =
        !!user &&
        ((audience === "admin" && user.role === "admin") ||
          (audience === "user" && user.role !== "admin" && !isReservedAdminEmail(email)));

      if (shouldIssueReset) {
        const reset = await storage.createPasswordResetToken(email);
        if (reset) {
          const token = reset.token;
          const resetLink = `${getAppBaseUrl().replace(/\/+$/, "")}/reset-password?token=${encodeURIComponent(token)}&audience=${audience}&nonce=${crypto.randomUUID()}`;
          await sendPasswordResetEmail({
            email: reset.user.email,
            name: reset.user.name,
            link: resetLink,
            audience,
          });
        }
      }

      return res.json({ ok: true });
    } catch (error: any) {
      if (isDatabaseUnavailable(error)) {
        return res.status(503).json({ error: "database_unavailable" });
      }
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation_error", details: parsed.error.flatten() });
    }

    try {
      const user = await storage.resetPasswordWithToken(parsed.data.token, parsed.data.password);
      if (!user) {
        return res.status(400).json({ error: "invalid_or_expired_token" });
      }

      return res.json({ ok: true });
    } catch (error: any) {
      if (isDatabaseUnavailable(error)) {
        return res.status(503).json({ error: "database_unavailable" });
      }
      return res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/users/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      return res.json({ profile: user });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/users/me", requireAuth, async (req, res) => {
    const parsed = profileUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation_error", details: parsed.error.flatten() });
    }

    try {
      const profile = await storage.updateUser(req.userId!, parsed.data);
      return res.json({ profile });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/users", requireAdmin, async (_req, res) => {
    try {
      const users = await storage.getUsers();
      return res.json({ users });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/users/role", requireAdmin, async (req, res) => {
    const parsed = roleUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation_error", details: parsed.error.flatten() });
    }

    try {
      const profile = await storage.updateUser(parsed.data.userId, { role: parsed.data.role });
      if (req.userId === parsed.data.userId && profile) {
        req.session.user = { id: profile.id, email: profile.email, role: profile.role };
      }
      return res.json({ profile });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/activity", async (req, res) => {
    const parsed = z.object({
      action: z.string().min(1).max(120),
      data: z.record(z.any()).optional(),
    }).safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation_error", details: parsed.error.flatten() });
    }

    try {
      const log = await storage.createActivityLog({
        userId: req.userId || null,
        action: parsed.data.action,
        data: parsed.data.data || {},
      });
      return res.json({ log });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/submissions", requireAuth, async (req, res) => {
    const parsed = submissionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation_error", details: parsed.error.flatten() });
    }

    try {
      const submission = await storage.createSubmission({
        ...parsed.data,
        userId: req.userId || null,
      });
      return res.json({ submission });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/submissions", requireAuth, async (req, res) => {
    try {
      const submissions =
        req.userRole === "admin"
          ? await storage.getSubmissions()
          : await storage.getSubmissionsByUser(req.userId!);
      return res.json({ submissions });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/submissions/:id", requireAuth, async (req, res) => {
    try {
      const submission = await storage.getSubmission(req.params.id);
      if (!submission) {
        return res.status(404).json({ error: "not_found" });
      }

      if (req.userRole !== "admin" && submission.userId !== req.userId) {
        return res.status(403).json({ error: "forbidden" });
      }

      return res.json({ submission });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/submissions/:id", requireAdmin, async (req, res) => {
    try {
      const statusSchema = z.object({
        status: z.enum(["pending", "approved", "rejected"]),
      });
      const parsed = statusSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "validation_error", details: parsed.error.flatten() });
      }

      const submission = await storage.updateSubmissionStatus(req.params.id, parsed.data.status);
      if (!submission) {
        return res.status(404).json({ error: "not_found" });
      }
      return res.json({ submission });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });
}
