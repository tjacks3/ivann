"use client";

import { useQuery } from "@tanstack/react-query";
import { getNotificationCount } from "@/app/(app)/notifications/actions";
import { useUser } from "@/hooks/use-user";

export function useNotificationCount() {
  const { isAuthenticated } = useUser();

  const { data } = useQuery({
    queryKey: ["notification-count"],
    queryFn: () => getNotificationCount(),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });

  return data ?? 0;
}
