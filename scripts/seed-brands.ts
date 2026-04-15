import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

const supabase = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const SEED_PASSWORD = "TestPass123!";

interface BrandSeed {
  email: string;
  fullName: string;
  brandName: string;
  contactName: string;
  companyWebsite: string | null;
  industry: string;
  bio: string;
  location: string;
}

const BRANDS: BrandSeed[] = [
  {
    email: "brand@greenplate.example.com",
    fullName: "Maria Santos",
    brandName: "Green Plate Kitchen",
    contactName: "Maria Santos",
    companyWebsite: "https://greenplatekitchen.com",
    industry: "food",
    bio: "Farm-to-table restaurant chain focused on sustainable, locally sourced ingredients.",
    location: "Miami, FL",
  },
  {
    email: "brand@fitpulse.example.com",
    fullName: "David Park",
    brandName: "FitPulse",
    contactName: "David Park",
    companyWebsite: "https://fitpulse.io",
    industry: "fitness",
    bio: "Smart fitness wearables and coaching app for everyday athletes.",
    location: "Austin, TX",
  },
  {
    email: "brand@wanderluxe.example.com",
    fullName: "Claire Dubois",
    brandName: "WanderLuxe Travel",
    contactName: "Claire Dubois",
    companyWebsite: "https://wanderluxetravel.com",
    industry: "travel",
    bio: "Curated luxury travel experiences for adventurous professionals.",
    location: "New York, NY",
  },
  {
    email: "brand@glowup.example.com",
    fullName: "Aisha Johnson",
    brandName: "GlowUp Beauty",
    contactName: "Aisha Johnson",
    companyWebsite: "https://glowupbeauty.co",
    industry: "fashion",
    bio: "Clean beauty brand celebrating diverse skin tones with inclusive product lines.",
    location: "Atlanta, GA",
  },
  {
    email: "brand@learnloop.example.com",
    fullName: "James Chen",
    brandName: "LearnLoop",
    contactName: "James Chen",
    companyWebsite: "https://learnloop.app",
    industry: "education",
    bio: "Interactive learning platform making education accessible and engaging for all ages.",
    location: "San Francisco, CA",
  },
  {
    email: "brand@novastream.example.com",
    fullName: "Tyler Brooks",
    brandName: "NovaStream",
    contactName: "Tyler Brooks",
    companyWebsite: "https://novastream.tv",
    industry: "entertainment",
    bio: "Independent streaming platform spotlighting emerging filmmakers and creators.",
    location: "Los Angeles, CA",
  },
  {
    email: "brand@urbanroots.example.com",
    fullName: "Sofia Martinez",
    brandName: "Urban Roots Co.",
    contactName: "Sofia Martinez",
    companyWebsite: "https://urbanroots.co",
    industry: "lifestyle",
    bio: "Urban lifestyle brand offering sustainable home goods and everyday essentials.",
    location: "Portland, OR",
  },
  {
    email: "brand@peakcapital.example.com",
    fullName: "Robert Kim",
    brandName: "Peak Capital Advisors",
    contactName: "Robert Kim",
    companyWebsite: "https://peakcapital.com",
    industry: "business",
    bio: "Financial advisory firm helping small businesses scale with smart capital strategies.",
    location: "Chicago, IL",
  },
  {
    email: "brand@bytecraft.example.com",
    fullName: "Nina Patel",
    brandName: "ByteCraft",
    contactName: "Nina Patel",
    companyWebsite: "https://bytecraft.dev",
    industry: "tech",
    bio: "Developer tools startup building the next generation of low-code platforms.",
    location: "Denver, CO",
  },
  {
    email: "brand@trailblaze.example.com",
    fullName: "Marcus Williams",
    brandName: "TrailBlaze Outdoors",
    contactName: "Marcus Williams",
    companyWebsite: "https://trailblazeoutdoors.com",
    industry: "fitness",
    bio: "Outdoor adventure gear brand designed for hikers, climbers, and trail runners.",
    location: "Seattle, WA",
  },
];

async function ensureAuthUser(email: string): Promise<string> {
  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing?.users?.find((u) => u.email === email);
  if (found) return found.id;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: SEED_PASSWORD,
    email_confirm: true,
  });

  if (error) throw new Error(`Failed to create auth user ${email}: ${error.message}`);
  return data.user.id;
}

async function seed() {
  console.log("🌱 Seeding 10 brand users...\n");

  for (const brand of BRANDS) {
    try {
      // Create or get auth user
      const authId = await ensureAuthUser(brand.email);

      // Check if user profile already exists
      const existing = await sql`
        SELECT id FROM users WHERE auth_id = ${authId} OR email = ${brand.email} LIMIT 1
      `;

      if (existing.length > 0) {
        console.log(`  ⏭  ${brand.brandName} (${brand.email}) — already exists, skipping`);
        continue;
      }

      // Insert user profile
      await sql`
        INSERT INTO users (
          auth_id, email, full_name, role, brand_name, contact_name,
          company_website, industry, bio, location,
          onboarding_completed, onboarding_step
        ) VALUES (
          ${authId}, ${brand.email}, ${brand.fullName}, 'brand',
          ${brand.brandName}, ${brand.contactName},
          ${brand.companyWebsite}, ${brand.industry}, ${brand.bio}, ${brand.location},
          true, 2
        )
      `;

      console.log(`  ✅ ${brand.brandName} (${brand.email}) → ${authId}`);
    } catch (err) {
      console.error(`  ❌ Failed to seed ${brand.email}:`, err);
    }
  }

  console.log("\n✅ Brand seed complete!");
  console.log("\n📋 New brand credentials (password for all: TestPass123!):");
  for (const brand of BRANDS) {
    console.log(`   ${brand.brandName.padEnd(25)} ${brand.email}`);
  }

  await sql.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
