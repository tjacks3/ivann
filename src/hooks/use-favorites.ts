"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyFavoriteIds, getMyFavorites, toggleFavorite } from "@/app/(app)/favorites/actions";
import { useUser } from "@/hooks/use-user";

export function useFavoriteIds() {
  const { user, isAuthenticated } = useUser();
  const isBrand = isAuthenticated && user?.role === "brand";

  const { data } = useQuery({
    queryKey: ["favorite-ids"],
    queryFn: () => getMyFavoriteIds(),
    enabled: isBrand,
    staleTime: 60 * 1000,
  });

  return new Set(data ?? []);
}

export function useFavorites() {
  const { user, isAuthenticated } = useUser();
  const isBrand = isAuthenticated && user?.role === "brand";
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => getMyFavorites(),
    enabled: isBrand,
    staleTime: 60 * 1000,
  });

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ["favorites"] });
    queryClient.invalidateQueries({ queryKey: ["favorite-ids"] });
  };

  return {
    favorites: data ?? [],
    isLoading,
    refetch,
  };
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useCallback(
    async (creatorId: string) => {
      const result = await toggleFavorite(creatorId);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["favorite-ids"] });
        queryClient.invalidateQueries({ queryKey: ["favorites"] });
      }
      return result;
    },
    [queryClient],
  );
}
