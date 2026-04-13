import type { QuickCollabRequest } from "@/db/schema/quick-collab";
import type { ScoredCreator } from "./matching";

// ─── Label Maps ─────────────────────────────────────────────────────────────

const BUSINESS_CATEGORY_LABELS: Record<string, string> = {
  fashion: "fashion & beauty brand",
  tech: "tech company",
  lifestyle: "lifestyle brand",
  fitness: "fitness & health business",
  food: "food & dining business",
  travel: "travel business",
  education: "education provider",
  entertainment: "entertainment business",
  business: "business & finance company",
  other: "business",
};

const COLLAB_TYPE_LABELS: Record<string, string> = {
  instagram_story: "Instagram Story",
  instagram_post: "Instagram Post",
  youtube_promo: "YouTube Promo",
  tiktok_post: "TikTok Post",
  podcast_mention: "Podcast Mention",
  other: "Custom Collaboration",
};

const COLLAB_TYPE_DELIVERABLES: Record<string, string> = {
  instagram_story:
    "1 Instagram Story with location tag and business mention",
  instagram_post:
    "1 Instagram Post featuring the business with relevant tags",
  youtube_promo:
    "1 Short promo segment in a YouTube video featuring the business",
  tiktok_post: "1 TikTok Post promoting the business to local audience",
  podcast_mention:
    "1 Podcast Mention with business name and brief description",
  other: "1 Custom collaboration deliverable as discussed",
};

const BUDGET_RANGE_LABELS: Record<string, string> = {
  under_50: "under $50",
  "50_100": "$50–$100",
  "100_250": "$100–$250",
  "250_500": "$250–$500",
  "500_plus": "$500+",
};

const BUDGET_RANGE_PER_CREATOR: Record<string, string> = {
  under_50: "Up to $50 per creator",
  "50_100": "$50–$100 per creator",
  "100_250": "$100–$250 per creator",
  "250_500": "$250–$500 per creator",
  "500_plus": "$500+ per creator",
};

const TIMING_LABELS: Record<string, string> = {
  asap: "As soon as possible",
  this_week: "Within the next 7 days",
  this_month: "Within the next 30 days",
  flexible: "Flexible timeline",
};

const TIMING_SENTENCES: Record<string, string> = {
  asap: "I'm hoping to get this done as soon as possible.",
  this_week: "Ideally, I'd love this to go live within the next week.",
  this_month: "The timeline is within the next month or so.",
  flexible: "I'm flexible on timing — no rush.",
};

const INTENT_OPENERS: Record<string, string> = {
  local_awareness:
    "We're looking to build more local awareness for our business.",
  new_menu_item:
    "We just launched a new menu item and want to get the word out.",
  grand_opening:
    "We're celebrating a grand opening and would love to spread the word.",
  drive_weekend_visits:
    "We're trying to drive more weekend foot traffic to our location.",
  special_offer:
    "We have a special offer running and want to reach more people.",
};

// ─── Campaign Plan Generation ───────────────────────────────────────────────

export interface CampaignPlan {
  goal: string;
  deliverable: string;
  budgetPerCreator: string;
  timeline: string;
  summary: string;
}

export function generateCampaignPlan(
  request: QuickCollabRequest,
  selectedCount: number,
): CampaignPlan {
  const categoryLabel =
    BUSINESS_CATEGORY_LABELS[request.businessCategory] ?? "business";
  const collabLabel =
    COLLAB_TYPE_LABELS[request.collabType] ?? request.collabType;
  const deliverable =
    COLLAB_TYPE_DELIVERABLES[request.collabType] ?? `1 ${collabLabel}`;
  const budgetPerCreator =
    BUDGET_RANGE_PER_CREATOR[request.budgetRange] ?? request.budgetRange;
  const timeline = TIMING_LABELS[request.timing] ?? "Flexible";

  // Build goal from intent
  let goal: string;
  const intentKey = request.campaignIntent.toLowerCase().replace(/\s+/g, "_");
  if (INTENT_OPENERS[intentKey]) {
    goal = INTENT_OPENERS[intentKey];
  } else {
    goal = request.campaignIntent;
  }

  const summary = [
    `Campaign for ${request.businessName}`,
    `Goal: ${goal}`,
    `Deliverable: ${deliverable} × ${selectedCount} creator${selectedCount > 1 ? "s" : ""}`,
    `Budget: ${budgetPerCreator}`,
    `Timeline: ${timeline}`,
    request.city
      ? `Location focus: ${request.city}, ${request.state}`
      : undefined,
  ]
    .filter(Boolean)
    .join("\n");

  return { goal, deliverable, budgetPerCreator, timeline, summary };
}

// ─── Outreach Message Generation ────────────────────────────────────────────

export function generateOutreachMessage(
  request: QuickCollabRequest,
  creator: ScoredCreator,
  brandContactName: string,
): string {
  const firstName = creator.fullName?.split(" ")[0] ?? "there";
  const categoryLabel =
    BUSINESS_CATEGORY_LABELS[request.businessCategory] ?? "business";
  const deliverableLabel =
    COLLAB_TYPE_LABELS[request.collabType]?.toLowerCase() ??
    "a collaboration";
  const budgetLabel =
    BUDGET_RANGE_LABELS[request.budgetRange] ?? request.budgetRange;
  const timingSentence =
    TIMING_SENTENCES[request.timing] ?? "I'm flexible on timing.";

  // Pick intent opener
  const intentKey = request.campaignIntent.toLowerCase().replace(/\s+/g, "_");
  const intentOpener =
    INTENT_OPENERS[intentKey] ??
    `We're looking to ${request.campaignIntent.toLowerCase()}.`;

  // Pick top fit reason
  const topFitReason =
    creator.fitReasons[0]?.toLowerCase() ?? "your content is a great fit";

  const lines = [
    `Hi ${firstName},`,
    "",
    `I run ${request.businessName}, a local ${categoryLabel} in ${request.city}. ${intentOpener}`,
    "",
    `I came across your profile and think you'd be a great fit — ${topFitReason}.`,
    "",
    `I'm looking for ${deliverableLabel === "a collaboration" ? "a collaboration" : `a ${deliverableLabel}`} and my budget is ${budgetLabel}. ${timingSentence}`,
    "",
    "Would you be interested in collaborating? I'd love to discuss the details!",
    "",
    `Best,`,
    brandContactName,
  ];

  return lines.join("\n");
}

// ─── Budget Helpers ─────────────────────────────────────────────────────────

/** Returns the midpoint of a budget range in cents for collab request creation */
export function budgetRangeToCents(budgetRange: string): number {
  const map: Record<string, number> = {
    under_50: 2500,
    "50_100": 7500,
    "100_250": 17500,
    "250_500": 37500,
    "500_plus": 75000,
  };
  return map[budgetRange] ?? 10000;
}

/** Returns a deadline date string based on timing preference */
export function timingToDeadline(timing: string): string {
  const now = new Date();
  const map: Record<string, number> = {
    asap: 3,
    this_week: 7,
    this_month: 30,
    flexible: 60,
  };
  const days = map[timing] ?? 30;
  now.setDate(now.getDate() + days);
  return now.toISOString().split("T")[0];
}
