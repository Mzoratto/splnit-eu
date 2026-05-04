import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { recalculateFrameworkScore } from "@/lib/controls/scorer";
import { getDb } from "@/lib/db";
import {
  controls,
  frameworkControls,
  frameworks,
  orgControlStatuses,
  orgFrameworks,
  policies,
} from "@/lib/db/schema";
import type { FrameworkAnswers } from "@/lib/frameworks/questions";
import { getQuestionsForFramework } from "@/lib/frameworks/questions";
import type { FrameworkSlug } from "@/lib/controls/library";

const ANSWER_STATUS = {
  na: "not_applicable",
  no: "fail",
  partial: "manual_review",
  yes: "pass",
} as const;

const STATUS_RANK: Record<string, number> = {
  fail: 0,
  manual_review: 1,
  warning: 1,
  pass: 2,
  not_applicable: 3,
  unknown: 4,
};

function mergeStatus(current: string | undefined, next: string) {
  if (!current) {
    return next;
  }

  return STATUS_RANK[next] < STATUS_RANK[current] ? next : current;
}

export async function getFrameworkBySlug(slug: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(frameworks)
    .where(eq(frameworks.slug, slug))
    .limit(1);

  return rows[0] ?? null;
}

export async function getFrameworkDetail(input: {
  clerkOrgId: string;
  frameworkSlug: string;
}) {
  const db = getDb();
  const framework = await getFrameworkBySlug(input.frameworkSlug);

  if (!framework) {
    return null;
  }

  const orgFrameworkRows = await db
    .select()
    .from(orgFrameworks)
    .where(
      and(
        eq(orgFrameworks.clerkOrgId, input.clerkOrgId),
        eq(orgFrameworks.frameworkId, framework.id),
      ),
    )
    .limit(1);
  const controlRows = await db
    .select({
      articleRef: frameworkControls.articleRef,
      category: controls.category,
      controlId: controls.id,
      description: sql<string | null>`coalesce(${frameworkControls.localizedDescription}, ${controls.descriptionCs})`,
      isAutomated: controls.isAutomated,
      key: controls.key,
      requirementLevel: frameworkControls.requirementLevel,
      status: orgControlStatuses.status,
      title: sql<string>`coalesce(${frameworkControls.localizedTitle}, ${controls.titleCs})`,
      updatedAt: orgControlStatuses.updatedAt,
    })
    .from(frameworkControls)
    .innerJoin(controls, eq(frameworkControls.controlId, controls.id))
    .leftJoin(
      orgControlStatuses,
      and(
        eq(orgControlStatuses.controlId, controls.id),
        eq(orgControlStatuses.clerkOrgId, input.clerkOrgId),
      ),
    )
    .where(eq(frameworkControls.frameworkId, framework.id))
    .orderBy(frameworkControls.sortOrder);
  const latestGapReportRows = await db
    .select({
      blobUrl: policies.blobUrl,
      createdAt: policies.createdAt,
      id: policies.id,
      title: policies.titleCs,
    })
    .from(policies)
    .where(
      and(
        eq(policies.clerkOrgId, input.clerkOrgId),
        eq(policies.type, `gap_report:${input.frameworkSlug}`),
      ),
    )
    .orderBy(desc(policies.createdAt))
    .limit(1);

  return {
    controls: controlRows,
    framework,
    gapReport: latestGapReportRows[0] ?? null,
    orgFramework: orgFrameworkRows[0] ?? null,
  };
}

export async function assessFramework(input: {
  answers: FrameworkAnswers;
  clerkOrgId: string;
  frameworkSlug: FrameworkSlug;
}) {
  const db = getDb();
  const framework = await getFrameworkBySlug(input.frameworkSlug);

  if (!framework) {
    throw new Error(`Unknown framework: ${input.frameworkSlug}`);
  }

  const questions = getQuestionsForFramework(input.frameworkSlug);
  const mappings = await db
    .select({
      controlId: frameworkControls.controlId,
      key: controls.key,
    })
    .from(frameworkControls)
    .innerJoin(controls, eq(frameworkControls.controlId, controls.id))
    .where(eq(frameworkControls.frameworkId, framework.id));

  if (mappings.length === 0) {
    return {
      failingControls: 0,
      score: 0,
      totalControls: 0,
    };
  }

  const mappedControlIds = new Map(
    mappings.map((mapping) => [mapping.key, mapping.controlId]),
  );
  const statusByControlId = new Map<string, string>();
  const notesByControlId = new Map<string, string[]>();

  for (const mapping of mappings) {
    statusByControlId.set(mapping.controlId, "unknown");
  }

  for (const question of questions) {
    const answer = input.answers[question.id];

    if (!answer) {
      continue;
    }

    const status = ANSWER_STATUS[answer];

    for (const controlKey of question.controlKeys) {
      const controlId = mappedControlIds.get(controlKey);

      if (!controlId) {
        continue;
      }

      statusByControlId.set(
        controlId,
        mergeStatus(statusByControlId.get(controlId), status),
      );

      const notes = notesByControlId.get(controlId) ?? [];
      notes.push(`${question.text}: ${answer}`);
      notesByControlId.set(controlId, notes);
    }
  }

  await db
    .insert(orgFrameworks)
    .values({
      clerkOrgId: input.clerkOrgId,
      frameworkId: framework.id,
      score: 0,
      status: "active",
    })
    .onConflictDoNothing();

  const statusRows = Array.from(statusByControlId.entries()).map(
    ([controlId, status]) => ({
      clerkOrgId: input.clerkOrgId,
      controlId,
      notes: notesByControlId.get(controlId)?.join("\n") ?? null,
      status,
      updatedAt: new Date(),
    }),
  );

  if (statusRows.length > 0) {
    await db
      .insert(orgControlStatuses)
      .values(statusRows)
      .onConflictDoUpdate({
        target: [orgControlStatuses.clerkOrgId, orgControlStatuses.controlId],
        set: {
          notes: sql`excluded.notes`,
          status: sql`excluded.status`,
          updatedAt: new Date(),
        },
      });
  }

  const score = await recalculateFrameworkScore(input.clerkOrgId, framework.id);
  const failingControls = await db
    .select({ id: orgControlStatuses.id })
    .from(orgControlStatuses)
    .where(
      and(
        eq(orgControlStatuses.clerkOrgId, input.clerkOrgId),
        inArray(
          orgControlStatuses.controlId,
          mappings.map((mapping) => mapping.controlId),
        ),
        inArray(orgControlStatuses.status, ["fail", "unknown", "manual_review"]),
      ),
    );

  return {
    failingControls: failingControls.length,
    score,
    totalControls: mappings.length,
  };
}

export async function saveGapReportRecord(input: {
  blobUrl: string;
  clerkOrgId: string;
  frameworkSlug: string;
  metadata: Record<string, unknown>;
  title: string;
}) {
  const db = getDb();

  await db.insert(policies).values({
    blobUrl: input.blobUrl,
    clerkOrgId: input.clerkOrgId,
    content: input.metadata,
    status: "active",
    titleCs: input.title,
    type: `gap_report:${input.frameworkSlug}`,
  });
}
