import {
  pgTable,
  uuid,
  timestamp,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { messageThreads } from "./message-threads";

export const messageThreadMembers = pgTable(
  "message_thread_members",
  {
    threadId: uuid("thread_id")
      .notNull()
      .references(() => messageThreads.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lastReadAt: timestamp("last_read_at", { withTimezone: true }),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.threadId, table.userId] }),
    index("message_thread_members_user_id_idx").on(table.userId),
  ],
);

export const messageThreadMembersRelations = relations(
  messageThreadMembers,
  ({ one }) => ({
    thread: one(messageThreads, {
      fields: [messageThreadMembers.threadId],
      references: [messageThreads.id],
    }),
    user: one(users, {
      fields: [messageThreadMembers.userId],
      references: [users.id],
    }),
  }),
);

export type MessageThreadMember = typeof messageThreadMembers.$inferSelect;
export type NewMessageThreadMember = typeof messageThreadMembers.$inferInsert;
