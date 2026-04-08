import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { socialAccounts } from "./social-accounts";

export const socialTokens = pgTable(
  "social_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    socialAccountId: uuid("social_account_id")
      .notNull()
      .references(() => socialAccounts.id, { onDelete: "cascade" }),
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token"),
    tokenType: varchar("token_type", { length: 50 }),
    scope: text("scope"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("social_tokens_social_account_id_unique").on(table.socialAccountId),
  ],
);

export const socialTokensRelations = relations(socialTokens, ({ one }) => ({
  socialAccount: one(socialAccounts, {
    fields: [socialTokens.socialAccountId],
    references: [socialAccounts.id],
  }),
}));

export type SocialToken = typeof socialTokens.$inferSelect;
export type NewSocialToken = typeof socialTokens.$inferInsert;
