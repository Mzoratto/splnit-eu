import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import { loadEnvConfig } from "@next/env";
import { and, desc, eq, inArray, ne } from "drizzle-orm";

import { CONTROL_LIBRARY } from "@/lib/controls/library";
import { getDb } from "@/lib/db";
import { assertLocalDatabaseUrl } from "@/lib/db/url-policy";
import {
  controls,
  evidence,
  frameworkControls,
  frameworks,
  organisations,
  orgControlStatuses,
  orgFrameworks,
  vendorAssessments,
  vendors,
} from "@/lib/db/schema";
import {
  createVendorQuestionnaire,
  saveVendorAssessment,
  submitVendorAssessmentByToken,
} from "@/lib/db/queries/vendors";
import { ISO27001_ANNEX_A_MAPPINGS } from "@/lib/frameworks/iso27001-annex-a";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";
import { createVendorAssessmentToken } from "@/lib/vendors/access";
import {
  recalculateVendorAssessmentControl,
  recalculateVendorAssessmentControlsForAllOrgs,
  VENDOR_ASSESSMENT_COVERAGE_EVIDENCE_TYPE,
  VENDOR_SECURITY_ASSESSMENT_CONTROL_KEY,
} from "@/lib/vendors/assessment-coverage";
import {
  VENDOR_ASSESSMENT_QUESTIONS,
  type VendorAnswerValue,
  type VendorAssessmentAnswers,
} from "@/lib/vendors/questions";

loadEnvConfig(process.cwd());

assertLocalDatabaseUrl(
  process.env.DATABASE_URL,
  "vendor assessment coverage smoke",
);
process.env.ENCRYPTION_KEY ??= "vendor-assessment-coverage-smoke-secret";

const clerkOrgId = `org_smoke_vendor_coverage_${randomUUID()}`;
const activeFrameworkSlugs = ["nis2", "gdpr", "iso27001"] as const;
const excludedFrameworkSlugs = ["csrd", "ai-act"] as const;

type FrameworkSlug =
  | (typeof activeFrameworkSlugs)[number]
  | (typeof excludedFrameworkSlugs)[number];

function answersWith(value: VendorAnswerValue): VendorAssessmentAnswers {
  return Object.fromEntries(
    VENDOR_ASSESSMENT_QUESTIONS.map((question) => [question.id, value]),
  ) as VendorAssessmentAnswers;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function seedFrameworksControlsAndMappings() {
  const db = getDb();
  const frameworkIds = new Map<string, string>();
  const vendorControl = CONTROL_LIBRARY.find(
    (control) => control.key === VENDOR_SECURITY_ASSESSMENT_CONTROL_KEY,
  );
  assert(vendorControl, "vendor security control must exist in the control library.");

  for (const framework of FRAMEWORK_LIBRARY) {
    const [row] = await db
      .insert(frameworks)
      .values({
        descriptionCs: framework.descriptionCs,
        isActive: true,
        mandatoryDeadline: framework.mandatoryDeadline,
        nameCs: framework.nameCs,
        nameEn: framework.nameEn,
        regulator: framework.regulator,
        slug: framework.slug,
        version: framework.version,
      })
      .onConflictDoUpdate({
        target: frameworks.slug,
        set: {
          descriptionCs: framework.descriptionCs,
          isActive: true,
          mandatoryDeadline: framework.mandatoryDeadline,
          nameCs: framework.nameCs,
          nameEn: framework.nameEn,
          regulator: framework.regulator,
          version: framework.version,
        },
      })
      .returning({ id: frameworks.id, slug: frameworks.slug });
    frameworkIds.set(row.slug, row.id);
  }

  const [controlRow] = await db
    .insert(controls)
    .values({
      category: vendorControl.category,
      descriptionCs: vendorControl.descriptionCs,
      isAutomated: vendorControl.isAutomated,
      key: vendorControl.key,
      requiresEvidence: vendorControl.requiresEvidence,
      testType: vendorControl.testType,
      titleCs: vendorControl.titleCs,
      titleEn: vendorControl.titleEn,
    })
    .onConflictDoUpdate({
      target: controls.key,
      set: {
        category: vendorControl.category,
        descriptionCs: vendorControl.descriptionCs,
        isAutomated: vendorControl.isAutomated,
        requiresEvidence: vendorControl.requiresEvidence,
        testType: vendorControl.testType,
        titleCs: vendorControl.titleCs,
        titleEn: vendorControl.titleEn,
      },
    })
    .returning({ id: controls.id });
  assert(controlRow, "vendor security control row should be seeded.");

  const nonIsoMappings = vendorControl.frameworkMappings.filter(
    (mapping) => mapping.frameworkSlug !== "iso27001",
  );
  assert.deepEqual(
    nonIsoMappings.map((mapping) => mapping.frameworkSlug).sort(),
    ["gdpr", "nis2"],
    "vendor security control should map only to NIS2 and GDPR in the control library.",
  );

  for (const [index, mapping] of nonIsoMappings.entries()) {
    const frameworkId = frameworkIds.get(mapping.frameworkSlug);
    assert(frameworkId, `framework id must exist for ${mapping.frameworkSlug}`);

    await db
      .insert(frameworkControls)
      .values({
        articleRef: mapping.articleRef,
        controlId: controlRow.id,
        evidenceRequirements: mapping.evidenceRequirements,
        frameworkId,
        localizedDescription: mapping.localizedDescription ?? vendorControl.descriptionCs,
        localizedTitle: mapping.localizedTitle ?? vendorControl.titleCs,
        regulatorGuidance: mapping.regulatorGuidance,
        requirementLevel: mapping.level,
        sortOrder: index,
      })
      .onConflictDoUpdate({
        target: [
          frameworkControls.frameworkId,
          frameworkControls.controlId,
          frameworkControls.articleRef,
        ],
        set: {
          evidenceRequirements: mapping.evidenceRequirements,
          localizedDescription: mapping.localizedDescription ?? vendorControl.descriptionCs,
          localizedTitle: mapping.localizedTitle ?? vendorControl.titleCs,
          regulatorGuidance: mapping.regulatorGuidance,
          requirementLevel: mapping.level,
          sortOrder: index,
        },
      });
  }

  const isoFrameworkId = frameworkIds.get("iso27001");
  assert(isoFrameworkId, "ISO 27001 framework id must exist.");
  const isoVendorMapping = ISO27001_ANNEX_A_MAPPINGS.find(
    (mapping) => mapping.controlKey === VENDOR_SECURITY_ASSESSMENT_CONTROL_KEY,
  );
  assert.equal(isoVendorMapping?.articleRef, "A.5.19");
  assert(isoVendorMapping, "ISO Annex A supplier mapping should exist.");

  await db
    .insert(frameworkControls)
    .values({
      articleRef: isoVendorMapping.articleRef,
      controlId: controlRow.id,
      frameworkId: isoFrameworkId,
      localizedTitle: isoVendorMapping.title,
      requirementLevel: "mandatory",
      sortOrder: 0,
    })
    .onConflictDoUpdate({
      target: [
        frameworkControls.frameworkId,
        frameworkControls.controlId,
        frameworkControls.articleRef,
      ],
      set: {
        localizedTitle: isoVendorMapping.title,
        requirementLevel: "mandatory",
        sortOrder: 0,
      },
    });

  for (const slug of excludedFrameworkSlugs) {
    assert.equal(
      vendorControl.frameworkMappings.some((mapping) => mapping.frameworkSlug === slug),
      false,
      `${slug} must not receive vendor-security credit from the control library.`,
    );
  }

  return { frameworkIds, vendorControlId: controlRow.id };
}

async function seedSmokeOrg(input: {
  frameworkIds: Map<string, string>;
  vendorControlId: string;
}) {
  const db = getDb();

  await db.insert(organisations).values({
    clerkOrgId,
    country: "CZ",
    locale: "cs-CZ",
    name: "Vendor coverage smoke org",
    primaryJurisdiction: "CZ",
  });

  for (const slug of [...activeFrameworkSlugs, ...excludedFrameworkSlugs]) {
    const frameworkId = input.frameworkIds.get(slug);
    assert(frameworkId, `framework id must exist for ${slug}`);
    await db.insert(orgFrameworks).values({
      clerkOrgId,
      frameworkId,
      score: 0,
      status: "active",
    });
  }

  const mappedControls = await db
    .select({ controlId: frameworkControls.controlId })
    .from(frameworkControls)
    .where(
      and(
        inArray(
          frameworkControls.frameworkId,
          activeFrameworkSlugs.map((slug) => {
            const frameworkId = input.frameworkIds.get(slug);
            assert(frameworkId, `framework id must exist for ${slug}`);
            return frameworkId;
          }),
        ),
        ne(frameworkControls.controlId, input.vendorControlId),
      ),
    );
  const otherControlIds = [
    ...new Set(mappedControls.map((mapping) => mapping.controlId)),
  ];

  for (const controlId of otherControlIds) {
    await db
      .insert(orgControlStatuses)
      .values({
        clerkOrgId,
        controlId,
        status: "not_applicable",
      })
      .onConflictDoUpdate({
        target: [orgControlStatuses.clerkOrgId, orgControlStatuses.controlId],
        set: {
          status: "not_applicable",
        },
      });
  }
}

async function seedVendor(input: {
  name: string;
  riskTier: string;
  supplyType?: string;
}) {
  const db = getDb();
  const [vendor] = await db
    .insert(vendors)
    .values({
      clerkOrgId,
      name: input.name,
      riskTier: input.riskTier,
      source: "manual",
      status: "pending",
      supplyType: input.supplyType ?? "cloud_service",
    })
    .returning({ id: vendors.id });

  assert(vendor, "vendor should be seeded.");
  return vendor.id;
}

async function readCoverageEvidence(controlId: string) {
  const db = getDb();
  return db
    .select({
      assessmentResult: evidence.assessmentResult,
      description: evidence.description,
      id: evidence.id,
      snapshotData: evidence.snapshotData,
      type: evidence.type,
    })
    .from(evidence)
    .where(
      and(
        eq(evidence.clerkOrgId, clerkOrgId),
        eq(evidence.controlId, controlId),
        eq(evidence.type, VENDOR_ASSESSMENT_COVERAGE_EVIDENCE_TYPE),
      ),
    );
}

async function readControlStatus(controlId: string) {
  const db = getDb();
  const [status] = await db
    .select({
      lastEvidenceAt: orgControlStatuses.lastEvidenceAt,
      notes: orgControlStatuses.notes,
      status: orgControlStatuses.status,
    })
    .from(orgControlStatuses)
    .where(
      and(
        eq(orgControlStatuses.clerkOrgId, clerkOrgId),
        eq(orgControlStatuses.controlId, controlId),
      ),
    )
    .limit(1);

  return status ?? null;
}

async function readScores(
  frameworkIds: Map<string, string>,
  slugs: readonly FrameworkSlug[],
) {
  const db = getDb();
  const scores = new Map<FrameworkSlug, number>();

  for (const slug of slugs) {
    const frameworkId = frameworkIds.get(slug);
    assert(frameworkId, `framework id must exist for ${slug}`);
    const [row] = await db
      .select({ score: orgFrameworks.score })
      .from(orgFrameworks)
      .where(
        and(
          eq(orgFrameworks.clerkOrgId, clerkOrgId),
          eq(orgFrameworks.frameworkId, frameworkId),
        ),
      )
      .limit(1);
    scores.set(slug, row?.score ?? 0);
  }

  return scores;
}

async function readLatestVendorAssessment(vendorId: string) {
  const db = getDb();
  const [row] = await db
    .select({
      score: vendorAssessments.score,
      status: vendorAssessments.status,
    })
    .from(vendorAssessments)
    .where(
      and(
        eq(vendorAssessments.clerkOrgId, clerkOrgId),
        eq(vendorAssessments.vendorId, vendorId),
      ),
    )
    .orderBy(desc(vendorAssessments.assessedAt))
    .limit(1);

  return row ?? null;
}

async function cleanup() {
  const db = getDb();
  await db.delete(orgControlStatuses).where(eq(orgControlStatuses.clerkOrgId, clerkOrgId));
  await db.delete(orgFrameworks).where(eq(orgFrameworks.clerkOrgId, clerkOrgId));
  await db.delete(evidence).where(eq(evidence.clerkOrgId, clerkOrgId));
  await db.delete(vendorAssessments).where(eq(vendorAssessments.clerkOrgId, clerkOrgId));
  await db.delete(vendors).where(eq(vendors.clerkOrgId, clerkOrgId));
  await db.delete(organisations).where(eq(organisations.clerkOrgId, clerkOrgId));
}

async function assertFrameworkScores(input: {
  expectedActiveScore: number;
  frameworkIds: Map<string, string>;
}) {
  const scores = await readScores(input.frameworkIds, [
    ...activeFrameworkSlugs,
    ...excludedFrameworkSlugs,
  ]);

  for (const slug of activeFrameworkSlugs) {
    assert.equal(
      scores.get(slug),
      input.expectedActiveScore,
      `${slug} should score ${input.expectedActiveScore} from vendor coverage status.`,
    );
  }
  for (const slug of excludedFrameworkSlugs) {
    assert.equal(
      scores.get(slug),
      0,
      `${slug} should not move from supplier assessment coverage.`,
    );
  }

  return scores;
}

async function main() {
  try {
    const { frameworkIds, vendorControlId } = await seedFrameworksControlsAndMappings();
    await cleanup();
    await seedSmokeOrg({ frameworkIds, vendorControlId });
    const criticalNullScoreVendorId = await seedVendor({
      name: "Smoke critical all-N/A supplier",
      riskTier: "critical",
    });
    const criticalPoorScoreVendorId = await seedVendor({
      name: "Smoke critical poor-score supplier",
      riskTier: "critical",
    });
    await seedVendor({
      name: "Smoke standard supplier",
      riskTier: "standard",
    });

    const initialCoverage = await recalculateVendorAssessmentControl(clerkOrgId);
    assert.equal(initialCoverage.status, "manual_review");
    assert.equal(initialCoverage.assessableVendorCount, 2);
    assert.equal(initialCoverage.assessedVendorCount, 0);
    assert.equal(
      initialCoverage.summary,
      "Bezpečnostní hodnocení dodavatelů: 0 z 2 kritických/vysokých dodavatelů hodnoceno.",
    );
    assert.equal((await readCoverageEvidence(vendorControlId)).length, 1);
    await assertFrameworkScores({ expectedActiveScore: 50, frameworkIds });

    const allNaAssessment = await saveVendorAssessment({
      answers: answersWith("not_applicable"),
      assessedBy: "smoke",
      clerkOrgId,
      vendorId: criticalNullScoreVendorId,
    });
    assert.equal(allNaAssessment.score, null);
    assert.equal(allNaAssessment.status, "completed");
    const afterFirstStatus = await readControlStatus(vendorControlId);
    assert.equal(
      afterFirstStatus?.status,
      "manual_review",
      "one completed critical supplier must leave coverage incomplete.",
    );
    assert.match(afterFirstStatus?.notes ?? "", /1 z 2/);
    await assertFrameworkScores({ expectedActiveScore: 50, frameworkIds });

    const questionnaire = await createVendorQuestionnaire({
      clerkOrgId,
      vendorEmail: "coverage-smoke@example.test",
      vendorId: criticalPoorScoreVendorId,
    });
    const token = createVendorAssessmentToken({
      assessmentId: questionnaire.id,
      clerkOrgId,
      vendorId: criticalPoorScoreVendorId,
    });
    await submitVendorAssessmentByToken({
      answers: answersWith("no"),
      token,
    });
    const poorScoreAssessment = await readLatestVendorAssessment(
      criticalPoorScoreVendorId,
    );
    assert.equal(poorScoreAssessment?.status, "submitted");
    assert.equal(
      poorScoreAssessment?.score,
      8,
      "poor-scoring supplier should keep risk in the vendor tier but still count as assessed.",
    );

    const afterSecondStatus = await readControlStatus(vendorControlId);
    assert.equal(
      afterSecondStatus?.status,
      "pass",
      "all critical/high suppliers assessed should pass the coverage control.",
    );
    assert.match(afterSecondStatus?.notes ?? "", /2 z 2/);
    const passEvidenceRows = await readCoverageEvidence(vendorControlId);
    assert.equal(
      passEvidenceRows.length,
      1,
      "coverage must maintain one rolling evidence record per org and control.",
    );
    assert.equal(passEvidenceRows[0]?.assessmentResult, "pass");
    const passSnapshot = passEvidenceRows[0]?.snapshotData as Record<
      string,
      unknown
    > | null;
    assert.equal(passSnapshot?.assessableVendorCount, 2);
    assert.equal(passSnapshot?.assessedVendorCount, 2);
    await assertFrameworkScores({ expectedActiveScore: 100, frameworkIds });

    const rerunCoverage = await recalculateVendorAssessmentControl(clerkOrgId);
    assert.equal(rerunCoverage.evidenceId, passEvidenceRows[0]?.id);
    assert.equal((await readCoverageEvidence(vendorControlId)).length, 1);

    await getDb()
      .update(vendors)
      .set({ nextReviewAt: dateOnly(addDays(new Date(), -1)) })
      .where(
        and(
          eq(vendors.clerkOrgId, clerkOrgId),
          eq(vendors.id, criticalNullScoreVendorId),
        ),
      );
    const dailyResult = await recalculateVendorAssessmentControlsForAllOrgs();
    assert.ok(
      dailyResult.updatedControls >= 1,
      "daily vendor coverage pass should pick up at least the smoke org.",
    );
    const staleStatus = await readControlStatus(vendorControlId);
    assert.equal(
      staleStatus?.status,
      "manual_review",
      "stale nextReviewAt should degrade coverage back to manual review.",
    );
    assert.match(staleStatus?.notes ?? "", /1 z 2/);
    const staleEvidenceRows = await readCoverageEvidence(vendorControlId);
    assert.equal(staleEvidenceRows.length, 1);
    assert.equal(staleEvidenceRows[0]?.id, passEvidenceRows[0]?.id);
    assert.equal(staleEvidenceRows[0]?.assessmentResult, "manual_review");
    await assertFrameworkScores({ expectedActiveScore: 50, frameworkIds });

    const latestNullScoreAssessment = await readLatestVendorAssessment(
      criticalNullScoreVendorId,
    );
    assert.equal(
      latestNullScoreAssessment?.score,
      null,
      "coverage recalculation should tolerate completed all-N/A null scores.",
    );

    console.log(
      JSON.stringify(
        {
          ok: true,
          coverageEvidenceRows: staleEvidenceRows.length,
          controlStatusAfterStale: staleStatus?.status,
          initialCoverage,
          passEvidenceId: passEvidenceRows[0]?.id,
          scoresAfterStale: Object.fromEntries(
            await readScores(frameworkIds, activeFrameworkSlugs),
          ),
        },
        null,
        2,
      ),
    );
  } finally {
    await cleanup();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
