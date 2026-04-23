-- Add brief draft storage for autosave
ALTER TABLE "collaborations" ADD COLUMN "brief_draft" jsonb;

-- Add action metadata to system messages for inline CTAs
ALTER TABLE "collaboration_messages" ADD COLUMN "action_type" varchar(50);
ALTER TABLE "collaboration_messages" ADD COLUMN "action_label" varchar(100);
