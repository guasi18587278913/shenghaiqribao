-- Add year and month columns to daily_report table
ALTER TABLE "daily_report" ADD COLUMN IF NOT EXISTS "year" integer;
ALTER TABLE "daily_report" ADD COLUMN IF NOT EXISTS "month" integer;

-- Create category_stats table if not exists
CREATE TABLE IF NOT EXISTS "category_stats" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"first_seen" timestamp DEFAULT now() NOT NULL,
	"last_seen" timestamp DEFAULT now() NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "category_stats_name_unique" UNIQUE("name"),
	CONSTRAINT "category_stats_slug_unique" UNIQUE("slug")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "daily_report_year_month_idx" ON "daily_report" USING btree ("year","month");
CREATE INDEX IF NOT EXISTS "category_stats_count_idx" ON "category_stats" USING btree ("count");
CREATE INDEX IF NOT EXISTS "category_stats_featured_idx" ON "category_stats" USING btree ("is_featured");
CREATE INDEX IF NOT EXISTS "category_stats_slug_idx" ON "category_stats" USING btree ("slug");

-- Update existing records with year and month
UPDATE "daily_report"
SET
  "year" = EXTRACT(YEAR FROM "date"),
  "month" = EXTRACT(MONTH FROM "date")
WHERE "year" IS NULL OR "month" IS NULL;
