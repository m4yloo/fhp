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
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        long_description: data.long_description || "",
        sys_requirements_min: data.sys_requirements_min || {},
        sys_requirements_rec: data.sys_requirements_rec || {},
      } as Game;
    },
    enabled: Number.isFinite(id),
  });
}
