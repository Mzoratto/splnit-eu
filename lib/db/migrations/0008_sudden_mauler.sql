CREATE TABLE "source_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"jurisdiction" text NOT NULL,
	"locale" text NOT NULL,
	"title" text NOT NULL,
	"citation" text NOT NULL,
	"url" text,
	"filename" text,
	"effective_date" timestamp with time zone,
	"last_reviewed" timestamp with time zone,
	CONSTRAINT "source_documents_filename_unique" UNIQUE("filename")
);
--> statement-breakpoint
ALTER TABLE "framework_controls" ADD COLUMN "regulator_guidance" text;--> statement-breakpoint
ALTER TABLE "framework_controls" ADD COLUMN "evidence_requirements" text;--> statement-breakpoint
ALTER TABLE "framework_controls" ADD COLUMN "localized_title" text;--> statement-breakpoint
ALTER TABLE "framework_controls" ADD COLUMN "localized_description" text;