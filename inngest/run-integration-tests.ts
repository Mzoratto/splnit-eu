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
    const provider = event.data.provider ? String(event.data.provider) : undefined;

    if (!clerkOrgId) {
      throw new Error("clerkOrgId is required.");
    }

    const result = await step.run("run tests for org", () =>
      runTestsForOrg(clerkOrgId, { provider }),
    );

    return result;
  },
);
