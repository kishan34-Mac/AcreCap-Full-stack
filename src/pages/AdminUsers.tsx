import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Centralized API base to target production backend
const API_BASE_RAW = (import.meta.env.VITE_BACKEND_URL as string | undefined)?.trim() || "https://acrecap-full-stack.onrender.com";
const API_BASE_NO_SLASH = API_BASE_RAW.replace(/\/+$/, "");
const API_BASE = API_BASE_NO_SLASH.endsWith("/api") ? API_BASE_NO_SLASH : `${API_BASE_NO_SLASH}/api`;
const apiUrl = (path: string) => {
  const p = path.replace(/^\/+/, "");
  return `${API_BASE}/${p}`;
};

interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: "user" | "admin";
}

export default function AdminUsers() {
  const { toast } = useToast();
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token ?? (sessionData.session as any)?.access_token;
        if (!token) throw new Error("not_authenticated");
        const res = await fetch(apiUrl("users/me"), { headers: { Authorization: `Bearer ${token}` } });
        const json = await res.json();
        const me = json?.profile as ProfileRow | null;
        if (!me || me.role !== "admin") {
          toast({ title: "Access denied", description: "You are not authorized to view this page.", variant: "destructive" });
          setLoading(false);
          return;
        }
        // Fetch all profiles
        const { data, error } = await (supabase as any)
          .from("profiles")
          .select("id,email,full_name,phone,role")
          .order("email", { ascending: true });
        if (error) throw error;
        if (!mounted) return;
        setRows((data || []) as ProfileRow[]);
      } catch (e: any) {
        toast({ title: "Failed to load users", description: e?.message || "Please try again.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [toast]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(r => {
      if (!q) return true;
      const hay = `${r.email ?? ""} ${r.full_name ?? ""} ${r.phone ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, search]);

  const updateRole = async (user_id: string, role: "user" | "admin") => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token ?? (sessionData.session as any)?.access_token;
      if (!token) throw new Error("not_authenticated");
      const res = await fetch(apiUrl("users/role"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id, role }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || `Update failed (${res.status})`);
      toast({ title: "Role updated", description: `User role changed to ${role}.` });
      setRows(prev => prev.map(r => r.id === user_id ? { ...r, role } : r));
    } catch (e: any) {
      toast({ title: "Update failed", description: e?.message || "Unable to change role.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <Layout>
        <section className="section-padding">
          <div className="container-custom">
            <div className="glass-card p-6">
              <div className="animate-pulse text-muted-foreground">Loading users…</div>
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
            <h1 className="text-2xl font-bold">Admin: Users</h1>
            <Input placeholder="Search by email, name, phone" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="glass-card p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-border">
                  <th className="p-3">Email</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="p-3">{r.email}</td>
                    <td className="p-3">{r.full_name || "-"}</td>
                    <td className="p-3">{r.phone || "-"}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${r.role === 'admin' ? 'bg-success/20 text-success' : 'bg-secondary text-muted-foreground'}`}>{r.role}</span>
                    </td>
                    <td className="p-3 flex flex-wrap gap-2">
                      {/* Hide destructive admin controls when viewing admin rows */}
                      {r.role !== 'admin' && (
                        <Button size="sm" variant="accent" onClick={() => updateRole(r.id, 'admin')}>
                          Promote to Admin
                        </Button>
                      )}
                      {/* Intentionally no Demote/Delete button for admin users */}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td className="p-4 text-center text-muted-foreground" colSpan={5}>No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </Layout>
  );
}