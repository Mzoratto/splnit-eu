import { getVboNControl, type VboNControl } from "./spec";

export const PREHLED_STATUSES = ["zavedeno", "planovano", "nezavedeno"] as const;

export type PrehledStatus = (typeof PREHLED_STATUSES)[number];

export const PREHLED_PRIORITIES = ["vysoka", "stredni", "nizka"] as const;

export type PrehledPriority = (typeof PREHLED_PRIORITIES)[number];

export type PrehledEntryInput = {
  baselineId: string;
  status: string;
  implementationNote?: string | null;
  plannedDate?: string | null;
  priority?: string | null;
  responsiblePerson?: string | null;
  justification?: string | null;
};

export type PrehledValidationResult =
  | { ok: true; control: VboNControl; status: PrehledStatus }
  | { ok: false; errors: string[] };

/**
 * Hard validation per § 3 odst. 2 VBO-N:
 * - zavedeno requires popis zavedení
 * - planovano requires termín, priorita, odpovědná osoba
 * - nezavedeno requires odůvodnění and is FORBIDDEN for neopominutelné
 *   controls (they may only vary in degree of implementation)
 */
export function validatePrehledEntry(input: PrehledEntryInput): PrehledValidationResult {
  const errors: string[] = [];
  const control = getVboNControl(input.baselineId);

  if (!control) {
    return { errors: [`Neznámé opatření: ${input.baselineId}`], ok: false };
  }

  if (!(PREHLED_STATUSES as readonly string[]).includes(input.status)) {
    return { errors: [`Neplatný stav: ${input.status}`], ok: false };
  }

  const status = input.status as PrehledStatus;

  if (status === "nezavedeno" && control.tier === "neopominutelné") {
    errors.push(
      `Neopominutelné opatření ${control.id} nelze označit jako nezavedené.`,
    );
  }

  if (status === "zavedeno" && !input.implementationNote?.trim()) {
    errors.push("Stav „zavedeno“ vyžaduje popis zavedení.");
  }

  if (status === "planovano") {
    if (!input.plannedDate?.trim()) {
      errors.push("Stav „plánováno“ vyžaduje termín.");
    }
    if (!(PREHLED_PRIORITIES as readonly string[]).includes(input.priority ?? "")) {
      errors.push("Stav „plánováno“ vyžaduje prioritu.");
    }
    if (!input.responsiblePerson?.trim()) {
      errors.push("Stav „plánováno“ vyžaduje odpovědnou osobu.");
    }
  }

  if (status === "nezavedeno" && !input.justification?.trim()) {
    errors.push("Stav „nezavedeno“ vyžaduje odůvodnění.");
  }

  if (errors.length) {
    return { errors, ok: false };
  }

  return { control, ok: true, status };
}

/** Statuses the UI may offer for a baseline control, by tier. */
export function getAllowedPrehledStatuses(baselineId: string): PrehledStatus[] {
  const control = getVboNControl(baselineId);

  if (control?.tier === "neopominutelné") {
    return ["zavedeno", "planovano"];
  }

  return [...PREHLED_STATUSES];
}

const ANNUAL_REVIEW_NUDGE_MONTHS = 11;

/** § 3 odst. 2: review at least annually — nudge from month 11. */
export function isPrehledVersionStale(
  newestCreatedAt: Date | string | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!newestCreatedAt) {
    return false;
  }

  const threshold = new Date(now);
  threshold.setUTCMonth(threshold.getUTCMonth() - ANNUAL_REVIEW_NUDGE_MONTHS);

  return new Date(newestCreatedAt) <= threshold;
}
