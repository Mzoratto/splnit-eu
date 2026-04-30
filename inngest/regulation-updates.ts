import { syncNukibFeed } from "@/lib/integrations/nukib/sync";
import { inngest } from "./client";

export const regulationUpdates = inngest.createFunction(
  {
    id: "regulation-updates",
    name: "Regulation updates",
    triggers: { cron: "0 6 * * 1" },
  },
  async ({ step }) => {
    const nukib = await step.run("sync nukib feed", () => syncNukibFeed());

    return {
      nukib,
    };
  },
);
