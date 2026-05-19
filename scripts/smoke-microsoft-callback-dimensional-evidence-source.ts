import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("app/api/integrations/microsoft/callback/route.ts", "utf8");

assert.match(
  source,
  /createPendingMicrosoftEvidence/,
  "Microsoft callback should create pending connector evidence after OAuth succeeds.",
);

for (const field of [
  "assessmentResult",
  "collectionStatus",
  "source",
  "confidence",
  "collectedAt",
  "blockedReason",
]) {
  assert.match(
    source,
    new RegExp(`\\b${field}\\s*:`),
    `Microsoft callback evidence insert should write ${field} explicitly.`,
  );
}

assert.doesNotMatch(
  source,
  /\bstatus\s*:\s*["'](?:pass|fail|warning|manual_review|not_applicable|unknown|error)["']/,
  "Microsoft callback should not write the old flat evidence status enum.",
);
assert.doesNotMatch(
  source,
  /\bexpiresAt\s*:/,
  "Microsoft callback should not write legacy evidence expiry fields.",
);

console.log("Microsoft callback dimensional evidence source smoke passed");
