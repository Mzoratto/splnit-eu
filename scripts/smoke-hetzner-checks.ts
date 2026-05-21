import assert from "node:assert/strict";
import {
  checkFirewallPresent,
  checkServerStatus,
  checkSnapshotRecency,
  hetznerHealthProbe,
} from "@/lib/connectors/hetzner/checks";
import {
  getEvidenceStateForTestResult,
  shouldCollectAutomatedEvidence,
} from "@/lib/integrations/evidence";
import type { StoredConnectorCredential } from "@/lib/connectors/api-key-base/types";

type MockFetch = typeof fetch;

const credential: StoredConnectorCredential = {
  apiKey: "test-hetzner-key",
  platform: "hetzner",
};

function jsonFetch(status: number, body: unknown): MockFetch {
  return async () =>
    new Response(JSON.stringify(body), {
      headers: { "content-type": "application/json" },
      status,
    });
}

function throwingFetch(error: Error): MockFetch {
  return async () => {
    throw error;
  };
}

async function main() {
  assert.equal(
    await checkServerStatus("key", undefined, {
      fetch: jsonFetch(200, { servers: [{ status: "running" }] }),
    }),
    "pass",
  );
  assert.equal(
    await checkServerStatus("key", undefined, {
      fetch: jsonFetch(200, { servers: [{ status: "off" }] }),
    }),
    "gap",
  );
  assert.equal(
    await checkServerStatus("key", undefined, {
      fetch: throwingFetch(new Error("ETIMEDOUT")),
    }),
    "error",
  );

  assert.equal(
    await checkFirewallPresent("key", {
      fetch: jsonFetch(200, { firewalls: [{ rules: [{ direction: "in" }] }] }),
    }),
    "pass",
  );
  assert.equal(
    await checkFirewallPresent("key", {
      fetch: jsonFetch(200, { firewalls: [{ rules: [] }] }),
    }),
    "gap",
  );

  assert.equal(
    await checkSnapshotRecency("key", 7, {
      fetch: jsonFetch(200, {
        images: [{ created: new Date().toISOString(), type: "snapshot" }],
      }),
    }),
    "pass",
  );
  assert.equal(
    await checkSnapshotRecency("key", 7, {
      fetch: jsonFetch(200, {
        images: [{ created: "2020-01-01T00:00:00Z", type: "snapshot" }],
      }),
    }),
    "gap",
  );

  assert.equal(
    await hetznerHealthProbe(
      { credentials: credential },
      { fetch: jsonFetch(401, { error: { code: "unauthorized" } }) },
    ),
    "invalid_key",
  );
  assert.equal(
    await hetznerHealthProbe(
      { credentials: credential },
      { fetch: jsonFetch(403, { error: { code: "forbidden" } }) },
    ),
    "insufficient_scope",
  );
  assert.equal(
    await hetznerHealthProbe(
      { credentials: credential },
      { fetch: throwingFetch(new Error("ETIMEDOUT")) },
    ),
    "unreachable",
  );

  const passState = getEvidenceStateForTestResult({
    resultData: { provider: "hetzner" },
    status: "pass",
  });
  assert.equal(passState.assessment_result, "pass");
  assert.equal(passState.confidence, "high");
  assert.equal(
    passState.source,
    "connector",
    "Automated/API evidence uses the existing connector source enum; the PDF renders it as source=api.",
  );

  assert.equal(
    shouldCollectAutomatedEvidence({
      lastEvidenceAt: null,
      now: new Date(),
      previousStatus: null,
      resultData: { blockedReason: "collection_failed", provider: "hetzner" },
      resultStatus: "error",
    }),
    false,
    "Hetzner errors must not create automated evidence; workspace controls retain manual attestation fallback.",
  );

  console.log("hetzner checks smoke passed");
}

void main();
