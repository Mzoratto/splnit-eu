import type { StatusPillTone } from "@/components/app/status-pill";

const PASS_STATUSES = new Set([
  "pass",
  "completed",
  "connected",
  "not_applicable",
]);

const FAIL_STATUSES = new Set(["fail", "error", "critical"]);

const WARN_STATUSES = new Set([
  "manual_review",
  "warning",
  "gap",
  "setup",
  "in_progress",
  "connecting",
]);

type StatusToneOptions = {
  /** Tone for scores below 60 when status alone is inconclusive. */
  lowScoreTone?: StatusPillTone;
};

export function getStatusTone(
  status: string | null | undefined,
  score?: number | null,
  options: StatusToneOptions = {},
): StatusPillTone {
  if (status && PASS_STATUSES.has(status)) {
    return "pass";
  }

  if (status && FAIL_STATUSES.has(status)) {
    return "fail";
  }

  if (status && WARN_STATUSES.has(status)) {
    return "warn";
  }

  if (typeof score === "number") {
    if (score >= 80) {
      return "pass";
    }
    if (score >= 60) {
      return "warn";
    }
    return options.lowScoreTone ?? "fail";
  }

  return "neutral";
}
