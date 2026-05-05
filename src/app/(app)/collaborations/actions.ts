"use server";

import { getAuthUser } from "@/lib/auth/get-auth-user";
import { db } from "@/db";
import { users, collaborationRequests, packages, deals, collaborations, messageThreads, messageThreadMembers, messages } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { createAndEmail, createNotification } from "@/lib/notifications/create";
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

  // Notify creator
  const [creator] = await db
    .select({ id: users.id, email: users.email, fullName: users.fullName })
    .from(users)
    .where(eq(users.id, parsed.data.creatorId))
    .limit(1);

  if (creator) {
    createAndEmail({
      userId: creator.id,
      type: "collab_request",
      title: `New collaboration request from ${user.fullName ?? "a brand"}`,
      body: `${user.fullName ?? "A brand"} wants to collaborate with you: "${parsed.data.title}". Review and accept or decline on your dashboard.`,
      actionUrl: "/creator/dashboard",
      referenceId: created.id,
      referenceType: "collab_request",
      email: creator.email,
      emailSubject: `New collaboration request: ${parsed.data.title}`,
    }).catch(() => {});
  }

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
  dealId: string | null;
  collaborationWorkspaceId: string | null;
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

  // Fetch linked deals and collaboration workspaces for accepted requests
  const collabIds = collabs.map((c) => c.id);
  const linkedDeals = await db
    .select({
      id: deals.id,
      collabRequestId: deals.collabRequestId,
    })
    .from(deals);
  const dealByCollabReqId = new Map(
    linkedDeals
      .filter((d) => d.collabRequestId && collabIds.includes(d.collabRequestId))
      .map((d) => [d.collabRequestId!, d.id]),
  );

  const linkedWorkspaces = await db
    .select({
      id: collaborations.id,
      dealId: collaborations.dealId,
    })
    .from(collaborations);
  const workspaceByDealId = new Map(
    linkedWorkspaces.map((w) => [w.dealId, w.id]),
  );

  return collabs
    .filter((c) => {
      // Exclude collabs that have a linked deal — they show as deals instead
      const dealId = dealByCollabReqId.get(c.id);
      return !dealId;
    })
    .map((c) => {
    const brand = userMap.get(c.brandId);
    const creator = userMap.get(c.creatorId);
    const pkg = c.packageId ? pkgMap.get(c.packageId) : null;
    const dealId = dealByCollabReqId.get(c.id) ?? null;
    const collaborationWorkspaceId = dealId
      ? workspaceByDealId.get(dealId) ?? null
      : null;

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
      dealId,
      collaborationWorkspaceId,
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

  // Seed initial message from the brand's outreach
  const brandName = await db
    .select({ fullName: users.fullName, brandName: users.brandName })
    .from(users)
    .where(eq(users.id, collab.brandId))
    .limit(1)
    .then((rows) => rows[0]?.brandName ?? rows[0]?.fullName ?? "Brand");

  const outreachBody = collab.message
    ? collab.message
    : `Hi! I'd like to collaborate with you on "${collab.title}".`;

  await db.insert(messages).values({
    threadId: thread.id,
    senderId: collab.brandId,
    body: outreachBody,
  });

  // Auto-create a deal from the accepted collaboration request
  const [deal] = await db
    .insert(deals)
    .values({
      brandId: collab.brandId,
      creatorId: user.id,
      collabRequestId: collab.id,
      threadId: thread.id,
      title: collab.title,
      deliverables: collab.message ?? null,
      budget: collab.budget ?? null,
      currency: collab.currency ?? "usd",
      timeline: collab.deadline ?? null,
      status: "accepted",
    })
    .returning();

  // Auto-create collaboration workspace (awaited so it exists before UI fetches)
  const { createCollaboration } = await import(
    "@/app/(app)/deal-workspace/actions"
  );
  const collabResult = await createCollaboration(deal.id);

  // Notify brand
  const [brand] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, collab.brandId))
    .limit(1);

  const workspaceUrl = collabResult.success && collabResult.collaborationId
    ? `/deal-workspace/${collabResult.collaborationId}`
    : `/deals/${deal.id}`;

  if (brand) {
    createAndEmail({
      userId: brand.id,
      type: "collab_update",
      title: `${user.fullName ?? "A creator"} accepted your request`,
      body: collab.title,
      actionUrl: workspaceUrl,
      referenceId: collab.id,
      referenceType: "collab_request",
      email: brand.email,
      emailSubject: `Collaboration accepted: ${collab.title}`,
    }).catch(() => {});
  }

  return {
    success: true as const,
    collaborationWorkspaceId: collabResult.success ? collabResult.collaborationId : null,
  };
}

export async function declineCollaboration(id: string, reason?: string) {
  const user = await getUser();
  if (!user || user.role !== "creator") {
    return { success: false as const, error: "UNAUTHORIZED" };
  }

  // Get collab for brand info
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

  await db
    .update(collaborationRequests)
    .set({
      status: "declined",
      declinedReason: reason || null,
      respondedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(collaborationRequests.id, id));

  // Notify brand
  const [brand] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, collab.brandId))
    .limit(1);

  if (brand) {
    createAndEmail({
      userId: brand.id,
      type: "collab_update",
      title: `${user.fullName ?? "A creator"} declined your request`,
      body: collab.title,
      actionUrl: "/deals",
      referenceId: collab.id,
      referenceType: "collab_request",
      email: brand.email,
      emailSubject: `Collaboration declined: ${collab.title}`,
    }).catch(() => {});
  }

  return { success: true as const };
}

// ─── Launch Collaboration Workspace (for accepted requests with no deal) ───

export async function launchCollaborationWorkspace(collabRequestId: string) {
  const user = await getUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const [collab] = await db
    .select()
    .from(collaborationRequests)
    .where(
      and(
        eq(collaborationRequests.id, collabRequestId),
        eq(collaborationRequests.status, "accepted"),
      ),
    )
    .limit(1);

  if (!collab) return { success: false as const, error: "NOT_FOUND" };
  if (collab.brandId !== user.id && collab.creatorId !== user.id) {
    return { success: false as const, error: "UNAUTHORIZED" };
  }

  // Check if a deal already exists for this request
  const [existingDeal] = await db
    .select({ id: deals.id })
    .from(deals)
    .where(eq(deals.collabRequestId, collabRequestId))
    .limit(1);

  let dealId = existingDeal?.id;

  if (!dealId) {
    // Find existing message thread for this collab request
    const [existingThread] = await db
      .select({ id: messageThreads.id })
      .from(messageThreads)
      .where(eq(messageThreads.collabRequestId, collabRequestId))
      .limit(1);

    let threadId = existingThread?.id;

    // Create thread if it doesn't exist
    if (!threadId) {
      const [thread] = await db
        .insert(messageThreads)
        .values({
          collabRequestId: collab.id,
          subject: collab.title,
          lastMessageAt: new Date(),
        })
        .returning();

      await db.insert(messageThreadMembers).values([
        { threadId: thread.id, userId: collab.brandId },
        { threadId: thread.id, userId: collab.creatorId },
      ]);

      // Seed initial message from the brand's outreach
      const outreachBody = collab.message
        ? collab.message
        : `Hi! I'd like to collaborate with you on "${collab.title}".`;

      await db.insert(messages).values({
        threadId: thread.id,
        senderId: collab.brandId,
        body: outreachBody,
      });

      threadId = thread.id;
    }

    // Create deal from accepted collab request
    const [deal] = await db
      .insert(deals)
      .values({
        brandId: collab.brandId,
        creatorId: collab.creatorId,
        collabRequestId: collab.id,
        threadId,
        title: collab.title,
        deliverables: collab.message ?? null,
        budget: collab.budget ?? null,
        currency: collab.currency ?? "usd",
        timeline: collab.deadline ?? null,
        status: "accepted",
      })
      .returning();

    dealId = deal.id;
  }

  // Create workspace if it doesn't exist
  const { createCollaboration } = await import(
    "@/app/(app)/deal-workspace/actions"
  );
  const result = await createCollaboration(dealId);

  if (!result.success) return result;

  return {
    success: true as const,
    collaborationWorkspaceId: result.collaborationId,
  };
}
