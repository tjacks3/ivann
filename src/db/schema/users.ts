import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { userRoleEnum, profileStatusEnum } from "./enums";
import { socialAccounts } from "./social-accounts";
import { packages } from "./packages";
import { collaborationRequests } from "./collaboration-requests";
import { messageThreadMembers } from "./message-thread-members";
import { favorites } from "./favorites";
import { messages } from "./messages";
import { notifications } from "./notifications";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  authId: uuid("auth_id").notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  fullName: varchar("full_name", { length: 255 }),
  avatarUrl: text("avatar_url"),
  role: userRoleEnum("role").notNull().default("creator"),
  bio: text("bio"),

  // Creator fields
  username: varchar("username", { length: 50 }).unique(),
  categories: text("categories").array().notNull().default([]),
  location: varchar("location", { length: 100 }),
  website: varchar("website", { length: 500 }),
  publicEmail: varchar("public_email", { length: 255 }),
  profileStatus: profileStatusEnum("profile_status").notNull().default("draft"),

  // Brand fields
  brandName: varchar("brand_name", { length: 255 }),
  contactName: varchar("contact_name", { length: 255 }),
  companyWebsite: varchar("company_website", { length: 500 }),
  industry: varchar("industry", { length: 100 }),

  // Stripe
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).unique(),
  stripeAccountId: varchar("stripe_account_id", { length: 255 }).unique(),

  // Onboarding tracking
  onboardingCompleted: boolean("onboarding_completed")
    .notNull()
    .default(false),
  onboardingStep: integer("onboarding_step").notNull().default(0),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  socialAccounts: many(socialAccounts),
  packages: many(packages),
  sentCollabRequests: many(collaborationRequests, {
    relationName: "brand",
  }),
  receivedCollabRequests: many(collaborationRequests, {
    relationName: "creator",
  }),
  threadMemberships: many(messageThreadMembers),
  sentMessages: many(messages),
  notifications: many(notifications),
  brandFavorites: many(favorites, { relationName: "brandFavorites" }),
  favoritedBy: many(favorites, { relationName: "creatorFavoritedBy" }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
