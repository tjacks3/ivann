"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getNotifications } from "@/app/(app)/notifications/actions";
import { useUser } from "@/hooks/use-user";

export function useNotifications() {
  const { isAuthenticated } = useUser();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });

  const refetch = () =>
    queryClient.invalidateQueries({ queryKey: ["notifications"] });

  return {
    notifications: data ?? [],
    isLoading,
    refetch,
  };
}
