import type { IntegrationAdapter, IntegrationProvider } from "./types";
import { microsoft365Adapter } from "./microsoft365/tests";

const adapters: Partial<Record<IntegrationProvider, IntegrationAdapter>> = {
  microsoft365: microsoft365Adapter,
};

export function getAdapter(provider: string) {
  return adapters[provider as IntegrationProvider] ?? null;
}
