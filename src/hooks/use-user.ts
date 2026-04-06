"use client";

import type { UserRole } from "@/types";

export interface AppUser {
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
}

/**
 * Stub hook for user authentication state.
 * Replace with real Supabase auth when ready.
 */
export function useUser(): { user: AppUser | null; isLoading: boolean } {
  // TODO: Replace with Supabase auth
  const user: AppUser | null = null;
  return { user, isLoading: false };
}
