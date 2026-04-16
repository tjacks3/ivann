import { pgEnum } from "drizzle-orm/pg-core";

// User roles
export const userRoleEnum = pgEnum("user_role", ["creator", "brand", "admin"]);

// Social platforms
export const socialPlatformEnum = pgEnum("social_platform", [
  "instagram",
  "youtube",
  "tiktok",
  "twitter",
  "linkedin",
  "twitch",
  "website",
]);

// Social account status
export const socialAccountStatusEnum = pgEnum("social_account_status", [
  "connected",
  "error",
  "expired",
  "manual",
]);

// Package statuses and types
export const packageStatusEnum = pgEnum("package_status", [
  "draft",
  "active",
  "archived",
]);

export const packageTypeEnum = pgEnum("package_type", [
  "ugc",
  "sponsored_post",
  "story",
  "reel",
  "video",
  "bundle",
  "custom",
]);

// Collaboration request statuses
export const collabStatusEnum = pgEnum("collab_status", [
  "pending",
  "accepted",
  "declined",
  "expired",
  "cancelled",
]);

// Profile status
export const profileStatusEnum = pgEnum("profile_status", [
  "draft",
  "published",
  "archived",
]);

// Notification types
export const notificationTypeEnum = pgEnum("notification_type", [
  "collab_request",
  "collab_update",
  "message",
  "system",
]);

// Deal statuses
export const dealStatusEnum = pgEnum("deal_status", [
  "draft",
  "negotiating",
  "accepted",
  "in_progress",
  "delivered",
  "completed",
  "cancelled",
]);

// Escrow payment statuses
export const escrowStatusEnum = pgEnum("escrow_status", [
  "unpaid",
  "funding_pending",
  "funded",
  "released",
  "refunded",
]);

// QuickCollab enums
export const qcBusinessCategoryEnum = pgEnum("qc_business_category", [
  "fashion",
  "tech",
  "lifestyle",
  "fitness",
  "food",
  "travel",
  "education",
  "entertainment",
  "business",
  "other",
]);

export const qcCollabTypeEnum = pgEnum("qc_collab_type", [
  "instagram_story",
  "instagram_post",
  "youtube_promo",
  "tiktok_post",
  "podcast_mention",
  "other",
]);

export const qcBudgetRangeEnum = pgEnum("qc_budget_range", [
  "under_50",
  "50_100",
  "100_250",
  "250_500",
  "500_plus",
]);

export const qcTimingEnum = pgEnum("qc_timing", [
  "asap",
  "this_week",
  "this_month",
  "flexible",
]);

export const qcMatchStatusEnum = pgEnum("qc_match_status", [
  "recommended",
  "selected",
  "skipped",
]);

export const qcOutreachStatusEnum = pgEnum("qc_outreach_status", [
  "draft",
  "sent",
  "viewed",
  "replied",
  "accepted",
  "declined",
]);
