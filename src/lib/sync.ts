import { apiFetch } from "@/lib/api";

export async function logActivity(action: string, data: Record<string, any> = {}) {
  try {
    await apiFetch("activity", {
      method: "POST",
      body: JSON.stringify({ action, data }),
    });
  } catch (_e) {
    // best-effort; ignore errors
  }
}

export async function backupSnapshot(submissions: any[]) {
  return submissions;
}
