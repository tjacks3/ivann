"use client";

import { useQuery } from "@tanstack/react-query";
import { getUnreadCount } from "@/app/(app)/messages/actions";
import { useUser } from "@/hooks/use-user";

export function useUnreadCount() {
  const { isAuthenticated } = useUser();

  const { data } = useQuery({
    queryKey: ["unread-count"],
    queryFn: () => getUnreadCount(),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });

  return data ?? 0;
}
