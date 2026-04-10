"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyPackages } from "@/app/(app)/packages/actions";

export function usePackages() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["my-packages"],
    queryFn: () => getMyPackages(),
    staleTime: 2 * 60 * 1000,
  });

  const refetch = () =>
    queryClient.invalidateQueries({ queryKey: ["my-packages"] });

  return {
    packages: data ?? [],
    isLoading,
    error,
    refetch,
  };
}
