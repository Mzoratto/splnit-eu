CREATE TABLE "employee_training_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"employee_name" text NOT NULL,
	"employee_email" text,
	"employee_role" text DEFAULT 'employee' NOT NULL,
	"training_type" text DEFAULT 'security_awareness' NOT NULL,
	"training_date" date NOT NULL,
	"provider" text,
	"notes" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "employee_training_records_employee_role_check" CHECK ("employee_training_records"."employee_role" IN ('employee', 'manager', 'it_admin', 'security_owner', 'contractor')),
	CONSTRAINT "employee_training_records_training_type_check" CHECK ("employee_training_records"."training_type" IN ('security_awareness', 'role_based', 'incident_response', 'ai_literacy', 'privacy'))
);
--> statement-breakpoint
ALTER TABLE "employee_training_records" ADD CONSTRAINT "employee_training_records_clerk_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_employee_training_records_org" ON "employee_training_records" USING btree ("clerk_org_id");--> statement-breakpoint
CREATE INDEX "idx_employee_training_records_org_training_date" ON "employee_training_records" USING btree ("clerk_org_id","training_date");