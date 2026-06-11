/**
 * Record-based coverage rules for § 4 (Vrcholné vedení), baseline IDs
 * N-4-01..N-4-06. Per the confirmed mapping review (AUDIT-vbo-n.md § 8):
 * - N-4-01: covered iff a pověřená osoba record with qualification evidence
 *   (note or file) exists
 * - N-4-02: covered iff ≥1 management member is recorded AND every member
 *   has an initial training date AND a regular training within the
 *   reminder window
 * - N-4-06: covered iff ≥1 recovery priority exists AND the list has a
 *   "schváleno vedením dne" approval date
 * - N-4-03, N-4-04, N-4-05: intentionally NO record rules (N-4-04 maps to
 *   ctrl_management_review; 03/05 remain honest gaps)
 */

export const DEFAULT_TRAINING_REMINDER_MONTHS = 12;

export type VboResponsiblePersonRecord = {
  name: string;
  qualificationNote: string | null;
  qualificationFileUrl: string | null;
};

export type VboTrainingRecord = {
  memberName: string;
  initialTrainingOn: string | null;
  lastRegularTrainingOn: string | null;
};

export type VboRecoveryInput = {
  priorityCount: number;
  approvedOn: string | null;
};

export function hasQualificationEvidence(
  person: VboResponsiblePersonRecord,
): boolean {
  return Boolean(
    person.qualificationNote?.trim() || person.qualificationFileUrl?.trim(),
  );
}

export function isTrainingStale(
  lastRegularTrainingOn: string | null | undefined,
  now: Date = new Date(),
  reminderMonths: number = DEFAULT_TRAINING_REMINDER_MONTHS,
): boolean {
  if (!lastRegularTrainingOn) {
    return true;
  }

  const threshold = new Date(now);
  threshold.setUTCMonth(threshold.getUTCMonth() - reminderMonths);

  return new Date(lastRegularTrainingOn) <= threshold;
}

export function computeVboNRecordOverrides(
  input: {
    responsiblePersons: VboResponsiblePersonRecord[];
    trainings: VboTrainingRecord[];
    recovery: VboRecoveryInput;
  },
  now: Date = new Date(),
  reminderMonths: number = DEFAULT_TRAINING_REMINDER_MONTHS,
): Record<string, boolean> {
  const overrides: Record<string, boolean> = {};

  if (input.responsiblePersons.some(hasQualificationEvidence)) {
    overrides["N-4-01"] = true;
  }

  if (
    input.trainings.length > 0 &&
    input.trainings.every(
      (training) =>
        Boolean(training.initialTrainingOn) &&
        !isTrainingStale(training.lastRegularTrainingOn, now, reminderMonths),
    )
  ) {
    overrides["N-4-02"] = true;
  }

  if (input.recovery.priorityCount > 0 && input.recovery.approvedOn) {
    overrides["N-4-06"] = true;
  }

  return overrides;
}
