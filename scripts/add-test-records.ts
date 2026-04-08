/**
 * Add a test creator and brand to the database.
 *
 * Usage:
 *   npm run db:add-test            # add both
 *   npm run db:add-test -- creator # add creator only
 *   npm run db:add-test -- brand   # add brand only
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

const flag = process.argv[2]; // "creator" | "brand" | undefined (both)

const addCreator = !flag || flag === "creator";
const addBrand = !flag || flag === "brand";

// ── SQL ────────────────────────────────────────────────────────────────

const INSERT_CREATOR = `
INSERT INTO users (
  auth_id, email, full_name, role, bio,
  username, categories, location,
  onboarding_completed, onboarding_step
) VALUES (
  gen_random_uuid(),
  'testcreator_' || floor(random() * 100000)::int || '@example.com',
  'Test Creator',
  'creator',
  'A test creator account for local development.',
  'testcreator_' || floor(random() * 100000)::int,
  ARRAY['lifestyle', 'tech'],
  'New York, NY',
  true,
  4
)
RETURNING id, email, username;
`;

const INSERT_BRAND = `
INSERT INTO users (
  auth_id, email, full_name, role, bio,
  brand_name, contact_name, company_website, industry,
  onboarding_completed, onboarding_step
) VALUES (
  gen_random_uuid(),
  'testbrand_' || floor(random() * 100000)::int || '@example.com',
  'Test Brand Contact',
  'brand',
  'A test brand account for local development.',
  'TestBrand Inc.',
  'Test Contact',
  'https://testbrand.example.com',
  'Technology',
  true,
  2
)
RETURNING id, email, brand_name;
`;

// ── Run ────────────────────────────────────────────────────────────────

async function run() {
  if (addCreator) {
    const [row] = await sql.unsafe(INSERT_CREATOR);
    console.log("Creator added:", row);
  }

  if (addBrand) {
    const [row] = await sql.unsafe(INSERT_BRAND);
    console.log("Brand added:", row);
  }

  await sql.end();
}

run().catch((err) => {
  console.error("Failed:", err.message);
  sql.end().then(() => process.exit(1));
});
