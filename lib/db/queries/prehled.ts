import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  prehledEntries,
  prehledVersions,
  type PrehledEntry,
  type PrehledVersion,
} from "@/lib/db/schema";

export async function getPrehledEntries(clerkOrgId: string): Promise<PrehledEntry[]> {
  const db = getDb();

  return db
    .select()
    .from(prehledEntries)
    .where(eq(prehledEntries.clerkOrgId, clerkOrgId));
}

export async function upsertPrehledEntry(input: {
  clerkOrgId: string;
  baselineId: string;
  status: string;
  implementationNote: string | null;
  plannedDate: string | null;
  priority: string | null;
  responsiblePerson: string | null;
  justification: string | null;
}): Promise<void> {
  const db = getDb();
  const values = {
    baselineId: input.baselineId,
    clerkOrgId: input.clerkOrgId,
    implementationNote: input.implementationNote,
    justification: input.justification,
    plannedDate: input.plannedDate,
    priority: input.priority,
    responsiblePerson: input.responsiblePerson,
    status: input.status,
    updatedAt: new Date(),
  };

  await db
    .insert(prehledEntries)
    .values(values)
    .onConflictDoUpdate({
      set: values,
      target: [prehledEntries.clerkOrgId, prehledEntries.baselineId],
    });
}

export async function listPrehledVersions(
  clerkOrgId: string,
): Promise<PrehledVersion[]> {
  const db = getDb();

  return db
    .select()
    .from(prehledVersions)
    .where(eq(prehledVersions.clerkOrgId, clerkOrgId))
    .orderBy(desc(prehledVersions.versionNumber));
}

export async function getNextPrehledVersionNumber(
  clerkOrgId: string,
): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({
      max: sql<number>`coalesce(max(${prehledVersions.versionNumber}), 0)`,
    })
    .from(prehledVersions)
    .where(eq(prehledVersions.clerkOrgId, clerkOrgId));

  return (row?.max ?? 0) + 1;
}

/** Insert-only by design — generated versions are immutable (§ 3 odst. 2). */
export async function insertPrehledVersion(input: {
  clerkOrgId: string;
  versionNumber: number;
  createdBy: string | null;
  blobUrl: string;
  snapshot: unknown;
}): Promise<PrehledVersion> {
  const db = getDb();
  const [version] = await db
    .insert(prehledVersions)
    .values({
      blobUrl: input.blobUrl,
      clerkOrgId: input.clerkOrgId,
      createdBy: input.createdBy,
      snapshot: input.snapshot,
      versionNumber: input.versionNumber,
    })
    .returning();

  return version;
}

export async function getPrehledVersionForOrg(input: {
  clerkOrgId: string;
  versionId: string;
}): Promise<PrehledVersion | null> {
  const db = getDb();
  const [version] = await db
    .select()
    .from(prehledVersions)
    .where(
      and(
        eq(prehledVersions.clerkOrgId, input.clerkOrgId),
        eq(prehledVersions.id, input.versionId),
      ),
    )
    .limit(1);

  return version ?? null;
}
