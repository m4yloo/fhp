import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/lib/auth-provider";
import { mockClaimGame, isSupabaseHealthy, markSupabaseFailed } from "@/lib/mock-db";

export function useClaimGame() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gameId: number) => {
      if (!isSupabaseHealthy()) {
        return mockClaimGame(user!.id, gameId);
      }
      try {
        const { data, error } = await supabase.rpc("claim_game", {
          requested_game_id: gameId,
        });

        if (error) throw error;
        return data;
      } catch (err) {
        markSupabaseFailed();
        return mockClaimGame(user!.id, gameId);
      }
    },
    onSuccess: (_data, gameId) => {
      queryClient.invalidateQueries({ queryKey: ["activePass", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["userGames", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["game", gameId] });
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });
}

