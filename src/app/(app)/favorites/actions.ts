"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users, favorites } from "@/db/schema";
import { eq, and } from "drizzle-orm";

async function getBrandUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;

  const [user] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.authId, authUser.id))
    .limit(1);

  if (!user || user.role !== "brand") return null;
  return user.id;
}

export async function toggleFavorite(creatorId: string) {
  const brandUserId = await getBrandUserId();
  if (!brandUserId) return { success: false as const, error: "UNAUTHORIZED" };

  // Check if already favorited
  const [existing] = await db
    .select({ id: favorites.id })
    .from(favorites)
    .where(
      and(
        eq(favorites.brandUserId, brandUserId),
        eq(favorites.creatorId, creatorId),
      ),
    )
    .limit(1);

  if (existing) {
    await db.delete(favorites).where(eq(favorites.id, existing.id));
    return { success: true as const, favorited: false };
  }

  await db.insert(favorites).values({ brandUserId, creatorId });
  return { success: true as const, favorited: true };
}

export async function getMyFavoriteIds(): Promise<string[]> {
  const brandUserId = await getBrandUserId();
  if (!brandUserId) return [];

  const rows = await db
    .select({ creatorId: favorites.creatorId })
    .from(favorites)
    .where(eq(favorites.brandUserId, brandUserId));

  return rows.map((r) => r.creatorId);
}

export interface FavoriteCreator {
  id: string;
  fullName: string | null;
  username: string | null;
  avatarUrl: string | null;
  categories: string[];
}

export async function getMyFavorites(): Promise<FavoriteCreator[]> {
  const brandUserId = await getBrandUserId();
  if (!brandUserId) return [];

  const rows = await db
    .select({
      favoriteId: favorites.id,
      creatorId: favorites.creatorId,
      fullName: users.fullName,
      username: users.username,
      avatarUrl: users.avatarUrl,
      categories: users.categories,
    })
    .from(favorites)
    .innerJoin(users, eq(favorites.creatorId, users.id))
    .where(eq(favorites.brandUserId, brandUserId))
    .orderBy(favorites.createdAt);

  return rows.map((r) => ({
    id: r.creatorId,
    fullName: r.fullName,
    username: r.username,
    avatarUrl: r.avatarUrl,
    categories: r.categories,
  }));
}
