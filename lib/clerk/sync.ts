import { getDb } from "@/lib/db";
import { organisations, profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
      target: profiles.clerkUserId,
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
