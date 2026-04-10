"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchCreators } from "@/app/(marketing)/discover/actions";
import type { DiscoverFilters } from "@/lib/validations/discover";
import type { CreatorResult } from "@/app/(marketing)/discover/actions";

const DEFAULT_FILTERS: DiscoverFilters = {
  sort: "followers",
  page: 0,
};

export function useDiscover() {
  const [filters, setFilters] = useState<DiscoverFilters>({ ...DEFAULT_FILTERS });
  const [accumulated, setAccumulated] = useState<CreatorResult[]>([]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["discover", filters],
    queryFn: () => searchCreators(filters),
    staleTime: 60 * 1000,
  });

  // Accumulate results when data arrives
  useEffect(() => {
    if (!data) return;
    if ((filters.page ?? 0) === 0) {
      setAccumulated(data.creators);
    } else {
      setAccumulated((prev) => [...prev, ...data.creators]);
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateFilters = useCallback(
    (updates: Partial<DiscoverFilters>) => {
      setAccumulated([]);
      setFilters((prev) => ({ ...prev, ...updates, page: 0 }));
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setAccumulated([]);
    setFilters({ ...DEFAULT_FILTERS });
  }, []);

  const loadMore = useCallback(() => {
    setFilters((prev) => ({ ...prev, page: (prev.page ?? 0) + 1 }));
  }, []);

  const activeFilterCount = useMemo(() => {
    return [
      filters.keyword,
      filters.categories?.length,
      filters.platform,
      filters.followerMin,
      filters.followerMax,
      filters.location,
      filters.verifiedOnly,
    ].filter(Boolean).length;
  }, [filters]);

  return {
    creators: accumulated,
    total: data?.total ?? 0,
    hasMore: data?.hasMore ?? false,
    isLoading: isLoading && (filters.page ?? 0) === 0,
    isLoadingMore: isFetching && (filters.page ?? 0) > 0,
    filters,
    updateFilters,
    clearFilters,
    loadMore,
    activeFilterCount,
  };
}
