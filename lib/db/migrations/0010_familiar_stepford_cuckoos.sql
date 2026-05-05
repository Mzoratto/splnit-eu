CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_document_id" uuid NOT NULL,
	"framework_id" uuid NOT NULL,
	"jurisdiction" text NOT NULL,
	"locale" text NOT NULL,
	"article_key" text NOT NULL,
	"title" text,
	"official_text" text NOT NULL,
	"citation" text NOT NULL,
	"effective_date" timestamp with time zone,
	"last_reviewed" timestamp with time zone,
	"review_status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "articles_source_document_id_locale_article_key_unique" UNIQUE("source_document_id","locale","article_key")
);
--> statement-breakpoint
CREATE TABLE "evidence_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"control_id" uuid,
	"framework_control_id" uuid,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"evidence_type" text NOT NULL,
	"example_fields" jsonb DEFAULT '{}'::jsonb,
	"locale" text DEFAULT 'en-EU' NOT NULL,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "framework_control_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"framework_control_id" uuid NOT NULL,
	"article_id" uuid NOT NULL,
	"citation_note" text,
	"confidence" text DEFAULT 'reviewed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "framework_control_articles_framework_control_id_article_id_unique" UNIQUE("framework_control_id","article_id")
);
--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_source_document_id_source_documents_id_fk" FOREIGN KEY ("source_document_id") REFERENCES "public"."source_documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_framework_id_frameworks_id_fk" FOREIGN KEY ("framework_id") REFERENCES "public"."frameworks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_templates" ADD CONSTRAINT "evidence_templates_control_id_controls_id_fk" FOREIGN KEY ("control_id") REFERENCES "public"."controls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_templates" ADD CONSTRAINT "evidence_templates_framework_control_id_framework_controls_id_fk" FOREIGN KEY ("framework_control_id") REFERENCES "public"."framework_controls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "framework_control_articles" ADD CONSTRAINT "framework_control_articles_framework_control_id_framework_controls_id_fk" FOREIGN KEY ("framework_control_id") REFERENCES "public"."framework_controls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "framework_control_articles" ADD CONSTRAINT "framework_control_articles_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_articles_framework_jurisdiction" ON "articles" USING btree ("framework_id","jurisdiction","locale");--> statement-breakpoint
CREATE INDEX "idx_articles_review_status" ON "articles" USING btree ("review_status");--> statement-breakpoint
CREATE INDEX "idx_evidence_templates_control" ON "evidence_templates" USING btree ("control_id");--> statement-breakpoint
CREATE INDEX "idx_evidence_templates_framework_control" ON "evidence_templates" USING btree ("framework_control_id");--> statement-breakpoint
CREATE INDEX "idx_evidence_templates_locale" ON "evidence_templates" USING btree ("locale");--> statement-breakpoint
CREATE INDEX "idx_framework_control_articles_article" ON "framework_control_articles" USING btree ("article_id");