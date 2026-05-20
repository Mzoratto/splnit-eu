import { createAuditLog } from "@/lib/db/queries/audit-logs";
import type { EvidenceAssessmentResult, EvidenceBlockedReason, EvidenceCollectionStatus } from "./evidence-state";

export const ACTIVATION_EVENT_NAMES = [
  "IntakeCompleted",
  "ConnectorRecommended",
  "ConnectorOAuthStarted",
  "ConnectorOAuthCompleted",
  "EvidenceCollectionQueued",
  "EvidenceCollected",
  "EvidenceBlocked",
  "AssessmentChanged",
  "ManualEvidenceAdded",
] as const;

export type ActivationEventName = (typeof ACTIVATION_EVENT_NAMES)[number];

type ActivationEventBase<TName extends ActivationEventName, TMetadata extends Record<string, unknown>> = {
  clerkOrgId: string;
  clerkUserId?: string | null;
  entityId: string;
  entityType: "assessment" | "connector" | "control" | "evidence" | "intake";
  metadata: TMetadata;
  name: TName;
};

export type ActivationEvent =
  | ActivationEventBase<
      "IntakeCompleted",
      {
        selectedFrameworks: string[];
        selectedTools: string[];
        version: number;
      }
    >
  | ActivationEventBase<
      "ConnectorRecommended",
      {
        provider: string;
        selectedTools: string[];
        source: "intake";
      }
    >
  | ActivationEventBase<
      "ConnectorOAuthStarted",
      {
        provider: string;
        redirectUri: string;
      }
    >
  | ActivationEventBase<
      "ConnectorOAuthCompleted",
      {
        provider: string;
        tokenType: "oauth2";
      }
    >
  | ActivationEventBase<
      "EvidenceCollectionQueued",
      {
        lockEnabled: boolean;
        provider: string;
        trigger: "oauth_callback_first_run";
      }
    >
  | ActivationEventBase<
      "EvidenceCollected",
      {
        assessmentResult: EvidenceAssessmentResult;
        collectionStatus: Extract<EvidenceCollectionStatus, "collected">;
        controlId: string;
        provider: string;
        source: "connector";
        testName: string;
      }
    >
  | ActivationEventBase<
      "EvidenceBlocked",
      {
        blockedReason: NonNullable<EvidenceBlockedReason> | string;
        collectionStatus: Exclude<EvidenceCollectionStatus, "collected" | "pending">;
        controlId: string;
        provider: string;
        source: "connector";
        testName: string;
      }
    >
  | ActivationEventBase<
      "AssessmentChanged",
      {
        controlId: string;
        nextStatus: string;
        previousStatus: string | null;
        source: "automated_evidence" | "manual_status";
      }
    >
  | ActivationEventBase<
      "ManualEvidenceAdded",
      {
        controlId: string;
        controlKey: string;
        evidenceId: string;
        fileType: string;
        source: "manual";
      }
    >;

export async function recordActivationEvent(event: ActivationEvent) {
  await createAuditLog({
    action: `activation.${event.name}`,
    clerkOrgId: event.clerkOrgId,
    clerkUserId: event.clerkUserId ?? null,
    entityId: event.entityId,
    entityType: event.entityType,
    metadata: {
      ...event.metadata,
      activationEvent: event.name,
    },
  });
}

export function getRecommendedConnectorFromTools(toolKeys: string[]) {
  if (toolKeys.some((toolKey) => toolKey === "microsoft365" || toolKey === "microsoft-copilot")) {
    return "microsoft365";
  }

  if (toolKeys.includes("google-workspace")) {
    return "google";
  }

  return "microsoft365";
}
