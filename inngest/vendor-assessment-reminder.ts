import { processVendorAssessmentReminders } from "@/lib/vendors/questionnaire-send";
import { inngest } from "./client";

export const vendorAssessmentReminder = inngest.createFunction(
  {
    id: "vendor-assessment-reminder",
    name: "Vendor assessment reminder",
    triggers: { cron: "0 8 * * *" },
  },
  async () => {
    return processVendorAssessmentReminders();
  },
);
