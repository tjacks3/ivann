"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCreatorProfile } from "@/app/(app)/creator/profile/actions";

export function useCreatorProfile() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["creator-profile"],
    queryFn: () => getCreatorProfile(),
    staleTime: 2 * 60 * 1000,
  });

  const refetch = () =>
    queryClient.invalidateQueries({ queryKey: ["creator-profile"] });

  return {
    profile: data ?? null,
    isLoading,
    error,
    refetch,
  };
}
