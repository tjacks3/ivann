import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  integer,
  boolean,
  jsonb,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { collaborationStateEnum } from "./enums";
import { users } from "./users";
import { deals } from "./deals";

// ─── Collaborations ────────────────────────────────────────────────────────

export const collaborations = pgTable(
  "collaborations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    dealId: uuid("deal_id")
      .notNull()
      .references(() => deals.id, { onDelete: "cascade" }),
    brandUserId: uuid("brand_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    state: collaborationStateEnum("state")
      .notNull()
      .default("awaiting_brand_brief"),
    deliverableType: varchar("deliverable_type", { length: 100 }),
    dueDate: timestamp("due_date", { withTimezone: true }),
    budgetAmount: integer("budget_amount"),
    briefData: jsonb("brief_data"),
    submittedUrl: text("submitted_url"),
    submittedNote: text("submitted_note"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    revisionRequestedAt: timestamp("revision_requested_at", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("collaborations_deal_id_unique").on(table.dealId),
    index("collaborations_brand_user_id_idx").on(table.brandUserId),
    index("collaborations_creator_id_idx").on(table.creatorId),
    index("collaborations_state_idx").on(table.state),
  ],
);

export const collaborationsRelations = relations(
  collaborations,
  ({ one, many }) => ({
    deal: one(deals, {
      fields: [collaborations.dealId],
      references: [deals.id],
    }),
    brand: one(users, {
      fields: [collaborations.brandUserId],
      references: [users.id],
      relationName: "brandCollaborations",
    }),
    creator: one(users, {
      fields: [collaborations.creatorId],
      references: [users.id],
      relationName: "creatorCollaborations",
    }),
    messages: many(collaborationMessages),
    stateHistory: many(collaborationStateHistory),
  }),
);

export type Collaboration = typeof collaborations.$inferSelect;
export type NewCollaboration = typeof collaborations.$inferInsert;

// ─── Collaboration Messages ────────────────────────────────────────────────

export const collaborationMessages = pgTable(
  "collaboration_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    collaborationId: uuid("collaboration_id")
      .notNull()
      .references(() => collaborations.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    body: text("body").notNull(),
    isSystemEvent: boolean("is_system_event").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("collab_messages_collab_id_created_at_idx").on(
      table.collaborationId,
      table.createdAt,
    ),
  ],
);

export const collaborationMessagesRelations = relations(
  collaborationMessages,
  ({ one }) => ({
    collaboration: one(collaborations, {
      fields: [collaborationMessages.collaborationId],
      references: [collaborations.id],
    }),
    sender: one(users, {
      fields: [collaborationMessages.senderId],
      references: [users.id],
    }),
  }),
);

export type CollaborationMessage = typeof collaborationMessages.$inferSelect;
export type NewCollaborationMessage = typeof collaborationMessages.$inferInsert;

// ─── Collaboration State History ───────────────────────────────────────────

export const collaborationStateHistory = pgTable(
  "collaboration_state_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    collaborationId: uuid("collaboration_id")
      .notNull()
      .references(() => collaborations.id, { onDelete: "cascade" }),
    fromState: varchar("from_state", { length: 50 }),
    toState: varchar("to_state", { length: 50 }).notNull(),
    changedBy: uuid("changed_by").references(() => users.id, {
      onDelete: "set null",
    }),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("collab_state_history_collab_id_idx").on(table.collaborationId),
  ],
);

export const collaborationStateHistoryRelations = relations(
  collaborationStateHistory,
  ({ one }) => ({
    collaboration: one(collaborations, {
      fields: [collaborationStateHistory.collaborationId],
      references: [collaborations.id],
    }),
    user: one(users, {
      fields: [collaborationStateHistory.changedBy],
      references: [users.id],
    }),
  }),
);

export type CollaborationStateHistoryEntry =
  typeof collaborationStateHistory.$inferSelect;
export type NewCollaborationStateHistoryEntry =
  typeof collaborationStateHistory.$inferInsert;
