"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { recordActivationEvent } from "@/lib/activation/events";
import { createAuditLog } from "@/lib/db/queries/audit-logs";
import { createManualAttestationEvidence } from "@/lib/db/queries/evidence";

/**
 * Derives the assessment_result from attestation answers.
 *
 * Rules:
 *  - Any answer that is strictly false, "fail", or "no" (case-insensitive) → "gap"
 *  - All answers strictly true, "pass", or "yes" → "pass"
 *  - No answers or all values undefined/null → "manual_review"
 */
function deriveAssessmentResult(
  answers: Record<string, unknown>,
): "pass" | "gap" | "manual_review" {
  const values = Object.values(answers);

  if (values.length === 0) {
    return "manual_review";
  }

  const failing = values.some(
    (v) =>
      v === false ||
      (typeof v === "string" &&
        (v.toLowerCase() === "fail" || v.toLowerCase() === "no")),
  );

  if (failing) {
    return "gap";
  }

  const passing = values.some(
    (v) =>
      v === true ||
      (typeof v === "string" &&
        (v.toLowerCase() === "pass" || v.toLowerCase() === "yes")),
  );

  return passing ? "pass" : "manual_review";
}

async function getActiveSession() {
  const session = await auth();

  if (!session.userId || !session.orgId) {
    throw new Error("Active Clerk organisation is required.");
  }

  return {
    clerkOrgId: session.orgId,
    userId: session.userId,
  };
}

const submitAttestationSchema = z.object({
  answers: z.record(z.string(), z.unknown()),
  controlKey: z.string().min(1).max(128),
  layerId: z.string().min(1).max(128),
  platformId: z.string().min(1).max(128),
});

export async function submitWorkspaceAttestationAction(input: {
  answers: Record<string, unknown>;
  controlKey: string;
  layerId: string;
  platformId: string;
}) {
  const parsed = submitAttestationSchema.parse(input);
  const session = await getActiveSession();

  const assessmentResult = deriveAssessmentResult(parsed.answers);

  const result = await createManualAttestationEvidence({
    answers: parsed.answers,
    assessmentResult,
    clerkOrgId: session.clerkOrgId,
    collectedBy: session.userId,
    controlKey: parsed.controlKey,
    description: `Workspace attestation — platform: ${parsed.platformId}, layer: ${parsed.layerId}`,
  });

  await createAuditLog({
    action: "evidence.workspace_attestation_submitted",
    clerkOrgId: session.clerkOrgId,
    clerkUserId: session.userId,
    entityId: result.evidenceId,
    entityType: "evidence",
    metadata: {
      assessmentResult,
      controlId: result.controlId,
      controlKey: parsed.controlKey,
      layerId: parsed.layerId,
      platformId: parsed.platformId,
      source: "manual",
    },
  });

  await recordActivationEvent({
    clerkOrgId: session.clerkOrgId,
    clerkUserId: session.userId,
    entityId: result.evidenceId,
    entityType: "evidence",
    metadata: {
      controlId: result.controlId,
      controlKey: parsed.controlKey,
      evidenceId: result.evidenceId,
      fileType: "application/json",
      source: "manual",
    },
    name: "ManualEvidenceAdded",
  });

  revalidatePath("/dashboard");
  revalidatePath("/evidence");
  revalidatePath("/settings/audit-log");
  revalidatePath(`/controls/${parsed.controlKey}`);
  revalidatePath(`/workspaces/${parsed.platformId}`);

  return {
    assessmentResult,
    controlId: result.controlId,
    evidenceId: result.evidenceId,
  };
}
