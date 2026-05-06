import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { incidents } from "@/lib/db/schema";
import type { IncidentReportTrack } from "@/lib/incidents/reporting";

export async function listIncidentsForOrg(clerkOrgId: string) {
  const db = getDb();

  return db
    .select()
    .from(incidents)
    .where(eq(incidents.clerkOrgId, clerkOrgId))
    .orderBy(desc(incidents.detectedAt))
    .limit(100);
}

export async function getIncidentForOrg(input: {
  clerkOrgId: string;
  incidentId: string;
}) {
  const db = getDb();
  const rows = await db
    .select()
    .from(incidents)
    .where(
      and(
        eq(incidents.clerkOrgId, input.clerkOrgId),
        eq(incidents.id, input.incidentId),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function createIncident(input: {
  affectsCriticalSystems: boolean;
  affectsPersonalData: boolean;
  clerkOrgId: string;
  description: string | null;
  detectedAt: Date;
  severity: string;
  title: string;
}) {
  const db = getDb();
  const [incident] = await db
    .insert(incidents)
    .values({
      affectsCriticalSystems: input.affectsCriticalSystems,
      affectsPersonalData: input.affectsPersonalData,
      clerkOrgId: input.clerkOrgId,
      description: input.description,
      detectedAt: input.detectedAt,
      severity: input.severity,
      status: "open",
      title: input.title,
    })
    .returning();

  return incident;
}

export async function updateIncidentStatus(input: {
  clerkOrgId: string;
  incidentId: string;
  status: string;
}) {
  const db = getDb();
  const resolvedAt = input.status === "resolved" ? new Date() : null;

  const [updated] = await db
    .update(incidents)
    .set({
      resolvedAt,
      status: input.status,
    })
    .where(
      and(
        eq(incidents.clerkOrgId, input.clerkOrgId),
        eq(incidents.id, input.incidentId),
      ),
    )
    .returning({ id: incidents.id });

  if (!updated) {
    throw new Error("Incident not found.");
  }
}

export async function markIncidentReported(input: {
  clerkOrgId: string;
  incidentId: string;
  track: IncidentReportTrack;
}) {
  const db = getDb();
  const reportedAt = new Date();

  const [updated] = await db
    .update(incidents)
    .set(
      input.track === "cybersecurity"
        ? {
            nukibReportedAt: reportedAt,
            reportedToNukib: true,
          }
        : {
            reportedToUoou: true,
            uoouReportedAt: reportedAt,
          },
    )
    .where(
      and(
        eq(incidents.clerkOrgId, input.clerkOrgId),
        eq(incidents.id, input.incidentId),
      ),
    )
    .returning({ id: incidents.id });

  if (!updated) {
    throw new Error("Incident not found.");
  }
}
