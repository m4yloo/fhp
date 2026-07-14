import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/lib/auth-provider";

export interface Transaction {
  id: string;
  user_id: string;
  type: string;
  item: string;
  amount: string;
  status: string;
  hash: string;
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
