import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  boolean,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { packageStatusEnum, packageTypeEnum } from "./enums";
import { users } from "./users";
import { collaborationRequests } from "./collaboration-requests";

export const packages = pgTable(
  "packages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    type: packageTypeEnum("type").notNull(),
    status: packageStatusEnum("status").notNull().default("draft"),
    priceInCents: integer("price_in_cents").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("usd"),
    deliverables: text("deliverables"),
    deliveryDays: integer("delivery_days"),
    revisions: integer("revisions").notNull().default(1),
    isHighlighted: boolean("is_highlighted").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("packages_user_id_idx").on(table.userId),
    index("packages_user_id_status_idx").on(table.userId, table.status),
    index("packages_status_idx").on(table.status),
  ],
);

export const packagesRelations = relations(packages, ({ one, many }) => ({
  user: one(users, {
    fields: [packages.userId],
    references: [users.id],
  }),
  collaborationRequests: many(collaborationRequests),
}));

export type Package = typeof packages.$inferSelect;
export type NewPackage = typeof packages.$inferInsert;
