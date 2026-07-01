import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Game } from "@/lib/types";

export function useGame(id: number) {
  return useQuery({
    queryKey: ["game", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Game;
    },
    enabled: !!id,
  });
}
