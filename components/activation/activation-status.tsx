import * as React from "react";
import { CheckCircle2, CircleDashed, Clock3, ShieldAlert, XCircle } from "lucide-react";
import clsx from "clsx";
import type {
  EvidenceAssessmentResult,
  EvidenceBlockedReason,
  EvidenceCollectionStatus,
  EvidenceConfidence,
} from "@/lib/activation/evidence-state";

export type ActivationConfirmedResult = "pass" | "gap";
export type ActivationQueueStatus = "queued" | "running";

export type ActivationStatusState =
  | {
      status: "queued";
    }
  | {
      status: "running";
    }
  | {
      blockedReason: NonNullable<EvidenceBlockedReason> | string;
      lastKnownResult?: ActivationConfirmedResult | null;
      status: "blocked";
    }
  | {
      result: ActivationConfirmedResult;
      status: "confirmed";
    };

export type ActivationStatusInput = {
  assessmentResult?: EvidenceAssessmentResult | null;
  blockedReason?: EvidenceBlockedReason | string;
  collectionStatus?: EvidenceCollectionStatus | ActivationQueueStatus | null;
  lastKnownAssessmentResult?: EvidenceAssessmentResult | null;
};

type ActivationStatusProps = {
  className?: string;
  confidence?: EvidenceConfidence | string | null;
  showDetails?: boolean;
  state: ActivationStatusState;
};

const BLOCKED_REASON_LABELS: Record<string, string> = {
  collection_failed: "Collection failed",
  missing_integration: "Integration missing",
  missing_permission: "Permission missing",
  needs_manual_upload: "Manual upload needed",
  not_applicable: "Not applicable",
  unsupported_provider: "Provider unsupported",
};

const STATE_COPY = {
  queued: {
    detail: "Waiting for the next collection run.",
    label: "Queued",
    tone: "neutral",
  },
  running: {
    detail: "Collection is running now.",
    label: "Running",
    tone: "warn",
  },
  pass: {
    detail: "Latest confirmed evidence passed this check.",
    label: "Confirmed pass",
    tone: "pass",
  },
  gap: {
    detail: "Latest confirmed evidence shows a gap.",
    label: "Confirmed gap",
    tone: "fail",
  },
  blocked: {
    detail: "Collection is blocked and needs attention.",
    label: "Blocked",
    tone: "fail",
  },
} as const;

const toneClasses = {
  fail: "border-[var(--status-fail-border)] bg-[var(--status-fail-subtle)] text-[var(--status-fail)]",
  neutral: "border-border bg-surface-muted text-foreground/64",
  pass: "border-[var(--status-pass-border)] bg-[var(--status-pass-subtle)] text-[var(--status-pass)]",
  warn: "border-[var(--status-warn-border)] bg-[var(--status-warn-subtle)] text-[var(--status-warn)]",
} as const;

const icons = {
  blocked: ShieldAlert,
  gap: XCircle,
  pass: CheckCircle2,
  queued: CircleDashed,
  running: Clock3,
} as const;

function isConfirmedResult(value: EvidenceAssessmentResult | null | undefined): value is ActivationConfirmedResult {
  return value === "pass" || value === "gap";
}

function formatBlockedReason(reason: string) {
  return BLOCKED_REASON_LABELS[reason] ?? reason.replaceAll("_", " ");
}

export function deriveActivationStatusState(input: ActivationStatusInput): ActivationStatusState {
  if (input.collectionStatus === "running") {
    return { status: "running" };
  }

  if (input.collectionStatus === "blocked" || input.blockedReason) {
    return {
      blockedReason: input.blockedReason ?? "collection_failed",
      lastKnownResult: isConfirmedResult(input.lastKnownAssessmentResult)
        ? input.lastKnownAssessmentResult
        : null,
      status: "blocked",
    };
  }

  if (isConfirmedResult(input.assessmentResult)) {
    return {
      result: input.assessmentResult,
      status: "confirmed",
    };
  }

  return { status: "queued" };
}

export function ActivationStatus({
  className,
  confidence,
  showDetails = true,
  state,
}: ActivationStatusProps) {
  const key = state.status === "confirmed" ? state.result : state.status;
  const copy = STATE_COPY[key];
  const Icon = icons[key];
  const blockedReason = state.status === "blocked" ? formatBlockedReason(state.blockedReason) : null;
  const preservedResult = state.status === "blocked" && state.lastKnownResult === "pass";

  return (
    <div
      className={clsx(
        "rounded-md border px-3 py-2 text-sm",
        toneClasses[copy.tone],
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" strokeWidth={1.75} />
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.08em]">
          {copy.label}
        </span>
        {confidence ? (
          <span className="rounded-sm border border-current/20 px-1.5 py-0.5 font-mono text-[11px] uppercase opacity-80">
            {confidence}
          </span>
        ) : null}
      </div>
      {showDetails ? (
        <div className="mt-1 space-y-1 text-xs leading-5 opacity-85">
          <p>{copy.detail}</p>
          {blockedReason ? <p>Reason: {blockedReason}.</p> : null}
          {preservedResult ? (
            <p>Last confirmed result is still passing while collection is blocked.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
