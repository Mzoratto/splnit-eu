import { sendAccessReviewReminders } from "@/lib/access-reviews/reminders";
import { inngest } from "./client";

export const accessReviewReminders = inngest.createFunction(
  {
    id: "access-review-reminders",
    name: "Access review reminders",
    triggers: { cron: "0 8 1 */3 *" },
  },
  async () => {
    return sendAccessReviewReminders();
  },
);
