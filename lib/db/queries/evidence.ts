import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  controls,
  evidence,
  frameworkControls,
  frameworks,
  organisations,
  orgControlStatuses,
  profiles,
} from "@/lib/db/schema";

export type EvidenceMetadataExportRow = {
  collectedAt: Date | null;
  collectedBy: string | null;
  controlId: string;
  controlKey: string;
  controlTitle: string;
  description: string | null;
  downloadPath: string | null;
  evidenceId: string;
  expiresAt: string | null;
  frameworks: { frameworkName: string; frameworkSlug: string }[];
  hasFile: boolean;
  source: string | null;
  status: string | null;
  type: string;
};

export type EvidenceArchiveFile = {
  blobUrl: string;
  collectedAt: Date | null;
  controlKey: string;
  controlTitle: string;
  description: string | null;
  evidenceId: string;
  source: string | null;
  type: string;
};

export async function listEvidenceForControl(clerkOrgId: string, controlId: string) {
  const db = getDb();

  return db
    .select()
    .from(evidence)
    .where(and(eq(evidence.clerkOrgId, clerkOrgId), eq(evidence.controlId, controlId)))
    .orderBy(desc(evidence.collectedAt));
}

export async function createManualEvidence(input: {
  blobUrl: string;
  clerkOrgId: string;
  collectedBy: string;
  controlKey: string;
  description: string | null;
  expiresAt: string | null;
  fileType: string;
  source: string | null;
}) {
  const db = getDb();
  const controlRows = await db
    .select({ id: controls.id })
    .from(controls)
    .where(eq(controls.key, input.controlKey))
    .limit(1);
  const control = controlRows[0] ?? null;

  if (!control) {
    throw new Error(`Unknown control: ${input.controlKey}`);
  }

  const insertedRows = await db
    .insert(evidence)
    .values({
      blobUrl: input.blobUrl,
      clerkOrgId: input.clerkOrgId,
      collectedBy: input.collectedBy,
      controlId: control.id,
      description: input.description,
      expiresAt: input.expiresAt,
      source: input.source,
      type: input.fileType,
    })
    .returning({ id: evidence.id });
  const evidenceId = insertedRows[0]?.id;

  if (!evidenceId) {
    throw new Error("Failed to create evidence record.");
  }

  await db
    .insert(orgControlStatuses)
    .values({
      clerkOrgId: input.clerkOrgId,
      controlId: control.id,
      lastEvidenceAt: new Date(),
      status: "unknown",
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [orgControlStatuses.clerkOrgId, orgControlStatuses.controlId],
      set: {
        lastEvidenceAt: new Date(),
        updatedAt: new Date(),
      },
    });

  return {
    controlId: control.id,
    evidenceId,
  };
}

export async function getEvidenceForOrg(input: {
  clerkOrgId: string;
  evidenceId: string;
}) {
  const db = getDb();
  const rows = await db
    .select()
    .from(evidence)
    .where(
      and(
        eq(evidence.clerkOrgId, input.clerkOrgId),
        eq(evidence.id, input.evidenceId),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function listEvidenceVault(clerkOrgId: string) {
  const db = getDb();
  const evidenceRows = await db
    .select({
      blobUrl: evidence.blobUrl,
      collectedAt: evidence.collectedAt,
      collectedBy: evidence.collectedBy,
      controlId: evidence.controlId,
      controlKey: controls.key,
      controlTitle: controls.titleCs,
      description: evidence.description,
      evidenceId: evidence.id,
      expiresAt: evidence.expiresAt,
      source: evidence.source,
      status: orgControlStatuses.status,
      type: evidence.type,
    })
    .from(evidence)
    .innerJoin(controls, eq(evidence.controlId, controls.id))
    .leftJoin(
      orgControlStatuses,
      and(
        eq(orgControlStatuses.clerkOrgId, evidence.clerkOrgId),
        eq(orgControlStatuses.controlId, evidence.controlId),
      ),
    )
    .where(eq(evidence.clerkOrgId, clerkOrgId))
    .orderBy(desc(evidence.collectedAt))
    .limit(200);
  const controlIds = Array.from(
    new Set(evidenceRows.map((row) => row.controlId)),
  );
  const mappingRows =
    controlIds.length > 0
      ? await db
          .select({
            controlId: frameworkControls.controlId,
            frameworkName: frameworks.nameCs,
            frameworkSlug: frameworks.slug,
          })
          .from(frameworkControls)
          .innerJoin(frameworks, eq(frameworkControls.frameworkId, frameworks.id))
          .where(inArray(frameworkControls.controlId, controlIds))
      : [];
  const frameworksByControl = new Map<
    string,
    { frameworkName: string; frameworkSlug: string }[]
  >();

  for (const row of mappingRows) {
    const existing = frameworksByControl.get(row.controlId) ?? [];
    existing.push({
      frameworkName: row.frameworkName,
      frameworkSlug: row.frameworkSlug,
    });
    frameworksByControl.set(row.controlId, existing);
  }

  return evidenceRows.map((row) => ({
    ...row,
    frameworks: frameworksByControl.get(row.controlId) ?? [],
  }));
}

export async function listEvidenceMetadataForExport(
  clerkOrgId: string,
): Promise<EvidenceMetadataExportRow[]> {
  const db = getDb();
  const evidenceRows = await db
    .select({
      blobUrl: evidence.blobUrl,
      collectedAt: evidence.collectedAt,
      collectedBy: evidence.collectedBy,
      controlId: evidence.controlId,
      controlKey: controls.key,
      controlTitle: controls.titleCs,
      description: evidence.description,
      evidenceId: evidence.id,
      expiresAt: evidence.expiresAt,
      source: evidence.source,
      status: orgControlStatuses.status,
      type: evidence.type,
    })
    .from(evidence)
    .innerJoin(controls, eq(evidence.controlId, controls.id))
    .leftJoin(
      orgControlStatuses,
      and(
        eq(orgControlStatuses.clerkOrgId, evidence.clerkOrgId),
        eq(orgControlStatuses.controlId, evidence.controlId),
      ),
    )
    .where(eq(evidence.clerkOrgId, clerkOrgId))
    .orderBy(desc(evidence.collectedAt));
  const controlIds = Array.from(
    new Set(evidenceRows.map((row) => row.controlId)),
  );
  const mappingRows =
    controlIds.length > 0
      ? await db
          .select({
            controlId: frameworkControls.controlId,
            frameworkName: frameworks.nameCs,
            frameworkSlug: frameworks.slug,
          })
          .from(frameworkControls)
          .innerJoin(frameworks, eq(frameworkControls.frameworkId, frameworks.id))
          .where(inArray(frameworkControls.controlId, controlIds))
      : [];
  const frameworksByControl = new Map<
    string,
    { frameworkName: string; frameworkSlug: string }[]
  >();

  for (const row of mappingRows) {
    const existing = frameworksByControl.get(row.controlId) ?? [];
    existing.push({
      frameworkName: row.frameworkName,
      frameworkSlug: row.frameworkSlug,
    });
    frameworksByControl.set(row.controlId, existing);
  }

  return evidenceRows.map((row) => ({
    collectedAt: row.collectedAt,
    collectedBy: row.collectedBy,
    controlId: row.controlId,
    controlKey: row.controlKey,
    controlTitle: row.controlTitle,
    description: row.description,
    downloadPath: row.blobUrl ? `/api/evidence/${row.evidenceId}/download` : null,
    evidenceId: row.evidenceId,
    expiresAt: row.expiresAt,
    frameworks: frameworksByControl.get(row.controlId) ?? [],
    hasFile: Boolean(row.blobUrl),
    source: row.source,
    status: row.status,
    type: row.type,
  }));
}

export async function listEvidenceArchiveFiles(
  clerkOrgId: string,
): Promise<EvidenceArchiveFile[]> {
  const db = getDb();
  const rows = await db
    .select({
      blobUrl: evidence.blobUrl,
      collectedAt: evidence.collectedAt,
      controlKey: controls.key,
      controlTitle: controls.titleCs,
      description: evidence.description,
      evidenceId: evidence.id,
      source: evidence.source,
      type: evidence.type,
    })
    .from(evidence)
    .innerJoin(controls, eq(evidence.controlId, controls.id))
    .where(eq(evidence.clerkOrgId, clerkOrgId))
    .orderBy(desc(evidence.collectedAt));

  return rows.flatMap((row) =>
    row.blobUrl
      ? [
          {
            blobUrl: row.blobUrl,
            collectedAt: row.collectedAt,
            controlKey: row.controlKey,
            controlTitle: row.controlTitle,
            description: row.description,
            evidenceId: row.evidenceId,
            source: row.source,
            type: row.type,
          },
        ]
      : [],
  );
}

export async function listExpiringEvidenceAlerts(targetDates: string[]) {
  if (targetDates.length === 0) {
    return [];
  }

  const db = getDb();
  const rows = await db
    .select({
      clerkOrgId: evidence.clerkOrgId,
      controlTitle: controls.titleCs,
      email: profiles.email,
      evidenceId: evidence.id,
      expiresAt: evidence.expiresAt,
      organisationName: organisations.name,
      role: profiles.role,
    })
    .from(evidence)
    .innerJoin(controls, eq(evidence.controlId, controls.id))
    .innerJoin(
      organisations,
      eq(evidence.clerkOrgId, organisations.clerkOrgId),
    )
    .leftJoin(profiles, eq(profiles.clerkOrgId, evidence.clerkOrgId))
    .where(inArray(evidence.expiresAt, targetDates));
  const grouped = new Map<
    string,
    {
      controlTitle: string;
      emails: { email: string; role: string }[];
      evidenceId: string;
      expiresAt: string;
      organisationName: string;
    }
  >();

  for (const row of rows) {
    if (!row.expiresAt) {
      continue;
    }

    const existing =
      grouped.get(row.evidenceId) ??
      {
        controlTitle: row.controlTitle,
        emails: [],
        evidenceId: row.evidenceId,
        expiresAt: row.expiresAt,
        organisationName: row.organisationName,
      };

    if (row.email) {
      existing.emails.push({
        email: row.email,
        role: row.role ?? "",
      });
    }

    grouped.set(row.evidenceId, existing);
  }

  return Array.from(grouped.values()).map((item) => {
    const ownerEmails = item.emails.filter(
      (email) =>
        email.role.includes("admin") ||
        email.role.includes("owner") ||
        email.role.includes("org:admin"),
    );
    const recipients = ownerEmails.length > 0 ? ownerEmails : item.emails;

    return {
      controlTitle: item.controlTitle,
      evidenceId: item.evidenceId,
      expiresAt: item.expiresAt,
      organisationName: item.organisationName,
      recipients: Array.from(new Set(recipients.map((recipient) => recipient.email))),
    };
  });
}
