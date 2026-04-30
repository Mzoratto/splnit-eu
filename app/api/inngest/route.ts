import { serve } from "inngest/next";
import { evidenceExpiryAlerts } from "@/inngest/evidence-expiry-alerts";
import { inngest } from "@/inngest/client";
import { policyReviewReminders } from "@/inngest/policy-review-reminders";
import { regulationUpdates } from "@/inngest/regulation-updates";
import { runIntegrationTests } from "@/inngest/run-integration-tests";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    evidenceExpiryAlerts,
    policyReviewReminders,
    regulationUpdates,
    runIntegrationTests,
  ],
});
