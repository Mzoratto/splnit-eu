import assert from "node:assert/strict";
import {
  buildGeneratedArtifactAuditLog,
  GENERATED_ARTIFACT_CREATED_ACTION,
  GENERATED_ARTIFACT_ENTITY_TYPE,
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

console.log("Generated artifact audit smoke passed.");
