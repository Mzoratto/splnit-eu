CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
CREATE TYPE "public"."mapping_review_framework" AS ENUM('nis2', 'eu_ai_act', 'gdpr', 'iso27001');--> statement-breakpoint
CREATE TYPE "public"."mapping_review_jurisdiction" AS ENUM('it', 'cz', 'eu', 'de', 'fr', 'es', 'other');--> statement-breakpoint
CREATE TYPE "public"."mapping_review_language" AS ENUM('it', 'cs', 'en', 'de', 'fr', 'es');--> statement-breakpoint
CREATE TYPE "public"."mapping_review_status" AS ENUM('unclassified', 'needs_human', 'agent_decided', 'promoted', 'rejected');--> statement-breakpoint
CREATE TABLE "mapping_promotion_audit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"queue_id" uuid,
	"mapping_id" uuid,
	"framework" "mapping_review_framework" NOT NULL,
	"jurisdiction" "mapping_review_jurisdiction" NOT NULL,
	"language" "mapping_review_language" NOT NULL,
	"decision_source" text NOT NULL,
	"stage2_passes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"stage3_checks" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"promoted_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mapping_review_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"framework" "mapping_review_framework" NOT NULL,
	"jurisdiction" "mapping_review_jurisdiction" NOT NULL,
	"language" "mapping_review_language" NOT NULL,
	"mapping_id" uuid,
	"control_id" text NOT NULL,
	"control_title" text NOT NULL,
	"control_description" text,
	"source_text" text NOT NULL,
	"citation" text NOT NULL,
	"regulator" text,
	"control_embedding" vector(1536),
	"source_embedding" vector(1536),
	"similarity_score" real,
	"status" "mapping_review_status" DEFAULT 'unclassified' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "mapping_promotion_audit" ADD CONSTRAINT "mapping_promotion_audit_queue_id_mapping_review_queue_id_fk" FOREIGN KEY ("queue_id") REFERENCES "public"."mapping_review_queue"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mapping_promotion_audit" ADD CONSTRAINT "mapping_promotion_audit_mapping_id_framework_control_articles_id_fk" FOREIGN KEY ("mapping_id") REFERENCES "public"."framework_control_articles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mapping_review_queue" ADD CONSTRAINT "mapping_review_queue_mapping_id_framework_control_articles_id_fk" FOREIGN KEY ("mapping_id") REFERENCES "public"."framework_control_articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_mapping_promotion_audit_scope" ON "mapping_promotion_audit" USING btree ("framework","jurisdiction","promoted_at");--> statement-breakpoint
CREATE INDEX "idx_mapping_promotion_audit_mapping" ON "mapping_promotion_audit" USING btree ("mapping_id");--> statement-breakpoint
CREATE INDEX "idx_mapping_review_queue_scope_status" ON "mapping_review_queue" USING btree ("framework","jurisdiction","status");--> statement-breakpoint
CREATE INDEX "idx_mapping_review_queue_mapping" ON "mapping_review_queue" USING btree ("mapping_id");
