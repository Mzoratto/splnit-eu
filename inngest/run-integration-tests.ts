import { runTestsForOrg } from "@/lib/integrations/runner";
import { inngest } from "./client";

export const runIntegrationTests = inngest.createFunction(
  {
    id: "run-integration-tests",
    name: "Run integration tests",
    triggers: { event: "integrations/tests.run" },
  },
  async ({ event, step }) => {
    const clerkOrgId = String(event.data.clerkOrgId ?? "");

    if (!clerkOrgId) {
      throw new Error("clerkOrgId is required.");
    }

    await step.run("run tests for org", () => runTestsForOrg(clerkOrgId));

    return { clerkOrgId };
  },
);
