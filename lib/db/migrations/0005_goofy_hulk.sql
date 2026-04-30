CREATE TABLE "regulation_update_reads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"update_id" uuid NOT NULL,
	"clerk_org_id" text NOT NULL,
	"read_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "regulation_update_reads_update_id_clerk_org_id_unique" UNIQUE("update_id","clerk_org_id")
);
--> statement-breakpoint
ALTER TABLE "regulation_updates" ADD COLUMN "source" text DEFAULT 'unknown' NOT NULL;--> statement-breakpoint
ALTER TABLE "regulation_update_reads" ADD CONSTRAINT "regulation_update_reads_update_id_regulation_updates_id_fk" FOREIGN KEY ("update_id") REFERENCES "public"."regulation_updates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "regulation_update_reads" ADD CONSTRAINT "regulation_update_reads_clerk_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_regulation_update_reads_org" ON "regulation_update_reads" USING btree ("clerk_org_id");