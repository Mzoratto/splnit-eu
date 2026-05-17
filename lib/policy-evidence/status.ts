export type PolicyEvidenceProofState =
  | "no_supporting_evidence"
  | "draft_or_uploaded_evidence"
  | "reviewed_pass"
  | "reviewed_issue"
  | "not_applicable";

export type PolicyEvidenceProofStatus = {
  label: string;
  state: PolicyEvidenceProofState;
};

type EvidenceSupport = {
  expiresAt?: Date | string | null;
};

type ScopeStatus = "applicable" | "not_applicable" | "out_of_scope" | null;

const PROOF_STATUS_COPY = {
  draft_or_uploaded_evidence: "Evidence added — needs review.",
  no_supporting_evidence: "No supporting evidence yet.",
  not_applicable: "Out of scope or not applicable based on intake/review.",
  reviewed_issue: "Gap still open.",
  reviewed_pass: "Reviewed as passing with supporting evidence.",
} as const satisfies Record<PolicyEvidenceProofState, string>;

export function derivePolicyEvidenceProofStatus(input: {
  controlStatus?: string | null;
  evidence: readonly EvidenceSupport[];
  now?: Date;
  scopeStatus?: ScopeStatus;
}): PolicyEvidenceProofStatus {
  if (
    input.scopeStatus === "not_applicable" ||
    input.scopeStatus === "out_of_scope" ||
    input.controlStatus === "not_applicable"
  ) {
    return proofStatus("not_applicable");
  }

  const hasEvidence = input.evidence.length > 0;
  const hasCurrentEvidence = input.evidence.some((item) => !isExpired(item.expiresAt, input.now));

  if (input.controlStatus === "fail" || (hasEvidence && !hasCurrentEvidence)) {
    return proofStatus("reviewed_issue");
  }

  if (input.controlStatus === "pass") {
    return hasCurrentEvidence ? proofStatus("reviewed_pass") : proofStatus("reviewed_issue");
  }

  if (!hasEvidence) {
    return proofStatus("no_supporting_evidence");
  }

  return proofStatus("draft_or_uploaded_evidence");
}

export function getPolicyEvidenceProofStatusLabel(state: PolicyEvidenceProofState) {
  return PROOF_STATUS_COPY[state];
}

function proofStatus(state: PolicyEvidenceProofState): PolicyEvidenceProofStatus {
  return {
    label: PROOF_STATUS_COPY[state],
    state,
  };
}

function isExpired(value: Date | string | null | undefined, now = new Date()) {
  if (!value) {
    return false;
  }

  const expiry = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(expiry.getTime())) {
    return false;
  }

  return expiry.getTime() < now.getTime();
}
