import { pgTable, uuid, text, timestamp, varchar, pgEnum, boolean, integer } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["creator", "brand", "admin"]);

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
  category: varchar("category", { length: 100 }),
  location: varchar("location", { length: 100 }),

  // Brand fields
  brandName: varchar("brand_name", { length: 255 }),
  contactName: varchar("contact_name", { length: 255 }),
  companyWebsite: varchar("company_website", { length: 500 }),
  industry: varchar("industry", { length: 100 }),

  // Onboarding tracking
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  onboardingStep: integer("onboarding_step").notNull().default(0),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
