import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
const app = express();
// Configurable CORS origins via env: ALLOWED_ORIGINS="https://yourdomain.com,https://admin.yourdomain.com"
const allowedOrigins = (process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()).filter(Boolean)) || [
    'http://localhost:8081',
    'http://localhost:8080',
];
app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json());
app.use(morgan('tiny'));
// Configure Helmet with CSP that allows Supabase auth endpoints
const rawSupabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseCspOrigins = rawSupabaseUrl ? [new URL(rawSupabaseUrl).origin] : ["https://*.supabase.co"];
app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            "default-src": ["'self'"],
            "base-uri": ["'self'"],
            "img-src": ["'self'", "data:", "https:"],
            "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
            "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            "script-src": ["'self'", "'unsafe-inline'"],
            "connect-src": ["'self'", "https:", "wss:", ...supabaseCspOrigins, "https://*.supabase.co"],
            "frame-src": ["'self'", ...supabaseCspOrigins, "https://*.supabase.co"],
            "form-action": ["'self'", ...supabaseCspOrigins, "https://*.supabase.co"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
// Basic rate limiting
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
// Serve built frontend assets from Vite's dist directory
const distDir = path.join(process.cwd(), 'dist');
app.use(express.static(distDir, { maxAge: '1h' }));
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;
let supabase = null;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    console.warn('Supabase env not set. Backend will run in static-only mode.');
}
else {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
        auth: { persistSession: false },
    });
}
// Schemas
const profileUpdateSchema = z.object({
    full_name: z.string().min(1).max(120).optional(),
    phone: z.string().min(8).max(20).optional(),
});
const roleUpdateSchema = z.object({
    user_id: z.string().uuid(),
    role: z.enum(['user', 'admin']),
});
// Helper: get user id from Authorization: Bearer <token>, with optional dev fallback
async function getAuthUserId(req) {
    try {
        if (!supabase)
            return null;
        const auth = req.header('authorization') || req.header('Authorization') || '';
        const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : null;
        if (token) {
            const { data, error } = await supabase.auth.getUser(token);
            if (error)
                return null;
            return data.user?.id ?? null;
        }
        if (process.env.ALLOW_DEV_HEADER === 'true') {
            const devId = req.header('x-user-id');
            if (devId)
                return devId;
        }
        return null;
    }
    catch {
        return null;
    }
}
// Middleware: attach user id derived from JWT (or dev header if enabled)
app.use(async (req, _res, next) => {
    req.userId = await getAuthUserId(req);
    next();
});
// Health
app.get('/api/health', (_req, res) => res.json({ ok: true }));
// Get my profile
app.get('/api/users/me', async (req, res) => {
    try {
        if (!supabase)
            return res.status(503).json({ error: 'service_unavailable', message: 'Supabase not configured' });
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ error: 'unauthorized' });
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
        if (error)
            return res.status(500).json({ error: error.message });
        return res.json({ profile: data });
    }
    catch (e) {
        return res.status(500).json({ error: e?.message || 'server_error' });
    }
});
// Update my profile
app.put('/api/users/me', async (req, res) => {
    try {
        if (!supabase)
            return res.status(503).json({ error: 'service_unavailable', message: 'Supabase not configured' });
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ error: 'unauthorized' });
        const parsed = profileUpdateSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: 'validation_error', details: parsed.error.flatten() });
        const { data, error } = await supabase
            .from('profiles')
            .update({ ...parsed.data })
            .eq('id', userId)
            .select('*')
            .maybeSingle();
        if (error)
            return res.status(500).json({ error: error.message });
        return res.json({ profile: data });
    }
    catch (e) {
        return res.status(500).json({ error: e?.message || 'server_error' });
    }
});
// Admin: update role (caller must be admin)
app.post('/api/users/role', async (req, res) => {
    try {
        if (!supabase)
            return res.status(503).json({ error: 'service_unavailable', message: 'Supabase not configured' });
        const callerId = req.userId;
        if (!callerId)
            return res.status(401).json({ error: 'unauthorized' });
        const { data: caller, error: callerErr } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', callerId)
            .maybeSingle();
        if (callerErr)
            return res.status(500).json({ error: callerErr.message });
        if (!caller || caller.role !== 'admin')
            return res.status(403).json({ error: 'forbidden' });
        const parsed = roleUpdateSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: 'validation_error', details: parsed.error.flatten() });
        const { data, error } = await supabase
            .from('profiles')
            .update({ role: parsed.data.role })
            .eq('id', parsed.data.user_id)
            .select('*')
            .maybeSingle();
        if (error)
            return res.status(500).json({ error: error.message });
        return res.json({ profile: data });
    }
    catch (e) {
        return res.status(500).json({ error: e?.message || 'server_error' });
    }
});
// Sync: upsert caller into profiles using auth email
app.post('/api/users/sync', async (req, res) => {
    try {
        if (!supabase)
            return res.status(503).json({ error: 'service_unavailable', message: 'Supabase not configured' });
        const callerId = req.userId;
        if (!callerId)
            return res.status(401).json({ error: 'unauthorized' });
        const auth = req.header('authorization') || req.header('Authorization') || '';
        const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : null;
        if (!token)
            return res.status(401).json({ error: 'unauthorized' });
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data.user)
            return res.status(401).json({ error: 'invalid_token' });
        const email = data.user.email;
        const { data: upserted, error: upsertErr } = await supabase
            .from('profiles')
            .upsert({ id: callerId, email }, { onConflict: 'id' })
            .select('*')
            .maybeSingle();
        if (upsertErr)
            return res.status(500).json({ error: upsertErr.message });
        return res.json({ profile: upserted });
    }
    catch (e) {
        return res.status(500).json({ error: e?.message || 'server_error' });
    }
});
// 404 route for API only
app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'not_found' });
});
// SPA fallback for all non-API routes (serves React app)
app.use((req, res, next) => {
    if (req.path.startsWith('/api'))
        return next();
    res.sendFile(path.join(distDir, 'index.html'));
});
// Error handler
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'server_error' });
});
const port = process.env.PORT ? Number(process.env.PORT) : 8787;
app.listen(port, () => {
    console.log(`Backend server listening on http://localhost:${port}`);
    console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
});
