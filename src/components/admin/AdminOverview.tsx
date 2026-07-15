import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  Users,
  Gamepad2,
  CreditCard,
  Clock,
  BarChart3,
  TrendingUp,
  ShoppingBag,
  UserPlus,
} from "lucide-react";
import type { AdminStats } from "./types";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-card border border-border/50 rounded-xl p-5 flex items-center gap-4 hover:border-border/80 transition-colors">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold text-foreground font-mono tabular-nums">
          {value.toLocaleString()}
        </div>
        <div className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">
          {label}
        </div>
        {subtitle && (
          <div className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminOverview() {
  const { data: stats } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async (): Promise<AdminStats> => {
      const [users, games, requests, passes, userGames, transactions, recentUsers] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("games").select("id", { count: "exact", head: true }),
        supabase.from("pass_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("user_passes").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("user_games").select("id", { count: "exact", head: true }),
        supabase.from("transactions").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 7 * 86_400_000).toISOString()),
      ]);
      return {
        totalUsers: users.count ?? 0,
        totalGames: games.count ?? 0,
        pendingRequests: requests.count ?? 0,
        activePasses: passes.count ?? 0,
        totalUserGames: userGames.count ?? 0,
        totalTransactions: transactions.count ?? 0,
        recentUsers: recentUsers.count ?? 0,
      };
    },
  });

  const { data: recentActivity = [] } = useQuery({
    queryKey: ["adminRecentActivity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: recentPassRequests = [] } = useQuery({
    queryKey: ["adminRecentPassRequests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pass_requests")
        .select("*, profiles:user_id(username)")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });

  const typeLabels: Record<string, string> = {
    game_claim: "Získanie hry",
    pass_purchase: "Nákup pasu",
    pass_renewal: "Obnovenie pasu",
    pass_upgrade: "Upgrade pasu",
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Používatelia"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          color="bg-primary/10 text-primary"
          subtitle={`+${stats?.recentUsers ?? 0} tento týždeň`}
        />
        <StatCard
          label="Hier v katalógu"
          value={stats?.totalGames ?? 0}
          icon={Gamepad2}
          color="bg-emerald-500/10 text-emerald-400"
        />
        <StatCard
          label="Aktívne pasy"
          value={stats?.activePasses ?? 0}
          icon={CreditCard}
          color="bg-sky-500/10 text-sky-400"
        />
        <StatCard
          label="Čakajúce žiadosti"
          value={stats?.pendingRequests ?? 0}
          icon={Clock}
          color="bg-amber-500/10 text-amber-400"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Hier v knižniciach"
          value={stats?.totalUserGames ?? 0}
          icon={ShoppingBag}
          color="bg-violet-500/10 text-violet-400"
        />
        <StatCard
          label="Transakcie"
          value={stats?.totalTransactions ?? 0}
          icon={BarChart3}
          color="bg-rose-500/10 text-rose-400"
        />
        <StatCard
          label="Noví používatelia"
          value={stats?.recentUsers ?? 0}
          icon={UserPlus}
          color="bg-teal-500/10 text-teal-400"
          subtitle="za 7 dní"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border/40 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Posledné žiadosti o pasy</h3>
          </div>
          <div className="divide-y divide-border/30">
            {recentPassRequests.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground font-mono">
                Žiadne žiadosti
              </div>
            ) : (
              recentPassRequests.map((req: any) => (
                <div key={req.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {req.profiles?.username ?? req.user_id.slice(0, 8)}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {req.pass_type === "unlimited" ? "Neobmedzený" : "Limitovaný"} · {new Date(req.created_at).toLocaleDateString("sk-SK")}
                    </div>
                  </div>
                  <StatusDot status={req.status} />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border/40 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Posledné transakcie</h3>
          </div>
          <div className="divide-y divide-border/30">
            {recentActivity.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground font-mono">
                Žiadne transakcie
              </div>
            ) : (
              recentActivity.map((tx: any) => (
                <div key={tx.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {tx.description}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {typeLabels[tx.transaction_type] ?? tx.transaction_type} · {new Date(tx.created_at).toLocaleDateString("sk-SK")}
                    </div>
                  </div>
                  {tx.amount != null && (
                    <span className="text-xs font-mono font-bold text-foreground shrink-0">
                      {tx.amount > 0 ? "+" : ""}{tx.amount}€
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-amber-400",
    approved: "bg-emerald-400",
    rejected: "bg-red-400",
    cancelled: "bg-muted-foreground",
  };
  const labels: Record<string, string> = {
    pending: "Čakajúca",
    approved: "Schválená",
    rejected: "Zamietnutá",
    cancelled: "Zrušená",
  };
  return (
    <span className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground shrink-0">
      <span className={`w-1.5 h-1.5 rounded-full ${colors[status] ?? "bg-muted-foreground"}`} />
      {labels[status] ?? status}
    </span>
  );
}
