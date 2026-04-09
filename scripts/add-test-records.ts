/**
 * Add a test creator and/or brand with real Supabase Auth accounts.
 *
 * Usage:
 *   npm run db:add-test            # add both
 *   npm run db:add-test -- creator # add creator only
 *   npm run db:add-test -- brand   # add brand only
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

const flag = process.argv[2]; // "creator" | "brand" | undefined (both)
const addCreator = !flag || flag === "creator";
const addBrand = !flag || flag === "brand";

const TEST_PASSWORD = "TestPass123!";

async function createAuthUser(email: string): Promise<string> {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
  });
  if (error) throw new Error(`Auth error: ${error.message}`);
  return data.user.id;
}

async function run() {
  const suffix = Math.floor(Math.random() * 100000);

  if (addCreator) {
    const email = `testcreator_${suffix}@example.com`;
    const authId = await createAuthUser(email);
    const [row] = await sql`
      INSERT INTO users (auth_id, email, full_name, role, bio, username, categories, location, onboarding_completed, onboarding_step, profile_status)
      VALUES (${authId}, ${email}, 'Test Creator', 'creator', 'A test creator account.', ${"testcreator_" + suffix}, ARRAY['lifestyle','tech'], 'New York, NY', true, 4, 'draft')
      RETURNING id, email, username
    `;
    console.log("Creator added:", row);
    console.log(`  Login: ${email} / ${TEST_PASSWORD}`);
  }

  if (addBrand) {
    const email = `testbrand_${suffix}@example.com`;
    const authId = await createAuthUser(email);
    const [row] = await sql`
      INSERT INTO users (auth_id, email, full_name, role, bio, brand_name, contact_name, company_website, industry, onboarding_completed, onboarding_step)
      VALUES (${authId}, ${email}, 'Test Brand Contact', 'brand', 'A test brand account.', 'TestBrand Inc.', 'Test Contact', 'https://testbrand.example.com', 'Technology', true, 2)
      RETURNING id, email, brand_name
    `;
    console.log("Brand added:", row);
    console.log(`  Login: ${email} / ${TEST_PASSWORD}`);
  }

  await sql.end();
}

run().catch((err) => {
  console.error("Failed:", err.message);
  sql.end().then(() => process.exit(1));
});
