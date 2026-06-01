import { processHeliosWorkspaceEvidenceLifecycle } from "@/lib/workspaces/helios/lifecycle";
import { inngest } from "./client";

export const workspaceEvidenceLifecycle = inngest.createFunction(
  {
    id: "workspace-evidence-lifecycle",
    name: "Workspace evidence lifecycle",
    triggers: { cron: "0 7 * * *" },
  },
  async () => {
    return processHeliosWorkspaceEvidenceLifecycle();
  },
);
