import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAuthContext } from "@/lib/auth-provider";
import { AdminSkeleton } from "@/components/skeletons";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminRequests } from "@/components/admin/AdminRequests";
import { AdminGames } from "@/components/admin/AdminGames";
import {
  Shield,
  LayoutDashboard,
  Users,
  CreditCard,
  Gamepad2,
  RefreshCw,
} from "lucide-react";

const TABS = [
  { id: "overview" as const, label: "Prehľad", icon: LayoutDashboard },
  { id: "users" as const, label: "Používatelia", icon: Users },
  { id: "requests" as const, label: "Žiadosti", icon: CreditCard },
  { id: "games" as const, label: "Hry", icon: Gamepad2 },
];

export default function Admin() {
  const { user } = useAuthContext();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"overview" | "users" | "requests" | "games">("overview");

  if (adminLoading) {
    return <AdminSkeleton />;
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Shield className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">Prístup zamietnutý</h1>
        <p className="text-sm text-muted-foreground">
          Nemáte oprávnenie na prístup k tomuto panelu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-primary uppercase tracking-widest mb-2">
            <Shield className="w-3.5 h-3.5" />
            Administrácia
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>
        </div>
        <button
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["adminStats"] })
          }
          className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground border border-border/50 rounded-lg px-3 py-2 hover:bg-card/60 transition-all"
        >
          <RefreshCw className="w-3 h-3" />
          Obnoviť
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border/40">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-mono transition-all border-b-2 -mb-px ${
              tab === id
                ? "text-primary border-primary font-semibold"
                : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && <AdminOverview />}
      {tab === "users" && <AdminUsers />}
      {tab === "requests" && <AdminRequests />}
      {tab === "games" && <AdminGames />}
    </div>
  );
}
