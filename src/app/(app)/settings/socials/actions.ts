"use server";

import { getAuthUser } from "@/lib/auth/get-auth-user";
import { db } from "@/db";
import { users, socialAccounts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getSocialAccounts() {
  const authUser = await getAuthUser();

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.authId, authUser.id))
    .limit(1);

  if (!user) return [];

  return db
    .select()
    .from(socialAccounts)
    .where(eq(socialAccounts.userId, user.id))
    .orderBy(socialAccounts.createdAt);
}

export async function addManualLink(data: {
  platform: string;
  handle: string;
  profileUrl?: string;
}) {
  const authUser = await getAuthUser();

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.authId, authUser.id))
    .limit(1);

  if (!user) return { success: false as const, error: "USER_NOT_FOUND" };

  try {
    await db.insert(socialAccounts).values({
      userId: user.id,
      platform: data.platform as typeof socialAccounts.$inferInsert.platform,
      handle: data.handle,
      profileUrl: data.profileUrl || null,
      status: "manual",
      connectedAt: new Date(),
    });

    return { success: true as const };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "";
    if (message.includes("social_accounts_user_platform_unique")) {
      return { success: false as const, error: "ALREADY_LINKED" };
    }
    return { success: false as const, error: "UNKNOWN_ERROR" };
  }
}

export async function unlinkAccount(accountId: string) {
  const authUser = await getAuthUser();

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.authId, authUser.id))
    .limit(1);

  if (!user) return { success: false as const };

  await db
    .delete(socialAccounts)
    .where(
      and(
        eq(socialAccounts.id, accountId),
        eq(socialAccounts.userId, user.id),
      ),
    );

  return { success: true as const };
}
