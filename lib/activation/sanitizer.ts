/**
 * Activation event sanitizer.
 *
 * Defense-in-depth guard at the recordActivationEvent boundary. Enforces that
 * only the fields declared in the typed ActivationEvent union reach the audit
 * log. Rejects or strips anything that looks like:
 *   - raw intake answers
 *   - Microsoft Graph / connector API payloads
 *   - secrets (tokens, keys, encrypted blobs)
 *   - file contents or blob URLs
 *   - evidence implementation details (checkLogic, resultData, snapshotData)
 *
 * The sanitizer is intentionally strict: unknown keys on a known event type
 * are rejected so that callers are aware they are passing data that will not
 * be stored.
 */

import type { ActivationEvent, ActivationEventName } from "./events";

// ---------------------------------------------------------------------------
// Allowed metadata keys per event type.
// These must match the ActivationEvent typed union exactly.
// ---------------------------------------------------------------------------

const ALLOWED_METADATA_KEYS: Record<ActivationEventName, ReadonlySet<string>> = {
  IntakeCompleted: new Set(["selectedFrameworks", "selectedTools", "version"]),
  ConnectorRecommended: new Set(["provider", "selectedTools", "source"]),
  ConnectorOAuthStarted: new Set(["provider", "redirectUri"]),
  ConnectorOAuthCompleted: new Set(["provider", "tokenType"]),
  EvidenceCollectionQueued: new Set(["lockEnabled", "provider", "trigger"]),
  EvidenceCollected: new Set([
    "assessmentResult",
    "collectionStatus",
    "controlId",
    "provider",
    "source",
    "testName",
  ]),
  EvidenceBlocked: new Set([
    "blockedReason",
    "collectionStatus",
    "controlId",
    "provider",
    "source",
    "testName",
  ]),
  AssessmentChanged: new Set(["controlId", "nextStatus", "previousStatus", "source"]),
  ManualEvidenceAdded: new Set(["controlId", "controlKey", "evidenceId", "fileType", "source"]),
};

// ---------------------------------------------------------------------------
// Patterns that are always disallowed regardless of event type.
// These cover secrets, raw API payloads, and file contents.
// ---------------------------------------------------------------------------

/**
 * Exact key names that are never allowed in activation event metadata.
 * Covers tokens, secrets, raw payloads, and file contents.
 */
const DENIED_KEYS: ReadonlySet<string> = new Set([
  // Secrets / credentials
  "accessToken",
  "refreshToken",
  "token",
  "secret",
  "password",
  "credential",
  "apiKey",
  "clientSecret",
  "connectionString",
  "privateKey",
  "signingKey",
  "sessionToken",
  "bearerToken",
  // Encrypted blobs
  "accessTokenEnc",
  "refreshTokenEnc",
  "tokenEnc",
  "secretEnc",
  // Raw intake answers
  "answers",
  "intakeAnswers",
  "rawAnswers",
  // Graph / API payloads
  "graphData",
  "graphPayload",
  "graphResponse",
  "apiResponse",
  "rawResult",
  "resultData",
  "snapshotData",
  // Evidence implementation details
  "checkLogic",
  "passCriteria",
  // File contents
  "blobUrl",
  "fileContent",
  "fileBuffer",
  "content",
  "buffer",
  // OAuth internals beyond what typed events allow
  "code",
  "state",
  "nonce",
  "codeVerifier",
  "integrationId",
]);

/**
 * Key suffix patterns that are always disallowed (case-sensitive suffix match).
 * Catches dynamic key names that carry secrets or encrypted data.
 * Note: "Key" alone is too broad (e.g. "controlKey" is a legitimate field).
 * Specific key names are covered by the exact DENIED_KEYS set above.
 */
const DENIED_SUFFIXES: readonly string[] = ["Enc", "Token", "Secret", "Password"];

/**
 * Key prefix patterns that are always disallowed.
 */
const DENIED_PREFIXES: readonly string[] = ["raw", "graph", "api"];

// ---------------------------------------------------------------------------
// Sanitization errors
// ---------------------------------------------------------------------------

export class ActivationEventSanitizationError extends Error {
  constructor(
    public readonly eventName: string,
    public readonly reason: string,
    public readonly offendingKey?: string,
  ) {
    super(
      offendingKey
        ? `Activation event sanitization failed for "${eventName}": ${reason} (key: "${offendingKey}")`
        : `Activation event sanitization failed for "${eventName}": ${reason}`,
    );
    this.name = "ActivationEventSanitizationError";
  }
}

// ---------------------------------------------------------------------------
// Key-level checks
// ---------------------------------------------------------------------------

function isDeniedKey(key: string): boolean {
  if (DENIED_KEYS.has(key)) {
    return true;
  }

  for (const suffix of DENIED_SUFFIXES) {
    if (key.endsWith(suffix) && key !== suffix) {
      return true;
    }
  }

  for (const prefix of DENIED_PREFIXES) {
    if (key.startsWith(prefix) && key !== prefix) {
      return true;
    }
  }

  return false;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Validate and sanitize an activation event before it is written to the audit
 * log. Throws `ActivationEventSanitizationError` if:
 *   - The event name is not in the known set.
 *   - Any metadata key is in the deny-list (secrets, payloads, file contents).
 *   - Any metadata key is not in the allow-list for that event type.
 *
 * Returns the event unchanged when it passes all checks. The function is
 * synchronous and has no side effects — safe to call at any point.
 */
export function sanitizeActivationEvent(event: ActivationEvent): ActivationEvent {
  const allowedKeys = ALLOWED_METADATA_KEYS[event.name];

  // The TypeScript type guarantees event.name is a known value, but at runtime
  // callers may pass unvalidated input, so we guard defensively.
  if (!allowedKeys) {
    throw new ActivationEventSanitizationError(
      String(event.name),
      "unknown activation event name",
    );
  }

  const metadata = event.metadata as Record<string, unknown>;

  for (const key of Object.keys(metadata)) {
    // 1. Hard deny-list: reject globally forbidden keys.
    if (isDeniedKey(key)) {
      throw new ActivationEventSanitizationError(
        event.name,
        "metadata key is on the global deny-list (secret, payload, or file content)",
        key,
      );
    }

    // 2. Per-event allow-list: reject keys that are not declared for this event.
    if (!allowedKeys.has(key)) {
      throw new ActivationEventSanitizationError(
        event.name,
        "metadata key is not in the allowed set for this event type",
        key,
      );
    }
  }

  return event;
}
