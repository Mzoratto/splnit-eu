CREATE TABLE "vbo_management_trainings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"member_name" text NOT NULL,
	"member_role" text,
	"initial_training_on" date,
	"last_regular_training_on" date,
	"training_source" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vbo_recovery_approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"approved_on" date NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "vbo_recovery_approvals_clerk_org_id_unique" UNIQUE("clerk_org_id")
);
--> statement-breakpoint
CREATE TABLE "vbo_recovery_priorities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"asset_name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vbo_responsible_persons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"name" text NOT NULL,
	"designated_on" date NOT NULL,
	"authority_doc_url" text,
	"qualification_note" text,
	"qualification_file_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "vbo_management_trainings" ADD CONSTRAINT "vbo_management_trainings_clerk_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vbo_recovery_approvals" ADD CONSTRAINT "vbo_recovery_approvals_clerk_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vbo_recovery_priorities" ADD CONSTRAINT "vbo_recovery_priorities_clerk_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vbo_responsible_persons" ADD CONSTRAINT "vbo_responsible_persons_clerk_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE cascade ON UPDATE no action;