import assert from "node:assert/strict";
import { decryptSecret } from "@/lib/crypto";
import { encryptedValuesForCredential } from "@/lib/connectors/api-key-base/storage";
import {
  checkBackupPresent,
  checkFirewallEnabled,
  checkServerStatus,
  ovhcloudHealthProbe,
  type OVHcloudKeys,
} from "@/lib/connectors/ovhcloud/checks";
import { requestOVHcloudConsumerKey } from "@/lib/connectors/ovhcloud/auth";
import {
  getEvidenceStateForTestResult,
  shouldCollectAutomatedEvidence,
} from "@/lib/integrations/evidence";
import type { StoredConnectorCredential } from "@/lib/connectors/api-key-base/types";

type MockFetch = typeof fetch;

process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY ?? "test-ovhcloud-encryption-key";

const keys: OVHcloudKeys = {
  appKey: "app-key",
  appSecret: "app-secret",
  consumerKey: "consumer-key",
};

const credential: StoredConnectorCredential = {
  ...keys,
  platform: "ovhcloud",
  serviceName: "ns0000000.ip-192-0-2.eu",
};

function jsonFetch(status: number, body: unknown): MockFetch {
  return async () =>
    new Response(JSON.stringify(body), {
      headers: { "content-type": "application/json" },
      status,
    });
}

async function main() {
  assert.equal(
    await checkServerStatus(keys, "service", {
      fetch: jsonFetch(200, { status: "operational" }),
      now: () => 1_700_000_000_000,
    }),
    "pass",
  );
  assert.equal(
    await checkFirewallEnabled(keys, "service", {
      fetch: jsonFetch(200, { enabled: true }),
      now: () => 1_700_000_000_000,
    }),
    "pass",
  );
  assert.equal(
    await checkBackupPresent(keys, "service", {
      fetch: jsonFetch(200, { ftpBackupName: "backup-storage" }),
      now: () => 1_700_000_000_000,
    }),
    "pass",
  );

  assert.equal(
    await ovhcloudHealthProbe(
      { credentials: credential },
      { fetch: jsonFetch(401, { class: "Client::Unauthorized" }) },
    ),
    "invalid_key",
  );
  assert.equal(
    await ovhcloudHealthProbe(
      { credentials: credential },
      { fetch: jsonFetch(403, { class: "Client::Forbidden" }) },
    ),
    "insufficient_scope",
  );

  const encrypted = encryptedValuesForCredential(
    {
      ...keys,
      platform: "ovhcloud",
      serviceName: "service",
    },
    "org_ovhcloud_smoke",
  );
  assert.ok(encrypted.refreshTokenEnc);
  assert.notEqual(encrypted.accessTokenEnc, keys.appKey);
  assert.notEqual(encrypted.refreshTokenEnc, keys.appSecret);
  assert.equal(decryptSecret(encrypted.accessTokenEnc, "org_ovhcloud_smoke"), keys.appKey);
  assert.equal(decryptSecret(encrypted.refreshTokenEnc, "org_ovhcloud_smoke"), keys.appSecret);
  assert.equal(
    decryptSecret(String(encrypted.config.consumerKeyEnc), "org_ovhcloud_smoke"),
    keys.consumerKey,
  );

  const pendingCredential = await requestOVHcloudConsumerKey(
    {
      appKey: "app-key",
      redirection: "https://splnit.eu/integrations/ovhcloud",
    },
    {
      fetch: jsonFetch(200, {
        consumerKey: "pending-consumer-key",
        state: "pendingValidation",
        validationUrl: "https://eu.api.ovh.com/auth/?credentialToken=test",
      }),
    },
  );
  assert.equal(pendingCredential.state, "pendingValidation");
  assert.equal(pendingCredential.consumerKey, "pending-consumer-key");
  assert.match(pendingCredential.validationUrl, /^https:\/\//);

  const passState = getEvidenceStateForTestResult({
    resultData: { provider: "ovhcloud" },
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
      resultData: { blockedReason: "collection_failed", provider: "ovhcloud" },
      resultStatus: "error",
    }),
    false,
    "OVHcloud errors must not create automated evidence; workspace controls retain manual attestation fallback.",
  );

  console.log("ovhcloud checks smoke passed");
}

void main();
