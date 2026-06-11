import { describe, expect, it } from "vitest";
import type { ActivationEvent } from "@/lib/activation/events";
import {
  ActivationEventSanitizationError,
  sanitizeActivationEvent,
} from "@/lib/activation/sanitizer";

function buildEvent(metadata: Record<string, unknown>): ActivationEvent {
  return {
    clerkOrgId: "org_1",
    entityId: "evidence_1",
    entityType: "evidence",
    metadata,
    name: "EvidenceCollected",
  } as ActivationEvent;
}

const VALID_METADATA = {
  assessmentResult: "pass",
  collectionStatus: "collected",
  controlId: "control_1",
  provider: "microsoft365",
  source: "connector",
  testName: "MFA enforced",
};

describe("sanitizeActivationEvent", () => {
  it("passes valid events through unchanged", () => {
    const event = buildEvent(VALID_METADATA);
    expect(sanitizeActivationEvent(event)).toBe(event);
  });

  it("rejects unknown event names", () => {
    const event = {
      ...buildEvent(VALID_METADATA),
      name: "TotallyMadeUp",
    } as unknown as ActivationEvent;

    expect(() => sanitizeActivationEvent(event)).toThrow(
      ActivationEventSanitizationError,
    );
  });

  it("rejects secrets on the global deny-list", () => {
    for (const key of ["accessToken", "refreshTokenEnc", "password", "apiKey"]) {
      expect(() =>
        sanitizeActivationEvent(buildEvent({ ...VALID_METADATA, [key]: "x" })),
      ).toThrow(ActivationEventSanitizationError);
    }
  });

  it("rejects raw payloads and evidence implementation details", () => {
    for (const key of ["resultData", "snapshotData", "checkLogic", "graphResponse"]) {
      expect(() =>
        sanitizeActivationEvent(buildEvent({ ...VALID_METADATA, [key]: {} })),
      ).toThrow(ActivationEventSanitizationError);
    }
  });

  it("rejects denied suffixes and prefixes on dynamic keys", () => {
    expect(() =>
      sanitizeActivationEvent(buildEvent({ ...VALID_METADATA, customToken: "x" })),
    ).toThrow(ActivationEventSanitizationError);
    expect(() =>
      sanitizeActivationEvent(buildEvent({ ...VALID_METADATA, rawIntake: "x" })),
    ).toThrow(ActivationEventSanitizationError);
  });

  it("rejects keys not in the allow-list for the event type", () => {
    expect(() =>
      sanitizeActivationEvent(buildEvent({ ...VALID_METADATA, surprise: "x" })),
    ).toThrow(ActivationEventSanitizationError);
  });

  it("still allows legitimate keys that merely resemble denied ones", () => {
    // controlKey ends in "Key" which is intentionally NOT a denied suffix
    const event = {
      clerkOrgId: "org_1",
      entityId: "evidence_1",
      entityType: "evidence",
      metadata: {
        controlId: "control_1",
        controlKey: "ac-1",
        evidenceId: "evidence_1",
        fileType: "pdf",
        source: "manual",
      },
      name: "ManualEvidenceAdded",
    } as ActivationEvent;

    expect(() => sanitizeActivationEvent(event)).not.toThrow();
  });
});
