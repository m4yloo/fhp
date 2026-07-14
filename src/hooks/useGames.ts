import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Game } from "@/lib/types";
import { getMockGames, isSupabaseHealthy, markSupabaseFailed } from "@/lib/mock-db";

export function useGames() {
  return useQuery({
    queryKey: ["games"],
    queryFn: async () => {
      // Force mock data for now since Supabase is not configured
      console.log("Using mock games data");
      return getMockGames();
    },
  });
}

