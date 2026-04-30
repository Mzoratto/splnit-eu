import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { integrations } from "@/lib/db/schema";

export async function listConnectedIntegrations(clerkOrgId: string) {
  const db = getDb();

  return db
    .select()
    .from(integrations)
    .where(
      and(
        eq(integrations.clerkOrgId, clerkOrgId),
        eq(integrations.status, "connected"),
      ),
    );
}
