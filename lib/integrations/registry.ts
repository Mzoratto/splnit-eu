import type { IntegrationAdapter, IntegrationProvider } from "./types";
import { awsAdapterPlaceholder } from "./aws/tests";
import { githubAdapterPlaceholder } from "./github/tests";
import { microsoft365Adapter } from "./microsoft365/tests";

const adapters: Partial<Record<IntegrationProvider, IntegrationAdapter>> = {
  aws: awsAdapterPlaceholder,
  github: githubAdapterPlaceholder,
  microsoft365: microsoft365Adapter,
};

export function getAdapter(provider: string) {
  return adapters[provider as IntegrationProvider] ?? null;
}
