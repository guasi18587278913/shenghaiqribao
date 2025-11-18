CREATE TABLE "announcement" (
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
--> statement-breakpoint
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "announcement_status_idx" ON "announcement" USING btree ("status");--> statement-breakpoint
CREATE INDEX "announcement_type_idx" ON "announcement" USING btree ("type");--> statement-breakpoint
CREATE INDEX "announcement_pinned_idx" ON "announcement" USING btree ("is_pinned");--> statement-breakpoint
CREATE INDEX "announcement_created_at_idx" ON "announcement" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "announcement_event_date_idx" ON "announcement" USING btree ("event_date");