import type { DiscoveryAdapter } from "@/lib/discovery/types";
import type { IntegrationProvider } from "@/lib/integrations/types";
import { abraFlexiDiscoveryAdapter } from "./providers/abra-flexi";
import { microsoft365DiscoveryAdapter } from "./providers/microsoft365";

export const discoveryCapableProviders = [
  "microsoft365",
  "abra-flexi",
] as const satisfies IntegrationProvider[];

export type DiscoveryCapableProvider = (typeof discoveryCapableProviders)[number];

const discoveryAdapters: Record<DiscoveryCapableProvider, DiscoveryAdapter> = {
  "abra-flexi": abraFlexiDiscoveryAdapter,
  microsoft365: microsoft365DiscoveryAdapter,
};

export function isDiscoveryCapableProvider(
  provider: string,
): provider is DiscoveryCapableProvider {
  return (discoveryCapableProviders as readonly string[]).includes(provider);
}

export function getDiscoveryAdapter(provider: string): DiscoveryAdapter | null {
  return isDiscoveryCapableProvider(provider) ? discoveryAdapters[provider] : null;
}
