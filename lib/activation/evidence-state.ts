export type EvidenceAssessmentResult =
  | "pass"
  | "fail"
  | "warning"
  | "manual_review"
  | "not_applicable"
  | "unknown";

export type EvidenceCollectionStatus =
  | "collected"
  | "blocked"
  | "pending"
  | "expired";

export type EvidenceSource = "connector" | "manual" | "intake" | "imported";

export type EvidenceConfidence = "high" | "medium" | "low";

export type EvidenceConfidenceDefault = EvidenceConfidence | "explicit";

export type EvidenceBlockedReason =
  | "missing_permission"
  | "missing_integration"
  | "unsupported_provider"
  | "collection_failed"
  | "needs_manual_upload"
  | "not_applicable"
  | null;

export type EvidenceState = {
  assessment_result: EvidenceAssessmentResult;
  collection_status: EvidenceCollectionStatus;
  source: EvidenceSource;
  confidence: EvidenceConfidence;
  collected_at: Date | null;
  blocked_reason: EvidenceBlockedReason;
};

export type EvidenceFreshness = {
  is_fresh: boolean;
  collected_at: Date | null;
  expires_at: Date | null;
  ttl_ms: number;
  status: "fresh" | "stale" | "missing";
};

export const DEFAULT_EVIDENCE_CONFIDENCE_BY_SOURCE = {
  connector: "high",
  manual: "medium",
  intake: "low",
  imported: "explicit",
} as const satisfies Record<EvidenceSource, EvidenceConfidenceDefault>;

export function getDefaultEvidenceConfidence(input: {
  source: EvidenceSource;
  importedConfidence?: EvidenceConfidence;
}): EvidenceConfidence {
  const defaultConfidence = DEFAULT_EVIDENCE_CONFIDENCE_BY_SOURCE[input.source];

  if (defaultConfidence !== "explicit") {
    return defaultConfidence;
  }

  if (!input.importedConfidence) {
    throw new Error("Imported evidence requires an explicit confidence value.");
  }

  return input.importedConfidence;
}

export function computeEvidenceFreshness(input: {
  collected_at: Date | null;
  now?: Date;
  ttl_ms: number;
}): EvidenceFreshness {
  if (input.ttl_ms < 0) {
    throw new Error("Evidence freshness TTL must be non-negative.");
  }

  if (!input.collected_at) {
    return {
      is_fresh: false,
      collected_at: null,
      expires_at: null,
      ttl_ms: input.ttl_ms,
      status: "missing",
    };
  }

  const now = input.now ?? new Date();
  const expiresAt = new Date(input.collected_at.getTime() + input.ttl_ms);
  const isFresh = now.getTime() <= expiresAt.getTime();

  return {
    is_fresh: isFresh,
    collected_at: input.collected_at,
    expires_at: expiresAt,
    ttl_ms: input.ttl_ms,
    status: isFresh ? "fresh" : "stale",
  };
}

type EvidenceStateInputBase = {
  assessment_result?: EvidenceAssessmentResult;
  blocked_reason?: EvidenceBlockedReason;
  collected_at?: Date | null;
  collection_status?: EvidenceCollectionStatus;
};

export type CreateEvidenceStateInput = EvidenceStateInputBase &
  (
    | {
        confidence?: EvidenceConfidence;
        source: Exclude<EvidenceSource, "imported">;
      }
    | {
        confidence: EvidenceConfidence;
        source: "imported";
      }
  );

export function createEvidenceState(input: CreateEvidenceStateInput): EvidenceState {
  const blockedReason = input.blocked_reason ?? null;
  const collectedAt = input.collected_at ?? null;
  const collectionStatus =
    input.collection_status ??
    (blockedReason ? "blocked" : collectedAt ? "collected" : "pending");

  return {
    assessment_result: input.assessment_result ?? "unknown",
    blocked_reason: blockedReason,
    collected_at: collectedAt,
    collection_status: collectionStatus,
    confidence:
      input.confidence ??
      getDefaultEvidenceConfidence({
        source: input.source,
      }),
    source: input.source,
  };
}
