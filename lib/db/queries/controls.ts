import { and, eq, inArray, sql } from "drizzle-orm";
import { recalculateFrameworkScore } from "@/lib/controls/scorer";
import { getDb } from "@/lib/db";
import {
  controls,
  evidence,
  frameworkControls,
  frameworks,
  orgControlStatuses,
  tests,
} from "@/lib/db/schema";

export async function listOrgControlStatusesForFramework(
  clerkOrgId: string,
  frameworkId: string,
) {
  const db = getDb();
  const mappings = await db
    .select({ controlId: frameworkControls.controlId })
    .from(frameworkControls)
    .where(eq(frameworkControls.frameworkId, frameworkId));

  if (mappings.length === 0) {
    return [];
  }

  return db
    .select()
    .from(orgControlStatuses)
    .where(
      and(
        eq(orgControlStatuses.clerkOrgId, clerkOrgId),
        inArray(
          orgControlStatuses.controlId,
          mappings.map((mapping) => mapping.controlId),
        ),
      ),
    );
}

export async function getControlDetailByKey(input: {
  clerkOrgId: string;
  controlKey: string;
}) {
  const db = getDb();
  const controlRows = await db
    .select()
    .from(controls)
    .where(eq(controls.key, input.controlKey))
    .limit(1);
  const control = controlRows[0] ?? null;

  if (!control) {
    return null;
  }

  const statusRows = await db
    .select()
    .from(orgControlStatuses)
    .where(
      and(
        eq(orgControlStatuses.clerkOrgId, input.clerkOrgId),
        eq(orgControlStatuses.controlId, control.id),
      ),
    )
    .limit(1);
  const frameworkRows = await db
    .select({
      articleRef: frameworkControls.articleRef,
      evidenceRequirements: frameworkControls.evidenceRequirements,
      frameworkId: frameworks.id,
      frameworkName: frameworks.nameCs,
      frameworkSlug: frameworks.slug,
      localizedDescription: frameworkControls.localizedDescription,
      localizedTitle: frameworkControls.localizedTitle,
      regulatorGuidance: frameworkControls.regulatorGuidance,
      requirementLevel: frameworkControls.requirementLevel,
    })
    .from(frameworkControls)
    .innerJoin(frameworks, eq(frameworkControls.frameworkId, frameworks.id))
    .where(eq(frameworkControls.controlId, control.id));
  const testRows = await db
    .select()
    .from(tests)
    .where(eq(tests.controlId, control.id));
  const evidenceRows = await db
    .select()
    .from(evidence)
    .where(
      and(
        eq(evidence.clerkOrgId, input.clerkOrgId),
        eq(evidence.controlId, control.id),
      ),
    )
    .orderBy(sql`${evidence.collectedAt} desc`);

  return {
    control,
    evidence: evidenceRows,
    frameworks: frameworkRows,
    status: statusRows[0] ?? null,
    tests: testRows,
  };
}

export async function updateControlStatus(input: {
  clerkOrgId: string;
  controlKey: string;
  notes: string | null;
  status: string;
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

  await db
    .insert(orgControlStatuses)
    .values({
      clerkOrgId: input.clerkOrgId,
      controlId: control.id,
      notes: input.notes,
      status: input.status,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [orgControlStatuses.clerkOrgId, orgControlStatuses.controlId],
      set: {
        notes: sql`excluded.notes`,
        status: sql`excluded.status`,
        updatedAt: new Date(),
      },
    });

  const frameworkRows = await db
    .select({ frameworkId: frameworkControls.frameworkId })
    .from(frameworkControls)
    .where(eq(frameworkControls.controlId, control.id));

  await Promise.all(
    frameworkRows.map((row) =>
      recalculateFrameworkScore(input.clerkOrgId, row.frameworkId),
    ),
  );

  return {
    controlId: control.id,
    recalculatedFrameworks: frameworkRows.length,
  };
}
