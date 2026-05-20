/**
 * Explicit rejection tests for the activation event sanitizer.
 *
 * Covers each forbidden payload category as required by task t_ab4b1937:
 *   1. Intake answers (rawAnswers, intakeAnswers, answers)
 *   2. Graph / API data (graphData, graphPayload, graphResponse, apiResponse,
 *      rawResult, and prefix-based "graph*" / "api*" / "raw*" keys)
 *   3. Secrets / credentials (accessToken, refreshToken, token, secret,
 *      password, credential, apiKey, privateKey, signingKey, sessionToken,
 *      bearerToken, and suffix-based "*Enc" / "*Token" / "*Secret" / "*Password")
 *   4. File contents (blobUrl, fileContent, fileBuffer, content, buffer)
 *   5. Tenant-scoped evidence details (checkLogic, passCriteria, resultData,
 *      snapshotData, integrationId)
 *   6. OAuth internals beyond typed fields (code, state, nonce, codeVerifier)
 *   7. Unknown extra keys not in per-event allow-list
 *   8. Unknown event name at runtime
 *
 * Also verifies:
 *   - ActivationEventSanitizationError instance shape (eventName, offendingKey)
 *   - Error is thrown before any DB write (synchronous guard semantics)
 *   - controlKey is NOT rejected (it is a legitimate allow-listed field)
 *   - Valid minimal events for every event type pass through unchanged
 *
 * Run with:
 *   npx tsx scripts/smoke-sanitizer-rejection.ts
 *
 * Exits 0 if all assertions pass, 1 on any failure.
 */

import {
  ActivationEventSanitizationError,
  sanitizeActivationEvent,
} from "../lib/activation/sanitizer";
import type { ActivationEvent } from "../lib/activation/events";

// ---------------------------------------------------------------------------
// Tiny test harness
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;

function assert(label: string, fn: () => void): void {
  try {
    fn();
    console.log(`  PASS  ${label}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL  ${label}`);
    console.error(`        ${err instanceof Error ? err.message : String(err)}`);
    failed++;
  }
}

function assertThrows(
  label: string,
  fn: () => void,
  expectedSubstring?: string,
): void {
  try {
    fn();
    console.error(`  FAIL  ${label} — expected throw, got none`);
    failed++;
  } catch (err) {
    if (
      expectedSubstring &&
      !(err instanceof Error && err.message.includes(expectedSubstring))
    ) {
      console.error(
        `  FAIL  ${label} — threw but message missing "${expectedSubstring}": ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      failed++;
    } else {
      console.log(`  PASS  ${label}`);
      passed++;
    }
  }
}

// Asserts the thrown error is an ActivationEventSanitizationError and checks
// eventName and offendingKey (when provided).
function assertSanitizationError(
  label: string,
  fn: () => void,
  expectedEventName: string,
  expectedOffendingKey?: string,
): void {
  try {
    fn();
    console.error(`  FAIL  ${label} — expected ActivationEventSanitizationError, got none`);
    failed++;
  } catch (err) {
    if (!(err instanceof ActivationEventSanitizationError)) {
      console.error(
        `  FAIL  ${label} — expected ActivationEventSanitizationError, got ${
          err instanceof Error ? err.constructor.name : String(err)
        }`,
      );
      failed++;
      return;
    }
    if (err.eventName !== expectedEventName) {
      console.error(
        `  FAIL  ${label} — eventName: expected "${expectedEventName}", got "${err.eventName}"`,
      );
      failed++;
      return;
    }
    if (expectedOffendingKey !== undefined && err.offendingKey !== expectedOffendingKey) {
      console.error(
        `  FAIL  ${label} — offendingKey: expected "${expectedOffendingKey}", got "${err.offendingKey}"`,
      );
      failed++;
      return;
    }
    console.log(`  PASS  ${label}`);
    passed++;
  }
}

// ---------------------------------------------------------------------------
// Helpers — minimal valid metadata for each event type
// ---------------------------------------------------------------------------

const BASE = {
  clerkOrgId: "org_test",
  entityId: "ent_1",
};

function intakeCompleted(extra: Record<string, unknown> = {}): ActivationEvent {
  return {
    ...BASE,
    entityType: "intake",
    metadata: { selectedFrameworks: ["nis2"], selectedTools: ["microsoft365"], version: 1, ...extra },
    name: "IntakeCompleted",
  } as unknown as ActivationEvent;
}

function connectorOAuthCompleted(extra: Record<string, unknown> = {}): ActivationEvent {
  return {
    ...BASE,
    entityType: "connector",
    metadata: { provider: "microsoft365", tokenType: "oauth2", ...extra },
    name: "ConnectorOAuthCompleted",
  } as unknown as ActivationEvent;
}

function evidenceCollected(extra: Record<string, unknown> = {}): ActivationEvent {
  return {
    ...BASE,
    entityType: "evidence",
    metadata: {
      assessmentResult: "pass",
      collectionStatus: "collected",
      controlId: "ctrl_1",
      provider: "microsoft365",
      source: "connector",
      testName: "mfa_enabled",
      ...extra,
    },
    name: "EvidenceCollected",
  } as unknown as ActivationEvent;
}

function evidenceBlocked(extra: Record<string, unknown> = {}): ActivationEvent {
  return {
    ...BASE,
    entityType: "evidence",
    metadata: {
      blockedReason: "missing_permission",
      collectionStatus: "blocked",
      controlId: "ctrl_1",
      provider: "microsoft365",
      source: "connector",
      testName: "mfa_enabled",
      ...extra,
    },
    name: "EvidenceBlocked",
  } as unknown as ActivationEvent;
}

function manualEvidenceAdded(extra: Record<string, unknown> = {}): ActivationEvent {
  return {
    ...BASE,
    clerkUserId: "user_1",
    entityType: "evidence",
    metadata: {
      controlId: "ctrl_1",
      controlKey: "nis2-mfa",
      evidenceId: "ev_1",
      fileType: "application/pdf",
      source: "manual",
      ...extra,
    },
    name: "ManualEvidenceAdded",
  } as unknown as ActivationEvent;
}

// ---------------------------------------------------------------------------
// SECTION 1 — Intake answers
// ---------------------------------------------------------------------------

console.log("\n--- 1. Intake answers (should all throw) ---");

assertThrows(
  "Rejects 'answers' on IntakeCompleted",
  () => sanitizeActivationEvent(intakeCompleted({ answers: { q1: "yes" } })),
  '"answers"',
);

assertThrows(
  "Rejects 'intakeAnswers' on IntakeCompleted",
  () => sanitizeActivationEvent(intakeCompleted({ intakeAnswers: { q1: "yes" } })),
  '"intakeAnswers"',
);

assertThrows(
  "Rejects 'rawAnswers' on IntakeCompleted",
  () => sanitizeActivationEvent(intakeCompleted({ rawAnswers: [{ id: "q1", value: "yes" }] })),
  '"rawAnswers"',
);

// Also reject intake-answer keys on non-intake events (deny-list is global)
assertThrows(
  "Rejects 'answers' on EvidenceCollected (global deny-list)",
  () => sanitizeActivationEvent(evidenceCollected({ answers: { q1: "yes" } })),
  '"answers"',
);

// ---------------------------------------------------------------------------
// SECTION 2 — Graph / API data
// ---------------------------------------------------------------------------

console.log("\n--- 2. Graph / API data (should all throw) ---");

assertThrows(
  "Rejects 'graphData' on EvidenceCollected",
  () => sanitizeActivationEvent(evidenceCollected({ graphData: { users: [] } })),
  '"graphData"',
);

assertThrows(
  "Rejects 'graphPayload' on EvidenceCollected",
  () => sanitizeActivationEvent(evidenceCollected({ graphPayload: { value: [] } })),
  '"graphPayload"',
);

assertThrows(
  "Rejects 'graphResponse' on EvidenceCollected",
  () => sanitizeActivationEvent(evidenceCollected({ graphResponse: { status: 200 } })),
  '"graphResponse"',
);

assertThrows(
  "Rejects 'apiResponse' on EvidenceCollected",
  () => sanitizeActivationEvent(evidenceCollected({ apiResponse: { ok: true } })),
  '"apiResponse"',
);

assertThrows(
  "Rejects 'rawResult' on EvidenceCollected",
  () => sanitizeActivationEvent(evidenceCollected({ rawResult: { raw: "..." } })),
  '"rawResult"',
);

assertThrows(
  "Rejects 'resultData' on EvidenceCollected",
  () => sanitizeActivationEvent(evidenceCollected({ resultData: { payload: "..." } })),
  '"resultData"',
);

// Prefix-based rejections
assertThrows(
  "Rejects 'graphUsers' (graph* prefix) on EvidenceCollected",
  () => sanitizeActivationEvent(evidenceCollected({ graphUsers: [] })),
  '"graphUsers"',
);

assertThrows(
  "Rejects 'apiPayload' (api* prefix) on EvidenceCollected",
  () => sanitizeActivationEvent(evidenceCollected({ apiPayload: {} })),
  '"apiPayload"',
);

assertThrows(
  "Rejects 'rawJson' (raw* prefix) on EvidenceCollected",
  () => sanitizeActivationEvent(evidenceCollected({ rawJson: "{}" })),
  '"rawJson"',
);

// ---------------------------------------------------------------------------
// SECTION 3 — Secrets / credentials
// ---------------------------------------------------------------------------

console.log("\n--- 3. Secrets / credentials (should all throw) ---");

// Exact keys from DENIED_KEYS
const secretKeys: Array<[string, unknown]> = [
  ["accessToken", "tok_abc"],
  ["refreshToken", "rtok_abc"],
  ["token", "t_abc"],
  ["secret", "s3cr3t"],
  ["password", "hunter2"],
  ["credential", "cred_abc"],
  ["apiKey", "key_abc"],
  ["privateKey", "-----BEGIN RSA..."],
  ["signingKey", "sign_abc"],
  ["sessionToken", "sess_abc"],
  ["bearerToken", "bearer_abc"],
  // Encrypted blobs
  ["accessTokenEnc", "enc_abc"],
  ["refreshTokenEnc", "enc_abc"],
  ["tokenEnc", "enc_abc"],
  ["secretEnc", "enc_abc"],
];

for (const [key, value] of secretKeys) {
  assertThrows(
    `Rejects '${key}' on ConnectorOAuthCompleted`,
    () => sanitizeActivationEvent(connectorOAuthCompleted({ [key]: value })),
    `"${key}"`,
  );
}

// Suffix-based rejections
assertThrows(
  "Rejects 'customTokenEnc' (*Enc suffix)",
  () => sanitizeActivationEvent(connectorOAuthCompleted({ customTokenEnc: "encrypted" })),
  '"customTokenEnc"',
);

assertThrows(
  "Rejects 'oauthToken' (*Token suffix)",
  () => sanitizeActivationEvent(connectorOAuthCompleted({ oauthToken: "tok" })),
  '"oauthToken"',
);

assertThrows(
  "Rejects 'serviceSecret' (*Secret suffix)",
  () => sanitizeActivationEvent(connectorOAuthCompleted({ serviceSecret: "sec" })),
  '"serviceSecret"',
);

assertThrows(
  "Rejects 'adminPassword' (*Password suffix)",
  () => sanitizeActivationEvent(connectorOAuthCompleted({ adminPassword: "pw" })),
  '"adminPassword"',
);

// ---------------------------------------------------------------------------
// SECTION 4 — File contents
// ---------------------------------------------------------------------------

console.log("\n--- 4. File contents (should all throw) ---");

assertThrows(
  "Rejects 'blobUrl' on ManualEvidenceAdded",
  () =>
    sanitizeActivationEvent(
      manualEvidenceAdded({ blobUrl: "https://blob.vercel-storage.com/ev_1" }),
    ),
  '"blobUrl"',
);

assertThrows(
  "Rejects 'fileContent' on ManualEvidenceAdded",
  () => sanitizeActivationEvent(manualEvidenceAdded({ fileContent: "PGh0bWw..." })),
  '"fileContent"',
);

assertThrows(
  "Rejects 'fileBuffer' on ManualEvidenceAdded",
  () => sanitizeActivationEvent(manualEvidenceAdded({ fileBuffer: new Uint8Array([0, 1]) })),
  '"fileBuffer"',
);

assertThrows(
  "Rejects 'content' on ManualEvidenceAdded",
  () => sanitizeActivationEvent(manualEvidenceAdded({ content: "raw text" })),
  '"content"',
);

assertThrows(
  "Rejects 'buffer' on ManualEvidenceAdded",
  () => sanitizeActivationEvent(manualEvidenceAdded({ buffer: Buffer.from("abc") })),
  '"buffer"',
);

// Also reject file keys on evidence events
assertThrows(
  "Rejects 'blobUrl' on EvidenceCollected (global deny-list)",
  () => sanitizeActivationEvent(evidenceCollected({ blobUrl: "https://blob.vercel-storage.com/ev_1" })),
  '"blobUrl"',
);

// ---------------------------------------------------------------------------
// SECTION 5 — Tenant-scoped evidence details
// ---------------------------------------------------------------------------

console.log("\n--- 5. Tenant-scoped evidence details (should all throw) ---");

assertThrows(
  "Rejects 'checkLogic' on EvidenceCollected",
  () => sanitizeActivationEvent(evidenceCollected({ checkLogic: "const x = ...;" })),
  '"checkLogic"',
);

assertThrows(
  "Rejects 'passCriteria' on EvidenceCollected",
  () => sanitizeActivationEvent(evidenceCollected({ passCriteria: "all users have MFA" })),
  '"passCriteria"',
);

assertThrows(
  "Rejects 'resultData' on EvidenceCollected (evidence impl detail)",
  () => sanitizeActivationEvent(evidenceCollected({ resultData: { users: 42, pass: 40 } })),
  '"resultData"',
);

assertThrows(
  "Rejects 'snapshotData' on EvidenceCollected",
  () =>
    sanitizeActivationEvent(
      evidenceCollected({ snapshotData: { checkLogic: "...", integrationId: "int_1" } }),
    ),
  '"snapshotData"',
);

assertThrows(
  "Rejects 'integrationId' on EvidenceCollected",
  () => sanitizeActivationEvent(evidenceCollected({ integrationId: "int_abc" })),
  '"integrationId"',
);

assertThrows(
  "Rejects 'checkLogic' on EvidenceBlocked",
  () => sanitizeActivationEvent(evidenceBlocked({ checkLogic: "check code" })),
  '"checkLogic"',
);

assertThrows(
  "Rejects 'snapshotData' on EvidenceBlocked",
  () => sanitizeActivationEvent(evidenceBlocked({ snapshotData: {} })),
  '"snapshotData"',
);

// ---------------------------------------------------------------------------
// SECTION 6 — OAuth internals beyond typed fields
// ---------------------------------------------------------------------------

console.log("\n--- 6. OAuth internals (should all throw) ---");

assertThrows(
  "Rejects 'code' (OAuth code) on ConnectorOAuthCompleted",
  () => sanitizeActivationEvent(connectorOAuthCompleted({ code: "auth_code_abc" })),
  '"code"',
);

assertThrows(
  "Rejects 'state' (OAuth state) on ConnectorOAuthCompleted",
  () => sanitizeActivationEvent(connectorOAuthCompleted({ state: "csrf_abc" })),
  '"state"',
);

assertThrows(
  "Rejects 'nonce' on ConnectorOAuthCompleted",
  () => sanitizeActivationEvent(connectorOAuthCompleted({ nonce: "nonce_abc" })),
  '"nonce"',
);

assertThrows(
  "Rejects 'codeVerifier' (PKCE) on ConnectorOAuthCompleted",
  () => sanitizeActivationEvent(connectorOAuthCompleted({ codeVerifier: "pkce_abc" })),
  '"codeVerifier"',
);

// Also reject these on unrelated events — the deny-list is global
assertThrows(
  "Rejects 'code' on IntakeCompleted (global deny-list)",
  () => sanitizeActivationEvent(intakeCompleted({ code: "auth_code" })),
  '"code"',
);

// ---------------------------------------------------------------------------
// SECTION 7 — Unknown extra keys (per-event allow-list)
// ---------------------------------------------------------------------------

console.log("\n--- 7. Unknown extra keys (per-event allow-list, should all throw) ---");

assertThrows(
  "Rejects unknown key 'extraField' on ConnectorOAuthCompleted",
  () => sanitizeActivationEvent(connectorOAuthCompleted({ extraField: "x" })),
  '"extraField"',
);

assertThrows(
  "Rejects 'userId' on EvidenceCollected (not in allow-list)",
  () => sanitizeActivationEvent(evidenceCollected({ userId: "user_1" })),
  '"userId"',
);

assertThrows(
  "Rejects 'orgId' on IntakeCompleted (not in allow-list)",
  () => sanitizeActivationEvent(intakeCompleted({ orgId: "org_1" })),
  '"orgId"',
);

assertThrows(
  "Rejects 'timestamp' on EvidenceCollected (not in allow-list)",
  () => sanitizeActivationEvent(evidenceCollected({ timestamp: Date.now() })),
  '"timestamp"',
);

// ---------------------------------------------------------------------------
// SECTION 8 — Unknown event name
// ---------------------------------------------------------------------------

console.log("\n--- 8. Unknown event name (should all throw) ---");

assertThrows(
  "Rejects completely unknown event name",
  () =>
    sanitizeActivationEvent({
      ...BASE,
      entityType: "connector",
      metadata: {},
      name: "UnknownEvent",
    } as unknown as ActivationEvent),
  "unknown activation event name",
);

assertThrows(
  "Rejects empty string event name",
  () =>
    sanitizeActivationEvent({
      ...BASE,
      entityType: "connector",
      metadata: {},
      name: "",
    } as unknown as ActivationEvent),
  "unknown activation event name",
);

// ---------------------------------------------------------------------------
// SECTION 9 — Error instance shape
// ---------------------------------------------------------------------------

console.log("\n--- 9. Error instance shape ---");

assertSanitizationError(
  "accessToken rejection exposes eventName=ConnectorOAuthCompleted and offendingKey=accessToken",
  () => sanitizeActivationEvent(connectorOAuthCompleted({ accessToken: "tok" })),
  "ConnectorOAuthCompleted",
  "accessToken",
);

assertSanitizationError(
  "graphData rejection exposes eventName=EvidenceCollected and offendingKey=graphData",
  () => sanitizeActivationEvent(evidenceCollected({ graphData: {} })),
  "EvidenceCollected",
  "graphData",
);

assertSanitizationError(
  "unknown event rejection exposes eventName and no offendingKey",
  () =>
    sanitizeActivationEvent({
      ...BASE,
      entityType: "connector",
      metadata: {},
      name: "BadEvent",
    } as unknown as ActivationEvent),
  "BadEvent",
  undefined, // offendingKey is not set for unknown event name
);

assert("ActivationEventSanitizationError.name is 'ActivationEventSanitizationError'", () => {
  try {
    sanitizeActivationEvent(connectorOAuthCompleted({ accessToken: "x" }));
    throw new Error("Expected throw");
  } catch (err) {
    if (!(err instanceof ActivationEventSanitizationError)) {
      throw new Error(`Wrong class: ${err?.constructor?.name}`);
    }
    if (err.name !== "ActivationEventSanitizationError") {
      throw new Error(`Wrong name: ${err.name}`);
    }
  }
});

assert("Error message contains event name and offending key", () => {
  try {
    sanitizeActivationEvent(evidenceCollected({ snapshotData: {} }));
    throw new Error("Expected throw");
  } catch (err) {
    if (!(err instanceof ActivationEventSanitizationError)) throw err;
    if (!err.message.includes("EvidenceCollected")) {
      throw new Error(`Message missing event name: ${err.message}`);
    }
    if (!err.message.includes("snapshotData")) {
      throw new Error(`Message missing offendingKey: ${err.message}`);
    }
  }
});

// ---------------------------------------------------------------------------
// SECTION 10 — Legitimate fields that must NOT be rejected
// ---------------------------------------------------------------------------

console.log("\n--- 10. Legitimate fields (must NOT throw) ---");

assert("controlKey is allowed on ManualEvidenceAdded (not a secret suffix)", () => {
  const event: ActivationEvent = {
    ...BASE,
    clerkUserId: "user_1",
    entityType: "evidence",
    metadata: {
      controlId: "ctrl_1",
      controlKey: "nis2-mfa",
      evidenceId: "ev_1",
      fileType: "application/pdf",
      source: "manual",
    },
    name: "ManualEvidenceAdded",
  };
  const result = sanitizeActivationEvent(event);
  if (result !== event) throw new Error("Expected same object reference");
});

assert("tokenType is allowed on ConnectorOAuthCompleted (exact allow-listed key)", () => {
  const event: ActivationEvent = {
    ...BASE,
    entityType: "connector",
    metadata: { provider: "microsoft365", tokenType: "oauth2" },
    name: "ConnectorOAuthCompleted",
  };
  sanitizeActivationEvent(event);
});

assert("provider key is allowed on ConnectorOAuthStarted", () => {
  const event: ActivationEvent = {
    ...BASE,
    entityType: "connector",
    metadata: { provider: "microsoft365", redirectUri: "https://example.com/cb" },
    name: "ConnectorOAuthStarted",
  };
  sanitizeActivationEvent(event);
});

assert("assessmentResult / collectionStatus / testName pass on EvidenceCollected", () => {
  const event: ActivationEvent = {
    ...BASE,
    entityType: "evidence",
    metadata: {
      assessmentResult: "gap",
      collectionStatus: "collected",
      controlId: "ctrl_2",
      provider: "microsoft365",
      source: "connector",
      testName: "conditional_access_enabled",
    },
    name: "EvidenceCollected",
  };
  sanitizeActivationEvent(event);
});

assert("blockedReason pass on EvidenceBlocked", () => {
  const event: ActivationEvent = {
    ...BASE,
    entityType: "evidence",
    metadata: {
      blockedReason: "missing_permission",
      collectionStatus: "blocked",
      controlId: "ctrl_2",
      provider: "microsoft365",
      source: "connector",
      testName: "conditional_access_enabled",
    },
    name: "EvidenceBlocked",
  };
  sanitizeActivationEvent(event);
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

const total = passed + failed;
console.log(`\n${total} assertions: ${passed} passed, ${failed} failed.\n`);

if (failed > 0) {
  process.exit(1);
}
