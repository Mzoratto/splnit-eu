CREATE TABLE "prehled_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"baseline_id" text NOT NULL,
	"status" text NOT NULL,
	"implementation_note" text,
	"planned_date" date,
	"priority" text,
	"responsible_person" text,
	"justification" text,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "prehled_entries_clerk_org_id_baseline_id_unique" UNIQUE("clerk_org_id","baseline_id"),
	CONSTRAINT "prehled_entries_status_check" CHECK ("prehled_entries"."status" IN ('zavedeno', 'planovano', 'nezavedeno'))
);
--> statement-breakpoint
CREATE TABLE "prehled_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"version_number" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"blob_url" text NOT NULL,
	"snapshot" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "prehled_entries" ADD CONSTRAINT "prehled_entries_clerk_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prehled_versions" ADD CONSTRAINT "prehled_versions_clerk_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE cascade ON UPDATE no action;