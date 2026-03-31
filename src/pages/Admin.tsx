import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { sendStatusEmail } from "@/lib/email";
import { apiFetch, type Submission } from "@/lib/api";

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

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export default function Admin() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Submission[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Submission | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { submissions } = await apiFetch<{ submissions: Submission[] }>("submissions", { method: "GET" });
        if (mounted) setRows(submissions);
      } catch (error: any) {
        toast({ title: "Failed to load submissions", description: error?.message || "Please try again.", variant: "destructive" });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [toast]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      const hay = `${r.name} ${r.email} ${r.mobile} ${r.city} ${r.businessName} ${r.loanAmount}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, search, statusFilter]);

  const exportCsv = () => {
    const header = CSV_HEADERS.map(escapeCsv).join(",");
    const lines = rows.map((r) =>
      [
        r.id,
        r.createdAt,
        r.status,
        r.name,
        r.mobile,
        r.email,
        r.city,
        r.businessName,
        r.businessType,
        r.annualTurnover,
        r.yearsInBusiness,
        r.loanAmount,
        r.loanPurpose,
        r.tenure,
        r.panNumber ?? "",
        r.gstNumber ?? "",
        r.userId ?? "",
      ]
        .map(escapeCsv)
        .join(",")
    );
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `submissions_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    const rowsHtml = rows
      .map(
        (r) => `
          <tr>
            <td>${escapeHtml(r.id)}</td>
            <td>${escapeHtml(r.createdAt)}</td>
            <td>${escapeHtml(r.status)}</td>
            <td>${escapeHtml(r.name)}</td>
            <td>${escapeHtml(r.mobile)}</td>
            <td>${escapeHtml(r.email)}</td>
            <td>${escapeHtml(r.city)}</td>
            <td>${escapeHtml(r.businessName)}</td>
            <td>${escapeHtml(r.businessType)}</td>
            <td>${escapeHtml(r.annualTurnover)}</td>
            <td>${escapeHtml(r.yearsInBusiness)}</td>
            <td>${escapeHtml(r.loanAmount)}</td>
            <td>${escapeHtml(r.loanPurpose)}</td>
            <td>${escapeHtml(r.tenure)}</td>
            <td>${escapeHtml(r.panNumber ?? "")}</td>
            <td>${escapeHtml(r.gstNumber ?? "")}</td>
            <td>${escapeHtml(r.userId ?? "")}</td>
          </tr>
        `
      )
      .join("");

    const worksheet = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head>
          <meta charset="UTF-8" />
        </head>
        <body>
          <table>
            <thead>
              <tr>${CSV_HEADERS.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([worksheet], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `submissions_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const updateStatus = async (id: string, status: Submission["status"]) => {
    try {
      const { submission } = await apiFetch<{ submission: Submission }>(`submissions/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setRows((prev) => prev.map((row) => (row.id === id ? submission : row)));
      if (selected?.id === id) setSelected(submission);

      sendStatusEmail(
        {
          id: submission.id,
          name: submission.name,
          email: submission.email,
          mobile: submission.mobile,
          city: submission.city,
          businessName: submission.businessName,
          businessType: submission.businessType,
          loanAmount: submission.loanAmount,
          loanPurpose: submission.loanPurpose,
          tenure: submission.tenure,
          created_at: submission.createdAt,
          status: submission.status,
        },
        submission.status
      );

      toast({
        title: "Status updated",
        description: `Submission ${submission.id} is now ${submission.status}.`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to update status",
        description: error?.message || "Unknown error",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="section-padding">
          <div className="container-custom">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="section-padding">
        <div className="container-custom">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button variant="secondary" asChild>
                <Link to="/admin/users">Manage Users</Link>
              </Button>
              <Button variant="outline" onClick={exportExcel}>
                Export Excel
              </Button>
              <Button variant="accent" onClick={exportCsv}>
                Export CSV
              </Button>
            </div>
          </div>

          <div className="glass-card mb-6 grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
            <Input placeholder="Search by name, email, mobile, city, amount" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="border border-border rounded-md bg-background p-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <Button variant="outline" onClick={() => { setSearch(""); setStatusFilter("all"); }}>
              Reset
            </Button>
          </div>

          <div className="hidden overflow-x-auto glass-card p-0 md:block">
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
                    <td className="p-3">{new Date(r.createdAt).toLocaleString()}</td>
                    <td className="p-3">{r.name}</td>
                    <td className="p-3">{r.email}</td>
                    <td className="p-3">{r.mobile}</td>
                    <td className="p-3">{r.city}</td>
                    <td className="p-3">{r.loanAmount}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${r.status === "approved" ? "bg-success/20 text-success" : r.status === "rejected" ? "bg-destructive/20 text-destructive" : "bg-secondary text-muted-foreground"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelected(r)}>
                        View
                      </Button>
                      <Button size="sm" variant="accent" className="rounded-full" onClick={() => void updateStatus(r.id, "approved")}>
                        Accept
                      </Button>
                      <Button size="sm" variant="destructive" className="rounded-full" onClick={() => void updateStatus(r.id, "rejected")}>
                        Reject
                      </Button>
                      <Button size="sm" variant="secondary" className="rounded-full" onClick={() => void updateStatus(r.id, "pending")}>
                        Reset
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td className="p-4 text-center text-muted-foreground" colSpan={8}>
                      No submissions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 md:hidden">
            {filtered.map((r) => (
              <div key={r.id} className="glass-card p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{r.name}</h3>
                    <p className="text-xs text-muted-foreground">{r.email}</p>
                  </div>
                  <span className={`inline-block rounded px-2 py-1 text-xs ${r.status === "approved" ? "bg-success/20 text-success" : r.status === "rejected" ? "bg-destructive/20 text-destructive" : "bg-secondary text-muted-foreground"}`}>
                    {r.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-foreground">{new Date(r.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="text-foreground">{r.loanAmount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Mobile</p>
                    <p className="text-foreground">{r.mobile}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">City</p>
                    <p className="text-foreground">{r.city}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" onClick={() => setSelected(r)}>
                    View
                  </Button>
                  <Button size="sm" variant="accent" onClick={() => void updateStatus(r.id, "approved")}>
                    Accept
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => void updateStatus(r.id, "rejected")}>
                    Reject
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => void updateStatus(r.id, "pending")}>
                    Reset
                  </Button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="glass-card p-4 text-center text-muted-foreground">
                No submissions found
              </div>
            )}
          </div>

          <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submission Details</DialogTitle>
                <DialogDescription>
                  All user-provided information organized by section.
                </DialogDescription>
              </DialogHeader>

              {selected && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground text-xs">Created</span><div className="font-medium">{new Date(selected.createdAt).toLocaleString()}</div></div>
                    <div><span className="text-muted-foreground text-xs">Status</span><div className="font-medium">{selected.status}</div></div>
                    <div><span className="text-muted-foreground text-xs">Name</span><div className="font-medium">{selected.name}</div></div>
                    <div><span className="text-muted-foreground text-xs">Email</span><div className="font-medium">{selected.email}</div></div>
                    <div><span className="text-muted-foreground text-xs">Mobile</span><div className="font-medium">{selected.mobile}</div></div>
                    <div><span className="text-muted-foreground text-xs">City</span><div className="font-medium">{selected.city}</div></div>
                    <div><span className="text-muted-foreground text-xs">Business Name</span><div className="font-medium">{selected.businessName}</div></div>
                    <div><span className="text-muted-foreground text-xs">Business Type</span><div className="font-medium">{selected.businessType}</div></div>
                    <div><span className="text-muted-foreground text-xs">Annual Turnover</span><div className="font-medium">{selected.annualTurnover}</div></div>
                    <div><span className="text-muted-foreground text-xs">Years In Business</span><div className="font-medium">{selected.yearsInBusiness}</div></div>
                    <div><span className="text-muted-foreground text-xs">PAN</span><div className="font-medium">{selected.panNumber || "-"}</div></div>
                    <div><span className="text-muted-foreground text-xs">GST</span><div className="font-medium">{selected.gstNumber || "-"}</div></div>
                    <div><span className="text-muted-foreground text-xs">Amount</span><div className="font-medium">{selected.loanAmount}</div></div>
                    <div><span className="text-muted-foreground text-xs">Purpose</span><div className="font-medium">{selected.loanPurpose}</div></div>
                    <div><span className="text-muted-foreground text-xs">Tenure</span><div className="font-medium">{selected.tenure}</div></div>
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
