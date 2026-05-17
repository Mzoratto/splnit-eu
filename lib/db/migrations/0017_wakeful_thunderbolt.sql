CREATE TABLE "org_intake_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"derived_scope" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "org_intake_profiles_clerk_org_id_unique" UNIQUE("clerk_org_id")
);
--> statement-breakpoint
ALTER TABLE "org_intake_profiles" ADD CONSTRAINT "org_intake_profiles_clerk_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE cascade ON UPDATE no action;