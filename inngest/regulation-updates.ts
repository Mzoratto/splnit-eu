import { sendWeeklyRegulationDigest } from "@/lib/regulations/digest";
import { syncRegulationUpdateSources } from "@/lib/regulations/sync";
import { inngest } from "./client";

export const regulationUpdates = inngest.createFunction(
  {
    id: "regulation-updates",
    name: "Regulation updates",
    triggers: { event: "scheduler/regulation-updates.requested" },
  },
  async ({ step }) => {
    const sync = await step.run("sync regulation sources", () =>
      syncRegulationUpdateSources(),
    );
    const digest = await step.run("send loops digest", () =>
      sendWeeklyRegulationDigest(),
    );

    return {
      digest,
      sync,
    };
  },
);
