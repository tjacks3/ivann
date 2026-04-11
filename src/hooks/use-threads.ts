"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyThreads } from "@/app/(app)/messages/actions";

export function useThreads() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["threads"],
    queryFn: () => getMyThreads(),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });

  const refetch = () =>
    queryClient.invalidateQueries({ queryKey: ["threads"] });

  return {
    threads: data ?? [],
    isLoading,
    error,
    refetch,
  };
}
