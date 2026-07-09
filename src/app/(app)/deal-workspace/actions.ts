"use server";

import { getAuthUser } from "@/lib/auth/get-auth-user";
import { db } from "@/db";
import {
  users,
  deals,
  collaborations,
  collaborationMessages,
  collaborationStateHistory,
  dealPayments,
} from "@/db/schema";
import { eq, asc, or, inArray } from "drizzle-orm";
import { createAndEmail } from "@/lib/notifications/create";
import {
  briefSchema,
  deliverableSubmissionSchema,
  collabMessageSchema,
  type BriefValues,
  type DeliverableSubmissionValues,
} from "@/lib/validations/deal-workspace";

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

// ─── State Machine ─────────────────────────────────────────────────────────

const STATE_TRANSITIONS: Record<
  string,
  { allowed: string[]; roles: ("brand" | "creator")[] }[]
> = {
  awaiting_brand_brief: [
    { allowed: ["awaiting_creator_confirmation"], roles: ["brand"] },
  ],
  awaiting_creator_confirmation: [
    { allowed: ["in_progress"], roles: ["creator"] },
    { allowed: ["revision_requested"], roles: ["creator"] },
  ],
  revision_requested: [
    { allowed: ["awaiting_creator_confirmation"], roles: ["brand"] },
  ],
  in_progress: [{ allowed: ["submitted"], roles: ["creator"] }],
  submitted: [
    { allowed: ["completed"], roles: ["brand"] },
    { allowed: ["in_progress"], roles: ["brand"] },
  ],
};

async function transitionState(
  collaborationId: string,
  expectedFrom: string,
  toState: string,
  changedBy: string,
  note?: string,
) {
  const [collab] = await db
    .select()
    .from(collaborations)
    .where(eq(collaborations.id, collaborationId))
    .limit(1);

  if (!collab) return { success: false as const, error: "NOT_FOUND" };
  if (collab.state !== expectedFrom) {
    return { success: false as const, error: "INVALID_TRANSITION" };
  }

  const now = new Date();

  await db
    .update(collaborations)
    .set({
      state: toState as typeof collab.state,
      updatedAt: now,
    })
    .where(eq(collaborations.id, collaborationId));

  await db.insert(collaborationStateHistory).values({
    collaborationId,
    fromState: expectedFrom,
    toState,
    changedBy,
    note,
  });

  const STATE_LABELS: Record<string, string> = {
    awaiting_brand_brief: "Waiting for brand brief",
    awaiting_creator_confirmation: "Waiting for creator confirmation",
    revision_requested: "Creator requested changes",
    in_progress: "In progress",
    submitted: "Deliverable submitted",
    completed: "Completed",
  };

  const STATE_ACTIONS: Record<string, { actionType: string; actionLabel: string }> = {
    awaiting_creator_confirmation: { actionType: "review_brief", actionLabel: "Review Brief" },
    revision_requested: { actionType: "update_brief", actionLabel: "Update Brief" },
    in_progress: { actionType: "start_work", actionLabel: "View Workspace" },
    submitted: { actionType: "review_deliverable", actionLabel: "Review Submission" },
    completed: { actionType: "view_completion", actionLabel: "View Details" },
  };

  const action = STATE_ACTIONS[toState];

  await db.insert(collaborationMessages).values({
    collaborationId,
    senderId: null,
    body: STATE_LABELS[toState] ?? `Status changed to ${toState}`,
    isSystemEvent: true,
    actionType: action?.actionType ?? null,
    actionLabel: action?.actionLabel ?? null,
  });

  return { success: true as const, collab };
}

// ─── Create Collaboration ──────────────────────────────────────────────────

export async function createCollaboration(dealId: string) {
  const user = await getUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const [deal] = await db
    .select()
    .from(deals)
    .where(eq(deals.id, dealId))
    .limit(1);

  if (!deal) return { success: false as const, error: "NOT_FOUND" };

  // Check if collaboration already exists for this deal
  const [existing] = await db
    .select({ id: collaborations.id })
    .from(collaborations)
    .where(eq(collaborations.dealId, dealId))
    .limit(1);

  if (existing) return { success: true as const, collaborationId: existing.id };

  const [collab] = await db
    .insert(collaborations)
    .values({
      dealId: deal.id,
      brandUserId: deal.brandId,
      creatorId: deal.creatorId,
      deliverableType: deal.deliverables?.slice(0, 100) ?? null,
      budgetAmount: deal.budget ?? null,
      dueDate: deal.timeline && !isNaN(new Date(deal.timeline).getTime())
        ? new Date(deal.timeline)
        : null,
    })
    .returning();

  // Seed system message
  await db.insert(collaborationMessages).values({
    collaborationId: collab.id,
    senderId: null,
    body: "Collaboration workspace created",
    isSystemEvent: true,
  });

  // Insert initial state history
  await db.insert(collaborationStateHistory).values({
    collaborationId: collab.id,
    fromState: null,
    toState: "awaiting_brand_brief",
    changedBy: user.id,
  });

  // Notify both parties
  const partyUsers = await db
    .select({ id: users.id, email: users.email, fullName: users.fullName })
    .from(users)
    .where(or(eq(users.id, deal.brandId), eq(users.id, deal.creatorId)));

  for (const party of partyUsers) {
    createAndEmail({
      userId: party.id,
      type: "collab_update",
      title: `Collaboration workspace created for "${deal.title}"`,
      body: "Your collaboration workspace is ready. Next step: brand provides the campaign brief.",
      actionUrl: `/deal-workspace/${collab.id}`,
      referenceId: collab.id,
      referenceType: "collaboration",
      email: party.email,
      emailSubject: `Collaboration workspace: ${deal.title}`,
    }).catch(() => {});
  }

  return { success: true as const, collaborationId: collab.id };
}

// ─── Submit Brief (Brand) ──────────────────────────────────────────────────

export async function submitBrief(
  collaborationId: string,
  briefData: BriefValues,
) {
  const user = await getUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const parsed = briefSchema.safeParse(briefData);
  if (!parsed.success)
    return { success: false as const, error: "VALIDATION_ERROR" };

  const [collab] = await db
    .select()
    .from(collaborations)
    .where(eq(collaborations.id, collaborationId))
    .limit(1);

  if (!collab) return { success: false as const, error: "NOT_FOUND" };
  if (collab.brandUserId !== user.id)
    return { success: false as const, error: "UNAUTHORIZED" };

  // Cannot edit brief after completion
  if (collab.state === "completed") {
    return { success: false as const, error: "INVALID_TRANSITION" };
  }

  // Block brief submission if payment has not been funded
  if (
    collab.state === "awaiting_brand_brief" ||
    collab.state === "revision_requested"
  ) {
    const [pmnt] = await db
      .select()
      .from(dealPayments)
      .where(eq(dealPayments.dealId, collab.dealId))
      .limit(1);

    if (!pmnt || pmnt.status !== "funded") {
      return { success: false as const, error: "PAYMENT_NOT_FUNDED" };
    }
  }

  await db
    .update(collaborations)
    .set({ briefData: parsed.data, briefDraft: null, updatedAt: new Date() })
    .where(eq(collaborations.id, collaborationId));

  // Only transition state if in brief-submission states
  if (
    collab.state === "awaiting_brand_brief" ||
    collab.state === "revision_requested"
  ) {
    const isResubmission = collab.state === "revision_requested";

    // Log the brief edit as a distinct activity entry before the state transition
    if (isResubmission) {
      await db.insert(collaborationMessages).values({
        collaborationId,
        senderId: null,
        body: "Brand updated the campaign brief based on your feedback",
        isSystemEvent: true,
        actionType: "review_brief",
        actionLabel: "Review Updated Brief",
      });
    }

    const result = await transitionState(
      collaborationId,
      collab.state,
      "awaiting_creator_confirmation",
      user.id,
      isResubmission
        ? "Brand updated brief"
        : "Brand submitted campaign brief",
    );

    if (!result.success) return result;
  } else {
    // Edit during later stages — log as activity
    await db.insert(collaborationMessages).values({
      collaborationId,
      senderId: null,
      body: "Brand updated the campaign brief",
      isSystemEvent: true,
      actionType: "review_brief",
      actionLabel: "Review Brief",
    });
  }

  // Notify creator
  const wasResubmission = collab.state === "revision_requested";
  const [creator] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, collab.creatorId))
    .limit(1);

  if (creator) {
    createAndEmail({
      userId: creator.id,
      type: "collab_update",
      title: wasResubmission
        ? "Campaign brief updated"
        : "Campaign brief submitted",
      body: wasResubmission
        ? "The brand has updated the campaign brief based on your feedback. Please review the changes and confirm."
        : "The brand has submitted the campaign brief. Please review and confirm.",
      actionUrl: `/deal-workspace/${collaborationId}`,
      referenceId: collaborationId,
      referenceType: "collaboration",
      email: creator.email,
      emailSubject: wasResubmission
        ? "Campaign brief updated — please review"
        : "Campaign brief ready for review",
    }).catch(() => {});
  }

  return { success: true as const };
}

// ─── Confirm Deliverable (Creator) ─────────────────────────────────────────

export async function confirmDeliverable(collaborationId: string) {
  const user = await getUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const [collab] = await db
    .select()
    .from(collaborations)
    .where(eq(collaborations.id, collaborationId))
    .limit(1);

  if (!collab) return { success: false as const, error: "NOT_FOUND" };
  if (collab.creatorId !== user.id)
    return { success: false as const, error: "UNAUTHORIZED" };

  // Block start work if deal payment is not funded
  const [payment] = await db
    .select()
    .from(dealPayments)
    .where(eq(dealPayments.dealId, collab.dealId))
    .limit(1);

  if (payment && payment.status !== "funded") {
    return { success: false as const, error: "PAYMENT_NOT_FUNDED" };
  }

  const result = await transitionState(
    collaborationId,
    "awaiting_creator_confirmation",
    "in_progress",
    user.id,
    "Creator confirmed deliverable details",
  );

  if (!result.success) return result;

  // Sync deal status to in_progress
  await db
    .update(deals)
    .set({ status: "in_progress", updatedAt: new Date() })
    .where(eq(deals.id, collab.dealId));

  // Notify brand
  const [brand] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, collab.brandUserId))
    .limit(1);

  if (brand) {
    createAndEmail({
      userId: brand.id,
      type: "collab_update",
      title: "Creator confirmed the deliverable",
      body: "The creator has reviewed the brief and confirmed. Work is now in progress.",
      actionUrl: `/deal-workspace/${collaborationId}`,
      referenceId: collaborationId,
      referenceType: "collaboration",
      email: brand.email,
      emailSubject: "Creator confirmed — collaboration in progress",
    }).catch(() => {});
  }

  return { success: true as const };
}

// ─── Request Brief Changes (Creator) ───────────────────────────────────────

export async function requestBriefChanges(
  collaborationId: string,
  message: string,
) {
  const user = await getUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const [collab] = await db
    .select()
    .from(collaborations)
    .where(eq(collaborations.id, collaborationId))
    .limit(1);

  if (!collab) return { success: false as const, error: "NOT_FOUND" };
  if (collab.creatorId !== user.id)
    return { success: false as const, error: "UNAUTHORIZED" };

  // Post the creator's message
  await db.insert(collaborationMessages).values({
    collaborationId,
    senderId: user.id,
    body: message,
    isSystemEvent: false,
  });

  const result = await transitionState(
    collaborationId,
    "awaiting_creator_confirmation",
    "revision_requested",
    user.id,
    "Creator requested changes",
  );

  if (!result.success) return result;

  // Notify brand
  const [brand] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, collab.brandUserId))
    .limit(1);

  if (brand) {
    createAndEmail({
      userId: brand.id,
      type: "collab_update",
      title: "Creator requested brief changes",
      body: message,
      actionUrl: `/deal-workspace/${collaborationId}`,
      referenceId: collaborationId,
      referenceType: "collaboration",
      email: brand.email,
      emailSubject: "Brief revision requested",
    }).catch(() => {});
  }

  return { success: true as const };
}

// ─── Submit Deliverable (Creator) ──────────────────────────────────────────

export async function submitDeliverable(
  collaborationId: string,
  data: DeliverableSubmissionValues,
) {
  const user = await getUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const parsed = deliverableSubmissionSchema.safeParse(data);
  if (!parsed.success)
    return { success: false as const, error: "VALIDATION_ERROR" };

  const [collab] = await db
    .select()
    .from(collaborations)
    .where(eq(collaborations.id, collaborationId))
    .limit(1);

  if (!collab) return { success: false as const, error: "NOT_FOUND" };
  if (collab.creatorId !== user.id)
    return { success: false as const, error: "UNAUTHORIZED" };

  await db
    .update(collaborations)
    .set({
      submittedUrl: parsed.data.contentUrl,
      submittedNote: parsed.data.note ?? null,
      updatedAt: new Date(),
    })
    .where(eq(collaborations.id, collaborationId));

  const result = await transitionState(
    collaborationId,
    "in_progress",
    "submitted",
    user.id,
    "Creator submitted deliverable",
  );

  if (!result.success) return result;

  // Sync deal status to delivered
  await db
    .update(deals)
    .set({ status: "delivered", updatedAt: new Date() })
    .where(eq(deals.id, collab.dealId));

  // Notify brand
  const [brand] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, collab.brandUserId))
    .limit(1);

  if (brand) {
    createAndEmail({
      userId: brand.id,
      type: "collab_update",
      title: "Deliverable submitted for review",
      body: "The creator has submitted their deliverable. Please review and approve.",
      actionUrl: `/deal-workspace/${collaborationId}`,
      referenceId: collaborationId,
      referenceType: "collaboration",
      email: brand.email,
      emailSubject: "Deliverable ready for review",
    }).catch(() => {});
  }

  return { success: true as const };
}

// ─── Approve Deliverable (Brand) ───────────────────────────────────────────

export async function approveDeliverable(collaborationId: string) {
  const user = await getUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const [collab] = await db
    .select()
    .from(collaborations)
    .where(eq(collaborations.id, collaborationId))
    .limit(1);

  if (!collab) return { success: false as const, error: "NOT_FOUND" };
  if (collab.brandUserId !== user.id)
    return { success: false as const, error: "UNAUTHORIZED" };

  const now = new Date();

  await db
    .update(collaborations)
    .set({ approvedAt: now, completedAt: now, updatedAt: now })
    .where(eq(collaborations.id, collaborationId));

  const result = await transitionState(
    collaborationId,
    "submitted",
    "completed",
    user.id,
    "Brand approved deliverable",
  );

  if (!result.success) return result;

  // Sync deal status to completed and trigger payment release
  await db
    .update(deals)
    .set({ status: "completed", updatedAt: now })
    .where(eq(deals.id, collab.dealId));

  const { releasePayment } = await import("@/app/(app)/deals/payment-actions");
  releasePayment(collab.dealId).catch(() => {});

  // Payment released system message
  await db.insert(collaborationMessages).values({
    collaborationId,
    senderId: null,
    body: "Payment has been released to the creator",
    isSystemEvent: true,
    actionType: "payment_released",
    actionLabel: "View Payment",
  });

  // Notify creator
  const [creator] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, collab.creatorId))
    .limit(1);

  if (creator) {
    createAndEmail({
      userId: creator.id,
      type: "collab_update",
      title: "Deliverable approved!",
      body: "The brand has approved your deliverable. Collaboration complete!",
      actionUrl: `/deal-workspace/${collaborationId}`,
      referenceId: collaborationId,
      referenceType: "collaboration",
      email: creator.email,
      emailSubject: "Deliverable approved — collaboration complete!",
    }).catch(() => {});
  }

  return { success: true as const };
}

// ─── Request Revision (Brand) ──────────────────────────────────────────────

export async function requestRevision(
  collaborationId: string,
  message: string,
) {
  const user = await getUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const [collab] = await db
    .select()
    .from(collaborations)
    .where(eq(collaborations.id, collaborationId))
    .limit(1);

  if (!collab) return { success: false as const, error: "NOT_FOUND" };
  if (collab.brandUserId !== user.id)
    return { success: false as const, error: "UNAUTHORIZED" };

  const now = new Date();

  // Clear submission data and mark revision
  await db
    .update(collaborations)
    .set({
      submittedUrl: null,
      submittedNote: null,
      revisionRequestedAt: now,
      updatedAt: now,
    })
    .where(eq(collaborations.id, collaborationId));

  // Post revision message
  await db.insert(collaborationMessages).values({
    collaborationId,
    senderId: user.id,
    body: message,
    isSystemEvent: false,
  });

  const result = await transitionState(
    collaborationId,
    "submitted",
    "in_progress",
    user.id,
    "Brand requested revision",
  );

  if (!result.success) return result;

  // Notify creator
  const [creator] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, collab.creatorId))
    .limit(1);

  if (creator) {
    createAndEmail({
      userId: creator.id,
      type: "collab_update",
      title: "Revision requested",
      body: message,
      actionUrl: `/deal-workspace/${collaborationId}`,
      referenceId: collaborationId,
      referenceType: "collaboration",
      email: creator.email,
      emailSubject: "Revision requested for your deliverable",
    }).catch(() => {});
  }

  return { success: true as const };
}

// ─── Send Collaboration Message ────────────────────────────────────────────

export async function sendCollabMessage(
  collaborationId: string,
  body: string,
) {
  const user = await getUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const parsed = collabMessageSchema.safeParse({ body });
  if (!parsed.success)
    return { success: false as const, error: "VALIDATION_ERROR" };

  const [collab] = await db
    .select({ brandUserId: collaborations.brandUserId, creatorId: collaborations.creatorId })
    .from(collaborations)
    .where(eq(collaborations.id, collaborationId))
    .limit(1);

  if (!collab) return { success: false as const, error: "NOT_FOUND" };
  if (collab.brandUserId !== user.id && collab.creatorId !== user.id) {
    return { success: false as const, error: "UNAUTHORIZED" };
  }

  await db.insert(collaborationMessages).values({
    collaborationId,
    senderId: user.id,
    body: parsed.data.body,
    isSystemEvent: false,
  });

  return { success: true as const };
}

// ─── Get Collaboration ─────────────────────────────────────────────────────

export interface CollaborationData {
  id: string;
  dealId: string;
  brandUserId: string;
  creatorId: string;
  state: string;
  deliverableType: string | null;
  dueDate: Date | null;
  budgetAmount: number | null;
  briefData: BriefValues | null;
  briefDraft: Partial<BriefValues> | null;
  submittedUrl: string | null;
  submittedNote: string | null;
  approvedAt: Date | null;
  completedAt: Date | null;
  revisionRequestedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  dealTitle: string;
  dealCurrency: string;
  dealDeliverables: string | null;
  dealDescription: string | null;
  brandName: string | null;
  brandAvatar: string | null;
  brandContactName: string | null;
  creatorName: string | null;
  creatorUsername: string | null;
  creatorAvatar: string | null;
}

export async function getCollaboration(
  collaborationId: string,
): Promise<CollaborationData | null> {
  const user = await getUser();
  if (!user) return null;

  const [collab] = await db
    .select()
    .from(collaborations)
    .where(eq(collaborations.id, collaborationId))
    .limit(1);

  if (!collab) return null;
  if (collab.brandUserId !== user.id && collab.creatorId !== user.id)
    return null;

  // Fetch deal title & currency
  const [deal] = await db
    .select({ title: deals.title, currency: deals.currency, deliverables: deals.deliverables, notes: deals.notes })
    .from(deals)
    .where(eq(deals.id, collab.dealId))
    .limit(1);

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
    .where(or(eq(users.id, collab.brandUserId), eq(users.id, collab.creatorId)));

  const brand = partyUsers.find((u) => u.id === collab.brandUserId);
  const creator = partyUsers.find((u) => u.id === collab.creatorId);

  return {
    id: collab.id,
    dealId: collab.dealId,
    brandUserId: collab.brandUserId,
    creatorId: collab.creatorId,
    state: collab.state,
    deliverableType: collab.deliverableType,
    dueDate: collab.dueDate,
    budgetAmount: collab.budgetAmount,
    briefData: collab.briefData as BriefValues | null,
    briefDraft: collab.briefDraft as Partial<BriefValues> | null,
    submittedUrl: collab.submittedUrl,
    submittedNote: collab.submittedNote,
    approvedAt: collab.approvedAt,
    completedAt: collab.completedAt,
    revisionRequestedAt: collab.revisionRequestedAt,
    createdAt: collab.createdAt,
    updatedAt: collab.updatedAt,
    dealTitle: deal?.title ?? "",
    dealCurrency: deal?.currency ?? "usd",
    dealDeliverables: deal?.deliverables ?? null,
    dealDescription: deal?.notes ?? null,
    brandName: brand?.brandName ?? brand?.fullName ?? null,
    brandAvatar: brand?.avatarUrl ?? null,
    brandContactName: brand?.contactName ?? null,
    creatorName: creator?.fullName ?? null,
    creatorUsername: creator?.username ?? null,
    creatorAvatar: creator?.avatarUrl ?? null,
  };
}

// ─── Get Collaboration Messages ────────────────────────────────────────────

export interface CollabMessageItem {
  id: string;
  senderId: string | null;
  senderName: string | null;
  senderAvatar: string | null;
  body: string;
  isSystemEvent: boolean;
  actionType: string | null;
  actionLabel: string | null;
  createdAt: Date;
}

export async function getCollaborationMessages(
  collaborationId: string,
): Promise<CollabMessageItem[]> {
  const user = await getUser();
  if (!user) return [];

  const [collab] = await db
    .select({ brandUserId: collaborations.brandUserId, creatorId: collaborations.creatorId })
    .from(collaborations)
    .where(eq(collaborations.id, collaborationId))
    .limit(1);

  if (!collab) return [];
  if (collab.brandUserId !== user.id && collab.creatorId !== user.id) return [];

  const msgs = await db
    .select({
      id: collaborationMessages.id,
      senderId: collaborationMessages.senderId,
      body: collaborationMessages.body,
      isSystemEvent: collaborationMessages.isSystemEvent,
      actionType: collaborationMessages.actionType,
      actionLabel: collaborationMessages.actionLabel,
      createdAt: collaborationMessages.createdAt,
    })
    .from(collaborationMessages)
    .where(eq(collaborationMessages.collaborationId, collaborationId))
    .orderBy(asc(collaborationMessages.createdAt));

  if (msgs.length === 0) return [];

  // Batch fetch sender info
  const senderIds = [...new Set(msgs.map((m) => m.senderId).filter(Boolean))] as string[];
  const senders =
    senderIds.length > 0
      ? await db
          .select({
            id: users.id,
            fullName: users.fullName,
            brandName: users.brandName,
            avatarUrl: users.avatarUrl,
          })
          .from(users)
      : [];
  const senderMap = new Map(senders.map((s) => [s.id, s]));

  return msgs.map((m) => {
    const sender = m.senderId ? senderMap.get(m.senderId) : null;
    return {
      id: m.id,
      senderId: m.senderId,
      senderName: sender?.brandName ?? sender?.fullName ?? null,
      senderAvatar: sender?.avatarUrl ?? null,
      body: m.body,
      isSystemEvent: m.isSystemEvent,
      actionType: m.actionType ?? null,
      actionLabel: m.actionLabel ?? null,
      createdAt: m.createdAt,
    };
  });
}

// ─── Get Collaboration by Deal ID ──────────────────────────────────────────

export async function getCollaborationByDealId(
  dealId: string,
): Promise<{ id: string; state: string } | null> {
  const user = await getUser();
  if (!user) return null;

  const [collab] = await db
    .select({
      id: collaborations.id,
      state: collaborations.state,
      brandUserId: collaborations.brandUserId,
      creatorId: collaborations.creatorId,
    })
    .from(collaborations)
    .where(eq(collaborations.dealId, dealId))
    .limit(1);

  if (!collab) return null;
  if (collab.brandUserId !== user.id && collab.creatorId !== user.id)
    return null;

  return { id: collab.id, state: collab.state };
}

// ─── Get Collaboration Payment ────────────────────────────────────────────

export interface CollabPaymentData {
  dealId: string;
  amountInCents: number;
  currency: string;
  status: string;
  fundedAt: Date | null;
  releasedAt: Date | null;
  refundedAt: Date | null;
}

export async function getCollaborationPayment(
  collaborationId: string,
): Promise<CollabPaymentData | null> {
  const user = await getUser();
  if (!user) return null;

  const [collab] = await db
    .select({
      dealId: collaborations.dealId,
      brandUserId: collaborations.brandUserId,
      creatorId: collaborations.creatorId,
    })
    .from(collaborations)
    .where(eq(collaborations.id, collaborationId))
    .limit(1);

  if (!collab) return null;
  if (collab.brandUserId !== user.id && collab.creatorId !== user.id)
    return null;

  const [payment] = await db
    .select({
      amountInCents: dealPayments.amountInCents,
      currency: dealPayments.currency,
      status: dealPayments.status,
      fundedAt: dealPayments.fundedAt,
      releasedAt: dealPayments.releasedAt,
      refundedAt: dealPayments.refundedAt,
    })
    .from(dealPayments)
    .where(eq(dealPayments.dealId, collab.dealId))
    .limit(1);

  if (!payment) return null;

  return {
    dealId: collab.dealId,
    amountInCents: payment.amountInCents,
    currency: payment.currency,
    status: payment.status,
    fundedAt: payment.fundedAt,
    releasedAt: payment.releasedAt,
    refundedAt: payment.refundedAt,
  };
}

// ─── Save Brief Draft (Autosave) ──────────────────────────────────────────

export async function saveBriefDraft(
  collaborationId: string,
  draftData: Partial<BriefValues>,
) {
  const user = await getUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const [collab] = await db
    .select({
      brandUserId: collaborations.brandUserId,
      state: collaborations.state,
    })
    .from(collaborations)
    .where(eq(collaborations.id, collaborationId))
    .limit(1);

  if (!collab) return { success: false as const, error: "NOT_FOUND" };
  if (collab.brandUserId !== user.id)
    return { success: false as const, error: "UNAUTHORIZED" };

  if (collab.state === "completed")
    return { success: false as const, error: "INVALID_TRANSITION" };

  await db
    .update(collaborations)
    .set({ briefDraft: draftData, updatedAt: new Date() })
    .where(eq(collaborations.id, collaborationId));

  return { success: true as const };
}

// ─── Get Collaboration State History ──────────────────────────────────────

export interface StateHistoryItem {
  id: string;
  fromState: string | null;
  toState: string;
  changedByName: string | null;
  note: string | null;
  createdAt: Date;
}

export async function getCollaborationStateHistory(
  collaborationId: string,
): Promise<StateHistoryItem[]> {
  const user = await getUser();
  if (!user) return [];

  const [collab] = await db
    .select({
      brandUserId: collaborations.brandUserId,
      creatorId: collaborations.creatorId,
    })
    .from(collaborations)
    .where(eq(collaborations.id, collaborationId))
    .limit(1);

  if (!collab) return [];
  if (collab.brandUserId !== user.id && collab.creatorId !== user.id) return [];

  const history = await db
    .select({
      id: collaborationStateHistory.id,
      fromState: collaborationStateHistory.fromState,
      toState: collaborationStateHistory.toState,
      changedBy: collaborationStateHistory.changedBy,
      note: collaborationStateHistory.note,
      createdAt: collaborationStateHistory.createdAt,
    })
    .from(collaborationStateHistory)
    .where(eq(collaborationStateHistory.collaborationId, collaborationId))
    .orderBy(asc(collaborationStateHistory.createdAt));

  if (history.length === 0) return [];

  const changerIds = [...new Set(history.map((h) => h.changedBy).filter(Boolean))] as string[];
  const changers =
    changerIds.length > 0
      ? await db
          .select({ id: users.id, fullName: users.fullName, brandName: users.brandName })
          .from(users)
          .where(inArray(users.id, changerIds))
      : [];
  const changerMap = new Map(changers.map((c) => [c.id, c]));

  return history.map((h) => {
    const changer = h.changedBy ? changerMap.get(h.changedBy) : null;
    return {
      id: h.id,
      fromState: h.fromState,
      toState: h.toState,
      changedByName: changer?.brandName ?? changer?.fullName ?? null,
      note: h.note,
      createdAt: h.createdAt,
    };
  });
}
