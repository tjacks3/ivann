"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { redirect } from "next/navigation";
import type { UserRole } from "@/types";

export async function createProfile(role: UserRole) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await db
    .insert(users)
    .values({
      authId: user.id,
      email: user.email!,
      fullName: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? null,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
      role,
    })
    .onConflictDoNothing();

  redirect(role === "brand" ? "/brand/dashboard" : "/creator/profile");
}
