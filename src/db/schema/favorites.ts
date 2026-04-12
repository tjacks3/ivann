import {
  pgTable,
  uuid,
  timestamp,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

export const favorites = pgTable(
  "favorites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandUserId: uuid("brand_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("favorites_brand_creator_unique").on(
      table.brandUserId,
      table.creatorId,
    ),
    index("favorites_brand_user_id_idx").on(table.brandUserId),
  ],
);

export const favoritesRelations = relations(favorites, ({ one }) => ({
  brandUser: one(users, {
    fields: [favorites.brandUserId],
    references: [users.id],
    relationName: "brandFavorites",
  }),
  creator: one(users, {
    fields: [favorites.creatorId],
    references: [users.id],
    relationName: "creatorFavoritedBy",
  }),
}));

export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
