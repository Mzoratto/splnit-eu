import { inngest } from "@/inngest/client";
import { listOrgsWithDiscoveryCapableIntegrations } from "@/lib/db/queries/discovery";
import { isDiscoveryEnabledForOrg } from "@/lib/discovery/flags";
import { discoverForOrg } from "@/lib/discovery/runner";

export const discoveryRescan = inngest.createFunction(
  {
    id: "discovery-rescan",
    name: "Discovery weekly rescan",
    triggers: { cron: "0 6 * * 1" },
  },
  async ({ step }) => {
    const orgs = await step.run("load-discovery-orgs", async () => {
      const candidates = await listOrgsWithDiscoveryCapableIntegrations();
      return candidates.filter((orgId) => isDiscoveryEnabledForOrg(orgId));
    });
    let driftAssets = 0;
    let driftVendors = 0;

    for (const orgId of orgs) {
      const summaries = await step.run(`rescan-${orgId}`, () => discoverForOrg(orgId));
      driftAssets += summaries.reduce((sum, item) => sum + item.newAssets, 0);
      driftVendors += summaries.reduce((sum, item) => sum + item.newVendors, 0);
    }

    return {
      driftAssets,
      driftVendors,
      scanned: orgs.length,
    };
  },
);
