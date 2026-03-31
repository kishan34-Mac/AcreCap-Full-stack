import type { Express } from "express";
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

const submissionSchema = z.object({
  name: z.string().min(1).max(120),
  mobile: z.string().min(8).max(20),
  email: z.string().email().max(160),
  city: z.string().min(1).max(120),
  businessName: z.string().min(1).max(160),
  businessType: z.string().min(1).max(160),
  annualTurnover: z.string().min(1).max(160),
  yearsInBusiness: z.string().min(1).max(60),
  loanAmount: z.string().min(1).max(120),
  loanPurpose: z.string().min(1).max(200),
  tenure: z.string().min(1).max(60),
  panNumber: z.string().nullable().optional(),
  gstNumber: z.string().nullable().optional(),
  status: z.enum(["pending", "approved", "rejected"]).default("pending"),
});

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

export async function registerRoutes(app: Express): Promise<void> {
  const persistSession = (req: any) =>
    new Promise<void>((resolve, reject) => {
      req.session.save((error: unknown) => {
        if (error) reject(error);
        else resolve();
      });
    });

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
      const existing = await storage.getUserByEmail(parsed.data.email);
      if (existing) {
        return res.status(409).json({ error: "email_already_registered" });
      }

      const user = await storage.createUser(parsed.data);
      req.session.user = { id: user.id, email: user.email, role: user.role };
      await persistSession(req);
      const token = signAuthToken(req.session.user);
      return res.status(201).json({ user: serializeSessionUser(user), token });
    } catch (error: any) {
      if (isDatabaseUnavailable(error)) {
        return res.status(503).json({ error: "database_unavailable" });
      }
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const parsed = authSchema.pick({ email: true, password: true }).safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation_error", details: parsed.error.flatten() });
    }

    try {
      const user = await storage.verifyUser(parsed.data.email, parsed.data.password);
      if (!user) {
        return res.status(401).json({ error: "invalid_credentials" });
      }

      req.session.user = { id: user.id, email: user.email, role: user.role };
      await persistSession(req);
      const token = signAuthToken(req.session.user);
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
