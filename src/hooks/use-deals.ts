"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyDeals, getDeal } from "@/app/(app)/deals/actions";

export function useMyDeals() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["deals"],
    queryFn: () => getMyDeals(),
    staleTime: 60 * 1000,
  });

  const refetch = () =>
    queryClient.invalidateQueries({ queryKey: ["deals"] });

  return {
    deals: data ?? [],
    isLoading,
    refetch,
  };
}

export function useDeal(dealId: string) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["deal", dealId],
    queryFn: () => getDeal(dealId),
    staleTime: 30 * 1000,
  });

  const refetch = () =>
    queryClient.invalidateQueries({ queryKey: ["deal", dealId] });

  return {
    deal: data ?? null,
    isLoading,
    refetch,
  };
}
