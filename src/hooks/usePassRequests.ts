import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/lib/auth-provider";
import {
  getMockPassRequests,
  mockRequestPass,
  mockCancelPassRequest,
  isSupabaseHealthy,
  markSupabaseFailed
} from "@/lib/mock-db";

export interface PassRequest {
  id: string;
  user_id: string;
  pass_type: "limited" | "unlimited";
  status: "pending" | "approved" | "rejected" | "cancelled";
  created_at: string;
  updated_at: string;
}

export function usePassRequests() {
  const { user } = useAuthContext();

  return useQuery({
    queryKey: ["passRequests", user?.id],
    queryFn: async () => {
      if (!isSupabaseHealthy()) {
        return getMockPassRequests(user!.id);
      }
      try {
        const { data, error } = await supabase
          .from("pass_requests")
          .select("*")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return (data ?? []) as PassRequest[];
      } catch (err) {
        markSupabaseFailed();
        return getMockPassRequests(user!.id);
      }
    },
    enabled: !!user,
  });
}

export function useRequestPass() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (passType: "limited" | "unlimited") => {
      if (!isSupabaseHealthy()) {
        return mockRequestPass(user!.id, passType);
      }
      try {
        const { data, error } = await supabase.rpc("request_pass", {
          requested_pass_type: passType,
        });

        if (error) throw error;
        return data as PassRequest;
      } catch (err) {
        markSupabaseFailed();
        return mockRequestPass(user!.id, passType);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activePass", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["passRequests", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
    },
  });
}

export function useCancelPassRequest() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!isSupabaseHealthy()) {
        return mockCancelPassRequest(user!.id, id);
      }
      try {
        const { error } = await supabase
          .from("pass_requests")
          .update({ status: "cancelled" })
          .eq("id", id)
          .eq("user_id", user!.id)
          .eq("status", "pending");

        if (error) throw error;
      } catch (err) {
        markSupabaseFailed();
        return mockCancelPassRequest(user!.id, id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["passRequests", user?.id] });
    },
  });
}

