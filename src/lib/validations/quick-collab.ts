import { z } from "zod";

export const quickCollabIntakeSchema = z.object({
  businessName: z.string().min(1).max(255),
  businessCategory: z.enum([
    "fashion",
    "tech",
    "lifestyle",
    "fitness",
    "food",
    "travel",
    "education",
    "entertainment",
    "business",
    "other",
  ]),
  collabType: z.enum([
    "instagram_story",
    "instagram_post",
    "youtube_promo",
    "tiktok_post",
    "podcast_mention",
    "other",
  ]),
  collabTypeOther: z.string().max(200).optional(),
  campaignIntent: z.string().min(1).max(500),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  radius: z.number().int().positive().optional(),
  budgetRange: z.enum([
    "under_50",
    "50_100",
    "100_250",
    "250_500",
    "500_plus",
  ]),
  timing: z.enum(["asap", "this_week", "this_month", "flexible"]),
  notes: z.string().max(1000).optional(),
});

export type QuickCollabIntakeValues = z.infer<typeof quickCollabIntakeSchema>;

export const campaignEditSchema = z.object({
  goal: z.string().min(1).max(500),
  deliverable: z.string().min(1).max(500),
  budgetPerCreator: z.string().min(1).max(100),
  timeline: z.string().min(1).max(200),
  summary: z.string().min(1).max(2000),
});

export type CampaignEditValues = z.infer<typeof campaignEditSchema>;
