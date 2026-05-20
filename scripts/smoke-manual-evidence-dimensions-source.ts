import { match } from "node:assert/strict";
import { readFileSync } from "node:fs";

const evidenceQueriesSource = readFileSync("lib/db/queries/evidence.ts", "utf8");
function assertMatches(source: string, pattern: RegExp, message: string) {
  match(source, pattern, message);
}

assertMatches(
  evidenceQueriesSource,
  /import\s+\{\s*createEvidenceState\s*\}\s+from\s+["']@\/lib\/activation\/evidence-state["']/,
  "manual evidence writes must use the shared dimensional evidence-state model.",
);

assertMatches(
  evidenceQueriesSource,
  /createEvidenceState\(\{[\s\S]*assessment_result:\s*["']manual_review["'][\s\S]*collection_status:\s*["']collected["'][\s\S]*source:\s*["']manual["'][\s\S]*\}\)/,
  "manual evidence must explicitly derive manual_review + collected + manual through the dimensional model.",
);

assertMatches(
  evidenceQueriesSource,
  /assessmentResult:\s*manualEvidenceState\.assessment_result[\s\S]*collectionStatus:\s*manualEvidenceState\.collection_status[\s\S]*confidence:\s*manualEvidenceState\.confidence[\s\S]*source:\s*manualEvidenceState\.source/,
  "manual evidence insert must persist all dimensional fields from the shared state object.",
);

assertMatches(
  evidenceQueriesSource,
  /blobUrl\?:\s*string\s*\|\s*null/,
  "manual evidence input must support structured attestation evidence without requiring a file blob.",
);

assertMatches(
  evidenceQueriesSource,
  /snapshotData\?:\s*Record<string, unknown>\s*\|\s*null/,
  "manual evidence input must support structured attestation answers in snapshotData.",
);

assertMatches(
  evidenceQueriesSource,
  /export\s+async\s+function\s+createManualAttestationEvidence[\s\S]*return\s+createManualEvidence\(\{[\s\S]*snapshotData:\s*\{[\s\S]*attestationAnswers:\s*input\.answers[\s\S]*\}/,
  "structured attestation answers must flow through createManualEvidence rather than a separate insert path.",
);

console.log("manual evidence dimensional source smoke passed");
