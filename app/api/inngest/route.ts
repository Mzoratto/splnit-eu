import { serve } from "inngest/next";
import { accessReviewReminders } from "@/inngest/access-review-reminders";
import { evidenceExpiryAlerts } from "@/inngest/evidence-expiry-alerts";
import { inngest } from "@/inngest/client";
import { policyReviewReminders } from "@/inngest/policy-review-reminders";
import { regulationUpdates } from "@/inngest/regulation-updates";
import { runIntegrationTests } from "@/inngest/run-integration-tests";
import { workspaceEvidenceLifecycle } from "@/inngest/workspace-evidence-lifecycle";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    accessReviewReminders,
    evidenceExpiryAlerts,
    policyReviewReminders,
    regulationUpdates,
    runIntegrationTests,
    workspaceEvidenceLifecycle,
  ],
});
