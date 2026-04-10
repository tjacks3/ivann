"use server";

import { getAuthUser } from "@/lib/auth/get-auth-user";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { creatorEditProfileSchema } from "@/lib/validations/profile";
import type { CreatorEditProfileValues } from "@/lib/validations/profile";
import type { ProfileStatus } from "@/types";

export async function getCreatorProfile() {
  const authUser = await getAuthUser();

  const profile = await db.query.users.findFirst({
    where: eq(users.authId, authUser.id),
    with: {
      socialAccounts: true,
      packages: true,
    },
  });

  return profile ?? null;
}

export async function updateCreatorProfile(data: CreatorEditProfileValues) {
  const authUser = await getAuthUser();

  const parsed = creatorEditProfileSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, error: "VALIDATION_ERROR" };
  }

  try {
    await db
      .update(users)
      .set({
        fullName: parsed.data.fullName,
        username: parsed.data.username,
        bio: parsed.data.bio || null,
        categories: parsed.data.categories,
        location: parsed.data.location || null,
        website: parsed.data.website || null,
        publicEmail: parsed.data.publicEmail || null,
        profileStatus: parsed.data.profileStatus,
        updatedAt: new Date(),
      })
      .where(eq(users.authId, authUser.id));

    return { success: true as const };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "";
    if (message.includes("users_username_unique")) {
      return { success: false as const, error: "USERNAME_EXISTS" };
    }
    return { success: false as const, error: "UNKNOWN_ERROR" };
  }
}

export async function updateAvatarUrl(url: string) {
  const authUser = await getAuthUser();

  await db
    .update(users)
    .set({ avatarUrl: url, updatedAt: new Date() })
    .where(eq(users.authId, authUser.id));

  return { success: true };
}

export async function updateProfileStatus(status: ProfileStatus) {
  const authUser = await getAuthUser();

  await db
    .update(users)
    .set({ profileStatus: status, updatedAt: new Date() })
    .where(eq(users.authId, authUser.id));

  return { success: true };
}
