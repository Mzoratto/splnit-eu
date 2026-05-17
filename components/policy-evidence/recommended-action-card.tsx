import * as React from "react";
import Link from "next/link";
import { FileCheck2, FileUp, ShieldCheck } from "lucide-react";
import { StatusPill, type StatusPillTone } from "@/components/app/status-pill";
import type { PolicyEvidenceRecommendation } from "@/lib/policy-evidence/recommendations";
import type {
  PolicyEvidenceProofState,
  PolicyEvidenceProofStatus,
} from "@/lib/policy-evidence/status";

type RecommendedActionCardProps = {
  proofStatus: PolicyEvidenceProofStatus;
  recommendation: PolicyEvidenceRecommendation;
};

const proofToneByState: Record<PolicyEvidenceProofState, StatusPillTone> = {
  draft_or_uploaded_evidence: "warn",
  no_supporting_evidence: "neutral",
  not_applicable: "neutral",
  reviewed_issue: "fail",
  reviewed_pass: "pass",
};

export function RecommendedActionCard({
  proofStatus,
  recommendation,
}: RecommendedActionCardProps) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">{recommendation.title}</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-foreground/68">
            {recommendation.summary}
          </p>
        </div>
        <StatusPill tone={proofToneByState[proofStatus.state]} className="shrink-0">
          {proofStatus.label}
        </StatusPill>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-md bg-surface-muted p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FileUp className="h-4 w-4 text-primary" aria-hidden="true" />
            Supporting evidence
          </div>
          <p className="mt-2 text-sm leading-6 text-foreground/68">
            {recommendation.evidenceAction}
          </p>
        </div>

        <div className="rounded-md bg-surface-muted p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FileCheck2 className="h-4 w-4 text-primary" aria-hidden="true" />
            Policy support
          </div>
          <p className="mt-2 text-sm leading-6 text-foreground/68">
            {recommendation.policyAction}
          </p>
          <Link
            href={recommendation.policyHref}
            className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
          >
            Open security policy
          </Link>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-foreground/64">{recommendation.humanReviewAction}</p>
        <div className="flex flex-wrap gap-2">
          <a
            href="#evidence-upload"
            className="inline-flex items-center rounded-md border border-border px-3 py-2 font-medium hover:bg-surface-muted"
          >
            Add evidence
          </a>
          <a
            href="#status-review"
            className="inline-flex items-center rounded-md border border-border px-3 py-2 font-medium hover:bg-surface-muted"
          >
            Review status
          </a>
        </div>
      </div>
    </section>
  );
}
