UPDATE "organisations" SET "ico" = NULL WHERE "ico" IS NOT NULL AND "ico" !~ '^[0-9]{8}$';--> statement-breakpoint
ALTER TABLE "organisations" ALTER COLUMN "ico" SET DATA TYPE varchar(8);--> statement-breakpoint
ALTER TABLE "organisations" ADD COLUMN "dic" varchar(12);--> statement-breakpoint
ALTER TABLE "organisations" ADD COLUMN "sidlo" text;--> statement-breakpoint
ALTER TABLE "organisations" ADD COLUMN "rezim_povinnosti" varchar(10) DEFAULT 'nizsi' NOT NULL;--> statement-breakpoint
ALTER TABLE "organisations" ADD COLUMN "tier" varchar(20) DEFAULT 'standard' NOT NULL;--> statement-breakpoint
ALTER TABLE "organisations" ADD COLUMN "branding_logo_url" text;--> statement-breakpoint
ALTER TABLE "organisations" ADD COLUMN "branding_display_name" varchar(200);--> statement-breakpoint
ALTER TABLE "organisations" ADD COLUMN "branding_footer_text" varchar(500);--> statement-breakpoint
ALTER TABLE "organisations" ADD CONSTRAINT "organisations_ico_format_check" CHECK ("ico" IS NULL OR "ico" ~ '^[0-9]{8}$');--> statement-breakpoint
ALTER TABLE "organisations" ADD CONSTRAINT "organisations_dic_format_check" CHECK ("dic" IS NULL OR "dic" ~ '^CZ[0-9]{8,10}$');--> statement-breakpoint
ALTER TABLE "organisations" ADD CONSTRAINT "organisations_sidlo_length_check" CHECK ("sidlo" IS NULL OR length("sidlo") <= 200);--> statement-breakpoint
ALTER TABLE "organisations" ADD CONSTRAINT "organisations_rezim_povinnosti_check" CHECK ("rezim_povinnosti" IN ('nizsi', 'vyssi'));--> statement-breakpoint
ALTER TABLE "organisations" ADD CONSTRAINT "organisations_tier_check" CHECK ("tier" IN ('standard', 'agency'));
