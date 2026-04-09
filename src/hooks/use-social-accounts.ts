"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSocialAccounts } from "@/app/(app)/settings/socials/actions";

export function useSocialAccounts() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["social-accounts"],
    queryFn: () => getSocialAccounts(),
    staleTime: 2 * 60 * 1000,
  });

  const refetch = () =>
    queryClient.invalidateQueries({ queryKey: ["social-accounts"] });

  return {
    accounts: data ?? [],
    isLoading,
    error,
    refetch,
  };
}
