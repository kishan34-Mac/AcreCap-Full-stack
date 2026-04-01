import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { logActivity } from "@/lib/sync";
import {
  apiFetch,
  getSubmissionPrimaryLabel,
  getSubmissionPrimaryValue,
  getSubmissionTitle,
  getSubmissionTypeLabel,
  type Submission,
} from "@/lib/api";

const CSV_HEADERS = [
  "ID",
  "Created",
  "Application Type",
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
  "Insurance Category",
  "Insurance Plan",
  "Coverage Amount",
  "Policy Term",
  "Insurance Purpose",
  "Existing Policy Provider",
  "Notes",
  "PAN",
  "GST",
  "Status",
];

const escapeCsv = (v: unknown) => {
  const s = String(v ?? "");
  const needsQuote = /[",\n]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuote ? `"${escaped}"` : escaped;
};

const statusClassName = (status: Submission["status"]) =>
  status === "approved"
    ? "bg-success/20 text-success"
    : status === "rejected"
    ? "bg-destructive/20 text-destructive"
    : "bg-secondary text-muted-foreground";

export default function Dashboard() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Submission[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "loan" | "insurance">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        await logActivity("dashboard_open");
        const { submissions } = await apiFetch<{ submissions: Submission[] }>("submissions", {
          method: "GET",
        });
        if (mounted) setRows(submissions);
      } catch (error: any) {
        toast({
          title: "Failed to load dashboard",
          description: error?.message || "Please try again.",
          variant: "destructive",
        });
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
      if (typeFilter !== "all" && r.applicationType !== typeFilter) return false;
      if (!q) return true;

      const hay = [
        r.name,
        r.email,
        r.mobile,
        r.city,
        r.businessName,
        r.loanAmount,
        r.loanPurpose,
        r.insuranceCategory,
        r.insurancePlan,
        r.coverageAmount,
        r.insurancePurpose,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }, [rows, search, statusFilter, typeFilter]);

  const handleExportCsv = () => {
    const header = CSV_HEADERS.map(escapeCsv).join(",");
    const lines = filtered.map((r) =>
      [
        r.id,
        r.createdAt,
        r.applicationType,
        r.name,
        r.mobile,
        r.email,
        r.city,
        r.businessName ?? "",
        r.businessType ?? "",
        r.annualTurnover ?? "",
        r.yearsInBusiness ?? "",
        r.loanAmount ?? "",
        r.loanPurpose ?? "",
        r.tenure ?? "",
        r.insuranceCategory ?? "",
        r.insurancePlan ?? "",
        r.coverageAmount ?? "",
        r.policyTerm ?? "",
        r.insurancePurpose ?? "",
        r.existingPolicyProvider ?? "",
        r.notes ?? "",
        r.panNumber ?? "",
        r.gstNumber ?? "",
        r.status,
      ]
        .map(escapeCsv)
        .join(",")
    );

    const blob = new Blob([[header, ...lines].join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
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

          <div className="glass-card mb-6 grid grid-cols-1 gap-4 p-4 md:grid-cols-4">
            <Input
              placeholder="Search by name, city, type, amount"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="rounded-md border border-border bg-background p-2 text-sm"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
            >
              <option value="all">All Types</option>
              <option value="loan">Loan</option>
              <option value="insurance">Insurance</option>
            </select>
            <select
              className="rounded-md border border-border bg-background p-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setTypeFilter("all");
              }}
            >
              Reset
            </Button>
          </div>

          <div className="hidden overflow-x-auto glass-card p-0 md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="p-3">Created</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Product</th>
                  <th className="p-3">Primary</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-b border-border/50">
                    <td className="p-3">{new Date(row.createdAt).toLocaleString()}</td>
                    <td className="p-3">{getSubmissionTypeLabel(row)}</td>
                    <td className="p-3">{getSubmissionTitle(row)}</td>
                    <td className="p-3">
                      <div className="font-medium">{getSubmissionPrimaryValue(row)}</div>
                      <div className="text-xs text-muted-foreground">
                        {getSubmissionPrimaryLabel(row)}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`inline-block rounded px-2 py-1 text-xs ${statusClassName(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td className="p-4 text-center text-muted-foreground" colSpan={5}>
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
                    <h3 className="font-semibold text-foreground">{getSubmissionTitle(row)}</h3>
                    <p className="text-xs text-muted-foreground">
                      {getSubmissionTypeLabel(row)} • {new Date(row.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`inline-block rounded px-2 py-1 text-xs ${statusClassName(row.status)}`}>
                    {row.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">{getSubmissionPrimaryLabel(row)}</p>
                    <p className="text-foreground">{getSubmissionPrimaryValue(row)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Applicant</p>
                    <p className="text-foreground">{row.name}</p>
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
