CREATE TABLE "access_review_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"clerk_org_id" text NOT NULL,
	"user_name" text NOT NULL,
	"user_email" text,
	"resource" text NOT NULL,
	"access_level" text NOT NULL,
	"decision" text,
	"decided_by" text,
	"decided_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "access_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"name" text NOT NULL,
	"provider" text NOT NULL,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"total_items" integer DEFAULT 0,
	"reviewed_items" integer DEFAULT 0,
	"due_date" date,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "controls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"title_cs" text NOT NULL,
	"title_en" text NOT NULL,
	"description_cs" text,
	"category" text,
	"test_type" text,
	"requires_evidence" boolean DEFAULT true NOT NULL,
	"is_automated" boolean DEFAULT false NOT NULL,
	CONSTRAINT "controls_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"control_id" uuid NOT NULL,
	"integration_run_id" uuid,
	"type" text NOT NULL,
	"source" text,
	"blob_url" text,
	"snapshot_data" jsonb,
	"description" text,
	"collected_by" text,
	"expires_at" date,
	"collected_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "framework_controls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"framework_id" uuid NOT NULL,
	"control_id" uuid NOT NULL,
	"article_ref" text,
	"requirement_level" text DEFAULT 'mandatory' NOT NULL,
	"sort_order" integer DEFAULT 0,
	CONSTRAINT "framework_controls_framework_id_control_id_unique" UNIQUE("framework_id","control_id")
);
--> statement-breakpoint
CREATE TABLE "frameworks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name_cs" text NOT NULL,
	"name_en" text NOT NULL,
	"description_cs" text,
	"regulator" text,
	"mandatory_deadline" date,
	"version" text,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "frameworks_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"severity" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"affects_personal_data" boolean DEFAULT false,
	"affects_critical_systems" boolean DEFAULT false,
	"reported_to_nukib" boolean DEFAULT false,
	"nukib_reported_at" timestamp with time zone,
	"reported_to_uoou" boolean DEFAULT false,
	"uoou_reported_at" timestamp with time zone,
	"detected_at" timestamp with time zone NOT NULL,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "integration_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"integration_id" uuid NOT NULL,
	"test_id" uuid NOT NULL,
	"clerk_org_id" text NOT NULL,
	"status" text NOT NULL,
	"result_data" jsonb,
	"failure_reason" text,
	"ran_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"provider" text NOT NULL,
	"access_token_enc" text,
	"refresh_token_enc" text,
	"token_expires_at" timestamp with time zone,
	"status" text DEFAULT 'connected' NOT NULL,
	"last_synced_at" timestamp with time zone,
	"last_error_msg" text,
	"config" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "integrations_clerk_org_id_provider_unique" UNIQUE("clerk_org_id","provider")
);
--> statement-breakpoint
CREATE TABLE "org_control_statuses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"control_id" uuid NOT NULL,
	"status" text DEFAULT 'unknown' NOT NULL,
	"last_tested_at" timestamp with time zone,
	"last_evidence_at" timestamp with time zone,
	"assigned_to" text,
	"notes" text,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "org_control_statuses_clerk_org_id_control_id_unique" UNIQUE("clerk_org_id","control_id")
);
--> statement-breakpoint
CREATE TABLE "org_frameworks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"framework_id" uuid NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"score" integer,
	"enrolled_at" timestamp with time zone DEFAULT now(),
	"target_date" date,
	CONSTRAINT "org_frameworks_clerk_org_id_framework_id_unique" UNIQUE("clerk_org_id","framework_id")
);
--> statement-breakpoint
CREATE TABLE "organisations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"name" text NOT NULL,
	"ico" text,
	"sector" text,
	"employee_count" text,
	"plan" text DEFAULT 'free' NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "organisations_clerk_org_id_unique" UNIQUE("clerk_org_id"),
	CONSTRAINT "organisations_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
	CONSTRAINT "organisations_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"type" text NOT NULL,
	"title_cs" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"content" jsonb,
	"blob_url" text,
	"approved_by" text,
	"reviewed_at" date,
	"expires_at" date,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "policy_controls" (
	"policy_id" uuid NOT NULL,
	"control_id" uuid NOT NULL,
	CONSTRAINT "policy_controls_policy_id_control_id_unique" UNIQUE("policy_id","control_id")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"clerk_org_id" text NOT NULL,
	"full_name" text,
	"email" text,
	"role" text DEFAULT 'member' NOT NULL,
	"locale" text DEFAULT 'cs' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "profiles_clerk_user_id_unique" UNIQUE("clerk_user_id")
);
--> statement-breakpoint
CREATE TABLE "regulation_updates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"framework_id" uuid,
	"title" text NOT NULL,
	"summary_cs" text,
	"summary_en" text,
	"source_url" text,
	"severity" text DEFAULT 'info' NOT NULL,
	"affects_plans" text[],
	"published_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "risk_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text,
	"likelihood" integer NOT NULL,
	"impact" integer NOT NULL,
	"risk_score" integer,
	"status" text DEFAULT 'open' NOT NULL,
	"owner" text,
	"due_date" date,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"control_id" uuid NOT NULL,
	"name" text NOT NULL,
	"integration_type" text NOT NULL,
	"check_logic" text NOT NULL,
	"pass_criteria" text,
	"run_frequency" interval DEFAULT '1 hour',
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trust_center_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"email" text NOT NULL,
	"company" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"nda_signed" boolean DEFAULT false,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trust_centers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"subdomain" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"nda_required" boolean DEFAULT false NOT NULL,
	"visible_frameworks" jsonb DEFAULT '[]'::jsonb,
	"custom_domain" text,
	"logo_url" text,
	"accent_color" text,
	"last_updated" timestamp with time zone DEFAULT now(),
	CONSTRAINT "trust_centers_clerk_org_id_unique" UNIQUE("clerk_org_id"),
	CONSTRAINT "trust_centers_subdomain_unique" UNIQUE("subdomain")
);
--> statement-breakpoint
CREATE TABLE "vendor_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"clerk_org_id" text NOT NULL,
	"answers" jsonb DEFAULT '{}'::jsonb,
	"score" integer,
	"status" text DEFAULT 'draft' NOT NULL,
	"assessed_by" text,
	"assessed_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"name" text NOT NULL,
	"website" text,
	"category" text,
	"risk_tier" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"last_assessed_at" date,
	"next_review_at" date,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "access_review_items" ADD CONSTRAINT "access_review_items_review_id_access_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."access_reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_reviews" ADD CONSTRAINT "access_reviews_clerk_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_clerk_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_control_id_controls_id_fk" FOREIGN KEY ("control_id") REFERENCES "public"."controls"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_integration_run_id_integration_runs_id_fk" FOREIGN KEY ("integration_run_id") REFERENCES "public"."integration_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "framework_controls" ADD CONSTRAINT "framework_controls_framework_id_frameworks_id_fk" FOREIGN KEY ("framework_id") REFERENCES "public"."frameworks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "framework_controls" ADD CONSTRAINT "framework_controls_control_id_controls_id_fk" FOREIGN KEY ("control_id") REFERENCES "public"."controls"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_clerk_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_runs" ADD CONSTRAINT "integration_runs_integration_id_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."integrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_runs" ADD CONSTRAINT "integration_runs_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_clerk_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_control_statuses" ADD CONSTRAINT "org_control_statuses_control_id_controls_id_fk" FOREIGN KEY ("control_id") REFERENCES "public"."controls"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_frameworks" ADD CONSTRAINT "org_frameworks_clerk_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_frameworks" ADD CONSTRAINT "org_frameworks_framework_id_frameworks_id_fk" FOREIGN KEY ("framework_id") REFERENCES "public"."frameworks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policies" ADD CONSTRAINT "policies_clerk_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_controls" ADD CONSTRAINT "policy_controls_policy_id_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."policies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_controls" ADD CONSTRAINT "policy_controls_control_id_controls_id_fk" FOREIGN KEY ("control_id") REFERENCES "public"."controls"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_clerk_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "regulation_updates" ADD CONSTRAINT "regulation_updates_framework_id_frameworks_id_fk" FOREIGN KEY ("framework_id") REFERENCES "public"."frameworks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_items" ADD CONSTRAINT "risk_items_clerk_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_control_id_controls_id_fk" FOREIGN KEY ("control_id") REFERENCES "public"."controls"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trust_centers" ADD CONSTRAINT "trust_centers_clerk_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_assessments" ADD CONSTRAINT "vendor_assessments_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_clerk_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_runs_org_test" ON "integration_runs" USING btree ("clerk_org_id","test_id");--> statement-breakpoint
CREATE INDEX "idx_runs_ran_at" ON "integration_runs" USING btree ("ran_at");