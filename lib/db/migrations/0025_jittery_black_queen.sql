CREATE TABLE "trust_center_clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trust_center_id" uuid NOT NULL,
	"client_name" varchar(200) NOT NULL,
	"access_token" text NOT NULL,
	"visible_frameworks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_viewed_at" timestamp with time zone,
	"view_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "trust_center_clients_access_token_unique" UNIQUE("access_token")
);
--> statement-breakpoint
ALTER TABLE "trust_center_clients" ADD CONSTRAINT "trust_center_clients_trust_center_id_trust_centers_id_fk" FOREIGN KEY ("trust_center_id") REFERENCES "public"."trust_centers"("id") ON DELETE cascade ON UPDATE no action;