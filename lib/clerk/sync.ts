import { deleteBlobUrls } from "@/lib/blob/cleanup";
import { getDb } from "@/lib/db";
import {
  evidence,
  organisations,
  orgControlStatuses,
  policies,
  profiles,
  trustCenterRequests,
} from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function upsertOrganisationFromClerk(input: {
  clerkOrgId: string;
  name: string;
  plan?: string | null;
}) {
  const db = getDb();

  await db
    .insert(organisations)
    .values({
      clerkOrgId: input.clerkOrgId,
      name: input.name,
      plan: input.plan ?? "free",
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: organisations.clerkOrgId,
      set: {
        name: input.name,
        ...(input.plan ? { plan: input.plan } : {}),
        updatedAt: new Date(),
      },
    });
}

export async function deleteOrganisationFromClerk(clerkOrgId: string) {
  const db = getDb();
  const [evidenceBlobRows, policyBlobRows] = await Promise.all([
    db
      .select({ blobUrl: evidence.blobUrl })
      .from(evidence)
      .where(eq(evidence.clerkOrgId, clerkOrgId)),
    db
      .select({ blobUrl: policies.blobUrl })
      .from(policies)
      .where(eq(policies.clerkOrgId, clerkOrgId)),
  ]);

  await deleteBlobUrls([
    ...evidenceBlobRows.map((row) => row.blobUrl),
    ...policyBlobRows.map((row) => row.blobUrl),
  ]);

  await Promise.all([
    db
      .delete(orgControlStatuses)
      .where(eq(orgControlStatuses.clerkOrgId, clerkOrgId)),
    db
      .delete(trustCenterRequests)
      .where(eq(trustCenterRequests.clerkOrgId, clerkOrgId)),
  ]);

  await db
    .delete(organisations)
    .where(eq(organisations.clerkOrgId, clerkOrgId));
}

export async function upsertProfileFromClerk(input: {
  clerkUserId: string;
  clerkOrgId: string;
  fullName?: string | null;
  email?: string | null;
  role?: string | null;
}) {
  const db = getDb();

  await db
    .insert(profiles)
    .values({
      clerkUserId: input.clerkUserId,
      clerkOrgId: input.clerkOrgId,
      fullName: input.fullName,
      email: input.email,
      role: input.role ?? "member",
    })
    .onConflictDoUpdate({
      target: [profiles.clerkUserId, profiles.clerkOrgId],
      set: {
        clerkOrgId: input.clerkOrgId,
        fullName: input.fullName,
        email: input.email,
        ...(input.role ? { role: input.role } : {}),
      },
    });
}

export async function deleteProfileFromClerk(clerkUserId: string) {
  const db = getDb();

  await db.delete(profiles).where(eq(profiles.clerkUserId, clerkUserId));
}

// Scoped deletion: removes profile for ONE org only.
// Do NOT call this from user.deleted — use
// deleteProfileFromClerk(userId) for full user removal.
export async function deleteProfileFromOrg(userId: string, orgId: string) {
  const db = getDb();

  await db
    .delete(profiles)
    .where(
      and(eq(profiles.clerkUserId, userId), eq(profiles.clerkOrgId, orgId)),
    );
}
