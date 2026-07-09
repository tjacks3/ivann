import type { Campaign } from "@/db/schema";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CreatorForCampaignMatching {
  id: string;
  fullName: string | null;
  username: string | null;
  avatarUrl: string | null;
  bio: string | null;
  categories: string[];
  location: string | null;
  socialAccounts: {
    platform: string;
    handle: string | null;
    followerCount: number | null;
    isVerified: boolean;
  }[];
}

export interface CampaignScoredCreator {
  creatorId: string;
  matchScore: number;
  fitLabel: string;
  fitReasons: string[];
  estimatedReach: number | null;
  estimatedPriceRange: string | null;
  audienceAgeFit: boolean | null;
  locationFit: boolean | null;
  platformFit: boolean | null;
}

export interface CampaignMatchResult {
  creators: CampaignScoredCreator[];
  totalFound: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const BUDGET_TO_FOLLOWER_RANGE: { min: number; max: number; label: string }[] =
  [
    { min: 0, max: 5_000, label: "$25 – $50" },
    { min: 1_000, max: 15_000, label: "$50 – $150" },
    { min: 5_000, max: 50_000, label: "$150 – $500" },
    { min: 10_000, max: 150_000, label: "$500 – $1,500" },
    { min: 25_000, max: Infinity, label: "$1,500+" },
  ];

function followerRangeForBudget(budgetInCents: number): {
  min: number;
  max: number;
  label: string;
} {
  const budgetDollars = budgetInCents / 100;
  if (budgetDollars < 50) return BUDGET_TO_FOLLOWER_RANGE[0];
  if (budgetDollars < 150) return BUDGET_TO_FOLLOWER_RANGE[1];
  if (budgetDollars < 500) return BUDGET_TO_FOLLOWER_RANGE[2];
  if (budgetDollars < 1500) return BUDGET_TO_FOLLOWER_RANGE[3];
  return BUDGET_TO_FOLLOWER_RANGE[4];
}

function matchLocation(
  creatorLocation: string | null,
  targetLocations: { city?: string; state?: string }[],
): boolean {
  if (!creatorLocation || targetLocations.length === 0) return false;
  const loc = creatorLocation.toLowerCase().trim();
  return targetLocations.some((t) => {
    const city = (t.city ?? "").toLowerCase().trim();
    const state = (t.state ?? "").toLowerCase().trim();
    const cityMatch = city.length > 1 && loc.includes(city);
    const stateMatch = state.length > 1 && loc.includes(state);
    return cityMatch || stateMatch;
  });
}

// ─── Scoring ────────────────────────────────────────────────────────────────

export function scoreCreatorsForCampaign(
  campaign: Campaign,
  creators: CreatorForCampaignMatching[],
): CampaignMatchResult {
  const requiredPlatforms = campaign.platforms ?? [];
  const campaignCategory = (campaign.category ?? "").toLowerCase();
  const targetLocations = (
    (campaign.targetLocations as { city?: string; state?: string }[]) ?? []
  );
  const hasLocationTargeting = targetLocations.length > 0;
  const perCreatorBudget = Math.round(
    campaign.totalBudgetInCents / Math.max(1, 3),
  ); // estimate 3 creators
  const followerRange = followerRangeForBudget(perCreatorBudget);

  const scored: CampaignScoredCreator[] = [];

  for (const creator of creators) {
    const reasons: string[] = [];
    const creatorPlatforms = creator.socialAccounts.map((sa) => sa.platform);
    const totalFollowers = creator.socialAccounts.reduce(
      (sum, sa) => sum + (sa.followerCount ?? 0),
      0,
    );

    // ── Platform match (30 pts max) ──
    let platformScore = 0;
    let platformFitVal = false;
    if (requiredPlatforms.length === 0) {
      platformScore = 15;
    } else {
      const matched = requiredPlatforms.filter((p) =>
        creatorPlatforms.includes(p),
      );
      if (matched.length === 0) continue; // hard filter
      platformScore = 30;
      platformFitVal = true;
      reasons.push(`Active on ${matched.join(", ")}`);
    }

    // ── Category match (30 pts max) ──
    let categoryScore = 0;
    if (!campaignCategory || campaignCategory === "other") {
      categoryScore = 10;
      reasons.push("Broad content fit");
    } else {
      const creatorCats = (creator.categories ?? []).map((c) =>
        c.toLowerCase(),
      );
      if (creatorCats.includes(campaignCategory)) {
        categoryScore = 30;
        reasons.push(`Strong category match: ${campaignCategory}`);
      } else {
        // Partial match — check if any creator categories are related
        const related = creatorCats.some(
          (c) =>
            c.includes(campaignCategory) || campaignCategory.includes(c),
        );
        if (related) {
          categoryScore = 15;
          reasons.push("Related category");
        }
      }
    }

    if (categoryScore === 0) continue;

    // ── Location match (20 pts max) ──
    let locationScore = 0;
    let locationFitVal: boolean | null = null;
    if (hasLocationTargeting) {
      locationFitVal = matchLocation(creator.location, targetLocations);
      if (locationFitVal) {
        locationScore = 20;
        reasons.push("Located in target area");
      }
    }

    // ── Budget/follower fit (20 pts max) ──
    let budgetScore = 0;
    if (
      totalFollowers >= followerRange.min &&
      totalFollowers <= followerRange.max
    ) {
      budgetScore = 20;
      reasons.push("Good fit for your budget range");
    } else {
      const lowerBound = followerRange.min * 0.5;
      const upperBound =
        followerRange.max === Infinity ? Infinity : followerRange.max * 1.5;
      if (totalFollowers >= lowerBound && totalFollowers <= upperBound) {
        budgetScore = 10;
        reasons.push("Near your budget range");
      }
    }

    const totalScore =
      platformScore + categoryScore + locationScore + budgetScore;

    if (totalScore < 30) continue;

    // Fit label
    let fitLabel: string;
    if (categoryScore >= 25 && platformFitVal && budgetScore >= 15) {
      fitLabel = "Top match";
    } else if (categoryScore >= 25 && platformFitVal) {
      fitLabel = "Strong niche match";
    } else if (locationFitVal && categoryScore > 0) {
      fitLabel = "Great local fit";
    } else if (budgetScore >= 15) {
      fitLabel = "Good budget fit";
    } else {
      fitLabel = "Potential match";
    }

    // Estimated reach — rough estimate from follower count
    const estimatedReach = Math.round(totalFollowers * 0.15);

    scored.push({
      creatorId: creator.id,
      matchScore: totalScore,
      fitLabel,
      fitReasons: reasons,
      estimatedReach: estimatedReach > 0 ? estimatedReach : null,
      estimatedPriceRange: followerRange.label,
      audienceAgeFit: null, // future: use audience data when available
      locationFit: locationFitVal,
      platformFit: platformFitVal || null,
    });
  }

  const sorted = scored.sort((a, b) => b.matchScore - a.matchScore);

  return {
    creators: sorted.slice(0, 15),
    totalFound: sorted.length,
  };
}
