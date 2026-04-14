import type { QuickCollabRequest } from "@/db/schema/quick-collab";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CreatorForMatching {
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

export interface ScoredCreator extends CreatorForMatching {
  matchScore: number;
  fitLabel: string;
  fitReasons: string[];
  estimatedBudgetFit: boolean;
  totalFollowers: number;
}

export interface MatchResult {
  creators: ScoredCreator[];
  /** True when localOnly was on and few results were found */
  localLowResults: boolean;
  /** Number of results found (useful for UI messaging) */
  totalFound: number;
}

// ─── Maps ───────────────────────────────────────────────────────────────────

const COLLAB_TYPE_TO_PLATFORMS: Record<string, string[]> = {
  instagram_story: ["instagram"],
  instagram_post: ["instagram"],
  youtube_promo: ["youtube"],
  tiktok_post: ["tiktok"],
  podcast_mention: ["youtube", "twitch"],
  other: ["instagram", "youtube", "tiktok", "twitter", "linkedin", "twitch"],
};

const BUSINESS_CATEGORY_MAP: Record<
  string,
  { primary: string[]; secondary: string[] }
> = {
  fashion: { primary: ["fashion"], secondary: ["lifestyle", "entertainment"] },
  tech: { primary: ["tech"], secondary: ["education", "business"] },
  lifestyle: { primary: ["lifestyle"], secondary: ["fashion", "travel"] },
  fitness: { primary: ["fitness"], secondary: ["lifestyle", "food"] },
  food: { primary: ["food"], secondary: ["lifestyle", "travel"] },
  travel: { primary: ["travel"], secondary: ["lifestyle", "entertainment"] },
  education: { primary: ["education"], secondary: ["tech", "business"] },
  entertainment: { primary: ["entertainment"], secondary: ["lifestyle", "tech"] },
  business: { primary: ["business"], secondary: ["education", "lifestyle"] },
  other: { primary: [], secondary: [] },
};

const BUDGET_RANGE_TO_FOLLOWER_RANGE: Record<
  string,
  { min: number; max: number }
> = {
  under_50: { min: 0, max: 5_000 },
  "50_100": { min: 1_000, max: 15_000 },
  "100_250": { min: 5_000, max: 50_000 },
  "250_500": { min: 10_000, max: 150_000 },
  "500_plus": { min: 25_000, max: Infinity },
};

const US_STATE_ABBREV: Record<string, string> = {
  al: "alabama", ak: "alaska", az: "arizona", ar: "arkansas",
  ca: "california", co: "colorado", ct: "connecticut", de: "delaware",
  fl: "florida", ga: "georgia", hi: "hawaii", id: "idaho",
  il: "illinois", in: "indiana", ia: "iowa", ks: "kansas",
  ky: "kentucky", la: "louisiana", me: "maine", md: "maryland",
  ma: "massachusetts", mi: "michigan", mn: "minnesota", ms: "mississippi",
  mo: "missouri", mt: "montana", ne: "nebraska", nv: "nevada",
  nh: "new hampshire", nj: "new jersey", nm: "new mexico", ny: "new york",
  nc: "north carolina", nd: "north dakota", oh: "ohio", ok: "oklahoma",
  or: "oregon", pa: "pennsylvania", ri: "rhode island", sc: "south carolina",
  sd: "south dakota", tn: "tennessee", tx: "texas", ut: "utah",
  vt: "vermont", va: "virginia", wa: "washington", wv: "west virginia",
  wi: "wisconsin", wy: "wyoming",
};

const US_STATE_FULL_TO_ABBREV: Record<string, string> = {};
for (const [abbrev, full] of Object.entries(US_STATE_ABBREV)) {
  US_STATE_FULL_TO_ABBREV[full] = abbrev;
}

// ─── Location Helpers ───────────────────────────────────────────────────────

function matchLocation(
  creatorLocation: string | null,
  requestCity: string,
  requestState: string,
): "city" | "state" | null {
  if (!creatorLocation || (!requestCity && !requestState)) return null;

  const loc = creatorLocation.toLowerCase().trim();
  const city = requestCity.toLowerCase().trim();
  const state = requestState.toLowerCase().trim();

  const stateAbbrev = US_STATE_FULL_TO_ABBREV[state] ?? state;
  const stateFull = US_STATE_ABBREV[state] ?? state;

  const cityMatch = city.length > 1 && loc.includes(city);
  const stateMatch =
    (stateAbbrev.length === 2 && loc.includes(`, ${stateAbbrev}`)) ||
    loc.includes(stateFull) ||
    loc.includes(state);

  if (cityMatch && stateMatch) return "city";
  if (cityMatch) return "city";
  if (stateMatch) return "state";
  return null;
}

// ─── Scoring ────────────────────────────────────────────────────────────────

/**
 * Score creators with two distinct modes:
 *
 * Global mode (localOnly=false): Platform + Category + Budget. No location.
 * Local mode (localOnly=true): Platform + Category + Location + Budget.
 *   Location is a hard filter — non-local creators are excluded.
 */
function scoreCreatorsForMode(
  request: QuickCollabRequest,
  creators: CreatorForMatching[],
  localOnly: boolean,
): ScoredCreator[] {
  const requiredPlatforms = COLLAB_TYPE_TO_PLATFORMS[request.collabType] ?? [];
  const categoryMap =
    BUSINESS_CATEGORY_MAP[request.businessCategory] ?? { primary: [], secondary: [] };
  const followerRange = BUDGET_RANGE_TO_FOLLOWER_RANGE[request.budgetRange] ?? {
    min: 0,
    max: Infinity,
  };

  const scored: ScoredCreator[] = [];

  for (const creator of creators) {
    const reasons: string[] = [];
    let budgetFit = false;

    const creatorPlatforms = creator.socialAccounts.map((sa) => sa.platform);
    const totalFollowers = creator.socialAccounts.reduce(
      (sum, sa) => sum + (sa.followerCount ?? 0),
      0,
    );

    // ── Platform match — HARD REQUIREMENT ──
    const matchedPlatforms = requiredPlatforms.filter((p) =>
      creatorPlatforms.includes(p),
    );
    if (matchedPlatforms.length === 0) continue;

    let platformScore: number;
    if (localOnly) {
      platformScore = 25;
    } else {
      platformScore = 30;
    }
    reasons.push(`Active on ${matchedPlatforms.join(", ")}`);

    // ── Category match ──
    const primaryOverlap = creator.categories.filter((c) =>
      categoryMap.primary.includes(c),
    );
    const secondaryOverlap = creator.categories.filter((c) =>
      categoryMap.secondary.includes(c),
    );

    let categoryScore = 0;
    const maxCategoryPoints = localOnly ? 30 : 40;

    if (primaryOverlap.length > 0) {
      categoryScore = Math.min(maxCategoryPoints, maxCategoryPoints - 10 + primaryOverlap.length * 10);
      reasons.push(`Strong category match: ${primaryOverlap.join(", ")}`);
    } else if (secondaryOverlap.length > 0) {
      categoryScore = Math.min(15, secondaryOverlap.length * 8);
      reasons.push(`Related category: ${secondaryOverlap.join(", ")}`);
    } else if (categoryMap.primary.length === 0) {
      categoryScore = 10;
      reasons.push("Broad content fit");
    }

    // Skip creators with no category relevance
    if (categoryScore === 0) continue;

    // ── Location (only when localOnly=true) ──
    let locationScore = 0;
    if (localOnly) {
      const locMatch = matchLocation(
        creator.location,
        request.city,
        request.state,
      );

      if (locMatch === "city") {
        locationScore = 25;
        reasons.push(`Located in ${request.city}`);
      } else if (locMatch === "state") {
        locationScore = 15;
        reasons.push(`Located in ${request.state}`);
      } else {
        // Hard filter: skip non-local creators
        continue;
      }
    }

    // ── Budget/follower fit ──
    let budgetScore = 0;
    const maxBudgetPoints = localOnly ? 20 : 30;

    if (
      totalFollowers >= followerRange.min &&
      totalFollowers <= followerRange.max
    ) {
      budgetFit = true;
      budgetScore = maxBudgetPoints;
      reasons.push("Good fit for your budget range");
    } else {
      const lowerBound = followerRange.min * 0.5;
      const upperBound =
        followerRange.max === Infinity ? Infinity : followerRange.max * 1.5;
      if (totalFollowers >= lowerBound && totalFollowers <= upperBound) {
        budgetScore = Math.round(maxBudgetPoints * 0.5);
        reasons.push("Near your budget range");
      }
    }

    const totalScore = platformScore + categoryScore + locationScore + budgetScore;

    // Assign fit label
    let fitLabel: string;
    if (localOnly && primaryOverlap.length > 0 && locationScore >= 15) {
      fitLabel = "Top match";
    } else if (primaryOverlap.length > 0 && budgetFit) {
      fitLabel = "Strong niche match";
    } else if (primaryOverlap.length > 0) {
      fitLabel = "Strong niche match";
    } else if (localOnly && locationScore >= 15 && categoryScore > 0) {
      fitLabel = "Great local fit";
    } else if (budgetFit && categoryScore >= 10) {
      fitLabel = "Good budget fit";
    } else if (categoryScore > 0) {
      fitLabel = "Related niche";
    } else {
      fitLabel = "Potential match";
    }

    scored.push({
      ...creator,
      matchScore: totalScore,
      fitLabel,
      fitReasons: reasons,
      estimatedBudgetFit: budgetFit,
      totalFollowers,
    });
  }

  return scored.sort((a, b) => b.matchScore - a.matchScore);
}

// ─── Public API ─────────────────────────────────────────────────────────────

const GLOBAL_THRESHOLD = 50;
const GLOBAL_RELAXED_THRESHOLD = 35;
const LOCAL_THRESHOLD = 50;

export function scoreCreators(
  request: QuickCollabRequest,
  creators: CreatorForMatching[],
): MatchResult {
  const localOnly = request.localOnly;

  if (localOnly) {
    // Local mode: strict location filter, no fallback to non-local
    const results = scoreCreatorsForMode(request, creators, true)
      .filter((c) => c.matchScore >= LOCAL_THRESHOLD);

    return {
      creators: results.slice(0, 7),
      localLowResults: results.length < 3 && results.length > 0,
      totalFound: results.length,
    };
  }

  // Global mode: no location, category + platform + budget
  const strict = scoreCreatorsForMode(request, creators, false)
    .filter((c) => c.matchScore >= GLOBAL_THRESHOLD);

  if (strict.length >= 3) {
    return {
      creators: strict.slice(0, 7),
      localLowResults: false,
      totalFound: strict.length,
    };
  }

  // Relaxed: lower threshold
  const relaxed = scoreCreatorsForMode(request, creators, false)
    .filter((c) => c.matchScore >= GLOBAL_RELAXED_THRESHOLD);

  return {
    creators: relaxed.slice(0, 7),
    localLowResults: false,
    totalFound: relaxed.length,
  };
}
