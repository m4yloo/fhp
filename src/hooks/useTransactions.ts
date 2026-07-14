import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/lib/auth-provider";

export interface Transaction {
  id: string;
  user_id: string;
  game_id: number | null;
  pass_id: string | null;
  transaction_type: "pass_purchase" | "game_claim" | "pass_renewal" | "pass_upgrade";
  amount: number | null;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export function useTransactions() {
  const { user } = useAuthContext();

  return useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as Transaction[];
    },
    enabled: !!user,
  });
}
