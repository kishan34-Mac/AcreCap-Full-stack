import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const app = express();

// Configurable CORS origins via env: ALLOWED_ORIGINS="https://yourdomain.com,https://admin.yourdomain.com"
const allowedOrigins = (process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()).filter(Boolean)) || [
  'http://localhost:8081',
  'http://localhost:8080',
];
app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(morgan('tiny'));
app.use(helmet());

// Basic rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('Missing Supabase URL or Service Role key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { persistSession: false },
});

// Schemas
const profileUpdateSchema = z.object({
  full_name: z.string().min(1).max(120).optional(),
  phone: z.string().min(8).max(20).optional(),
});

const roleUpdateSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(['user','admin']),
});

// Helper: get user id from Authorization: Bearer <token>, with optional dev fallback
async function getAuthUserId(req: express.Request): Promise<string | null> {
  try {
    const auth = req.header('authorization') || req.header('Authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : null;
    if (token) {
      const { data, error } = await supabase.auth.getUser(token);
      if (error) return null;
      return data.user?.id ?? null;
    }
    // Optional dev fallback: allow x-user-id header ONLY when explicitly enabled
    if (process.env.ALLOW_DEV_HEADER === 'true') {
      const devId = req.header('x-user-id');
      if (devId) return devId;
    }
    return null;
  } catch {
    return null;
  }
}

// Middleware: attach user id derived from JWT (or dev header if enabled)
app.use(async (req, _res, next) => {
  (req as any).userId = await getAuthUserId(req);
  next();
});

// Health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Get my profile
app.get('/api/users/me', async (req, res) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: 'unauthorized' });
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ profile: data });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'server_error' });
  }
});

// Update my profile
app.put('/api/users/me', async (req, res) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: 'unauthorized' });
    const parsed = profileUpdateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'validation_error', details: parsed.error.flatten() });
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...parsed.data })
      .eq('id', userId)
      .select('*')
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ profile: data });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'server_error' });
  }
});

// Admin: update role (caller must be admin)
app.post('/api/users/role', async (req, res) => {
  try {
    const callerId = (req as any).userId;
    if (!callerId) return res.status(401).json({ error: 'unauthorized' });
    // verify caller role
    const { data: caller, error: callerErr } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', callerId)
      .maybeSingle();
    if (callerErr) return res.status(500).json({ error: callerErr.message });
    if (!caller || caller.role !== 'admin') return res.status(403).json({ error: 'forbidden' });

    const parsed = roleUpdateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'validation_error', details: parsed.error.flatten() });
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: parsed.data.role })
      .eq('id', parsed.data.user_id)
      .select('*')
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ profile: data });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'server_error' });
  }
});

// Sync: upsert caller into profiles using auth email
app.post('/api/users/sync', async (req, res) => {
  try {
    const callerId = (req as any).userId;
    if (!callerId) return res.status(401).json({ error: 'unauthorized' });
    const auth = req.header('authorization') || req.header('Authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : null;
    if (!token) return res.status(401).json({ error: 'unauthorized' });
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return res.status(401).json({ error: 'invalid_token' });

    const email = data.user.email;
    const { data: upserted, error: upsertErr } = await supabase
      .from('profiles')
      .upsert({ id: callerId, email }, { onConflict: 'id' })
      .select('*')
      .maybeSingle();
    if (upsertErr) return res.status(500).json({ error: upsertErr.message });
    return res.json({ profile: upserted });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'server_error' });
  }
});

// 404 route
app.use((_req, res) => {
  res.status(404).json({ error: 'not_found' });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'server_error' });
});

const port = process.env.PORT ? Number(process.env.PORT) : 8787;
app.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
  console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
});