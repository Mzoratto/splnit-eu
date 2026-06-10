import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { and, eq } from "drizzle-orm";
import JSZip from "jszip";
import { getDb } from "@/lib/db";
import { organisations, vendorAssessments, vendors } from "@/lib/db/schema";
import { assertLocalDatabaseUrl } from "@/lib/db/url-policy";
import {
  createVendor,
  createVendorQuestionnaire,
  saveVendorAssessment,
  submitVendorAssessmentByToken,
} from "@/lib/db/queries/vendors";
import { generateVendorReportXLSX } from "@/lib/documents/generators";
import { getVendorReportData } from "@/lib/documents/queries";
import { vendorQuestionnaireText } from "@/lib/email/templates/alerts";
import { createVendorAssessmentToken } from "@/lib/vendors/access";
import {
  scoreVendorAnswers,
  validateVendorAssessmentAnswers,
  VENDOR_ASSESSMENT_QUESTIONS,
  type VendorAnswerValue,
  type VendorAssessmentAnswers,
} from "@/lib/vendors/questions";

assertLocalDatabaseUrl(
  process.env.DATABASE_URL,
  "vendor questionnaire honesty smoke",
);
process.env.ENCRYPTION_KEY ??= "vendor-questionnaire-honesty-smoke-secret";

function answersWith(value: VendorAnswerValue): VendorAssessmentAnswers {
  return Object.fromEntries(
    VENDOR_ASSESSMENT_QUESTIONS.map((question) => [question.id, value]),
  ) as VendorAssessmentAnswers;
}

function fullCreditAnswers(): VendorAssessmentAnswers {
  return Object.fromEntries(
    VENDOR_ASSESSMENT_QUESTIONS.map((question) => [
      question.id,
      "reverseScore" in question && question.reverseScore ? "no" : "yes",
    ]),
  ) as VendorAssessmentAnswers;
}

async function getAssessmentState(input: {
  assessmentId: string;
  clerkOrgId: string;
  vendorId: string;
}) {
  const db = getDb();
  const rows = await db
    .select({
      answers: vendorAssessments.answers,
      assessmentScore: vendorAssessments.score,
      assessmentStatus: vendorAssessments.status,
      vendorRiskTier: vendors.riskTier,
      vendorStatus: vendors.status,
    })
    .from(vendorAssessments)
    .innerJoin(vendors, eq(vendorAssessments.vendorId, vendors.id))
    .where(
      and(
        eq(vendorAssessments.id, input.assessmentId),
        eq(vendorAssessments.clerkOrgId, input.clerkOrgId),
        eq(vendorAssessments.vendorId, input.vendorId),
        eq(vendors.clerkOrgId, input.clerkOrgId),
        eq(vendors.id, input.vendorId),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

async function workbookText(buffer: Buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const textFiles = Object.keys(zip.files).filter(
    (name) =>
      name === "xl/sharedStrings.xml" ||
      name.startsWith("xl/worksheets/"),
  );
  const contents = await Promise.all(
    textFiles.map((name) => zip.file(name)?.async("string")),
  );

  return contents.filter(Boolean).join("\n");
}

const allNotApplicable = answersWith("not_applicable");
assert.equal(
  scoreVendorAnswers({
    ...allNotApplicable,
    iso_certification: "no",
    security_owner: "yes",
  }),
  50,
  "not_applicable answers should be excluded from the score denominator.",
);
assert.equal(
  scoreVendorAnswers(allNotApplicable),
  null,
  "all not_applicable answers should not produce a fabricated score.",
);

const missingValidation = validateVendorAssessmentAnswers({});
assert.equal(missingValidation.ok, false, "missing answers should be rejected.");
assert.deepEqual(
  missingValidation.ok ? [] : missingValidation.missingQuestionIds,
  VENDOR_ASSESSMENT_QUESTIONS.map((question) => question.id),
  "validation should identify every missing question.",
);
const invalidValidation = validateVendorAssessmentAnswers({
  ...allNotApplicable,
  security_owner: "unknown",
});
assert.equal(invalidValidation.ok, false, "invalid answer values should be rejected.");
assert.deepEqual(
  invalidValidation.ok ? [] : invalidValidation.invalidQuestionIds,
  ["security_owner"],
  "validation should identify invalid explicit values.",
);

const externalFormSource = readFileSync(
  "app/vendor-assessment/[token]/page.tsx",
  "utf8",
);
assert.ok(
  !externalFormSource.includes('defaultValue="partial"'),
  "external supplier form must not default unanswered questions to partial.",
);
assert.match(
  externalFormSource,
  /defaultValue=""/,
  "external supplier form should start each select on an empty placeholder.",
);
assert.match(
  externalFormSource,
  /\brequired\b/,
  "external supplier form should require an explicit answer client-side.",
);

const csMessages = JSON.parse(readFileSync("messages/cs-CZ.json", "utf8"));
assert.equal(
  csMessages.vendorsPage.assessment.answers.not_applicable,
  "Nerelevantní",
  "Czech copy should expose a native not applicable answer.",
);
assert.doesNotMatch(
  csMessages.vendorsPage.assessment.questions.incident_notice,
  /24\s*hodin/i,
  "incident notification copy should not hardcode a 24-hour contractual window.",
);
assert.doesNotMatch(
  csMessages.vendorAssessmentPage.requestDescription,
  /supply-chain/i,
  "Czech supplier request copy should not mix English into the questionnaire label.",
);

const questionnaireEmail = vendorQuestionnaireText({
  assessmentUrl: "https://example.test/vendor-assessment/token",
  locale: "cs-CZ",
  organisationName: "Smoke QA s.r.o.",
  vendorName: "Smoke Supplier",
});
assert.match(
  questionnaireEmail,
  /^Žadatel: Smoke QA s\.r\.o\./,
  "questionnaire email should lead with the requesting organisation.",
);
assert.match(
  questionnaireEmail,
  /Tento e-mail dostáváte/,
  "questionnaire email should explain why the recipient received it.",
);
assert.match(
  questionnaireEmail,
  /Pokud zprávu nečekáte/,
  "questionnaire email should tell unexpected recipients to verify out of band.",
);

async function main() {
  const db = getDb();
  const clerkOrgId = `org_smoke_vendor_honesty_${randomUUID()}`;
  const manualVendorName = `Smoke N/A Vendor ${randomUUID()}`;
  const tokenVendorName = `Smoke Token Vendor ${randomUUID()}`;

  try {
    await db.insert(organisations).values({
      clerkOrgId,
      locale: "cs-CZ",
      name: "Smoke Vendor Honesty s.r.o.",
    });

    const manualVendor = await createVendor({
      category: "security",
      clerkOrgId,
      name: manualVendorName,
      website: "https://manual.example.test",
    });
    await db
      .update(vendors)
      .set({ riskTier: "critical" })
      .where(and(eq(vendors.clerkOrgId, clerkOrgId), eq(vendors.id, manualVendor.id)));

    const allNaAssessment = await saveVendorAssessment({
      answers: allNotApplicable,
      assessedBy: "smoke",
      clerkOrgId,
      vendorId: manualVendor.id,
    });
    const allNaState = await getAssessmentState({
      assessmentId: allNaAssessment.id,
      clerkOrgId,
      vendorId: manualVendor.id,
    });
    assert.ok(allNaState, "all-N/A manual assessment should be persisted.");
    assert.equal(allNaState.assessmentStatus, "completed");
    assert.equal(allNaState.assessmentScore, null);
    assert.equal(
      allNaState.vendorRiskTier,
      "critical",
      "all-N/A assessment should preserve the existing vendor risk tier.",
    );
    assert.equal(allNaState.vendorStatus, "assessed");
    const vendorRowsWithNullScore = await getVendorReportData(clerkOrgId);
    const vendorWorkbook = await generateVendorReportXLSX({
      meta: {
        country: "CZ",
        dic: null,
        employeeCount: null,
        ico: null,
        name: "Smoke Vendor Honesty s.r.o.",
        responsiblePerson: null,
        sector: null,
        sidlo: null,
      },
      rows: vendorRowsWithNullScore,
    });
    const vendorWorkbookXml = await workbookText(vendorWorkbook);
    assert.match(
      vendorWorkbookXml,
      /Bez relevantních zjištění/,
      "vendor XLSX should render completed all-N/A assessments as no applicable findings.",
    );
    assert.doesNotMatch(
      vendorWorkbookXml,
      /Nehodnoceno/,
      "vendor XLSX should not render completed all-N/A assessments as unassessed.",
    );

    const tokenVendor = await createVendor({
      category: "cloud",
      clerkOrgId,
      name: tokenVendorName,
      website: "https://token.example.test",
    });
    const questionnaire = await createVendorQuestionnaire({
      clerkOrgId,
      vendorEmail: "supplier@example.test",
      vendorId: tokenVendor.id,
    });
    const token = createVendorAssessmentToken({
      assessmentId: questionnaire.id,
      clerkOrgId,
      vendorId: tokenVendor.id,
    });

    await assert.rejects(
      () => submitVendorAssessmentByToken({ answers: {}, token }),
      /explicit valid choices/,
      "token submission without explicit answers should be rejected server-side.",
    );
    const stillSent = await getAssessmentState({
      assessmentId: questionnaire.id,
      clerkOrgId,
      vendorId: tokenVendor.id,
    });
    assert.equal(
      stillSent?.assessmentStatus,
      "sent",
      "rejected token submission should leave the questionnaire open.",
    );

    const [legacyAssessment] = await db
      .insert(vendorAssessments)
      .values({
        answers: { legacyAnswer: "partial" },
        assessedAt: new Date("2026-01-01T00:00:00Z"),
        assessedBy: "legacy-smoke",
        clerkOrgId,
        expiresAt: new Date("2026-02-01T00:00:00Z"),
        score: 42,
        status: "completed",
        vendorId: tokenVendor.id,
      })
      .returning({ id: vendorAssessments.id });

    const submittedAnswers = fullCreditAnswers();
    await submitVendorAssessmentByToken({
      answers: submittedAnswers,
      token,
    });
    const submitted = await getAssessmentState({
      assessmentId: questionnaire.id,
      clerkOrgId,
      vendorId: tokenVendor.id,
    });
    assert.ok(submitted, "submitted token assessment should be readable.");
    assert.equal(submitted.assessmentStatus, "submitted");
    assert.equal(submitted.assessmentScore, 100);
    assert.equal(submitted.vendorRiskTier, "low");
    assert.equal(submitted.vendorStatus, "assessed");
    assert.deepEqual(submitted.answers, submittedAnswers);

    const legacyRows = await db
      .select({
        score: vendorAssessments.score,
        status: vendorAssessments.status,
      })
      .from(vendorAssessments)
      .where(eq(vendorAssessments.id, legacyAssessment.id))
      .limit(1);
    assert.deepEqual(
      legacyRows[0],
      { score: 42, status: "completed" },
      "existing completed/submitted rows should not be retro-rescored.",
    );
  } finally {
    await db.delete(vendorAssessments).where(eq(vendorAssessments.clerkOrgId, clerkOrgId));
    await db.delete(vendors).where(eq(vendors.clerkOrgId, clerkOrgId));
    await db.delete(organisations).where(eq(organisations.clerkOrgId, clerkOrgId));
  }
}

main()
  .then(() => {
    console.log("Vendor questionnaire honesty smoke passed.");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
