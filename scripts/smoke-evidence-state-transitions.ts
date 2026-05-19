import { strict as assert } from "node:assert";
import { createEvidenceState } from "../lib/activation/evidence-state";

const lastCollectedAt = new Date("2026-05-19T09:00:00.000Z");

const previouslyPassingConnectorNowBlocked = createEvidenceState({
  assessment_result: "pass",
  blocked_reason: "missing_permission",
  collected_at: lastCollectedAt,
  collection_status: "blocked",
  source: "connector",
});

assert.equal(
  previouslyPassingConnectorNowBlocked.collection_status,
  "blocked",
  "connector evidence should expose the current blocked collection state",
);
assert.equal(
  previouslyPassingConnectorNowBlocked.assessment_result,
  "pass",
  "blocked collection state must preserve the last known passing assessment result",
);
assert.equal(
  previouslyPassingConnectorNowBlocked.collected_at,
  lastCollectedAt,
  "blocked collection state must preserve the timestamp of the last known result",
);
assert.equal(
  previouslyPassingConnectorNowBlocked.blocked_reason,
  "missing_permission",
  "blocked connector evidence should keep the concrete blocked reason",
);
assert.equal(
  previouslyPassingConnectorNowBlocked.confidence,
  "high",
  "connector evidence should keep the source confidence default while blocked",
);

const previouslyGapConnectorNowBlocked = createEvidenceState({
  assessment_result: "gap",
  blocked_reason: "collection_failed",
  collected_at: lastCollectedAt,
  collection_status: "blocked",
  source: "connector",
});

assert.equal(
  previouslyGapConnectorNowBlocked.collection_status,
  "blocked",
  "connector evidence should separately model blocked collection for gap results",
);
assert.equal(
  previouslyGapConnectorNowBlocked.assessment_result,
  "gap",
  "blocked collection state must preserve the last known gap assessment result",
);
assert.equal(
  previouslyGapConnectorNowBlocked.collected_at,
  lastCollectedAt,
  "blocked collection state must not erase the last gap result timestamp",
);
assert.equal(
  previouslyGapConnectorNowBlocked.blocked_reason,
  "collection_failed",
  "blocked gap evidence should keep the connector failure reason",
);

console.log("Evidence state transition smoke test passed.");
