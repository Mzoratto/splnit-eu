import assert from "node:assert/strict";
import {
  checkFirewallPresent,
  checkServerStatus,
  checkSnapshotRecency,
  hetznerHealthProbe,
} from "@/lib/connectors/hetzner/checks";
import type { StoredConnectorCredential } from "@/lib/connectors/api-key-base/types";

function requireLiveHetznerKey() {
  const apiKey = process.env.HETZNER_LIVE_TEST_KEY?.trim();

  if (!apiKey) {
    console.error(
      "HETZNER_LIVE_TEST_KEY is not set.\n" +
      "Run with: HETZNER_LIVE_TEST_KEY=your_token npm run smoke:hetzner-live-key",
    );
    process.exit(1);
  }

  return apiKey;
}

const apiKey = requireLiveHetznerKey();
const credential: StoredConnectorCredential = {
  apiKey,
  platform: "hetzner",
};

async function main() {
  // Health probe must return "connected" for a valid live key.
  const probeResult = await hetznerHealthProbe({ credentials: credential });
  assert.equal(
    probeResult,
    "connected",
    `Health probe returned "${probeResult}" - check the token has server:read and firewall:read scopes`,
  );
  console.log("  OK health probe: connected");

  // Layer 1 checks accept pass or gap; error means the API call failed.
  const serverStatus = await checkServerStatus(apiKey, undefined);
  assert.notEqual(serverStatus, "error", "checkServerStatus returned error against live API");
  console.log(`  OK server status: ${serverStatus}`);

  const firewallStatus = await checkFirewallPresent(apiKey);
  assert.notEqual(firewallStatus, "error", "checkFirewallPresent returned error against live API");
  console.log(`  OK firewall present: ${firewallStatus}`);

  const snapshotStatus = await checkSnapshotRecency(apiKey, 7);
  assert.notEqual(snapshotStatus, "error", "checkSnapshotRecency returned error against live API");
  console.log(`  OK snapshot recency: ${snapshotStatus}`);

  console.log("hetzner live key smoke passed");
}

void main();
