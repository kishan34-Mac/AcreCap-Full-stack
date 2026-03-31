import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiFetch, type UserProfile } from "@/lib/api";

export default function AdminUsers() {
  const { toast } = useToast();
  const [rows, setRows] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { users } = await apiFetch<{ users: UserProfile[] }>("users", { method: "GET" });
        if (mounted) setRows(users);
      } catch (error: any) {
        toast({ title: "Failed to load users", description: error?.message || "Please try again.", variant: "destructive" });
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
    return rows.filter((r) => `${r.email} ${r.name} ${r.phone}`.toLowerCase().includes(q));
  }, [rows, search]);

  const updateRole = async (userId: string, role: "user" | "admin") => {
    try {
      const { profile } = await apiFetch<{ profile: UserProfile }>("users/role", {
        method: "POST",
        body: JSON.stringify({ userId, role }),
      });
      setRows((prev) => prev.map((row) => (row.id === userId ? profile : row)));
      toast({ title: "Role updated", description: `User role changed to ${role}.` });
    } catch (error: any) {
      toast({ title: "Update failed", description: error?.message || "Unable to change role.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <Layout>
        <section className="section-padding">
          <div className="container-custom">
            <div className="glass-card p-6">
              <div className="animate-pulse text-muted-foreground">Loading users...</div>
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
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="p-3">{r.email}</td>
                    <td className="p-3">{r.name || "-"}</td>
                    <td className="p-3">{r.phone || "-"}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${r.role === "admin" ? "bg-success/20 text-success" : "bg-secondary text-muted-foreground"}`}>
                        {r.role}
                      </span>
                    </td>
                    <td className="p-3 flex flex-wrap gap-2">
                      {r.role !== "admin" ? (
                        <Button size="sm" variant="accent" onClick={() => void updateRole(r.id, "admin")}>
                          Promote to Admin
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => void updateRole(r.id, "user")}>
                          Demote to User
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td className="p-4 text-center text-muted-foreground" colSpan={5}>
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </Layout>
  );
}
