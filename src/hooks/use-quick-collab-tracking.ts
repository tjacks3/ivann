"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQuickCollabTracking } from "@/app/(app)/brand/quick-deal/actions";

export function useQuickCollabTracking() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["quick-collab-tracking"],
    queryFn: () => getQuickCollabTracking(),
    staleTime: 60 * 1000,
  });

  const allOutreaches = data ?? [];

  const filtered = useMemo(() => {
    if (!statusFilter) return allOutreaches;
    return allOutreaches.filter((o) => o.effectiveStatus === statusFilter);
  }, [allOutreaches, statusFilter]);

  return {
    outreaches: filtered,
    allOutreaches,
    isLoading,
    statusFilter,
    setStatusFilter,
  };
}
