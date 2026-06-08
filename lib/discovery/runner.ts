import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  discoveredAssets,
  discoveredVendors,
  discoveryRuns,
  integrations,
} from "@/lib/db/schema";
import { acquireIntegrationRunLock } from "@/lib/integrations/locks";
import { getDiscoveryAdapter } from "./registry";
import type { DiscoveredAsset, DiscoveredVendor } from "./types";

export type DiscoverOrgOptions = {
  provider?: string;
};

export type DiscoverOrgSummary = {
  assetsProposed: number;
  integrationId: string;
  lockEnabled: boolean;
  newAssets: number;
  newVendors: number;
  provider: string;
  skipped: boolean;
  vendorsProposed: number;
  warnings: string[];
};

export async function discoverForOrg(
  clerkOrgId: string,
  options: DiscoverOrgOptions = {},
): Promise<DiscoverOrgSummary[]> {
  const db = getDb();
  const connected = await db
    .select()
    .from(integrations)
    .where(
      and(
        eq(integrations.clerkOrgId, clerkOrgId),
        eq(integrations.status, "connected"),
      ),
    );
  const summaries: DiscoverOrgSummary[] = [];

  for (const integration of connected) {
    if (options.provider && integration.provider !== options.provider) {
      continue;
    }

    const adapter = getDiscoveryAdapter(integration.provider);
    if (!adapter) {
      summaries.push({
        assetsProposed: 0,
        integrationId: integration.id,
        lockEnabled: false,
        newAssets: 0,
        newVendors: 0,
        provider: integration.provider,
        skipped: true,
        vendorsProposed: 0,
        warnings: [],
      });
      continue;
    }

    const lock = await acquireIntegrationRunLock({
      clerkOrgId,
      provider: `discovery:${integration.provider}`,
    });

    if (!lock.acquired) {
      summaries.push({
        assetsProposed: 0,
        integrationId: integration.id,
        lockEnabled: lock.enabled,
        newAssets: 0,
        newVendors: 0,
        provider: integration.provider,
        skipped: true,
        vendorsProposed: 0,
        warnings: ["Discovery skipped because another scan is already running."],
      });
      continue;
    }

    const runRows = await db
      .insert(discoveryRuns)
      .values({
        clerkOrgId,
        integrationId: integration.id,
        provider: integration.provider,
        status: "running",
      })
      .returning({ id: discoveryRuns.id });
    const runId = runRows[0]?.id;

    if (!runId) {
      await lock.release();
      throw new Error("Failed to create discovery run.");
    }

    try {
      const result = await adapter.discover(integration);
      const newAssets = await upsertAssets(clerkOrgId, runId, result.assets);
      const newVendors = await upsertVendors(clerkOrgId, runId, result.vendors);

      await db
        .update(discoveryRuns)
        .set({
          assetsProposed: result.assets.length,
          finishedAt: new Date(),
          status: "complete",
          vendorsProposed: result.vendors.length,
          warnings: result.warnings,
        })
        .where(eq(discoveryRuns.id, runId));

      summaries.push({
        assetsProposed: result.assets.length,
        integrationId: integration.id,
        lockEnabled: lock.enabled,
        newAssets,
        newVendors,
        provider: integration.provider,
        skipped: false,
        vendorsProposed: result.vendors.length,
        warnings: result.warnings,
      });
    } catch (error) {
      await db
        .update(discoveryRuns)
        .set({
          finishedAt: new Date(),
          status: "error",
          warnings: ["Discovery failed for this provider."],
        })
        .where(eq(discoveryRuns.id, runId));

      summaries.push({
        assetsProposed: 0,
        integrationId: integration.id,
        lockEnabled: lock.enabled,
        newAssets: 0,
        newVendors: 0,
        provider: integration.provider,
        skipped: false,
        vendorsProposed: 0,
        warnings: [
          error instanceof Error && error.message.includes("credentials are missing")
            ? error.message
            : "Discovery failed for this provider.",
        ],
      });
    } finally {
      await lock.release();
    }
  }

  return summaries;
}

async function upsertAssets(
  clerkOrgId: string,
  runId: string,
  assets: DiscoveredAsset[],
) {
  if (assets.length === 0) {
    return 0;
  }

  const db = getDb();
  const keys = assets.map((asset) => asset.externalKey);
  const existing = await db
    .select({ externalKey: discoveredAssets.externalKey })
    .from(discoveredAssets)
    .where(
      and(
        eq(discoveredAssets.clerkOrgId, clerkOrgId),
        inArray(discoveredAssets.externalKey, keys),
      ),
    );
  const existingKeys = new Set(existing.map((item) => item.externalKey));
  const now = new Date();
  let newCount = 0;

  for (const asset of assets) {
    if (existingKeys.has(asset.externalKey)) {
      await db
        .update(discoveredAssets)
        .set({
          category: asset.category,
          discoveryRunId: runId,
          lastSeenAt: now,
          metadata: asset.metadata,
          name: asset.name,
          provider: asset.provider,
          rationale: asset.rationale,
          suggestedCia: asset.suggestedCia,
          suggestedOwner: asset.suggestedOwner,
          tier: asset.tier,
        })
        .where(
          and(
            eq(discoveredAssets.clerkOrgId, clerkOrgId),
            eq(discoveredAssets.externalKey, asset.externalKey),
          ),
        );
      continue;
    }

    newCount += 1;
    await db.insert(discoveredAssets).values({
      category: asset.category,
      clerkOrgId,
      discoveryRunId: runId,
      externalKey: asset.externalKey,
      metadata: asset.metadata,
      name: asset.name,
      provider: asset.provider,
      rationale: asset.rationale,
      reviewStatus: "proposed",
      suggestedCia: asset.suggestedCia,
      suggestedOwner: asset.suggestedOwner,
      tier: asset.tier,
    });
  }

  return newCount;
}

async function upsertVendors(
  clerkOrgId: string,
  runId: string,
  vendors: DiscoveredVendor[],
) {
  if (vendors.length === 0) {
    return 0;
  }

  const db = getDb();
  const keys = vendors.map((vendor) => vendor.externalKey);
  const existing = await db
    .select({ externalKey: discoveredVendors.externalKey })
    .from(discoveredVendors)
    .where(
      and(
        eq(discoveredVendors.clerkOrgId, clerkOrgId),
        inArray(discoveredVendors.externalKey, keys),
      ),
    );
  const existingKeys = new Set(existing.map((item) => item.externalKey));
  const now = new Date();
  let newCount = 0;

  for (const vendor of vendors) {
    if (existingKeys.has(vendor.externalKey)) {
      await db
        .update(discoveredVendors)
        .set({
          discoveryRunId: runId,
          ico: vendor.ico ?? null,
          lastSeenAt: now,
          metadata: vendor.metadata,
          name: vendor.name,
          provider: vendor.provider,
          rationale: vendor.rationale,
          suggestedCriticality: vendor.suggestedCriticality,
          supplyType: vendor.supplyType,
        })
        .where(
          and(
            eq(discoveredVendors.clerkOrgId, clerkOrgId),
            eq(discoveredVendors.externalKey, vendor.externalKey),
          ),
        );
      continue;
    }

    newCount += 1;
    await db.insert(discoveredVendors).values({
      clerkOrgId,
      discoveryRunId: runId,
      externalKey: vendor.externalKey,
      ico: vendor.ico ?? null,
      metadata: vendor.metadata,
      name: vendor.name,
      provider: vendor.provider,
      rationale: vendor.rationale,
      reviewStatus: "proposed",
      suggestedCriticality: vendor.suggestedCriticality,
      supplyType: vendor.supplyType,
    });
  }

  return newCount;
}
