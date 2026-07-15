import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
} from "lucide-react";
import type { AdminPassRequest } from "./types";

type StatusFilter = "all" | "pending" | "approved" | "rejected" | "cancelled";

export function AdminRequests() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["adminPassRequests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pass_requests")
        .select("*, profiles:user_id(username)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AdminPassRequest[];
    },
  });

  const updateRequest = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const { error } = await supabase
        .from("pass_requests")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPassRequests"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
  });

  const filtered = requests.filter((req) => {
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    const matchesSearch =
      !search ||
      (req.profiles?.username ?? "").toLowerCase().includes(search.toLowerCase()) ||
      req.user_id.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
    cancelled: requests.filter((r) => r.status === "cancelled").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            placeholder="Hľadať podľa mena alebo ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-card border-border/60 text-xs font-mono focus-visible:ring-primary rounded-xl"
          />
        </div>
        <div className="flex gap-1 bg-card border border-border/60 rounded-xl p-1">
          {(["all", "pending", "approved", "rejected", "cancelled"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-[10px] font-mono rounded-lg transition-all ${
                statusFilter === s
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "all" ? "Všetky" : s === "pending" ? "Čakajúce" : s === "approved" ? "Schválené" : s === "rejected" ? "Zamietnuté" : "Zrušené"}
              {statusCounts[s] > 0 && (
                <span className="ml-1 text-[9px] opacity-60">({statusCounts[s]})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm font-mono">
          Žiadne žiadosti.
        </div>
      ) : (
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  <th className="text-left px-4 py-3">Používateľ</th>
                  <th className="text-left px-4 py-3">Typ pasu</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Dátum</th>
                  <th className="text-right px-4 py-3">Akcie</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((req) => (
                  <tr
                    key={req.id}
                    className="border-b border-border/20 last:border-0 hover:bg-card/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary font-mono shrink-0">
                          {(req.profiles?.username?.[0]?.toUpperCase() ?? "?")}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-foreground truncate">
                            {req.profiles?.username ?? "—"}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono truncate">
                            {req.user_id.slice(0, 12)}…
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        req.pass_type === "unlimited"
                          ? "bg-primary/10 text-primary"
                          : "bg-sky-500/10 text-sky-400"
                      }`}>
                        {req.pass_type === "unlimited" ? "Neobmedzený" : "Limitovaný"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-4 py-3 text-[11px] text-muted-foreground font-mono">
                      {new Date(req.created_at).toLocaleDateString("sk-SK")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {req.status === "pending" && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => updateRequest.mutate({ id: req.id, status: "approved" })}
                            disabled={updateRequest.isPending}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Schváliť
                          </button>
                          <button
                            onClick={() => updateRequest.mutate({ id: req.id, status: "rejected" })}
                            disabled={updateRequest.isPending}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
                          >
                            <XCircle className="w-3 h-3" />
                            Zamietnuť
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
    cancelled: "bg-muted text-muted-foreground border-border/40",
  };
  const labels: Record<string, string> = {
    pending: "Čakajúca",
    approved: "Schválená",
    rejected: "Zamietnutá",
    cancelled: "Zrušená",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${styles[status] ?? styles.pending}`}>
      {labels[status] ?? status}
    </span>
  );
}
