CREATE TABLE "agencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text,
	"name" text NOT NULL,
	"contact_email" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "agencies_clerk_org_id_unique" UNIQUE("clerk_org_id")
);
--> statement-breakpoint
CREATE TABLE "agency_branding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid NOT NULL,
	"display_name" text,
	"logo_url" text,
	"logo_alt_text" text,
	"primary_colour" text,
	"powered_by_text" text DEFAULT 'Powered by Splnit.eu' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "agency_branding_agency_id_unique" UNIQUE("agency_id"),
	CONSTRAINT "agency_branding_primary_colour_check" CHECK ("agency_branding"."primary_colour" IS NULL OR "agency_branding"."primary_colour" ~ '^#[0-9A-Fa-f]{6}$')
);
--> statement-breakpoint
CREATE TABLE "agency_client_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid NOT NULL,
	"email" text,
	"token_hash" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_by_user_id" text NOT NULL,
	"accepted_by_user_id" text,
	"accepted_org_id" text,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "agency_client_invites_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "agency_client_orgs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid NOT NULL,
	"org_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"linked_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "agency_client_orgs_agency_id_org_id_unique" UNIQUE("agency_id","org_id"),
	CONSTRAINT "agency_client_orgs_org_id_unique" UNIQUE("org_id")
);
--> statement-breakpoint
CREATE TABLE "agency_consultants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid NOT NULL,
	"clerk_user_id" text,
	"email" text,
	"role" text DEFAULT 'consultant' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"invited_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "agency_consultants_agency_id_clerk_user_id_unique" UNIQUE("agency_id","clerk_user_id"),
	CONSTRAINT "agency_consultants_agency_id_email_unique" UNIQUE("agency_id","email")
);
--> statement-breakpoint
CREATE TABLE "control_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid NOT NULL,
	"org_id" text NOT NULL,
	"control_key" text NOT NULL,
	"author_user_id" text NOT NULL,
	"author_type" text NOT NULL,
	"body" text NOT NULL,
	"is_gap_flag" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "control_comments_author_type_check" CHECK ("control_comments"."author_type" IN ('consultant', 'client'))
);
--> statement-breakpoint
ALTER TABLE "agencies" ADD CONSTRAINT "agencies_clerk_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_branding" ADD CONSTRAINT "agency_branding_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_client_invites" ADD CONSTRAINT "agency_client_invites_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_client_invites" ADD CONSTRAINT "agency_client_invites_accepted_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("accepted_org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_client_orgs" ADD CONSTRAINT "agency_client_orgs_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_client_orgs" ADD CONSTRAINT "agency_client_orgs_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_consultants" ADD CONSTRAINT "agency_consultants_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "control_comments" ADD CONSTRAINT "control_comments_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "control_comments" ADD CONSTRAINT "control_comments_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_agencies_status" ON "agencies" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_agency_client_invites_agency" ON "agency_client_invites" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX "idx_agency_client_invites_status_expires" ON "agency_client_invites" USING btree ("status","expires_at");--> statement-breakpoint
CREATE INDEX "idx_agency_client_orgs_agency" ON "agency_client_orgs" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX "idx_agency_consultants_user" ON "agency_consultants" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX "idx_agency_consultants_agency" ON "agency_consultants" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX "idx_control_comments_org_control" ON "control_comments" USING btree ("org_id","control_key");--> statement-breakpoint
CREATE INDEX "idx_control_comments_agency" ON "control_comments" USING btree ("agency_id");
--> statement-breakpoint
INSERT INTO "agencies" (
	"clerk_org_id",
	"name",
	"contact_email",
	"status",
	"created_at",
	"updated_at"
)
SELECT
	"consultant_clients"."consultant_org_id",
	COALESCE("organisations"."name", "consultant_clients"."consultant_org_id"),
	MIN("profiles"."email"),
	'active',
	MIN("consultant_clients"."created_at"),
	MAX("consultant_clients"."updated_at")
FROM "consultant_clients"
LEFT JOIN "organisations"
	ON "organisations"."clerk_org_id" = "consultant_clients"."consultant_org_id"
LEFT JOIN "profiles"
	ON "profiles"."clerk_org_id" = "consultant_clients"."consultant_org_id"
GROUP BY
	"consultant_clients"."consultant_org_id",
	"organisations"."name"
ON CONFLICT ("clerk_org_id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "agency_client_orgs" (
	"agency_id",
	"org_id",
	"status",
	"linked_by_user_id",
	"created_at",
	"updated_at"
)
SELECT DISTINCT ON ("consultant_clients"."client_org_id")
	"agencies"."id",
	"consultant_clients"."client_org_id",
	"consultant_clients"."status",
	NULL,
	"consultant_clients"."created_at",
	"consultant_clients"."updated_at"
FROM "consultant_clients"
INNER JOIN "agencies"
	ON "agencies"."clerk_org_id" = "consultant_clients"."consultant_org_id"
ORDER BY
	"consultant_clients"."client_org_id",
	"consultant_clients"."updated_at" DESC
ON CONFLICT DO NOTHING;
--> statement-breakpoint
WITH "branding_seeds" AS (
	SELECT DISTINCT ON ("agencies"."id")
		"agencies"."id" AS "agency_id",
		"organisations"."name" AS "agency_name",
		"consultant_clients"."white_label_logo_url" AS "logo_url",
		CASE
			WHEN "consultant_clients"."white_label_accent_color" ~ '^#[0-9A-Fa-f]{6}$'
			THEN "consultant_clients"."white_label_accent_color"
			ELSE NULL
		END AS "primary_colour",
		"consultant_clients"."created_at" AS "created_at",
		"consultant_clients"."updated_at" AS "updated_at"
	FROM "consultant_clients"
	INNER JOIN "agencies"
		ON "agencies"."clerk_org_id" = "consultant_clients"."consultant_org_id"
	LEFT JOIN "organisations"
		ON "organisations"."clerk_org_id" = "consultant_clients"."consultant_org_id"
	WHERE
		"consultant_clients"."white_label_logo_url" IS NOT NULL
		OR "consultant_clients"."white_label_accent_color" IS NOT NULL
	ORDER BY
		"agencies"."id",
		"consultant_clients"."updated_at" DESC
)
INSERT INTO "agency_branding" (
	"agency_id",
	"display_name",
	"logo_url",
	"logo_alt_text",
	"primary_colour",
	"powered_by_text",
	"created_at",
	"updated_at"
)
SELECT
	"branding_seeds"."agency_id",
	"branding_seeds"."agency_name",
	"branding_seeds"."logo_url",
	"branding_seeds"."agency_name",
	"branding_seeds"."primary_colour",
	'Powered by Splnit.eu',
	"branding_seeds"."created_at",
	"branding_seeds"."updated_at"
FROM "branding_seeds"
ON CONFLICT ("agency_id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "agency_consultants" (
	"agency_id",
	"clerk_user_id",
	"email",
	"role",
	"status",
	"invited_by_user_id",
	"created_at",
	"updated_at"
)
SELECT
	"agencies"."id",
	"profiles"."clerk_user_id",
	"profiles"."email",
	CASE WHEN "profiles"."role" = 'admin' THEN 'admin' ELSE 'consultant' END,
	'active',
	'migration',
	"profiles"."created_at",
	now()
FROM "agencies"
INNER JOIN "profiles"
	ON "profiles"."clerk_org_id" = "agencies"."clerk_org_id"
WHERE "agencies"."clerk_org_id" IS NOT NULL
ON CONFLICT ("agency_id", "clerk_user_id") DO NOTHING;
