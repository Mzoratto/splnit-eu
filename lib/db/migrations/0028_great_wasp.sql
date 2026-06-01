CREATE TABLE "remediation_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"control_id" uuid NOT NULL,
	"control_key" text NOT NULL,
	"source_type" text NOT NULL,
	"source_key" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"framework_refs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"severity" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"due_date" date,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "remediation_tasks_source_unique" UNIQUE("clerk_org_id","control_id","source_type","source_key"),
	CONSTRAINT "remediation_tasks_source_type_check" CHECK ("remediation_tasks"."source_type" IN ('workspace_evidence_stale', 'workspace_gap', 'helios_csv_change', 'workspace_review_due')),
	CONSTRAINT "remediation_tasks_status_check" CHECK ("remediation_tasks"."status" IN ('open', 'in_progress', 'resolved', 'dismissed')),
	CONSTRAINT "remediation_tasks_severity_check" CHECK ("remediation_tasks"."severity" IN ('low', 'medium', 'high'))
);
--> statement-breakpoint
ALTER TABLE "remediation_tasks" ADD CONSTRAINT "remediation_tasks_clerk_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "remediation_tasks" ADD CONSTRAINT "remediation_tasks_control_id_controls_id_fk" FOREIGN KEY ("control_id") REFERENCES "public"."controls"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_remediation_tasks_org_status_due" ON "remediation_tasks" USING btree ("clerk_org_id","status","due_date");--> statement-breakpoint
CREATE INDEX "idx_remediation_tasks_org_control" ON "remediation_tasks" USING btree ("clerk_org_id","control_key");