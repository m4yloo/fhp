import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/lib/auth-provider";
import { isSupabaseHealthy, markSupabaseFailed } from "@/lib/mock-db";

export interface Profile {
  id: string;
  username: string;
  created_at: string;
}

export function useProfile() {
  const { user } = useAuthContext();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!isSupabaseHealthy()) {
        return {
          id: user!.id,
          username: user!.user_metadata?.username || "bean_enjoyer",
          created_at: user!.created_at
        } as Profile;
      }
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user!.id)
          .single();
        if (error) throw error;
        return data as Profile;
      } catch (err) {
        markSupabaseFailed();
        return {
          id: user!.id,
          username: user!.user_metadata?.username || "bean_enjoyer",
          created_at: user!.created_at
        } as Profile;
      }
    },
    enabled: !!user,
  });
}

