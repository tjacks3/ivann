import { z } from "zod";

// ─── Campaign Creation ────────────────────────────────────────────────────────

export const createCampaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required").max(255),
  description: z.string().max(2000).optional(),
  goal: z.string().max(500).optional(),
  totalBudgetInCents: z.number().int().positive("Budget must be greater than 0"),
  reachGoal: z.number().int().positive().optional(),
  targetAgeGroups: z.array(z.string()).optional(),
  targetLocations: z
    .array(
      z.object({
        city: z.string().max(100),
        state: z.string().max(100),
        radius: z.number().int().positive().optional(),
      }),
    )
    .optional(),
  campaignType: z.enum([
    "product_promotion",
    "brand_awareness",
    "restaurant_promotion",
    "event_marketing",
    "ugc",
    "giveaway",
    "launch",
    "ongoing_partnership",
  ]),
  platforms: z.array(z.string()).min(1, "Select at least one platform"),
  category: z.string().max(100).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreateCampaignValues = z.infer<typeof createCampaignSchema>;

// ─── Campaign Update ──────────────────────────────────────────────────────────

export const updateCampaignSchema = createCampaignSchema.partial();

export type UpdateCampaignValues = z.infer<typeof updateCampaignSchema>;

// ─── Matchmaking Preferences ──────────────────────────────────────────────────

export const matchmakingPrefsSchema = z.object({
  audienceDescription: z.string().max(500).optional(),
  preferLocalCreators: z.boolean().optional(),
  priority: z
    .enum(["reach", "engagement", "affordability", "niche_relevance"])
    .optional(),
  contentStyle: z.string().max(200).optional(),
  creatorSize: z
    .enum(["nano", "micro", "mid", "macro", "mega", "any"])
    .optional(),
  platformPriority: z.array(z.string()).optional(),
});

export type MatchmakingPrefsValues = z.infer<typeof matchmakingPrefsSchema>;

// ─── Budget Allocation ────────────────────────────────────────────────────────

export const allocateBudgetSchema = z.object({
  campaignId: z.string().uuid(),
  creatorId: z.string().uuid(),
  amountInCents: z.number().int().positive("Allocation must be greater than 0"),
});

export type AllocateBudgetValues = z.infer<typeof allocateBudgetSchema>;

// ─── Campaign Brief ───────────────────────────────────────────────────────────

export const campaignBriefSchema = z.object({
  goal: z.string().max(500).optional(),
  keyMessages: z.array(z.string()).optional(),
  hashtags: z.array(z.string()).optional(),
  mentions: z.array(z.string()).optional(),
  dosAndDonts: z.string().max(2000).optional(),
  postingWindow: z.string().max(200).optional(),
  additionalNotes: z.string().max(2000).optional(),
});

export type CampaignBriefValues = z.infer<typeof campaignBriefSchema>;

// ─── Creator-Specific Brief Override ──────────────────────────────────────────

export const creatorBriefOverrideSchema = z.object({
  campaignDealId: z.string().uuid(),
  brief: campaignBriefSchema,
  notes: z.string().max(2000).optional(),
});

export type CreatorBriefOverrideValues = z.infer<
  typeof creatorBriefOverrideSchema
>;

// ─── Creator Due Date ─────────────────────────────────────────────────────────

export const creatorDueDateSchema = z.object({
  campaignDealId: z.string().uuid(),
  dueDate: z.string(),
});

export type CreatorDueDateValues = z.infer<typeof creatorDueDateSchema>;
