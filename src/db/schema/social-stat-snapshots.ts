import {
  pgTable,
  uuid,
  integer,
  numeric,
  timestamp,
  date,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { socialAccounts } from "./social-accounts";

export const socialStatSnapshots = pgTable(
  "social_stat_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    socialAccountId: uuid("social_account_id")
      .notNull()
      .references(() => socialAccounts.id, { onDelete: "cascade" }),
    followerCount: integer("follower_count").notNull(),
    followingCount: integer("following_count"),
    postCount: integer("post_count"),
    engagementRate: numeric("engagement_rate", {
      precision: 5,
      scale: 2,
    }),
    avgLikes: integer("avg_likes"),
    avgComments: integer("avg_comments"),
    snapshotDate: date("snapshot_date").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("social_stat_snapshots_account_date_unique").on(
      table.socialAccountId,
      table.snapshotDate,
    ),
    index("social_stat_snapshots_account_id_idx").on(table.socialAccountId),
    index("social_stat_snapshots_date_idx").on(table.snapshotDate),
  ],
);

export const socialStatSnapshotsRelations = relations(
  socialStatSnapshots,
  ({ one }) => ({
    socialAccount: one(socialAccounts, {
      fields: [socialStatSnapshots.socialAccountId],
      references: [socialAccounts.id],
    }),
  }),
);

export type SocialStatSnapshot = typeof socialStatSnapshots.$inferSelect;
export type NewSocialStatSnapshot = typeof socialStatSnapshots.$inferInsert;
