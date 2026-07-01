import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Game } from "@/lib/types";

export function useGames() {
  return useQuery({
    queryKey: ["games"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .order("id", { ascending: true });
      if (error) throw error;
      return data as Game[];
    },
  });
}
