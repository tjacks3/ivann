/**
 * Seed 25 diverse creators with social accounts for testing the Discover feature.
 *
 * Usage: npm run db:seed-creators
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const PASSWORD = "TestPass123!";

interface CreatorDef {
  email: string;
  fullName: string;
  username: string;
  avatarUrl: string;
  bio: string;
  categories: string[];
  location: string;
  website: string | null;
  profileStatus: "published" | "draft";
  socials: {
    platform: string;
    handle: string;
    followerCount: number;
    isVerified: boolean;
  }[];
}

const CREATORS: CreatorDef[] = [
  {
    email: "sofia.martinez@example.com",
    fullName: "Sofia Martinez",
    username: "sofiam",
    avatarUrl: "https://randomuser.me/api/portraits/women/1.jpg",
    bio: "Beauty and skincare creator. Sharing my routines, honest reviews, and self-care tips.",
    categories: ["fashion", "lifestyle"],
    location: "Miami, FL",
    website: "https://sofiam.co",
    profileStatus: "published",
    socials: [
      { platform: "instagram", handle: "sofiam_beauty", followerCount: 320000, isVerified: true },
      { platform: "tiktok", handle: "sofiam", followerCount: 890000, isVerified: true },
      { platform: "youtube", handle: "SofiaMartinez", followerCount: 145000, isVerified: false },
    ],
  },
  {
    email: "james.wilson@example.com",
    fullName: "James Wilson",
    username: "jameswtech",
    avatarUrl: "https://randomuser.me/api/portraits/men/1.jpg",
    bio: "Software engineer turned tech YouTuber. Breaking down complex topics into simple tutorials.",
    categories: ["tech", "education"],
    location: "San Francisco, CA",
    website: "https://jameswilson.dev",
    profileStatus: "published",
    socials: [
      { platform: "youtube", handle: "JamesWTech", followerCount: 520000, isVerified: true },
      { platform: "twitter", handle: "jameswtech", followerCount: 89000, isVerified: true },
    ],
  },
  {
    email: "priya.sharma@example.com",
    fullName: "Priya Sharma",
    username: "priyacooks",
    avatarUrl: "https://randomuser.me/api/portraits/women/5.jpg",
    bio: "Indian fusion chef sharing recipes that bring families together. Cookbook author.",
    categories: ["food", "lifestyle"],
    location: "London, UK",
    website: "https://priyacooks.com",
    profileStatus: "published",
    socials: [
      { platform: "instagram", handle: "priyacooks", followerCount: 410000, isVerified: true },
      { platform: "youtube", handle: "PriyaSharmaKitchen", followerCount: 230000, isVerified: true },
      { platform: "tiktok", handle: "priyacooks", followerCount: 670000, isVerified: false },
    ],
  },
  {
    email: "marcus.brown@example.com",
    fullName: "Marcus Brown",
    username: "marcusfits",
    avatarUrl: "https://randomuser.me/api/portraits/men/5.jpg",
    bio: "Personal trainer and nutrition coach. Helping you build sustainable fitness habits.",
    categories: ["fitness", "food"],
    location: "Atlanta, GA",
    website: null,
    profileStatus: "published",
    socials: [
      { platform: "instagram", handle: "marcusfits", followerCount: 175000, isVerified: false },
      { platform: "tiktok", handle: "marcusfits", followerCount: 440000, isVerified: true },
      { platform: "youtube", handle: "MarcusBrownFitness", followerCount: 95000, isVerified: false },
    ],
  },
  {
    email: "emma.chen@example.com",
    fullName: "Emma Chen",
    username: "emmawanders",
    avatarUrl: "https://randomuser.me/api/portraits/women/10.jpg",
    bio: "Full-time traveler documenting hidden gems across Asia and Europe. Solo travel advocate.",
    categories: ["travel", "lifestyle"],
    location: "Bali, Indonesia",
    website: "https://emmawanders.blog",
    profileStatus: "published",
    socials: [
      { platform: "instagram", handle: "emmawanders", followerCount: 560000, isVerified: true },
      { platform: "youtube", handle: "EmmaWanders", followerCount: 280000, isVerified: true },
      { platform: "tiktok", handle: "emmawanders", followerCount: 1200000, isVerified: true },
    ],
  },
  {
    email: "david.kim@example.com",
    fullName: "David Kim",
    username: "davidkgaming",
    avatarUrl: "https://randomuser.me/api/portraits/men/10.jpg",
    bio: "Competitive gamer and streamer. Variety content from FPS to indie gems.",
    categories: ["entertainment", "tech"],
    location: "Seoul, South Korea",
    website: null,
    profileStatus: "published",
    socials: [
      { platform: "twitch", handle: "davidkgaming", followerCount: 380000, isVerified: true },
      { platform: "youtube", handle: "DavidKGaming", followerCount: 210000, isVerified: false },
      { platform: "twitter", handle: "davidkgaming", followerCount: 67000, isVerified: false },
    ],
  },
  {
    email: "olivia.taylor@example.com",
    fullName: "Olivia Taylor",
    username: "oliviastyle",
    avatarUrl: "https://randomuser.me/api/portraits/women/15.jpg",
    bio: "Sustainable fashion advocate. Showing you how to look great without fast fashion.",
    categories: ["fashion"],
    location: "New York, NY",
    website: "https://oliviastyle.com",
    profileStatus: "published",
    socials: [
      { platform: "instagram", handle: "oliviastyle", followerCount: 720000, isVerified: true },
      { platform: "tiktok", handle: "oliviastyle", followerCount: 450000, isVerified: true },
    ],
  },
  {
    email: "carlos.garcia@example.com",
    fullName: "Carlos Garcia",
    username: "carlosfit",
    avatarUrl: "https://randomuser.me/api/portraits/men/15.jpg",
    bio: "Calisthenics coach and movement specialist. No gym? No problem.",
    categories: ["fitness"],
    location: "Barcelona, Spain",
    website: null,
    profileStatus: "published",
    socials: [
      { platform: "youtube", handle: "CarlosGarciaFit", followerCount: 340000, isVerified: true },
      { platform: "instagram", handle: "carlosfit", followerCount: 190000, isVerified: false },
    ],
  },
  {
    email: "nina.johnson@example.com",
    fullName: "Nina Johnson",
    username: "ninafinance",
    avatarUrl: "https://randomuser.me/api/portraits/women/20.jpg",
    bio: "Making personal finance accessible. Budgeting tips, investing basics, and money mindset.",
    categories: ["business", "education"],
    location: "Chicago, IL",
    website: "https://ninafinance.co",
    profileStatus: "published",
    socials: [
      { platform: "youtube", handle: "NinaJohnsonFinance", followerCount: 480000, isVerified: true },
      { platform: "instagram", handle: "ninafinance", followerCount: 220000, isVerified: true },
      { platform: "tiktok", handle: "ninafinance", followerCount: 910000, isVerified: true },
      { platform: "twitter", handle: "ninafinance", followerCount: 130000, isVerified: true },
    ],
  },
  {
    email: "leo.park@example.com",
    fullName: "Leo Park",
    username: "leophotography",
    avatarUrl: "https://randomuser.me/api/portraits/men/20.jpg",
    bio: "Landscape and street photographer. Capturing light in unexpected places.",
    categories: ["lifestyle", "travel"],
    location: "Tokyo, Japan",
    website: "https://leopark.photo",
    profileStatus: "published",
    socials: [
      { platform: "instagram", handle: "leophotography", followerCount: 290000, isVerified: false },
      { platform: "youtube", handle: "LeoParkPhoto", followerCount: 85000, isVerified: false },
    ],
  },
  {
    email: "aisha.rahman@example.com",
    fullName: "Aisha Rahman",
    username: "aishahealth",
    avatarUrl: "https://randomuser.me/api/portraits/women/25.jpg",
    bio: "Holistic health and wellness. Yoga, meditation, and mindful living for busy professionals.",
    categories: ["fitness", "lifestyle"],
    location: "Dubai, UAE",
    website: "https://aishahealth.me",
    profileStatus: "published",
    socials: [
      { platform: "instagram", handle: "aishahealth", followerCount: 380000, isVerified: true },
      { platform: "youtube", handle: "AishaRahmanWellness", followerCount: 160000, isVerified: false },
      { platform: "tiktok", handle: "aishahealth", followerCount: 520000, isVerified: true },
    ],
  },
  {
    email: "tyler.moore@example.com",
    fullName: "Tyler Moore",
    username: "tylerdiy",
    avatarUrl: "https://randomuser.me/api/portraits/men/25.jpg",
    bio: "DIY home renovation and woodworking. Turning boring spaces into beautiful ones.",
    categories: ["lifestyle", "education"],
    location: "Portland, OR",
    website: null,
    profileStatus: "published",
    socials: [
      { platform: "youtube", handle: "TylerMooreDIY", followerCount: 620000, isVerified: true },
      { platform: "instagram", handle: "tylerdiy", followerCount: 185000, isVerified: false },
      { platform: "tiktok", handle: "tylerdiy", followerCount: 380000, isVerified: false },
    ],
  },
  {
    email: "luna.rossi@example.com",
    fullName: "Luna Rossi",
    username: "lunabeauty",
    avatarUrl: "https://randomuser.me/api/portraits/women/30.jpg",
    bio: "Makeup artist and beauty educator. Tutorials for every skin tone and skill level.",
    categories: ["fashion", "entertainment"],
    location: "Milan, Italy",
    website: "https://lunarossi.beauty",
    profileStatus: "published",
    socials: [
      { platform: "instagram", handle: "lunabeauty", followerCount: 950000, isVerified: true },
      { platform: "tiktok", handle: "lunabeauty", followerCount: 1500000, isVerified: true },
      { platform: "youtube", handle: "LunaRossiBeauty", followerCount: 430000, isVerified: true },
    ],
  },
  {
    email: "ryan.white@example.com",
    fullName: "Ryan White",
    username: "ryanreviews",
    avatarUrl: "https://randomuser.me/api/portraits/men/30.jpg",
    bio: "Honest product reviews. No sponsorships, no bias — just the truth about what's worth your money.",
    categories: ["tech"],
    location: "Austin, TX",
    website: "https://ryanreviews.co",
    profileStatus: "published",
    socials: [
      { platform: "youtube", handle: "RyanWhiteReviews", followerCount: 310000, isVerified: false },
      { platform: "twitter", handle: "ryanreviews", followerCount: 45000, isVerified: false },
    ],
  },
  {
    email: "sakura.tanaka@example.com",
    fullName: "Sakura Tanaka",
    username: "sakuravlog",
    avatarUrl: "https://randomuser.me/api/portraits/women/35.jpg",
    bio: "Daily life in Japan. Language tips, cultural insights, and city exploration vlogs.",
    categories: ["travel", "education"],
    location: "Osaka, Japan",
    website: null,
    profileStatus: "published",
    socials: [
      { platform: "youtube", handle: "SakuraVlog", followerCount: 270000, isVerified: true },
      { platform: "instagram", handle: "sakuravlog", followerCount: 140000, isVerified: false },
      { platform: "tiktok", handle: "sakuravlog", followerCount: 480000, isVerified: true },
    ],
  },
  {
    email: "mike.oconnor@example.com",
    fullName: "Mike O'Connor",
    username: "mikecooks",
    avatarUrl: "https://randomuser.me/api/portraits/men/35.jpg",
    bio: "Home chef making restaurant-quality meals simple. Quick recipes for weeknight dinners.",
    categories: ["food"],
    location: "Dublin, Ireland",
    website: "https://mikecooks.ie",
    profileStatus: "published",
    socials: [
      { platform: "tiktok", handle: "mikecooks", followerCount: 750000, isVerified: true },
      { platform: "instagram", handle: "mikecooks", followerCount: 210000, isVerified: false },
    ],
  },
  {
    email: "zara.ahmed@example.com",
    fullName: "Zara Ahmed",
    username: "zarastyle",
    avatarUrl: "https://randomuser.me/api/portraits/women/40.jpg",
    bio: "Modest fashion and lifestyle content. Proving style has no boundaries.",
    categories: ["fashion", "lifestyle"],
    location: "Toronto, Canada",
    website: "https://zarastyle.ca",
    profileStatus: "published",
    socials: [
      { platform: "instagram", handle: "zarastyle", followerCount: 430000, isVerified: true },
      { platform: "youtube", handle: "ZaraAhmedStyle", followerCount: 175000, isVerified: false },
      { platform: "tiktok", handle: "zarastyle", followerCount: 620000, isVerified: true },
    ],
  },
  {
    email: "noah.anderson@example.com",
    fullName: "Noah Anderson",
    username: "noahoutdoors",
    avatarUrl: "https://randomuser.me/api/portraits/men/40.jpg",
    bio: "Adventure filmmaker and outdoor guide. Mountains, rivers, and everything in between.",
    categories: ["travel", "entertainment"],
    location: "Denver, CO",
    website: null,
    profileStatus: "published",
    socials: [
      { platform: "youtube", handle: "NoahOutdoors", followerCount: 410000, isVerified: true },
      { platform: "instagram", handle: "noahoutdoors", followerCount: 250000, isVerified: true },
    ],
  },
  {
    email: "hannah.lee@example.com",
    fullName: "Hannah Lee",
    username: "hannahteaches",
    avatarUrl: "https://randomuser.me/api/portraits/women/45.jpg",
    bio: "Former teacher now making education fun on social media. Science experiments and study tips.",
    categories: ["education"],
    location: "Boston, MA",
    website: "https://hannahteaches.com",
    profileStatus: "published",
    socials: [
      { platform: "tiktok", handle: "hannahteaches", followerCount: 1100000, isVerified: true },
      { platform: "youtube", handle: "HannahLeeTeaches", followerCount: 350000, isVerified: true },
      { platform: "instagram", handle: "hannahteaches", followerCount: 280000, isVerified: false },
    ],
  },
  {
    email: "diego.lopez@example.com",
    fullName: "Diego Lopez",
    username: "diegomx",
    avatarUrl: "https://randomuser.me/api/portraits/men/45.jpg",
    bio: "Mexican street food explorer. Documenting taquerias and hidden food spots across Mexico.",
    categories: ["food", "travel"],
    location: "Mexico City, Mexico",
    website: null,
    profileStatus: "published",
    socials: [
      { platform: "tiktok", handle: "diegomx", followerCount: 980000, isVerified: true },
      { platform: "instagram", handle: "diegomx", followerCount: 360000, isVerified: false },
      { platform: "youtube", handle: "DiegoLopezFood", followerCount: 190000, isVerified: false },
    ],
  },
  {
    email: "rachel.green@example.com",
    fullName: "Rachel Green",
    username: "rachelstartup",
    avatarUrl: "https://randomuser.me/api/portraits/women/50.jpg",
    bio: "Startup founder sharing the real journey. Fundraising, failures, and lessons learned.",
    categories: ["business"],
    location: "San Francisco, CA",
    website: "https://rachelgreen.vc",
    profileStatus: "published",
    socials: [
      { platform: "linkedin", handle: "rachelgreen", followerCount: 85000, isVerified: true },
      { platform: "twitter", handle: "rachelstartup", followerCount: 120000, isVerified: true },
      { platform: "youtube", handle: "RachelGreenStartup", followerCount: 65000, isVerified: false },
    ],
  },
  {
    email: "kai.nakamura@example.com",
    fullName: "Kai Nakamura",
    username: "kaimusic",
    avatarUrl: "https://randomuser.me/api/portraits/men/50.jpg",
    bio: "Producer, beatmaker, and music educator. Tutorials on production, mixing, and music theory.",
    categories: ["entertainment", "education"],
    location: "Los Angeles, CA",
    website: "https://kainakamura.com",
    profileStatus: "published",
    socials: [
      { platform: "youtube", handle: "KaiNakamuraMusic", followerCount: 290000, isVerified: true },
      { platform: "tiktok", handle: "kaimusic", followerCount: 560000, isVerified: false },
      { platform: "twitch", handle: "kaimusic", followerCount: 45000, isVerified: false },
    ],
  },
  {
    email: "amara.obi@example.com",
    fullName: "Amara Obi",
    username: "amarawellness",
    avatarUrl: "https://randomuser.me/api/portraits/women/55.jpg",
    bio: "Wellness coach specializing in burnout recovery. Mental health, journaling, and self-care.",
    categories: ["fitness", "lifestyle"],
    location: "Lagos, Nigeria",
    website: null,
    profileStatus: "published",
    socials: [
      { platform: "instagram", handle: "amarawellness", followerCount: 95000, isVerified: false },
      { platform: "tiktok", handle: "amarawellness", followerCount: 180000, isVerified: false },
      { platform: "youtube", handle: "AmaraObiWellness", followerCount: 32000, isVerified: false },
    ],
  },
  {
    email: "ben.foster@example.com",
    fullName: "Ben Foster",
    username: "bencodes",
    avatarUrl: "https://randomuser.me/api/portraits/men/55.jpg",
    bio: "Web developer sharing coding tutorials, career advice, and dev life content.",
    categories: ["tech", "education"],
    location: "Berlin, Germany",
    website: "https://bencodes.dev",
    profileStatus: "published",
    socials: [
      { platform: "youtube", handle: "BenFosterCodes", followerCount: 42000, isVerified: false },
      { platform: "twitter", handle: "bencodes", followerCount: 18000, isVerified: false },
      { platform: "tiktok", handle: "bencodes", followerCount: 75000, isVerified: false },
    ],
  },
  {
    email: "chloe.dubois@example.com",
    fullName: "Chloe Dubois",
    username: "chloeparis",
    avatarUrl: "https://randomuser.me/api/portraits/women/60.jpg",
    bio: "Parisian lifestyle, café culture, and French language tips for expats.",
    categories: ["lifestyle", "travel", "education"],
    location: "Paris, France",
    website: "https://chloeparis.fr",
    profileStatus: "published",
    socials: [
      { platform: "instagram", handle: "chloeparis", followerCount: 510000, isVerified: true },
      { platform: "youtube", handle: "ChloeDuboisParis", followerCount: 220000, isVerified: true },
      { platform: "tiktok", handle: "chloeparis", followerCount: 680000, isVerified: true },
      { platform: "twitter", handle: "chloeparis", followerCount: 75000, isVerified: false },
    ],
  },
  // --- Podcast-focused creators ---
  {
    email: "marcus.reed@example.com",
    fullName: "Marcus Reed",
    username: "marcuspod",
    avatarUrl: "https://randomuser.me/api/portraits/men/60.jpg",
    bio: "Host of 'The Hustle Hour' podcast. Weekly interviews with founders, investors, and operators building the future.",
    categories: ["business", "education"],
    location: "New York, NY",
    website: "https://thehustlehour.fm",
    profileStatus: "published",
    socials: [
      { platform: "website", handle: "thehustlehour.fm", followerCount: 125000, isVerified: false },
      { platform: "twitter", handle: "marcusreedpod", followerCount: 48000, isVerified: true },
    ],
  },
  {
    email: "jenna.morales@example.com",
    fullName: "Jenna Morales",
    username: "jennapod",
    avatarUrl: "https://randomuser.me/api/portraits/women/62.jpg",
    bio: "True crime podcaster and investigative journalist. Host of 'Cold Trail' — a top 50 podcast on Apple Podcasts.",
    categories: ["entertainment"],
    location: "Nashville, TN",
    website: "https://coldtrailpod.com",
    profileStatus: "published",
    socials: [
      { platform: "website", handle: "coldtrailpod.com", followerCount: 310000, isVerified: false },
      { platform: "instagram", handle: "coldtrailpod", followerCount: 85000, isVerified: false },
    ],
  },
  {
    email: "derek.shaw@example.com",
    fullName: "Derek Shaw",
    username: "derektalks",
    avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
    bio: "Host of 'Mind Over Matter' — a mental health and self-improvement podcast. 200+ episodes and counting.",
    categories: ["lifestyle", "fitness"],
    location: "Seattle, WA",
    website: "https://mindovermatterpod.com",
    profileStatus: "published",
    socials: [
      { platform: "website", handle: "mindovermatterpod.com", followerCount: 190000, isVerified: false },
    ],
  },
  {
    email: "tanya.wright@example.com",
    fullName: "Tanya Wright",
    username: "tanyatalkstech",
    avatarUrl: "https://randomuser.me/api/portraits/women/65.jpg",
    bio: "Tech podcast host breaking down AI, crypto, and startups for everyday people. 'Tech Unfiltered' drops every Tuesday.",
    categories: ["tech", "business"],
    location: "Austin, TX",
    website: "https://techunfiltered.show",
    profileStatus: "published",
    socials: [
      { platform: "website", handle: "techunfiltered.show", followerCount: 88000, isVerified: false },
      { platform: "twitter", handle: "tanyatalkstech", followerCount: 62000, isVerified: true },
      { platform: "linkedin", handle: "tanyawright", followerCount: 34000, isVerified: false },
    ],
  },
];

async function ensureAuthUser(email: string): Promise<string> {
  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing?.users?.find((u) => u.email === email);
  if (found) return found.id;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
  });
  if (error) throw new Error(`Auth error for ${email}: ${error.message}`);
  return data.user.id;
}

async function run() {
  console.log("🌱 Seeding 29 test creators...\n");

  for (const creator of CREATORS) {
    try {
      // Create auth user
      const authId = await ensureAuthUser(creator.email);

      // Check if profile already exists
      const [existing] = await sql`SELECT id FROM users WHERE auth_id = ${authId}`;
      let userId: string;

      if (existing) {
        userId = existing.id;
        await sql`
          UPDATE users SET
            avatar_url = ${creator.avatarUrl},
            bio = ${creator.bio},
            categories = ${sql.array(creator.categories)},
            location = ${creator.location},
            website = ${creator.website},
            profile_status = ${creator.profileStatus}
          WHERE id = ${userId}
        `;
      } else {
        // Insert user profile
        const [user] = await sql`
          INSERT INTO users (
            auth_id, email, full_name, username, bio, role,
            categories, location, website, profile_status,
            onboarding_completed, onboarding_step, avatar_url
          ) VALUES (
            ${authId}, ${creator.email}, ${creator.fullName}, ${creator.username},
            ${creator.bio}, 'creator',
            ${sql.array(creator.categories)}, ${creator.location},
            ${creator.website}, ${creator.profileStatus},
            true, 4, ${creator.avatarUrl}
          ) RETURNING id
        `;
        userId = user.id;
      }

      // Upsert social accounts — delete old ones and re-insert
      await sql`DELETE FROM social_accounts WHERE user_id = ${userId}`;
      for (const social of creator.socials) {
        await sql`
          INSERT INTO social_accounts (
            user_id, platform, handle, follower_count, is_verified, status, connected_at
          ) VALUES (
            ${userId}, ${social.platform}, ${social.handle},
            ${social.followerCount}, ${social.isVerified}, 'connected', NOW()
          )
        `;
      }

      // Upsert creator_public_metrics
      const totalFollowers = creator.socials.reduce((s, a) => s + a.followerCount, 0);
      const platformCount = creator.socials.length;
      // Generate a realistic avg engagement rate based on follower count
      // Smaller creators tend to have higher engagement
      const avgEngagement = totalFollowers > 500000
        ? (1.5 + Math.random() * 1.5).toFixed(2)
        : totalFollowers > 100000
          ? (2.5 + Math.random() * 2.0).toFixed(2)
          : (3.5 + Math.random() * 3.0).toFixed(2);
      // Top platform = the one with the most followers
      const topPlatform = creator.socials.reduce((top, s) =>
        s.followerCount > top.followerCount ? s : top,
      ).platform;

      await sql`
        INSERT INTO creator_public_metrics (
          user_id, total_followers, platform_count, avg_engagement, top_platform, last_updated
        ) VALUES (
          ${userId}, ${totalFollowers}, ${platformCount}, ${avgEngagement}, ${topPlatform}, NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
          total_followers = EXCLUDED.total_followers,
          platform_count = EXCLUDED.platform_count,
          avg_engagement = EXCLUDED.avg_engagement,
          top_platform = EXCLUDED.top_platform,
          last_updated = NOW(),
          updated_at = NOW()
      `;

      const verified = creator.socials.some((s) => s.isVerified) ? "✓" : " ";
      const label = existing ? "updated" : "created";
      console.log(
        `  ✅ ${creator.fullName.padEnd(20)} ${verified} ${platformCount} platforms  ${(totalFollowers / 1000).toFixed(0)}K followers  ${avgEngagement}% eng  [${label}]`,
      );
    } catch (err) {
      console.error(`  ❌ ${creator.fullName}: ${(err as Error).message}`);
    }
  }

  console.log("\n📋 All creators use password: TestPass123!");
  console.log("   29 published (visible in Discover), 0 draft");
  await sql.end();
}

run().catch((err) => {
  console.error("Failed:", err);
  sql.end().then(() => process.exit(1));
});
