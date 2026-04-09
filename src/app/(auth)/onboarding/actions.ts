"use server";

import { getAuthUser } from "@/lib/auth/get-auth-user";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { redirect } from "next/navigation";
import type { UserRole } from "@/types";

/**
 * Find existing row by authId OR email, so we always update
 * rather than creating duplicates.
 */
async function findExistingProfile(authId: string, email: string) {
  const [row] = await db
    .select()
    .from(users)
    .where(or(eq(users.authId, authId), eq(users.email, email)))
    .limit(1);
  return row ?? null;
}

export async function loadDraft() {
  const user = await getAuthUser();
  const profile = await findExistingProfile(user.id, user.email!);
  return profile;
}

export async function saveDraft(data: {
  role?: UserRole;
  fullName?: string;
  username?: string;
  bio?: string;
  categories?: string[];
  location?: string;
  brandName?: string;
  contactName?: string;
  companyWebsite?: string;
  industry?: string;
  onboardingStep?: number;
}) {
  const user = await getAuthUser();
  const existing = await findExistingProfile(user.id, user.email!);

  try {
    if (existing) {
      await db
        .update(users)
        .set({
          authId: user.id, // claim this row for the current auth user
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existing.id));
    } else {
      await db.insert(users).values({
        authId: user.id,
        email: user.email!,
        ...data,
        updatedAt: new Date(),
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "";
    if (message.includes("users_username_unique")) {
      throw new Error("USERNAME_EXISTS");
    }
    throw err;
  }
}

export async function completeOnboarding(data: {
  role: UserRole;
  fullName?: string;
  username?: string;
  bio?: string;
  categories?: string[];
  location?: string;
  brandName?: string;
  contactName?: string;
  companyWebsite?: string;
  industry?: string;
}) {
  const user = await getAuthUser();
  const existing = await findExistingProfile(user.id, user.email!);

  const payload = {
    authId: user.id,
    email: user.email!,
    avatarUrl: user.user_metadata?.avatar_url ?? null,
    ...data,
    onboardingCompleted: true,
    onboardingStep: data.role === "brand" ? 2 : 4,
    updatedAt: new Date(),
  };

  try {
    if (existing) {
      await db
        .update(users)
        .set(payload)
        .where(eq(users.id, existing.id));
    } else {
      await db.insert(users).values(payload);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "";
    if (message.includes("users_username_unique")) {
      throw new Error("USERNAME_EXISTS");
    }
    throw err;
  }

  redirect(data.role === "brand" ? "/brand/dashboard" : "/creator/dashboard");
}
