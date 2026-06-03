import {
  type ActivationRecommendation,
  getConnectorRecommendationFromTools,
  getPrimaryActivationRecommendation,
} from "@/lib/activation/recommendations";
import type { AccountingPlatform, WorkspaceRecommendation } from "@/lib/onboarding/intake-scope";

export type ActivationNextActionStage =
  | "complete_intake"
  | "review_ranked_gaps"
  | "connect_recommended_integration"
  | "open_recommended_workspace"
  | "upload_first_evidence"
  | "review_first_gap"
  | "active_monitoring";

export type ActivationPriorityControl = {
  evidenceCount?: number;
  href?: string;
  key: string;
  status?: string | null;
  title?: string | null;
};

export type ActivationIntegrationState = {
  provider: string;
  status: string;
};

export type ActivationNextAction = {
  description: string;
  href: string;
  recommendation: ActivationRecommendation | null;
  stage: ActivationNextActionStage;
  title: string;
  topPriorityControlKey: string | null;
};

export type DeriveActivationNextActionInput = {
  accountingPlatform?: AccountingPlatform | null;
  hasIntakeProfile: boolean;
  integrations?: readonly ActivationIntegrationState[];
  priorityControls?: readonly ActivationPriorityControl[];
  selectedTools?: readonly string[];
  workspaceRecommendations?: readonly WorkspaceRecommendation[] | null;
};

export function deriveActivationNextAction(input: DeriveActivationNextActionInput): ActivationNextAction {
  if (!input.hasIntakeProfile) {
    return {
      description: "Complete intake to derive ranked gaps and the first evidence path.",
      href: "/onboarding",
      recommendation: null,
      stage: "complete_intake",
      title: "Complete intake",
      topPriorityControlKey: null,
    };
  }

  const priorityControls = input.priorityControls ?? [];
  const topPriorityControl = priorityControls[0] ?? null;
  const recommendation = getPrimaryActivationRecommendation({
    accountingPlatform: input.accountingPlatform,
    selectedTools: input.selectedTools,
    workspaceRecommendations: input.workspaceRecommendations,
  });

  if (recommendation?.kind === "workspace" && recommendation.supported) {
    return {
      description: recommendation.reason,
      href: recommendation.href,
      recommendation,
      stage: "open_recommended_workspace",
      title: `Open ${recommendation.label}`,
      topPriorityControlKey: topPriorityControl?.key ?? null,
    };
  }

  const connectorRecommendation = recommendation?.kind === "connector"
    ? recommendation
    : getConnectorRecommendationFromTools(input.selectedTools ?? []);

  if (
    connectorRecommendation?.supported &&
    !isIntegrationConnectedOrConnecting(connectorRecommendation.providerKey, input.integrations ?? [])
  ) {
    return {
      description: connectorRecommendation.reason,
      href: connectorRecommendation.href,
      recommendation: connectorRecommendation,
      stage: "connect_recommended_integration",
      title: `Connect ${connectorRecommendation.label}`,
      topPriorityControlKey: topPriorityControl?.key ?? null,
    };
  }

  if (topPriorityControl && !hasEvidence(topPriorityControl)) {
    return {
      description: "Upload or collect the first evidence item for the top ranked gap.",
      href: getControlHref(topPriorityControl),
      recommendation: connectorRecommendation,
      stage: "upload_first_evidence",
      title: "Upload first evidence",
      topPriorityControlKey: topPriorityControl.key,
    };
  }

  if (topPriorityControl && needsHumanReview(topPriorityControl.status)) {
    return {
      description: "Review the first evidence-backed gap before treating it as resolved.",
      href: getControlHref(topPriorityControl),
      recommendation: connectorRecommendation,
      stage: "review_first_gap",
      title: "Review first gap",
      topPriorityControlKey: topPriorityControl.key,
    };
  }

  if (priorityControls.length > 0) {
    return {
      description: "Ranked gaps are ready; keep working through the priority controls.",
      href: "/controls?scope=priority",
      recommendation: connectorRecommendation,
      stage: "active_monitoring",
      title: "Continue priority controls",
      topPriorityControlKey: topPriorityControl?.key ?? null,
    };
  }

  return {
    description: "No priority gap is available yet; review the ranked control focus.",
    href: "/controls?scope=priority",
    recommendation: connectorRecommendation,
    stage: "review_ranked_gaps",
    title: "Review ranked gaps",
    topPriorityControlKey: null,
  };
}

function isIntegrationConnectedOrConnecting(
  providerKey: string | null,
  integrations: readonly ActivationIntegrationState[],
) {
  if (!providerKey) {
    return false;
  }

  return integrations.some(
    (integration) =>
      integration.provider === providerKey &&
      (integration.status === "connected" || integration.status === "connecting"),
  );
}

function hasEvidence(control: ActivationPriorityControl) {
  return (control.evidenceCount ?? 0) > 0;
}

function needsHumanReview(status: string | null | undefined) {
  return status === "manual_review" || status === "unknown" || status === "fail";
}

function getControlHref(control: ActivationPriorityControl) {
  return control.href ?? `/controls/${control.key}`;
}
