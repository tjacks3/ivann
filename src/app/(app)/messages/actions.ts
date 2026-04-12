"use server";

import { getAuthUser } from "@/lib/auth/get-auth-user";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import {
  users,
  messageThreads,
  messageThreadMembers,
  messages,
} from "@/db/schema";
import { eq, and, desc, sql, ne } from "drizzle-orm";
import { createNotification } from "@/lib/notifications/create";

async function getUserId(): Promise<string | null> {
  const authUser = await getAuthUser();
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.authId, authUser.id))
    .limit(1);
  return user?.id ?? null;
}

/** Non-redirecting version for unread count — returns null if not authenticated */
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

export interface ThreadSummary {
  id: string;
  subject: string | null;
  lastMessageAt: Date | null;
  lastMessageBody: string | null;
  otherUserId: string;
  otherUserName: string | null;
  otherUserAvatar: string | null;
  isUnread: boolean;
}

export async function getMyThreads(): Promise<ThreadSummary[]> {
  const userId = await getUserId();
  if (!userId) return [];

  // Get all threads where user is a member
  const memberships = await db
    .select({
      threadId: messageThreadMembers.threadId,
      lastReadAt: messageThreadMembers.lastReadAt,
    })
    .from(messageThreadMembers)
    .where(eq(messageThreadMembers.userId, userId));

  if (memberships.length === 0) return [];

  const threadIds = memberships.map((m) => m.threadId);
  const readMap = new Map(memberships.map((m) => [m.threadId, m.lastReadAt]));

  // Get threads
  const threads = await db
    .select()
    .from(messageThreads)
    .where(sql`${messageThreads.id} IN (${sql.join(threadIds.map((id) => sql`${id}`), sql`, `)})`)
    .orderBy(desc(messageThreads.lastMessageAt));

  // Get last message per thread
  const lastMessages = await Promise.all(
    threadIds.map((tid) =>
      db
        .select({ body: messages.body, threadId: messages.threadId })
        .from(messages)
        .where(eq(messages.threadId, tid))
        .orderBy(desc(messages.createdAt))
        .limit(1)
        .then((rows) => rows[0] ?? null),
    ),
  );
  const lastMsgMap = new Map(
    lastMessages.filter(Boolean).map((m) => [m!.threadId, m!.body]),
  );

  // Get the other member for each thread
  const otherMembers = await db
    .select({
      threadId: messageThreadMembers.threadId,
      userId: messageThreadMembers.userId,
    })
    .from(messageThreadMembers)
    .where(
      and(
        sql`${messageThreadMembers.threadId} IN (${sql.join(threadIds.map((id) => sql`${id}`), sql`, `)})`,
        ne(messageThreadMembers.userId, userId),
      ),
    );

  const otherUserIds = [...new Set(otherMembers.map((m) => m.userId))];
  const otherUsers = otherUserIds.length > 0
    ? await db
        .select({ id: users.id, fullName: users.fullName, avatarUrl: users.avatarUrl })
        .from(users)
        .where(sql`${users.id} IN (${sql.join(otherUserIds.map((id) => sql`${id}`), sql`, `)})`)
    : [];
  const userMap = new Map(otherUsers.map((u) => [u.id, u]));

  const otherMemberMap = new Map(otherMembers.map((m) => [m.threadId, m.userId]));

  return threads.map((t) => {
    const otherUserId = otherMemberMap.get(t.id) ?? "";
    const otherUser = userMap.get(otherUserId);
    const lastReadAt = readMap.get(t.id);
    const isUnread = t.lastMessageAt != null && (lastReadAt == null || t.lastMessageAt > lastReadAt);

    return {
      id: t.id,
      subject: t.subject,
      lastMessageAt: t.lastMessageAt,
      lastMessageBody: lastMsgMap.get(t.id) ?? null,
      otherUserId,
      otherUserName: otherUser?.fullName ?? null,
      otherUserAvatar: otherUser?.avatarUrl ?? null,
      isUnread,
    };
  });
}

export interface MessageItem {
  id: string;
  body: string;
  senderId: string;
  senderName: string | null;
  senderAvatar: string | null;
  createdAt: Date;
  isOwn: boolean;
}

export async function getThreadMessages(threadId: string): Promise<{
  messages: MessageItem[];
  otherUserName: string | null;
  otherUserAvatar: string | null;
  subject: string | null;
}> {
  const userId = await getUserId();
  if (!userId) return { messages: [], otherUserName: null, otherUserAvatar: null, subject: null };

  // Verify membership
  const [membership] = await db
    .select()
    .from(messageThreadMembers)
    .where(
      and(
        eq(messageThreadMembers.threadId, threadId),
        eq(messageThreadMembers.userId, userId),
      ),
    )
    .limit(1);

  if (!membership) return { messages: [], otherUserName: null, otherUserAvatar: null, subject: null };

  // Mark as read
  await db
    .update(messageThreadMembers)
    .set({ lastReadAt: new Date() })
    .where(
      and(
        eq(messageThreadMembers.threadId, threadId),
        eq(messageThreadMembers.userId, userId),
      ),
    );

  // Get thread
  const [thread] = await db
    .select({ subject: messageThreads.subject })
    .from(messageThreads)
    .where(eq(messageThreads.id, threadId))
    .limit(1);

  // Get messages
  const rawMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.threadId, threadId))
    .orderBy(messages.createdAt);

  // Get senders
  const senderIds = [...new Set(rawMessages.map((m) => m.senderId))];
  const senders = senderIds.length > 0
    ? await db
        .select({ id: users.id, fullName: users.fullName, avatarUrl: users.avatarUrl })
        .from(users)
        .where(sql`${users.id} IN (${sql.join(senderIds.map((id) => sql`${id}`), sql`, `)})`)
    : [];
  const senderMap = new Map(senders.map((s) => [s.id, s]));

  // Get other member
  const [otherMember] = await db
    .select({ userId: messageThreadMembers.userId })
    .from(messageThreadMembers)
    .where(
      and(
        eq(messageThreadMembers.threadId, threadId),
        ne(messageThreadMembers.userId, userId),
      ),
    )
    .limit(1);

  const otherUser = otherMember ? senderMap.get(otherMember.userId) : null;

  return {
    messages: rawMessages.map((m) => {
      const sender = senderMap.get(m.senderId);
      return {
        id: m.id,
        body: m.body,
        senderId: m.senderId,
        senderName: sender?.fullName ?? null,
        senderAvatar: sender?.avatarUrl ?? null,
        createdAt: m.createdAt,
        isOwn: m.senderId === userId,
      };
    }),
    otherUserName: otherUser?.fullName ?? null,
    otherUserAvatar: otherUser?.avatarUrl ?? null,
    subject: thread?.subject ?? null,
  };
}

export async function sendMessage(threadId: string, body: string) {
  const userId = await getUserId();
  if (!userId) return { success: false as const };

  // Verify membership
  const [membership] = await db
    .select()
    .from(messageThreadMembers)
    .where(
      and(
        eq(messageThreadMembers.threadId, threadId),
        eq(messageThreadMembers.userId, userId),
      ),
    )
    .limit(1);

  if (!membership) return { success: false as const };

  const now = new Date();

  await db.insert(messages).values({
    threadId,
    senderId: userId,
    body: body.trim(),
  });

  await db
    .update(messageThreads)
    .set({ lastMessageAt: now, updatedAt: now })
    .where(eq(messageThreads.id, threadId));

  // Notify the other thread member (in-app only, no email for messages)
  const [otherMember] = await db
    .select({ userId: messageThreadMembers.userId })
    .from(messageThreadMembers)
    .where(
      and(
        eq(messageThreadMembers.threadId, threadId),
        ne(messageThreadMembers.userId, userId),
      ),
    )
    .limit(1);

  if (otherMember) {
    const [sender] = await db
      .select({ fullName: users.fullName })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    createNotification({
      userId: otherMember.userId,
      type: "message",
      title: `New message from ${sender?.fullName ?? "someone"}`,
      body: body.trim().slice(0, 100),
      actionUrl: `/messages/${threadId}`,
      referenceId: threadId,
      referenceType: "message",
    }).catch(() => {});
  }

  return { success: true as const };
}

export async function getUnreadCount(): Promise<number> {
  const userId = await getUserIdSafe();
  if (!userId) return 0;

  const memberships = await db
    .select({
      threadId: messageThreadMembers.threadId,
      lastReadAt: messageThreadMembers.lastReadAt,
    })
    .from(messageThreadMembers)
    .where(eq(messageThreadMembers.userId, userId));

  if (memberships.length === 0) return 0;

  const threadIds = memberships.map((m) => m.threadId);
  const readMap = new Map(memberships.map((m) => [m.threadId, m.lastReadAt]));

  const threads = await db
    .select({ id: messageThreads.id, lastMessageAt: messageThreads.lastMessageAt })
    .from(messageThreads)
    .where(sql`${messageThreads.id} IN (${sql.join(threadIds.map((id) => sql`${id}`), sql`, `)})`);

  return threads.filter((t) => {
    const lastReadAt = readMap.get(t.id);
    return t.lastMessageAt != null && (lastReadAt == null || t.lastMessageAt > lastReadAt);
  }).length;
}
