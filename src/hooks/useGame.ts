import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Game } from "@/lib/types";
import { getMockGame, isSupabaseHealthy, markSupabaseFailed } from "@/lib/mock-db";

export function useGame(id: number) {
  return useQuery({
    queryKey: ["game", id],
    queryFn: async () => {
      if (!isSupabaseHealthy()) {
        return getMockGame(id);
      }
      try {
        const { data, error } = await supabase
          .from("games")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;
        if (!data) return getMockGame(id);

        return {
          ...data,
          long_description: data.long_description || data.longDescription || "",
          sys_requirements_min: data.sys_requirements_min || data.sysRequirementsMin || {},
          sys_requirements_rec: data.sys_requirements_rec || data.sysRequirementsRec || {},
        } as Game;
      } catch (err) {
        markSupabaseFailed();
        return getMockGame(id);
      }
    },
    enabled: Number.isFinite(id),
  });
}

