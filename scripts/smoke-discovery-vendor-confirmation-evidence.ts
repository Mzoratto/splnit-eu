import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import { loadEnvConfig } from "@next/env";
import { and, eq } from "drizzle-orm";

import { CONTROL_LIBRARY } from "@/lib/controls/library";
import { confirmDiscoveredVendor } from "@/lib/discovery/confirm";
import { getDb } from "@/lib/db";
import { assertLocalDatabaseUrl } from "@/lib/db/url-policy";
import {
  controls,
  discoveredVendors,
  discoveryRuns,
  evidence,
  frameworkControls,
  frameworks,
  integrations,
  organisations,
  orgControlStatuses,
  orgFrameworks,
  vendorAssessments,
  vendors,
} from "@/lib/db/schema";
import { ISO27001_ANNEX_A_MAPPINGS } from "@/lib/frameworks/iso27001-annex-a";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";

loadEnvConfig(process.cwd());

assertLocalDatabaseUrl(
  process.env.DATABASE_URL,
  "discovery vendor confirmation evidence smoke",
);

const clerkOrgId = `org_smoke_vendor_confirmation_${randomUUID()}`;
const vendorControlKey = "ctrl_vendor_security_assessment";
const activeFrameworkSlugs = ["nis2", "gdpr", "iso27001"] as const;
const excludedFrameworkSlugs = ["csrd", "ai-act"] as const;

type FrameworkSlug = (typeof activeFrameworkSlugs)[number] | (typeof excludedFrameworkSlugs)[number];

async function seedFrameworksControlsAndMappings() {
  const db = getDb();
  const frameworkIds = new Map<string, string>();
  const vendorControl = CONTROL_LIBRARY.find((control) => control.key === vendorControlKey);
  assert(vendorControl, "vendor security control definition must exist in the control library.");

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
  const vendorControlId = controlRow.id;

  const nonIsoMappings = vendorControl.frameworkMappings.filter(
    (mapping) => mapping.frameworkSlug !== "iso27001",
  );
  assert.deepEqual(
    nonIsoMappings.map((mapping) => mapping.frameworkSlug).sort(),
    ["gdpr", "nis2"],
    "vendor security assessment must map to NIS2 and GDPR through framework_controls.",
  );

  for (const [index, mapping] of nonIsoMappings.entries()) {
    const frameworkId = frameworkIds.get(mapping.frameworkSlug);
    assert(frameworkId, `framework id must exist for ${mapping.frameworkSlug}`);

    await db
      .insert(frameworkControls)
      .values({
        articleRef: mapping.articleRef,
        controlId: vendorControlId,
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
    (mapping) => mapping.controlKey === vendorControlKey,
  );
  assert.equal(
    isoVendorMapping?.articleRef,
    "A.5.19",
    "vendor security assessment must be represented through the ISO Annex A supplier mapping.",
  );
  assert(isoVendorMapping, "vendor security assessment ISO Annex A mapping must exist.");

  await db
    .insert(frameworkControls)
    .values({
      articleRef: isoVendorMapping.articleRef,
      controlId: vendorControlId,
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
      `${slug} must not receive vendor-security credit through framework mappings.`,
    );
  }

  return { frameworkIds, vendorControlId };
}

async function seedSmokeOrg(frameworkIds: Map<string, string>) {
  const db = getDb();

  await db.insert(organisations).values({
    clerkOrgId,
    country: "CZ",
    locale: "cs-CZ",
    name: "Vendor confirmation evidence smoke org",
    primaryJurisdiction: "CZ",
  });

  for (const slug of [...activeFrameworkSlugs, ...excludedFrameworkSlugs]) {
    const frameworkId = frameworkIds.get(slug);
    assert(frameworkId, `framework id must exist for ${slug}`);
    await db.insert(orgFrameworks).values({
      clerkOrgId,
      frameworkId,
      score: 0,
      status: "active",
    });
  }
}

async function seedVendorDraft() {
  const db = getDb();
  const [integration] = await db
    .insert(integrations)
    .values({
      clerkOrgId,
      config: { smoke: true },
      provider: "microsoft365",
      status: "connected",
    })
    .returning({ id: integrations.id });
  assert(integration, "smoke integration must be created.");

  const [run] = await db
    .insert(discoveryRuns)
    .values({
      clerkOrgId,
      finishedAt: new Date(),
      integrationId: integration.id,
      provider: "microsoft365",
      status: "complete",
      vendorsProposed: 1,
    })
    .returning({ id: discoveryRuns.id });
  assert(run, "smoke discovery run must be created.");

  const externalKey = `smoke-vendor-${randomUUID()}`;
  const [draft] = await db
    .insert(discoveredVendors)
    .values({
      clerkOrgId,
      discoveryRunId: run.id,
      externalKey,
      metadata: { smoke: true },
      name: "Smoke clean supplier",
      provider: "microsoft365",
      rationale: "Seeded clean supplier draft for confirmation evidence smoke.",
      reviewStatus: "proposed",
      suggestedCriticality: "high",
      supplyType: "cloud_service",
    })
    .returning({ id: discoveredVendors.id });
  assert(draft, "smoke discovered vendor draft must be created.");

  return draft.id;
}

async function readVendorEvidence(controlId: string) {
  const db = getDb();
  return db
    .select({
      assessmentResult: evidence.assessmentResult,
      collectionStatus: evidence.collectionStatus,
      description: evidence.description,
      id: evidence.id,
      snapshotData: evidence.snapshotData,
      source: evidence.source,
      type: evidence.type,
    })
    .from(evidence)
    .where(
      and(
        eq(evidence.clerkOrgId, clerkOrgId),
        eq(evidence.controlId, controlId),
        eq(evidence.type, "auto_discovery_vendor_confirmation"),
      ),
    );
}

async function readControlStatus(controlId: string) {
  const db = getDb();
  const [row] = await db
    .select({ lastEvidenceAt: orgControlStatuses.lastEvidenceAt, status: orgControlStatuses.status })
    .from(orgControlStatuses)
    .where(
      and(
        eq(orgControlStatuses.clerkOrgId, clerkOrgId),
        eq(orgControlStatuses.controlId, controlId),
      ),
    )
    .limit(1);

  return row ?? null;
}

async function readScores(frameworkIds: Map<string, string>, slugs: readonly FrameworkSlug[]) {
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

async function cleanup() {
  const db = getDb();
  await db.delete(orgControlStatuses).where(eq(orgControlStatuses.clerkOrgId, clerkOrgId));
  await db.delete(orgFrameworks).where(eq(orgFrameworks.clerkOrgId, clerkOrgId));
  await db.delete(evidence).where(eq(evidence.clerkOrgId, clerkOrgId));
  await db.delete(vendors).where(eq(vendors.clerkOrgId, clerkOrgId));
  await db.delete(discoveredVendors).where(eq(discoveredVendors.clerkOrgId, clerkOrgId));
  await db.delete(discoveryRuns).where(eq(discoveryRuns.clerkOrgId, clerkOrgId));
  await db.delete(integrations).where(eq(integrations.clerkOrgId, clerkOrgId));
  await db.delete(organisations).where(eq(organisations.clerkOrgId, clerkOrgId));
}

async function main() {
  try {
    const { frameworkIds, vendorControlId } = await seedFrameworksControlsAndMappings();
    await seedSmokeOrg(frameworkIds);
    const draftId = await seedVendorDraft();

    const cleanEvidence = await readVendorEvidence(vendorControlId);
    assert.equal(cleanEvidence.length, 0, "smoke vendor must start with no vendor-security evidence.");

    const beforeScores = await readScores(frameworkIds, [
      ...activeFrameworkSlugs,
      ...excludedFrameworkSlugs,
    ]);

    const firstConfirmation = await confirmDiscoveredVendor({
      clerkOrgId,
      discoveredVendorId: draftId,
    });
    assert(firstConfirmation.vendorId, "confirming a discovered vendor must return a vendor id.");

    const [vendorRow] = await getDb()
      .select({ id: vendors.id, status: vendors.status })
      .from(vendors)
      .where(and(eq(vendors.clerkOrgId, clerkOrgId), eq(vendors.id, firstConfirmation.vendorId)))
      .limit(1);
    assert.equal(vendorRow?.id, firstConfirmation.vendorId, "confirming a discovered vendor must create or link a vendor register row.");
    assert.equal(
      vendorRow.status,
      "needs_contact_email",
      "high/critical vendor confirmation without a contact email must surface the contact-email gap before assessment.",
    );
    const firstAssessmentRows = await getDb()
      .select({ id: vendorAssessments.id })
      .from(vendorAssessments)
      .where(
        and(
          eq(vendorAssessments.clerkOrgId, clerkOrgId),
          eq(vendorAssessments.vendorId, firstConfirmation.vendorId),
        ),
      );
    assert.equal(
      firstAssessmentRows.length,
      0,
      "vendor confirmation without contact email must not fabricate or send an assessment request.",
    );

    const evidenceRows = await readVendorEvidence(vendorControlId);
    assert.equal(evidenceRows.length, 1, "vendor confirmation must create one evidence row.");
    const [vendorEvidence] = evidenceRows;
    assert.equal(
      vendorEvidence.assessmentResult,
      "manual_review",
      "vendor confirmation must be manual_review, not pass.",
    );
    assert.equal(vendorEvidence.collectionStatus, "collected");
    assert.equal(vendorEvidence.source, "connector", "discovery confirmation evidence must be connector-sourced.");
    assert.match(
      vendorEvidence.description ?? "",
      /čeká na bezpečnostní hodnocení/i,
      "evidence description must say the supplier is listed and assessment is pending.",
    );
    assert.doesNotMatch(
      vendorEvidence.description ?? "",
      /bezpečnostně hodnocen(ý|i)|assessed/i,
      "confirmation evidence must not claim the supplier was assessed.",
    );
    assert.equal((vendorEvidence.snapshotData as Record<string, unknown> | null)?.vendorId, firstConfirmation.vendorId);
    assert.equal((vendorEvidence.snapshotData as Record<string, unknown> | null)?.provider, "microsoft365");

    const status = await readControlStatus(vendorControlId);
    assert.equal(status?.status, "manual_review", "vendor confirmation must update control status.");
    assert(status?.lastEvidenceAt, "vendor confirmation must update lastEvidenceAt.");

    const afterScores = await readScores(frameworkIds, [
      ...activeFrameworkSlugs,
      ...excludedFrameworkSlugs,
    ]);
    for (const slug of activeFrameworkSlugs) {
      assert.ok(
        (afterScores.get(slug) ?? 0) > (beforeScores.get(slug) ?? 0),
        `${slug} score must move after vendor confirmation manual_review evidence. before=${beforeScores.get(slug)} after=${afterScores.get(slug)}`,
      );
    }
    for (const slug of excludedFrameworkSlugs) {
      assert.equal(
        afterScores.get(slug),
        beforeScores.get(slug),
        `${slug} score must not move from vendor-security confirmation evidence.`,
      );
    }

    const secondConfirmation = await confirmDiscoveredVendor({
      clerkOrgId,
      discoveredVendorId: draftId,
    });
    assert.equal(secondConfirmation.vendorId, firstConfirmation.vendorId);
    const afterSecondEvidenceRows = await readVendorEvidence(vendorControlId);
    assert.equal(
      afterSecondEvidenceRows.length,
      1,
      "re-confirming the same discovered vendor must not duplicate evidence.",
    );

    await getDb()
      .delete(evidence)
      .where(
        and(
          eq(evidence.clerkOrgId, clerkOrgId),
          eq(evidence.controlId, vendorControlId),
          eq(evidence.type, "auto_discovery_vendor_confirmation"),
        ),
      );
    await getDb()
      .delete(orgControlStatuses)
      .where(
        and(
          eq(orgControlStatuses.clerkOrgId, clerkOrgId),
          eq(orgControlStatuses.controlId, vendorControlId),
        ),
      );
    await getDb().update(orgFrameworks).set({ score: 0 }).where(eq(orgFrameworks.clerkOrgId, clerkOrgId));

    const backfillConfirmation = await confirmDiscoveredVendor({
      clerkOrgId,
      discoveredVendorId: draftId,
    });
    assert.equal(backfillConfirmation.vendorId, firstConfirmation.vendorId);
    const afterBackfillEvidenceRows = await readVendorEvidence(vendorControlId);
    assert.equal(
      afterBackfillEvidenceRows.length,
      1,
      "re-confirming an already-linked discovered vendor must backfill missing evidence once.",
    );
    assert.equal(
      (afterBackfillEvidenceRows[0]?.snapshotData as Record<string, unknown> | null)?.vendorId,
      firstConfirmation.vendorId,
      "backfilled evidence must still be scoped to the linked vendor id.",
    );
    assert.equal(
      afterBackfillEvidenceRows[0]?.assessmentResult,
      "manual_review",
      "backfilled evidence must stay manual_review, not pass.",
    );
    assert.equal(
      afterBackfillEvidenceRows[0]?.collectionStatus,
      "collected",
      "backfilled evidence must be collected so status/scoring can propagate.",
    );
    assert.equal(
      afterBackfillEvidenceRows[0]?.source,
      "connector",
      "backfilled discovery evidence must remain connector-sourced.",
    );
    const backfillStatus = await readControlStatus(vendorControlId);
    assert.equal(backfillStatus?.status, "manual_review", "backfilled vendor confirmation evidence must restore manual_review status.");
    const backfillScores = await readScores(frameworkIds, [
      ...activeFrameworkSlugs,
      ...excludedFrameworkSlugs,
    ]);
    for (const slug of activeFrameworkSlugs) {
      assert.ok(
        (backfillScores.get(slug) ?? 0) > 0,
        `${slug} score must move when missing evidence is backfilled for an already-linked vendor.`,
      );
    }
    for (const slug of excludedFrameworkSlugs) {
      assert.equal(
        backfillScores.get(slug),
        0,
        `${slug} score must stay at zero when already-linked vendor evidence is backfilled.`,
      );
    }

    console.log(JSON.stringify({
      ok: true,
      evidenceAssessmentResult: vendorEvidence.assessmentResult,
      controlStatus: status?.status,
      scoresBefore: Object.fromEntries(beforeScores),
      scoresAfter: Object.fromEntries(afterScores),
      evidenceRowsAfterSecondConfirm: afterSecondEvidenceRows.length,
      evidenceRowsAfterBackfillConfirm: afterBackfillEvidenceRows.length,
      backfillScoresAfter: Object.fromEntries(backfillScores),
      isoAnnexAPathMoved: (afterScores.get("iso27001") ?? 0) > (beforeScores.get("iso27001") ?? 0),
    }, null, 2));
  } finally {
    await cleanup();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
