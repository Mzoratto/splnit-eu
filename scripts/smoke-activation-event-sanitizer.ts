/**
 * Smoke test for the activation event sanitizer.
 *
 * Run with:
 *   npx tsx scripts/smoke-activation-event-sanitizer.ts
 *
 * Exits 0 if all assertions pass, 1 on any failure.
 *
 * Uses runtime casting (as unknown as ActivationEvent) to exercise the
 * sanitizer's runtime guards — the TypeScript union already rejects bad
 * fields at compile time; these tests verify the runtime defense-in-depth.
 */

import {
  sanitizeActivationEvent,
  ActivationEventSanitizationError,
} from "../lib/activation/sanitizer";
import type { ActivationEvent } from "../lib/activation/events";

let passed = 0;
let failed = 0;

function assert(label: string, fn: () => void) {
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
) {
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

// ---------------------------------------------------------------------------
// PASS cases — valid events should pass through unchanged
// ---------------------------------------------------------------------------

console.log("\nValid events (should all pass):");

assert("IntakeCompleted — valid", () => {
  const event: ActivationEvent = {
    clerkOrgId: "org_test",
    entityId: "org_test",
    entityType: "intake",
    metadata: { selectedFrameworks: ["nis2"], selectedTools: ["microsoft365"], version: 1 },
    name: "IntakeCompleted",
  };
  const result = sanitizeActivationEvent(event);
  if (result !== event) throw new Error("Expected same object reference");
});

assert("ConnectorRecommended — valid", () => {
  const event: ActivationEvent = {
    clerkOrgId: "org_test",
    entityId: "microsoft365",
    entityType: "connector",
    metadata: { provider: "microsoft365", selectedTools: ["microsoft365"], source: "intake" },
    name: "ConnectorRecommended",
  };
  sanitizeActivationEvent(event);
});

assert("ConnectorOAuthStarted — valid", () => {
  const event: ActivationEvent = {
    clerkOrgId: "org_test",
    entityId: "conn_1",
    entityType: "connector",
    metadata: { provider: "microsoft365", redirectUri: "https://example.com/callback" },
    name: "ConnectorOAuthStarted",
  };
  sanitizeActivationEvent(event);
});

assert("ConnectorOAuthCompleted — valid", () => {
  const event: ActivationEvent = {
    clerkOrgId: "org_test",
    entityId: "conn_1",
    entityType: "connector",
    metadata: { provider: "microsoft365", tokenType: "oauth2" },
    name: "ConnectorOAuthCompleted",
  };
  sanitizeActivationEvent(event);
});

assert("EvidenceCollectionQueued — valid", () => {
  const event: ActivationEvent = {
    clerkOrgId: "org_test",
    entityId: "conn_1",
    entityType: "connector",
    metadata: { lockEnabled: true, provider: "microsoft365", trigger: "oauth_callback_first_run" },
    name: "EvidenceCollectionQueued",
  };
  sanitizeActivationEvent(event);
});

assert("EvidenceCollected — valid", () => {
  const event: ActivationEvent = {
    clerkOrgId: "org_test",
    entityId: "ev_1",
    entityType: "evidence",
    metadata: {
      assessmentResult: "pass",
      collectionStatus: "collected",
      controlId: "ctrl_1",
      provider: "microsoft365",
      source: "connector",
      testName: "mfa_enabled",
    },
    name: "EvidenceCollected",
  };
  sanitizeActivationEvent(event);
});

assert("EvidenceBlocked — valid", () => {
  const event: ActivationEvent = {
    clerkOrgId: "org_test",
    entityId: "ev_1",
    entityType: "evidence",
    metadata: {
      blockedReason: "missing_permission",
      collectionStatus: "blocked",
      controlId: "ctrl_1",
      provider: "microsoft365",
      source: "connector",
      testName: "mfa_enabled",
    },
    name: "EvidenceBlocked",
  };
  sanitizeActivationEvent(event);
});

assert("AssessmentChanged — valid (manual)", () => {
  const event: ActivationEvent = {
    clerkOrgId: "org_test",
    clerkUserId: "user_1",
    entityId: "ctrl_1",
    entityType: "assessment",
    metadata: { controlId: "ctrl_1", nextStatus: "compliant", previousStatus: null, source: "manual_status" },
    name: "AssessmentChanged",
  };
  sanitizeActivationEvent(event);
});

assert("ManualEvidenceAdded — valid", () => {
  const event: ActivationEvent = {
    clerkOrgId: "org_test",
    clerkUserId: "user_1",
    entityId: "ev_1",
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
  sanitizeActivationEvent(event);
});

// ---------------------------------------------------------------------------
// REJECT cases — disallowed data should throw at runtime.
// Uses `as unknown as ActivationEvent` to bypass the TypeScript union and
// exercise the runtime guards — the sanitizer is the last line of defense
// for callers who bypass type checking (JS consumers, JSON deserialization).
// ---------------------------------------------------------------------------

console.log("\nForbidden data (should all throw — runtime guards):");

assertThrows(
  "Rejects raw intake answers (answers key)",
  () => {
    sanitizeActivationEvent({
      clerkOrgId: "org_test",
      entityId: "org_test",
      entityType: "intake",
      metadata: { selectedFrameworks: ["nis2"], selectedTools: [], version: 1, answers: { q1: "yes" } },
      name: "IntakeCompleted",
    } as unknown as ActivationEvent);
  },
  '"answers"',
);

assertThrows(
  "Rejects accessToken secret",
  () => {
    sanitizeActivationEvent({
      clerkOrgId: "org_test",
      entityId: "conn_1",
      entityType: "connector",
      metadata: { provider: "microsoft365", tokenType: "oauth2", accessToken: "secret" },
      name: "ConnectorOAuthCompleted",
    } as unknown as ActivationEvent);
  },
  '"accessToken"',
);

assertThrows(
  "Rejects refreshToken secret",
  () => {
    sanitizeActivationEvent({
      clerkOrgId: "org_test",
      entityId: "conn_1",
      entityType: "connector",
      metadata: { provider: "microsoft365", tokenType: "oauth2", refreshToken: "secret" },
      name: "ConnectorOAuthCompleted",
    } as unknown as ActivationEvent);
  },
  '"refreshToken"',
);

assertThrows(
  "Rejects resultData (Graph/API payload)",
  () => {
    sanitizeActivationEvent({
      clerkOrgId: "org_test",
      entityId: "ev_1",
      entityType: "evidence",
      metadata: {
        assessmentResult: "pass",
        collectionStatus: "collected",
        controlId: "ctrl_1",
        provider: "microsoft365",
        source: "connector",
        testName: "mfa_enabled",
        resultData: { raw: "graph payload" },
      },
      name: "EvidenceCollected",
    } as unknown as ActivationEvent);
  },
  '"resultData"',
);

assertThrows(
  "Rejects snapshotData (evidence implementation detail)",
  () => {
    sanitizeActivationEvent({
      clerkOrgId: "org_test",
      entityId: "ev_1",
      entityType: "evidence",
      metadata: {
        assessmentResult: "pass",
        collectionStatus: "collected",
        controlId: "ctrl_1",
        provider: "microsoft365",
        source: "connector",
        testName: "mfa_enabled",
        snapshotData: { checkLogic: "...", integrationId: "int_1" },
      },
      name: "EvidenceCollected",
    } as unknown as ActivationEvent);
  },
  '"snapshotData"',
);

assertThrows(
  "Rejects checkLogic (evidence implementation detail)",
  () => {
    sanitizeActivationEvent({
      clerkOrgId: "org_test",
      entityId: "ev_1",
      entityType: "evidence",
      metadata: {
        assessmentResult: "pass",
        collectionStatus: "collected",
        controlId: "ctrl_1",
        provider: "microsoft365",
        source: "connector",
        testName: "mfa_enabled",
        checkLogic: "const x = ...;",
      },
      name: "EvidenceCollected",
    } as unknown as ActivationEvent);
  },
  '"checkLogic"',
);

assertThrows(
  "Rejects blobUrl (file content pointer)",
  () => {
    sanitizeActivationEvent({
      clerkOrgId: "org_test",
      clerkUserId: "user_1",
      entityId: "ev_1",
      entityType: "evidence",
      metadata: {
        controlId: "ctrl_1",
        controlKey: "nis2-mfa",
        evidenceId: "ev_1",
        fileType: "application/pdf",
        source: "manual",
        blobUrl: "https://blob.vercel-storage.com/...",
      },
      name: "ManualEvidenceAdded",
    } as unknown as ActivationEvent);
  },
  '"blobUrl"',
);

assertThrows(
  "Rejects suffix-based secret (accessTokenEnc)",
  () => {
    sanitizeActivationEvent({
      clerkOrgId: "org_test",
      entityId: "conn_1",
      entityType: "connector",
      metadata: { provider: "microsoft365", tokenType: "oauth2", accessTokenEnc: "encrypted" },
      name: "ConnectorOAuthCompleted",
    } as unknown as ActivationEvent);
  },
  '"accessTokenEnc"',
);

assertThrows(
  "Rejects prefix-based payload key (graphData)",
  () => {
    sanitizeActivationEvent({
      clerkOrgId: "org_test",
      entityId: "ev_1",
      entityType: "evidence",
      metadata: {
        assessmentResult: "pass",
        collectionStatus: "collected",
        controlId: "ctrl_1",
        provider: "microsoft365",
        source: "connector",
        testName: "mfa_enabled",
        graphData: { users: [] },
      },
      name: "EvidenceCollected",
    } as unknown as ActivationEvent);
  },
  '"graphData"',
);

assertThrows(
  "Rejects unknown extra key not in per-event allow-list",
  () => {
    sanitizeActivationEvent({
      clerkOrgId: "org_test",
      entityId: "conn_1",
      entityType: "connector",
      metadata: { provider: "microsoft365", tokenType: "oauth2", extraField: "value" },
      name: "ConnectorOAuthCompleted",
    } as unknown as ActivationEvent);
  },
  '"extraField"',
);

assertThrows(
  "Rejects unknown event name at runtime",
  () => {
    sanitizeActivationEvent({
      clerkOrgId: "org_test",
      entityId: "x",
      entityType: "connector",
      metadata: {},
      name: "UnknownEvent",
    } as unknown as ActivationEvent);
  },
  "unknown activation event name",
);

assertThrows(
  "Error is ActivationEventSanitizationError instance",
  () => {
    try {
      sanitizeActivationEvent({
        clerkOrgId: "org_test",
        entityId: "conn_1",
        entityType: "connector",
        metadata: { provider: "microsoft365", tokenType: "oauth2", accessToken: "secret" },
        name: "ConnectorOAuthCompleted",
      } as unknown as ActivationEvent);
    } catch (err) {
      if (!(err instanceof ActivationEventSanitizationError)) {
        throw new Error(`Expected ActivationEventSanitizationError, got ${err?.constructor?.name}`);
      }
      if (err.eventName !== "ConnectorOAuthCompleted") {
        throw new Error(`Expected eventName "ConnectorOAuthCompleted", got "${err.eventName}"`);
      }
      if (err.offendingKey !== "accessToken") {
        throw new Error(`Expected offendingKey "accessToken", got "${err.offendingKey}"`);
      }
      throw err; // re-throw so assertThrows sees it
    }
  },
  '"accessToken"',
);

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`\n${passed + failed} assertions: ${passed} passed, ${failed} failed.\n`);

if (failed > 0) {
  process.exit(1);
}
