"use server";

import { getAuthUser } from "@/lib/auth/get-auth-user";
import { db } from "@/db";
import {
  users,
  deals,
  dealRevisions,
  messageThreads,
  messageThreadMembers,
  messages,
  collaborations,
} from "@/db/schema";
import { eq, or, desc, asc } from "drizzle-orm";
import { createAndEmail } from "@/lib/notifications/create";
import { releasePayment, refundPayment } from "./payment-actions";
import {
  createDealSchema,
  updateDealSchema,
  type CreateDealValues,
  type UpdateDealValues,
} from "@/lib/validations/deal";

// ─── Auth Helper ────────────────────────────────────────────────────────────

async function getUser() {
  const authUser = await getAuthUser();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.authId, authUser.id))
    .limit(1);
  return user ?? null;
}

// ─── Create Deal ────────────────────────────────────────────────────────────

export async function createDeal(data: CreateDealValues) {
  const user = await getUser();
  if (!user || user.role !== "brand") {
    return { success: false as const, error: "UNAUTHORIZED" };
  }

  const parsed = createDealSchema.safeParse(data);
  if (!parsed.success) return { success: false as const, error: "VALIDATION_ERROR" };

  const now = new Date();

  // Create message thread immediately
  const [thread] = await db
    .insert(messageThreads)
    .values({
      subject: parsed.data.title,
      lastMessageAt: now,
    })
    .returning();

  // Add both users as thread members
  await db.insert(messageThreadMembers).values([
    { threadId: thread.id, userId: user.id },
    { threadId: thread.id, userId: parsed.data.creatorId },
  ]);

  // Seed initial message from the brand
  const initialMessage = parsed.data.notes
    ? parsed.data.notes
    : `Hi! I'd like to propose a deal: "${parsed.data.title}".`;

  await db.insert(messages).values({
    threadId: thread.id,
    senderId: user.id,
    body: initialMessage,
  });

  // Create the deal
  const [deal] = await db
    .insert(deals)
    .values({
      brandId: user.id,
      creatorId: parsed.data.creatorId,
      threadId: thread.id,
      title: parsed.data.title,
      deliverables: parsed.data.deliverables ?? null,
      budget: parsed.data.budget ?? null,
      currency: parsed.data.currency ?? "usd",
      timeline: parsed.data.timeline ?? null,
      notes: parsed.data.notes ?? null,
      status: "draft",
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
      title: `New deal proposal from ${user.brandName ?? user.fullName ?? "a brand"}`,
      body: parsed.data.title,
      actionUrl: `/deals/${deal.id}`,
      referenceId: deal.id,
      referenceType: "collab_request",
      email: creator.email,
      emailSubject: `New deal proposal: ${parsed.data.title}`,
    }).catch(() => {});
  }

  return { success: true as const, dealId: deal.id, threadId: thread.id };
}

// ─── Get Deal ───────────────────────────────────────────────────────────────

export interface DealWithParties {
  id: string;
  brandId: string;
  creatorId: string;
  threadId: string | null;
  collabRequestId: string | null;
  title: string;
  deliverables: string | null;
  budget: number | null;
  currency: string;
  timeline: string | null;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  brandName: string | null;
  brandAvatar: string | null;
  brandContactName: string | null;
  creatorName: string | null;
  creatorUsername: string | null;
  creatorAvatar: string | null;
}

export async function getDeal(dealId: string): Promise<DealWithParties | null> {
  const user = await getUser();
  if (!user) return null;

  const [deal] = await db
    .select()
    .from(deals)
    .where(eq(deals.id, dealId))
    .limit(1);

  if (!deal) return null;

  // Verify user is a party to this deal
  if (deal.brandId !== user.id && deal.creatorId !== user.id) return null;

  // Fetch both parties
  const partyUsers = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      brandName: users.brandName,
      contactName: users.contactName,
      username: users.username,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(or(eq(users.id, deal.brandId), eq(users.id, deal.creatorId)));

  const brand = partyUsers.find((u) => u.id === deal.brandId);
  const creator = partyUsers.find((u) => u.id === deal.creatorId);

  return {
    id: deal.id,
    brandId: deal.brandId,
    creatorId: deal.creatorId,
    threadId: deal.threadId,
    collabRequestId: deal.collabRequestId,
    title: deal.title,
    deliverables: deal.deliverables,
    budget: deal.budget,
    currency: deal.currency,
    timeline: deal.timeline,
    status: deal.status,
    notes: deal.notes,
    createdAt: deal.createdAt,
    updatedAt: deal.updatedAt,
    brandName: brand?.brandName ?? brand?.fullName ?? null,
    brandAvatar: brand?.avatarUrl ?? null,
    brandContactName: brand?.contactName ?? null,
    creatorName: creator?.fullName ?? null,
    creatorUsername: creator?.username ?? null,
    creatorAvatar: creator?.avatarUrl ?? null,
  };
}

// ─── Get My Deals ───────────────────────────────────────────────────────────

export interface DealListItem {
  id: string;
  title: string;
  status: string;
  budget: number | null;
  currency: string;
  timeline: string | null;
  updatedAt: Date;
  otherPartyName: string | null;
  otherPartyAvatar: string | null;
  otherPartyUsername: string | null;
  collaborationId: string | null;
  collaborationState: string | null;
  collabRequestId: string | null;
}

export async function getMyDeals(): Promise<DealListItem[]> {
  const user = await getUser();
  if (!user) return [];

  const isBrand = user.role === "brand";

  const allDeals = await db
    .select({
      id: deals.id,
      title: deals.title,
      status: deals.status,
      budget: deals.budget,
      currency: deals.currency,
      timeline: deals.timeline,
      updatedAt: deals.updatedAt,
      brandId: deals.brandId,
      creatorId: deals.creatorId,
      collabRequestId: deals.collabRequestId,
      collaborationId: collaborations.id,
      collaborationState: collaborations.state,
    })
    .from(deals)
    .leftJoin(collaborations, eq(collaborations.dealId, deals.id))
    .where(
      isBrand
        ? eq(deals.brandId, user.id)
        : eq(deals.creatorId, user.id),
    )
    .orderBy(desc(deals.updatedAt));

  if (allDeals.length === 0) return [];

  // Batch fetch other party info
  const otherUsers = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      brandName: users.brandName,
      username: users.username,
      avatarUrl: users.avatarUrl,
    })
    .from(users);
  const userMap = new Map(otherUsers.map((u) => [u.id, u]));

  return allDeals.map((d) => {
    const otherId = isBrand ? d.creatorId : d.brandId;
    const other = userMap.get(otherId);
    return {
      id: d.id,
      title: d.title,
      status: d.status,
      budget: d.budget,
      currency: d.currency,
      timeline: d.timeline,
      updatedAt: d.updatedAt,
      otherPartyName: isBrand
        ? other?.fullName ?? null
        : other?.brandName ?? other?.fullName ?? null,
      otherPartyAvatar: other?.avatarUrl ?? null,
      otherPartyUsername: other?.username ?? null,
      collaborationId: d.collaborationId ?? null,
      collaborationState: d.collaborationState ?? null,
      collabRequestId: d.collabRequestId ?? null,
    };
  });
}

// ─── Edit Proposal (Brand Only) ─────────────────────────────────────────────

export async function editProposal(dealId: string, data: UpdateDealValues) {
  const user = await getUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const parsed = updateDealSchema.safeParse(data);
  if (!parsed.success) return { success: false as const, error: "VALIDATION_ERROR" };

  const [deal] = await db
    .select()
    .from(deals)
    .where(eq(deals.id, dealId))
    .limit(1);

  if (!deal) return { success: false as const, error: "NOT_FOUND" };
  if (deal.brandId !== user.id) return { success: false as const, error: "UNAUTHORIZED" };
  if (deal.status !== "draft" && deal.status !== "negotiating") {
    return { success: false as const, error: "NOT_EDITABLE" };
  }

  // Get current revision count
  const existingRevisions = await db
    .select({ id: dealRevisions.id })
    .from(dealRevisions)
    .where(eq(dealRevisions.dealId, dealId));
  const revisionNumber = existingRevisions.length + 1;

  // Save current state as a revision before updating
  await db.insert(dealRevisions).values({
    dealId,
    authorId: user.id,
    authorRole: "brand",
    revisionNumber,
    deliverables: parsed.data.deliverables ?? deal.deliverables,
    budget: parsed.data.budget ?? deal.budget,
    currency: parsed.data.currency ?? deal.currency,
    timeline: parsed.data.timeline ?? deal.timeline,
    notes: parsed.data.notes ?? deal.notes,
  });

  // Update the deal with new values
  await db
    .update(deals)
    .set({
      deliverables: parsed.data.deliverables ?? deal.deliverables,
      budget: parsed.data.budget ?? deal.budget,
      timeline: parsed.data.timeline ?? deal.timeline,
      notes: parsed.data.notes ?? deal.notes,
      status: deal.status === "draft" ? "draft" : "negotiating",
      updatedAt: new Date(),
    })
    .where(eq(deals.id, dealId));

  // Notify creator
  const [creator] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, deal.creatorId))
    .limit(1);

  if (creator) {
    createAndEmail({
      userId: creator.id,
      type: "collab_update",
      title: `Proposal updated for "${deal.title}"`,
      body: "The brand has updated the proposal. Review the changes.",
      actionUrl: `/deals/${deal.id}`,
      referenceId: deal.id,
      referenceType: "collab_request",
      email: creator.email,
      emailSubject: `Proposal updated: ${deal.title}`,
    }).catch(() => {});
  }

  return { success: true as const };
}

// ─── Counter Proposal (Creator Only) ────────────────────────────────────────

export async function submitCounterProposal(dealId: string, data: UpdateDealValues) {
  const user = await getUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const parsed = updateDealSchema.safeParse(data);
  if (!parsed.success) return { success: false as const, error: "VALIDATION_ERROR" };

  const [deal] = await db
    .select()
    .from(deals)
    .where(eq(deals.id, dealId))
    .limit(1);

  if (!deal) return { success: false as const, error: "NOT_FOUND" };
  if (deal.creatorId !== user.id) return { success: false as const, error: "UNAUTHORIZED" };
  if (deal.status !== "draft" && deal.status !== "negotiating") {
    return { success: false as const, error: "NOT_EDITABLE" };
  }

  // Get current revision count
  const existingRevisions = await db
    .select({ id: dealRevisions.id })
    .from(dealRevisions)
    .where(eq(dealRevisions.dealId, dealId));
  const revisionNumber = existingRevisions.length + 1;

  // Save counter-proposal as a revision
  await db.insert(dealRevisions).values({
    dealId,
    authorId: user.id,
    authorRole: "creator",
    revisionNumber,
    deliverables: parsed.data.deliverables ?? deal.deliverables,
    budget: parsed.data.budget ?? deal.budget,
    currency: parsed.data.currency ?? deal.currency,
    timeline: parsed.data.timeline ?? deal.timeline,
    notes: parsed.data.notes ?? deal.notes,
  });

  // Update deal status to negotiating (do NOT overwrite original proposal fields)
  await db
    .update(deals)
    .set({
      status: "negotiating",
      updatedAt: new Date(),
    })
    .where(eq(deals.id, dealId));

  // Notify brand
  const [brand] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, deal.brandId))
    .limit(1);

  if (brand) {
    createAndEmail({
      userId: brand.id,
      type: "collab_update",
      title: `Counter-proposal received for "${deal.title}"`,
      body: `${user.fullName ?? "The creator"} has submitted a counter-proposal.`,
      actionUrl: `/deals/${deal.id}`,
      referenceId: deal.id,
      referenceType: "collab_request",
      email: brand.email,
      emailSubject: `Counter-proposal: ${deal.title}`,
    }).catch(() => {});
  }

  return { success: true as const };
}

// ─── Get Deal Revisions ─────────────────────────────────────────────────────

export interface RevisionItem {
  id: string;
  revisionNumber: number;
  authorRole: string;
  authorName: string | null;
  deliverables: string | null;
  budget: number | null;
  currency: string;
  timeline: string | null;
  notes: string | null;
  createdAt: Date;
}

export async function getDealRevisions(dealId: string): Promise<RevisionItem[]> {
  const user = await getUser();
  if (!user) return [];

  const [deal] = await db
    .select({ brandId: deals.brandId, creatorId: deals.creatorId })
    .from(deals)
    .where(eq(deals.id, dealId))
    .limit(1);

  if (!deal || (deal.brandId !== user.id && deal.creatorId !== user.id)) return [];

  const revisions = await db
    .select({
      id: dealRevisions.id,
      revisionNumber: dealRevisions.revisionNumber,
      authorRole: dealRevisions.authorRole,
      authorId: dealRevisions.authorId,
      deliverables: dealRevisions.deliverables,
      budget: dealRevisions.budget,
      currency: dealRevisions.currency,
      timeline: dealRevisions.timeline,
      notes: dealRevisions.notes,
      createdAt: dealRevisions.createdAt,
    })
    .from(dealRevisions)
    .where(eq(dealRevisions.dealId, dealId))
    .orderBy(asc(dealRevisions.revisionNumber));

  if (revisions.length === 0) return [];

  // Batch fetch author names
  const authorIds = [...new Set(revisions.map((r) => r.authorId))];
  const authors = await db
    .select({ id: users.id, fullName: users.fullName, brandName: users.brandName })
    .from(users);
  const authorMap = new Map(authors.map((a) => [a.id, a]));

  return revisions.map((r) => {
    const author = authorMap.get(r.authorId);
    return {
      id: r.id,
      revisionNumber: r.revisionNumber,
      authorRole: r.authorRole,
      authorName: r.authorRole === "brand"
        ? author?.brandName ?? author?.fullName ?? null
        : author?.fullName ?? null,
      deliverables: r.deliverables,
      budget: r.budget,
      currency: r.currency,
      timeline: r.timeline,
      notes: r.notes,
      createdAt: r.createdAt,
    };
  });
}

// ─── Update Deal Status ─────────────────────────────────────────────────────

const STATUS_TRANSITIONS: Record<string, { allowed: string[]; roles: ("brand" | "creator")[] }[]> = {
  draft: [{ allowed: ["negotiating"], roles: ["brand", "creator"] }, { allowed: ["accepted"], roles: ["creator"] }, { allowed: ["cancelled"], roles: ["brand", "creator"] }],
  negotiating: [{ allowed: ["accepted"], roles: ["creator"] }, { allowed: ["cancelled"], roles: ["brand", "creator"] }],
  accepted: [{ allowed: ["in_progress"], roles: ["brand", "creator"] }, { allowed: ["cancelled"], roles: ["brand", "creator"] }],
  in_progress: [{ allowed: ["delivered"], roles: ["creator"] }, { allowed: ["cancelled"], roles: ["brand", "creator"] }],
  delivered: [{ allowed: ["completed"], roles: ["brand"] }, { allowed: ["cancelled"], roles: ["brand", "creator"] }],
};

export async function updateDealStatus(dealId: string, newStatus: string) {
  const user = await getUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const [deal] = await db
    .select()
    .from(deals)
    .where(eq(deals.id, dealId))
    .limit(1);

  if (!deal) return { success: false as const, error: "NOT_FOUND" };
  if (deal.brandId !== user.id && deal.creatorId !== user.id) {
    return { success: false as const, error: "UNAUTHORIZED" };
  }

  const isBrand = deal.brandId === user.id;
  const role = isBrand ? "brand" : "creator";
  const transitions = STATUS_TRANSITIONS[deal.status];

  if (!transitions) return { success: false as const, error: "INVALID_TRANSITION" };

  const valid = transitions.some(
    (t) => t.allowed.includes(newStatus) && t.roles.includes(role),
  );
  if (!valid) return { success: false as const, error: "INVALID_TRANSITION" };

  await db
    .update(deals)
    .set({ status: newStatus as typeof deal.status, updatedAt: new Date() })
    .where(eq(deals.id, dealId));

  // Auto-release payment on completion, auto-refund on cancellation
  if (newStatus === "completed") {
    releasePayment(dealId).catch(() => {});
  } else if (newStatus === "cancelled") {
    refundPayment(dealId).catch(() => {});
  }

  // Auto-create collaboration workspace on acceptance (awaited to avoid race conditions)
  if (newStatus === "accepted") {
    const { createCollaboration } = await import(
      "@/app/(app)/collaboration-workspace/actions"
    );
    await createCollaboration(dealId);
  }

  // Notify the other party
  const otherUserId = isBrand ? deal.creatorId : deal.brandId;
  const [otherUser] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, otherUserId))
    .limit(1);

  const statusLabels: Record<string, string> = {
    negotiating: "is being negotiated",
    accepted: "has been accepted",
    in_progress: "is now in progress",
    delivered: "has been marked as delivered",
    completed: "has been completed",
    cancelled: "has been cancelled",
  };

  if (otherUser) {
    createAndEmail({
      userId: otherUser.id,
      type: "collab_update",
      title: `Deal "${deal.title}" ${statusLabels[newStatus] ?? "was updated"}`,
      body: `Status changed to ${newStatus.replace("_", " ")}`,
      actionUrl: `/deals/${deal.id}`,
      referenceId: deal.id,
      referenceType: "collab_request",
      email: otherUser.email,
      emailSubject: `Deal update: ${deal.title}`,
    }).catch(() => {});
  }

  return { success: true as const };
}
