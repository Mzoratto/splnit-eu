import { sendPolicyReviewReminders } from "@/lib/policies/review-reminders";
import { inngest } from "./client";

export const policyReviewReminders = inngest.createFunction(
  {
    id: "policy-review-reminders",
    name: "Policy review reminders",
    triggers: { event: "scheduler/policy-review-reminders.requested" },
  },
  async () => {
    return sendPolicyReviewReminders();
  },
);
