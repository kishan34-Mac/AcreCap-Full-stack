import { supabase } from '@/integrations/supabase/client';

export interface SyncResult {
  inserted: number;
  errors: number;
  mappedIds: Record<string, string>; // local_id -> server_uuid
}

// Reads local submissions and attempts to insert any local_* entries into DB.
// Returns a summary and updates localStorage by removing successfully synced local entries.
export async function syncLocalSubmissionsToDB(): Promise<SyncResult> {
  const res: SyncResult = { inserted: 0, errors: 0, mappedIds: {} };
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user?.id || null;
    const storeKey = 'localSubmissions';
    let store: Record<string, any> = {};
    try { store = JSON.parse(localStorage.getItem(storeKey) || '{}'); } catch {}
    const entries = Object.values(store || {}) as any[];
    const locals = entries.filter((e) => typeof e?.id === 'string' && e.id.startsWith('local_'));
    for (const sub of locals) {
      try {
        const payload = {
          // server will assign uuid id
          created_at: sub.created_at,
          user_id: uid,
          name: sub.name,
          mobile: sub.mobile,
          email: sub.email,
          city: sub.city,
          businessName: sub.businessName,
          businessType: sub.businessType,
          annualTurnover: sub.annualTurnover,
          yearsInBusiness: sub.yearsInBusiness,
          loanAmount: sub.loanAmount,
          loanPurpose: sub.loanPurpose,
          tenure: sub.tenure,
          panNumber: sub.panNumber ?? null,
          gstNumber: sub.gstNumber ?? null,
          status: sub.status ?? 'pending',
        };
        const { data, error } = await (supabase as any)
          .from('submissions')
          .insert(payload)
          .select('*')
          .maybeSingle();
        if (error) throw error;
        if (data?.id) {
          res.inserted += 1;
          res.mappedIds[sub.id] = data.id as string;
          // remove local entry after successful sync to avoid duplicates
          delete store[sub.id];
        }
      } catch (_e) {
        res.errors += 1;
      }
    }
    // persist updated store
    localStorage.setItem(storeKey, JSON.stringify(store));
  } catch (_e) {
    // fail silently; res will show zero
  }
  return res;
}

export async function logActivity(action: string, data: Record<string, any> = {}) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user?.id || null;
    await (supabase as any)
      .from('activity_logs')
      .insert({ action, data, user_id: uid })
      .select('*');
  } catch (_e) {
    // best-effort; ignore errors
  }
}

export async function backupSnapshot(submissions: any[]) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user?.id || null;
    await (supabase as any)
      .from('backups')
      .insert({ snapshot: submissions, item_count: submissions.length, created_by: uid })
      .select('*');
  } catch (_e) {
    // best-effort
  }
}