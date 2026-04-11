"use server";

import { getAuthUser } from "@/lib/auth/get-auth-user";
import { db } from "@/db";
import { users, collaborationRequests, packages, messageThreads, messageThreadMembers } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { collaborationRequestSchema } from "@/lib/validations/collaboration";
import type { CollaborationRequestValues } from "@/lib/validations/collaboration";

async function getUser() {
  const authUser = await getAuthUser();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.authId, authUser.id))
    .limit(1);
  return user ?? null;
}

export async function createCollaborationRequest(data: CollaborationRequestValues) {
  const user = await getUser();
  if (!user || user.role !== "brand") {
    return { success: false as const, error: "UNAUTHORIZED" };
  }

  const parsed = collaborationRequestSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, error: "VALIDATION_ERROR" };
  }

  const [created] = await db
    .insert(collaborationRequests)
    .values({
      brandId: user.id,
      creatorId: parsed.data.creatorId,
      packageId: parsed.data.packageId ?? null,
      title: parsed.data.title,
      message: parsed.data.message,
      budget: parsed.data.budget ?? null,
      currency: parsed.data.currency,
      deadline: parsed.data.deadline ?? null,
      status: "pending",
    })
    .returning();

  return { success: true as const, id: created.id };
}

export interface CollabWithDetails {
  id: string;
  title: string;
  message: string | null;
  status: string;
  budget: number | null;
  currency: string;
  deadline: string | null;
  declinedReason: string | null;
  respondedAt: Date | null;
  createdAt: Date;
  brandName: string | null;
  brandAvatar: string | null;
  creatorName: string | null;
  creatorUsername: string | null;
  creatorAvatar: string | null;
  packageTitle: string | null;
}

export async function getMyCollaborations(): Promise<CollabWithDetails[]> {
  const user = await getUser();
  if (!user) return [];

  const isBrand = user.role === "brand";

  const brandUsers = db.$with("brand_users").as(
    db.select({
      id: users.id,
      fullName: users.fullName,
      avatarUrl: users.avatarUrl,
    }).from(users),
  );

  const creatorUsers = db.$with("creator_users").as(
    db.select({
      id: users.id,
      fullName: users.fullName,
      username: users.username,
      avatarUrl: users.avatarUrl,
    }).from(users),
  );

  // Use a simpler approach — fetch collabs then hydrate
  const collabs = await db
    .select()
    .from(collaborationRequests)
    .where(
      isBrand
        ? eq(collaborationRequests.brandId, user.id)
        : eq(collaborationRequests.creatorId, user.id),
    )
    .orderBy(desc(collaborationRequests.createdAt));

  if (collabs.length === 0) return [];

  // Get unique user IDs and package IDs to batch fetch
  const userIds = new Set<string>();
  const packageIds = new Set<string>();
  for (const c of collabs) {
    userIds.add(c.brandId);
    userIds.add(c.creatorId);
    if (c.packageId) packageIds.add(c.packageId);
  }

  const [relatedUsers, relatedPackages] = await Promise.all([
    db
      .select({
        id: users.id,
        fullName: users.fullName,
        username: users.username,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(
        // Simple: just fetch all users we need
        eq(users.id, users.id), // placeholder — we'll filter in JS
      ),
    packageIds.size > 0
      ? db.select({ id: packages.id, title: packages.title }).from(packages)
      : Promise.resolve([]),
  ]);

  // Build lookup maps — filter to only IDs we need
  const allUsers = await db
    .select({ id: users.id, fullName: users.fullName, username: users.username, avatarUrl: users.avatarUrl })
    .from(users);

  const userMap = new Map(allUsers.map((u) => [u.id, u]));

  const pkgMap = new Map(relatedPackages.map((p) => [p.id, p]));

  return collabs.map((c) => {
    const brand = userMap.get(c.brandId);
    const creator = userMap.get(c.creatorId);
    const pkg = c.packageId ? pkgMap.get(c.packageId) : null;

    return {
      id: c.id,
      title: c.title,
      message: c.message,
      status: c.status,
      budget: c.budget,
      currency: c.currency,
      deadline: c.deadline,
      declinedReason: c.declinedReason,
      respondedAt: c.respondedAt,
      createdAt: c.createdAt,
      brandName: brand?.fullName ?? null,
      brandAvatar: brand?.avatarUrl ?? null,
      creatorName: creator?.fullName ?? null,
      creatorUsername: creator?.username ?? null,
      creatorAvatar: creator?.avatarUrl ?? null,
      packageTitle: pkg?.title ?? null,
    };
  });
}

export async function acceptCollaboration(id: string) {
  const user = await getUser();
  if (!user || user.role !== "creator") {
    return { success: false as const, error: "UNAUTHORIZED" };
  }

  // Get the collab request to find brandId and title
  const [collab] = await db
    .select()
    .from(collaborationRequests)
    .where(
      and(
        eq(collaborationRequests.id, id),
        eq(collaborationRequests.creatorId, user.id),
        eq(collaborationRequests.status, "pending"),
      ),
    )
    .limit(1);

  if (!collab) return { success: false as const, error: "NOT_FOUND" };

  const now = new Date();

  // Update status
  await db
    .update(collaborationRequests)
    .set({ status: "accepted", respondedAt: now, updatedAt: now })
    .where(eq(collaborationRequests.id, id));

  // Create message thread
  const [thread] = await db
    .insert(messageThreads)
    .values({
      collabRequestId: collab.id,
      subject: collab.title,
      lastMessageAt: now,
    })
    .returning();

  // Add both users as thread members
  await db.insert(messageThreadMembers).values([
    { threadId: thread.id, userId: collab.brandId },
    { threadId: thread.id, userId: user.id },
  ]);

  return { success: true as const };
}

export async function declineCollaboration(id: string, reason?: string) {
  const user = await getUser();
  if (!user || user.role !== "creator") {
    return { success: false as const, error: "UNAUTHORIZED" };
  }

  await db
    .update(collaborationRequests)
    .set({
      status: "declined",
      declinedReason: reason || null,
      respondedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(collaborationRequests.id, id),
        eq(collaborationRequests.creatorId, user.id),
        eq(collaborationRequests.status, "pending"),
      ),
    );

  return { success: true as const };
}
