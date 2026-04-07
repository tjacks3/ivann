"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import type { UserRole } from "@/types";

export interface AppUser {
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
}

interface UseUserResult {
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useUser(): UseUserResult {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async (): Promise<{ appUser: AppUser | null; hasSession: boolean }> => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) return { appUser: null, hasSession: false };

      const { data: profile } = await supabase
        .from("users")
        .select("full_name, email, avatar_url, role")
        .eq("auth_id", authUser.id)
        .single();

      if (!profile) {
        // Authenticated but no profile yet (needs onboarding)
        return {
          appUser: {
            name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "",
            email: authUser.email || "",
            avatarUrl: authUser.user_metadata?.avatar_url ?? undefined,
            role: "creator",
          },
          hasSession: true,
        };
      }

      return {
        appUser: {
          name: profile.full_name || authUser.email?.split("@")[0] || "",
          email: profile.email,
          avatarUrl: profile.avatar_url ?? undefined,
          role: profile.role as UserRole,
        },
        hasSession: true,
      };
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    });
    return () => subscription.unsubscribe();
  }, [supabase, queryClient]);

  return {
    user: data?.appUser ?? null,
    isLoading,
    isAuthenticated: data?.hasSession ?? false,
  };
}
