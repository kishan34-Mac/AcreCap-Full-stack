import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const app = express();

/** -----------------------
 * Trust proxy (Render sits behind a proxy)
 * ---------------------- */
app.set("trust proxy", 1);

/** -----------------------
 * Health (always plain text)
 * ---------------------- */
app.get("/healthz", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).type("text/plain").send("ok");
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

/** -----------------------
 * CORS
 * ---------------------- */
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",")
  .map((o) => o.trim())
  .filter(Boolean) ?? [
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:8081",
];

app.use(
  cors({
    origin: (origin, cb) => {
      // allow server-to-server / curl / postman (no Origin header)
      if (!origin) return cb(null, true);

      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(morgan("tiny"));

/** -----------------------
 * Security headers (Helmet)
 * ---------------------- */
const rawSupabaseUrl =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseCspOrigins = rawSupabaseUrl
  ? [new URL(rawSupabaseUrl).origin]
  : ["https://*.supabase.co"];

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "base-uri": ["'self'"],
        "img-src": ["'self'", "data:", "https:"],
        "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
        "style-src": [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],
        "script-src": ["'self'", "'unsafe-inline'"],
        "connect-src": [
          "'self'",
          "https:",
          "wss:",
          ...supabaseCspOrigins,
          "https://*.supabase.co",
        ],
        "frame-src": ["'self'", ...supabaseCspOrigins, "https://*.supabase.co"],
        "form-action": [
          "'self'",
          ...supabaseCspOrigins,
          "https://*.supabase.co",
        ],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

/** -----------------------
 * Rate limit
 * ---------------------- */
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/** -----------------------
 * Supabase (service role) for backend
 * ---------------------- */
const SUPABASE_URL = process.env.SUPABASE_URL; // prefer backend-only env
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

let supabase: SupabaseClient | null = null;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    "⚠️ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. API routes will return 503."
  );
} else {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

/** -----------------------
 * Schemas
 * ---------------------- */
const profileUpdateSchema = z.object({
  full_name: z.string().min(1).max(120).optional(),
  phone: z.string().min(8).max(20).optional(),
});

const roleUpdateSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(["user", "admin"]),
});

const submissionSchema = z.object({
  user_id: z.string().uuid().nullable().optional(),

  name: z.string().min(1).max(120),
  mobile: z.string().min(8).max(20),
  email: z.string().email().max(160),
  city: z.string().min(1).max(120),

  business_name: z.string().min(1).max(160),
  business_type: z.string().min(1).max(160),
  annual_turnover: z.string().min(1).max(160),
  years_in_business: z.string().min(1).max(60),

  loan_amount: z.string().min(1).max(120),
  loan_purpose: z.string().min(1).max(200),
  tenure: z.string().min(1).max(60),

  pan_number: z.string().nullable().optional(),
  gst_number: z.string().nullable().optional(),

  status: z.enum(["pending", "approved", "rejected"]).default("pending"),
});

/** -----------------------
 * Auth helpers
 * ---------------------- */
async function getAuthUserId(req: express.Request): Promise<string | null> {
  if (!supabase) return null;

  const auth = req.header("authorization") || req.header("Authorization") || "";
  const token = auth.startsWith("Bearer ")
    ? auth.slice("Bearer ".length).trim()
    : null;

  if (token) {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) return null;
    return data.user?.id ?? null;
  }

  if (process.env.ALLOW_DEV_HEADER === "true") {
    const devId = req.header("x-user-id");
    if (devId) return devId;
  }

  return null;
}

app.use(async (req, _res, next) => {
  (req as any).userId = await getAuthUserId(req);
  next();
});

/** -----------------------
 * ✅ NEW: Prevent caching on /api/users/me
 * ---------------------- */
app.use((req, res, next) => {
  if (req.path.startsWith("/api/users/me")) {
    res.set("Cache-Control", "no-store");
  }
  next();
});

/** -----------------------
 * Users
 * ---------------------- */
app.get("/api/users/me", async (req, res) => {
  if (!supabase)
    return res.status(503).json({
      error: "service_unavailable",
      message: "Supabase not configured",
    });

  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: "unauthorized" });

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });

  return res.json({ profile: data });
});

app.put("/api/users/me", async (req, res) => {
  if (!supabase)
    return res.status(503).json({
      error: "service_unavailable",
      message: "Supabase not configured",
    });

  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: "unauthorized" });

  const parsed = profileUpdateSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ error: "validation_error", details: parsed.error.flatten() });

  const { data, error } = await supabase
    .from("profiles")
    .update({ ...parsed.data })
    .eq("id", userId)
    .select("*")
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ profile: data });
});

app.post("/api/users/role", async (req, res) => {
  if (!supabase)
    return res.status(503).json({
      error: "service_unavailable",
      message: "Supabase not configured",
    });

  const callerId = (req as any).userId;
  if (!callerId) return res.status(401).json({ error: "unauthorized" });

  const { data: caller, error: callerErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", callerId)
    .maybeSingle();

  if (callerErr) return res.status(500).json({ error: callerErr.message });
  if (!caller || caller.role !== "admin")
    return res.status(403).json({ error: "forbidden" });

  const parsed = roleUpdateSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ error: "validation_error", details: parsed.error.flatten() });

  const { data, error } = await supabase
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.user_id)
    .select("*")
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ profile: data });
});

// Sync: upsert caller into profiles using auth email
app.post("/api/users/sync", async (req, res) => {
  if (!supabase)
    return res.status(503).json({
      error: "service_unavailable",
      message: "Supabase not configured",
    });

  const callerId = (req as any).userId;
  if (!callerId) return res.status(401).json({ error: "unauthorized" });

  const auth = req.header("authorization") || req.header("Authorization") || "";
  const token = auth.startsWith("Bearer ")
    ? auth.slice("Bearer ".length).trim()
    : null;
  if (!token) return res.status(401).json({ error: "unauthorized" });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user)
    return res.status(401).json({ error: "invalid_token" });

  const email = data.user.email;
  const full_name = data.user.user_metadata?.full_name || null;
  const phone = data.user.phone || null;
  const { data: upserted, error: upsertErr } = await supabase
    .from("profiles")
    .upsert({ id: callerId, email, full_name, phone }, { onConflict: "id" })
    .select("*")
    .maybeSingle();

  if (upsertErr) return res.status(500).json({ error: upsertErr.message });
  return res.json({ profile: upserted });
});

/** -----------------------
 * Submissions
 * ---------------------- */
const ADMIN_EMAILS = (
  process.env.ADMIN_EMAILS ||
  process.env.VITE_ADMIN_EMAILS ||
  ""
)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

async function isAdminRequest(req: express.Request): Promise<boolean> {
  if (!supabase) return false;

  const auth = req.header("authorization") || req.header("Authorization") || "";
  const token = auth.startsWith("Bearer ")
    ? auth.slice("Bearer ".length).trim()
    : null;
  if (!token) return false;

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return false;

  const email = data.user.email?.toLowerCase();
  if (email && ADMIN_EMAILS.includes(email)) return true;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();
  return profile?.role === "admin";
}

app.post("/api/submissions", async (req, res) => {
  if (!supabase)
    return res.status(503).json({
      error: "service_unavailable",
      message: "Supabase not configured",
    });

  const parsed = submissionSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ error: "validation_error", details: parsed.error.flatten() });

  const userId = (req as any).userId;
  const payload = { ...parsed.data, user_id: userId ?? null };

  const { data, error } = await supabase
    .from("submissions")
    .insert(payload)
    .select("*")
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });

  return res.json({ submission: data });
});

app.get("/api/submissions", async (req, res) => {
  if (!supabase)
    return res.status(503).json({
      error: "service_unavailable",
      message: "Supabase not configured",
    });

  const ok = await isAdminRequest(req);
  if (!ok) return res.status(403).json({ error: "forbidden" });

  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });

  return res.json({ submissions: data || [] });
});

app.patch("/api/submissions/:id", async (req, res) => {
  if (!supabase)
    return res.status(503).json({
      error: "service_unavailable",
      message: "Supabase not configured",
    });

  const ok = await isAdminRequest(req);
  if (!ok) return res.status(403).json({ error: "forbidden" });

  const statusSchema = z.object({
    status: z.enum(["pending", "approved", "rejected"]),
  });
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ error: "validation_error", details: parsed.error.flatten() });

  const { data, error } = await supabase
    .from("submissions")
    .update({ status: parsed.data.status })
    .eq("id", req.params.id)
    .select("*")
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ submission: data });
});

/** -----------------------
 * 404 for API
 * ---------------------- */
app.use("/api", (_req, res) => res.status(404).json({ error: "not_found" }));

/** -----------------------
 * Root route (for Render)
 * ---------------------- */
app.get("/", (_req, res) =>
  res
    .status(200)
    .type("text/plain")
    .send("AcreCap backend running. Use /healthz and /api/*")
);

/** -----------------------
 * Error handler
 * ---------------------- */
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "server_error" });
  }
);

/** -----------------------
 * Listen
 * ---------------------- */
const PORT = Number(process.env.PORT || 8787);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend listening on port ${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(", ")}`);
  console.log("Health endpoint enabled at /healthz");
});
