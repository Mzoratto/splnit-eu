import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { organisations, vendorAssessments, vendors } from "@/lib/db/schema";
import {
  getVendorRiskTier,
  requireVendorAssessmentAnswers,
  scoreVendorAnswers,
} from "@/lib/vendors/questions";
import { recalculateVendorAssessmentControl } from "@/lib/vendors/assessment-coverage";

const VENDOR_ASSESSMENT_EXPIRY_DAYS = 30;

type VendorAssessmentTokenError =
  | "invalid"
  | "expired"
  | "already_submitted";

export type VendorAssessmentTokenResult =
  | {
      ok: true;
      data: {
        assessment: typeof vendorAssessments.$inferSelect;
        organisation: typeof organisations.$inferSelect;
        vendor: typeof vendors.$inferSelect;
      };
    }
  | { ok: false; reason: VendorAssessmentTokenError };

function getVendorAssessmentExpiryDate() {
  const expiresAt = new Date();
  expiresAt.setUTCDate(expiresAt.getUTCDate() + VENDOR_ASSESSMENT_EXPIRY_DAYS);
  return expiresAt;
}

export async function listVendorsForOrg(clerkOrgId: string) {
  const db = getDb();

  return db
    .select()
    .from(vendors)
    .where(eq(vendors.clerkOrgId, clerkOrgId))
    .orderBy(desc(vendors.createdAt));
}

export async function createVendor(input: {
  category?: string | null;
  clerkOrgId: string;
  name: string;
  website?: string | null;
}) {
  const db = getDb();
  const [vendor] = await db
    .insert(vendors)
    .values({
      category: input.category ?? null,
      clerkOrgId: input.clerkOrgId,
      name: input.name,
      status: "pending",
      website: input.website ?? null,
    })
    .returning();

  return vendor;
}

export async function getVendorDetail(input: {
  clerkOrgId: string;
  vendorId: string;
}) {
  const db = getDb();
  const vendorRows = await db
    .select()
    .from(vendors)
    .where(
      and(
        eq(vendors.clerkOrgId, input.clerkOrgId),
        eq(vendors.id, input.vendorId),
      ),
    )
    .limit(1);
  const vendor = vendorRows[0] ?? null;

  if (!vendor) {
    return null;
  }

  const assessments = await db
    .select()
    .from(vendorAssessments)
    .where(
      and(
        eq(vendorAssessments.clerkOrgId, input.clerkOrgId),
        eq(vendorAssessments.vendorId, input.vendorId),
      ),
    )
    .orderBy(desc(vendorAssessments.assessedAt))
    .limit(12);

  return {
    assessments,
    vendor,
  };
}

export async function saveVendorAssessment(input: {
  answers: Record<string, unknown>;
  assessedBy?: string | null;
  clerkOrgId: string;
  status?: string;
  vendorId: string;
}) {
  const db = getDb();
  const vendorRows = await db
    .select({ id: vendors.id, riskTier: vendors.riskTier })
    .from(vendors)
    .where(
      and(
        eq(vendors.clerkOrgId, input.clerkOrgId),
        eq(vendors.id, input.vendorId),
      ),
    )
    .limit(1);

  if (!vendorRows[0]) {
    throw new Error("Vendor not found.");
  }

  const answers = requireVendorAssessmentAnswers(input.answers);
  const score = scoreVendorAnswers(answers);
  const riskTier = score === null ? vendorRows[0].riskTier : getVendorRiskTier(score);
  const assessedAt = new Date();
  const nextReviewAt = new Date(assessedAt);
  nextReviewAt.setUTCMonth(nextReviewAt.getUTCMonth() + 12);

  const [assessment] = await db
    .insert(vendorAssessments)
    .values({
      answers,
      assessedAt,
      assessedBy: input.assessedBy ?? null,
      clerkOrgId: input.clerkOrgId,
      expiresAt: getVendorAssessmentExpiryDate(),
      score,
      status: input.status ?? "completed",
      vendorId: input.vendorId,
    })
    .returning();

  await db
    .update(vendors)
    .set({
      lastAssessedAt: assessedAt.toISOString().slice(0, 10),
      nextReviewAt: nextReviewAt.toISOString().slice(0, 10),
      riskTier,
      status: "assessed",
    })
    .where(
      and(
        eq(vendors.clerkOrgId, input.clerkOrgId),
        eq(vendors.id, input.vendorId),
      ),
    );

  await recalculateVendorAssessmentControl(input.clerkOrgId);

  return assessment;
}

export async function createVendorQuestionnaire(input: {
  clerkOrgId: string;
  vendorEmail: string;
  vendorId: string;
}) {
  const db = getDb();
  const vendorRows = await db
    .select({ id: vendors.id })
    .from(vendors)
    .where(
      and(
        eq(vendors.clerkOrgId, input.clerkOrgId),
        eq(vendors.id, input.vendorId),
      ),
    )
    .limit(1);

  if (!vendorRows[0]) {
    throw new Error("Vendor not found.");
  }

  const [assessment] = await db
    .insert(vendorAssessments)
    .values({
      answers: { vendorEmail: input.vendorEmail },
      clerkOrgId: input.clerkOrgId,
      expiresAt: getVendorAssessmentExpiryDate(),
      status: "sent",
      vendorId: input.vendorId,
    })
    .returning();

  await db
    .update(vendors)
    .set({ status: "questionnaire_sent" })
    .where(
      and(
        eq(vendors.clerkOrgId, input.clerkOrgId),
        eq(vendors.id, input.vendorId),
      ),
    );

  return assessment;
}

export async function updateVendorQuestionnaireDelivery(input: {
  assessmentId: string;
  clerkOrgId: string;
  delivery: Record<string, unknown>;
  status: string;
  vendorId: string;
  vendorStatus: string;
}) {
  const db = getDb();

  const [assessment] = await db
    .update(vendorAssessments)
    .set({
      answers: input.delivery,
      status: input.status,
    })
    .where(
      and(
        eq(vendorAssessments.id, input.assessmentId),
        eq(vendorAssessments.clerkOrgId, input.clerkOrgId),
        eq(vendorAssessments.vendorId, input.vendorId),
      ),
    )
    .returning();

  if (!assessment) {
    throw new Error("Vendor assessment not found.");
  }

  await db
    .update(vendors)
    .set({ status: input.vendorStatus })
    .where(
      and(
        eq(vendors.clerkOrgId, input.clerkOrgId),
        eq(vendors.id, input.vendorId),
      ),
    );

  return assessment;
}

export async function getVendorAssessmentByToken(
  token: string,
): Promise<VendorAssessmentTokenResult> {
  const assessmentId = token.split(".")[0];

  if (!assessmentId) {
    return { ok: false, reason: "invalid" };
  }

  const db = getDb();
  const rows = await db
    .select({
      assessment: vendorAssessments,
      organisation: organisations,
      vendor: vendors,
    })
    .from(vendorAssessments)
    .innerJoin(vendors, eq(vendorAssessments.vendorId, vendors.id))
    .innerJoin(organisations, eq(vendorAssessments.clerkOrgId, organisations.clerkOrgId))
    .where(eq(vendorAssessments.id, assessmentId))
    .limit(1);
  const row = rows[0] ?? null;

  if (!row) {
    return { ok: false, reason: "invalid" };
  }

  const { verifyVendorAssessmentToken } = await import("@/lib/vendors/access");
  const valid = verifyVendorAssessmentToken(token, {
    assessmentId: row.assessment.id,
    clerkOrgId: row.assessment.clerkOrgId,
    vendorId: row.assessment.vendorId,
  });

  if (!valid) {
    return { ok: false, reason: "invalid" };
  }

  if (row.assessment.status !== "sent") {
    return { ok: false, reason: "already_submitted" };
  }

  if (!row.assessment.expiresAt || row.assessment.expiresAt <= new Date()) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true, data: row };
}

export async function submitVendorAssessmentByToken(input: {
  answers: Record<string, unknown>;
  token: string;
}) {
  const result = await getVendorAssessmentByToken(input.token);

  if (!result.ok) {
    throw new Error("Invalid vendor assessment token.");
  }

  const data = result.data;

  const answers = requireVendorAssessmentAnswers(input.answers);
  const score = scoreVendorAnswers(answers);
  const riskTier = score === null ? data.vendor.riskTier : getVendorRiskTier(score);
  const assessedAt = new Date();
  const nextReviewAt = new Date(assessedAt);
  nextReviewAt.setUTCMonth(nextReviewAt.getUTCMonth() + 12);

  const db = getDb();
  const [assessment] = await db
    .update(vendorAssessments)
    .set({
      answers,
      assessedAt,
      assessedBy: "vendor_reported_manual_review",
      score,
      status: "submitted",
    })
    .where(
      and(
        eq(vendorAssessments.id, data.assessment.id),
        eq(vendorAssessments.clerkOrgId, data.assessment.clerkOrgId),
        eq(vendorAssessments.vendorId, data.assessment.vendorId),
        eq(vendorAssessments.status, "sent"),
      ),
    )
    .returning({ id: vendorAssessments.id });

  if (!assessment) {
    throw new Error("Vendor assessment token has already been used.");
  }

  await db
    .update(vendors)
    .set({
      lastAssessedAt: assessedAt.toISOString().slice(0, 10),
      nextReviewAt: nextReviewAt.toISOString().slice(0, 10),
      riskTier,
      status: "assessed",
    })
    .where(eq(vendors.id, data.vendor.id));

  await recalculateVendorAssessmentControl(data.assessment.clerkOrgId);
}
