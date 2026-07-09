import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  integer,
  boolean,
  jsonb,
  date,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  campaignTypeEnum,
  campaignStatusEnum,
  campaignMatchStatusEnum,
} from "./enums";
import { users } from "./users";
import { deals } from "./deals";

// ─── Campaigns ────────────────────────────────────────────────────────────────

export const campaigns = pgTable(
  "campaigns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    goal: text("goal"),
    totalBudgetInCents: integer("total_budget_in_cents").notNull(),
    reachGoal: integer("reach_goal"),
    targetAgeGroups: text("target_age_groups").array(),
    targetLocations: jsonb("target_locations"),
    campaignType: campaignTypeEnum("campaign_type").notNull(),
    platforms: text("platforms").array().notNull().default([]),
    category: varchar("category", { length: 100 }),
    globalBrief: jsonb("global_brief"),
    assets: jsonb("assets"),
    startDate: date("start_date"),
    endDate: date("end_date"),
    status: campaignStatusEnum("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("campaigns_brand_id_idx").on(table.brandId),
    index("campaigns_status_idx").on(table.status),
  ],
);

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  brand: one(users, {
    fields: [campaigns.brandId],
    references: [users.id],
  }),
  campaignDeals: many(campaignDeals),
  campaignMatches: many(campaignMatches),
}));

export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;

// ─── Campaign Deals (junction: campaign ↔ deal) ──────────────────────────────

export const campaignDeals = pgTable(
  "campaign_deals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    dealId: uuid("deal_id")
      .notNull()
      .references(() => deals.id, { onDelete: "cascade" }),
    allocatedBudgetInCents: integer("allocated_budget_in_cents").notNull(),
    creatorSpecificBrief: jsonb("creator_specific_brief"),
    creatorSpecificNotes: text("creator_specific_notes"),
    dueDate: date("due_date"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("campaign_deals_deal_id_unique").on(table.dealId),
    index("campaign_deals_campaign_id_idx").on(table.campaignId),
  ],
);

export const campaignDealsRelations = relations(campaignDeals, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignDeals.campaignId],
    references: [campaigns.id],
  }),
  deal: one(deals, {
    fields: [campaignDeals.dealId],
    references: [deals.id],
  }),
}));

export type CampaignDeal = typeof campaignDeals.$inferSelect;
export type NewCampaignDeal = typeof campaignDeals.$inferInsert;

// ─── Campaign Matches (matchmaking results before deals are created) ─────────

export const campaignMatches = pgTable(
  "campaign_matches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    matchScore: integer("match_score").notNull(),
    fitLabel: varchar("fit_label", { length: 100 }).notNull(),
    fitReasons: text("fit_reasons").array().notNull().default([]),
    estimatedReach: integer("estimated_reach"),
    estimatedPriceRange: varchar("estimated_price_range", { length: 100 }),
    audienceAgeFit: boolean("audience_age_fit"),
    locationFit: boolean("location_fit"),
    platformFit: boolean("platform_fit"),
    status: campaignMatchStatusEnum("status").notNull().default("recommended"),
    source: varchar("source", { length: 20 }).notNull().default("matched"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("campaign_matches_campaign_id_idx").on(table.campaignId),
    index("campaign_matches_creator_id_idx").on(table.creatorId),
  ],
);

export const campaignMatchesRelations = relations(
  campaignMatches,
  ({ one }) => ({
    campaign: one(campaigns, {
      fields: [campaignMatches.campaignId],
      references: [campaigns.id],
    }),
    creator: one(users, {
      fields: [campaignMatches.creatorId],
      references: [users.id],
    }),
  }),
);

export type CampaignMatch = typeof campaignMatches.$inferSelect;
export type NewCampaignMatch = typeof campaignMatches.$inferInsert;
