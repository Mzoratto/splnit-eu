import assert from "node:assert/strict";
import {
  buildGeneratedArtifactAuditLog,
  GENERATED_ARTIFACT_CREATED_ACTION,
  GENERATED_ARTIFACT_ENTITY_TYPE,
  normalizeGeneratedArtifactLimit,
} from "@/lib/db/queries/generated-artifacts";

const auditLog = buildGeneratedArtifactAuditLog({
  artifactId: "artifact-1",
  kind: "gap_analysis",
  model: null,
  source: "gap_report_pdf",
  title: "NIS2 gap report",
});

assert.equal(auditLog.action, GENERATED_ARTIFACT_CREATED_ACTION);
assert.equal(auditLog.entityId, "artifact-1");
assert.equal(auditLog.entityType, GENERATED_ARTIFACT_ENTITY_TYPE);
assert.deepEqual(auditLog.metadata, {
  kind: "gap_analysis",
  model: null,
  source: "gap_report_pdf",
  title: "NIS2 gap report",
});
assert.equal("content" in auditLog.metadata, false);
assert.equal("blobUrl" in auditLog.metadata, false);
assert.equal(normalizeGeneratedArtifactLimit(), 10);
assert.equal(normalizeGeneratedArtifactLimit(Number.NaN), 10);
assert.equal(normalizeGeneratedArtifactLimit(0), 1);
assert.equal(normalizeGeneratedArtifactLimit(51), 50);
assert.equal(normalizeGeneratedArtifactLimit(12.9), 12);

console.log("Generated artifact audit smoke passed.");
