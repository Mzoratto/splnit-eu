ALTER TABLE "organisations" ADD COLUMN "country" text DEFAULT 'CZ' NOT NULL;--> statement-breakpoint
ALTER TABLE "organisations" ADD COLUMN "primary_jurisdiction" text DEFAULT 'CZ' NOT NULL;--> statement-breakpoint
ALTER TABLE "organisations" ADD COLUMN "locale" text DEFAULT 'cs-CZ' NOT NULL;