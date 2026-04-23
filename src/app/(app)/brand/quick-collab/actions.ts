"use server";

import { getAuthUser } from "@/lib/auth/get-auth-user";
import { db } from "@/db";
import {
  users,
  socialAccounts,
  collaborationRequests,
  quickCollabRequests,
  quickCollabMatches,
  quickCollabCampaigns,
  quickCollabOutreaches,
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { createAndEmail } from "@/lib/notifications/create";
import {
  quickCollabIntakeSchema,
  campaignEditSchema,
  type QuickCollabIntakeValues,
  type CampaignEditValues,
} from "@/lib/validations/quick-collab";
import {
  scoreCreators,
  type CreatorForMatching,
} from "@/lib/quick-collab/matching";
import {
  generateCampaignPlan,
  generateOutreachMessage,
  budgetRangeToCents,
  timingToDeadline,
} from "@/lib/quick-collab/templates";

// ─── Auth Helper ────────────────────────────────────────────────────────────

async function getBrandUser() {
  const authUser = await getAuthUser();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.authId, authUser.id))
    .limit(1);

  if (!user || user.role !== "brand") return null;
  return user;
}

// ─── Create Request ─────────────────────────────────────────────────────────

export async function createQuickCollabRequest(data: QuickCollabIntakeValues) {
  const user = await getBrandUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const parsed = quickCollabIntakeSchema.safeParse(data);
  if (!parsed.success) return { success: false as const, error: "VALIDATION_ERROR" };

  // Auto-fill business name and category from profile
  const businessName = user.brandName ?? user.fullName ?? "My Business";
  const businessCategory = user.industry ?? "other";

  // Auto-fill city/state from profile location when localOnly is true
  let city = parsed.data.city ?? "";
  let state = parsed.data.state ?? "";
  if (parsed.data.localOnly && !city && !state && user.location) {
    const parts = user.location.split(",").map((s) => s.trim());
    city = parts[0] ?? "";
    state = parts[1] ?? "";
  }

  const [created] = await db
    .insert(quickCollabRequests)
    .values({
      brandId: user.id,
      businessName,
      businessCategory: businessCategory as typeof parsed.data.businessCategory,
      collabType: parsed.data.collabType,
      collabTypeOther: parsed.data.collabTypeOther ?? null,
      campaignIntent: parsed.data.campaignIntent,
      localOnly: parsed.data.localOnly,
      city,
      state,
      radius: parsed.data.localOnly ? (parsed.data.radius ?? null) : null,
      budgetRange: parsed.data.budgetRange,
      timing: parsed.data.timing,
      notes: parsed.data.notes ?? null,
    })
    .returning();

  return { success: true as const, requestId: created.id };
}

// ─── Match Creators ─────────────────────────────────────────────────────────

export interface MatchedCreator {
  matchId: string;
  creatorId: string;
  fullName: string | null;
  username: string | null;
  avatarUrl: string | null;
  bio: string | null;
  categories: string[];
  location: string | null;
  matchScore: number;
  fitLabel: string;
  fitReasons: string[];
  estimatedBudgetFit: boolean;
  totalFollowers: number;
  socialAccounts: {
    platform: string;
    handle: string | null;
    followerCount: number | null;
    isVerified: boolean;
  }[];
}

export async function matchCreators(requestId: string) {
  const user = await getBrandUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  // Fetch the request
  const [request] = await db
    .select()
    .from(quickCollabRequests)
    .where(
      and(
        eq(quickCollabRequests.id, requestId),
        eq(quickCollabRequests.brandId, user.id),
      ),
    )
    .limit(1);

  if (!request) return { success: false as const, error: "NOT_FOUND" };

  // Fetch all published creators with their social accounts
  const allCreators = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      username: users.username,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
      categories: users.categories,
      location: users.location,
    })
    .from(users)
    .where(
      and(eq(users.role, "creator"), eq(users.profileStatus, "published")),
    );

  if (allCreators.length === 0) {
    return { success: true as const, matches: [] };
  }

  // Batch fetch social accounts for all creators
  const allSocials = await db
    .select({
      userId: socialAccounts.userId,
      platform: socialAccounts.platform,
      handle: socialAccounts.handle,
      followerCount: socialAccounts.followerCount,
      isVerified: socialAccounts.isVerified,
    })
    .from(socialAccounts);

  const socialsByUser = new Map<string, typeof allSocials>();
  for (const sa of allSocials) {
    const existing = socialsByUser.get(sa.userId) ?? [];
    existing.push(sa);
    socialsByUser.set(sa.userId, existing);
  }

  // Build creator objects for matching
  const creatorsForMatching: CreatorForMatching[] = allCreators.map((c) => ({
    ...c,
    socialAccounts: (socialsByUser.get(c.id) ?? []).map((sa) => ({
      platform: sa.platform,
      handle: sa.handle,
      followerCount: sa.followerCount,
      isVerified: sa.isVerified,
    })),
  }));

  // Score and rank
  const matchResult = scoreCreators(request, creatorsForMatching);

  if (matchResult.creators.length === 0) {
    return {
      success: true as const,
      matches: [],
      localLowResults: false,
      totalFound: 0,
    };
  }

  // Clear any existing matches for this request
  await db
    .delete(quickCollabMatches)
    .where(eq(quickCollabMatches.requestId, requestId));

  // Insert match rows
  const matchRows = await db
    .insert(quickCollabMatches)
    .values(
      matchResult.creators.map((s) => ({
        requestId,
        creatorId: s.id,
        matchScore: s.matchScore,
        fitLabel: s.fitLabel,
        fitReasons: s.fitReasons,
        estimatedBudgetFit: s.estimatedBudgetFit,
        status: "recommended" as const,
      })),
    )
    .returning();

  // Build response
  const matches: MatchedCreator[] = matchRows.map((row, i) => {
    const creator = matchResult.creators[i];
    return {
      matchId: row.id,
      creatorId: creator.id,
      fullName: creator.fullName,
      username: creator.username,
      avatarUrl: creator.avatarUrl,
      bio: creator.bio,
      categories: creator.categories,
      location: creator.location,
      matchScore: creator.matchScore,
      fitLabel: creator.fitLabel,
      fitReasons: creator.fitReasons,
      estimatedBudgetFit: creator.estimatedBudgetFit,
      totalFollowers: creator.totalFollowers,
      socialAccounts: creator.socialAccounts,
    };
  });

  return {
    success: true as const,
    matches,
    localLowResults: matchResult.localLowResults,
    totalFound: matchResult.totalFound,
  };
}

// ─── Update Match Status ────────────────────────────────────────────────────

export async function updateMatchStatus(
  matchId: string,
  status: "selected" | "skipped",
) {
  const user = await getBrandUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  // Verify ownership: match → request → brand
  const [match] = await db
    .select({ id: quickCollabMatches.id, requestId: quickCollabMatches.requestId })
    .from(quickCollabMatches)
    .where(eq(quickCollabMatches.id, matchId))
    .limit(1);

  if (!match) return { success: false as const, error: "NOT_FOUND" };

  const [request] = await db
    .select({ brandId: quickCollabRequests.brandId })
    .from(quickCollabRequests)
    .where(eq(quickCollabRequests.id, match.requestId))
    .limit(1);

  if (!request || request.brandId !== user.id) {
    return { success: false as const, error: "UNAUTHORIZED" };
  }

  await db
    .update(quickCollabMatches)
    .set({ status })
    .where(eq(quickCollabMatches.id, matchId));

  return { success: true as const };
}

// ─── Generate Campaign ──────────────────────────────────────────────────────

export async function generateCampaign(requestId: string) {
  const user = await getBrandUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const [request] = await db
    .select()
    .from(quickCollabRequests)
    .where(
      and(
        eq(quickCollabRequests.id, requestId),
        eq(quickCollabRequests.brandId, user.id),
      ),
    )
    .limit(1);

  if (!request) return { success: false as const, error: "NOT_FOUND" };

  // Count selected matches
  const selectedMatches = await db
    .select({ id: quickCollabMatches.id })
    .from(quickCollabMatches)
    .where(
      and(
        eq(quickCollabMatches.requestId, requestId),
        eq(quickCollabMatches.status, "selected"),
      ),
    );

  if (selectedMatches.length === 0) {
    return { success: false as const, error: "NO_SELECTED_CREATORS" };
  }

  // Delete existing campaign if re-generating
  await db
    .delete(quickCollabCampaigns)
    .where(eq(quickCollabCampaigns.requestId, requestId));

  const plan = generateCampaignPlan(request, selectedMatches.length);

  const [campaign] = await db
    .insert(quickCollabCampaigns)
    .values({
      requestId,
      goal: plan.goal,
      deliverable: plan.deliverable,
      budgetPerCreator: plan.budgetPerCreator,
      timeline: plan.timeline,
      summary: plan.summary,
    })
    .returning();

  return { success: true as const, campaign };
}

// ─── Update Campaign ────────────────────────────────────────────────────────

export async function updateCampaign(
  campaignId: string,
  data: CampaignEditValues,
) {
  const user = await getBrandUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const parsed = campaignEditSchema.safeParse(data);
  if (!parsed.success) return { success: false as const, error: "VALIDATION_ERROR" };

  // Verify ownership
  const [campaign] = await db
    .select({ id: quickCollabCampaigns.id, requestId: quickCollabCampaigns.requestId })
    .from(quickCollabCampaigns)
    .where(eq(quickCollabCampaigns.id, campaignId))
    .limit(1);

  if (!campaign) return { success: false as const, error: "NOT_FOUND" };

  const [request] = await db
    .select({ brandId: quickCollabRequests.brandId })
    .from(quickCollabRequests)
    .where(eq(quickCollabRequests.id, campaign.requestId))
    .limit(1);

  if (!request || request.brandId !== user.id) {
    return { success: false as const, error: "UNAUTHORIZED" };
  }

  await db
    .update(quickCollabCampaigns)
    .set({ ...parsed.data, isEdited: true, updatedAt: new Date() })
    .where(eq(quickCollabCampaigns.id, campaignId));

  return { success: true as const };
}

// ─── Generate Outreach Messages ─────────────────────────────────────────────

export interface OutreachDraft {
  id: string;
  matchId: string;
  creatorId: string;
  creatorName: string | null;
  creatorUsername: string | null;
  creatorAvatar: string | null;
  message: string;
  status: string;
}

export async function generateOutreachMessages(campaignId: string) {
  const user = await getBrandUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  // Verify ownership
  const [campaign] = await db
    .select()
    .from(quickCollabCampaigns)
    .where(eq(quickCollabCampaigns.id, campaignId))
    .limit(1);

  if (!campaign) return { success: false as const, error: "NOT_FOUND" };

  const [request] = await db
    .select()
    .from(quickCollabRequests)
    .where(eq(quickCollabRequests.id, campaign.requestId))
    .limit(1);

  if (!request || request.brandId !== user.id) {
    return { success: false as const, error: "UNAUTHORIZED" };
  }

  // Get selected matches with creator info
  const selectedMatches = await db
    .select({
      matchId: quickCollabMatches.id,
      creatorId: quickCollabMatches.creatorId,
      matchScore: quickCollabMatches.matchScore,
      fitLabel: quickCollabMatches.fitLabel,
      fitReasons: quickCollabMatches.fitReasons,
      estimatedBudgetFit: quickCollabMatches.estimatedBudgetFit,
      fullName: users.fullName,
      username: users.username,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
      categories: users.categories,
      location: users.location,
    })
    .from(quickCollabMatches)
    .innerJoin(users, eq(quickCollabMatches.creatorId, users.id))
    .where(
      and(
        eq(quickCollabMatches.requestId, request.id),
        eq(quickCollabMatches.status, "selected"),
      ),
    );

  if (selectedMatches.length === 0) {
    return { success: false as const, error: "NO_SELECTED_CREATORS" };
  }

  // Delete existing draft outreaches if re-generating
  await db
    .delete(quickCollabOutreaches)
    .where(eq(quickCollabOutreaches.campaignId, campaignId));

  const brandContactName =
    user.contactName ?? user.fullName ?? request.businessName;

  // Generate messages and insert
  const outreachValues = selectedMatches.map((m) => {
    const scoredCreator = {
      id: m.creatorId,
      fullName: m.fullName,
      username: m.username,
      avatarUrl: m.avatarUrl,
      bio: m.bio,
      categories: m.categories,
      location: m.location,
      matchScore: m.matchScore,
      fitLabel: m.fitLabel,
      fitReasons: m.fitReasons,
      estimatedBudgetFit: m.estimatedBudgetFit,
      totalFollowers: 0,
      socialAccounts: [],
    };

    const message = generateOutreachMessage(
      request,
      scoredCreator,
      brandContactName,
      user.location,
    );

    return {
      campaignId,
      matchId: m.matchId,
      creatorId: m.creatorId,
      message,
      status: "draft" as const,
    };
  });

  const inserted = await db
    .insert(quickCollabOutreaches)
    .values(outreachValues)
    .returning();

  const outreaches: OutreachDraft[] = inserted.map((row, i) => ({
    id: row.id,
    matchId: row.matchId,
    creatorId: row.creatorId,
    creatorName: selectedMatches[i].fullName,
    creatorUsername: selectedMatches[i].username,
    creatorAvatar: selectedMatches[i].avatarUrl,
    message: row.message,
    status: row.status,
  }));

  return { success: true as const, outreaches };
}

// ─── Update Outreach Message ────────────────────────────────────────────────

export async function updateOutreachMessage(
  outreachId: string,
  message: string,
) {
  const user = await getBrandUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  if (!message.trim()) return { success: false as const, error: "VALIDATION_ERROR" };

  // Verify ownership chain
  const [outreach] = await db
    .select({
      id: quickCollabOutreaches.id,
      campaignId: quickCollabOutreaches.campaignId,
    })
    .from(quickCollabOutreaches)
    .where(eq(quickCollabOutreaches.id, outreachId))
    .limit(1);

  if (!outreach) return { success: false as const, error: "NOT_FOUND" };

  const [campaign] = await db
    .select({ requestId: quickCollabCampaigns.requestId })
    .from(quickCollabCampaigns)
    .where(eq(quickCollabCampaigns.id, outreach.campaignId))
    .limit(1);

  if (!campaign) return { success: false as const, error: "NOT_FOUND" };

  const [request] = await db
    .select({ brandId: quickCollabRequests.brandId })
    .from(quickCollabRequests)
    .where(eq(quickCollabRequests.id, campaign.requestId))
    .limit(1);

  if (!request || request.brandId !== user.id) {
    return { success: false as const, error: "UNAUTHORIZED" };
  }

  await db
    .update(quickCollabOutreaches)
    .set({ message, updatedAt: new Date() })
    .where(eq(quickCollabOutreaches.id, outreachId));

  return { success: true as const };
}

// ─── Send Outreaches ────────────────────────────────────────────────────────

export async function sendOutreaches(outreachIds: string[]) {
  const user = await getBrandUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  if (outreachIds.length === 0) {
    return { success: false as const, error: "NO_OUTREACHES" };
  }

  let sentCount = 0;

  for (const outreachId of outreachIds) {
    const [outreach] = await db
      .select()
      .from(quickCollabOutreaches)
      .where(
        and(
          eq(quickCollabOutreaches.id, outreachId),
          eq(quickCollabOutreaches.status, "draft"),
        ),
      )
      .limit(1);

    if (!outreach) continue;

    // Get campaign → request for title/budget
    const [campaign] = await db
      .select({ requestId: quickCollabCampaigns.requestId })
      .from(quickCollabCampaigns)
      .where(eq(quickCollabCampaigns.id, outreach.campaignId))
      .limit(1);

    if (!campaign) continue;

    const [request] = await db
      .select()
      .from(quickCollabRequests)
      .where(eq(quickCollabRequests.id, campaign.requestId))
      .limit(1);

    if (!request || request.brandId !== user.id) continue;

    // Create real collaboration request
    const collabTypeLabels: Record<string, string> = {
      instagram_story: "Instagram Story",
      instagram_post: "Instagram Post",
      youtube_promo: "YouTube Promo",
      tiktok_post: "TikTok Post",
      podcast_mention: "Podcast Mention",
      other: "Custom Collaboration",
    };

    const [collabRequest] = await db
      .insert(collaborationRequests)
      .values({
        brandId: user.id,
        creatorId: outreach.creatorId,
        title: `QuickCollab: ${collabTypeLabels[request.collabType] ?? request.collabType} for ${request.businessName}`,
        message: outreach.message,
        budget: budgetRangeToCents(request.budgetRange),
        currency: "usd",
        deadline: timingToDeadline(request.timing),
        status: "pending",
      })
      .returning();

    // Update outreach with link and status
    const now = new Date();
    await db
      .update(quickCollabOutreaches)
      .set({
        status: "sent",
        sentAt: now,
        collabRequestId: collabRequest.id,
        updatedAt: now,
      })
      .where(eq(quickCollabOutreaches.id, outreachId));

    // Notify creator
    const [creator] = await db
      .select({ id: users.id, email: users.email, fullName: users.fullName })
      .from(users)
      .where(eq(users.id, outreach.creatorId))
      .limit(1);

    if (creator) {
      createAndEmail({
        userId: creator.id,
        type: "collab_request",
        title: `New collaboration request from ${user.brandName ?? user.fullName ?? "a brand"}`,
        body: `${user.brandName ?? user.fullName ?? "A brand"} wants to collaborate with you: "${collabRequest.title}". Review and accept or decline on your dashboard.`,
        actionUrl: "/creator/dashboard",
        referenceId: collabRequest.id,
        referenceType: "collab_request",
        email: creator.email,
        emailSubject: `New collaboration request: ${collabRequest.title}`,
      }).catch(() => {});
    }

    sentCount++;
  }

  return { success: true as const, sentCount };
}

// ─── Tracking Dashboard ─────────────────────────────────────────────────────

export interface TrackingItem {
  outreachId: string;
  creatorId: string;
  creatorName: string | null;
  creatorUsername: string | null;
  creatorAvatar: string | null;
  collabType: string;
  businessName: string;
  outreachStatus: string;
  collabStatus: string | null;
  effectiveStatus: string;
  sentAt: Date | null;
  createdAt: Date;
}

export async function getQuickCollabTracking(): Promise<TrackingItem[]> {
  const user = await getBrandUser();
  if (!user) return [];

  // Get all outreaches for this brand's requests
  const outreaches = await db
    .select({
      outreachId: quickCollabOutreaches.id,
      creatorId: quickCollabOutreaches.creatorId,
      outreachStatus: quickCollabOutreaches.status,
      collabRequestId: quickCollabOutreaches.collabRequestId,
      sentAt: quickCollabOutreaches.sentAt,
      createdAt: quickCollabOutreaches.createdAt,
      campaignId: quickCollabOutreaches.campaignId,
    })
    .from(quickCollabOutreaches)
    .innerJoin(
      quickCollabCampaigns,
      eq(quickCollabOutreaches.campaignId, quickCollabCampaigns.id),
    )
    .innerJoin(
      quickCollabRequests,
      eq(quickCollabCampaigns.requestId, quickCollabRequests.id),
    )
    .where(eq(quickCollabRequests.brandId, user.id))
    .orderBy(desc(quickCollabOutreaches.createdAt));

  if (outreaches.length === 0) return [];

  // Batch fetch creators
  const creatorsData = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      username: users.username,
      avatarUrl: users.avatarUrl,
    })
    .from(users);
  const creatorMap = new Map(creatorsData.map((c) => [c.id, c]));

  // Batch fetch collab request statuses
  const collabIds = outreaches
    .map((o) => o.collabRequestId)
    .filter(Boolean) as string[];
  let collabStatusMap = new Map<string, string>();
  if (collabIds.length > 0) {
    const collabs = await db
      .select({ id: collaborationRequests.id, status: collaborationRequests.status })
      .from(collaborationRequests);
    collabStatusMap = new Map(collabs.map((c) => [c.id, c.status]));
  }

  // Fetch request info for each outreach via campaign
  const campaigns = await db
    .select({
      id: quickCollabCampaigns.id,
      requestId: quickCollabCampaigns.requestId,
    })
    .from(quickCollabCampaigns);
  const campaignMap = new Map(campaigns.map((c) => [c.id, c.requestId]));

  const requests = await db.select().from(quickCollabRequests).where(eq(quickCollabRequests.brandId, user.id));
  const requestMap = new Map(requests.map((r) => [r.id, r]));

  return outreaches.map((o) => {
    const creator = creatorMap.get(o.creatorId);
    const collabStatus = o.collabRequestId
      ? collabStatusMap.get(o.collabRequestId) ?? null
      : null;

    // Effective status: prioritize collab response over outreach status
    let effectiveStatus = o.outreachStatus;
    if (collabStatus === "accepted") effectiveStatus = "accepted";
    else if (collabStatus === "declined") effectiveStatus = "declined";

    const requestId = campaignMap.get(o.campaignId);
    const request = requestId ? requestMap.get(requestId) : null;

    return {
      outreachId: o.outreachId,
      creatorId: o.creatorId,
      creatorName: creator?.fullName ?? null,
      creatorUsername: creator?.username ?? null,
      creatorAvatar: creator?.avatarUrl ?? null,
      collabType: request?.collabType ?? "",
      businessName: request?.businessName ?? "",
      outreachStatus: o.outreachStatus,
      collabStatus,
      effectiveStatus,
      sentAt: o.sentAt,
      createdAt: o.createdAt,
    };
  });
}

// ─── Get Request (for resuming) ─────────────────────────────────────────────

export async function getQuickCollabRequest(requestId: string) {
  const user = await getBrandUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const [request] = await db
    .select()
    .from(quickCollabRequests)
    .where(
      and(
        eq(quickCollabRequests.id, requestId),
        eq(quickCollabRequests.brandId, user.id),
      ),
    )
    .limit(1);

  if (!request) return { success: false as const, error: "NOT_FOUND" };

  const matches = await db
    .select({
      matchId: quickCollabMatches.id,
      creatorId: quickCollabMatches.creatorId,
      matchScore: quickCollabMatches.matchScore,
      fitLabel: quickCollabMatches.fitLabel,
      fitReasons: quickCollabMatches.fitReasons,
      estimatedBudgetFit: quickCollabMatches.estimatedBudgetFit,
      status: quickCollabMatches.status,
      fullName: users.fullName,
      username: users.username,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
      categories: users.categories,
      location: users.location,
    })
    .from(quickCollabMatches)
    .innerJoin(users, eq(quickCollabMatches.creatorId, users.id))
    .where(eq(quickCollabMatches.requestId, requestId))
    .orderBy(desc(quickCollabMatches.matchScore));

  const [campaign] = await db
    .select()
    .from(quickCollabCampaigns)
    .where(eq(quickCollabCampaigns.requestId, requestId))
    .limit(1);

  let outreaches: OutreachDraft[] = [];
  if (campaign) {
    const rows = await db
      .select({
        id: quickCollabOutreaches.id,
        matchId: quickCollabOutreaches.matchId,
        creatorId: quickCollabOutreaches.creatorId,
        message: quickCollabOutreaches.message,
        status: quickCollabOutreaches.status,
        fullName: users.fullName,
        username: users.username,
        avatarUrl: users.avatarUrl,
      })
      .from(quickCollabOutreaches)
      .innerJoin(users, eq(quickCollabOutreaches.creatorId, users.id))
      .where(eq(quickCollabOutreaches.campaignId, campaign.id));

    outreaches = rows.map((r) => ({
      id: r.id,
      matchId: r.matchId,
      creatorId: r.creatorId,
      creatorName: r.fullName,
      creatorUsername: r.username,
      creatorAvatar: r.avatarUrl,
      message: r.message,
      status: r.status,
    }));
  }

  return {
    success: true as const,
    request,
    matches,
    campaign: campaign ?? null,
    outreaches,
  };
}
