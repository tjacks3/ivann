"use server";

import { getAuthUser } from "@/lib/auth/get-auth-user";
import { db } from "@/db";
import { users, packages } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { packageFormSchema } from "@/lib/validations/package";
import type { PackageFormValues } from "@/lib/validations/package";

async function getUserId() {
  const authUser = await getAuthUser();
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.authId, authUser.id))
    .limit(1);
  return user?.id ?? null;
}

export async function getMyPackages() {
  const userId = await getUserId();
  if (!userId) return [];

  return db
    .select()
    .from(packages)
    .where(eq(packages.userId, userId))
    .orderBy(asc(packages.sortOrder), asc(packages.createdAt));
}

export async function createPackage(data: PackageFormValues) {
  const userId = await getUserId();
  if (!userId) return { success: false as const, error: "USER_NOT_FOUND" };

  const parsed = packageFormSchema.safeParse(data);
  if (!parsed.success) return { success: false as const, error: "VALIDATION_ERROR" };

  const [created] = await db
    .insert(packages)
    .values({
      userId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      type: parsed.data.type,
      priceInCents: parsed.data.priceInCents,
      currency: parsed.data.currency,
      deliveryDays: parsed.data.deliveryDays ?? null,
      revisions: parsed.data.revisions ?? 1,
      status: parsed.data.status,
    })
    .returning();

  return { success: true as const, package: created };
}

export async function updatePackage(id: string, data: PackageFormValues) {
  const userId = await getUserId();
  if (!userId) return { success: false as const, error: "USER_NOT_FOUND" };

  const parsed = packageFormSchema.safeParse(data);
  if (!parsed.success) return { success: false as const, error: "VALIDATION_ERROR" };

  await db
    .update(packages)
    .set({
      title: parsed.data.title,
      description: parsed.data.description || null,
      type: parsed.data.type,
      priceInCents: parsed.data.priceInCents,
      currency: parsed.data.currency,
      deliveryDays: parsed.data.deliveryDays ?? null,
      revisions: parsed.data.revisions ?? 1,
      status: parsed.data.status,
      updatedAt: new Date(),
    })
    .where(and(eq(packages.id, id), eq(packages.userId, userId)));

  return { success: true as const };
}

export async function deletePackage(id: string) {
  const userId = await getUserId();
  if (!userId) return { success: false as const };

  await db
    .delete(packages)
    .where(and(eq(packages.id, id), eq(packages.userId, userId)));

  return { success: true as const };
}
