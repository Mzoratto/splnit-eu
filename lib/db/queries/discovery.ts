import { and, desc, eq, inArray, sql, type SQL } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  discoveredAssets,
  discoveredVendors,
  integrations,
} from "@/lib/db/schema";
import { discoveryCapableProviders } from "@/lib/discovery/registry";

export async function listProposedDiscoveryItemsForOrg(clerkOrgId: string) {
  const db = getDb();
  const [assetRows, vendorRows] = await Promise.all([
    db
      .select()
      .from(discoveredAssets)
      .where(
        and(
          eq(discoveredAssets.clerkOrgId, clerkOrgId),
          eq(discoveredAssets.reviewStatus, "proposed"),
        ),
      )
      .orderBy(desc(discoveredAssets.lastSeenAt)),
    db
      .select()
      .from(discoveredVendors)
      .where(
        and(
          eq(discoveredVendors.clerkOrgId, clerkOrgId),
          eq(discoveredVendors.reviewStatus, "proposed"),
        ),
      )
      .orderBy(desc(discoveredVendors.lastSeenAt)),
  ]);

  return {
    assets: assetRows,
    vendors: vendorRows,
  };
}

export async function getProposedDiscoveryCountsForOrg(
  clerkOrgId: string,
  provider?: string,
) {
  const db = getDb();
  const assetConditions: SQL[] = [
    eq(discoveredAssets.clerkOrgId, clerkOrgId),
    eq(discoveredAssets.reviewStatus, "proposed"),
  ];
  const vendorConditions: SQL[] = [
    eq(discoveredVendors.clerkOrgId, clerkOrgId),
    eq(discoveredVendors.reviewStatus, "proposed"),
  ];

  if (provider) {
    assetConditions.push(eq(discoveredAssets.provider, provider));
    vendorConditions.push(eq(discoveredVendors.provider, provider));
  }

  const [assetRows, vendorRows] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(discoveredAssets)
      .where(and(...assetConditions)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(discoveredVendors)
      .where(and(...vendorConditions)),
  ]);

  return {
    assets: Number(assetRows[0]?.count ?? 0),
    vendors: Number(vendorRows[0]?.count ?? 0),
  };
}

export async function listOrgsWithDiscoveryCapableIntegrations() {
  const db = getDb();
  const rows = await db
    .selectDistinct({ clerkOrgId: integrations.clerkOrgId })
    .from(integrations)
    .where(
      and(
        eq(integrations.status, "connected"),
        inArray(integrations.provider, [...discoveryCapableProviders]),
      ),
    );

  return rows.map((row) => row.clerkOrgId);
}
