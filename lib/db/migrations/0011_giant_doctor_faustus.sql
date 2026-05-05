CREATE TABLE "generated_artifacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"source" text DEFAULT 'questionnaire_ai' NOT NULL,
	"model" text,
	"content" jsonb NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "generated_artifacts" ADD CONSTRAINT "generated_artifacts_clerk_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_generated_artifacts_org_created_at" ON "generated_artifacts" USING btree ("clerk_org_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_generated_artifacts_org_kind" ON "generated_artifacts" USING btree ("clerk_org_id","kind");