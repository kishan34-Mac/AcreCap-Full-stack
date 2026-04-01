export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin";
}

export interface Submission {
  id: string;
  applicationType: "loan" | "insurance";
  userId: string | null;
  name: string;
  mobile: string;
  email: string;
  city: string;
  businessName: string | null;
  businessType: string | null;
  annualTurnover: string | null;
  yearsInBusiness: string | null;
  loanAmount: string | null;
  loanPurpose: string | null;
  tenure: string | null;
  insuranceCategory: string | null;
  insurancePlan: string | null;
  coverageAmount: string | null;
  policyTerm: string | null;
  insurancePurpose: string | null;
  existingPolicyProvider: string | null;
  notes: string | null;
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
const AUTH_USER_KEY = "acrecap.auth.user";

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

export function getStoredAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setStoredAuthUser(user: AuthUser | null) {
  try {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

export function getSubmissionTypeLabel(submission: Submission): string {
  return submission.applicationType === "insurance" ? "Insurance" : "Loan";
}

export function getSubmissionPrimaryValue(submission: Submission): string {
  return submission.applicationType === "insurance"
    ? submission.coverageAmount || "-"
    : submission.loanAmount || "-";
}

export function getSubmissionPrimaryLabel(submission: Submission): string {
  return submission.applicationType === "insurance" ? "Coverage" : "Amount";
}

export function getSubmissionTitle(submission: Submission): string {
  return submission.applicationType === "insurance"
    ? submission.insuranceCategory || "Insurance Application"
    : submission.businessName || "Loan Application";
}

export function getSubmissionSecondaryValue(submission: Submission): string {
  return submission.applicationType === "insurance"
    ? submission.insurancePlan || "-"
    : submission.loanPurpose || "-";
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
