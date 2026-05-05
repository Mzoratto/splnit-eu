import { getDb } from "@/lib/db";
import { evidence } from "@/lib/db/schema";
import type { TestStatus } from "./types";

const AUTOMATED_EVIDENCE_REFRESH_MS = 24 * 60 * 60 * 1000;

export function shouldCollectAutomatedEvidence(input: {
  lastEvidenceAt: Date | null;
  now: Date;
  previousStatus: string | null;
  resultStatus: TestStatus;
}) {
  if (input.resultStatus === "error") {
    return false;
  }

  if (!input.lastEvidenceAt) {
    return true;
  }

  if (input.previousStatus && input.previousStatus !== input.resultStatus) {
    return true;
  }

  return (
    input.now.getTime() - input.lastEvidenceAt.getTime() >=
    AUTOMATED_EVIDENCE_REFRESH_MS
  );
}

export async function createAutomatedEvidenceForIntegrationRun(input: {
  checkLogic: string;
  clerkOrgId: string;
  controlId: string;
  failureReason?: string;
  integrationRunId: string;
  passCriteria: string | null;
  provider: string;
  resultData: Record<string, unknown>;
  status: TestStatus;
  testName: string;
}) {
  const db = getDb();

  await db.insert(evidence).values({
    clerkOrgId: input.clerkOrgId,
    collectedBy: "system:integration-runner",
    controlId: input.controlId,
    description: `${input.provider} automated check: ${input.testName} (${input.status}).`,
    integrationRunId: input.integrationRunId,
    snapshotData: {
      checkLogic: input.checkLogic,
      failureReason: input.failureReason ?? null,
      passCriteria: input.passCriteria,
      provider: input.provider,
      resultData: input.resultData,
      status: input.status,
      testName: input.testName,
    },
    source: `integration:${input.provider}`,
    type: "automated_snapshot",
  });
}
