ALTER TABLE "organisations" ADD COLUMN "tool_inventory" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "organisations" ADD COLUMN "onboarding_completed_at" timestamp with time zone;