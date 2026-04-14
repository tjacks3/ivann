"use server";

import { getAuthUser } from "@/lib/auth/get-auth-user";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { brandEditProfileSchema } from "@/lib/validations/brand-profile";
import type { BrandEditProfileValues } from "@/lib/validations/brand-profile";

export async function getBrandProfile() {
  const authUser = await getAuthUser();

  const profile = await db.query.users.findFirst({
    where: eq(users.authId, authUser.id),
  });

  return profile ?? null;
}

export async function updateBrandProfile(data: BrandEditProfileValues) {
  const authUser = await getAuthUser();

  const parsed = brandEditProfileSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, error: "VALIDATION_ERROR" };
  }

  try {
    await db
      .update(users)
      .set({
        brandName: parsed.data.brandName,
        contactName: parsed.data.contactName,
        companyWebsite: parsed.data.companyWebsite || null,
        bio: parsed.data.bio || null,
        industry: parsed.data.industry,
        location: parsed.data.location,
        updatedAt: new Date(),
      })
      .where(eq(users.authId, authUser.id));

    return { success: true as const };
  } catch {
    return { success: false as const, error: "UNKNOWN_ERROR" };
  }
}

export async function updateBrandAvatarUrl(url: string) {
  const authUser = await getAuthUser();

  await db
    .update(users)
    .set({ avatarUrl: url, updatedAt: new Date() })
    .where(eq(users.authId, authUser.id));

  return { success: true };
}
