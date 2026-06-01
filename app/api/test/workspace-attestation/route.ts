import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { createManualAttestationEvidence } from "@/lib/db/queries/evidence";
import { evidence, orgControlStatuses, organisations } from "@/lib/db/schema";
import { deriveWorkspaceAttestationAssessmentResult } from "@/lib/workspaces/attestation";

// Test-only route — hard-blocked in production and requires explicit opt-in.
// Allows E2E tests to submit workspace attestation evidence without Clerk auth.
// Deliberately omits audit log entries and activation events to avoid test data pollution.

export const dynamic = "force-dynamic";

// Synthetic identifiers that match the existing E2E test naming pattern.
const TEST_CLERK_ORG_ID = "org_e2e_attestation_test";
const TEST_COLLECTED_BY = "user_e2e_test";

function isTestRouteEnabled() {
  if (process.env.VERCEL_ENV === "production") {
    return false;
  }

  return process.env.NODE_ENV === "test" || process.env.ENABLE_TEST_ROUTES === "true";
}

const requestSchema = z.object({
  answers: z.record(z.string(), z.unknown()),
  assessmentResult: z.enum(["pass", "gap", "manual_review"]).optional(),
  controlKey: z.string().min(1).max(128),
  layerId: z.string().min(1).max(128),
  platformId: z.string().min(1).max(128),
});

export async function POST(request: NextRequest) {
  if (!isTestRouteEnabled()) {
    return new Response(null, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { answers, assessmentResult, controlKey, layerId, platformId } = parsed.data;
  const resolvedAssessmentResult =
    assessmentResult ?? deriveWorkspaceAttestationAssessmentResult(answers, { platformId });

  try {
    const db = getDb();
    await db
      .insert(organisations)
      .values({
        clerkOrgId: TEST_CLERK_ORG_ID,
        country: "CZ",
        locale: "cs-CZ",
        name: "E2E workspace attestation test org",
        primaryJurisdiction: "CZ",
      })
      .onConflictDoNothing();

    const result = await createManualAttestationEvidence({
      answers,
      assessmentResult: resolvedAssessmentResult,
      clerkOrgId: TEST_CLERK_ORG_ID,
      collectedBy: TEST_COLLECTED_BY,
      controlKey,
      description: `E2E test attestation — platform: ${platformId}, layer: ${layerId}`,
    });

    return NextResponse.json({
      assessmentResult: resolvedAssessmentResult,
      clerkOrgId: TEST_CLERK_ORG_ID,
      controlId: result.controlId,
      controlKey,
      evidenceId: result.evidenceId,
      layerId,
      platformId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  if (!isTestRouteEnabled()) {
    return new Response(null, { status: 404 });
  }

  const db = getDb();
  const deletedEvidenceRows = await db
    .delete(evidence)
    .where(eq(evidence.clerkOrgId, TEST_CLERK_ORG_ID))
    .returning({ id: evidence.id });
  const deletedStatusRows = await db
    .delete(orgControlStatuses)
    .where(eq(orgControlStatuses.clerkOrgId, TEST_CLERK_ORG_ID))
    .returning({ controlId: orgControlStatuses.controlId });
  const deletedOrgRows = await db
    .delete(organisations)
    .where(eq(organisations.clerkOrgId, TEST_CLERK_ORG_ID))
    .returning({ clerkOrgId: organisations.clerkOrgId });

  return NextResponse.json({
    clerkOrgId: TEST_CLERK_ORG_ID,
    deletedEvidence: deletedEvidenceRows.length,
    deletedOrganisations: deletedOrgRows.length,
    deletedStatuses: deletedStatusRows.length,
  });
}
