import { and, eq } from "drizzle-orm";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { featureFlags } from "@/lib/db/schema";

export const FLAGS = {
  CLIENT_TRUST_DASHBOARD: "client-trust-dashboard",
  SMART_DOCUMENT_GENERATION: "smart-document-generation",
} as const;

export type Flag = (typeof FLAGS)[keyof typeof FLAGS];

// To enable a flag for an org, insert directly:
// INSERT INTO feature_flags (org_id, flag, enabled)
// VALUES ('org_xxx', 'client-trust-dashboard', true)
// ON CONFLICT (org_id, flag) DO UPDATE SET enabled = true

export async function isFeatureEnabled(
  orgId: string,
  flag: Flag,
): Promise<boolean> {
  if (!hasDatabaseUrl()) {
    return false;
  }

  const db = getDb();
  const rows = await db
    .select({ enabled: featureFlags.enabled })
    .from(featureFlags)
    .where(and(eq(featureFlags.orgId, orgId), eq(featureFlags.flag, flag)))
    .limit(1);

  return rows[0]?.enabled ?? false;
}

export async function requireFeature(orgId: string, flag: Flag): Promise<void> {
  const enabled = await isFeatureEnabled(orgId, flag);

  if (!enabled) {
    throw new Error(`Feature ${flag} is not enabled for this org`);
  }
}
