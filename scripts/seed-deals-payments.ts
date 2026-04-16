import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

// Known user IDs from existing seeds
const BRANDS = {
  greenPlate: "d587d5fc-7f57-49c3-93e2-46008fcfef69",
  byteCraft: "", // will be looked up
  fitPulse: "64d5cb5d-5b30-4c7e-9cd0-21b5ae69c9ec",
  urbanRoots: "701a376a-9c39-4fc0-8e98-9614296676fa",
  novaStream: "e7c6192e-3da9-4536-9b3e-d486909aaa75",
  wanderLuxe: "b91fe7c1-313c-4acd-9774-b49c22a42144",
};

const CREATORS = {
  maya: "a0000000-0000-0000-0000-000000000001",
  alex: "a0000000-0000-0000-0000-000000000002",
  jordan: "a0000000-0000-0000-0000-000000000003",
  priya: "174ad2bb-fce8-4a49-afa5-cc71909ac4c2",
};

async function seed() {
  console.log("🌱 Seeding deals + payments...\n");

  // Look up ByteCraft
  const [byteCraft] = await sql`
    SELECT id FROM users WHERE brand_name = 'ByteCraft' LIMIT 1
  `;
  if (byteCraft) BRANDS.byteCraft = byteCraft.id;

  // Clean existing seed deals
  await sql`DELETE FROM deal_payments WHERE deal_id IN (SELECT id FROM deals)`;
  await sql`DELETE FROM deal_revisions WHERE deal_id IN (SELECT id FROM deals)`;
  await sql`DELETE FROM deals`;

  console.log("  Cleared existing deals + payments\n");

  // Helper to create a deal + thread + payment in one go
  async function createDeal(opts: {
    brandId: string;
    creatorId: string;
    title: string;
    deliverables: string;
    budget: number;
    timeline: string;
    status: string;
    paymentStatus?: string;
    daysAgo: number;
  }) {
    const createdAt = new Date(Date.now() - opts.daysAgo * 86400000);

    // Create thread
    const [thread] = await sql`
      INSERT INTO message_threads (subject, last_message_at, created_at)
      VALUES (${opts.title}, ${createdAt}, ${createdAt})
      RETURNING id
    `;

    // Add thread members
    await sql`
      INSERT INTO message_thread_members (thread_id, user_id)
      VALUES (${thread.id}, ${opts.brandId}), (${thread.id}, ${opts.creatorId})
    `;

    // Create deal
    const [deal] = await sql`
      INSERT INTO deals (brand_id, creator_id, thread_id, title, deliverables, budget, currency, timeline, status, created_at, updated_at)
      VALUES (${opts.brandId}, ${opts.creatorId}, ${thread.id}, ${opts.title}, ${opts.deliverables}, ${opts.budget}, 'usd', ${opts.timeline}, ${opts.status}, ${createdAt}, ${createdAt})
      RETURNING id
    `;

    // Create payment if specified
    if (opts.paymentStatus && opts.paymentStatus !== "none") {
      const fundedAt = opts.paymentStatus !== "unpaid" ? new Date(createdAt.getTime() + 86400000) : null;
      const releasedAt = opts.paymentStatus === "released" ? new Date(createdAt.getTime() + 5 * 86400000) : null;
      const refundedAt = opts.paymentStatus === "refunded" ? new Date(createdAt.getTime() + 3 * 86400000) : null;

      await sql`
        INSERT INTO deal_payments (deal_id, payer_id, payee_id, amount_in_cents, currency, status, funded_at, released_at, refunded_at, created_at, updated_at)
        VALUES (${deal.id}, ${opts.brandId}, ${opts.creatorId}, ${opts.budget}, 'usd', ${opts.paymentStatus}, ${fundedAt}, ${releasedAt}, ${refundedAt}, ${createdAt}, ${createdAt})
      `;
    }

    console.log(`  ✅ ${opts.title} (${opts.status}${opts.paymentStatus ? ` / ${opts.paymentStatus}` : ""})`);
    return deal.id;
  }

  // 1. Completed + released
  await createDeal({
    brandId: BRANDS.greenPlate,
    creatorId: CREATORS.maya,
    title: "Instagram Story for Green Plate Kitchen",
    deliverables: "3 Instagram Stories featuring the restaurant with location tags and a swipe-up link to the menu.",
    budget: 15000,
    timeline: "1 week",
    status: "completed",
    paymentStatus: "released",
    daysAgo: 14,
  });

  // 2. In progress + funded
  if (BRANDS.byteCraft) {
    await createDeal({
      brandId: BRANDS.byteCraft,
      creatorId: CREATORS.alex,
      title: "Tech Product Review — ByteCraft Platform",
      deliverables: "1 YouTube video (10-15 min) reviewing the ByteCraft low-code platform with honest assessment and demo walkthrough.",
      budget: 50000,
      timeline: "2 weeks",
      status: "in_progress",
      paymentStatus: "funded",
      daysAgo: 7,
    });
  }

  // 3. Accepted + funded
  await createDeal({
    brandId: BRANDS.fitPulse,
    creatorId: CREATORS.jordan,
    title: "Fitness Reel Campaign — FitPulse Wearable",
    deliverables: "1 Instagram Reel (30s) showcasing the FitPulse tracker during a workout session.",
    budget: 25000,
    timeline: "10 days",
    status: "accepted",
    paymentStatus: "funded",
    daysAgo: 5,
  });

  // 4. Delivered + funded
  await createDeal({
    brandId: BRANDS.urbanRoots,
    creatorId: CREATORS.maya,
    title: "Lifestyle Post — Urban Roots Home Collection",
    deliverables: "1 Instagram Post featuring Urban Roots products styled in a home setting, plus 2 Stories with product links.",
    budget: 20000,
    timeline: "1 week",
    status: "delivered",
    paymentStatus: "funded",
    daysAgo: 10,
  });

  // 5. Completed + released (second one for totals)
  await createDeal({
    brandId: BRANDS.greenPlate,
    creatorId: CREATORS.priya,
    title: "Food Blog Feature — Green Plate Seasonal Menu",
    deliverables: "1 blog post with photos reviewing the seasonal menu, shared across Instagram and Twitter.",
    budget: 10000,
    timeline: "5 days",
    status: "completed",
    paymentStatus: "released",
    daysAgo: 21,
  });

  // 6. Cancelled + refunded
  await createDeal({
    brandId: BRANDS.novaStream,
    creatorId: CREATORS.alex,
    title: "TikTok Promo — NovaStream Launch",
    deliverables: "3 TikTok videos promoting the NovaStream platform launch with a creator discount code.",
    budget: 30000,
    timeline: "2 weeks",
    status: "cancelled",
    paymentStatus: "refunded",
    daysAgo: 12,
  });

  // 7. Accepted + unpaid (brand hasn't funded yet)
  await createDeal({
    brandId: BRANDS.wanderLuxe,
    creatorId: CREATORS.maya,
    title: "Brand Awareness — WanderLuxe Travel",
    deliverables: "1 Instagram Post and 2 Stories highlighting a curated travel package.",
    budget: 17500,
    timeline: "2 weeks",
    status: "accepted",
    paymentStatus: "unpaid",
    daysAgo: 3,
  });

  console.log("\n✅ Deals + payments seed complete!");
  console.log("\n📊 Test data summary:");
  console.log("   Green Plate Kitchen: 2 completed/released ($150 + $100 = $250 total spent)");
  console.log("   Maya Chen: 1 released ($150) + 2 funded ($200 + $175) + 1 unpaid");
  console.log("   Alex Rivera: 1 funded ($500) + 1 refunded ($300)");
  console.log("   Jordan Lee: 1 funded ($250)");

  await sql.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
