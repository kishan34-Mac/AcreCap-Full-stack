import type { Express } from "express";
import { z } from "zod";
import { storage } from "./storage";

const profileUpdateSchema = z.object({
  fullName: z.string().min(1).max(120).optional(),
  phone: z.string().min(8).max(20).optional(),
});

const roleUpdateSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["user", "admin"]),
});

const submissionSchema = z.object({
  userId: z.string().uuid().nullable().optional(),
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

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function registerRoutes(app: Express): Promise<void> {
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  app.get("/api/users/me", async (req, res) => {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: "unauthorized" });
    }

    try {
      const profile = await storage.getProfile(userId);
      return res.json({ profile });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/users/me", async (req, res) => {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: "unauthorized" });
    }

    const parsed = profileUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation_error", details: parsed.error.flatten() });
    }

    try {
      const profile = await storage.updateProfile(userId, parsed.data);
      return res.json({ profile });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/users/role", async (req, res) => {
    const callerId = (req as any).userId;
    if (!callerId) {
      return res.status(401).json({ error: "unauthorized" });
    }

    try {
      const caller = await storage.getProfile(callerId);
      if (!caller || caller.role !== "admin") {
        return res.status(403).json({ error: "forbidden" });
      }

      const parsed = roleUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "validation_error", details: parsed.error.flatten() });
      }

      const profile = await storage.updateProfile(parsed.data.userId, { role: parsed.data.role });
      return res.json({ profile });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/users/sync", async (req, res) => {
    const userId = (req as any).userId;
    const userEmail = (req as any).userEmail;
    
    if (!userId || !userEmail) {
      return res.status(401).json({ error: "unauthorized" });
    }

    try {
      const profile = await storage.upsertProfile({
        id: userId,
        email: userEmail,
        fullName: req.body.full_name || null,
        phone: req.body.phone || null,
      });
      return res.json({ profile });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/submissions", async (req, res) => {
    const parsed = submissionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation_error", details: parsed.error.flatten() });
    }

    const userId = (req as any).userId;

    try {
      const submission = await storage.createSubmission({
        ...parsed.data,
        userId: userId || null,
      });
      return res.json({ submission });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/submissions", async (req, res) => {
    const callerId = (req as any).userId;
    const userEmail = (req as any).userEmail;

    if (!callerId) {
      return res.status(401).json({ error: "unauthorized" });
    }

    try {
      const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase());
      if (!isAdmin) {
        const caller = await storage.getProfile(callerId);
        if (!caller || caller.role !== "admin") {
          return res.status(403).json({ error: "forbidden" });
        }
      }

      const submissions = await storage.getSubmissions();
      return res.json({ submissions });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/submissions/:id", async (req, res) => {
    const callerId = (req as any).userId;
    const userEmail = (req as any).userEmail;

    if (!callerId) {
      return res.status(401).json({ error: "unauthorized" });
    }

    try {
      const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase());
      if (!isAdmin) {
        const caller = await storage.getProfile(callerId);
        if (!caller || caller.role !== "admin") {
          return res.status(403).json({ error: "forbidden" });
        }
      }

      const statusSchema = z.object({
        status: z.enum(["pending", "approved", "rejected"]),
      });
      const parsed = statusSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "validation_error", details: parsed.error.flatten() });
      }

      const submission = await storage.updateSubmissionStatus(req.params.id, parsed.data.status);
      return res.json({ submission });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });
}
