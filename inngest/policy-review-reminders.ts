import { sendPolicyReviewReminders } from "@/lib/policies/review-reminders";
import { inngest } from "./client";

export const policyReviewReminders = inngest.createFunction(
  {
    id: "policy-review-reminders",
    name: "Policy review reminders",
    triggers: { cron: "0 8 * * *" },
  },
  async () => {
    return sendPolicyReviewReminders();
  },
);
