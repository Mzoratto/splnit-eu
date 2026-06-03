import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import { loadEnvConfig } from "@next/env";
import { and, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { assertLocalDatabaseUrl } from "@/lib/db/url-policy";
import {
  evidence,
  frameworks,
  organisations,
  orgControlStatuses,
  orgFrameworks,
} from "@/lib/db/schema";
import { createManualAttestationEvidence } from "@/lib/db/queries/evidence";
import { seedHeliosControls } from "./seed-helios-controls";

loadEnvConfig(process.cwd());

assertLocalDatabaseUrl(
  process.env.DATABASE_URL,
  "manual evidence status propagation smoke",
);

const clerkOrgId = `org_smoke_manual_status_${randomUUID()}`;
const controlKey = "helios-iam-user-accounts";

async function readControlStatus(controlId: string) {
  const db = getDb();
  const [row] = await db
    .select({
      lastEvidenceAt: orgControlStatuses.lastEvidenceAt,
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

  return row ?? null;
}

async function readEvidenceAssessmentResult(evidenceId: string) {
  const db = getDb();
  const [row] = await db
    .select({ assessmentResult: evidence.assessmentResult })
    .from(evidence)
    .where(
      and(
        eq(evidence.clerkOrgId, clerkOrgId),
        eq(evidence.id, evidenceId),
      ),
    )
    .limit(1);

  return row?.assessmentResult ?? null;
}

async function readFrameworkScore(frameworkId: string) {
  const db = getDb();
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

  return row?.score ?? null;
}

async function cleanup() {
  const db = getDb();
  await db.delete(evidence).where(eq(evidence.clerkOrgId, clerkOrgId));
  await db.delete(orgControlStatuses).where(eq(orgControlStatuses.clerkOrgId, clerkOrgId));
  await db.delete(orgFrameworks).where(eq(orgFrameworks.clerkOrgId, clerkOrgId));
  await db.delete(organisations).where(eq(organisations.clerkOrgId, clerkOrgId));
}

async function main() {
  const db = getDb();

  try {
    await seedHeliosControls();

    const [nis2] = await db
      .select({ id: frameworks.id })
      .from(frameworks)
      .where(eq(frameworks.slug, "nis2"))
      .limit(1);
    assert(nis2, "NIS2 framework must exist after Helios seed.");

    await db.insert(organisations).values({
      clerkOrgId,
      country: "CZ",
      locale: "cs-CZ",
      name: "Manual evidence status propagation smoke org",
      primaryJurisdiction: "CZ",
    });

    await db.insert(orgFrameworks).values({
      clerkOrgId,
      frameworkId: nis2.id,
      score: 0,
      status: "active",
    });

    for (const disabledValue of ["disabled", "false", "0"]) {
      process.env.SPLNIT_MANUAL_EVIDENCE_STATUS_PROPAGATION = disabledValue;
      const disabledResult = await createManualAttestationEvidence({
        answers: { explicitAssertion: true, propagationDisabled: disabledValue },
        assessmentResult: "pass",
        clerkOrgId,
        collectedBy: "manual-status-smoke",
        controlKey,
        description: `Manual propagation disabled smoke for ${disabledValue}.`,
      });

      const disabledStatus = await readControlStatus(disabledResult.controlId);
      assert.equal(
        disabledStatus?.status,
        "unknown",
        `${disabledValue} opt-out must preserve legacy unknown status behavior.`,
      );
      assert.equal(
        await readFrameworkScore(nis2.id),
        0,
        `${disabledValue} opt-out must not recalculate framework score.`,
      );

      await db.delete(evidence).where(eq(evidence.clerkOrgId, clerkOrgId));
      await db.delete(orgControlStatuses).where(eq(orgControlStatuses.clerkOrgId, clerkOrgId));
    }
    delete process.env.SPLNIT_MANUAL_EVIDENCE_STATUS_PROPAGATION;

    const implicitReviewResult = await createManualAttestationEvidence({
      answers: { explicitAssertion: true, implicitReviewOnly: true },
      clerkOrgId,
      collectedBy: "manual-status-smoke",
      controlKey,
      description: "Manual evidence without explicit assessment must stay in human review.",
    });

    assert.equal(
      await readEvidenceAssessmentResult(implicitReviewResult.evidenceId),
      "manual_review",
      "manual evidence without an explicit assessment must remain manual_review evidence.",
    );
    const implicitReviewStatus = await readControlStatus(implicitReviewResult.controlId);
    assert.equal(
      implicitReviewStatus?.status,
      "manual_review",
      "manual evidence without explicit pass must not auto-pass the control.",
    );

    const passResult = await createManualAttestationEvidence({
      answers: { explicitAssertion: true },
      assessmentResult: "pass",
      clerkOrgId,
      collectedBy: "manual-status-smoke",
      controlKey,
      description: "Authenticated human assertion for manual pass propagation smoke.",
    });

    const passStatus = await readControlStatus(passResult.controlId);
    assert.equal(passStatus?.status, "pass", "manual pass evidence must set control status to pass.");
    assert(passStatus?.lastEvidenceAt, "manual pass evidence must update lastEvidenceAt.");
    const passScore = await readFrameworkScore(nis2.id);
    assert.ok((passScore ?? 0) > 0, `manual pass evidence must recalculate score above zero, got ${passScore}.`);

    const reviewResult = await createManualAttestationEvidence({
      answers: { explicitAssertion: "needs-review" },
      assessmentResult: "manual_review",
      clerkOrgId,
      collectedBy: "manual-status-smoke",
      controlKey,
      description: "Authenticated human assertion for manual review propagation smoke.",
    });

    assert.equal(reviewResult.controlId, passResult.controlId);
    const reviewStatus = await readControlStatus(reviewResult.controlId);
    assert.equal(
      reviewStatus?.status,
      "manual_review",
      "manual_review evidence must set control status to manual_review.",
    );
    const reviewScore = await readFrameworkScore(nis2.id);
    assert.ok(
      (reviewScore ?? -1) >= 0 && (reviewScore ?? 101) < (passScore ?? 0),
      `manual_review evidence must recalculate to lower score than pass (${reviewScore} < ${passScore}).`,
    );

    const gapResult = await createManualAttestationEvidence({
      answers: { explicitGap: true },
      assessmentResult: "gap",
      clerkOrgId,
      collectedBy: "manual-status-smoke",
      controlKey,
      description: "Authenticated human assertion for manual gap propagation smoke.",
    });

    assert.equal(gapResult.controlId, passResult.controlId);
    const gapStatus = await readControlStatus(gapResult.controlId);
    assert.equal(gapStatus?.status, "fail", "manual gap evidence must map to fail control status.");
    const gapScore = await readFrameworkScore(nis2.id);
    assert.equal(gapScore, 0, "manual gap evidence must recalculate framework score to zero for the only assessed control.");

    console.log("Manual evidence status propagation smoke passed.");
  } finally {
    await cleanup();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
