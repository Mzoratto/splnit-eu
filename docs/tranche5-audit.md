# Tranche 5 audit — API-key infrastructure connectors

Date: 2026-05-21

## Existing Microsoft 365 patterns to reuse

### Per-org idempotency lock

- File: `lib/integrations/locks.ts`
- Function for integration test execution: `acquireIntegrationRunLock(input)`
- Lock key format: `integration-run:${clerkOrgId}:${provider}`
- TTL: `55 * 60` seconds
- Backing store: Upstash Redis when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are configured; otherwise the lock is treated as acquired with `enabled: false`.
- First-run enqueue lock:
  - File: `lib/integrations/locks.ts`
  - Function: `acquireIntegrationFirstRunEnqueueLock(input)`
  - Lock key format: `integration-first-run-enqueue:${clerkOrgId}:${provider}`
  - TTL: `24 * 60 * 60` seconds
- M365 activation usage:
  - File: `lib/integrations/first-run-enqueue.ts`
  - Function: `enqueueIntegrationFirstRun(input, deps)`
  - The callback calls this after saving the OAuth tokens.
  - File: `app/api/integrations/microsoft/callback/route.ts`
  - Function: `GET(request)`
- M365 collection usage:
  - File: `lib/integrations/runner.ts`
  - Function: `runTestsForOrg(clerkOrgId, options)`
  - The runner acquires `acquireIntegrationRunLock({ clerkOrgId, provider })` before executing provider tests and releases it in a `finally` block.

Tranche 5 must reuse `acquireIntegrationRunLock` and/or `enqueueIntegrationFirstRun`; it must not create a second lock implementation.

### Token and credential storage

- Table: `integrations`
- Schema file: `lib/db/schema.ts`
- Relevant columns:
  - `clerk_org_id` / `clerkOrgId`: per-org isolation boundary, references `organisations.clerkOrgId`.
  - `provider`: connector identifier.
  - `access_token_enc` / `accessTokenEnc`: encrypted access token or primary secret.
  - `refresh_token_enc` / `refreshTokenEnc`: encrypted refresh token or secondary secret.
  - `token_expires_at` / `tokenExpiresAt`: OAuth expiry, nullable for non-expiring API keys.
  - `status`: connection state, default `connected`.
  - `last_synced_at` / `lastSyncedAt`: last successful runner update.
  - `last_error_msg` / `lastErrorMsg`: operational error text.
  - `config`: JSONB metadata for provider-specific non-secret configuration.
- Unique key: `(clerk_org_id, provider)`
- Query file: `lib/db/queries/integrations.ts`
- Write function: `upsertIntegrationConnection(input)`
- Delete function: `disconnectIntegrationConnection(input)`
- Encryption file: `lib/crypto.ts`
- Encryption functions:
  - `encryptSecret(plaintext, clerkOrgId)`
  - `decryptSecret(encrypted, clerkOrgId)`
- Encryption approach:
  - AES-256-GCM.
  - The base key comes from `ENCRYPTION_KEY`.
  - The per-org key is derived with SHA-256 over the base key and `clerkOrgId`.
  - Stored format is `iv.tag.ciphertext`, base64url encoded.

Tranche 5 key storage should use the existing `integrations` table and these encrypted token columns. For a single-key connector, store the API key in `accessTokenEnc`. For OVHcloud's three-part credentials, store `appKey` in `accessTokenEnc`, `appSecret` in `refreshTokenEnc`, and `consumerKey` encrypted inside `config.consumerKeyEnc` because there is no third encrypted column. This preserves the table shape while keeping all secret parts encrypted at rest.

### Connector activation and evidence wiring

- OAuth completion route:
  - File: `app/api/integrations/microsoft/callback/route.ts`
  - Function: `GET(request)`
  - Saves encrypted tokens with `upsertIntegrationConnection`.
  - Records `integration.connected` audit log.
  - Records `ConnectorOAuthCompleted` activation event.
  - Creates pending M365 evidence in `createPendingMicrosoftEvidence(input)`.
  - Enqueues the first run with `enqueueIntegrationFirstRun`.
- Test registry:
  - File: `lib/integrations/registry.ts`
  - Functions: `getAdapter(provider)`, `isSupportedIntegrationProvider(provider)`
  - M365 registers `microsoft365Adapter`.
- M365 adapter:
  - File: `lib/integrations/microsoft365/tests.ts`
  - Adapter: `microsoft365Adapter`
  - Main test function: `runMicrosoft365CheckWithClient(checkLogic, client)`
- Integration runner:
  - File: `lib/integrations/runner.ts`
  - Function: `runTestsForOrg(clerkOrgId, options)`
  - Loads connected integrations, finds provider adapter, acquires the per-org/provider lock, executes active `tests` rows, writes `integration_runs`, writes automated evidence when appropriate, updates `org_control_statuses`, records activation events, and releases the lock.
- Automated evidence writer:
  - File: `lib/integrations/evidence.ts`
  - Function: `createAutomatedEvidenceForIntegrationRun(input)`
  - Uses `createEvidenceState`.
  - Existing automated source value is `source: "connector"`, not a literal `"api"` enum. The PDF template maps `source: "connector"` to the Czech `source=api (...)` output.

Tranche 5 should follow the registry + adapter + runner pattern for automated checks. Because the current evidence model does not include a literal `"api"` source, automated Hetzner/OVHcloud evidence should keep using `source: "connector"` with `confidence: "high"`.

## Endpoint verification

No credentials were stored or printed during this audit.

### Hetzner Cloud

- Requested: `GET https://api.hetzner.cloud/v1/servers`
- Result without token: HTTP 401 JSON body:
  - `error.code`: `unauthorized`
  - `error.message`: `token is required`
- This confirms the endpoint and bearer-token requirement.
- Official docs reviewed:
  - Hetzner Cloud API reference home: `https://docs.hetzner.cloud/reference/cloud`
  - Hetzner Cloud changelog confirms `GET /v1/servers` and `GET /v1/firewalls` are current endpoints.
- Expected authenticated shapes for Tranche 5 checks:
  - `GET /servers` returns a top-level `servers` array; server objects expose `status` values including `running`.
  - `GET /firewalls` returns a top-level `firewalls` array; firewall objects expose a `rules` array.
  - Snapshot recency should use images/snapshots metadata exposed by the Cloud API. TODO: confirm the exact authenticated snapshot endpoint with a read-only test key before enabling production checks.

### OVHcloud

- Requested: `POST https://api.ovh.com/1.0/auth/credential` with an access-rule body but no real application key.
- Result: HTTP 403 JSON body:
  - `class`: `Client::Forbidden`
  - `message`: `Invalid application key`
- This confirms the endpoint exists and requires `X-Ovh-Application`.
- Official docs reviewed:
  - OVHcloud rights delegation guide: `https://help.ovhcloud.com/csm/pl-api-api-rights-delegation?id=kb_article_view&sysparm_article=KB0068610`
- Expected authenticated credential request shape:
  - Header: `X-Ovh-Application: <application key>`
  - JSON body: `redirection` plus `accessRules`.
  - Success response includes:
    - `state: "pendingValidation"`
    - `consumerKey`
    - `validationUrl`
  - User must visit `validationUrl`; after validation, API calls use application key, application secret, and consumer key.
- Planned API paths for Tranche 5 checks:
  - `GET /dedicated/server/{serviceName}` for server status.
  - `GET /dedicated/server/{serviceName}/firewall` for firewall state.
  - `GET /dedicated/server/{serviceName}/backupStorage` for backup presence.
  - TODO: confirm exact response fields with a delegated read-only OVHcloud account before enabling production checks.
