import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { dealStatusEnum } from "./enums";
import { users } from "./users";
import { collaborationRequests } from "./collaboration-requests";
import { messageThreads } from "./message-threads";
import { collaborations } from "./collaborations";

export const deals = pgTable(
  "deals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    collabRequestId: uuid("collab_request_id").references(
      () => collaborationRequests.id,
      { onDelete: "set null" },
    ),
    threadId: uuid("thread_id").references(() => messageThreads.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 255 }).notNull(),
    deliverables: text("deliverables"),
    budget: integer("budget"),
    currency: varchar("currency", { length: 3 }).notNull().default("usd"),
    timeline: varchar("timeline", { length: 255 }),
    status: dealStatusEnum("status").notNull().default("draft"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("deals_brand_id_idx").on(table.brandId),
    index("deals_creator_id_idx").on(table.creatorId),
    index("deals_status_idx").on(table.status),
  ],
);

// ─── Deal Revisions ─────────────────────────────────────────────────────────

export const dealRevisions = pgTable(
  "deal_revisions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    dealId: uuid("deal_id")
      .notNull()
      .references(() => deals.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    authorRole: varchar("author_role", { length: 10 }).notNull(),
    revisionNumber: integer("revision_number").notNull(),
    deliverables: text("deliverables"),
    budget: integer("budget"),
    currency: varchar("currency", { length: 3 }).notNull().default("usd"),
    timeline: varchar("timeline", { length: 255 }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("deal_revisions_deal_id_idx").on(table.dealId),
  ],
);

export const dealRevisionsRelations = relations(dealRevisions, ({ one }) => ({
  deal: one(deals, {
    fields: [dealRevisions.dealId],
    references: [deals.id],
  }),
  author: one(users, {
    fields: [dealRevisions.authorId],
    references: [users.id],
  }),
}));

export type DealRevision = typeof dealRevisions.$inferSelect;
export type NewDealRevision = typeof dealRevisions.$inferInsert;

// ─── Deal Relations ─────────────────────────────────────────────────────────

export const dealsRelations = relations(deals, ({ one, many }) => ({
  revisions: many(dealRevisions),
  brand: one(users, {
    fields: [deals.brandId],
    references: [users.id],
    relationName: "brandDeals",
  }),
  creator: one(users, {
    fields: [deals.creatorId],
    references: [users.id],
    relationName: "creatorDeals",
  }),
  collabRequest: one(collaborationRequests, {
    fields: [deals.collabRequestId],
    references: [collaborationRequests.id],
  }),
  thread: one(messageThreads, {
    fields: [deals.threadId],
    references: [messageThreads.id],
  }),
  collaboration: one(collaborations, {
    fields: [deals.id],
    references: [collaborations.dealId],
  }),
}));

export type Deal = typeof deals.$inferSelect;
export type NewDeal = typeof deals.$inferInsert;
