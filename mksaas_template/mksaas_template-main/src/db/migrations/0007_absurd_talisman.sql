CREATE TABLE "comment" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"parent_id" text,
	"content" text NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_report" (
	"id" text PRIMARY KEY NOT NULL,
	"date" timestamp NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"views" integer DEFAULT 0 NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"comment_count" integer DEFAULT 0 NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "daily_report_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "daily_topic" (
	"id" text PRIMARY KEY NOT NULL,
	"report_id" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"editor_note" text,
	"category" text NOT NULL,
	"importance" integer DEFAULT 3 NOT NULL,
	"tags" text[],
	"source_messages" text,
	"source_group" text,
	"views" integer DEFAULT 0 NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"comment_count" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_item" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"url" text,
	"content" text,
	"tags" text[],
	"referenced_in_topics" text[],
	"views" integer DEFAULT 0 NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "raw_message" (
	"id" text PRIMARY KEY NOT NULL,
	"group_name" text NOT NULL,
	"sender_name" text NOT NULL,
	"sender_id" text,
	"content" text NOT NULL,
	"message_type" text DEFAULT 'text' NOT NULL,
	"timestamp" timestamp NOT NULL,
	"is_processed" boolean DEFAULT false NOT NULL,
	"ai_score" integer,
	"category" text,
	"linked_topic_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_preference" (
	"user_id" text PRIMARY KEY NOT NULL,
	"subscribed_tags" text[],
	"email_notification" boolean DEFAULT true NOT NULL,
	"notification_time" text DEFAULT '08:00',
	"unread_count" integer DEFAULT 0 NOT NULL,
	"last_viewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "planet_number" text;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_report" ADD CONSTRAINT "daily_report_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_topic" ADD CONSTRAINT "daily_topic_report_id_daily_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."daily_report"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_item" ADD CONSTRAINT "knowledge_item_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raw_message" ADD CONSTRAINT "raw_message_linked_topic_id_daily_topic_id_fk" FOREIGN KEY ("linked_topic_id") REFERENCES "public"."daily_topic"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preference" ADD CONSTRAINT "user_preference_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comment_target_idx" ON "comment" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "comment_user_id_idx" ON "comment" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "comment_parent_id_idx" ON "comment" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "comment_created_at_idx" ON "comment" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "daily_report_date_idx" ON "daily_report" USING btree ("date");--> statement-breakpoint
CREATE INDEX "daily_report_status_idx" ON "daily_report" USING btree ("status");--> statement-breakpoint
CREATE INDEX "daily_report_created_by_idx" ON "daily_report" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "daily_topic_report_id_idx" ON "daily_topic" USING btree ("report_id");--> statement-breakpoint
CREATE INDEX "daily_topic_category_idx" ON "daily_topic" USING btree ("category");--> statement-breakpoint
CREATE INDEX "daily_topic_importance_idx" ON "daily_topic" USING btree ("importance");--> statement-breakpoint
CREATE INDEX "daily_topic_sort_order_idx" ON "daily_topic" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "knowledge_item_type_idx" ON "knowledge_item" USING btree ("type");--> statement-breakpoint
CREATE INDEX "knowledge_item_created_by_idx" ON "knowledge_item" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "raw_message_timestamp_idx" ON "raw_message" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "raw_message_is_processed_idx" ON "raw_message" USING btree ("is_processed");--> statement-breakpoint
CREATE INDEX "raw_message_group_name_idx" ON "raw_message" USING btree ("group_name");--> statement-breakpoint
CREATE INDEX "raw_message_ai_score_idx" ON "raw_message" USING btree ("ai_score");--> statement-breakpoint
CREATE INDEX "raw_message_linked_topic_id_idx" ON "raw_message" USING btree ("linked_topic_id");--> statement-breakpoint
CREATE INDEX "user_phone_idx" ON "user" USING btree ("phone");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_phone_unique" UNIQUE("phone");