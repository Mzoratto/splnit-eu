import { and, desc, eq, inArray } from "drizzle-orm";
import {
  createVendorQuestionnaire,
} from "@/lib/db/queries/vendors";
import { getDb } from "@/lib/db";
import {
  organisations,
  vendorAssessments,
  vendors,
} from "@/lib/db/schema";
import { getAppUrl } from "@/lib/env";
import { createVendorAssessmentToken } from "@/lib/vendors/access";
import { getVendorTemplateForRegime } from "@/lib/vendors/questions";
import { normalizeContactEmail } from "@/lib/vendors/contact-email";
import {
  getVendorQuestionnaireDeliveryMetadata,
  getVendorQuestionnaireDeliveryStatus,
} from "@/lib/vendors/delivery-status";
import {
  canSendVendorQuestionnaireEmail,
  sendVendorQuestionnaireEmail,
} from "@/lib/vendors/notifications";

const ASSESSABLE_RISK_TIERS = new Set(["critical", "high"]);
const VALID_ASSESSMENT_STATUSES = new Set(["completed", "submitted"]);
const DAY_MS = 86_400_000;

export const VENDOR_NEEDS_CONTACT_EMAIL_STATUS = "needs_contact_email";
export const VENDOR_ASSESSMENT_REMINDER_DAYS = 7;
export const VENDOR_ASSESSMENT_MAX_REMINDERS = 2;

type SendReason =
  | "auto_confirm"
  | "manual"
  | "refresh_expired"
  | "reminder"
  | "retry";

type DeliveryContext = {
  assessment: typeof vendorAssessments.$inferSelect;
  organisation: typeof organisations.$inferSelect | null;
  vendor: typeof vendors.$inferSelect;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function parseDate(value: unknown) {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp) : null;
}

function isAfter(value: Date | string | null, now: Date) {
  if (!value) {
    return false;
  }

  const date = value instanceof Date ? value : new Date(`${value}T00:00:00.000Z`);
  return date.getTime() > now.getTime();
}

function isExpired(value: Date | null, now: Date) {
  return Boolean(value && value.getTime() <= now.getTime());
}

function getAssessmentEmail(answers: Record<string, unknown>) {
  return (
    normalizeContactEmail(answers.vendorEmail) ??
    normalizeContactEmail(answers.deliveryTo)
  );
}

function reminderAnchor(answers: Record<string, unknown>, assessedAt: Date | null) {
  return (
    parseDate(answers.lastReminderAt) ??
    parseDate(answers.deliveryUpdatedAt) ??
    assessedAt
  );
}

function isReminderDue(input: {
  answers: Record<string, unknown>;
  assessedAt: Date | null;
  now: Date;
}) {
  const anchor = reminderAnchor(input.answers, input.assessedAt);
  if (!anchor) {
    return true;
  }

  return input.now.getTime() - anchor.getTime() >=
    VENDOR_ASSESSMENT_REMINDER_DAYS * DAY_MS;
}

async function loadDeliveryContext(input: {
  assessmentId: string;
  clerkOrgId: string;
  vendorId: string;
}): Promise<DeliveryContext> {
  const db = getDb();
  const [row] = await db
    .select({
      assessment: vendorAssessments,
      organisation: organisations,
      vendor: vendors,
    })
    .from(vendorAssessments)
    .innerJoin(vendors, eq(vendorAssessments.vendorId, vendors.id))
    .leftJoin(
      organisations,
      eq(vendorAssessments.clerkOrgId, organisations.clerkOrgId),
    )
    .where(
      and(
        eq(vendorAssessments.id, input.assessmentId),
        eq(vendorAssessments.clerkOrgId, input.clerkOrgId),
        eq(vendorAssessments.vendorId, input.vendorId),
      ),
    )
    .limit(1);

  if (!row) {
    throw new Error("Vendor assessment not found.");
  }

  return row;
}

async function persistDeliveryResult(input: {
  assessment: typeof vendorAssessments.$inferSelect;
  deliveryResult: Awaited<ReturnType<typeof sendVendorQuestionnaireEmail>>;
  now: Date;
  reason: SendReason;
  vendorEmail: string;
}) {
  const db = getDb();
  const deliveryState = getVendorQuestionnaireDeliveryStatus(input.deliveryResult);
  const previousAnswers = asRecord(input.assessment.answers);
  const nextAnswers: Record<string, unknown> = {
    ...previousAnswers,
    ...getVendorQuestionnaireDeliveryMetadata({
      result: input.deliveryResult,
      sentAt: input.now.toISOString(),
      to: input.vendorEmail,
    }),
    tokenCreated: true,
    vendorEmail: input.vendorEmail,
  };

  if (input.reason === "reminder") {
    nextAnswers.lastReminderAt = input.now.toISOString();
    nextAnswers.reminderCount = numberValue(previousAnswers.reminderCount) + 1;
  }

  if (input.reason === "retry") {
    nextAnswers.lastRetryAt = input.now.toISOString();
    nextAnswers.retryCount = numberValue(previousAnswers.retryCount) + 1;
  }

  const nextAssessmentStatus =
    input.reason === "reminder"
      ? "sent"
      : deliveryState.assessmentStatus;
  const nextVendorStatus =
    input.reason === "reminder"
      ? "questionnaire_sent"
      : deliveryState.vendorStatus;

  await db
    .update(vendorAssessments)
    .set({
      answers: nextAnswers,
      status: nextAssessmentStatus,
    })
    .where(eq(vendorAssessments.id, input.assessment.id));

  await db
    .update(vendors)
    .set({ status: nextVendorStatus })
    .where(
      and(
        eq(vendors.clerkOrgId, input.assessment.clerkOrgId),
        eq(vendors.id, input.assessment.vendorId),
      ),
    );

  return {
    assessmentStatus: nextAssessmentStatus,
    deliveryState,
  };
}

async function deliverVendorQuestionnaireAssessment(input: {
  assessmentId: string;
  clerkOrgId: string;
  now?: Date;
  reason: SendReason;
  vendorEmail: string;
  vendorId: string;
}) {
  const context = await loadDeliveryContext(input);
  const token = createVendorAssessmentToken({
    assessmentId: context.assessment.id,
    clerkOrgId: input.clerkOrgId,
    vendorId: input.vendorId,
  });
  const deliveryResult = await sendVendorQuestionnaireEmail({
    assessmentUrl: `${getAppUrl()}/vendor-assessment/${token}`,
    locale: context.organisation?.locale,
    organisationName: context.organisation?.name ?? "Splnit.eu",
    to: input.vendorEmail,
    vendorName: context.vendor.name,
  });
  const delivery = await persistDeliveryResult({
    assessment: context.assessment,
    deliveryResult,
    now: input.now ?? new Date(),
    reason: input.reason,
    vendorEmail: input.vendorEmail,
  });

  return {
    assessment: context.assessment,
    delivery,
    token,
  };
}

export async function sendVendorQuestionnaireForVendor(input: {
  clerkOrgId: string;
  reason?: Extract<SendReason, "auto_confirm" | "manual" | "refresh_expired">;
  vendorEmail: string;
  vendorId: string;
}) {
  const vendorEmail = normalizeContactEmail(input.vendorEmail);
  if (!vendorEmail) {
    throw new Error("A valid vendor contact email is required.");
  }

  const db = getDb();
  const [organisation] = await db
    .select({ rezimPovinnosti: organisations.rezimPovinnosti })
    .from(organisations)
    .where(eq(organisations.clerkOrgId, input.clerkOrgId))
    .limit(1);

  const assessment = await createVendorQuestionnaire({
    clerkOrgId: input.clerkOrgId,
    template: getVendorTemplateForRegime(organisation?.rezimPovinnosti),
    vendorEmail,
    vendorId: input.vendorId,
  });

  const delivery = await deliverVendorQuestionnaireAssessment({
    assessmentId: assessment.id,
    clerkOrgId: input.clerkOrgId,
    now: new Date(),
    reason: input.reason ?? "manual",
    vendorEmail,
    vendorId: input.vendorId,
  });

  return {
    assessment,
    delivery,
  };
}

export async function hasOpenOrValidVendorAssessment(input: {
  clerkOrgId: string;
  now?: Date;
  vendorId: string;
}) {
  const now = input.now ?? new Date();
  const db = getDb();
  const [vendor] = await db
    .select({
      nextReviewAt: vendors.nextReviewAt,
    })
    .from(vendors)
    .where(
      and(
        eq(vendors.clerkOrgId, input.clerkOrgId),
        eq(vendors.id, input.vendorId),
      ),
    )
    .limit(1);

  if (!vendor) {
    return false;
  }

  const assessments = await db
    .select({
      expiresAt: vendorAssessments.expiresAt,
      status: vendorAssessments.status,
    })
    .from(vendorAssessments)
    .where(
      and(
        eq(vendorAssessments.clerkOrgId, input.clerkOrgId),
        eq(vendorAssessments.vendorId, input.vendorId),
      ),
    )
    .orderBy(desc(vendorAssessments.assessedAt), desc(vendorAssessments.id));

  if (
    assessments.some(
      (assessment) =>
        assessment.status === "sent" &&
        assessment.expiresAt &&
        assessment.expiresAt.getTime() > now.getTime(),
    )
  ) {
    return true;
  }

  const latestAssessment = assessments[0] ?? null;
  return Boolean(
    latestAssessment &&
      VALID_ASSESSMENT_STATUSES.has(latestAssessment.status) &&
      isAfter(vendor.nextReviewAt, now),
  );
}

export async function markVendorNeedsContactEmail(input: {
  clerkOrgId: string;
  vendorId: string;
}) {
  await getDb()
    .update(vendors)
    .set({ status: VENDOR_NEEDS_CONTACT_EMAIL_STATUS })
    .where(
      and(
        eq(vendors.clerkOrgId, input.clerkOrgId),
        eq(vendors.id, input.vendorId),
      ),
    );
}

export async function maybeAutoSendVendorQuestionnaireForConfirmedVendor(input: {
  clerkOrgId: string;
  contactEmail: string | null;
  now?: Date;
  riskTier: string | null;
  vendorId: string;
}) {
  if (!ASSESSABLE_RISK_TIERS.has(input.riskTier ?? "")) {
    return { status: "not_assessable" as const };
  }

  const contactEmail = normalizeContactEmail(input.contactEmail);
  if (!contactEmail) {
    await markVendorNeedsContactEmail({
      clerkOrgId: input.clerkOrgId,
      vendorId: input.vendorId,
    });
    return { status: "needs_contact_email" as const };
  }

  const blockedByExistingAssessment = await hasOpenOrValidVendorAssessment({
    clerkOrgId: input.clerkOrgId,
    now: input.now,
    vendorId: input.vendorId,
  });

  if (blockedByExistingAssessment) {
    return { status: "existing_assessment" as const };
  }

  const result = await sendVendorQuestionnaireForVendor({
    clerkOrgId: input.clerkOrgId,
    reason: "auto_confirm",
    vendorEmail: contactEmail,
    vendorId: input.vendorId,
  });

  return {
    assessmentId: result.assessment.id,
    status: "sent" as const,
  };
}

async function expireAssessment(input: {
  assessment: typeof vendorAssessments.$inferSelect;
  now: Date;
}) {
  const answers = asRecord(input.assessment.answers);
  await getDb()
    .update(vendorAssessments)
    .set({
      answers: {
        ...answers,
        expiredAt: input.now.toISOString(),
      },
      status: "expired",
    })
    .where(eq(vendorAssessments.id, input.assessment.id));
}

export async function processVendorAssessmentReminders(now = new Date()) {
  const db = getDb();
  const rows = await db
    .select({
      assessment: vendorAssessments,
      vendor: vendors,
    })
    .from(vendorAssessments)
    .innerJoin(vendors, eq(vendorAssessments.vendorId, vendors.id))
    .where(
      inArray(vendorAssessments.status, [
        "email_failed",
        "email_skipped",
        "sent",
      ]),
    )
    .orderBy(vendorAssessments.assessedAt);

  const result = {
    expiredRequestsMarked: 0,
    freshRequestsCreated: 0,
    remindersSent: 0,
    remindersSkippedNoConfig: 0,
    retriesSent: 0,
    retrySkippedNoConfig: 0,
    scanned: rows.length,
  };

  for (const row of rows) {
    const answers = asRecord(row.assessment.answers);
    const vendorEmail = getAssessmentEmail(answers);
    if (!vendorEmail) {
      continue;
    }

    if (row.assessment.status === "sent") {
      if (isExpired(row.assessment.expiresAt, now)) {
        const hasReplacement = await hasOpenOrValidVendorAssessment({
          clerkOrgId: row.assessment.clerkOrgId,
          now,
          vendorId: row.assessment.vendorId,
        });
        await expireAssessment({ assessment: row.assessment, now });
        result.expiredRequestsMarked += 1;

        if (!hasReplacement) {
          await sendVendorQuestionnaireForVendor({
            clerkOrgId: row.assessment.clerkOrgId,
            reason: "refresh_expired",
            vendorEmail,
            vendorId: row.assessment.vendorId,
          });
          result.freshRequestsCreated += 1;
        }

        continue;
      }

      if (numberValue(answers.reminderCount) >= VENDOR_ASSESSMENT_MAX_REMINDERS) {
        continue;
      }

      if (
        !isReminderDue({
          answers,
          assessedAt: row.assessment.assessedAt,
          now,
        })
      ) {
        continue;
      }

      if (!canSendVendorQuestionnaireEmail()) {
        result.remindersSkippedNoConfig += 1;
        continue;
      }

      await deliverVendorQuestionnaireAssessment({
        assessmentId: row.assessment.id,
        clerkOrgId: row.assessment.clerkOrgId,
        now,
        reason: "reminder",
        vendorEmail,
        vendorId: row.assessment.vendorId,
      });
      result.remindersSent += 1;
      continue;
    }

    if (numberValue(answers.retryCount) >= 1) {
      continue;
    }

    if (!canSendVendorQuestionnaireEmail()) {
      result.retrySkippedNoConfig += 1;
      continue;
    }

    if (isExpired(row.assessment.expiresAt, now)) {
      await expireAssessment({ assessment: row.assessment, now });
      result.expiredRequestsMarked += 1;
      await sendVendorQuestionnaireForVendor({
        clerkOrgId: row.assessment.clerkOrgId,
        reason: "refresh_expired",
        vendorEmail,
        vendorId: row.assessment.vendorId,
      });
      result.freshRequestsCreated += 1;
      continue;
    }

    const delivery = await deliverVendorQuestionnaireAssessment({
      assessmentId: row.assessment.id,
      clerkOrgId: row.assessment.clerkOrgId,
      now,
      reason: "retry",
      vendorEmail,
      vendorId: row.assessment.vendorId,
    });

    if (delivery.delivery.assessmentStatus === "sent") {
      result.retriesSent += 1;
    }
  }

  return result;
}
