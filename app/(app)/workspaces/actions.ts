"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { recordActivationEvent } from "@/lib/activation/events";
import {
  createControlComment,
  getActiveAgencyClientLinkForOrg,
} from "@/lib/db/queries/agencies";
import { createAuditLog } from "@/lib/db/queries/audit-logs";
import { createManualAttestationEvidence } from "@/lib/db/queries/evidence";
import { deriveWorkspaceAttestationAssessmentResult } from "@/lib/workspaces/attestation";

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

const createCommentSchema = z.object({
  body: z.string().trim().min(1).max(2000),
  controlKey: z.string().trim().min(1).max(128),
});

export async function submitWorkspaceAttestationAction(input: {
  answers: Record<string, unknown>;
  controlKey: string;
  layerId: string;
  platformId: string;
}) {
  const parsed = submitAttestationSchema.parse(input);
  const session = await getActiveSession();

  const assessmentResult = deriveWorkspaceAttestationAssessmentResult(parsed.answers);

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

export async function createClientControlCommentAction(input: {
  body: string;
  controlKey: string;
}) {
  const parsed = createCommentSchema.parse(input);
  const session = await getActiveSession();
  const link = await getActiveAgencyClientLinkForOrg(session.clerkOrgId);

  if (!link) {
    throw new Error("Agency client relationship is required for comments.");
  }

  await createControlComment({
    agencyId: link.agencyId,
    authorType: "client",
    authorUserId: session.userId,
    body: parsed.body,
    controlKey: parsed.controlKey,
    orgId: session.clerkOrgId,
  });

  revalidatePath("/workspaces/pohoda");
  revalidatePath("/workspaces/money-s3");
  revalidatePath("/workspaces/helios");
  revalidatePath(`/agency/clients/${session.clerkOrgId}`);
  revalidatePath("/dashboard");
}
