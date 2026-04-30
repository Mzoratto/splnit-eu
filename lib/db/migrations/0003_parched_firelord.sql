CREATE TABLE "consultant_clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultant_org_id" text NOT NULL,
	"client_org_id" text NOT NULL,
	"access_level" text DEFAULT 'manage' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"invite_email" text,
	"white_label_logo_url" text,
	"white_label_accent_color" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "consultant_clients_consultant_org_id_client_org_id_unique" UNIQUE("consultant_org_id","client_org_id")
);
--> statement-breakpoint
ALTER TABLE "consultant_clients" ADD CONSTRAINT "consultant_clients_consultant_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("consultant_org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_clients" ADD CONSTRAINT "consultant_clients_client_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("client_org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_consultant_clients_consultant" ON "consultant_clients" USING btree ("consultant_org_id");--> statement-breakpoint
CREATE INDEX "idx_consultant_clients_client" ON "consultant_clients" USING btree ("client_org_id");