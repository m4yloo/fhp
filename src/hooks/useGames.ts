import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Game } from "@/lib/types";

const PAGE_SIZE = 1000;

export function useGames() {
  return useInfiniteQuery({
    queryKey: ["games"],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("games")
        .select("*")
        .order("title")
        .range(from, to);

      if (error) throw error;
      return (data ?? []) as Game[];
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length : undefined;
    },
    initialPageParam: 0,
  });
}
