CREATE TABLE "category_stats" (
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
--> statement-breakpoint
ALTER TABLE "daily_report" ADD COLUMN "year" integer;--> statement-breakpoint
ALTER TABLE "daily_report" ADD COLUMN "month" integer;--> statement-breakpoint
CREATE INDEX "category_stats_count_idx" ON "category_stats" USING btree ("count");--> statement-breakpoint
CREATE INDEX "category_stats_featured_idx" ON "category_stats" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "category_stats_slug_idx" ON "category_stats" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "daily_report_year_month_idx" ON "daily_report" USING btree ("year","month");