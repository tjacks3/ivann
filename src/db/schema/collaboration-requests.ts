import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  integer,
  date,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { collabStatusEnum } from "./enums";
import { users } from "./users";
import { packages } from "./packages";
import { messageThreads } from "./message-threads";

export const collaborationRequests = pgTable(
  "collaboration_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    packageId: uuid("package_id").references(() => packages.id, {
      onDelete: "set null",
    }),
    status: collabStatusEnum("status").notNull().default("pending"),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message"),
    budget: integer("budget"),
    currency: varchar("currency", { length: 3 }).notNull().default("usd"),
    deadline: date("deadline"),
    declinedReason: text("declined_reason"),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("collab_requests_brand_id_idx").on(table.brandId),
    index("collab_requests_creator_id_idx").on(table.creatorId),
    index("collab_requests_creator_id_status_idx").on(
      table.creatorId,
      table.status,
    ),
  ],
);

export const collaborationRequestsRelations = relations(
  collaborationRequests,
  ({ one }) => ({
    brand: one(users, {
      fields: [collaborationRequests.brandId],
      references: [users.id],
      relationName: "brand",
    }),
    creator: one(users, {
      fields: [collaborationRequests.creatorId],
      references: [users.id],
      relationName: "creator",
    }),
    package: one(packages, {
      fields: [collaborationRequests.packageId],
      references: [packages.id],
    }),
    messageThread: one(messageThreads),
  }),
);

export type CollaborationRequest =
  typeof collaborationRequests.$inferSelect;
export type NewCollaborationRequest =
  typeof collaborationRequests.$inferInsert;
