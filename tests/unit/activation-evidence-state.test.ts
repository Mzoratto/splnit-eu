import { describe, expect, it } from "vitest";
import {
  computeEvidenceFreshness,
  createEvidenceState,
  getDefaultEvidenceConfidence,
} from "@/lib/activation/evidence-state";

const NOW = new Date("2026-06-11T12:00:00.000Z");
const DAY_MS = 24 * 60 * 60 * 1000;

describe("getDefaultEvidenceConfidence", () => {
  it("maps sources to default confidence levels", () => {
    expect(getDefaultEvidenceConfidence({ source: "connector" })).toBe("high");
    expect(getDefaultEvidenceConfidence({ source: "manual" })).toBe("medium");
    expect(getDefaultEvidenceConfidence({ source: "intake" })).toBe("low");
  });

  it("requires explicit confidence for imported evidence", () => {
    expect(
      getDefaultEvidenceConfidence({ source: "imported", importedConfidence: "high" }),
    ).toBe("high");
    expect(() => getDefaultEvidenceConfidence({ source: "imported" })).toThrow(
      "Imported evidence requires an explicit confidence value.",
    );
  });
});

describe("createEvidenceState", () => {
  it("derives collection status from blocked reason and collected_at", () => {
    expect(
      createEvidenceState({ blocked_reason: "missing_permission", source: "connector" })
        .collection_status,
    ).toBe("blocked");
    expect(
      createEvidenceState({ collected_at: NOW, source: "connector" }).collection_status,
    ).toBe("collected");
    expect(createEvidenceState({ source: "manual" }).collection_status).toBe("pending");
  });

  it("honours explicit collection status over derivation", () => {
    expect(
      createEvidenceState({
        collected_at: NOW,
        collection_status: "failed",
        source: "connector",
      }).collection_status,
    ).toBe("failed");
  });

  it("defaults assessment to unknown and fills source confidence", () => {
    const state = createEvidenceState({ source: "manual" });

    expect(state.assessment_result).toBe("unknown");
    expect(state.confidence).toBe("medium");
    expect(state.blocked_reason).toBeNull();
  });
});

describe("computeEvidenceFreshness", () => {
  it("reports missing when nothing was collected", () => {
    const freshness = computeEvidenceFreshness({
      collected_at: null,
      now: NOW,
      ttl_ms: DAY_MS,
    });

    expect(freshness.status).toBe("missing");
    expect(freshness.is_fresh).toBe(false);
    expect(freshness.expires_at).toBeNull();
  });

  it("reports fresh inside the TTL and stale beyond it", () => {
    const recentlyCollected = new Date(NOW.getTime() - DAY_MS / 2);
    const longAgo = new Date(NOW.getTime() - DAY_MS * 2);

    expect(
      computeEvidenceFreshness({ collected_at: recentlyCollected, now: NOW, ttl_ms: DAY_MS })
        .status,
    ).toBe("fresh");
    expect(
      computeEvidenceFreshness({ collected_at: longAgo, now: NOW, ttl_ms: DAY_MS }).status,
    ).toBe("stale");
  });

  it("rejects negative TTLs", () => {
    expect(() =>
      computeEvidenceFreshness({ collected_at: NOW, now: NOW, ttl_ms: -1 }),
    ).toThrow("Evidence freshness TTL must be non-negative.");
  });
});
