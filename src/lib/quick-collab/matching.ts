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
  /** True when strict filters returned < 3 results and criteria were relaxed */
  relaxed: boolean;
  /** Describes what was relaxed, e.g. "location" */
  relaxedReason: string | null;
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

/**
 * Category mapping with tiers:
 * - primary: direct niche match (e.g. restaurant → food) — full points
 * - secondary: tangential relevance (e.g. restaurant → travel) — partial points
 */
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

/**
 * US state abbreviation → full name mapping for flexible location matching.
 * Handles "FL" matching "Florida", "CA" matching "California", etc.
 */
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

// Reverse map: full name → abbreviation
const US_STATE_FULL_TO_ABBREV: Record<string, string> = {};
for (const [abbrev, full] of Object.entries(US_STATE_ABBREV)) {
  US_STATE_FULL_TO_ABBREV[full] = abbrev;
}

// ─── Location Helpers ───────────────────────────────────────────────────────

/**
 * Check if a creator's location matches the requested city/state.
 * Returns: "city" | "state" | null
 *
 * Handles formats like "Miami, FL", "Miami, Florida", "San Francisco, CA"
 */
function matchLocation(
  creatorLocation: string | null,
  requestCity: string,
  requestState: string,
): "city" | "state" | null {
  if (!creatorLocation) return null;

  const loc = creatorLocation.toLowerCase().trim();
  const city = requestCity.toLowerCase().trim();
  const state = requestState.toLowerCase().trim();

  // Normalize the requested state to both abbreviation and full name
  const stateAbbrev = US_STATE_FULL_TO_ABBREV[state] ?? state;
  const stateFull = US_STATE_ABBREV[state] ?? state;

  // Check city match (city name appears in the location string)
  const cityMatch = city.length > 1 && loc.includes(city);

  // Check state match — try abbreviation and full name
  const stateMatch =
    (stateAbbrev.length === 2 && loc.includes(`, ${stateAbbrev}`)) ||
    loc.includes(stateFull) ||
    loc.includes(state);

  if (cityMatch && stateMatch) return "city";
  if (cityMatch) return "city"; // city name match alone is strong
  if (stateMatch) return "state";

  return null;
}

// ─── Scoring ────────────────────────────────────────────────────────────────

const MIN_STRICT_RESULTS = 3;
const STRICT_THRESHOLD = 55; // Strict mode: only high-relevance creators
const RELAXED_THRESHOLD = 40; // Relaxed mode: when strict returns too few

interface ScoringOptions {
  enforceLocation: boolean;
  enforceCategory: boolean;
}

function scoreCreatorsInternal(
  request: QuickCollabRequest,
  creators: CreatorForMatching[],
  options: ScoringOptions,
): ScoredCreator[] {
  const requiredPlatforms = COLLAB_TYPE_TO_PLATFORMS[request.collabType] ?? [];
  const categoryMap =
    BUSINESS_CATEGORY_MAP[request.businessCategory] ?? { primary: [], secondary: [] };
  const followerRange = BUDGET_RANGE_TO_FOLLOWER_RANGE[request.budgetRange] ?? {
    min: 0,
    max: Infinity,
  };
  const hasRadius = request.radius != null && request.radius > 0;

  const scored: ScoredCreator[] = [];

  for (const creator of creators) {
    const reasons: string[] = [];
    let platformScore = 0;
    let categoryScore = 0;
    let locationScore = 0;
    let budgetScore = 0;
    let budgetFit = false;

    const creatorPlatforms = creator.socialAccounts.map((sa) => sa.platform);
    const totalFollowers = creator.socialAccounts.reduce(
      (sum, sa) => sum + (sa.followerCount ?? 0),
      0,
    );

    // ── Platform match (0–25 points) — HARD REQUIREMENT ──
    const matchedPlatforms = requiredPlatforms.filter((p) =>
      creatorPlatforms.includes(p),
    );
    if (matchedPlatforms.length === 0) continue;
    platformScore = 25;
    reasons.push(`Active on ${matchedPlatforms.join(", ")}`);

    // ── Category match (0–35 points) — weighted by tier ──
    const primaryOverlap = creator.categories.filter((c) =>
      categoryMap.primary.includes(c),
    );
    const secondaryOverlap = creator.categories.filter((c) =>
      categoryMap.secondary.includes(c),
    );

    if (primaryOverlap.length > 0) {
      // Primary category match = strong signal
      categoryScore = Math.min(35, 25 + (primaryOverlap.length - 1) * 10);
      reasons.push(`Strong category match: ${primaryOverlap.join(", ")}`);
    } else if (secondaryOverlap.length > 0) {
      // Secondary only = weak signal
      categoryScore = Math.min(15, secondaryOverlap.length * 8);
      reasons.push(`Related category: ${secondaryOverlap.join(", ")}`);
    } else if (categoryMap.primary.length === 0) {
      // "other" business — give everyone baseline
      categoryScore = 10;
      reasons.push("Broad content fit");
    }

    // If enforcing category, skip creators with 0 category overlap
    if (options.enforceCategory && categoryScore === 0) continue;

    // ── Location match (0–25 points) ──
    const locMatch = matchLocation(creator.location, request.city, request.state);

    if (locMatch === "city") {
      locationScore = 25;
      reasons.push(`Located in ${request.city}`);
    } else if (locMatch === "state") {
      locationScore = 15;
      reasons.push(`Located in ${request.state}`);
    }

    // If radius is set and we're enforcing location, skip non-local creators
    if (options.enforceLocation && hasRadius && locationScore === 0) continue;

    // ── Budget/follower fit (0–15 points) ──
    if (
      totalFollowers >= followerRange.min &&
      totalFollowers <= followerRange.max
    ) {
      budgetFit = true;
      budgetScore = 15;
      reasons.push("Good fit for your budget range");
    } else {
      // Close to range (within 50% of bounds)
      const lowerBound = followerRange.min * 0.5;
      const upperBound =
        followerRange.max === Infinity ? Infinity : followerRange.max * 1.5;
      if (totalFollowers >= lowerBound && totalFollowers <= upperBound) {
        budgetScore = 7;
        reasons.push("Near your budget range");
      }
    }

    const totalScore = platformScore + categoryScore + locationScore + budgetScore;

    // Assign fit label based on strongest signal
    let fitLabel: string;
    if (primaryOverlap.length > 0 && locationScore >= 15) {
      fitLabel = "Top match";
    } else if (primaryOverlap.length > 0) {
      fitLabel = "Strong niche match";
    } else if (locationScore >= 15 && categoryScore > 0) {
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

export function scoreCreators(
  request: QuickCollabRequest,
  creators: CreatorForMatching[],
): MatchResult {
  const hasRadius = request.radius != null && request.radius > 0;

  // Pass 1: Strict — enforce location (if radius set) + enforce category
  const strict = scoreCreatorsInternal(request, creators, {
    enforceLocation: hasRadius,
    enforceCategory: true,
  }).filter((c) => c.matchScore >= STRICT_THRESHOLD);

  if (strict.length >= MIN_STRICT_RESULTS) {
    return {
      creators: strict.slice(0, 7),
      relaxed: false,
      relaxedReason: null,
    };
  }

  // Pass 2: Relax location (keep category enforced)
  if (hasRadius) {
    const relaxedLocation = scoreCreatorsInternal(request, creators, {
      enforceLocation: false,
      enforceCategory: true,
    }).filter((c) => c.matchScore >= RELAXED_THRESHOLD);

    if (relaxedLocation.length >= MIN_STRICT_RESULTS) {
      return {
        creators: relaxedLocation.slice(0, 7),
        relaxed: true,
        relaxedReason: "location",
      };
    }
  }

  // Pass 3: Relax both location and strict category
  const relaxedAll = scoreCreatorsInternal(request, creators, {
    enforceLocation: false,
    enforceCategory: false,
  }).filter((c) => c.matchScore >= RELAXED_THRESHOLD);

  if (relaxedAll.length > 0) {
    return {
      creators: relaxedAll.slice(0, 7),
      relaxed: true,
      relaxedReason: hasRadius ? "location and category" : "category",
    };
  }

  return { creators: [], relaxed: true, relaxedReason: "all criteria" };
}
