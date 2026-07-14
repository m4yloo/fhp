import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/lib/auth-provider";

export interface Pass {
  id: string;
  user_id: string;
  name: string;
  redemptions_total: number;
  redemptions_used: number;
  expires_at: string;
  status: "active" | "expired" | "revoked";
  created_at: string;
}

export function usePass() {
  const { user } = useAuthContext();

  return useQuery({
    queryKey: ["activePass", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("passes")
        .select("*")
        .eq("user_id", user!.id)
        .eq("status", "active")
        .gt("expires_at", new Date().toISOString())
        .order("expires_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Pass | null;
    },
    enabled: !!user,
  });
}
