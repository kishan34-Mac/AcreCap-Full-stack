import { useEffect, useMemo, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { sendStatusEmail } from '@/lib/email';
import { logActivity } from '@/lib/sync';

// CSV headers for export
const CSV_HEADERS = ['ID','Created At','Status','Name','Mobile','Email','City','Business Name','Business Type','Annual Turnover','Years In Business','Loan Amount','Loan Purpose','Tenure','PAN','GST','User ID'];
const escapeCsv = (v: any) => {
  const s = String(v ?? '');
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
  businessName: string;
  businessType: string;
  annualTurnover: string;
  yearsInBusiness: string;
  loanAmount: string;
  loanPurpose: string;
  tenure: string;
  panNumber: string | null;
  gstNumber: string | null;
  status: 'pending' | 'approved' | 'rejected';
}

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS as string | undefined)?.split(',').map(e => e.trim().toLowerCase()).filter(Boolean) || [];

export default function Admin() {
  const { toast } = useToast();
  const [rows, setRows] = useState<SubmissionRow[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all'|'pending'|'approved'|'rejected'>('all');
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selected, setSelected] = useState<SubmissionRow | null>(null);

  // Export all rows to CSV and trigger download
  const exportCsv = () => {
    try {
      const header = CSV_HEADERS.map(escapeCsv).join(',');
      const lines = rows.map(r => [
        r.id,
        r.created_at,
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
        r.panNumber ?? '',
        r.gstNumber ?? '',
        r.user_id ?? ''
      ].map(escapeCsv).join(','));
      const csv = [header, ...lines].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `submissions_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      toast({ title: 'Export failed', description: 'Unable to generate CSV. Please try again.', variant: 'destructive' });
    }
  };
  // Helper: read local submissions as array
  const readLocalSubmissions = (): SubmissionRow[] => {
    try {
      const store = JSON.parse(localStorage.getItem('localSubmissions') || '{}');
      const localRows: SubmissionRow[] = Object.values(store || {}).map((v: any) => ({
        id: v.id,
        created_at: v.created_at,
        user_id: v.user_id ?? null,
        name: v.name,
        mobile: v.mobile,
        email: v.email,
        city: v.city,
        businessName: v.businessName,
        businessType: v.businessType,
        annualTurnover: v.annualTurnover,
        yearsInBusiness: v.yearsInBusiness,
        loanAmount: v.loanAmount,
        loanPurpose: v.loanPurpose,
        tenure: v.tenure,
        panNumber: v.panNumber ?? null,
        gstNumber: v.gstNumber ?? null,
        status: (v.status as SubmissionRow['status']) ?? 'pending',
      }));
      return localRows;
    } catch {
      return [];
    }
  };
  
  // Helper: fetch all submissions from DB using pagination to avoid default limits
  const fetchAllSubmissions = async (): Promise<SubmissionRow[]> => {
    const pageSize = 1000;
    let all: SubmissionRow[] = [];
    for (let page = 0; page < 100; page++) { // safety cap
      const from = page * pageSize;
      const to = from + pageSize - 1;
      const { data, error } = await (supabase as any)
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error) throw error;
      const batch = (data || []) as SubmissionRow[];
      all = all.concat(batch);
      if (batch.length < pageSize) break;
    }
    return all;
  };
  
  // Helper: merge DB and local lists (prefer DB for same IDs; include local_* always)
  const mergeSubmissions = (dbRows: SubmissionRow[], localRows: SubmissionRow[]): SubmissionRow[] => {
    const byId = new Map<string, SubmissionRow>();
    for (const r of dbRows) byId.set(r.id, r);
    for (const r of localRows) {
      if (!byId.has(r.id)) byId.set(r.id, r);
    }
    return Array.from(byId.values()).sort((a,b) => (a.created_at > b.created_at ? -1 : 1));
  };
  useEffect(() => {
    let mounted = true;
    let channel: any;
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const email = sessionData.session?.user?.email?.toLowerCase();
      if (!email || !ADMIN_EMAILS.includes(email)) {
        toast({ title: 'Access denied', description: 'You are not authorized to view this page.', variant: 'destructive' });
        setIsAuthorized(false);
        setLoading(false);
        return;
      }
      // Ensure admin email exists in admin_emails table for RLS-based privileges
      try {
        const { data: adminRow } = await (supabase as any)
          .from('admin_emails')
          .select('email')
          .eq('email', email)
          .maybeSingle();
        if (!adminRow) {
          await (supabase as any)
            .from('admin_emails')
            .insert({ email });
        }
      } catch (e) {
        // non-blocking if table/policy prevents insert; submission updates may still work depending on RLS
      }
      setIsAuthorized(true);
      try {
        const dbRows = await fetchAllSubmissions();
        if (!mounted) return;
        const merged = mergeSubmissions(dbRows, readLocalSubmissions());
        setRows(merged);
      } catch (e: any) {
        // Network or client error -> fallback to local only
        setRows(readLocalSubmissions());
        toast({ title: 'Loaded local data', description: 'Showing locally stored submissions until database is ready.' });
      }
      setLoading(false);

      // Realtime: subscribe to all changes in submissions for admin view
      try {
        channel = (supabase as any)
          .channel('submissions-admin')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, async () => {
            const latest = await fetchAllSubmissions();
            if (mounted) setRows(mergeSubmissions(latest, readLocalSubmissions()));
          })
          .subscribe();
      } catch {}
    };
    load();
    return () => { mounted = false; if (channel) (supabase as any).removeChannel(channel); };
  }, [toast]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(r => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (!q) return true;
      const hay = `${r.name} ${r.email} ${r.mobile} ${r.city} ${r.businessName} ${r.loanAmount}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, search, statusFilter]);

  const updateStatus = async (id: string, status: SubmissionRow['status']) => {
    if (id.startsWith('local_')) {
      try {
        const storeKey = 'localSubmissions';
        const store = (() => {
          try { return JSON.parse(localStorage.getItem(storeKey) || '{}'); } catch { return {}; }
        })();
        if (store[id]) {
          store[id].status = status;
          localStorage.setItem(storeKey, JSON.stringify(store));
          setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
          // Fire email notification (best-effort)
          const sub = store[id];
          sendStatusEmail({
            id: sub.id,
            name: sub.name,
            email: sub.email,
            mobile: sub.mobile,
            city: sub.city,
            businessName: sub.businessName,
            businessType: sub.businessType,
            loanAmount: sub.loanAmount,
            loanPurpose: sub.loanPurpose,
            tenure: sub.tenure,
            created_at: sub.created_at,
            status: status,
          }, status);
          toast({ title: 'Status updated', description: `Local submission marked as ${status}.` });
        } else {
          toast({ title: 'Not found', description: 'Local submission could not be found in storage.', variant: 'destructive' });
        }
      } catch {
        toast({ title: 'Update failed', description: 'Unable to update local submission.', variant: 'destructive' });
      }
      return;
    }
    const { error } = await (supabase as any)
      .from('submissions')
      .update({ status })
      .eq('id', id)
      .select('*');
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      return;
    }
    // Re-fetch minimal list to reflect any server-side defaults
    const { data: refreshed } = await (supabase as any)
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });
    setRows((refreshed || []).map((r: any) => r as SubmissionRow));
    // Send email for server-backed submission
    const sub = (refreshed || []).find((r: any) => r.id === id);
    if (sub) {
      sendStatusEmail({
        id: sub.id,
        name: sub.name,
        email: sub.email,
        mobile: sub.mobile,
        city: sub.city,
        businessName: sub.businessName,
        businessType: sub.businessType,
        loanAmount: sub.loanAmount,
        loanPurpose: sub.loanPurpose,
        tenure: sub.tenure,
        created_at: sub.created_at,
        status: status,
      }, status);
    }
    toast({ title: 'Status updated', description: `Submission marked as ${status}.` });
    await logActivity('admin_update_status', { id, status });
  };

  if (loading) {
    return (
      <Layout>
        <div className="section-padding"><div className="container-custom"><div className="animate-pulse text-muted-foreground">Loading...</div></div></div>
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
              <p className="text-muted-foreground mb-4">You are not authorized to view the admin panel.</p>
              <div className="flex gap-2">
                <Button asChild variant="accent"><Link to="/dashboard">Go to Dashboard</Link></Button>
                <Button asChild variant="outline"><Link to="/">Go Home</Link></Button>
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
            <Button variant="accent" onClick={exportCsv}>Export Data</Button>
          </div>
          <div className="glass-card p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input placeholder="Search by name, email, mobile, city, amount" value={search} onChange={e => setSearch(e.target.value)} />
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
            <Button variant="outline" onClick={() => { setSearch(''); setStatusFilter('all'); }}>Reset</Button>
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
                {filtered.map(r => (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="p-3">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="p-3">{r.name}</td>
                    <td className="p-3">{r.email}</td>
                    <td className="p-3">{r.mobile}</td>
                    <td className="p-3">{r.city}</td>
                    <td className="p-3">{r.loanAmount}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${r.status === 'approved' ? 'bg-success/20 text-success' : r.status === 'rejected' ? 'bg-destructive/20 text-destructive' : 'bg-secondary text-muted-foreground'}`}>{r.status}</span>
                    </td>
                    <td className="p-3 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelected(r)}>View</Button>
                      <Button size="sm" variant="accent" className="rounded-full" onClick={() => updateStatus(r.id, 'approved')}>Accept</Button>
                      <Button size="sm" variant="destructive" className="rounded-full" onClick={() => updateStatus(r.id, 'rejected')}>Reject</Button>
                      <Button size="sm" variant="secondary" className="rounded-full" onClick={() => updateStatus(r.id, 'pending')}>Reset</Button>
                      {r.id.startsWith('local_') && (<span className="text-[11px] text-muted-foreground">Local only</span>)}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td className="p-4 text-center text-muted-foreground" colSpan={8}>No submissions found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submission Details</DialogTitle>
                <DialogDescription>All user-provided information organized by section.</DialogDescription>
              </DialogHeader>

              {selected && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Basic Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div><span className="text-muted-foreground text-xs">Created</span><div className="font-medium">{new Date(selected.created_at).toLocaleString()}</div></div>
                      <div><span className="text-muted-foreground text-xs">Status</span><div className="font-medium">{selected.status}</div></div>
                      <div><span className="text-muted-foreground text-xs">Name</span><div className="font-medium">{selected.name}</div></div>
                      <div><span className="text-muted-foreground text-xs">Email</span><div className="font-medium">{selected.email}</div></div>
                      <div><span className="text-muted-foreground text-xs">Mobile</span><div className="font-medium">{selected.mobile}</div></div>
                      <div><span className="text-muted-foreground text-xs">City</span><div className="font-medium">{selected.city}</div></div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2">Business Info</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div><span className="text-muted-foreground text-xs">Business Name</span><div className="font-medium">{selected.businessName}</div></div>
                      <div><span className="text-muted-foreground text-xs">Business Type</span><div className="font-medium">{selected.businessType}</div></div>
                      <div><span className="text-muted-foreground text-xs">Annual Turnover</span><div className="font-medium">{selected.annualTurnover}</div></div>
                      <div><span className="text-muted-foreground text-xs">Years In Business</span><div className="font-medium">{selected.yearsInBusiness}</div></div>
                      <div><span className="text-muted-foreground text-xs">PAN</span><div className="font-medium">{selected.panNumber || '-'}</div></div>
                      <div><span className="text-muted-foreground text-xs">GST</span><div className="font-medium">{selected.gstNumber || '-'}</div></div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2">Loan Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div><span className="text-muted-foreground text-xs">Amount</span><div className="font-medium">{selected.loanAmount}</div></div>
                      <div><span className="text-muted-foreground text-xs">Purpose</span><div className="font-medium">{selected.loanPurpose}</div></div>
                      <div><span className="text-muted-foreground text-xs">Tenure</span><div className="font-medium">{selected.tenure}</div></div>
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