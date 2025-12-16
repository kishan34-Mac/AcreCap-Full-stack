import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// removed unused Select import
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { sendStatusEmail } from "@/lib/email";
import { logActivity } from "@/lib/sync";
import { useQueryClient } from "@tanstack/react-query";

// CSV headers for export
const CSV_HEADERS = [
  "ID",
  "Created At",
  "Status",
  "Name",
  "Mobile",
  "Email",
  "City",
  "Business Name",
  "Business Type",
  "Annual Turnover",
  "Years In Business",
  "Loan Amount",
  "Loan Purpose",
  "Tenure",
  "PAN",
  "GST",
  "User ID",
];
const escapeCsv = (v: any) => {
  const s = String(v ?? "");
  const needsQuote = /[","\n]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuote ? `"${escaped}"` : escaped;
};

interface SubmissionRow {
  id: string;
  created_at: string;
  user_id: string | null;
  name: string;
  mobile: string;
  email: string;
  city: string;
  business_name: string;
  business_type: string;
  annual_turnover: string;
  years_in_business: string;
  loan_amount: string;
  loan_purpose: string;
  tenure: string;
  pan_number: string | null;
  gst_number: string | null;
  status: "pending" | "approved" | "rejected";
}

const ADMIN_EMAILS =
  (import.meta.env.VITE_ADMIN_EMAILS as string | undefined)
    ?.split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean) || [];

const API_BASE_RAW =
  (import.meta.env.VITE_BACKEND_URL as string | undefined)?.trim() ||
  "https://acrecap-full-stack.onrender.com";
const API_BASE_NO_SLASH = API_BASE_RAW.replace(/\/+$/, "");
const API_BASE = API_BASE_NO_SLASH.endsWith("/api")
  ? API_BASE_NO_SLASH
  : `${API_BASE_NO_SLASH}/api`;
const apiUrl = (path: string) => {
  const p = path.replace(/^\/+/, "");
  return `${API_BASE}/${p}`;
};
const getToken = async (): Promise<string | null> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    return (
      sessionData.session?.access_token ??
      (sessionData.session as any)?.access_token ??
      null
    );
  } catch {
    return null;
  }
};

export default function Admin() {
  const { toast } = useToast();
  const [rows, setRows] = useState<SubmissionRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selected, setSelected] = useState<SubmissionRow | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const clearSupabaseAuthStorage = () => {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i) || "";
        if (k.startsWith("sb-") || k.includes("supabase")) keys.push(k);
      }
      keys.forEach((k) => localStorage.removeItem(k));
    } catch {}
  };

  const teardownRealtime = () => {
    try {
      const channels = (supabase as any).getChannels?.() || [];
      channels.forEach((ch: any) => (supabase as any).removeChannel?.(ch));
      (supabase as any).removeAllChannels?.();
    } catch {}
  };

  const handleLogout = async () => {
    let logoutError: string | null = null;
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      try {
        await logActivity("admin_logout", { email: session.user.email });
        const { error } = await supabase.auth.signOut();
        if (error) {
          const msg = error.message || "";
          const isNoSession =
            /Auth session missing|No active session|No current session/i.test(
              msg
            );
          if (!isNoSession) logoutError = msg;
        }
      } catch (e: any) {
        logoutError = typeof e?.message === "string" ? e.message : null;
      }
    }

    teardownRealtime();
    clearSupabaseAuthStorage();
    try {
      queryClient.clear();
    } catch {}

    if (logoutError) {
      toast({
        title: "Logout failed",
        description: logoutError,
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    toast({ title: "Logged out", description: "You have been logged out." });
    navigate("/");
  };
  // Export all rows to CSV and trigger download
  const exportCsv = () => {
    try {
      const header = CSV_HEADERS.map(escapeCsv).join(",");
      const lines = rows.map((r) =>
        [
          r.id,
          r.created_at,
          r.status,
          r.name,
          r.mobile,
          r.email,
          r.city,
          r.business_name,
          r.business_type,
          r.annual_turnover,
          r.years_in_business,
          r.loan_amount,
          r.loan_purpose,
          r.tenure,
          r.pan_number ?? "",
          r.gst_number ?? "",
          r.user_id ?? "",
        ]
          .map(escapeCsv)
          .join(",")
      );
      const csv = [header, ...lines].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `submissions_${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, "-")}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      toast({
        title: "Export failed",
        description: "Unable to generate CSV. Please try again.",
        variant: "destructive",
      });
    }
  };
  // Helper: read local submissions as array
  const readLocalSubmissions = (): SubmissionRow[] => {
    // Local storage fallback removed; always rely on backend/Supabase
    return [];
  };

  // Helper: merge DB lists (local fallback removed)
  const mergeSubmissions = (dbRows: SubmissionRow[]): SubmissionRow[] => {
    return [...dbRows].sort((a, b) => (a.created_at > b.created_at ? -1 : 1));
  };

  // Helper: fetch all submissions from DB
  const fetchAllSubmissions = async (): Promise<SubmissionRow[]> => {
    try {
      // Try Supabase directly first
      const { data, error } = await (supabase as any)
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Supabase fetch error:", error);
        throw error;
      }
      console.log("Fetched data from Supabase:", data);
      const dbRows: SubmissionRow[] = (data || []) as SubmissionRow[];
      return mergeSubmissions(dbRows);
    } catch (supabaseErr: any) {
      console.error("Supabase fetch failed:", supabaseErr);
      // Return empty array instead of trying backend to avoid fetch errors
      return [];
    }
  };

  // (removed) mergeSubmissions that previously merged local rows
  useEffect(() => {
    let mounted = true;
    let channel: any;
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const email = sessionData.session?.user?.email?.toLowerCase();
      if (!email) {
        toast({
          title: "Access denied",
          description: "You must be logged in to view this page.",
          variant: "destructive",
        });
        setIsAuthorized(false);
        setLoading(false);
        return;
      }
      // Ensure admin email exists in admin_emails table for RLS-based privileges
      try {
        const { data: adminRow } = await (supabase as any)
          .from("admin_emails")
          .select("email")
          .eq("email", email)
          .maybeSingle();
        if (!adminRow) {
          await (supabase as any).from("admin_emails").insert({ email });
        }
      } catch (e) {
        // non-blocking if table/policy prevents insert; submission updates may still work depending on RLS
      }
      setIsAuthorized(true);
      try {
        const dbRows = await fetchAllSubmissions();
        if (!mounted) return;
        setRows(dbRows);
        setLoading(false);
      } catch (e: any) {
        setLoading(false);
      }

      // Subscribe to realtime changes
      try {
        channel = (supabase as any).channel?.("submissions_changes");
        channel?.on?.(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "submissions",
          },
          (payload: any) => {
            const newRow = payload?.new as SubmissionRow | undefined;
            const oldRow = payload?.old as SubmissionRow | undefined;
            if (newRow && (!oldRow || newRow.id !== oldRow.id)) {
              setRows((prev) =>
                mergeSubmissions([
                  newRow,
                  ...prev.filter((r) => r.id !== newRow.id),
                ])
              );
            } else if (oldRow && !newRow) {
              setRows((prev) => prev.filter((r) => r.id !== oldRow.id));
            } else if (newRow && oldRow && newRow.id === oldRow.id) {
              setRows((prev) =>
                prev.map((r) => (r.id === newRow.id ? newRow : r))
              );
            }
          }
        );
        channel?.subscribe?.();
      } catch {}
    };

    load();

    return () => {
      mounted = false;
      try {
        channel?.unsubscribe?.();
      } catch {}
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      const hay =
        `${r.name} ${r.email} ${r.mobile} ${r.city} ${r.business_name} ${r.loan_amount}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, search, statusFilter]);

  const updateStatus = async (id: string, status: SubmissionRow["status"]) => {
    try {
      const token = await getToken();
      const res = await fetch(apiUrl(`submissions/${id}`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      const updated = json?.submission as SubmissionRow;
      setRows((prev) => prev.map((r) => (r.id === id ? updated : r)));
      toast({
        title: "Status updated",
        description: `Submission ${id} is now ${status}`,
      });
    } catch (e: any) {
      toast({
        title: "Failed to update status",
        description: e?.message || "Unknown error",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="section-padding">
          <div className="container-custom">
            <div className="animate-pulse text-muted-foreground">
              Loading...
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthorized) {
    return (
      <Layout>
        <section className="section-padding">
          <div className="container-custom">
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-2">Access denied</h2>
              <p className="text-muted-foreground mb-4">
                You are not authorized to view the admin panel.
              </p>
              <div className="flex gap-2">
                <Button asChild variant="accent">
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/">Go Home</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="section-padding">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={handleLogout}>
                Logout
              </Button>
              <Button variant="accent" onClick={exportCsv}>
                Export Data
              </Button>
            </div>
          </div>
          <div className="glass-card p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              placeholder="Search by name, email, mobile, city, amount"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            // Using native select for filtering to avoid extra dependencies
            <select
              className="border border-border rounded-md bg-background p-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
            >
              Reset
            </Button>
          </div>

          <div className="glass-card p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-border">
                  <th className="p-3">Created</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Mobile</th>
                  <th className="p-3">City</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="p-3">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="p-3">{r.name}</td>
                    <td className="p-3">{r.email}</td>
                    <td className="p-3">{r.mobile}</td>
                    <td className="p-3">{r.city}</td>
                    <td className="p-3">{r.loanAmount}</td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs ${
                          r.status === "approved"
                            ? "bg-success/20 text-success"
                            : r.status === "rejected"
                            ? "bg-destructive/20 text-destructive"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelected(r)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="accent"
                        className="rounded-full"
                        onClick={() => updateStatus(r.id, "approved")}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="rounded-full"
                        onClick={() => updateStatus(r.id, "rejected")}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="rounded-full"
                        onClick={() => updateStatus(r.id, "pending")}
                      >
                        Reset
                      </Button>
                      {/* removed local-only label */}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      className="p-4 text-center text-muted-foreground"
                      colSpan={8}
                    >
                      No submissions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Dialog
            open={!!selected}
            onOpenChange={(open) => {
              if (!open) setSelected(null);
            }}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submission Details</DialogTitle>
                <DialogDescription>
                  All user-provided information organized by section.
                </DialogDescription>
              </DialogHeader>

              {selected && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold mb-2">
                      Basic Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-muted-foreground text-xs">
                          Created
                        </span>
                        <div className="font-medium">
                          {new Date(selected.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">
                          Status
                        </span>
                        <div className="font-medium">{selected.status}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">
                          Name
                        </span>
                        <div className="font-medium">{selected.name}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">
                          Email
                        </span>
                        <div className="font-medium">{selected.email}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">
                          Mobile
                        </span>
                        <div className="font-medium">{selected.mobile}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">
                          City
                        </span>
                        <div className="font-medium">{selected.city}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2">
                      Business Info
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-muted-foreground text-xs">
                          Business Name
                        </span>
                        <div className="font-medium">
                          {selected.businessName}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">
                          Business Type
                        </span>
                        <div className="font-medium">
                          {selected.businessType}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">
                          Annual Turnover
                        </span>
                        <div className="font-medium">
                          {selected.annualTurnover}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">
                          Years In Business
                        </span>
                        <div className="font-medium">
                          {selected.yearsInBusiness}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">
                          PAN
                        </span>
                        <div className="font-medium">
                          {selected.panNumber || "-"}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">
                          GST
                        </span>
                        <div className="font-medium">
                          {selected.gst_number || "-"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2">Loan Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-muted-foreground text-xs">
                          Amount
                        </span>
                        <div className="font-medium">{selected.loanAmount}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">
                          Purpose
                        </span>
                        <div className="font-medium">
                          {selected.loanPurpose}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">
                          Tenure
                        </span>
                        <div className="font-medium">{selected.tenure}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </section>
    </Layout>
  );
}
