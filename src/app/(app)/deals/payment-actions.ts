"use server";

import { getAuthUser } from "@/lib/auth/get-auth-user";
import { db } from "@/db";
import { users, deals, dealPayments } from "@/db/schema";
import { eq, or, desc, sql } from "drizzle-orm";
import { createAndEmail } from "@/lib/notifications/create";

// ─── Auth Helper ────────────────────────────────────────────────────────────

async function getUser() {
  const authUser = await getAuthUser();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.authId, authUser.id))
    .limit(1);
  return user ?? null;
}

// ─── Init Funding (Brand Only) ──────────────────────────────────────────────

export async function initFunding(dealId: string) {
  const user = await getUser();
  if (!user || user.role !== "brand") {
    return { success: false as const, error: "UNAUTHORIZED" };
  }

  const [deal] = await db
    .select()
    .from(deals)
    .where(eq(deals.id, dealId))
    .limit(1);

  if (!deal) return { success: false as const, error: "NOT_FOUND" };
  if (deal.brandId !== user.id) return { success: false as const, error: "UNAUTHORIZED" };
  if (deal.status !== "accepted" && deal.status !== "in_progress") {
    return { success: false as const, error: "INVALID_STATUS" };
  }
  if (!deal.budget || deal.budget <= 0) {
    return { success: false as const, error: "NO_BUDGET" };
  }

  // Check for existing payment
  const [existing] = await db
    .select()
    .from(dealPayments)
    .where(eq(dealPayments.dealId, dealId))
    .limit(1);

  if (existing && existing.status !== "unpaid") {
    return { success: false as const, error: "ALREADY_FUNDED" };
  }

  if (existing) {
    // Update existing unpaid record to funding_pending
    await db
      .update(dealPayments)
      .set({ status: "funding_pending", updatedAt: new Date() })
      .where(eq(dealPayments.id, existing.id));
    return { success: true as const, paymentId: existing.id };
  }

  // Create new payment record
  const [payment] = await db
    .insert(dealPayments)
    .values({
      dealId,
      payerId: deal.brandId,
      payeeId: deal.creatorId,
      amountInCents: deal.budget,
      currency: deal.currency,
      status: "funding_pending",
    })
    .returning();

  return { success: true as const, paymentId: payment.id };
}

// ─── Confirm Funding (Mock) ─────────────────────────────────────────────────

export async function confirmFunding(paymentId: string) {
  const user = await getUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  const [payment] = await db
    .select()
    .from(dealPayments)
    .where(eq(dealPayments.id, paymentId))
    .limit(1);

  if (!payment) return { success: false as const, error: "NOT_FOUND" };
  if (payment.payerId !== user.id) return { success: false as const, error: "UNAUTHORIZED" };
  if (payment.status !== "funding_pending") {
    return { success: false as const, error: "INVALID_STATUS" };
  }

  const now = new Date();

  // Mock: immediately mark as funded
  await db
    .update(dealPayments)
    .set({ status: "funded", fundedAt: now, updatedAt: now })
    .where(eq(dealPayments.id, paymentId));

  // Notify creator
  const [deal] = await db
    .select({ title: deals.title })
    .from(deals)
    .where(eq(deals.id, payment.dealId))
    .limit(1);

  const [creator] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, payment.payeeId))
    .limit(1);

  if (creator && deal) {
    createAndEmail({
      userId: creator.id,
      type: "collab_update",
      title: `Payment secured for "${deal.title}"`,
      body: "The brand has funded this deal. Funds are held securely until completion.",
      actionUrl: `/deals/${payment.dealId}`,
      referenceId: payment.dealId,
      referenceType: "collab_request",
      email: creator.email,
      emailSubject: `Payment secured: ${deal.title}`,
    }).catch(() => {});
  }

  return { success: true as const };
}

// ─── Release Payment ────────────────────────────────────────────────────────

export async function releasePayment(dealId: string) {
  const [payment] = await db
    .select()
    .from(dealPayments)
    .where(eq(dealPayments.dealId, dealId))
    .limit(1);

  if (!payment || payment.status !== "funded") return;

  const now = new Date();

  await db
    .update(dealPayments)
    .set({ status: "released", releasedAt: now, updatedAt: now })
    .where(eq(dealPayments.id, payment.id));

  // Notify creator
  const [deal] = await db
    .select({ title: deals.title })
    .from(deals)
    .where(eq(deals.id, dealId))
    .limit(1);

  const [creator] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, payment.payeeId))
    .limit(1);

  if (creator && deal) {
    createAndEmail({
      userId: creator.id,
      type: "collab_update",
      title: `Payment released for "${deal.title}"`,
      body: "The brand has approved your deliverables. Payment has been released.",
      actionUrl: `/deals/${dealId}`,
      referenceId: dealId,
      referenceType: "collab_request",
      email: creator.email,
      emailSubject: `Payment released: ${deal.title}`,
    }).catch(() => {});
  }
}

// ─── Refund Payment ─────────────────────────────────────────────────────────

export async function refundPayment(dealId: string) {
  const [payment] = await db
    .select()
    .from(dealPayments)
    .where(eq(dealPayments.dealId, dealId))
    .limit(1);

  if (!payment || payment.status !== "funded") return;

  const now = new Date();

  await db
    .update(dealPayments)
    .set({ status: "refunded", refundedAt: now, updatedAt: now })
    .where(eq(dealPayments.id, payment.id));

  // Notify brand
  const [deal] = await db
    .select({ title: deals.title })
    .from(deals)
    .where(eq(deals.id, dealId))
    .limit(1);

  const [brand] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, payment.payerId))
    .limit(1);

  if (brand && deal) {
    createAndEmail({
      userId: brand.id,
      type: "collab_update",
      title: `Payment refunded for "${deal.title}"`,
      body: "The deal was cancelled. Your payment has been refunded.",
      actionUrl: `/deals/${dealId}`,
      referenceId: dealId,
      referenceType: "collab_request",
      email: brand.email,
      emailSubject: `Payment refunded: ${deal.title}`,
    }).catch(() => {});
  }
}

// ─── Get Deal Payment ───────────────────────────────────────────────────────

export interface DealPaymentInfo {
  id: string;
  amountInCents: number;
  currency: string;
  status: string;
  fundedAt: Date | null;
  releasedAt: Date | null;
  refundedAt: Date | null;
}

export async function getDealPayment(dealId: string): Promise<DealPaymentInfo | null> {
  const user = await getUser();
  if (!user) return null;

  const [deal] = await db
    .select({ brandId: deals.brandId, creatorId: deals.creatorId })
    .from(deals)
    .where(eq(deals.id, dealId))
    .limit(1);

  if (!deal || (deal.brandId !== user.id && deal.creatorId !== user.id)) return null;

  const [payment] = await db
    .select()
    .from(dealPayments)
    .where(eq(dealPayments.dealId, dealId))
    .limit(1);

  if (!payment) return null;

  return {
    id: payment.id,
    amountInCents: payment.amountInCents,
    currency: payment.currency,
    status: payment.status,
    fundedAt: payment.fundedAt,
    releasedAt: payment.releasedAt,
    refundedAt: payment.refundedAt,
  };
}

// ─── Payment Summary (Dashboard) ────────────────────────────────────────────

export interface TransactionItem {
  dealId: string;
  dealTitle: string;
  otherPartyName: string | null;
  amountInCents: number;
  currency: string;
  status: string;
  date: Date;
}

export interface PaymentSummary {
  totalReleased: number;
  totalFunded: number;
  currency: string;
  recentTransactions: TransactionItem[];
}

export async function getPaymentSummary(): Promise<PaymentSummary> {
  const user = await getUser();
  if (!user) return { totalReleased: 0, totalFunded: 0, currency: "usd", recentTransactions: [] };

  const isBrand = user.role === "brand";
  const userIdField = isBrand ? dealPayments.payerId : dealPayments.payeeId;

  // Get all payments for this user
  const allPayments = await db
    .select()
    .from(dealPayments)
    .where(eq(userIdField, user.id))
    .orderBy(desc(dealPayments.updatedAt));

  const totalReleased = allPayments
    .filter((p) => p.status === "released")
    .reduce((sum, p) => sum + p.amountInCents, 0);

  const totalFunded = allPayments
    .filter((p) => p.status === "funded")
    .reduce((sum, p) => sum + p.amountInCents, 0);

  // Get recent 5 transactions with deal + other party info
  const recent = allPayments.slice(0, 5);

  if (recent.length === 0) {
    return { totalReleased, totalFunded, currency: "usd", recentTransactions: [] };
  }

  // Batch fetch deal titles
  const dealIds = recent.map((p) => p.dealId);
  const dealsData = await db.select({ id: deals.id, title: deals.title }).from(deals);
  const dealMap = new Map(dealsData.map((d) => [d.id, d.title]));

  // Batch fetch other party names
  const otherIds = recent.map((p) => (isBrand ? p.payeeId : p.payerId));
  const otherUsers = await db
    .select({ id: users.id, fullName: users.fullName, brandName: users.brandName })
    .from(users);
  const userMap = new Map(otherUsers.map((u) => [u.id, u]));

  const recentTransactions: TransactionItem[] = recent.map((p) => {
    const otherId = isBrand ? p.payeeId : p.payerId;
    const other = userMap.get(otherId);
    return {
      dealId: p.dealId,
      dealTitle: dealMap.get(p.dealId) ?? "Deal",
      otherPartyName: isBrand
        ? other?.fullName ?? null
        : other?.brandName ?? other?.fullName ?? null,
      amountInCents: p.amountInCents,
      currency: p.currency,
      status: p.status,
      date: p.updatedAt,
    };
  });

  return {
    totalReleased,
    totalFunded,
    currency: recent[0]?.currency ?? "usd",
    recentTransactions,
  };
}
