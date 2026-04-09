"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBrandProfile } from "@/app/(app)/brand/profile/actions";

export function useBrandProfile() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["brand-profile"],
    queryFn: () => getBrandProfile(),
    staleTime: 2 * 60 * 1000,
  });

  const refetch = () =>
    queryClient.invalidateQueries({ queryKey: ["brand-profile"] });

  return {
    profile: data ?? null,
    isLoading,
    error,
    refetch,
  };
}
