CREATE TYPE "public"."mapping_review_confidence" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."mapping_review_decision" AS ENUM('approved', 'wrong_article', 'too_broad', 'needs_research');--> statement-breakpoint
ALTER TABLE "mapping_review_queue" ADD COLUMN "agent_verdict" "mapping_review_decision";--> statement-breakpoint
ALTER TABLE "mapping_review_queue" ADD COLUMN "agent_confidence" "mapping_review_confidence";--> statement-breakpoint
ALTER TABLE "mapping_review_queue" ADD COLUMN "stage2_passes" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "mapping_review_queue" ADD COLUMN "stage3_checks" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "mapping_review_queue" ADD COLUMN "classified_at" timestamp with time zone;