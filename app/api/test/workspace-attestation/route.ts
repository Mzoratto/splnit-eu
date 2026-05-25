import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createManualAttestationEvidence } from "@/lib/db/queries/evidence";
import { deriveWorkspaceAttestationAssessmentResult } from "@/lib/workspaces/attestation";

// Test-only route — hard-blocked in production and requires explicit opt-in.
// Allows E2E tests to submit workspace attestation evidence without Clerk auth.
// Deliberately omits audit log entries and activation events to avoid test data pollution.

export const dynamic = "force-dynamic";

// Synthetic identifiers that match the existing E2E test naming pattern.
const TEST_CLERK_ORG_ID = "org_e2e_attestation_test";
const TEST_COLLECTED_BY = "user_e2e_test";

const requestSchema = z.object({
  answers: z.record(z.string(), z.unknown()),
  assessmentResult: z.enum(["pass", "gap", "manual_review"]).optional(),
  controlKey: z.string().min(1).max(128),
  layerId: z.string().min(1).max(128),
  platformId: z.string().min(1).max(128),
});

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new Response(null, { status: 404 });
  }

  // Double guard: hard-stop in production; require explicit test opt-in elsewhere.
  if (process.env.NODE_ENV !== "test" && process.env.ENABLE_TEST_ROUTES !== "true") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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
    assessmentResult ?? deriveWorkspaceAttestationAssessmentResult(answers);

  try {
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
