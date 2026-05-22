CREATE TABLE "agency_consultant_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid NOT NULL,
	"email" text NOT NULL,
	"token_hash" text NOT NULL,
	"role" text DEFAULT 'consultant' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_by_user_id" text NOT NULL,
	"accepted_by_user_id" text,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "agency_consultant_invites_token_hash_unique" UNIQUE("token_hash"),
	CONSTRAINT "agency_consultant_invites_role_check" CHECK ("agency_consultant_invites"."role" IN ('admin', 'consultant')),
	CONSTRAINT "agency_consultant_invites_status_check" CHECK ("agency_consultant_invites"."status" IN ('pending', 'accepted', 'expired'))
);
--> statement-breakpoint
CREATE TABLE "reminder_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"reminder_type" text NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reminder_log_clerk_org_id_reminder_type_unique" UNIQUE("clerk_org_id","reminder_type")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"stripe_customer_id" text NOT NULL,
	"stripe_subscription_id" text,
	"plan" text NOT NULL,
	"status" text NOT NULL,
	"current_period_end" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_clerk_org_id_unique" UNIQUE("clerk_org_id"),
	CONSTRAINT "subscriptions_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
	CONSTRAINT "subscriptions_plan_check" CHECK ("subscriptions"."plan" IN ('sme', 'agency')),
	CONSTRAINT "subscriptions_status_check" CHECK ("subscriptions"."status" IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete'))
);
--> statement-breakpoint
ALTER TABLE "agencies" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "agencies" ADD COLUMN "stripe_subscription_id" text;--> statement-breakpoint
ALTER TABLE "agencies" ADD COLUMN "plan" text;--> statement-breakpoint
ALTER TABLE "agencies" ADD COLUMN "plan_client_limit" integer DEFAULT 20;--> statement-breakpoint
ALTER TABLE "agency_consultant_invites" ADD CONSTRAINT "agency_consultant_invites_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_agency_consultant_invites_agency" ON "agency_consultant_invites" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX "idx_agency_consultant_invites_status_expires" ON "agency_consultant_invites" USING btree ("status","expires_at");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_clerk_org_id" ON "subscriptions" USING btree ("clerk_org_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_stripe_customer_id" ON "subscriptions" USING btree ("stripe_customer_id");--> statement-breakpoint
ALTER TABLE "agencies" ADD CONSTRAINT "agencies_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "agencies" ADD CONSTRAINT "agencies_plan_check" CHECK ("agencies"."plan" IS NULL OR "agencies"."plan" = 'agency');