import {
  pgTable,
  uuid,
  integer,
  timestamp,
  varchar,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { escrowStatusEnum } from "./enums";
import { users } from "./users";
import { deals } from "./deals";

export const dealPayments = pgTable(
  "deal_payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    dealId: uuid("deal_id")
      .notNull()
      .references(() => deals.id, { onDelete: "cascade" }),
    payerId: uuid("payer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    payeeId: uuid("payee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amountInCents: integer("amount_in_cents").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("usd"),
    status: escrowStatusEnum("status").notNull().default("unpaid"),
    stripePaymentIntentId: varchar("stripe_payment_intent_id", {
      length: 255,
    }),
    fundedAt: timestamp("funded_at", { withTimezone: true }),
    releasedAt: timestamp("released_at", { withTimezone: true }),
    refundedAt: timestamp("refunded_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("deal_payments_deal_id_unique").on(table.dealId),
    index("deal_payments_payer_id_idx").on(table.payerId),
    index("deal_payments_payee_id_idx").on(table.payeeId),
    index("deal_payments_status_idx").on(table.status),
  ],
);

export const dealPaymentsRelations = relations(dealPayments, ({ one }) => ({
  deal: one(deals, {
    fields: [dealPayments.dealId],
    references: [deals.id],
  }),
  payer: one(users, {
    fields: [dealPayments.payerId],
    references: [users.id],
    relationName: "payer",
  }),
  payee: one(users, {
    fields: [dealPayments.payeeId],
    references: [users.id],
    relationName: "payee",
  }),
}));

export type DealPayment = typeof dealPayments.$inferSelect;
export type NewDealPayment = typeof dealPayments.$inferInsert;
