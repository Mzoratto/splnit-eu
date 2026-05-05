import assert from "node:assert/strict";
import { shouldCollectAutomatedEvidence } from "../lib/integrations/evidence";

const now = new Date("2026-05-05T12:00:00.000Z");
const recent = new Date("2026-05-05T11:00:00.000Z");
const stale = new Date("2026-05-04T11:00:00.000Z");

assert.equal(
  shouldCollectAutomatedEvidence({
    lastEvidenceAt: null,
    now,
    previousStatus: null,
    resultStatus: "pass",
  }),
  true,
  "first successful automated result should create evidence",
);

assert.equal(
  shouldCollectAutomatedEvidence({
    lastEvidenceAt: recent,
    now,
    previousStatus: "pass",
    resultStatus: "fail",
  }),
  true,
  "status changes should create evidence immediately",
);

assert.equal(
  shouldCollectAutomatedEvidence({
    lastEvidenceAt: recent,
    now,
    previousStatus: "pass",
    resultStatus: "pass",
  }),
  false,
  "unchanged recent automated results should not create duplicate evidence",
);

assert.equal(
  shouldCollectAutomatedEvidence({
    lastEvidenceAt: stale,
    now,
    previousStatus: "pass",
    resultStatus: "pass",
  }),
  true,
  "unchanged automated results should refresh evidence after 24 hours",
);

assert.equal(
  shouldCollectAutomatedEvidence({
    lastEvidenceAt: null,
    now,
    previousStatus: null,
    resultStatus: "error",
  }),
  false,
  "integration execution errors are not control evidence",
);

console.log("Integration evidence policy smoke test passed.");
