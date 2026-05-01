import type { IntegrationAdapter, IntegrationProvider } from "./types";
import { awsAdapter } from "./aws/tests";
import { githubAdapter } from "./github/tests";
import { microsoft365Adapter } from "./microsoft365/tests";

export const supportedIntegrationProviders = [
  "microsoft365",
  "github",
  "aws",
] as const satisfies IntegrationProvider[];

export type SupportedIntegrationProvider =
  (typeof supportedIntegrationProviders)[number];

const adapters: Record<SupportedIntegrationProvider, IntegrationAdapter> = {
  aws: awsAdapter,
  github: githubAdapter,
  microsoft365: microsoft365Adapter,
};

export function getAdapter(provider: string) {
  return isSupportedIntegrationProvider(provider) ? adapters[provider] : null;
}

export function isSupportedIntegrationProvider(
  provider: string,
): provider is SupportedIntegrationProvider {
  return supportedIntegrationProviders.includes(
    provider as SupportedIntegrationProvider,
  );
}
