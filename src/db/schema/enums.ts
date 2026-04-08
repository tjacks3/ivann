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

// Notification types
export const notificationTypeEnum = pgEnum("notification_type", [
  "collab_request",
  "collab_update",
  "message",
  "system",
]);
