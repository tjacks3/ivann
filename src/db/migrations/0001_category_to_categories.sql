-- Migrate category (varchar) to categories (text[])
-- Step 1: Add new column with default empty array
ALTER TABLE "users" ADD COLUMN "categories" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint

-- Step 2: Migrate existing data — wrap existing category values into single-element arrays
UPDATE "users" SET "categories" = ARRAY["category"] WHERE "category" IS NOT NULL AND "category" != '';--> statement-breakpoint

-- Step 3: Drop old column
ALTER TABLE "users" DROP COLUMN IF EXISTS "category";
