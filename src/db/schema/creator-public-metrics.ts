import {
  pgTable,
  uuid,
  integer,
  numeric,
  timestamp,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { socialPlatformEnum } from "./enums";
import { users } from "./users";

export const creatorPublicMetrics = pgTable(
  "creator_public_metrics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    totalFollowers: integer("total_followers").notNull().default(0),
    platformCount: integer("platform_count").notNull().default(0),
    avgEngagement: numeric("avg_engagement", { precision: 5, scale: 2 }),
    topPlatform: socialPlatformEnum("top_platform"),
    lastUpdated: timestamp("last_updated", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("creator_public_metrics_user_id_unique").on(table.userId),
    index("creator_public_metrics_total_followers_idx").on(
      table.totalFollowers,
    ),
    index("creator_public_metrics_avg_engagement_idx").on(table.avgEngagement),
  ],
);

export const creatorPublicMetricsRelations = relations(
  creatorPublicMetrics,
  ({ one }) => ({
    user: one(users, {
      fields: [creatorPublicMetrics.userId],
      references: [users.id],
    }),
  }),
);

export type CreatorPublicMetric = typeof creatorPublicMetrics.$inferSelect;
export type NewCreatorPublicMetric = typeof creatorPublicMetrics.$inferInsert;
