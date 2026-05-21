import type {
  NukibBaselineControl,
  NukibWorkspaceExtensions,
} from "@/lib/compliance/nukib/types";
import type { WorkspaceControl } from "@/lib/workspaces/types";

export function nukibControlToWorkspaceExtensions(
  baseline: NukibBaselineControl,
): NukibWorkspaceExtensions {
  return {
    archived: baseline.archived,
    frameworkMappings: baseline.frameworkMappings,
    nukibComplianceState: baseline.defaultState,
    nukibPriority: baseline.priority,
    nukibTier: baseline.tier,
    officialBaselineRefs: [baseline.exactReference],
    notImplementedJustification: baseline.notImplementedJustification,
  };
}

export function enrichComplianceControl(
  control: WorkspaceControl,
  baseline: NukibBaselineControl,
): WorkspaceControl {
  const extensions = nukibControlToWorkspaceExtensions(baseline);
  const hasLegacyNis2Reference = Boolean(control.nis2ArticleRef?.trim());
  const hasNis2FrameworkMapping = baseline.frameworkMappings.some(
    (mapping) => mapping.frameworkId === "nis2",
  );

  if (hasLegacyNis2Reference && hasNis2FrameworkMapping) {
    // TODO: Remove the legacy nis2ArticleRef field once workspace rendering fully
    // reads frameworkMappings as the canonical legal-reference model.
    console.warn(
      `Workspace control "${control.controlKey}" has both legacy nis2ArticleRef and frameworkMappings; frameworkMappings take priority.`,
    );
  }

  const input = control as WorkspaceControl & {
    requiresFileUpload?: boolean;
  };

  return {
    ...control,
    ...extensions,
    evidenceType:
      control.evidenceType ??
      (input.requiresFileUpload === true ? "both" : "attestation"),
  };
}
