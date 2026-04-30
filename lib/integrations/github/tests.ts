import type { IntegrationAdapter } from "../types";

export const githubAdapterPlaceholder: IntegrationAdapter = {
  provider: "github",
  async runTest(checkLogic) {
    return {
      status: "not_applicable",
      data: {},
      failureReason: `GitHub adapter not implemented yet: ${checkLogic}`,
    };
  },
};
