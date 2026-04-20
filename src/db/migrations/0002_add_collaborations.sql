CREATE TYPE "public"."collaboration_state" AS ENUM('awaiting_brand_brief', 'awaiting_creator_confirmation', 'revision_requested', 'in_progress', 'submitted', 'completed');--> statement-breakpoint

CREATE TABLE "collaborations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" uuid NOT NULL,
	"brand_user_id" uuid NOT NULL,
	"creator_id" uuid NOT NULL,
	"state" "collaboration_state" DEFAULT 'awaiting_brand_brief' NOT NULL,
	"deliverable_type" varchar(100),
	"due_date" timestamp with time zone,
	"budget_amount" integer,
	"brief_data" jsonb,
	"submitted_url" text,
	"submitted_note" text,
	"approved_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"revision_requested_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "collaborations_deal_id_unique" UNIQUE("deal_id")
);--> statement-breakpoint

CREATE TABLE "collaboration_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collaboration_id" uuid NOT NULL,
	"sender_id" uuid,
	"body" text NOT NULL,
	"is_system_event" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE "collaboration_state_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collaboration_id" uuid NOT NULL,
	"from_state" varchar(50),
	"to_state" varchar(50) NOT NULL,
	"changed_by" uuid,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

ALTER TABLE "collaborations" ADD CONSTRAINT "collaborations_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborations" ADD CONSTRAINT "collaborations_brand_user_id_users_id_fk" FOREIGN KEY ("brand_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborations" ADD CONSTRAINT "collaborations_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "collaboration_messages" ADD CONSTRAINT "collaboration_messages_collaboration_id_collaborations_id_fk" FOREIGN KEY ("collaboration_id") REFERENCES "public"."collaborations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_messages" ADD CONSTRAINT "collaboration_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "collaboration_state_history" ADD CONSTRAINT "collaboration_state_history_collaboration_id_collaborations_id_fk" FOREIGN KEY ("collaboration_id") REFERENCES "public"."collaborations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_state_history" ADD CONSTRAINT "collaboration_state_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint

CREATE INDEX "collaborations_brand_user_id_idx" ON "collaborations" USING btree ("brand_user_id");--> statement-breakpoint
CREATE INDEX "collaborations_creator_id_idx" ON "collaborations" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "collaborations_state_idx" ON "collaborations" USING btree ("state");--> statement-breakpoint

CREATE INDEX "collab_messages_collab_id_created_at_idx" ON "collaboration_messages" USING btree ("collaboration_id", "created_at");--> statement-breakpoint

CREATE INDEX "collab_state_history_collab_id_idx" ON "collaboration_state_history" USING btree ("collaboration_id");
