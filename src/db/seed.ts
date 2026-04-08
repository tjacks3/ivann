import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import {
  users,
  socialAccounts,
  packages,
  collaborationRequests,
  messageThreads,
  messageThreadMembers,
  messages,
  notifications,
} from "./schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

// Deterministic UUIDs for seed data
const CREATOR_1_ID = "a0000000-0000-0000-0000-000000000001";
const CREATOR_2_ID = "a0000000-0000-0000-0000-000000000002";
const CREATOR_3_ID = "a0000000-0000-0000-0000-000000000003";
const BRAND_1_ID = "b0000000-0000-0000-0000-000000000001";
const BRAND_2_ID = "b0000000-0000-0000-0000-000000000002";
const ADMIN_ID = "c0000000-0000-0000-0000-000000000001";

const PACKAGE_1_ID = "d0000000-0000-0000-0000-000000000001";
const PACKAGE_2_ID = "d0000000-0000-0000-0000-000000000002";
const PACKAGE_3_ID = "d0000000-0000-0000-0000-000000000003";
const PACKAGE_4_ID = "d0000000-0000-0000-0000-000000000004";
const PACKAGE_5_ID = "d0000000-0000-0000-0000-000000000005";
const PACKAGE_6_ID = "d0000000-0000-0000-0000-000000000006";

const COLLAB_1_ID = "e0000000-0000-0000-0000-000000000001";
const COLLAB_2_ID = "e0000000-0000-0000-0000-000000000002";
const COLLAB_3_ID = "e0000000-0000-0000-0000-000000000003";

const THREAD_1_ID = "f0000000-0000-0000-0000-000000000001";
const THREAD_2_ID = "f0000000-0000-0000-0000-000000000002";

async function seed() {
  console.log("🌱 Seeding database...");

  await db.transaction(async (tx) => {
    // Clear tables in reverse dependency order
    console.log("  Clearing existing seed data...");
    await tx.delete(notifications);
    await tx.delete(messages);
    await tx.delete(messageThreadMembers);
    await tx.delete(messageThreads);
    await tx.delete(collaborationRequests);
    await tx.delete(packages);
    await tx.delete(socialAccounts);
    await tx.execute(
      sql`DELETE FROM users WHERE id IN (${sql.raw(
        [CREATOR_1_ID, CREATOR_2_ID, CREATOR_3_ID, BRAND_1_ID, BRAND_2_ID, ADMIN_ID]
          .map((id) => `'${id}'`)
          .join(","),
      )})`,
    );

    // --- Users ---
    console.log("  Seeding users...");
    await tx.insert(users).values([
      {
        id: CREATOR_1_ID,
        authId: "00000000-aaaa-0000-0000-000000000001",
        email: "maya@example.com",
        fullName: "Maya Chen",
        role: "creator",
        bio: "Lifestyle creator sharing daily inspiration, fashion tips, and wellness routines.",
        username: "mayachen",
        categories: ["lifestyle", "fashion"],
        location: "Los Angeles, CA",
        onboardingCompleted: true,
        onboardingStep: 4,
      },
      {
        id: CREATOR_2_ID,
        authId: "00000000-aaaa-0000-0000-000000000002",
        email: "alex@example.com",
        fullName: "Alex Rivera",
        role: "creator",
        bio: "Tech reviewer and gadget enthusiast. Honest reviews, no fluff.",
        username: "alextech",
        categories: ["tech", "entertainment"],
        location: "Austin, TX",
        onboardingCompleted: true,
        onboardingStep: 4,
      },
      {
        id: CREATOR_3_ID,
        authId: "00000000-aaaa-0000-0000-000000000003",
        email: "jordan@example.com",
        fullName: "Jordan Lee",
        role: "creator",
        bio: "Fitness coach and wellness advocate. Helping you get stronger every day.",
        username: "jordanfitness",
        categories: ["fitness", "lifestyle", "food"],
        location: "Miami, FL",
        onboardingCompleted: true,
        onboardingStep: 4,
      },
      {
        id: BRAND_1_ID,
        authId: "00000000-aaaa-0000-0000-000000000004",
        email: "brand@luxewear.example.com",
        fullName: "Sarah Kim",
        role: "brand",
        brandName: "LuxeWear",
        contactName: "Sarah Kim",
        companyWebsite: "https://luxewear.example.com",
        industry: "Fashion & Apparel",
        bio: "Premium fashion brand for the modern creator.",
        onboardingCompleted: true,
        onboardingStep: 2,
      },
      {
        id: BRAND_2_ID,
        authId: "00000000-aaaa-0000-0000-000000000005",
        email: "brand@techflow.example.com",
        fullName: "Marcus Johnson",
        role: "brand",
        brandName: "TechFlow",
        contactName: "Marcus Johnson",
        companyWebsite: "https://techflow.example.com",
        industry: "Technology",
        bio: "Next-gen productivity tools for teams.",
        onboardingCompleted: true,
        onboardingStep: 2,
      },
      {
        id: ADMIN_ID,
        authId: "00000000-aaaa-0000-0000-000000000006",
        email: "admin@ivann.example.com",
        fullName: "Ivann Admin",
        role: "admin",
        onboardingCompleted: true,
        onboardingStep: 4,
      },
    ]);

    // --- Social Accounts ---
    console.log("  Seeding social accounts...");
    await tx.insert(socialAccounts).values([
      {
        userId: CREATOR_1_ID,
        platform: "instagram",
        handle: "mayachen_",
        displayName: "Maya Chen",
        followerCount: 245000,
        isVerified: true,
        connectedAt: new Date("2025-01-15"),
      },
      {
        userId: CREATOR_1_ID,
        platform: "tiktok",
        handle: "mayachen",
        displayName: "Maya Chen",
        followerCount: 580000,
        isVerified: true,
        connectedAt: new Date("2025-01-15"),
      },
      {
        userId: CREATOR_2_ID,
        platform: "youtube",
        handle: "AlexTechReviews",
        displayName: "Alex Tech Reviews",
        followerCount: 120000,
        isVerified: true,
        connectedAt: new Date("2025-02-01"),
      },
      {
        userId: CREATOR_2_ID,
        platform: "twitter",
        handle: "alextech",
        displayName: "Alex Rivera",
        followerCount: 45000,
        isVerified: false,
        connectedAt: new Date("2025-02-01"),
      },
      {
        userId: CREATOR_3_ID,
        platform: "instagram",
        handle: "jordanfitness",
        displayName: "Jordan Fitness",
        followerCount: 310000,
        isVerified: true,
        connectedAt: new Date("2025-03-01"),
      },
      {
        userId: CREATOR_3_ID,
        platform: "youtube",
        handle: "JordanFitCoach",
        displayName: "Jordan Lee Fitness",
        followerCount: 89000,
        isVerified: false,
        connectedAt: new Date("2025-03-01"),
      },
      {
        userId: CREATOR_3_ID,
        platform: "tiktok",
        handle: "jordanfitness",
        displayName: "Jordan Lee",
        followerCount: 720000,
        isVerified: true,
        connectedAt: new Date("2025-03-01"),
      },
    ]);

    // --- Packages ---
    console.log("  Seeding packages...");
    await tx.insert(packages).values([
      {
        id: PACKAGE_1_ID,
        userId: CREATOR_1_ID,
        title: "Instagram Story Package",
        description:
          "3 Instagram stories featuring your product with swipe-up link.",
        type: "story",
        status: "active",
        priceInCents: 15000,
        deliverables:
          "3 Instagram stories, 24-hour posting, swipe-up link included",
        deliveryDays: 5,
        revisions: 1,
        isHighlighted: true,
        sortOrder: 0,
      },
      {
        id: PACKAGE_2_ID,
        userId: CREATOR_1_ID,
        title: "UGC Video Content",
        description:
          "High-quality UGC video for your brand. Perfect for ads and social.",
        type: "ugc",
        status: "active",
        priceInCents: 35000,
        deliverables: "1 UGC video (30-60s), raw footage, usage rights",
        deliveryDays: 7,
        revisions: 2,
        sortOrder: 1,
      },
      {
        id: PACKAGE_3_ID,
        userId: CREATOR_2_ID,
        title: "Tech Product Review",
        description:
          "In-depth YouTube review of your tech product with honest assessment.",
        type: "video",
        status: "active",
        priceInCents: 50000,
        deliverables:
          "1 YouTube video (8-15 min), community post, pinned comment",
        deliveryDays: 14,
        revisions: 1,
        isHighlighted: true,
        sortOrder: 0,
      },
      {
        id: PACKAGE_4_ID,
        userId: CREATOR_2_ID,
        title: "Sponsored Tweet Thread",
        description: "Engaging tweet thread about your product or service.",
        type: "sponsored_post",
        status: "active",
        priceInCents: 8000,
        deliverables: "1 tweet thread (5-8 tweets), engagement for 48h",
        deliveryDays: 3,
        revisions: 2,
        sortOrder: 1,
      },
      {
        id: PACKAGE_5_ID,
        userId: CREATOR_3_ID,
        title: "Fitness Brand Reel",
        description:
          "Dynamic Instagram Reel showcasing your fitness product in action.",
        type: "reel",
        status: "active",
        priceInCents: 25000,
        deliverables: "1 Instagram Reel (15-30s), caption, hashtags",
        deliveryDays: 5,
        revisions: 1,
        isHighlighted: true,
        sortOrder: 0,
      },
      {
        id: PACKAGE_6_ID,
        userId: CREATOR_3_ID,
        title: "Full Fitness Bundle",
        description:
          "Complete content package: Reel + Stories + Feed Post for maximum reach.",
        type: "bundle",
        status: "draft",
        priceInCents: 75000,
        deliverables:
          "1 Reel, 3 Stories, 1 Feed Post, usage rights for 30 days",
        deliveryDays: 10,
        revisions: 2,
        sortOrder: 1,
      },
    ]);

    // --- Collaboration Requests ---
    console.log("  Seeding collaboration requests...");
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    await tx.insert(collaborationRequests).values([
      {
        id: COLLAB_1_ID,
        brandId: BRAND_1_ID,
        creatorId: CREATOR_1_ID,
        packageId: PACKAGE_1_ID,
        status: "pending",
        title: "Spring Collection Launch",
        message:
          "Hi Maya! We love your aesthetic and would love to feature our new spring collection on your Instagram stories. Let us know if you're interested!",
        budget: 15000,
        deadline: "2026-05-01",
        expiresAt: weekFromNow,
      },
      {
        id: COLLAB_2_ID,
        brandId: BRAND_2_ID,
        creatorId: CREATOR_2_ID,
        packageId: PACKAGE_3_ID,
        status: "accepted",
        title: "TechFlow Pro Review",
        message:
          "Hey Alex, we'd love an honest review of TechFlow Pro on your channel. Happy to send you a team license.",
        budget: 50000,
        deadline: "2026-04-20",
        respondedAt: new Date("2026-04-02"),
      },
      {
        id: COLLAB_3_ID,
        brandId: BRAND_1_ID,
        creatorId: CREATOR_3_ID,
        status: "declined",
        title: "Activewear Campaign",
        message:
          "Jordan, we're launching an activewear line and think you'd be a perfect fit. Open to discussing a custom package.",
        budget: 40000,
        deadline: "2026-04-15",
        declinedReason: "Schedule conflict — booked for another campaign.",
        respondedAt: new Date("2026-03-28"),
      },
    ]);

    // --- Message Threads ---
    console.log("  Seeding message threads...");
    const threadTime = new Date("2026-04-03T14:30:00Z");

    await tx.insert(messageThreads).values([
      {
        id: THREAD_1_ID,
        collabRequestId: COLLAB_2_ID,
        subject: "TechFlow Pro Review — Details",
        lastMessageAt: new Date("2026-04-05T10:15:00Z"),
      },
      {
        id: THREAD_2_ID,
        collabRequestId: COLLAB_1_ID,
        subject: "Spring Collection Discussion",
        lastMessageAt: new Date("2026-04-04T16:45:00Z"),
      },
    ]);

    // --- Thread Members ---
    await tx.insert(messageThreadMembers).values([
      {
        threadId: THREAD_1_ID,
        userId: BRAND_2_ID,
        lastReadAt: new Date("2026-04-05T10:15:00Z"),
      },
      {
        threadId: THREAD_1_ID,
        userId: CREATOR_2_ID,
        lastReadAt: new Date("2026-04-05T09:00:00Z"),
      },
      {
        threadId: THREAD_2_ID,
        userId: BRAND_1_ID,
        lastReadAt: new Date("2026-04-04T16:45:00Z"),
      },
      {
        threadId: THREAD_2_ID,
        userId: CREATOR_1_ID,
      },
    ]);

    // --- Messages ---
    console.log("  Seeding messages...");
    await tx.insert(messages).values([
      {
        threadId: THREAD_1_ID,
        senderId: BRAND_2_ID,
        body: "Hey Alex, thanks for accepting! I'll send over a team license and some talking points. No pressure on what to say — we want your honest take.",
        createdAt: new Date("2026-04-03T14:30:00Z"),
      },
      {
        threadId: THREAD_1_ID,
        senderId: CREATOR_2_ID,
        body: "Thanks Marcus! Really looking forward to trying it out. I'll probably need about a week with the product before filming.",
        createdAt: new Date("2026-04-03T15:10:00Z"),
      },
      {
        threadId: THREAD_1_ID,
        senderId: BRAND_2_ID,
        body: "Totally understand. Take your time. I've sent the invite to your email. Let me know if you need anything else!",
        createdAt: new Date("2026-04-03T15:45:00Z"),
      },
      {
        threadId: THREAD_1_ID,
        senderId: CREATOR_2_ID,
        body: "Got it, thanks! I'll reach out once I've had some time with it. Quick question — any specific features you'd like me to highlight?",
        createdAt: new Date("2026-04-04T09:20:00Z"),
      },
      {
        threadId: THREAD_1_ID,
        senderId: BRAND_2_ID,
        body: "The new AI workflow builder is our flagship feature. But again, honest review is what we're after. If something doesn't work well, say so!",
        createdAt: new Date("2026-04-05T10:15:00Z"),
      },
      {
        threadId: THREAD_2_ID,
        senderId: BRAND_1_ID,
        body: "Hi Maya! Just following up on the spring collection collaboration. We're really excited about the possibility of working together!",
        createdAt: new Date("2026-04-04T11:00:00Z"),
      },
      {
        threadId: THREAD_2_ID,
        senderId: BRAND_1_ID,
        body: "We'd love to send you some pieces from the collection so you can style them your way. Would that work?",
        createdAt: new Date("2026-04-04T11:02:00Z"),
      },
      {
        threadId: THREAD_2_ID,
        senderId: CREATOR_1_ID,
        body: "Hey Sarah! That sounds great. I'd love to see the pieces first before committing. Can you send me a lookbook?",
        createdAt: new Date("2026-04-04T16:45:00Z"),
      },
    ]);

    // --- Notifications ---
    console.log("  Seeding notifications...");
    await tx.insert(notifications).values([
      {
        userId: CREATOR_1_ID,
        type: "collab_request",
        title: "New collaboration request",
        body: "LuxeWear wants to collaborate on Spring Collection Launch.",
        isRead: false,
        actionUrl: `/messages`,
        referenceId: COLLAB_1_ID,
        referenceType: "collab_request",
      },
      {
        userId: CREATOR_2_ID,
        type: "collab_update",
        title: "Collaboration accepted",
        body: "You accepted the TechFlow Pro Review collaboration.",
        isRead: true,
        actionUrl: `/messages`,
        referenceId: COLLAB_2_ID,
        referenceType: "collab_request",
      },
      {
        userId: BRAND_2_ID,
        type: "collab_update",
        title: "Request accepted!",
        body: "Alex Rivera accepted your collaboration request for TechFlow Pro Review.",
        isRead: true,
        actionUrl: `/messages`,
        referenceId: COLLAB_2_ID,
        referenceType: "collab_request",
      },
      {
        userId: BRAND_1_ID,
        type: "collab_update",
        title: "Request declined",
        body: "Jordan Lee declined your Activewear Campaign request.",
        isRead: false,
        actionUrl: `/brand/dashboard`,
        referenceId: COLLAB_3_ID,
        referenceType: "collab_request",
      },
      {
        userId: CREATOR_1_ID,
        type: "message",
        title: "New message from LuxeWear",
        body: "Sarah sent you a message about Spring Collection Discussion.",
        isRead: false,
        actionUrl: `/messages`,
        referenceId: THREAD_2_ID,
        referenceType: "message",
      },
      {
        userId: CREATOR_2_ID,
        type: "message",
        title: "New message from TechFlow",
        body: "Marcus sent you a message about TechFlow Pro Review.",
        isRead: false,
        actionUrl: `/messages`,
        referenceId: THREAD_1_ID,
        referenceType: "message",
      },
    ]);
  });

  console.log("✅ Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
