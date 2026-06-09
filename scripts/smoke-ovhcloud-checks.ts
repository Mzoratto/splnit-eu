import assert from "node:assert/strict";
import { createHash } from "node:crypto";
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

const fixedNow = 1_700_000_000_000;
const fixedTimestamp = "1700000000";

function jsonFetch(status: number, body: unknown): MockFetch {
  return async () =>
    new Response(JSON.stringify(body), {
      headers: { "content-type": "application/json" },
      status,
    });
}

function expectedOvhSignature(url: string) {
  const payload = [
    keys.appSecret,
    keys.consumerKey,
    "GET",
    url,
    "",
    fixedTimestamp,
  ].join("+");

  return `$1$${createHash("sha1").update(payload).digest("hex")}`;
}

function signedJsonFetch(status: number, body: unknown, calls: { headers: Headers; url: string }[]): MockFetch {
  return async (input, init) => {
    calls.push({
      headers: new Headers(init?.headers),
      url: String(input),
    });

    return new Response(JSON.stringify(body), {
      headers: { "content-type": "application/json" },
      status,
    });
  };
}

function assertSignedGet(calls: { headers: Headers; url: string }[], expectedPath: string) {
  const expectedUrl = `https://api.ovh.com/1.0${expectedPath}`;
  const call = calls.at(-1);

  assert.ok(call, `expected signed OVHcloud request for ${expectedPath}`);
  assert.equal(call.url, expectedUrl);
  assert.equal(call.headers.get("x-ovh-application"), keys.appKey);
  assert.equal(call.headers.get("x-ovh-consumer"), keys.consumerKey);
  assert.equal(call.headers.get("x-ovh-timestamp"), fixedTimestamp);
  assert.equal(call.headers.get("x-ovh-signature"), expectedOvhSignature(expectedUrl));
}

async function main() {
  const firewallCalls: { headers: Headers; url: string }[] = [];
  const backupCalls: { headers: Headers; url: string }[] = [];

  assert.equal(
    await checkServerStatus(keys, "service", {
      fetch: jsonFetch(200, { status: "operational" }),
      now: () => fixedNow,
    }),
    "pass",
  );
  assert.equal(
    await checkFirewallEnabled(keys, "service", {
      fetch: signedJsonFetch(200, { enabled: true }, firewallCalls),
      now: () => fixedNow,
    }),
    "pass",
  );
  assertSignedGet(firewallCalls, "/dedicated/server/service/firewall");
  assert.equal(
    await checkBackupPresent(keys, "service", {
      fetch: signedJsonFetch(200, { ftpBackupName: "backup-storage" }, backupCalls),
      now: () => fixedNow,
    }),
    "pass",
  );
  assertSignedGet(backupCalls, "/dedicated/server/service/backupStorage");

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
