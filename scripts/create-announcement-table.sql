-- Create announcement table if it doesn't exist
CREATE TABLE IF NOT EXISTS "announcement" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"type" text DEFAULT 'event' NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'published' NOT NULL,
	"event_date" timestamp,
	"event_link" text,
	"views" integer DEFAULT 0 NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'announcement_created_by_user_id_fk'
    ) THEN
        ALTER TABLE "announcement"
        ADD CONSTRAINT "announcement_created_by_user_id_fk"
        FOREIGN KEY ("created_by") REFERENCES "public"."user"("id")
        ON DELETE cascade ON UPDATE no action;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS "announcement_status_idx" ON "announcement" USING btree ("status");
CREATE INDEX IF NOT EXISTS "announcement_type_idx" ON "announcement" USING btree ("type");
CREATE INDEX IF NOT EXISTS "announcement_pinned_idx" ON "announcement" USING btree ("is_pinned");
CREATE INDEX IF NOT EXISTS "announcement_created_at_idx" ON "announcement" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "announcement_event_date_idx" ON "announcement" USING btree ("event_date");
