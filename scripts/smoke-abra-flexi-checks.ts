import assert from "node:assert/strict";
import { decryptSecret } from "@/lib/crypto";
import { encryptedValuesForCredential } from "@/lib/connectors/api-key-base/storage";
import type {
  AbraFlexiCredentialInput,
  StoredConnectorCredential,
} from "@/lib/connectors/api-key-base/types";
import {
  abraFlexiHealthProbe,
  checkBackupApiFallback,
  checkConfigurationReadable,
  checkHttpsTransport,
  checkUserListAccessible,
} from "@/lib/connectors/abra-flexi/checks";

type MockFetch = typeof fetch;

process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY ?? "test-abra-flexi-encryption-key";

const credential: AbraFlexiCredentialInput & { platform: "abra-flexi" } = {
  baseUrl: "https://demo.flexibee.example",
  companyName: "demo",
  password: "password-secret",
  platform: "abra-flexi",
  username: "api-user",
};
const storedCredential: StoredConnectorCredential = credential;

function jsonFetch(status: number, body: unknown): MockFetch {
  return async () =>
    new Response(JSON.stringify(body), {
      headers: { "content-type": "application/json" },
      status,
    });
}

function emptyFetch(status: number): MockFetch {
  return async () => new Response(null, { status });
}

async function main() {
  assert.equal(
    await abraFlexiHealthProbe(
      { credentials: storedCredential },
      { fetch: jsonFetch(200, { winstrom: { uzivatel: [{ kod: "api" }] } }) },
    ),
    "connected",
  );
  assert.equal(
    await abraFlexiHealthProbe(
      { credentials: storedCredential },
      { fetch: jsonFetch(401, { message: "Unauthorized" }) },
    ),
    "invalid_key",
  );
  assert.equal(
    await abraFlexiHealthProbe(
      { credentials: storedCredential },
      { fetch: jsonFetch(403, { message: "Forbidden" }) },
    ),
    "insufficient_scope",
  );
  assert.equal(
    await abraFlexiHealthProbe(
      { credentials: storedCredential },
      { fetch: jsonFetch(503, { message: "Unavailable" }) },
    ),
    "unreachable",
  );
  assert.equal(
    await abraFlexiHealthProbe(
      { credentials: storedCredential },
      {
        fetch: async () => {
          throw new Error("ENOTFOUND");
        },
      },
    ),
    "unreachable",
  );

  assert.equal(
    await checkUserListAccessible(credential, {
      fetch: jsonFetch(200, {
        winstrom: {
          uzivatel: [
            {
              kod: "api",
              zablokovan: false,
            },
          ],
        },
      }),
    }),
    "pass",
  );
  assert.equal(
    await checkBackupApiFallback(credential, { fetch: emptyFetch(404) }),
    "manual_review",
  );
  assert.equal(
    await checkConfigurationReadable(credential, {
      fetch: jsonFetch(200, {
        winstrom: {
          nastaveni: [
            {
              nazev: "ABRA Flexi",
            },
          ],
        },
      }),
    }),
    "pass",
  );
  assert.equal(checkHttpsTransport(credential), "pass");
  assert.equal(
    checkHttpsTransport({
      ...credential,
      baseUrl: "http://internal.flexibee.local",
    }),
    "gap",
  );

  const encrypted = encryptedValuesForCredential(credential, "org_abra_flexi_smoke");
  assert.ok(encrypted.accessTokenEnc);
  assert.equal(encrypted.refreshTokenEnc, null);
  assert.equal(encrypted.config.baseUrl, credential.baseUrl);
  assert.equal(encrypted.config.companyName, credential.companyName);
  assert.equal(encrypted.config.credentialType, "abra_flexi_basic");
  assert.equal(encrypted.config.tokenType, "basic_auth");
  assert.notEqual(encrypted.accessTokenEnc, credential.password);
  assert.equal(
    decryptSecret(encrypted.accessTokenEnc, "org_abra_flexi_smoke"),
    credential.password,
  );
  assert.equal(
    decryptSecret(String(encrypted.config.usernameEnc), "org_abra_flexi_smoke"),
    credential.username,
  );

  console.log("ABRA Flexi checks smoke passed");
}

void main();
