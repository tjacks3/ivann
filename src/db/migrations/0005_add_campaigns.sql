-- Campaign Builder: new enums and tables
-- Purely additive migration — no existing tables are modified

-- ─── Enums ────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE "campaign_type" AS ENUM (
    'product_promotion',
    'brand_awareness',
    'restaurant_promotion',
    'event_marketing',
    'ugc',
    'giveaway',
    'launch',
    'ongoing_partnership'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "campaign_status" AS ENUM (
    'draft',
    'matching',
    'recruiting',
    'active',
    'paused',
    'completed',
    'archived'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "campaign_match_status" AS ENUM (
    'recommended',
    'added',
    'skipped'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ─── Campaigns ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "campaigns" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "brand_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" varchar(255) NOT NULL,
  "description" text,
  "goal" text,
  "total_budget_in_cents" integer NOT NULL,
  "reach_goal" integer,
  "target_age_groups" text[],
  "target_locations" jsonb,
  "campaign_type" "campaign_type" NOT NULL,
  "platforms" text[] NOT NULL DEFAULT '{}',
  "category" varchar(100),
  "global_brief" jsonb,
  "assets" jsonb,
  "start_date" date,
  "end_date" date,
  "status" "campaign_status" NOT NULL DEFAULT 'draft',
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "campaigns_brand_id_idx" ON "campaigns" ("brand_id");
CREATE INDEX IF NOT EXISTS "campaigns_status_idx" ON "campaigns" ("status");

-- ─── Campaign Deals (junction) ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "campaign_deals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "campaign_id" uuid NOT NULL REFERENCES "campaigns"("id") ON DELETE CASCADE,
  "deal_id" uuid NOT NULL REFERENCES "deals"("id") ON DELETE CASCADE,
  "allocated_budget_in_cents" integer NOT NULL,
  "creator_specific_brief" jsonb,
  "creator_specific_notes" text,
  "due_date" date,
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "campaign_deals_deal_id_unique" UNIQUE("deal_id")
);

CREATE INDEX IF NOT EXISTS "campaign_deals_campaign_id_idx" ON "campaign_deals" ("campaign_id");

-- ─── Campaign Matches ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "campaign_matches" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "campaign_id" uuid NOT NULL REFERENCES "campaigns"("id") ON DELETE CASCADE,
  "creator_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "match_score" integer NOT NULL,
  "fit_label" varchar(100) NOT NULL,
  "fit_reasons" text[] NOT NULL DEFAULT '{}',
  "estimated_reach" integer,
  "estimated_price_range" varchar(100),
  "audience_age_fit" boolean,
  "location_fit" boolean,
  "platform_fit" boolean,
  "status" "campaign_match_status" NOT NULL DEFAULT 'recommended',
  "source" varchar(20) NOT NULL DEFAULT 'matched',
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "campaign_matches_campaign_id_idx" ON "campaign_matches" ("campaign_id");
CREATE INDEX IF NOT EXISTS "campaign_matches_creator_id_idx" ON "campaign_matches" ("creator_id");
