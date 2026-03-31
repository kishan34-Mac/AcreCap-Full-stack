export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin";
}

export interface Submission {
  id: string;
  userId: string | null;
  name: string;
  mobile: string;
  email: string;
  city: string;
  businessName: string;
  businessType: string;
  annualTurnover: string;
  yearsInBusiness: string;
  loanAmount: string;
  loanPurpose: string;
  tenure: string;
  panNumber: string | null;
  gstNumber: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends AuthUser {
  createdAt: string;
  updatedAt: string;
}

const AUTH_TOKEN_KEY = "acrecap.auth.token";

const rawBase =
  (import.meta.env.VITE_BACKEND_URL as string | undefined)?.trim() || "";
const baseNoSlash = rawBase.replace(/\/+$/, "");
export const API_BASE = baseNoSlash
  ? baseNoSlash.endsWith("/api")
    ? baseNoSlash
    : `${baseNoSlash}/api`
  : "/api";

export function getStoredAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredAuthToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const token = getStoredAuthToken();
  const response = await fetch(`${API_BASE}/${path.replace(/^\/+/, "")}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
    ...init,
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json?.error || json?.message || `HTTP ${response.status}`);
  }

  return json as T;
}
