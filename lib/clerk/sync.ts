import { getDb } from "@/lib/db";
import { organisations, profiles } from "@/lib/db/schema";
import { deleteOrganisationForOffboarding } from "@/lib/offboarding/org-deletion";
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
  const result = await deleteOrganisationForOffboarding(clerkOrgId);

  if (result.failures.length > 0) {
    console.warn("Clerk organisation deletion completed with offboarding cleanup failures", {
      clerkOrgId,
      failures: result.failures,
      retained: result.retained,
    });
  }

  if (!result.deletedRootOrganisation) {
    throw new Error(`Failed to delete organisation ${clerkOrgId}.`);
  }

  return result;
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
