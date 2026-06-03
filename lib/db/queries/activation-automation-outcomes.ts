import { and, desc, eq, inArray } from "drizzle-orm";
import {
  deriveActivationAutomationOutcome,
  type ActivationAutomationOutcome,
} from "@/lib/activation/automation-outcome";
import { getDb } from "@/lib/db";
import { controls, evidence, remediationTasks } from "@/lib/db/schema";

export async function listActivationAutomationOutcomesForControlKeys(input: {
  clerkOrgId: string;
  controlKeys: readonly string[];
}): Promise<ActivationAutomationOutcome[]> {
  const controlKeys = [...new Set(input.controlKeys)].filter(Boolean);

  if (controlKeys.length === 0) {
    return [];
  }

  const db = getDb();
  const [evidenceRows, taskRows] = await Promise.all([
    db
      .select({
        assessmentResult: evidence.assessmentResult,
        blockedReason: evidence.blockedReason,
        collectedAt: evidence.collectedAt,
        collectionStatus: evidence.collectionStatus,
        confidence: evidence.confidence,
        controlKey: controls.key,
        controlTitle: controls.titleCs,
        evidenceId: evidence.id,
        source: evidence.source,
      })
      .from(evidence)
      .innerJoin(controls, eq(evidence.controlId, controls.id))
      .where(
        and(
          eq(evidence.clerkOrgId, input.clerkOrgId),
          eq(evidence.source, "connector"),
          inArray(controls.key, controlKeys),
        ),
      )
      .orderBy(desc(evidence.collectedAt)),
    db
      .select({
        controlKey: remediationTasks.controlKey,
        description: remediationTasks.description,
        dueDate: remediationTasks.dueDate,
        severity: remediationTasks.severity,
        sourceType: remediationTasks.sourceType,
        status: remediationTasks.status,
        taskId: remediationTasks.id,
        title: remediationTasks.title,
        updatedAt: remediationTasks.updatedAt,
      })
      .from(remediationTasks)
      .where(
        and(
          eq(remediationTasks.clerkOrgId, input.clerkOrgId),
          inArray(remediationTasks.controlKey, controlKeys),
          inArray(remediationTasks.status, ["open", "in_progress"]),
          inArray(remediationTasks.sourceType, ["connector_blocked"]),
        ),
      )
      .orderBy(desc(remediationTasks.updatedAt)),
  ]);

  return controlKeys.flatMap((controlKey) => {
    const outcome = deriveActivationAutomationOutcome({
      controlKeys: [controlKey],
      evidence: evidenceRows,
      remediationTasks: taskRows,
    });

    return outcome ? [outcome] : [];
  });
}

export async function getActivationAutomationOutcomeForControlKeys(input: {
  clerkOrgId: string;
  controlKeys: readonly string[];
}): Promise<ActivationAutomationOutcome | null> {
  const outcomes = await listActivationAutomationOutcomesForControlKeys(input);
  return outcomes.find((outcome) => input.controlKeys.includes(outcome.controlKey)) ?? null;
}
