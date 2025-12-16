import { useEffect, useMemo, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { logActivity } from '@/lib/sync';

// CSV headers for dashboard export
const CSV_HEADERS = [
  'ID','Created','Name','Mobile','Email','City','Business Name','Business Type','Annual Turnover','Years In Business','Loan Amount','Loan Purpose','Tenure','PAN','GST','Status','User ID'
];
const escapeCsv = (v: any) => {
  const s = String(v ?? '');
  const needsQuote = /[",\n]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuote ? `"${escaped}"` : escaped;
};
const rowsToCsv = (rows: SubmissionRow[]) => {
  const header = CSV_HEADERS.map(escapeCsv).join(',');
  const lines = rows.map(r => [
    r.id,
    r.created_at,
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
    r.status,
    r.user_id ?? '',
  ].map(escapeCsv).join(',')).join('\n');
  return `${header}\n${lines}`;
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

export default function Dashboard() {
  const { toast } = useToast();
  const [rows, setRows] = useState<SubmissionRow[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all'|'pending'|'approved'|'rejected'>('all');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let channel: any;
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user?.id || null;
      setUserId(uid);
      if (!uid) {
        toast({ title: 'Not signed in', description: 'Please sign in to view your dashboard.', variant: 'destructive' });
        setLoading(false);
        return;
      }
      await logActivity('dashboard_open');
      const { data, error } = await (supabase as any)
        .from('submissions')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });
      if (!mounted) return;
      if (error) {
        const msg = error.message || '';
        toast({ title: 'Error', description: msg, variant: 'destructive' });
      } else {
        setRows((data || []) as SubmissionRow[]);
      }
      setLoading(false);

      // Optional realtime updates for this user's submissions
      try {
        channel = (supabase as any)
          .channel('submissions-user-' + uid)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions', filter: `user_id=eq.${uid}` }, async () => {
            const { data: latest } = await (supabase as any)
              .from('submissions')
              .select('*')
              .eq('user_id', uid)
              .order('created_at', { ascending: false });
            if (mounted && latest) setRows(latest as SubmissionRow[]);
          })
          .subscribe();
      } catch {}
    };
    load();
    return () => {
      mounted = false;
      if (channel) (supabase as any).removeChannel(channel);
    };
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

  const statusLabel = (s: SubmissionRow['status']) => s === 'approved' ? 'accepted' : s;



  const handleExportCsv = () => {
    const csv = rowsToCsv(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submissions_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Layout>
        <div className="section-padding"><div className="container-custom"><div className="animate-pulse text-muted-foreground">Loading...</div></div></div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="section-padding">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">My Dashboard</h1>
            <div className="flex gap-2">
              <Button variant="accent" asChild><Link to="/apply">New Application</Link></Button>
             
              <Button variant="outline" onClick={handleExportCsv}>Export CSV</Button>
            </div>
          </div>

          <div className="glass-card p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input placeholder="Search by name, email, mobile, city, amount" value={search} onChange={e => setSearch(e.target.value)} />
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
                  <th className="p-3">City</th>
                  <th className="p-3">Business</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="p-3">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="p-3">{r.city}</td>
                    <td className="p-3">{r.businessName}</td>
                    <td className="p-3">{r.loanAmount}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${r.status === 'approved' ? 'bg-success/20 text-success' : r.status === 'rejected' ? 'bg-destructive/20 text-destructive' : 'bg-secondary text-muted-foreground'}`}>{statusLabel(r.status)}</span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td className="p-4 text-center text-muted-foreground" colSpan={5}>No submissions found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </Layout>
  );
}