import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  integer,
  boolean,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  qcBusinessCategoryEnum,
  qcCollabTypeEnum,
  qcBudgetRangeEnum,
  qcTimingEnum,
  qcMatchStatusEnum,
  qcOutreachStatusEnum,
} from "./enums";
import { users } from "./users";
import { collaborationRequests } from "./collaboration-requests";

// ─── QuickCollab Requests ───────────────────────────────────────────────────

export const quickCollabRequests = pgTable(
  "quick_collab_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    businessName: varchar("business_name", { length: 255 }).notNull(),
    businessCategory: qcBusinessCategoryEnum("business_category").notNull(),
    collabType: qcCollabTypeEnum("collab_type").notNull(),
    collabTypeOther: varchar("collab_type_other", { length: 200 }),
    campaignIntent: varchar("campaign_intent", { length: 500 }).notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    state: varchar("state", { length: 100 }).notNull(),
    radius: integer("radius"),
    budgetRange: qcBudgetRangeEnum("budget_range").notNull(),
    timing: qcTimingEnum("timing").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("qc_requests_brand_id_idx").on(table.brandId)],
);

export const quickCollabRequestsRelations = relations(
  quickCollabRequests,
  ({ one, many }) => ({
    brand: one(users, {
      fields: [quickCollabRequests.brandId],
      references: [users.id],
    }),
    matches: many(quickCollabMatches),
    campaign: one(quickCollabCampaigns),
  }),
);

// ─── QuickCollab Matches ────────────────────────────────────────────────────

export const quickCollabMatches = pgTable(
  "quick_collab_matches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requestId: uuid("request_id")
      .notNull()
      .references(() => quickCollabRequests.id, { onDelete: "cascade" }),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    matchScore: integer("match_score").notNull(),
    fitLabel: varchar("fit_label", { length: 100 }).notNull(),
    fitReasons: text("fit_reasons").array().notNull().default([]),
    estimatedBudgetFit: boolean("estimated_budget_fit")
      .notNull()
      .default(false),
    status: qcMatchStatusEnum("status").notNull().default("recommended"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("qc_matches_request_id_idx").on(table.requestId),
    index("qc_matches_creator_id_idx").on(table.creatorId),
  ],
);

export const quickCollabMatchesRelations = relations(
  quickCollabMatches,
  ({ one, many }) => ({
    request: one(quickCollabRequests, {
      fields: [quickCollabMatches.requestId],
      references: [quickCollabRequests.id],
    }),
    creator: one(users, {
      fields: [quickCollabMatches.creatorId],
      references: [users.id],
    }),
    outreaches: many(quickCollabOutreaches),
  }),
);

// ─── QuickCollab Campaigns ──────────────────────────────────────────────────

export const quickCollabCampaigns = pgTable("quick_collab_campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  requestId: uuid("request_id")
    .notNull()
    .unique()
    .references(() => quickCollabRequests.id, { onDelete: "cascade" }),
  goal: text("goal").notNull(),
  deliverable: text("deliverable").notNull(),
  budgetPerCreator: varchar("budget_per_creator", { length: 100 }).notNull(),
  timeline: varchar("timeline", { length: 200 }).notNull(),
  summary: text("summary").notNull(),
  isEdited: boolean("is_edited").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const quickCollabCampaignsRelations = relations(
  quickCollabCampaigns,
  ({ one, many }) => ({
    request: one(quickCollabRequests, {
      fields: [quickCollabCampaigns.requestId],
      references: [quickCollabRequests.id],
    }),
    outreaches: many(quickCollabOutreaches),
  }),
);

// ─── QuickCollab Outreaches ─────────────────────────────────────────────────

export const quickCollabOutreaches = pgTable(
  "quick_collab_outreaches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => quickCollabCampaigns.id, { onDelete: "cascade" }),
    matchId: uuid("match_id")
      .notNull()
      .references(() => quickCollabMatches.id, { onDelete: "cascade" }),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    status: qcOutreachStatusEnum("status").notNull().default("draft"),
    collabRequestId: uuid("collab_request_id").references(
      () => collaborationRequests.id,
      { onDelete: "set null" },
    ),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    viewedAt: timestamp("viewed_at", { withTimezone: true }),
    repliedAt: timestamp("replied_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("qc_outreaches_campaign_id_idx").on(table.campaignId),
    index("qc_outreaches_creator_id_idx").on(table.creatorId),
    index("qc_outreaches_status_idx").on(table.status),
  ],
);

export const quickCollabOutreachesRelations = relations(
  quickCollabOutreaches,
  ({ one }) => ({
    campaign: one(quickCollabCampaigns, {
      fields: [quickCollabOutreaches.campaignId],
      references: [quickCollabCampaigns.id],
    }),
    match: one(quickCollabMatches, {
      fields: [quickCollabOutreaches.matchId],
      references: [quickCollabMatches.id],
    }),
    creator: one(users, {
      fields: [quickCollabOutreaches.creatorId],
      references: [users.id],
    }),
    collaborationRequest: one(collaborationRequests, {
      fields: [quickCollabOutreaches.collabRequestId],
      references: [collaborationRequests.id],
    }),
  }),
);

// ─── Type Exports ───────────────────────────────────────────────────────────

export type QuickCollabRequest = typeof quickCollabRequests.$inferSelect;
export type NewQuickCollabRequest = typeof quickCollabRequests.$inferInsert;

export type QuickCollabMatch = typeof quickCollabMatches.$inferSelect;
export type NewQuickCollabMatch = typeof quickCollabMatches.$inferInsert;

export type QuickCollabCampaign = typeof quickCollabCampaigns.$inferSelect;
export type NewQuickCollabCampaign = typeof quickCollabCampaigns.$inferInsert;

export type QuickCollabOutreach = typeof quickCollabOutreaches.$inferSelect;
export type NewQuickCollabOutreach = typeof quickCollabOutreaches.$inferInsert;
