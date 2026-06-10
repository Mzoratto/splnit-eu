import { processWorkspaceEvidenceLifecycle } from "@/lib/workspaces/lifecycle";
import { inngest } from "./client";

export const workspaceEvidenceLifecycle = inngest.createFunction(
  {
    id: "workspace-evidence-lifecycle",
    name: "Workspace evidence lifecycle",
    triggers: { cron: "0 7 * * *" },
  },
  async () => {
    return processWorkspaceEvidenceLifecycle();
  },
);
