import session from "express-session";
import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
      userRole?: "user" | "admin";
    }
  }

  interface SessionUser {
    id: string;
    email: string;
    role: "user" | "admin";
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
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
});

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
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
