import { inngest } from "./client";

export const evidenceExpiryAlerts = inngest.createFunction(
  {
    id: "evidence-expiry-alerts",
    name: "Evidence expiry alerts",
    triggers: { cron: "0 8 * * *" },
  },
  async () => {
    return {
      queued: false,
      reason: "Database query and Resend delivery are implemented in the next slice.",
    };
  },
);
