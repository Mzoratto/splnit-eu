import type { IntegrationAdapter } from "../types";

export const awsAdapterPlaceholder: IntegrationAdapter = {
  provider: "aws",
  async runTest(checkLogic) {
    return {
      status: "not_applicable",
      data: {},
      failureReason: `AWS adapter not implemented yet: ${checkLogic}`,
    };
  },
};
