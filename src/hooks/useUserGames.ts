import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/lib/auth-provider";
import type { Game } from "@/lib/types";
import { getMockUserGames, isSupabaseHealthy, markSupabaseFailed } from "@/lib/mock-db";

export interface UserGame {
  id: string;
  game_id: number;
  license_key: string;
  acquired_at: string;
  status: string;
  game: Game;
}

export function useUserGames() {
  const { user } = useAuthContext();

  return useQuery({
    queryKey: ["userGames", user?.id],
    queryFn: async () => {
      if (!isSupabaseHealthy()) {
        return getMockUserGames(user!.id);
      }
      try {
        const { data, error } = await supabase
          .from("user_games")
          .select("id, game_id, acquired_at, status, game:games(*)")
          .eq("user_id", user!.id)
          .order("acquired_at", { ascending: false });
        if (error) throw error;
        return data as unknown as UserGame[];
      } catch (err) {
        markSupabaseFailed();
        return getMockUserGames(user!.id);
      }
    },
    enabled: !!user,
  });
}

