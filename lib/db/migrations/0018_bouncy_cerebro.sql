UPDATE "evidence" SET "source" = 'manual' WHERE "source" = 'manual_upload';--> statement-breakpoint
UPDATE "evidence" SET "source" = 'imported' WHERE "source" = 'questionnaire_ai';--> statement-breakpoint
UPDATE "evidence" SET "source" = 'manual' WHERE "source" IS NULL;--> statement-breakpoint
ALTER TABLE "evidence" ALTER COLUMN "source" SET DEFAULT 'manual';--> statement-breakpoint
ALTER TABLE "evidence" ALTER COLUMN "source" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "evidence" ADD COLUMN "assessment_result" text DEFAULT 'unknown' NOT NULL;--> statement-breakpoint
ALTER TABLE "evidence" ADD COLUMN "collection_status" text DEFAULT 'collected' NOT NULL;--> statement-breakpoint
ALTER TABLE "evidence" ADD COLUMN "confidence" text DEFAULT 'medium' NOT NULL;--> statement-breakpoint
ALTER TABLE "evidence" ADD COLUMN "blocked_reason" text;--> statement-breakpoint
ALTER TABLE "evidence" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "evidence" DROP COLUMN "expires_at";