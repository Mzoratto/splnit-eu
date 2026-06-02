import { sendAccessReviewReminders } from "@/lib/access-reviews/reminders";
import { inngest } from "./client";

export const accessReviewReminders = inngest.createFunction(
  {
    id: "access-review-reminders",
    name: "Access review reminders",
    triggers: { event: "scheduler/access-review-reminders.requested" },
  },
  async () => {
    return sendAccessReviewReminders();
  },
);
