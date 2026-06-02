# Entire-Codebase Audit Lane 04: Integrations, Workspaces, Background Jobs, Cron, Inngest

Generated: 2026-06-02 10:15:43 CEST
Mode: audit only; no implementation, commit, push, deploy, production DB, or production Blob operations performed.
Workspace: `/Users/marcozoratto/splnit.eu`
Commit inspected: `e9f2168`

## Scope and exclusions

Scope from lane plan:

- Live integrations and connector adapter coverage.
- Static/manual workspaces and workspace lifecycle.
- Credential storage and provider health checks.
- First-run behavior, retries/failures, evidence creation, token refresh.
- Inngest jobs and cron routes.
- Evidence/manual/import/automated proof boundaries.
- Shared-file claims and dependencies on Lane 02/03 status/evidence/auth findings.

Explicit exclusions:

- No code implementation.
- No commits, pushes, or deploys.
- No production database reads/writes, migrations, seeds, backfills, or Blob operations.
- No live customer/provider credentials were used.
- No production Inngest, Vercel Cron, or webhook delivery was triggered.
- No `.hermes/plans/*` implementation plan was created because the lane plan requires implementation plans only for findings accepted by an independent verifier; this lane report is the auditor output.

## Files/directories inspected

Instructions/state/product context:

- `AGENTS.md`
- `.hermes/plans/2026-06-02_094729-lane-04-integrations-workspaces-jobs.md`
- `.hermes/state/entire-codebase-audit-ledger.md`
- `docs/product/implementation-gap-audit.md`
- `docs/audits/entire-codebase-lane-02-data-model-db-migrations.md`
- `docs/audits/entire-codebase-lane-03-auth-org-boundaries.md`

Integration and connector core:

- `lib/integrations/registry.ts`
- `lib/integrations/types.ts`
- `lib/integrations/runner.ts`
- `lib/integrations/evidence.ts`
- `lib/integrations/first-run-enqueue.ts`
- `lib/integrations/locks.ts`
- `lib/integrations/oauth-state.ts`
- `lib/integrations/microsoft365/client.ts`
- `lib/integrations/microsoft365/oauth.ts`
- `lib/integrations/microsoft365/tests.ts`
- `lib/integrations/microsoft365/test-definitions.ts`
- `lib/integrations/github/app.ts`
- `lib/integrations/github/client.ts`
- `lib/integrations/github/tests.ts`
- `lib/integrations/github/test-definitions.ts`
- `lib/integrations/aws/tests.ts`
- `lib/integrations/aws/test-definitions.ts`
- `lib/integrations/hetzner/tests.ts`
- `lib/integrations/hetzner/test-definitions.ts`
- `lib/integrations/ovhcloud/tests.ts`
- `lib/integrations/ovhcloud/test-definitions.ts`
- `lib/integrations/abra-flexi/tests.ts`
- `lib/integrations/abra-flexi/test-definitions.ts`
- `lib/connectors/api-key-base/actions.ts`
- `lib/connectors/api-key-base/storage.ts`
- `lib/connectors/api-key-base/health.ts`
- `lib/connectors/api-key-base/types.ts`
- `lib/connectors/aws/checks.ts`
- `lib/connectors/hetzner/checks.ts`
- `lib/connectors/ovhcloud/checks.ts`
- `lib/connectors/abra-flexi/checks.ts`
- `lib/connectors/abra-flexi/auth.ts`
- `lib/connectors/abra-flexi/url.ts`

Integration app/API routes:

- `app/(app)/integrations/page.tsx`
- `app/(app)/integrations/actions.ts`
- `app/(app)/integrations/status-refresh.tsx`
- `app/(app)/integrations/microsoft365/page.tsx`
- `app/(app)/integrations/github/page.tsx`
- `app/(app)/integrations/aws/page.tsx`
- `app/(app)/integrations/aws/actions.ts`
- `app/(app)/integrations/[provider]/page.tsx`
- `app/(app)/integrations/[provider]/actions.ts`
- `app/api/integrations/microsoft/start/route.ts`
- `app/api/integrations/microsoft/callback/route.ts`
- `app/api/integrations/github/callback/route.ts`
- `app/api/integrations/google/callback/route.ts`

Workspaces and workspace lifecycle:

- `lib/workspaces/pohoda.ts`
- `lib/workspaces/money-s3.ts`
- `lib/workspaces/helios.ts`
- `lib/workspaces/abra-flexi.ts`
- `lib/workspaces/aws.ts`
- `lib/workspaces/hetzner.ts`
- `lib/workspaces/ovhcloud.ts`
- `lib/workspaces/types.ts`
- `lib/workspaces/attestation.ts`
- `lib/workspaces/control-seeds.ts`
- `lib/workspaces/helios/lifecycle.ts`
- `lib/workspaces/helios-csv/parser.ts`
- `lib/workspaces/helios-csv/mapping.ts`
- `lib/workspaces/helios-csv/importer.ts`
- `lib/workspaces/helios-csv/types.ts`
- `components/workspaces/workspace-renderer.tsx`
- `app/(app)/workspaces/actions.ts`
- `app/(app)/workspaces/pohoda/page.tsx`
- `app/(app)/workspaces/money-s3/page.tsx`
- `app/(app)/workspaces/helios/page.tsx`
- `app/(app)/workspaces/helios/import/page.tsx`
- `app/(app)/workspaces/helios/import/actions.ts`
- `app/(app)/workspaces/abra-flexi/page.tsx`
- `app/(app)/workspaces/abra-flexi/actions.ts`
- `app/(app)/workspaces/abra-flexi/connection-form.tsx`

Evidence/status dependencies:

- `lib/db/queries/evidence.ts`
- `lib/db/queries/integrations.ts`
- `lib/db/queries/workspaces.ts`
- `lib/activation/evidence-state.ts`
- `lib/controls/scorer.ts`

Inngest and cron:

- `app/api/inngest/route.ts`
- `inngest/client.ts`
- `inngest/run-integration-tests.ts`
- `inngest/evidence-expiry-alerts.ts`
- `inngest/policy-review-reminders.ts`
- `inngest/access-review-reminders.ts`
- `inngest/regulation-updates.ts`
- `inngest/workspace-evidence-lifecycle.ts`
- `app/api/cron/run-tests/route.ts`
- `app/api/cron/evidence-expiry/route.ts`
- `app/api/cron/policy-review-reminders/route.ts`
- `app/api/cron/access-review-reminders/route.ts`
- `app/api/cron/regulation-sync/route.ts`
- `app/api/cron/deadline-reminders/route.ts`
- `lib/http/cron.ts`
- `vercel.json`

Smoke/source checks and tests inspected or run:

- `package.json`
- `scripts/smoke-api-key-base.ts`
- `scripts/smoke-aws-checks.ts`
- `scripts/smoke-hetzner-checks.ts`
- `scripts/smoke-ovhcloud-checks.ts`
- `scripts/smoke-integration-first-run-enqueue.ts`
- `scripts/smoke-microsoft365-permission-failures.ts`
- `scripts/smoke-pohoda-workspace-config.ts`
- `scripts/smoke-money-s3-workspace-config.ts`
- `scripts/smoke-abra-flexi-workspace-config.ts`
- `scripts/smoke-helios-workspace-config.ts`
- `scripts/smoke-helios-evidence-lifecycle.ts`
- `scripts/smoke-helios-csv-import.ts`
- `scripts/smoke-microsoft-first-run-enqueue-source.ts`
- `tests/e2e/activation-loop.spec.ts`
- `tests/e2e/security.spec.ts`
- `tests/e2e/helios-workspace.spec.ts`

## Commands run and results

Initial state and environment:

```text
git status --short
M docs/README.md
?? .hermes/state/entire-codebase-audit-ledger.md
?? docs/audits/entire-codebase-lane-02-data-model-db-migrations.md
?? docs/audits/entire-codebase-lane-03-auth-org-boundaries.md
?? docs/product/implementation-gap-audit.md

git rev-parse --short HEAD
e9f2168

node --version
v22.22.3

npm --version
11.0.0
```

Database target safety check before DB-capable smoke commands:

```text
DATABASE_URL absent
```

Lane verification commands run:

```text
npm run ci:connector-smokes
PASS
- smoke:api-key-base: api-key connector base smoke passed
- smoke:aws-checks: aws connector checks smoke passed
- smoke:hetzner-checks: hetzner checks smoke passed
- smoke:ovhcloud-checks: ovhcloud checks smoke passed

npm run smoke:integration-first-run-enqueue
PASS
- callback enqueue sends the first-run integration test event
- double-fire dedupes the second callback before enqueueing
- per-org/provider lock blocks same org/provider but not other scopes
- Integration first-run enqueue behavior smoke passed

npm run smoke:microsoft365-permission-failures
PASS
- Microsoft 365 permission failure smoke test passed.

npm run smoke:pohoda-workspace-config
PASS
- Pohoda workspace config smoke passed

npm run smoke:money-s3-workspace-config
PASS
- Money S3 workspace config smoke test passed.
- Layers: 4; Controls: 16; NIS2 article refs and ZoKB metadata present; no Pohoda-specific terms.

npm run smoke:abra-flexi-workspace-config
PASS
- ABRA Flexi workspace config smoke passed

npm run smoke:helios-workspace-config
PASS
- Helios workspace config smoke test passed.
- Layers: 4; Controls: 19; NIS2 article refs and ZoKB metadata present.
- Manufacturing role hierarchy and MES/SCADA/EDI references present.

npm run smoke:helios-evidence-lifecycle
PASS
- Helios evidence lifecycle smoke passed.

npm run smoke:helios-csv-import
PASS
- smoke:helios-csv-import ok org=org_helios_csv_smoke_1780388124453 parsed=11 created=11 gaps=9 manual_review=2
- cleanup org_helios_csv_smoke_1780388124453: organisations=0, evidence=0, statuses=0
```

Existing T0 baseline from `.hermes/state/entire-codebase-audit-ledger.md`:

- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run build` passed.
- T0 lane-relevant smokes also showed passes for integration first-run enqueue, Microsoft permission failures, connector checks, workspace configs, Helios evidence lifecycle, Helios CSV import, Helios provenance, Helios live attestation, and Helios agency progress.

## Overall classification

PARTIAL.

Implemented and verified locally/source-backed:

- Supported provider registry has adapters for Microsoft 365, GitHub, AWS, ABRA Flexi, Hetzner, and OVHcloud.
- API-key connector storage encrypts provider credentials and validates health before connected status.
- Connector smoke suite passes for API-key base, AWS, Hetzner, and OVHcloud checks.
- Microsoft OAuth callback stores encrypted OAuth tokens, creates pending evidence, records audit/activation events, and enqueues a first run through Inngest.
- Inngest integration-test runner exists and uses per-org/provider locks in `runTestsForOrg`.
- Cron `/api/cron/run-tests` can enqueue test runs for a target org/provider or all active integration targets, protected by `CRON_SECRET` in production.
- Workspaces exist for Pohoda, Money S3, Helios, and ABRA Flexi; workspace config smokes pass.
- Helios has manual workspace, CSV-assisted import, targeted control lifecycle, stale evidence downgrade/remediation tasks, and lifecycle/CSV smokes passing.
- Cron route auth is centralized in `lib/http/cron.ts` and returns 503 in production when `CRON_SECRET` is missing.

Partial/blocked/absent:

- API-key connectors do not enqueue an immediate first run after successful connect/rotate; only Microsoft does.
- Microsoft token refresh helper exists but is not wired into Graph client or runner persistence path.
- GitHub callback stores installation config but does not enqueue first run, create pending evidence, record activation event, or validate installation repository access before connected state.
- Pohoda and Money S3 are manual/static workspaces only; no live connector, adapter, callback, cron runner, or data ingestion found.
- Helios is manual/CSV-assisted only; no live Helios connector. CSV evidence correctly remains customer-reported/manual-review or gap.
- ABRA Flexi has a live credential/check adapter plus manual workspace, but only part of the ABRA workspace is automated.
- OVHcloud `serviceName` is optional in connect schema/storage but required by adapter checks, so a credential can be saved connected while later checks fail.
- Manual evidence/workspace/CSV status propagation depends on Lane 02 P0: `createManualEvidence` records actual assessment but upserts `orgControlStatuses.status` as `unknown`/timestamp-only.
- Evidence expiry cron/Inngest jobs call a helper whose query currently returns `[]`; expiry alert coverage is effectively absent until evidence expiry persistence/query work is implemented.
- Cron and Inngest duplicate several schedules, risking duplicate reminder/sync execution if both Vercel Cron routes and Inngest cron functions are enabled in production.

## Findings

### L04-F01: API-key connectors validate credentials but do not enqueue first-run evidence collection

Classification: partial
Severity: high for activation loop; medium for security/compliance

Evidence:

- `lib/connectors/api-key-base/actions.ts:123-153` checks credential health and saves only after `health === "connected"`.
- `lib/connectors/api-key-base/actions.ts:155-180` records audit and activation events.
- `lib/connectors/api-key-base/actions.ts:181-186` revalidates paths and returns connected.
- There is no call to `enqueueIntegrationFirstRun` in `lib/connectors/api-key-base/actions.ts`.
- `lib/integrations/first-run-enqueue.ts` only supports trigger value `oauth_callback_first_run`, which is Microsoft-specific wording.
- `app/api/integrations/microsoft/callback/route.ts:168-184` does enqueue and audit first run, showing the intended path exists.

Impact:

- AWS, Hetzner, OVHcloud, and ABRA Flexi can show connected after health check but will not promptly create automated evidence unless a scheduled/manual cron run occurs.
- Fresh users may not see first evidence/gap feedback after connecting the recommended API-key provider.

Recommended slice:

- Add first-run enqueue after successful API-key connect/rotate, with generic trigger metadata such as `api_key_connect_first_run` or `credential_rotation_first_run`.
- Keep per-org/provider lock and deterministic event ID semantics.
- Record `integration.first_run_queued` or skipped audit events mirroring Microsoft.

Rollback/feature flag:

- Gate API-key first-run enqueue behind an env flag initially, e.g. `ENABLE_API_KEY_CONNECTOR_FIRST_RUN=true`, if duplicate evidence or provider rate limits are a concern.
- Rollback by disabling the flag or reverting the enqueue call; persisted credentials remain valid.

Existing-data migration/backfill:

- No schema migration required.
- Optional backfill: enqueue one run for existing connected API-key integrations whose `lastSyncedAt` is null. This must be production-approved and rate-limited; do not run automatically in deploy.

Human approval:

- Required before any production bulk enqueue/backfill against existing customers.

### L04-F02: Microsoft 365 OAuth refresh helper is unused, so long-lived connector readiness is incomplete

Classification: partial
Severity: high for live Microsoft reliability

Evidence:

- `lib/integrations/microsoft365/oauth.ts:53-78` defines `refreshMicrosoftToken(refreshToken)`.
- `lib/integrations/microsoft365/client.ts:5-17` decrypts only `accessTokenEnc` and returns a Graph client with that token.
- The Graph client path does not inspect `integration.tokenExpiresAt`, decrypt `refreshTokenEnc`, call `refreshMicrosoftToken`, or persist refreshed tokens.
- `app/api/integrations/microsoft/callback/route.ts:132-142` stores access token, refresh token, and expiry on initial callback.

Impact:

- Microsoft 365 checks work only until the stored access token expires.
- After expiry, the runner likely records permission/collection failures instead of refreshing, creating misleading evidence failure noise.
- Product must not claim durable Microsoft 365 continuous readiness after token expiry.

Recommended slice:

- Add a Microsoft token provider helper used before Graph checks.
- If `tokenExpiresAt` is near/past expiry, decrypt refresh token, call `refreshMicrosoftToken`, persist new access token, optional new refresh token, and new expiry, then run checks.
- On refresh failure, mark integration or run as permission/connection issue with safe user-facing recovery.

Rollback/feature flag:

- Gate refresh behavior with `ENABLE_MICROSOFT_TOKEN_REFRESH` until validated.
- If refresh causes failures, disable flag to return to existing access-token-only behavior.

Existing-data migration/backfill:

- No schema change; fields already exist.
- Existing expired Microsoft integrations need user reconnect if refresh token is absent/invalid.

Human approval:

- Not needed for local implementation, but public/customer claims about durable Microsoft readiness require product-owner approval after production verification.

### L04-F03: GitHub installation callback is less complete than Microsoft first-run path

Classification: partial
Severity: medium-high

Evidence:

- `app/api/integrations/github/callback/route.ts:69-79` fetches installation details and upserts connected integration config.
- It records only `integration.connected` audit log at `route.ts:80-90`.
- It does not call `enqueueIntegrationFirstRun`, does not create pending evidence, and does not call `recordActivationEvent`.
- `lib/integrations/github/tests.ts` has real adapter checks for 2FA, branch protection, secret scanning, dependency alerts, and code scanning once runner executes.
- `lib/integrations/github/app.ts` uses Redis nonce with one-use marker and GitHub App installation tokens, which is a sound auth pattern, but first-run lifecycle is incomplete.

Impact:

- GitHub can be connected without immediate automated evidence and without the activation event sequence used by Microsoft.
- UX/status parity differs by OAuth provider.

Recommended slice:

- Mirror Microsoft callback behavior: create pending GitHub connection evidence for mapped tests, enqueue first run after successful installation verification, and record activation event plus first-run audit event.
- Consider a lightweight repository access smoke before connected state if installation metadata alone is insufficient.

Rollback/feature flag:

- Gate GitHub first-run enqueue/pending evidence behind `ENABLE_GITHUB_FIRST_RUN`.
- Rollback by disabling first-run enqueue; connected integration remains stored.

Existing-data migration/backfill:

- No schema migration required.
- Optional production-approved one-time enqueue for existing GitHub installations with no runs.

Human approval:

- Required before bulk-enqueueing existing GitHub installations in production.

### L04-F04: OVHcloud connect UX allows missing `serviceName` although checks require it

Classification: partial
Severity: medium

Evidence:

- `lib/connectors/api-key-base/actions.ts:24-30` declares `serviceName` optional/nullable for OVHcloud credentials.
- `lib/connectors/api-key-base/storage.ts:84-94` stores `serviceName: credential.serviceName?.trim() || null`.
- `lib/integrations/ovhcloud/tests.ts:73-82` throws when `serviceName` is missing.
- `npm run smoke:ovhcloud-checks` passed for source/check behavior, but this does not remove the connect/check mismatch.

Impact:

- A user can connect OVHcloud credentials successfully but later receive collection errors for all dedicated-server checks because the specific service was not configured.

Recommended slice:

- Either require `serviceName` at connect time for current dedicated-server checks, or add a service discovery/selection step before marking dedicated-server checks ready.

Rollback/feature flag:

- If requiring service name, rollback is schema/action validation revert.
- If adding discovery, gate discovery behind a provider flag until live tested.

Existing-data migration/backfill:

- Existing connected OVHcloud rows with null `serviceName` should be marked configuration-needed or prompted for service selection; do not infer service names without customer confirmation.

Human approval:

- Not required for validation alignment; required if changing public provider-readiness copy.

### L04-F05: Pohoda and Money S3 are manual/static workspaces only, not live integrations

Classification: static/manual/checklist
Severity: high for claim boundaries; medium for product completeness

Evidence:

- `app/(app)/workspaces/pohoda/page.tsx` and `lib/workspaces/pohoda.ts` define workspace UI/config.
- `app/(app)/workspaces/money-s3/page.tsx` and `lib/workspaces/money-s3.ts` define workspace UI/config.
- Searches found no `lib/connectors/pohoda`, no `lib/connectors/money-s3`, no integration adapter entries, no API callback, and no background runner provider for these platforms.
- `lib/integrations/registry.ts` does not include `pohoda` or `money-s3`.
- Config smokes pass, which proves workspace shape, not live automation.

Impact:

- Marketing/product copy must not imply live Pohoda or Money S3 data ingestion.
- Current value is manual attestation/checklist progress only.

Recommended slice:

- Short-term: make UI/copy explicit that Pohoda and Money S3 are guided workspaces with manual evidence, not connected integrations.
- Longer-term: define connector feasibility separately with credential model, provider API capabilities, and safe first-run evidence boundaries.

Rollback/feature flag:

- Copy/label rollback is simple revert.
- Any future connector implementation should be feature-flagged per provider.

Existing-data migration/backfill:

- None for copy clarification.
- Future connector launch may need to preserve existing manual evidence and not auto-upgrade status from manual/customer-reported records.

Human approval:

- Required for public claim boundary decisions around Czech ERP integration readiness.

### L04-F06: Helios is CSV/manual lifecycle, not live automation; source/provenance boundaries are mostly safe but status propagation depends on Lane 02

Classification: partial; manual/CSV-assisted lifecycle implemented, live connector absent
Severity: high for proof boundaries; high dependency on Lane 02

Evidence:

- `app/(app)/workspaces/helios/page.tsx` and `lib/workspaces/helios.ts` implement manual workspace.
- `app/(app)/workspaces/helios/import/actions.ts` validates `.csv`, accepted MIME types, and 512 KB max before importing.
- `lib/workspaces/helios-csv/importer.ts:33-52` creates evidence from mapped CSV candidates through `createManualEvidence`.
- `lib/db/queries/evidence.ts:67-69` rejects Helios CSV `pass` when file type is `helios_csv_import`.
- `lib/db/queries/evidence.ts:171-173` separately enforces `createHeliosCsvImportEvidence` as only `manual_review` or `gap`.
- `lib/workspaces/helios/lifecycle.ts` finds stale Helios evidence, creates remediation tasks, and downgrades stale `pass`/`manual_review` statuses to `manual_review`.
- `npm run smoke:helios-evidence-lifecycle` and `npm run smoke:helios-csv-import` passed.
- No live Helios connector/client/adapter/API callback was found.

Dependency:

- Lane 02 confirmed `createManualEvidence` stores the evidence `assessmentResult` but upserts `orgControlStatuses.status` as `unknown` on insert and timestamp-only on conflict. That means Helios CSV/manual evidence does not reliably update the status surfaces unless Lane 02 P0 is fixed.

Impact:

- Helios CSV imports are useful for guided evidence/gap intake, but they cannot be claimed as automated Helios evidence collection.
- Workspace progress may differ from dashboard/report/Trust Center status until status propagation is fixed.

Recommended slice:

- Keep Helios CSV/manual boundary: never auto-pass CSV evidence.
- Coordinate with Lane 02 P0 for central manual evidence to control-status propagation and score recalculation.
- Add a smoke proving Helios CSV creates only `manual_review`/mapped `fail` statuses and updates dashboard/report status after Lane 02 fix.

Rollback/feature flag:

- If status propagation is added, gate customer-reported status updates if needed with a manual-evidence propagation flag.
- Rollback by disabling propagation; evidence rows remain.

Existing-data migration/backfill:

- Production backfill from historical Helios evidence requires owner approval and dry-run conflict reporting.

Human approval:

- Required before production backfill/recalculation.
- Required for any public claim that Helios is more than manual/CSV-assisted.

### L04-F07: Manual workspace attestations and imported evidence do not propagate status without Lane 02 P0

Classification: partial / cross-lane dependency
Severity: high

Evidence:

- `app/(app)/workspaces/actions.ts:50-61` derives an assessment result and calls `createManualAttestationEvidence`.
- `lib/db/queries/evidence.ts:147-159` routes attestation through `createManualEvidence`.
- `lib/db/queries/evidence.ts:115-130` upserts `orgControlStatuses` with `status: "unknown"` on insert and does not update status on conflict.
- Lane 02 report explicitly identifies this as P0 semantic gap affecting workspaces, Helios CSV, dashboard, reports, Trust Center, and scores.

Impact:

- Pohoda, Money S3, ABRA manual controls, and Helios manual/CSV evidence can look submitted in workspace evidence while wider readiness status remains unknown/stale.
- This is a core activation-loop blocker and should not be fixed ad hoc in each workspace action.

Recommended slice:

- Lane 02 should own the central evidence-to-control-status mapping and recalculation helper.
- Lane 04 implementation should depend on that helper rather than duplicating mapping in workspace/provider code.

Rollback/feature flag:

- Same as Lane 02: optional manual-evidence propagation flag for production rollout.

Existing-data migration/backfill:

- Required only if historical evidence should update current statuses; human-approved dry run first.

Human approval:

- Required for canonical mapping, especially evidence `gap` -> control `fail` versus adding `gap` as a control status.

### L04-F08: Evidence expiry cron/Inngest jobs exist but expiry alert query is stubbed

Classification: absent/partial
Severity: medium

Evidence:

- `app/api/cron/evidence-expiry/route.ts` calls `sendEvidenceExpiryAlerts()` after cron auth.
- `inngest/evidence-expiry-alerts.ts` also schedules `sendEvidenceExpiryAlerts()` via Inngest cron.
- `lib/db/queries/evidence.ts:421-428` implements `listExpiringEvidenceAlerts(targetDates)` as `return []`.
- Lane 02 also found `createManualEvidence` accepts `expiresAt` but does not persist it and schema does not appear to have an evidence expiry column in this query path.

Impact:

- Evidence expiry alerts are effectively no-op despite cron/Inngest scheduling.
- Do not claim automated evidence expiry reminders yet.

Recommended slice:

- Either remove/label expiry scheduling as not implemented, or implement expiry persistence/query and a non-production smoke.
- Avoid customer-visible expiry claims until schema, UI, and alert copy are reconciled.

Rollback/feature flag:

- Gate alert sending behind `ENABLE_EVIDENCE_EXPIRY_ALERTS` until verified.

Existing-data migration/backfill:

- Likely requires additive nullable expiry column if expiry is implemented.
- Backfill optional and should not fabricate expiry for generic manual uploads.

Human approval:

- Required for retention/expiry policy and alert wording.

### L04-F09: Vercel Cron routes and Inngest cron functions duplicate several schedules

Classification: partial / operations risk
Severity: medium

Evidence:

- `vercel.json` schedules `/api/cron/regulation-sync`, `/api/cron/evidence-expiry`, `/api/cron/policy-review-reminders`, and `/api/cron/access-review-reminders`.
- `inngest/regulation-updates.ts`, `inngest/evidence-expiry-alerts.ts`, `inngest/policy-review-reminders.ts`, and `inngest/access-review-reminders.ts` also define cron triggers for overlapping tasks.
- `app/api/inngest/route.ts` serves all Inngest functions.
- Direct cron routes and Inngest crons call the same underlying functions for these tasks.

Impact:

- If both Vercel Cron and Inngest cron scheduling are active in production, reminders/syncs may run twice.
- Some jobs have idempotency/dedup behavior in downstream tables, but not all duplication costs/side effects are proven here.

Recommended slice:

- Pick one scheduler of record per job class.
- If keeping both as fallback, add explicit idempotency keys and documentation that one source is primary and the other disabled or emergency-only.
- Add source smoke that fails on unapproved duplicate schedules.

Rollback/feature flag:

- Use env flags to disable either direct cron execution or Inngest scheduled execution per job.
- Rollback by restoring previous schedules if a scheduler migration fails.

Existing-data migration/backfill:

- None.

Human approval:

- Operations/product-owner approval before changing production schedule ownership.

### L04-F10: Cron routes are protected, but non-production unauthenticated behavior is intentionally permissive

Classification: implemented with caveat
Severity: low-medium

Evidence:

- `lib/http/cron.ts:3-22` requires `Authorization: Bearer ${CRON_SECRET}` when `CRON_SECRET` is set.
- In production, missing `CRON_SECRET` returns 503.
- In non-production, missing `CRON_SECRET` returns no auth error.
- `app/api/cron/*` routes inspected use `getCronAuthError` before work.
- `tests/e2e/security.spec.ts` includes cron auth assertions and Vercel schedule assertions.

Impact:

- Production behavior is safe if environment is configured correctly.
- Local/test permissiveness is acceptable but should be documented and covered by source smoke to avoid accidental public preview environments without secrets.

Recommended slice:

- Keep current production guard.
- Add/source-check that all `/api/cron/**` routes call `getCronAuthError` before side effects, and that preview/staging environments define `CRON_SECRET` if publicly reachable.

Rollback/feature flag:

- Not applicable beyond reverting auth helper changes.

Existing-data migration/backfill:

- None.

Human approval:

- Not required unless changing deployment environment policy.

## Provider status matrix

| Provider/workspace | Current classification | End-to-end status | First-run behavior | Main gaps |
| --- | --- | --- | --- | --- |
| Microsoft 365 | Mostly end-to-end OAuth connector | OAuth callback, encrypted tokens, pending evidence, Graph adapter, first-run enqueue | Implemented on callback | Refresh not wired; durable token lifecycle incomplete |
| GitHub | Partial OAuth/GitHub App connector | Installation callback and adapter checks exist | Missing | No first-run enqueue/pending evidence/activation event; no immediate run parity |
| AWS | End-to-end API-key connector; workspace config/report-only | Credential health, encrypted storage, STS/provider checks, adapter evidence runner | Missing after connect/rotate | No authenticated `/workspaces/aws`; no first-run after connect |
| Hetzner | End-to-end API-key connector; workspace config/report-only | Credential health, encrypted storage, checks, adapter evidence runner | Missing after connect/rotate | No authenticated `/workspaces/hetzner`; server ID optional/static; no first-run after connect |
| OVHcloud | End-to-end only when `serviceName` configured | Credential health/storage and adapter checks exist | Missing after connect/rotate | `serviceName` optional at connect but required by checks; no workspace page |
| ABRA Flexi | Partial live connector plus manual workspace | Basic-auth storage, health/checks, workspace page | Missing after connect/rotate | Only subset automated; split UX under workspace/integration; no first-run after connect |
| Pohoda | Static/manual workspace | Workspace config and attestation UI | Not applicable | No live connector/adapter/API ingestion |
| Money S3 | Static/manual workspace | Workspace config and attestation UI | Not applicable | No live connector/adapter/API ingestion |
| Helios | Manual/CSV-assisted workspace lifecycle | Workspace, CSV import, lifecycle/remediation | Not live automation | No live connector; status propagation depends on Lane 02 |

## Security/compliance/proof-boundary notes

- Credential storage uses encryption helpers for API keys, secrets, passwords, and OAuth tokens. Provider credentials are validated before API-key connector status is saved as connected.
- Microsoft OAuth state and GitHub installation nonce checks prevent simple cross-org/callback substitution. GitHub nonce depends on Redis availability and one-use marker.
- API-key disconnect exists and resets related integration connection state, but this lane did not fully re-audit all downstream cleanup semantics; Lane 03 covers deletion/offboarding more broadly.
- Automated connector evidence is generated by integration runner and mapped to `orgControlStatuses.status`; manual/imported evidence does not propagate status yet due Lane 02 P0.
- Microsoft missing-permission failures are intentionally represented as blocked/error evidence rather than silent pass/manual review; smoke passed.
- Trust Center/public disclosure dependencies are in Lane 03: public metadata/noindex/timing must be fixed before broad public proof claims.
- Public claims must not say Pohoda/Money S3 live integration, Helios automated connector, Microsoft durable after token expiry, API-key connector immediate first evidence, or evidence expiry alerts until the relevant gaps are fixed.

## Top risks

1. First-run gap for API-key and GitHub connectors blocks fresh-user activation feedback after connect.
2. Microsoft token refresh is not wired, so long-lived Microsoft readiness fails after access-token expiry.
3. Manual/workspace/CSV evidence status propagation is broken centrally per Lane 02, causing workspace evidence and dashboard/report/Trust Center status divergence.
4. Cron and Inngest duplicate schedules may double-run reminders/syncs in production.
5. Evidence expiry alerts are scheduled but functionally no-op because the expiry query returns `[]` and expiry is not persisted.
6. Claim-boundary risk: Pohoda/Money S3 are manual only; Helios is CSV/manual only; cloud provider workspaces are config/report-only without authenticated workspace pages.
7. OVHcloud optional `serviceName` creates connected-but-unrunnable check state.

## Recommended implementation slices

### Slice A: API-key connector first-run enqueue

Goal:

- AWS, Hetzner, OVHcloud, and ABRA Flexi produce first evidence/status promptly after successful connect/rotate.

Likely files:

- `lib/connectors/api-key-base/actions.ts`
- `lib/integrations/first-run-enqueue.ts`
- `lib/integrations/locks.ts` if lock naming/trigger metadata changes
- `scripts/smoke-integration-first-run-enqueue.ts`
- Provider-specific source smokes if added

RED command:

- Add/extend smoke asserting `connectApiKeyConnectorAction` enqueues exactly one `integrations/tests.run` event after a successful health check and does not enqueue after failed health.

GREEN commands:

- New/updated API-key first-run smoke
- `npm run smoke:integration-first-run-enqueue`
- `npm run ci:connector-smokes`
- `npm run typecheck`

Rollback/feature flag:

- Use `ENABLE_API_KEY_CONNECTOR_FIRST_RUN` initially.
- Disable flag if provider rate limits, duplicate runs, or Inngest event issues occur.

Existing-data migration/backfill decision:

- No schema migration.
- Optional production bulk enqueue for existing connected API-key integrations only after human approval; otherwise no backfill.

Score/recalculation owner:

- `lib/integrations/runner.ts` remains owner after queued run completes.

Clean verifier instructions:

- Clean worktree, `npm ci --prefer-offline --no-audit --no-fund`, run RED/GREEN smokes and `typecheck` without production credentials.

Human approval items:

- Production bulk enqueue/backfill.

### Slice B: Microsoft token refresh lifecycle

Goal:

- Microsoft 365 remains usable after access token expiry.

Likely files:

- `lib/integrations/microsoft365/client.ts`
- `lib/integrations/microsoft365/oauth.ts`
- `lib/db/queries/integrations.ts`
- `lib/integrations/runner.ts` only if refresh errors need runner-level classification
- `scripts/smoke:microsoft365-permission-failures` or a new expired-token refresh smoke

RED command:

- Add smoke with expired `tokenExpiresAt` and mocked refresh endpoint/client, asserting refresh is called and refreshed access token/expiry are persisted before Graph checks.

GREEN commands:

- New Microsoft refresh smoke
- `npm run smoke:microsoft365-permission-failures`
- `npm run smoke:integration-first-run-enqueue`
- `npm run typecheck`

Rollback/feature flag:

- `ENABLE_MICROSOFT_TOKEN_REFRESH`.
- Revert/disable if refresh flow fails in production; ask users to reconnect as fallback.

Existing-data migration/backfill decision:

- No schema migration. Existing rows may need reconnect if refresh token missing/invalid.

Score/recalculation owner:

- `lib/integrations/runner.ts` after checks complete.

Clean verifier instructions:

- Use mocked token exchange only; no live Microsoft tenant required.

Human approval items:

- Production/customer claim update after live verification.

### Slice C: GitHub first-run parity

Goal:

- GitHub installation callback queues first-run checks and records activation/audit events like Microsoft.

Likely files:

- `app/api/integrations/github/callback/route.ts`
- `lib/integrations/first-run-enqueue.ts`
- Potential pending-evidence helper under `lib/integrations/github/*`
- New source/behavior smoke for GitHub callback lifecycle

RED command:

- Source/behavior smoke asserting callback calls `enqueueIntegrationFirstRun`, records `ConnectorOAuthCompleted`, and records first-run queued/skipped audit event.

GREEN commands:

- New GitHub first-run source smoke
- `npm run smoke:integration-first-run-enqueue`
- `npm run typecheck`

Rollback/feature flag:

- `ENABLE_GITHUB_FIRST_RUN`.

Existing-data migration/backfill decision:

- No schema migration.
- Optional one-time enqueue for existing installations only with approval.

Score/recalculation owner:

- `lib/integrations/runner.ts`.

Human approval items:

- Production bulk enqueue and public readiness claims.

### Slice D: Central manual/import evidence status propagation (depends on Lane 02)

Goal:

- Workspace attestations and Helios CSV/imported evidence update `orgControlStatuses.status` and scores consistently.

Dependency:

- Lane 02 should own canonical mapping and implementation. Lane 04 should not duplicate mapping logic.

Likely files:

- `lib/db/queries/evidence.ts`
- `lib/controls/scorer.ts`
- `app/(app)/workspaces/actions.ts` as dependent caller only
- `lib/workspaces/helios-csv/importer.ts` as dependent caller only
- New smoke for workspace attestation/Helios CSV status propagation

RED command:

- Smoke proving manual attestation with `pass`, `gap`, and `manual_review` currently fails to update `orgControlStatuses.status` and framework score.

GREEN commands:

- New workspace attestation status smoke
- `npm run smoke:helios-csv-import`
- `npm run smoke:helios-evidence-lifecycle`
- `npm run smoke:evidence-state-transitions`
- `npm run typecheck`

Rollback/feature flag:

- Optional `ENABLE_MANUAL_EVIDENCE_STATUS_PROPAGATION`.

Existing-data migration/backfill decision:

- Backfill historical manual/import evidence only after dry-run and human approval.

Score/recalculation owner:

- Central helper in `lib/db/queries/evidence.ts` or `lib/controls/scorer.ts`, as decided by Lane 02.

Human approval items:

- Canonical `gap` mapping and production backfill/recalculation.

### Slice E: Scheduler ownership and duplicate cron/Inngest guard

Goal:

- One scheduler of record per background job, or explicit idempotent fallback design.

Likely files:

- `vercel.json`
- `inngest/*.ts`
- `app/api/cron/*/route.ts`
- `docs/operations/*` if scheduler ownership docs exist or are added
- New source smoke for duplicate scheduled jobs

RED command:

- Source smoke detecting duplicate schedules for the same underlying job between `vercel.json` and Inngest cron triggers.

GREEN commands:

- New scheduler source smoke
- `npm run typecheck` if code changes
- Relevant job smokes for reminders/sync if available

Rollback/feature flag:

- Env flags to disable direct cron routes or Inngest cron handlers per job.
- Revert scheduler config if production monitor shows missed jobs.

Existing-data migration/backfill decision:

- None.

Human approval items:

- Operations approval for production scheduler ownership.

### Slice F: Evidence expiry persistence or no-op cleanup

Goal:

- Stop presenting scheduled expiry alerts as implemented unless evidence expiry data/query exists.

Likely files:

- `lib/db/schema.ts` and migration if persisting expiry
- `lib/db/queries/evidence.ts`
- `lib/evidence/expiry-alerts.ts`
- `app/api/cron/evidence-expiry/route.ts`
- `inngest/evidence-expiry-alerts.ts`
- Evidence vault UI/filter files if customer-visible
- New expiry smoke

RED command:

- Smoke proving evidence with an expiry date appears in `listExpiringEvidenceAlerts`; current code should fail because query returns `[]`.

GREEN commands:

- New expiry smoke
- `npm run db:generate` if schema changes
- `npm run db:migrate` only local/test
- `npm run typecheck`

Rollback/feature flag:

- `ENABLE_EVIDENCE_EXPIRY_ALERTS` disabled until end-to-end tested.
- Additive nullable schema rollback by ignoring column before dropping later.

Existing-data migration/backfill decision:

- Optional; do not infer generic manual evidence expiry. Workspace-specific TTL backfill only with policy approval.

Human approval items:

- Retention/expiry policy and customer-facing reminder wording.

### Slice G: Provider claim/copy alignment for static/manual workspaces

Goal:

- Ensure UI/public copy matches implementation truth: live connector vs manual workspace vs CSV-assisted.

Likely files:

- `app/(app)/integrations/page.tsx`
- `app/(app)/workspaces/*/page.tsx`
- `components/workspaces/workspace-renderer.tsx`
- Marketing/pricing/product copy files if they reference provider readiness
- Copy/source smoke if existing copy hygiene can be extended

RED command:

- Source/copy smoke asserting prohibited overclaims for Pohoda/Money S3 live integrations and Helios automation.

GREEN commands:

- New provider claim-boundary smoke
- `npm run smoke:copy-hygiene`
- Workspace config smokes

Rollback/feature flag:

- Copy-only revert.

Existing-data migration/backfill decision:

- None.

Human approval items:

- Public claim boundary approval, especially Czech ERP integration wording.

## Test/validation matrix

| Area | Existing evidence | Gap / next validation |
| --- | --- | --- |
| Connector adapter source | `npm run ci:connector-smokes` passed | Add first-run enqueue coverage for API-key connectors |
| Microsoft first-run | `npm run smoke:integration-first-run-enqueue` passed | Add expired-token refresh smoke |
| Microsoft permission failure boundaries | `npm run smoke:microsoft365-permission-failures` passed | Verify refresh failure maps to safe recovery |
| GitHub lifecycle | Source has callback and adapter | Add first-run/pending evidence/activation event smoke |
| API-key credential validation | Source plus `smoke:api-key-base` passed | Prove no connected state when health fails, plus first-run after success |
| Workspace configs | Pohoda/Money/ABRA/Helios config smokes passed | Add claim-boundary smoke that config != live connector |
| Helios CSV/lifecycle | CSV import and evidence lifecycle smokes passed | Add status propagation smoke after Lane 02 fix |
| Manual evidence/status | Lane 02 confirms bug | Add central status+score recalculation smoke |
| Cron auth | Source inspected; security E2E has cron assertions | Add source smoke that every cron route calls auth before side effects |
| Scheduler duplication | Source confirms duplicate Vercel/Inngest schedules | Add duplicate-scheduler source smoke and choose owner |
| Evidence expiry | Routes/jobs exist | Add persistence/query smoke or disable claims/jobs |
| Org/auth boundaries | Lane 03 source/smokes passed with caveats | Coordinate Trust Center and test/internal route hardening with Lane 03 |

## Shared-file claims and cross-lane dependencies

Shared files Lane 04 would likely claim for implementation:

- `lib/connectors/api-key-base/actions.ts` - API-key first-run enqueue after successful connect/rotate.
- `lib/integrations/first-run-enqueue.ts` - generic first-run trigger/event metadata beyond Microsoft OAuth.
- `app/api/integrations/github/callback/route.ts` - GitHub first-run/pending evidence/activation parity.
- `lib/integrations/microsoft365/client.ts` and `lib/integrations/microsoft365/oauth.ts` - Microsoft refresh wiring.
- `lib/db/queries/integrations.ts` - refreshed token persistence and existing target selection if helper needed.
- `vercel.json`, `inngest/*.ts`, and `app/api/cron/*/route.ts` - scheduler ownership cleanup.
- `lib/db/queries/evidence.ts`, `lib/controls/scorer.ts`, `lib/activation/evidence-state.ts` - dependent on Lane 02; Lane 04 should not own core status semantics.
- `app/(app)/workspaces/actions.ts` and `lib/workspaces/helios-csv/importer.ts` - dependent callers of central evidence/status behavior.
- `scripts/smoke-integration-first-run-enqueue.ts` and new source smokes - verifier/shared smoke surfaces.

Cross-lane dependencies:

- Lane 02: owns evidence/status semantics, canonical `gap` mapping, score recalculation owner, evidence expiry persistence, and any production backfill/migration guardrails. Lane 04 findings F06/F07/F08 are blocked/dependent on Lane 02 for status/expiry implementation.
- Lane 03: owns auth/org-boundary, public Trust Center disclosure/noindex, offboarding, and internal/test route hardening. Lane 04 cron/test/integration routes should rely on Lane 03 findings for final auth/exposure status.
- Lane 06/legal/copy: public provider readiness claims, ERP integration wording, evidence expiry/retention wording, and Microsoft/GitHub/customer data processor claims.
- Lane 08/ops/observability: scheduler ownership, Inngest/Vercel monitoring, retries, and production background job failure alerting.

Conflict status:

- Potential conflict with Lane 02 over `lib/db/queries/evidence.ts` and status propagation is real. Lane 02 should own the central semantics; Lane 04 should only consume the helper and add integration/workspace coverage.
- Potential conflict with Lane 03 over Trust Center/public disclosure and test/internal route hardening. Lane 03 should own public/auth boundaries; Lane 04 should reference those findings and avoid duplicating fixes.
- Potential conflict with ops lanes over scheduler ownership. Lane 04 identifies duplicate schedules; ops/verifier should approve the scheduler-of-record plan.

## Human approval items

- Any production DB migration, seed, backfill, or score recalculation.
- Any production bulk enqueue of existing connected integrations.
- Canonical mapping from evidence `gap` to control status (`fail` vs adding `gap` as control status), inherited from Lane 02.
- Public claim boundaries for Czech ERP integrations: Pohoda, Money S3, ABRA Flexi, Helios.
- Public/customer claims about Microsoft 365 durable continuous verification after token refresh.
- Scheduler ownership changes for production Vercel Cron vs Inngest cron.
- Evidence expiry/retention policy and alert wording.
- Any live-provider credential testing using real tenant/customer credentials.

## Bottom line

The integration/workspace foundation is real but uneven. Microsoft has the best first-run lifecycle but lacks token refresh. API-key providers have credible health checks, encrypted storage, and adapters, but no immediate first-run enqueue. GitHub has installation/app adapter code but misses first-run and activation parity. Pohoda and Money S3 are static/manual workspaces only. Helios has meaningful CSV/manual lifecycle and passing smokes, but remains customer-reported and is blocked by Lane 02's central manual-evidence status propagation gap. Cron/Inngest coverage exists, but duplicate schedules and stubbed evidence expiry mean production background-job claims should be narrowed until scheduler ownership and expiry persistence are resolved.
