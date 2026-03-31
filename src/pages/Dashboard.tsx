import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { logActivity } from "@/lib/sync";
import { apiFetch, type Submission } from "@/lib/api";

const CSV_HEADERS = [
  "ID",
  "Created",
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
  "Status",
];

const escapeCsv = (v: any) => {
  const s = String(v ?? "");
  const needsQuote = /[",\n]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuote ? `"${escaped}"` : escaped;
};

export default function Dashboard() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Submission[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        await logActivity("dashboard_open");
        const { submissions } = await apiFetch<{ submissions: Submission[] }>("submissions", { method: "GET" });
        if (mounted) setRows(submissions);
      } catch (error: any) {
        toast({ title: "Failed to load dashboard", description: error?.message || "Please try again.", variant: "destructive" });
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

  const handleExportCsv = () => {
    const header = CSV_HEADERS.map(escapeCsv).join(",");
    const lines = filtered.map((r) =>
      [
        r.id,
        r.createdAt,
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
        r.status,
      ]
        .map(escapeCsv)
        .join(",")
    );
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `submissions_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
            <h1 className="text-2xl font-bold">My Dashboard</h1>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="accent" asChild>
                <Link to="/apply">New Application</Link>
              </Button>
              <Button variant="outline" onClick={handleExportCsv}>
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
                  <th className="p-3">Business</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-b border-border/50">
                    <td className="p-3">{new Date(row.createdAt).toLocaleString()}</td>
                    <td className="p-3">{row.businessName}</td>
                    <td className="p-3">{row.loanAmount}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${row.status === "approved" ? "bg-success/20 text-success" : row.status === "rejected" ? "bg-destructive/20 text-destructive" : "bg-secondary text-muted-foreground"}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td className="p-4 text-center text-muted-foreground" colSpan={4}>
                      No submissions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 md:hidden">
            {filtered.map((row) => (
              <div key={row.id} className="glass-card p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{row.businessName}</h3>
                    <p className="text-xs text-muted-foreground">{new Date(row.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`inline-block rounded px-2 py-1 text-xs ${row.status === "approved" ? "bg-success/20 text-success" : row.status === "rejected" ? "bg-destructive/20 text-destructive" : "bg-secondary text-muted-foreground"}`}>
                    {row.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="text-foreground">{row.loanAmount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">City</p>
                    <p className="text-foreground">{row.city}</p>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="glass-card p-4 text-center text-muted-foreground">
                No submissions found
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
