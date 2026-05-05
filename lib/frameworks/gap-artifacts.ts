import type { FrameworkSlug } from "@/lib/controls/library";

export const GAP_ANALYSIS_ARTIFACT_KIND = "gap_analysis";

export function buildGapAnalysisArtifactContent(input: {
  blobUrl: string;
  frameworkSlug: FrameworkSlug;
  metadata: Record<string, unknown>;
}) {
  return {
    blobUrl: input.blobUrl,
    frameworkSlug: input.frameworkSlug,
    metadata: input.metadata,
    resultType: GAP_ANALYSIS_ARTIFACT_KIND,
    schemaVersion: 1,
  };
}
