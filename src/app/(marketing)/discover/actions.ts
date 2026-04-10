"use server";

import postgres from "postgres";
import type { DiscoverFilters } from "@/lib/validations/discover";

const PAGE_SIZE = 12;

export interface CreatorResult {
  id: string;
  fullName: string | null;
  username: string | null;
  avatarUrl: string | null;
  bio: string | null;
  categories: string[];
  location: string | null;
  totalFollowers: number;
  platformCount: number;
  isVerified: boolean;
  platforms: string[];
}

export async function searchCreators(params: DiscoverFilters) {
  const pgSql = postgres(process.env.DATABASE_URL!, { prepare: false });

  try {
    const {
      keyword,
      categories,
      platform,
      followerMin,
      followerMax,
      location,
      verifiedOnly,
      sort = "followers",
      page = 0,
    } = params;

    const conditions: string[] = [
      "u.role = 'creator'",
      "u.profile_status = 'published'",
    ];

    if (keyword?.trim()) {
      const escaped = keyword.trim().replace(/'/g, "''");
      conditions.push(
        `(u.full_name ILIKE '%${escaped}%' OR u.username ILIKE '%${escaped}%' OR u.bio ILIKE '%${escaped}%')`,
      );
    }

    if (categories && categories.length > 0) {
      const escaped = categories.map((c) => `'${c.replace(/'/g, "''")}'`).join(",");
      conditions.push(`u.categories && ARRAY[${escaped}]::text[]`);
    }

    if (platform) {
      const escaped = platform.replace(/'/g, "''");
      conditions.push(
        `EXISTS (SELECT 1 FROM social_accounts sa2 WHERE sa2.user_id = u.id AND sa2.platform = '${escaped}')`,
      );
    }

    if (location?.trim()) {
      const escaped = location.trim().replace(/'/g, "''");
      conditions.push(`u.location ILIKE '%${escaped}%'`);
    }

    if (verifiedOnly) {
      conditions.push(
        `EXISTS (SELECT 1 FROM social_accounts sa3 WHERE sa3.user_id = u.id AND sa3.is_verified = true)`,
      );
    }

    const havingParts: string[] = [];
    if (followerMin !== undefined && followerMin > 0) {
      havingParts.push(`COALESCE(SUM(sa.follower_count), 0) >= ${Math.floor(followerMin)}`);
    }
    if (followerMax !== undefined && followerMax > 0) {
      havingParts.push(`COALESCE(SUM(sa.follower_count), 0) <= ${Math.floor(followerMax)}`);
    }

    const whereClause = conditions.join(" AND ");
    const havingClause = havingParts.length > 0 ? `HAVING ${havingParts.join(" AND ")}` : "";

    const orderBy =
      sort === "newest"
        ? "u.created_at DESC"
        : sort === "az"
          ? "u.full_name ASC NULLS LAST"
          : "total_followers DESC";

    const offset = page * PAGE_SIZE;

    const [rows, countRows] = await Promise.all([
      pgSql.unsafe<CreatorResult[]>(`
        SELECT
          u.id,
          u.full_name AS "fullName",
          u.username,
          u.avatar_url AS "avatarUrl",
          u.bio,
          u.categories,
          u.location,
          COALESCE(SUM(sa.follower_count), 0)::int AS total_followers,
          COUNT(DISTINCT sa.id)::int AS "platformCount",
          COALESCE(BOOL_OR(sa.is_verified), false) AS "isVerified",
          COALESCE(ARRAY_AGG(DISTINCT sa.platform) FILTER (WHERE sa.platform IS NOT NULL), '{}') AS platforms
        FROM users u
        LEFT JOIN social_accounts sa ON sa.user_id = u.id
        WHERE ${whereClause}
        GROUP BY u.id
        ${havingClause}
        ORDER BY ${orderBy}
        LIMIT ${PAGE_SIZE + 1}
        OFFSET ${offset}
      `),
      pgSql.unsafe<{ total: number }[]>(`
        SELECT COUNT(*)::int AS total FROM (
          SELECT u.id
          FROM users u
          LEFT JOIN social_accounts sa ON sa.user_id = u.id
          WHERE ${whereClause}
          GROUP BY u.id
          ${havingClause}
        ) sub
      `),
    ]);

    // Map total_followers alias back to camelCase
    const creators = rows.slice(0, PAGE_SIZE).map((r) => ({
      ...r,
      totalFollowers: (r as unknown as { total_followers: number }).total_followers ?? 0,
    }));
    const hasMore = rows.length > PAGE_SIZE;
    const total = countRows[0]?.total ?? 0;

    return { creators, total, hasMore };
  } finally {
    await pgSql.end();
  }
}
