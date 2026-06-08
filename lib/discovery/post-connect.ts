import { createAuditLog } from "@/lib/db/queries/audit-logs";
import {
  isDiscoveryEnabledForOrg,
  isDiscoveryProviderEnabled,
} from "@/lib/discovery/flags";
import { discoverForOrg } from "@/lib/discovery/runner";
import { isDiscoveryCapableProvider } from "@/lib/discovery/registry";
import type { IntegrationProvider } from "@/lib/integrations/types";

export async function runPostConnectDiscovery(input: {
  clerkOrgId: string;
  integrationId: string;
  provider: IntegrationProvider;
  userId?: string | null;
}) {
  if (!isDiscoveryCapableProvider(input.provider)) {
    return { attempted: false as const };
  }

  if (
    !isDiscoveryEnabledForOrg(input.clerkOrgId)
    || !isDiscoveryProviderEnabled(input.provider)
  ) {
    return { attempted: false as const };
  }

  try {
    const summaries = await discoverForOrg(input.clerkOrgId, {
      provider: input.provider,
    });
    const totals = summaries.reduce(
      (acc, summary) => ({
        assets: acc.assets + summary.assetsProposed,
        newAssets: acc.newAssets + summary.newAssets,
        newVendors: acc.newVendors + summary.newVendors,
        vendors: acc.vendors + summary.vendorsProposed,
      }),
      { assets: 0, newAssets: 0, newVendors: 0, vendors: 0 },
    );

    await createAuditLog({
      action: "integration.discovery_run_completed",
      clerkOrgId: input.clerkOrgId,
      clerkUserId: input.userId ?? undefined,
      entityId: input.integrationId,
      entityType: "integration",
      metadata: {
        provider: input.provider,
        totals,
        trigger: "post_connect",
      },
    });

    return { attempted: true as const, summaries };
  } catch {
    await createAuditLog({
      action: "integration.discovery_run_failed",
      clerkOrgId: input.clerkOrgId,
      clerkUserId: input.userId ?? undefined,
      entityId: input.integrationId,
      entityType: "integration",
      metadata: {
        provider: input.provider,
        trigger: "post_connect",
      },
    });

    return { attempted: true as const, summaries: [] };
  }
}
