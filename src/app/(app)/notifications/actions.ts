"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users, notifications } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

async function getUserIdSafe(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.authId, authUser.id))
    .limit(1);
  return user?.id ?? null;
}

export async function getNotifications() {
  const userId = await getUserIdSafe();
  if (!userId) return [];

  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(20);
}

export async function markAsRead(notificationId: string) {
  const userId = await getUserIdSafe();
  if (!userId) return;

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId),
      ),
    );
}

export async function markAllRead() {
  const userId = await getUserIdSafe();
  if (!userId) return;

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false),
      ),
    );
}

export async function getNotificationCount(): Promise<number> {
  const userId = await getUserIdSafe();
  if (!userId) return 0;

  const unread = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false),
      ),
    );

  return unread.length;
}
