import {
  pgTable,
  uuid,
  integer,
  timestamp,
  varchar,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { collaborationRequests } from "./collaboration-requests";

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    collabRequestId: uuid("collab_request_id").references(
      () => collaborationRequests.id,
      { onDelete: "set null" },
    ),
    payerId: uuid("payer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    payeeId: uuid("payee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amountInCents: integer("amount_in_cents").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("usd"),
    stripePaymentIntentId: varchar("stripe_payment_intent_id", {
      length: 255,
    }).unique(),
    stripeTransferId: varchar("stripe_transfer_id", { length: 255 }),
    status: varchar("status", { length: 50 }).notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("payments_payer_id_idx").on(table.payerId),
    index("payments_payee_id_idx").on(table.payeeId),
    index("payments_stripe_payment_intent_id_idx").on(
      table.stripePaymentIntentId,
    ),
  ],
);

export const paymentsRelations = relations(payments, ({ one }) => ({
  collabRequest: one(collaborationRequests, {
    fields: [payments.collabRequestId],
    references: [collaborationRequests.id],
  }),
  payer: one(users, {
    fields: [payments.payerId],
    references: [users.id],
    relationName: "payer",
  }),
  payee: one(users, {
    fields: [payments.payeeId],
    references: [users.id],
    relationName: "payee",
  }),
}));

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
