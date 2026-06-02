import { inngest } from "./client";
import { sendEvidenceExpiryAlerts } from "@/lib/evidence/expiry-alerts";

export const evidenceExpiryAlerts = inngest.createFunction(
  {
    id: "evidence-expiry-alerts",
    name: "Evidence expiry alerts",
    triggers: { event: "scheduler/evidence-expiry.requested" },
  },
  async () => {
    return sendEvidenceExpiryAlerts();
  },
);
