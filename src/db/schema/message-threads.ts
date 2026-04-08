import {
  pgTable,
  uuid,
  timestamp,
  varchar,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { collaborationRequests } from "./collaboration-requests";
import { messageThreadMembers } from "./message-thread-members";
import { messages } from "./messages";

export const messageThreads = pgTable(
  "message_threads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    collabRequestId: uuid("collab_request_id").references(
      () => collaborationRequests.id,
      { onDelete: "set null" },
    ),
    subject: varchar("subject", { length: 255 }),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("message_threads_last_message_at_idx").on(table.lastMessageAt),
  ],
);

export const messageThreadsRelations = relations(
  messageThreads,
  ({ one, many }) => ({
    collabRequest: one(collaborationRequests, {
      fields: [messageThreads.collabRequestId],
      references: [collaborationRequests.id],
    }),
    members: many(messageThreadMembers),
    messages: many(messages),
  }),
);

export type MessageThread = typeof messageThreads.$inferSelect;
export type NewMessageThread = typeof messageThreads.$inferInsert;
