import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const callbackSource = readFileSync("app/api/integrations/microsoft/callback/route.ts", "utf8");
const evidenceSource = readFileSync("lib/integrations/evidence.ts", "utf8");
const firstRunEnqueueSource = readFileSync("lib/integrations/first-run-enqueue.ts", "utf8");
const locksSource = readFileSync("lib/integrations/locks.ts", "utf8");
const runnerSource = readFileSync("lib/integrations/runner.ts", "utf8");

assert.match(
  callbackSource,
  /enqueueIntegrationFirstRun/,
  "Microsoft callback should explicitly enqueue the first integration run after OAuth succeeds.",
);
assert.match(
  firstRunEnqueueSource,
  /acquireIntegrationFirstRunEnqueueLock/,
  "Microsoft first-run enqueue must acquire a per-org/provider lock before sending Inngest work.",
);
assert.match(
  firstRunEnqueueSource,
  /id:\s*`integration-first-run:\$\{input\.clerkOrgId\}:\$\{input\.provider\}:\$\{input\.integrationId\}`/,
  "Microsoft first-run Inngest event should use a deterministic id for event-level deduplication.",
);
assert.match(
  firstRunEnqueueSource,
  /name:\s*["']integrations\/tests\.run["']/,
  "Microsoft callback should enqueue the integration test runner event.",
);
assert.match(
  firstRunEnqueueSource,
  /provider:\s*input\.provider,\s*\n\s*trigger:\s*(?:input\.trigger\s*\?\?\s*)?["']oauth_callback_first_run["']/,
  "Microsoft first-run event data should scope the run to Microsoft 365 and mark the OAuth first-run trigger.",
);
assert.match(
  locksSource,
  /integration-first-run-enqueue:\$\{input\.clerkOrgId\}:\$\{input\.provider\}/,
  "First-run enqueue lock must be keyed by organisation and provider.",
);
assert.match(
  locksSource,
  /nx:\s*true/,
  "First-run enqueue lock must use Redis NX semantics to reject duplicate callbacks.",
);

assert.match(
  runnerSource,
  /statusCode === 401 \|\| statusCode === 403 \|\| statusCode === 404/,
  "Microsoft runner errors must classify 401/403/404 Graph failures as permission failures.",
);
assert.match(
  runnerSource,
  /status:\s*["']error["']/,
  "Microsoft permission failures from collection must create error integration results while evidence remains unknown and blocked.",
);
assert.match(
  runnerSource,
  /blockedReason:\s*["']missing_permission["']/,
  "Microsoft permission failures from collection must map evidence to missing_permission.",
);
assert.match(
  runnerSource,
  /shouldCreateErrorEvidence/,
  "Microsoft retryable collection failures must not blindly create new evidence.",
);
assert.match(
  evidenceSource,
  /blockedReason === ["']missing_permission["']/,
  "Missing-permission error results should still collect an evidence snapshot.",
);
assert.match(
  evidenceSource,
  /assessment_result:\s*["']unknown["'][\s\S]*blocked_reason:\s*["']missing_permission["'][\s\S]*collection_status:\s*["']blocked["']/,
  "Missing-permission evidence must be unknown + blocked instead of manual_review.",
);
assert.match(
  runnerSource,
  /statusCode === 429 \|\| \(statusCode !== null && statusCode >= 500\)/,
  "Microsoft runner errors must classify 429/5xx Graph failures as retryable collection failures.",
);
assert.match(
  runnerSource,
  /status:\s*["']error["']/,
  "Microsoft retryable collection failures must create error integration results.",
);

console.log("Microsoft first-run enqueue source smoke passed");
