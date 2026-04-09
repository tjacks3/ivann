import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  boolean,
  integer,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { socialPlatformEnum, socialAccountStatusEnum } from "./enums";
import { users } from "./users";
import { socialTokens } from "./social-tokens";

export const socialAccounts = pgTable(
  "social_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    platform: socialPlatformEnum("platform").notNull(),
    platformUserId: varchar("platform_user_id", { length: 255 }),
    handle: varchar("handle", { length: 255 }).notNull(),
    displayName: varchar("display_name", { length: 255 }),
    profileUrl: text("profile_url"),
    status: socialAccountStatusEnum("status").notNull().default("connected"),
    followerCount: integer("follower_count").notNull().default(0),
    isVerified: boolean("is_verified").notNull().default(false),
    connectedAt: timestamp("connected_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("social_accounts_user_platform_unique").on(
      table.userId,
      table.platform,
    ),
    index("social_accounts_user_id_idx").on(table.userId),
  ],
);

export const socialAccountsRelations = relations(
  socialAccounts,
  ({ one }) => ({
    user: one(users, {
      fields: [socialAccounts.userId],
      references: [users.id],
    }),
    token: one(socialTokens),
  }),
);

export type SocialAccount = typeof socialAccounts.$inferSelect;
export type NewSocialAccount = typeof socialAccounts.$inferInsert;
