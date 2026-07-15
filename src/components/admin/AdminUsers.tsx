import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Search, Shield, User, ChevronRight } from "lucide-react";
import { AdminUserModal } from "./AdminUserModal";
import type { AdminUser } from "./types";

export function AdminUsers() {
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AdminUser[];
    },
  });

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <Input
          placeholder="Hľadať podľa mena alebo ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 bg-card border-border/60 text-xs font-mono focus-visible:ring-primary rounded-xl"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm font-mono">
          Žiadni používatelia.
        </div>
      ) : (
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  <th className="text-left px-4 py-3">Používateľ</th>
                  <th className="text-left px-4 py-3">Rola</th>
                  <th className="text-left px-4 py-3">Registrovaný</th>
                  <th className="text-right px-4 py-3 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    className="border-b border-border/20 last:border-0 hover:bg-primary/5 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-[11px] font-bold text-primary font-mono shrink-0">
                          {u.username[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                            {u.username}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono truncate">
                            {u.id.slice(0, 12)}…
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {u.admin_role ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Shield className="w-2.5 h-2.5" />
                          Admin
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-muted-foreground">
                          Používateľ
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-muted-foreground font-mono">
                      {new Date(u.created_at).toLocaleDateString("sk-SK")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedUserId && (
        <AdminUserModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
}
