import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const callbackSource = readFileSync("app/api/integrations/microsoft/callback/route.ts", "utf8");
const locksSource = readFileSync("lib/integrations/locks.ts", "utf8");
const runnerSource = readFileSync("lib/integrations/runner.ts", "utf8");

assert.match(
  callbackSource,
  /enqueueMicrosoftFirstRun/,
  "Microsoft callback should explicitly enqueue the first integration run after OAuth succeeds.",
);
assert.match(
  callbackSource,
  /acquireIntegrationFirstRunEnqueueLock/,
  "Microsoft first-run enqueue must acquire a per-org/provider lock before sending Inngest work.",
);
assert.match(
  callbackSource,
  /id:\s*`integration-first-run:\$\{input\.clerkOrgId\}:\$\{provider\}:\$\{input\.integrationId\}`/,
  "Microsoft first-run Inngest event should use a deterministic id for event-level deduplication.",
);
assert.match(
  callbackSource,
  /name:\s*["']integrations\/tests\.run["']/,
  "Microsoft callback should enqueue the integration test runner event.",
);
assert.match(
  callbackSource,
  /provider,\s*\n\s*trigger:\s*["']oauth_callback_first_run["']/,
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
  /status:\s*["']manual_review["']/,
  "Microsoft permission failures from collection must create manual-review integration results.",
);
assert.match(
  runnerSource,
  /blockedReason:\s*["']missing_permission["']/,
  "Microsoft permission failures from collection must map evidence to missing_permission.",
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
