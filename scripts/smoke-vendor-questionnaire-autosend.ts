import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import { loadEnvConfig } from "@next/env";
import { and, desc, eq } from "drizzle-orm";

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
import { createVendorAssessmentToken } from "@/lib/vendors/access";
import {
  processVendorAssessmentReminders,
  sendVendorQuestionnaireForVendor,
  VENDOR_NEEDS_CONTACT_EMAIL_STATUS,
} from "@/lib/vendors/questionnaire-send";
import {
  setVendorQuestionnaireEmailTransportForTesting,
  type VendorQuestionnaireEmailInput,
} from "@/lib/vendors/notifications";
import {
  submitVendorAssessmentByToken,
} from "@/lib/db/queries/vendors";
import {
  VENDOR_ASSESSMENT_QUESTIONS,
  type VendorAssessmentAnswers,
} from "@/lib/vendors/questions";

loadEnvConfig(process.cwd());

assertLocalDatabaseUrl(
  process.env.DATABASE_URL,
  "vendor questionnaire autosend smoke",
);
process.env.ENCRYPTION_KEY ??= "vendor-questionnaire-autosend-smoke-secret";
process.env.NEXT_PUBLIC_APP_URL = "https://app.example.test";
delete process.env.RESEND_API_KEY;

const clerkOrgId = `org_smoke_vendor_autosend_${randomUUID()}`;
const vendorControlKey = "ctrl_vendor_security_assessment";
const activeFrameworkSlugs = ["nis2", "gdpr", "iso27001"] as const;

type CapturedEmail = VendorQuestionnaireEmailInput & {
  assessmentId: string | null;
};

const capturedEmails: CapturedEmail[] = [];

function fullCreditAnswers(): VendorAssessmentAnswers {
  return Object.fromEntries(
    VENDOR_ASSESSMENT_QUESTIONS.map((question) => [
      question.id,
      "reverseScore" in question && question.reverseScore ? "no" : "yes",
    ]),
  ) as VendorAssessmentAnswers;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function assessmentIdFromUrl(url: string) {
  const token = url.split("/vendor-assessment/")[1] ?? "";
  return token.split(".")[0] || null;
}

async function seedFrameworksControlsAndMappings() {
  const db = getDb();
  const frameworkIds = new Map<string, string>();
  const vendorControl = CONTROL_LIBRARY.find(
    (control) => control.key === vendorControlKey,
  );
  assert(vendorControl, "vendor security control must exist.");

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
  assert(controlRow, "control row should be seeded.");

  for (const [index, mapping] of vendorControl.frameworkMappings
    .filter((mapping) => mapping.frameworkSlug !== "iso27001")
    .entries()) {
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
  assert(isoFrameworkId, "ISO framework should exist.");
  const isoVendorMapping = ISO27001_ANNEX_A_MAPPINGS.find(
    (mapping) => mapping.controlKey === vendorControlKey,
  );
  assert(isoVendorMapping, "ISO vendor mapping should exist.");
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

  return { frameworkIds };
}

async function seedOrg(frameworkIds: Map<string, string>) {
  const db = getDb();
  await db.insert(organisations).values({
    clerkOrgId,
    country: "CZ",
    locale: "cs-CZ",
    name: "Autosend Smoke s.r.o.",
    primaryJurisdiction: "CZ",
  });

  for (const slug of activeFrameworkSlugs) {
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

async function seedDiscoveryRun() {
  const db = getDb();
  const [integration] = await db
    .insert(integrations)
    .values({
      clerkOrgId,
      config: { smoke: true },
      provider: "helios",
      status: "connected",
    })
    .returning({ id: integrations.id });
  assert(integration, "integration should be seeded.");

  const [run] = await db
    .insert(discoveryRuns)
    .values({
      clerkOrgId,
      finishedAt: new Date(),
      integrationId: integration.id,
      provider: "helios",
      status: "complete",
      vendorsProposed: 0,
    })
    .returning({ id: discoveryRuns.id });
  assert(run, "discovery run should be seeded.");
  return run.id;
}

async function seedDraft(input: {
  contactEmail?: string | null;
  name: string;
  runId: string;
  suggestedCriticality: "critical" | "high" | "standard";
}) {
  const db = getDb();
  const [draft] = await db
    .insert(discoveredVendors)
    .values({
      clerkOrgId,
      discoveryRunId: input.runId,
      externalKey: `autosend-${randomUUID()}`,
      metadata: input.contactEmail
        ? { contactEmail: input.contactEmail, smoke: true }
        : { smoke: true },
      name: input.name,
      provider: "helios",
      rationale: "Smoke supplier draft.",
      reviewStatus: "proposed",
      suggestedCriticality: input.suggestedCriticality,
      supplyType: "Supplier (from Helios CSV export)",
    })
    .returning({ id: discoveredVendors.id });
  assert(draft, "draft should be seeded.");
  return draft.id;
}

async function seedVendor(input: {
  name: string;
  riskTier: "critical" | "high" | "standard";
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
      supplyType: "cloud_service",
    })
    .returning({ id: vendors.id });
  assert(vendor, "vendor should be seeded.");
  return vendor.id;
}

async function readVendor(vendorId: string) {
  const [vendor] = await getDb()
    .select()
    .from(vendors)
    .where(and(eq(vendors.clerkOrgId, clerkOrgId), eq(vendors.id, vendorId)))
    .limit(1);
  return vendor ?? null;
}

async function readAssessments(vendorId: string) {
  return getDb()
    .select()
    .from(vendorAssessments)
    .where(
      and(
        eq(vendorAssessments.clerkOrgId, clerkOrgId),
        eq(vendorAssessments.vendorId, vendorId),
      ),
    )
    .orderBy(desc(vendorAssessments.assessedAt));
}

async function readScores(frameworkIds: Map<string, string>) {
  const scores = new Map<string, number | null>();
  for (const slug of activeFrameworkSlugs) {
    const frameworkId = frameworkIds.get(slug);
    assert(frameworkId, `framework id must exist for ${slug}`);
    const [row] = await getDb()
      .select({ score: orgFrameworks.score })
      .from(orgFrameworks)
      .where(
        and(
          eq(orgFrameworks.clerkOrgId, clerkOrgId),
          eq(orgFrameworks.frameworkId, frameworkId),
        ),
      )
      .limit(1);
    scores.set(slug, row?.score ?? null);
  }
  return scores;
}

async function cleanup() {
  const db = getDb();
  await db.delete(orgControlStatuses).where(eq(orgControlStatuses.clerkOrgId, clerkOrgId));
  await db.delete(orgFrameworks).where(eq(orgFrameworks.clerkOrgId, clerkOrgId));
  await db.delete(evidence).where(eq(evidence.clerkOrgId, clerkOrgId));
  await db.delete(vendorAssessments).where(eq(vendorAssessments.clerkOrgId, clerkOrgId));
  await db.delete(vendors).where(eq(vendors.clerkOrgId, clerkOrgId));
  await db.delete(discoveredVendors).where(eq(discoveredVendors.clerkOrgId, clerkOrgId));
  await db.delete(discoveryRuns).where(eq(discoveryRuns.clerkOrgId, clerkOrgId));
  await db.delete(integrations).where(eq(integrations.clerkOrgId, clerkOrgId));
  await db.delete(organisations).where(eq(organisations.clerkOrgId, clerkOrgId));
}

function setEmailCapture() {
  capturedEmails.length = 0;
  setVendorQuestionnaireEmailTransportForTesting(
    async (input: VendorQuestionnaireEmailInput) => {
      capturedEmails.push({
        ...input,
        assessmentId: assessmentIdFromUrl(input.assessmentUrl),
      });
      return { emailsSent: 1, failed: null, skipped: null };
    },
  );
}

function clearEmailCapture() {
  setVendorQuestionnaireEmailTransportForTesting(null);
}

async function main() {
  try {
    const { frameworkIds } = await seedFrameworksControlsAndMappings();
    await cleanup();
    await seedOrg(frameworkIds);
    const runId = await seedDiscoveryRun();
    setEmailCapture();

    const criticalWithEmailDraftId = await seedDraft({
      contactEmail: "critical@example.test",
      name: "Critical Supplier With Email",
      runId,
      suggestedCriticality: "critical",
    });
    const criticalWithEmail = await confirmDiscoveredVendor({
      clerkOrgId,
      discoveredVendorId: criticalWithEmailDraftId,
    });
    assert.equal(capturedEmails.length, 1, "critical supplier with email should auto-send once.");
    assert.equal(capturedEmails[0]?.to, "critical@example.test");
    const [autoAssessment] = await readAssessments(criticalWithEmail.vendorId);
    assert.equal(autoAssessment?.status, "sent");

    await confirmDiscoveredVendor({
      clerkOrgId,
      discoveredVendorId: criticalWithEmailDraftId,
    });
    assert.equal(capturedEmails.length, 1, "re-confirm must not duplicate auto-send.");
    assert.equal(
      (await readAssessments(criticalWithEmail.vendorId)).length,
      1,
      "re-confirm must not create another assessment row.",
    );

    const noEmailDraftId = await seedDraft({
      contactEmail: null,
      name: "Critical Supplier Without Email",
      runId,
      suggestedCriticality: "critical",
    });
    const noEmail = await confirmDiscoveredVendor({
      clerkOrgId,
      discoveredVendorId: noEmailDraftId,
    });
    assert.equal(capturedEmails.length, 1, "critical supplier without email should not send.");
    assert.equal((await readAssessments(noEmail.vendorId)).length, 0);
    assert.equal(
      (await readVendor(noEmail.vendorId))?.status,
      VENDOR_NEEDS_CONTACT_EMAIL_STATUS,
      "critical supplier without email should be visibly marked as needing contact email.",
    );

    const standardDraftId = await seedDraft({
      contactEmail: "standard@example.test",
      name: "Standard Supplier With Email",
      runId,
      suggestedCriticality: "standard",
    });
    const standard = await confirmDiscoveredVendor({
      clerkOrgId,
      discoveredVendorId: standardDraftId,
    });
    assert.equal(capturedEmails.length, 1, "standard supplier should not auto-send.");
    assert.equal((await readAssessments(standard.vendorId)).length, 0);

    const manualVendorId = await seedVendor({
      name: "Manual Backfill Supplier",
      riskTier: "critical",
    });
    await sendVendorQuestionnaireForVendor({
      clerkOrgId,
      vendorEmail: "manual@example.test",
      vendorId: manualVendorId,
    });
    assert.equal(capturedEmails.at(-1)?.to, "manual@example.test");
    assert.equal((await readVendor(manualVendorId))?.status, "questionnaire_sent");

    const token = createVendorAssessmentToken({
      assessmentId: autoAssessment.id,
      clerkOrgId,
      vendorId: criticalWithEmail.vendorId,
    });
    await submitVendorAssessmentByToken({
      answers: fullCreditAnswers(),
      token,
    });
    const scoresAfterSubmit = await readScores(frameworkIds);
    for (const slug of activeFrameworkSlugs) {
      assert.equal(
        scoresAfterSubmit.get(slug),
        50,
        `${slug} should remain manual_review because another critical supplier still needs contact email.`,
      );
    }

    const reminderVendorId = await seedVendor({
      name: "Reminder Supplier",
      riskTier: "critical",
    });
    const reminderSend = await sendVendorQuestionnaireForVendor({
      clerkOrgId,
      vendorEmail: "reminder@example.test",
      vendorId: reminderVendorId,
    });
    const reminderAssessmentId = reminderSend.assessment.id;
    await getDb()
      .update(vendorAssessments)
      .set({
        assessedAt: addDays(new Date(), -8),
        answers: {
          ...(reminderSend.assessment.answers ?? {}),
          deliveryUpdatedAt: addDays(new Date(), -8).toISOString(),
          reminderCount: 0,
          vendorEmail: "reminder@example.test",
        },
      })
      .where(eq(vendorAssessments.id, reminderAssessmentId));
    const reminderBefore = capturedEmails.length;
    const reminderRun = await processVendorAssessmentReminders(new Date());
    assert.equal(reminderRun.remindersSent, 1, "first due sent row should get a reminder.");
    assert.equal(capturedEmails.length, reminderBefore + 1);
    assert.equal(
      capturedEmails.at(-1)?.assessmentId,
      reminderAssessmentId,
      "reminder should resend the stable token link.",
    );
    const [afterFirstReminder] = await readAssessments(reminderVendorId);
    assert.equal(
      (afterFirstReminder?.answers as Record<string, unknown> | null)?.reminderCount,
      1,
    );
    const immediateRerun = await processVendorAssessmentReminders(new Date());
    assert.equal(immediateRerun.remindersSent, 0, "same-day rerun should be idempotent.");

    await getDb()
      .update(vendorAssessments)
      .set({
        answers: {
          ...(afterFirstReminder?.answers as Record<string, unknown>),
          lastReminderAt: addDays(new Date(), -8).toISOString(),
          reminderCount: 1,
        },
      })
      .where(eq(vendorAssessments.id, reminderAssessmentId));
    const secondReminder = await processVendorAssessmentReminders(new Date());
    assert.equal(secondReminder.remindersSent, 1, "second due reminder should send.");
    const [afterSecondReminder] = await readAssessments(reminderVendorId);
    assert.equal(
      (afterSecondReminder?.answers as Record<string, unknown> | null)?.reminderCount,
      2,
    );
    await getDb()
      .update(vendorAssessments)
      .set({
        answers: {
          ...(afterSecondReminder?.answers as Record<string, unknown>),
          lastReminderAt: addDays(new Date(), -8).toISOString(),
          reminderCount: 2,
        },
      })
      .where(eq(vendorAssessments.id, reminderAssessmentId));
    assert.equal(
      (await processVendorAssessmentReminders(new Date())).remindersSent,
      0,
      "max two reminders should be enforced.",
    );

    const retryVendorId = await seedVendor({
      name: "Retry Supplier",
      riskTier: "critical",
    });
    const retrySeed = await sendVendorQuestionnaireForVendor({
      clerkOrgId,
      vendorEmail: "retry@example.test",
      vendorId: retryVendorId,
    });
    await getDb()
      .update(vendorAssessments)
      .set({
        answers: {
          ...(retrySeed.assessment.answers ?? {}),
          retryCount: 0,
          vendorEmail: "retry@example.test",
        },
        status: "email_failed",
      })
      .where(eq(vendorAssessments.id, retrySeed.assessment.id));
    const retryRun = await processVendorAssessmentReminders(new Date());
    assert.equal(retryRun.retriesSent, 1, "email_failed rows should retry once when email can send.");
    const [retriedAssessment] = await readAssessments(retryVendorId);
    assert.equal(retriedAssessment?.status, "sent");
    assert.equal(
      (retriedAssessment?.answers as Record<string, unknown> | null)?.retryCount,
      1,
    );

    const skippedVendorId = await seedVendor({
      name: "Skipped Supplier",
      riskTier: "critical",
    });
    const skippedSeed = await sendVendorQuestionnaireForVendor({
      clerkOrgId,
      vendorEmail: "skipped@example.test",
      vendorId: skippedVendorId,
    });
    await getDb()
      .update(vendorAssessments)
      .set({
        answers: {
          ...(skippedSeed.assessment.answers ?? {}),
          retryCount: 0,
          vendorEmail: "skipped@example.test",
        },
        status: "email_skipped",
      })
      .where(eq(vendorAssessments.id, skippedSeed.assessment.id));
    clearEmailCapture();
    const skippedRun = await processVendorAssessmentReminders(new Date());
    assert.equal(
      skippedRun.retrySkippedNoConfig,
      1,
      "email_skipped rows should surface when no email transport is configured.",
    );
    assert.equal((await readAssessments(skippedVendorId))[0]?.status, "email_skipped");
    setEmailCapture();

    const expiredVendorId = await seedVendor({
      name: "Expired Supplier",
      riskTier: "critical",
    });
    const expiredSeed = await sendVendorQuestionnaireForVendor({
      clerkOrgId,
      vendorEmail: "expired@example.test",
      vendorId: expiredVendorId,
    });
    await getDb()
      .update(vendorAssessments)
      .set({
        assessedAt: addDays(new Date(), -40),
        expiresAt: addDays(new Date(), -1),
      })
      .where(eq(vendorAssessments.id, expiredSeed.assessment.id));
    const expiredRun = await processVendorAssessmentReminders(new Date());
    assert.equal(expiredRun.freshRequestsCreated, 1, "expired sent row should create a fresh request.");
    const expiredRows = await readAssessments(expiredVendorId);
    assert.equal(expiredRows.length, 2);
    assert.equal(expiredRows.some((row) => row.status === "expired"), true);
    assert.equal(expiredRows.some((row) => row.status === "sent"), true);

    console.log(
      JSON.stringify(
        {
          ok: true,
          capturedEmails: capturedEmails.length,
          freshRequestsCreated: expiredRun.freshRequestsCreated,
          noEmailStatus: (await readVendor(noEmail.vendorId))?.status,
          retriesSent: retryRun.retriesSent,
        },
        null,
        2,
      ),
    );
  } finally {
    clearEmailCapture();
    await cleanup();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
