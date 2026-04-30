ALTER TABLE "regulation_updates" ADD COLUMN "external_id" text;--> statement-breakpoint
ALTER TABLE "regulation_updates" ADD CONSTRAINT "regulation_updates_external_id_unique" UNIQUE("external_id");