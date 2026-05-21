import type { EvidenceAssessmentResult, EvidenceCollectionStatus } from "@/lib/activation/evidence-state";
import type { NukibWorkspaceExtensions } from "@/lib/compliance/nukib/types";

export type NukibControlBlock = {
  blockTitle: string;
  sectionTitle: string;
};

// A single compliance control within a workspace layer.
// evidenceType drives which collection UI to show per control.
export type WorkspaceControl = NukibWorkspaceExtensions & {
  apiEndpoint?: string;
  apiExpected?: string;
  apiField?: string;
  automatable?: boolean;
  controlKey: string;
  question: string;
  guidance: string;
  evidenceType: "attestation" | "file_upload" | "both";
  nis2ArticleRef: string;
  zobkSectionRef?: string;
};

// A logical grouping of controls. id is fixed to the four
// cross-platform layers; title is locale-display only.
export type ComplianceLayer = {
  id: "infrastructure" | "iam" | "backup_dr" | "api_connectivity";
  nukibBlock: NukibControlBlock;
  title: string;
  controls: WorkspaceControl[];
};

// Static config for a platform (e.g. Money S3, Helios, Pohoda).
// Intentionally flat so Tranche 3 configs drop in with no type changes.
export type PlatformWorkspace = {
  platformId: string;
  platformName: string;
  platformVendor: string;
  layers: ComplianceLayer[];
};

// Per-control evidence state used by the workspace renderer.
// Keyed by WorkspaceControl.controlKey.
export type WorkspaceEvidenceState = Record<
  string,
  {
    assessmentResult: EvidenceAssessmentResult;
    collectionStatus: EvidenceCollectionStatus;
    hasEvidence: boolean;
  }
>;
