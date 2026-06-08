CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"tier" text DEFAULT 'supporting' NOT NULL,
	"confidentiality" text DEFAULT 'low' NOT NULL,
	"integrity" text DEFAULT 'low' NOT NULL,
	"availability" text DEFAULT 'low' NOT NULL,
	"owner" text,
	"source" text DEFAULT 'manual' NOT NULL,
	"source_provider" text,
	"external_key" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "assets_org_external_key_unique" UNIQUE("clerk_org_id","external_key"),
	CONSTRAINT "assets_category_check" CHECK ("assets"."category" IN ('software', 'hardware', 'network', 'service', 'location', 'data')),
	CONSTRAINT "assets_tier_check" CHECK ("assets"."tier" IN ('primary', 'supporting')),
	CONSTRAINT "assets_confidentiality_check" CHECK ("assets"."confidentiality" IN ('low', 'medium', 'high')),
	CONSTRAINT "assets_integrity_check" CHECK ("assets"."integrity" IN ('low', 'medium', 'high')),
	CONSTRAINT "assets_availability_check" CHECK ("assets"."availability" IN ('low', 'medium', 'high'))
);
--> statement-breakpoint
CREATE TABLE "discovered_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"discovery_run_id" uuid NOT NULL,
	"external_key" text NOT NULL,
	"provider" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"tier" text NOT NULL,
	"suggested_cia" jsonb NOT NULL,
	"rationale" text NOT NULL,
	"suggested_owner" text DEFAULT '' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"review_status" text DEFAULT 'proposed' NOT NULL,
	"linked_asset_id" uuid,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "discovered_assets_org_external_key_unique" UNIQUE("clerk_org_id","external_key"),
	CONSTRAINT "discovered_assets_review_status_check" CHECK ("discovered_assets"."review_status" IN ('proposed', 'confirmed', 'dismissed'))
);
--> statement-breakpoint
CREATE TABLE "discovered_vendors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"discovery_run_id" uuid NOT NULL,
	"external_key" text NOT NULL,
	"provider" text NOT NULL,
	"name" text NOT NULL,
	"ico" text,
	"supply_type" text NOT NULL,
	"suggested_criticality" text NOT NULL,
	"rationale" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"review_status" text DEFAULT 'proposed' NOT NULL,
	"linked_vendor_id" uuid,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "discovered_vendors_org_external_key_unique" UNIQUE("clerk_org_id","external_key"),
	CONSTRAINT "discovered_vendors_review_status_check" CHECK ("discovered_vendors"."review_status" IN ('proposed', 'confirmed', 'dismissed')),
	CONSTRAINT "discovered_vendors_criticality_check" CHECK ("discovered_vendors"."suggested_criticality" IN ('standard', 'high', 'critical'))
);
--> statement-breakpoint
CREATE TABLE "discovery_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"integration_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"status" text DEFAULT 'running' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"assets_proposed" integer DEFAULT 0 NOT NULL,
	"vendors_proposed" integer DEFAULT 0 NOT NULL,
	"warnings" jsonb DEFAULT '[]'::jsonb NOT NULL,
	CONSTRAINT "discovery_runs_status_check" CHECK ("discovery_runs"."status" IN ('running', 'complete', 'error'))
);
--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "ico" text;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "supply_type" text;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "source" text DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "source_provider" text;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "external_key" text;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_clerk_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discovered_assets" ADD CONSTRAINT "discovered_assets_clerk_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discovered_assets" ADD CONSTRAINT "discovered_assets_discovery_run_id_discovery_runs_id_fk" FOREIGN KEY ("discovery_run_id") REFERENCES "public"."discovery_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discovered_assets" ADD CONSTRAINT "discovered_assets_linked_asset_id_assets_id_fk" FOREIGN KEY ("linked_asset_id") REFERENCES "public"."assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discovered_vendors" ADD CONSTRAINT "discovered_vendors_clerk_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discovered_vendors" ADD CONSTRAINT "discovered_vendors_discovery_run_id_discovery_runs_id_fk" FOREIGN KEY ("discovery_run_id") REFERENCES "public"."discovery_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discovered_vendors" ADD CONSTRAINT "discovered_vendors_linked_vendor_id_vendors_id_fk" FOREIGN KEY ("linked_vendor_id") REFERENCES "public"."vendors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discovery_runs" ADD CONSTRAINT "discovery_runs_clerk_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discovery_runs" ADD CONSTRAINT "discovery_runs_integration_id_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."integrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_assets_org" ON "assets" USING btree ("clerk_org_id");--> statement-breakpoint
CREATE INDEX "idx_assets_org_category" ON "assets" USING btree ("clerk_org_id","category");--> statement-breakpoint
CREATE INDEX "idx_discovered_assets_org_status" ON "discovered_assets" USING btree ("clerk_org_id","review_status");--> statement-breakpoint
CREATE INDEX "idx_discovered_assets_run" ON "discovered_assets" USING btree ("discovery_run_id");--> statement-breakpoint
CREATE INDEX "idx_discovered_vendors_org_status" ON "discovered_vendors" USING btree ("clerk_org_id","review_status");--> statement-breakpoint
CREATE INDEX "idx_discovered_vendors_run" ON "discovered_vendors" USING btree ("discovery_run_id");--> statement-breakpoint
CREATE INDEX "idx_discovery_runs_org_started" ON "discovery_runs" USING btree ("clerk_org_id","started_at");--> statement-breakpoint
CREATE INDEX "idx_discovery_runs_integration" ON "discovery_runs" USING btree ("integration_id");--> statement-breakpoint
CREATE INDEX "idx_vendors_org_source_provider" ON "vendors" USING btree ("clerk_org_id","source_provider");--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_org_external_key_unique" UNIQUE("clerk_org_id","external_key");