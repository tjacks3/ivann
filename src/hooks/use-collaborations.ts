"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyCollaborations } from "@/app/(app)/collaborations/actions";

export function useCollaborations() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["collaborations"],
    queryFn: () => getMyCollaborations(),
    staleTime: 60 * 1000,
  });

  const refetch = () =>
    queryClient.invalidateQueries({ queryKey: ["collaborations"] });

  return {
    collaborations: data ?? [],
    isLoading,
    error,
    refetch,
  };
}
