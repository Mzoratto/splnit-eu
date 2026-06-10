-- Cleanup before adding constraints: remove orphaned control statuses and
-- normalise any out-of-range state values so the constraints can validate.
DELETE FROM "org_control_statuses" WHERE "clerk_org_id" NOT IN (SELECT "clerk_org_id" FROM "organisations");--> statement-breakpoint
UPDATE "org_control_statuses" SET "status" = 'unknown' WHERE "status" NOT IN ('unknown', 'pass', 'fail', 'warning', 'error', 'manual_review', 'not_applicable', 'out_of_scope');--> statement-breakpoint
UPDATE "evidence" SET "assessment_result" = 'unknown' WHERE "assessment_result" NOT IN ('pass', 'gap', 'warning', 'manual_review', 'not_applicable', 'unknown');--> statement-breakpoint
UPDATE "evidence" SET "collection_status" = 'collected' WHERE "collection_status" NOT IN ('collected', 'blocked', 'pending', 'failed');--> statement-breakpoint
ALTER TABLE "org_control_statuses" ADD CONSTRAINT "org_control_statuses_clerk_org_id_organisations_clerk_org_id_fk" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."organisations"("clerk_org_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_assessment_result_check" CHECK ("evidence"."assessment_result" IN ('pass', 'gap', 'warning', 'manual_review', 'not_applicable', 'unknown'));--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_collection_status_check" CHECK ("evidence"."collection_status" IN ('collected', 'blocked', 'pending', 'failed'));--> statement-breakpoint
ALTER TABLE "org_control_statuses" ADD CONSTRAINT "org_control_statuses_status_check" CHECK ("org_control_statuses"."status" IN ('unknown', 'pass', 'fail', 'warning', 'error', 'manual_review', 'not_applicable', 'out_of_scope'));
