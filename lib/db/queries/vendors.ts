import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { organisations, vendorAssessments, vendors } from "@/lib/db/schema";
import {
  getVendorRiskTier,
  scoreVendorAnswers,
} from "@/lib/vendors/questions";
import { verifyVendorAssessmentToken } from "@/lib/vendors/access";

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
  const score = scoreVendorAnswers(input.answers);
  const riskTier = getVendorRiskTier(score);
  const assessedAt = new Date();
  const nextReviewAt = new Date(assessedAt);
  nextReviewAt.setUTCMonth(nextReviewAt.getUTCMonth() + 12);

  const [assessment] = await db
    .insert(vendorAssessments)
    .values({
      answers: input.answers,
      assessedAt,
      assessedBy: input.assessedBy ?? null,
      clerkOrgId: input.clerkOrgId,
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

  return assessment;
}

export async function createVendorQuestionnaire(input: {
  clerkOrgId: string;
  vendorEmail: string;
  vendorId: string;
}) {
  const db = getDb();
  const [assessment] = await db
    .insert(vendorAssessments)
    .values({
      answers: { vendorEmail: input.vendorEmail },
      clerkOrgId: input.clerkOrgId,
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

export async function getVendorAssessmentByToken(token: string) {
  const assessmentId = token.split(".")[0];

  if (!assessmentId) {
    return null;
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
    return null;
  }

  const valid = verifyVendorAssessmentToken(token, {
    assessmentId: row.assessment.id,
    clerkOrgId: row.assessment.clerkOrgId,
    vendorId: row.assessment.vendorId,
  });

  return valid ? row : null;
}

export async function submitVendorAssessmentByToken(input: {
  answers: Record<string, unknown>;
  token: string;
}) {
  const data = await getVendorAssessmentByToken(input.token);

  if (!data) {
    throw new Error("Invalid vendor assessment token.");
  }

  const score = scoreVendorAnswers(input.answers);
  const riskTier = getVendorRiskTier(score);
  const assessedAt = new Date();
  const nextReviewAt = new Date(assessedAt);
  nextReviewAt.setUTCMonth(nextReviewAt.getUTCMonth() + 12);

  const db = getDb();
  await db
    .update(vendorAssessments)
    .set({
      answers: input.answers,
      assessedAt,
      score,
      status: "submitted",
    })
    .where(eq(vendorAssessments.id, data.assessment.id));

  await db
    .update(vendors)
    .set({
      lastAssessedAt: assessedAt.toISOString().slice(0, 10),
      nextReviewAt: nextReviewAt.toISOString().slice(0, 10),
      riskTier,
      status: "assessed",
    })
    .where(eq(vendors.id, data.vendor.id));
}
