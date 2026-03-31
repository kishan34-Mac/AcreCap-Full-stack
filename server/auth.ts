import session from "express-session";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
      userRole?: "user" | "admin";
      authToken?: string;
    }
  }

  interface SessionUser {
    id: string;
    email: string;
    role: "user" | "admin";
  }
}

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: "user" | "admin";
}

const getJwtSecret = () =>
  process.env.JWT_SECRET || process.env.SESSION_SECRET || "acrecap-dev-jwt-secret";

export function signAuthToken(user: SessionUser): string {
  return jwt.sign(
    { email: user.email, role: user.role },
    getJwtSecret(),
    {
      subject: user.id,
      expiresIn: "7d",
      issuer: "acrecap",
    }
  );
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      issuer: "acrecap",
    }) as jwt.JwtPayload;

    if (
      typeof decoded.sub !== "string" ||
      typeof decoded.email !== "string" ||
      (decoded.role !== "user" && decoded.role !== "admin")
    ) {
      return null;
    }

    return {
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

declare module "express-session" {
  interface SessionData {
    user?: SessionUser;
  }
}

export const sessionMiddleware = session({
  name: "acrecap.sid",
  secret: process.env.SESSION_SECRET || "acrecap-dev-session-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
});

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const payload = verifyAuthToken(token);
    if (payload) {
      req.userId = payload.sub;
      req.userEmail = payload.email;
      req.userRole = payload.role;
      req.authToken = token;
      next();
      return;
    }
  }

  const sessionUser = req.session.user;
  if (sessionUser) {
    req.userId = sessionUser.id;
    req.userEmail = sessionUser.email;
    req.userRole = sessionUser.role;
  }
  next();
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.userId) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  next();
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.userId) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  if (req.userRole !== "admin") {
    res.status(403).json({ error: "forbidden" });
    return;
  }

  next();
}
