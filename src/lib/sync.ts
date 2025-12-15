import { supabase } from '@/integrations/supabase/client';

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