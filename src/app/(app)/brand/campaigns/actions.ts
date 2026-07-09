"use server";

import { getAuthUser } from "@/lib/auth/get-auth-user";
import { db } from "@/db";
import {
  users,
  campaigns,
  campaignDeals,
  campaignMatches,
  deals,
  collaborationRequests,
  messageThreads,
  messageThreadMembers,
  collaborations,
} from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { createAndEmail } from "@/lib/notifications/create";
import {
  createCampaignSchema,
  updateCampaignSchema,
  allocateBudgetSchema,
  type CreateCampaignValues,
  type UpdateCampaignValues,
} from "@/lib/validations/campaign";
import type { Campaign, CampaignDeal, CampaignMatch } from "@/db/schema";

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

// ─── Create Campaign ────────────────────────────────────────────────────────

export async function createCampaign(data: CreateCampaignValues) {
  const user = await getBrandUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const parsed = createCampaignSchema.safeParse(data);
  if (!parsed.success)
    return { success: false as const, error: "VALIDATION_ERROR" };

  const [campaign] = await db
    .insert(campaigns)
    .values({
      brandId: user.id,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      goal: parsed.data.goal ?? null,
      totalBudgetInCents: parsed.data.totalBudgetInCents,
      reachGoal: parsed.data.reachGoal ?? null,
      targetAgeGroups: parsed.data.targetAgeGroups ?? null,
      targetLocations: parsed.data.targetLocations ?? null,
      campaignType: parsed.data.campaignType,
      platforms: parsed.data.platforms,
      category: parsed.data.category ?? null,
      startDate: parsed.data.startDate ?? null,
      endDate: parsed.data.endDate ?? null,
      status: "draft",
    })
    .returning();

  return { success: true as const, campaignId: campaign.id };
}

// ─── Update Campaign ────────────────────────────────────────────────────────

export async function updateCampaign(
  campaignId: string,
  data: UpdateCampaignValues,
) {
  const user = await getBrandUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const parsed = updateCampaignSchema.safeParse(data);
  if (!parsed.success)
    return { success: false as const, error: "VALIDATION_ERROR" };

  const [existing] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, campaignId), eq(campaigns.brandId, user.id)))
    .limit(1);

  if (!existing) return { success: false as const, error: "NOT_FOUND" };

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.description !== undefined)
    updateData.description = parsed.data.description;
  if (parsed.data.goal !== undefined) updateData.goal = parsed.data.goal;
  if (parsed.data.totalBudgetInCents !== undefined)
    updateData.totalBudgetInCents = parsed.data.totalBudgetInCents;
  if (parsed.data.reachGoal !== undefined)
    updateData.reachGoal = parsed.data.reachGoal;
  if (parsed.data.targetAgeGroups !== undefined)
    updateData.targetAgeGroups = parsed.data.targetAgeGroups;
  if (parsed.data.targetLocations !== undefined)
    updateData.targetLocations = parsed.data.targetLocations;
  if (parsed.data.campaignType !== undefined)
    updateData.campaignType = parsed.data.campaignType;
  if (parsed.data.platforms !== undefined)
    updateData.platforms = parsed.data.platforms;
  if (parsed.data.category !== undefined)
    updateData.category = parsed.data.category;
  if (parsed.data.startDate !== undefined)
    updateData.startDate = parsed.data.startDate;
  if (parsed.data.endDate !== undefined)
    updateData.endDate = parsed.data.endDate;

  await db
    .update(campaigns)
    .set(updateData)
    .where(eq(campaigns.id, campaignId));

  return { success: true as const };
}

// ─── Update Campaign Status ─────────────────────────────────────────────────

export async function updateCampaignStatus(
  campaignId: string,
  status: Campaign["status"],
) {
  const user = await getBrandUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const [existing] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, campaignId), eq(campaigns.brandId, user.id)))
    .limit(1);

  if (!existing) return { success: false as const, error: "NOT_FOUND" };

  await db
    .update(campaigns)
    .set({ status, updatedAt: new Date() })
    .where(eq(campaigns.id, campaignId));

  return { success: true as const };
}

// ─── Get Campaign ───────────────────────────────────────────────────────────

export type CampaignWithDetails = Campaign & {
  campaignDeals: (CampaignDeal & {
    deal: Record<string, unknown> & {
      id: string;
      title: string;
      status: string;
      creatorId: string;
      budget: number | null;
      creator: Record<string, unknown> & {
        id: string;
        fullName: string | null;
        username: string | null;
        avatarUrl: string | null;
        categories: string[] | null;
        location: string | null;
      };
      collaboration: {
        id: string;
        state: string;
      } | null;
    };
  })[];
  campaignMatches: (CampaignMatch & {
    creator: Record<string, unknown> & {
      id: string;
      fullName: string | null;
      username: string | null;
      avatarUrl: string | null;
      categories: string[] | null;
      location: string | null;
    };
  })[];
  allocatedBudgetInCents: number;
  remainingBudgetInCents: number;
};

export async function getCampaign(campaignId: string) {
  const user = await getBrandUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const campaign = await db.query.campaigns.findFirst({
    where: and(eq(campaigns.id, campaignId), eq(campaigns.brandId, user.id)),
    with: {
      campaignDeals: {
        with: {
          deal: {
            with: {
              creator: true,
              collaboration: true,
            },
          },
        },
        orderBy: (cd, { asc }) => [asc(cd.sortOrder)],
      },
      campaignMatches: {
        with: {
          creator: true,
        },
      },
    },
  });

  if (!campaign) return { success: false as const, error: "NOT_FOUND" };

  // Compute budget
  const allocatedBudgetInCents = campaign.campaignDeals.reduce(
    (sum, cd) => sum + cd.allocatedBudgetInCents,
    0,
  );
  const remainingBudgetInCents =
    campaign.totalBudgetInCents - allocatedBudgetInCents;

  return {
    success: true as const,
    campaign: {
      ...campaign,
      allocatedBudgetInCents,
      remainingBudgetInCents,
    } as unknown as CampaignWithDetails,
  };
}

// ─── Get My Campaigns ───────────────────────────────────────────────────────

export type CampaignListItem = Campaign & {
  creatorCount: number;
  allocatedBudgetInCents: number;
};

export async function getMyCampaigns() {
  const user = await getBrandUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const allCampaigns = await db.query.campaigns.findMany({
    where: eq(campaigns.brandId, user.id),
    with: {
      campaignDeals: true,
    },
    orderBy: (c, { desc }) => [desc(c.createdAt)],
  });

  const items: CampaignListItem[] = allCampaigns.map((c) => ({
    ...c,
    creatorCount: c.campaignDeals.length,
    allocatedBudgetInCents: c.campaignDeals.reduce(
      (sum, cd) => sum + cd.allocatedBudgetInCents,
      0,
    ),
  }));

  return { success: true as const, campaigns: items };
}

// ─── Allocate Budget ────────────────────────────────────────────────────────

export async function allocateBudget(
  campaignId: string,
  campaignDealId: string,
  amountInCents: number,
) {
  const user = await getBrandUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  if (amountInCents <= 0)
    return { success: false as const, error: "VALIDATION_ERROR" };

  // Use raw SQL for row-level locking to prevent race conditions
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, campaignId), eq(campaigns.brandId, user.id)))
    .limit(1);

  if (!campaign) return { success: false as const, error: "NOT_FOUND" };

  // Get current total allocated (excluding this deal)
  const [existing] = await db
    .select()
    .from(campaignDeals)
    .where(eq(campaignDeals.id, campaignDealId))
    .limit(1);

  if (!existing || existing.campaignId !== campaignId)
    return { success: false as const, error: "NOT_FOUND" };

  const allDeals = await db
    .select()
    .from(campaignDeals)
    .where(eq(campaignDeals.campaignId, campaignId));

  const currentAllocated = allDeals.reduce(
    (sum, cd) =>
      sum + (cd.id === campaignDealId ? 0 : cd.allocatedBudgetInCents),
    0,
  );

  if (currentAllocated + amountInCents > campaign.totalBudgetInCents) {
    return { success: false as const, error: "OVER_BUDGET" };
  }

  await db
    .update(campaignDeals)
    .set({ allocatedBudgetInCents: amountInCents })
    .where(eq(campaignDeals.id, campaignDealId));

  return { success: true as const };
}

// ─── Budget Summary ─────────────────────────────────────────────────────────

export async function getCampaignBudgetSummary(campaignId: string) {
  const user = await getBrandUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, campaignId), eq(campaigns.brandId, user.id)))
    .limit(1);

  if (!campaign) return { success: false as const, error: "NOT_FOUND" };

  const allDeals = await db
    .select()
    .from(campaignDeals)
    .where(eq(campaignDeals.campaignId, campaignId));

  const allocatedBudgetInCents = allDeals.reduce(
    (sum, cd) => sum + cd.allocatedBudgetInCents,
    0,
  );

  return {
    success: true as const,
    totalBudgetInCents: campaign.totalBudgetInCents,
    allocatedBudgetInCents,
    remainingBudgetInCents:
      campaign.totalBudgetInCents - allocatedBudgetInCents,
    dealBreakdown: allDeals.map((cd) => ({
      campaignDealId: cd.id,
      dealId: cd.dealId,
      allocatedBudgetInCents: cd.allocatedBudgetInCents,
    })),
  };
}

// ─── Update Global Brief ────────────────────────────────────────────────────

export async function updateGlobalBrief(
  campaignId: string,
  briefData: Record<string, unknown>,
) {
  const user = await getBrandUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const [existing] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, campaignId), eq(campaigns.brandId, user.id)))
    .limit(1);

  if (!existing) return { success: false as const, error: "NOT_FOUND" };

  await db
    .update(campaigns)
    .set({ globalBrief: briefData, updatedAt: new Date() })
    .where(eq(campaigns.id, campaignId));

  return { success: true as const };
}

// ─── Update Creator Brief ───────────────────────────────────────────────────

export async function updateCreatorBrief(
  campaignDealId: string,
  briefData: Record<string, unknown>,
  notes?: string,
) {
  const user = await getBrandUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const [cd] = await db
    .select()
    .from(campaignDeals)
    .where(eq(campaignDeals.id, campaignDealId))
    .limit(1);

  if (!cd) return { success: false as const, error: "NOT_FOUND" };

  // Verify ownership
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, cd.campaignId), eq(campaigns.brandId, user.id)))
    .limit(1);

  if (!campaign) return { success: false as const, error: "NOT_FOUND" };

  await db
    .update(campaignDeals)
    .set({
      creatorSpecificBrief: briefData,
      creatorSpecificNotes: notes ?? null,
    })
    .where(eq(campaignDeals.id, campaignDealId));

  return { success: true as const };
}

// ─── Update Creator Due Date ────────────────────────────────────────────────

export async function updateCreatorDueDate(
  campaignDealId: string,
  dueDate: string | null,
) {
  const user = await getBrandUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const [cd] = await db
    .select()
    .from(campaignDeals)
    .where(eq(campaignDeals.id, campaignDealId))
    .limit(1);

  if (!cd) return { success: false as const, error: "NOT_FOUND" };

  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, cd.campaignId), eq(campaigns.brandId, user.id)))
    .limit(1);

  if (!campaign) return { success: false as const, error: "NOT_FOUND" };

  await db
    .update(campaignDeals)
    .set({ dueDate })
    .where(eq(campaignDeals.id, campaignDealId));

  return { success: true as const };
}

// ─── Send Campaign Offer ────────────────────────────────────────────────────

export interface SendCampaignOfferOptions {
  allocatedBudgetInCents: number;
  title: string;
  deliverables?: string;
  timeline?: string;
  notes?: string;
}

export async function sendCampaignOffer(
  campaignId: string,
  creatorId: string,
  options: SendCampaignOfferOptions,
) {
  const user = await getBrandUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const { allocatedBudgetInCents, title, deliverables, timeline, notes } =
    options;

  if (!title.trim()) return { success: false as const, error: "VALIDATION_ERROR" };

  // Verify campaign ownership
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, campaignId), eq(campaigns.brandId, user.id)))
    .limit(1);

  if (!campaign) return { success: false as const, error: "NOT_FOUND" };

  // Budget check
  const existingDeals = await db
    .select()
    .from(campaignDeals)
    .where(eq(campaignDeals.campaignId, campaignId));

  const currentAllocated = existingDeals.reduce(
    (sum, cd) => sum + cd.allocatedBudgetInCents,
    0,
  );

  if (currentAllocated + allocatedBudgetInCents > campaign.totalBudgetInCents) {
    return { success: false as const, error: "OVER_BUDGET" };
  }

  // Get creator info
  const [creator] = await db
    .select()
    .from(users)
    .where(eq(users.id, creatorId))
    .limit(1);

  if (!creator) return { success: false as const, error: "CREATOR_NOT_FOUND" };

  // Create collaboration request — clean, no campaign references
  const brandName = user.brandName ?? user.fullName ?? "A brand";
  const [collabRequest] = await db
    .insert(collaborationRequests)
    .values({
      brandId: user.id,
      creatorId,
      title,
      message: notes || "You've received a new deal offer.",
      budget: allocatedBudgetInCents,
      currency: "usd",
    })
    .returning();

  // Create message thread — clean title
  const [thread] = await db
    .insert(messageThreads)
    .values({
      collabRequestId: collabRequest.id,
      subject: title,
    })
    .returning();

  await db.insert(messageThreadMembers).values([
    { threadId: thread.id, userId: user.id },
    { threadId: thread.id, userId: creatorId },
  ]);

  // Create deal — clean, no campaign references
  const [deal] = await db
    .insert(deals)
    .values({
      brandId: user.id,
      creatorId,
      collabRequestId: collabRequest.id,
      threadId: thread.id,
      title,
      deliverables: deliverables || null,
      budget: allocatedBudgetInCents,
      timeline: timeline || null,
      notes: notes || null,
      status: "pending",
    })
    .returning();

  // Create campaign_deals junction (brand-side only, creators never see this)
  const sortOrder = existingDeals.length;
  await db.insert(campaignDeals).values({
    campaignId,
    dealId: deal.id,
    allocatedBudgetInCents,
    sortOrder,
  });

  // Update campaign status if still draft
  if (campaign.status === "draft" || campaign.status === "matching") {
    await db
      .update(campaigns)
      .set({ status: "recruiting", updatedAt: new Date() })
      .where(eq(campaigns.id, campaignId));
  }

  // Notify creator — clean, no campaign references
  await createAndEmail({
    userId: creatorId,
    type: "collab_request",
    title: `New deal offer from ${brandName}`,
    body: "You've received a new deal offer.",
    actionUrl: `/deals/${deal.id}`,
    email: creator.email,
  });

  return { success: true as const, dealId: deal.id };
}

// ─── Send Bulk Campaign Offers ──────────────────────────────────────────────

export async function sendBulkCampaignOffers(
  campaignId: string,
  creatorAllocations: { creatorId: string; options: SendCampaignOfferOptions }[],
) {
  const results: { creatorId: string; dealId?: string; error?: string }[] = [];

  for (const { creatorId, options } of creatorAllocations) {
    const result = await sendCampaignOffer(
      campaignId,
      creatorId,
      options,
    );
    if (result.success) {
      results.push({ creatorId, dealId: result.dealId });
    } else {
      results.push({ creatorId, error: result.error });
    }
  }

  return {
    success: true as const,
    results,
    sentCount: results.filter((r) => r.dealId).length,
  };
}

// ─── Match Creators For Campaign ────────────────────────────────────────────

export async function matchCreatorsForCampaign(campaignId: string) {
  const user = await getBrandUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, campaignId), eq(campaigns.brandId, user.id)))
    .limit(1);

  if (!campaign) return { success: false as const, error: "NOT_FOUND" };

  // Import the matching logic
  const { scoreCreatorsForCampaign } = await import(
    "@/lib/campaign/matching"
  );

  // Fetch all published creators with social accounts
  const allCreators = await db.query.users.findMany({
    where: and(
      eq(users.role, "creator"),
      eq(users.profileStatus, "published"),
    ),
    with: {
      socialAccounts: true,
    },
  });

  const matchResults = scoreCreatorsForCampaign(campaign, allCreators);

  // Clear previous matches for this campaign
  await db
    .delete(campaignMatches)
    .where(eq(campaignMatches.campaignId, campaignId));

  // Insert new matches
  if (matchResults.creators.length > 0) {
    await db.insert(campaignMatches).values(
      matchResults.creators.map((m) => ({
        campaignId,
        creatorId: m.creatorId,
        matchScore: m.matchScore,
        fitLabel: m.fitLabel,
        fitReasons: m.fitReasons,
        estimatedReach: m.estimatedReach ?? null,
        estimatedPriceRange: m.estimatedPriceRange ?? null,
        audienceAgeFit: m.audienceAgeFit ?? null,
        locationFit: m.locationFit ?? null,
        platformFit: m.platformFit ?? null,
        status: "recommended" as const,
        source: "matched" as const,
      })),
    );
  }

  // Update campaign status
  await db
    .update(campaigns)
    .set({ status: "matching", updatedAt: new Date() })
    .where(eq(campaigns.id, campaignId));

  // Fetch the inserted matches with creator info
  const matches = await db.query.campaignMatches.findMany({
    where: eq(campaignMatches.campaignId, campaignId),
    with: {
      creator: true,
    },
    orderBy: (cm, { desc }) => [desc(cm.matchScore)],
  });

  return {
    success: true as const,
    matches,
    totalFound: matchResults.totalFound,
  };
}

// ─── Add Creator To Campaign (Manual) ───────────────────────────────────────

export async function addCreatorToCampaign(
  campaignId: string,
  creatorId: string,
) {
  const user = await getBrandUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, campaignId), eq(campaigns.brandId, user.id)))
    .limit(1);

  if (!campaign) return { success: false as const, error: "NOT_FOUND" };

  // Check if already exists
  const [existing] = await db
    .select()
    .from(campaignMatches)
    .where(
      and(
        eq(campaignMatches.campaignId, campaignId),
        eq(campaignMatches.creatorId, creatorId),
      ),
    )
    .limit(1);

  if (existing) {
    // Re-add if skipped
    if (existing.status === "skipped") {
      await db
        .update(campaignMatches)
        .set({ status: "added" })
        .where(eq(campaignMatches.id, existing.id));
      return { success: true as const };
    }
    return { success: false as const, error: "ALREADY_ADDED" };
  }

  await db.insert(campaignMatches).values({
    campaignId,
    creatorId,
    matchScore: 0,
    fitLabel: "Manual selection",
    fitReasons: ["Manually added by brand"],
    source: "manual",
    status: "added",
  });

  return { success: true as const };
}

// ─── Update Campaign Match Status ───────────────────────────────────────────

export async function updateCampaignMatchStatus(
  matchId: string,
  status: "added" | "skipped",
) {
  const user = await getBrandUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const [match] = await db
    .select()
    .from(campaignMatches)
    .where(eq(campaignMatches.id, matchId))
    .limit(1);

  if (!match) return { success: false as const, error: "NOT_FOUND" };

  // Verify ownership
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(
      and(eq(campaigns.id, match.campaignId), eq(campaigns.brandId, user.id)),
    )
    .limit(1);

  if (!campaign) return { success: false as const, error: "NOT_FOUND" };

  await db
    .update(campaignMatches)
    .set({ status })
    .where(eq(campaignMatches.id, matchId));

  return { success: true as const };
}

// ─── Remove Creator From Campaign ───────────────────────────────────────────

export async function removeCreatorFromCampaign(
  campaignId: string,
  creatorId: string,
) {
  const user = await getBrandUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, campaignId), eq(campaigns.brandId, user.id)))
    .limit(1);

  if (!campaign) return { success: false as const, error: "NOT_FOUND" };

  // Check there's no deal created for this creator
  const existingDeals = await db
    .select()
    .from(campaignDeals)
    .innerJoin(deals, eq(deals.id, campaignDeals.dealId))
    .where(
      and(
        eq(campaignDeals.campaignId, campaignId),
        eq(deals.creatorId, creatorId),
      ),
    );

  if (existingDeals.length > 0) {
    return {
      success: false as const,
      error: "DEAL_EXISTS",
    };
  }

  await db
    .delete(campaignMatches)
    .where(
      and(
        eq(campaignMatches.campaignId, campaignId),
        eq(campaignMatches.creatorId, creatorId),
      ),
    );

  return { success: true as const };
}
