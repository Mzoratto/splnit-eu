import assert from "node:assert/strict";
import {
  checkConnectorCredentialHealth,
  mapHttpStatusToHealthCheck,
} from "@/lib/connectors/api-key-base/health";
import type {
  ConnectorHealthProbe,
  StoredConnectorCredential,
} from "@/lib/connectors/api-key-base/types";

const hetznerCredential: StoredConnectorCredential = {
  apiKey: "test-key",
  platform: "hetzner",
};

assert.equal(mapHttpStatusToHealthCheck(200), "connected");
assert.equal(mapHttpStatusToHealthCheck(204), "connected");
assert.equal(mapHttpStatusToHealthCheck(401), "invalid_key");
assert.equal(mapHttpStatusToHealthCheck(403), "insufficient_scope");
assert.equal(mapHttpStatusToHealthCheck(500), "unreachable");

const resultProbe = (result: Awaited<ReturnType<ConnectorHealthProbe>>): ConnectorHealthProbe =>
  async () => result;

async function main() {
  assert.equal(
    await checkConnectorCredentialHealth(
      {
        credentials: hetznerCredential,
        platform: "hetzner",
      },
      { probe: resultProbe("connected") },
    ),
    "connected",
  );

  assert.equal(
    await checkConnectorCredentialHealth(
      {
        credentials: hetznerCredential,
        platform: "hetzner",
      },
      { probe: resultProbe("invalid_key") },
    ),
    "invalid_key",
  );

  assert.equal(
    await checkConnectorCredentialHealth(
      {
        credentials: hetznerCredential,
        platform: "hetzner",
      },
      { probe: resultProbe("insufficient_scope") },
    ),
    "insufficient_scope",
  );

  assert.equal(
    await checkConnectorCredentialHealth(
      {
        credentials: hetznerCredential,
        platform: "hetzner",
      },
      {
        probe: async () => {
          throw new Error("ETIMEDOUT");
        },
      },
    ),
    "unreachable",
  );

  console.log("api-key connector base smoke passed");
}

void main();
