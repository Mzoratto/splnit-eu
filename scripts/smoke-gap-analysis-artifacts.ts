import assert from "node:assert/strict";
import {
  buildGapAnalysisArtifactContent,
  GAP_ANALYSIS_ARTIFACT_KIND,
} from "@/lib/frameworks/gap-artifacts";

const content = buildGapAnalysisArtifactContent({
  blobUrl: "https://blob.example/gap-report.pdf",
  frameworkSlug: "nis2",
  metadata: {
    generatedAt: "2026-05-05T10:00:00.000Z",
    openControls: 3,
    score: 82,
    totalControls: 20,
  },
});

assert.equal(content.resultType, GAP_ANALYSIS_ARTIFACT_KIND);
assert.equal(content.schemaVersion, 1);
assert.equal(content.frameworkSlug, "nis2");
assert.equal(content.metadata.score, 82);

console.log("Gap analysis artifact smoke passed.");
