# Entire-Codebase Audit Lane 03: Auth, Org Boundaries, Access Control, Data Exposure, Retention/Deletion

Generated: 2026-06-02 10:10:58 CEST
Mode: audit only; no implementation, commit, push, deploy, production DB, or production Blob operations performed.
Workspace: `/Users/marcozoratto/splnit.eu`

## Scope and exclusions

Scope from lane plan:

- Clerk session usage and route protection.
- API route and server-action authorization.
- Organisation scoping and agency/client cross-org boundaries.
- Public/token routes for Trust Center and vendor assessment.
- Exports, downloads, generated files, private Blob access, and no-store behavior.
- Internal/test/cron/webhook routes.
- GDPR/offboarding deletion, retention, erasure, and Blob cleanup paths.

Explicit exclusions:

- No code implementation.
- No commits, pushes, deploys.
- No production database reads/writes.
- No production Blob reads, signed URL generation, listing, writes, or deletes.
- Source inspection and local smoke commands only.

## Files/directories inspected

Primary instructions/state:

- `AGENTS.md`
- `.hermes/plans/2026-06-02_094729-lane-03-auth-org-boundaries.md`
- `.hermes/state/entire-codebase-audit-ledger.md`

Route protection and auth:

- `proxy.ts`
- `app/api/**/route.ts`
- `app/(app)/**/actions.ts`
- `lib/connectors/api-key-base/actions.ts`
- `lib/stripe/actions.ts`

Downloads/exports/data exposure:

- `app/api/evidence/[evidenceId]/download/route.ts`
- `app/api/policies/[policyId]/download/route.ts`
- `app/api/exports/workspace/route.ts`
- `app/api/exports/workspace/archive/route.ts`
- `app/api/exports/evidence-metadata/route.ts`
- `app/api/audit-log/export/route.ts`
- `app/api/access-reviews/[reviewId]/export/route.ts`
- `app/api/export/compliance-report/route.ts`
- `app/api/frameworks/iso27001/certification-package/route.ts`
- `app/api/questionnaires/export/pdf/route.ts`
- `app/api/questionnaires/export/xlsx/route.ts`
- `app/api/risks/register-report/route.ts`
- `app/api/vendors/supply-chain-report/route.ts`
- `lib/db/queries/workspace-export.ts`
- `lib/db/queries/export.ts`
- `lib/exports/evidence-metadata.ts`
- `lib/http/private-response.ts`

Public/token routes:

- `app/(marketing)/trust/[orgSlug]/page.tsx`
- `app/(marketing)/trust/[orgSlug]/frameworks/[frameworkSlug]/page.tsx`
- `app/(marketing)/trust/[orgSlug]/actions.ts`
- `app/(marketing)/trust/[orgSlug]/opengraph-image.tsx`
- `app/api/trust/[orgSlug]/route.ts`
- `lib/db/queries/trust-center.ts`
- `lib/trust-center/access.ts`
- `lib/trust-center/public-model.ts`
- `lib/trust-center/public-copy.ts`
- `components/trust-center/public-trust-ui.tsx`
- `app/vendor-assessment/[token]/page.tsx`
- `app/vendor-assessment/[token]/actions.ts`
- `lib/db/queries/vendors.ts`
- `lib/vendors/access.ts`

Agency/client boundaries:

- `app/(app)/agency/actions.ts`
- `app/(app)/agency/signup/actions.ts`
- `app/(app)/clients/actions.ts`
- `lib/db/queries/agencies.ts`
- `lib/db/queries/consultant-clients.ts`

Deletion/retention/Blob cleanup:

- `app/api/webhooks/clerk/route.ts`
- `app/api/webhooks/stripe/route.ts`
- `lib/clerk/sync.ts`
- `lib/blob/cleanup.ts`
- `lib/db/schema.ts`
- `lib/db/migrations/0016_retain_audit_logs_on_org_cleanup.sql`
- `docs/operations/offboarding-runbook.md`
- `docs/legal/retention-policy.md`
- `docs/legal/data-processing-map.md`
- `scripts/cleanup-historical-smoke-organisations.mjs`
- `scripts/smoke-org-boundaries.ts`

Internal/test/cron/webhook routes:

- `app/api/internal/health/route.ts`
- `app/api/test/workspace-attestation/route.ts`
- `app/api/health/route.ts`
- `app/api/readiness/route.ts`
- `app/api/cron/**/route.ts`
- `lib/http/cron.ts`
- `app/api/inngest/route.ts`
- `app/api/integrations/*/callback/route.ts`

Smoke/source checks:

- `scripts/smoke-org-boundaries.ts`
- `scripts/smoke-export-endpoints-source.ts`
- `scripts/smoke-trust-center-public-disclosure.ts`
- `scripts/smoke-vendor-questionnaire-delivery-status.ts`
- `tests/e2e/security.spec.ts`

## Commands run and results

Initial status:

```text
git status --short
M docs/README.md
?? .hermes/state/entire-codebase-audit-ledger.md
?? docs/product/implementation-gap-audit.md
```

Inventory/source discovery:

```text
git ls-files 'app/api/**/route.ts'
git ls-files 'app/(app)/**/actions.ts'
git ls-files 'app/vendor-assessment/**' 'app/(marketing)/trust/**'
git ls-files 'lib/auth*' 'lib/db/queries/**' 'lib/exports/**' 'lib/evidence/**' 'proxy.ts' 'scripts/*offboard*' 'scripts/*cleanup*' 'scripts/*delete*' 'scripts/*retention*' 'docs/operations/**' 'docs/legal/retention-policy.md' 'docs/legal/data-processing-map.md' 'scripts/smoke-org-boundaries.ts'
```

Auditor D required searches performed:

```text
file search: *{offboard,delete,retention,cleanup}*
content search: deleteOrg|deleteOrganisation|deleteOrganization|removeOrg|offboard|erasure|retention|data subject|right to erasure
content search: del\(|deleteBlob|blob\.delete|put\(|list\(|downloadUrl|signed|BLOB_READ_WRITE_TOKEN|@vercel/blob
```

Relevant file-search result for deletion/retention/cleanup terms:

```text
docs/operations/offboarding-runbook.md
docs/legal/retention-policy.md
app/(app)/training/delete-record-form.tsx
scripts/cleanup-historical-smoke-organisations.mjs
lib/db/migrations/0016_retain_audit_logs_on_org_cleanup.sql
lib/blob/cleanup.ts
```

Lane verification commands:

```text
npm run smoke:org-boundaries
Org-boundary smoke passed.

npm run smoke:export-endpoints-source
Export endpoint source smoke passed.

npm run smoke:trust-center-public-disclosure
Trust Center public disclosure smoke passed.

npm run smoke:vendor-questionnaire-delivery-status
Vendor questionnaire delivery status smoke passed.
```

## Overall classification

PARTIAL.

Implemented and passing:

- Protected app routes are Clerk-protected through `proxy.ts` when Clerk is configured.
- Most authenticated API routes and app server actions derive `orgId` from `auth()`/Clerk session rather than trusting user input.
- Export/download routes inspected are authenticated, org-scoped, and use private no-store headers.
- Vendor assessment links are signed token routes with expiry and one-time status transition.
- Agency/client boundaries have explicit relationship checks in the agency model and consultant-client model.
- Internal health route requires an internal token or cron secret.
- Test workspace-attestation route is hard-disabled in Vercel production and requires explicit test opt-in otherwise.
- Clerk `organization.deleted` path deletes known evidence/policy Blob URLs before deleting the app organisation row.

Partial/blocked/absent:

- Public Trust Center framework metadata currently exposes exact `lastAssessedAt` timing through `formatDateTime()` in metadata, and Trust Center token pages are not explicitly noindex.
- `deleteOrganisationFromClerk()` deletes evidence and policy/gap-report Blob URLs, but does not run inside an auditable/idempotent deletion job and fails the whole org-delete path if Blob deletion fails.
- App audit logs intentionally no longer have an FK cascade, but current retention docs still say DB audit logs cascade on organisation deletion. This is a documentation/code conflict and a retention exception that needs explicit approval.
- There is no customer-facing granular right-to-erasure workflow for individual uploaded evidence files, generated reports, questionnaire artifacts, vendor submissions, or audit logs; docs explicitly defer per-record deletion.
- Vendor/dashboard residual deletion is manual/documented only for Clerk/Vercel/Neon/Inngest/Resend/Loops/Sentry/Upstash/PostHog/OpenAI/Stripe.
- No automated regression smoke was found that proves Clerk org deletion removes all intended app rows and Blob objects; the existing production-readiness smoke does some cleanup, but it is not an offboarding verification test and is production-sensitive.

## Findings

### L03-F01: Public Trust Center framework metadata exposes exact evidence timing and token pages lack explicit noindex

Classification: partial / data exposure risk
Severity: medium
Evidence:

- `app/(marketing)/trust/[orgSlug]/frameworks/[frameworkSlug]/page.tsx:57-63` builds metadata with `Latest public evidence date ${formatDateTime(data.framework.lastAssessedAt, locale)}`.
- `app/(marketing)/trust/[orgSlug]/page.tsx:29-48` metadata has title/description only and no `robots` noindex for tokenized `?access=` variants.
- `app/(marketing)/trust/[orgSlug]/frameworks/[frameworkSlug]/page.tsx:32-63` metadata also has no `robots` noindex.
- `app/vendor-assessment/[token]/page.tsx:17-22` does set `robots: { follow: false, index: false }`, showing the expected token-route pattern exists elsewhere.
- `scripts/smoke-trust-center-public-disclosure.ts` checks many public disclosure terms, but does not assert robots/noindex and does not catch the framework metadata exact timestamp because it looks for broad source strings/patterns.

Impact:

- Exact public evidence timing can be attacker-useful and conflicts with the repository rule that Trust Center pages must not expose test timing details publicly.
- Tokenized access URLs can be shared/indexed unless the platform-level behavior prevents it; source does not explicitly noindex them.

Recommended slice:

1. Add Trust Center metadata robots controls for public/token pages, especially when `access` is present.
2. Remove exact `formatDateTime(lastAssessedAt)` from public framework metadata or replace with coarse, approved wording.
3. Extend `scripts/smoke-trust-center-public-disclosure.ts` to assert no exact date/time metadata exposure and explicit robots behavior.

Rollback/feature flag:

- Metadata-only change; rollback by reverting metadata fields. No persisted state.

Existing-data migration/backfill:

- None.

Human approval:

- Required for public Trust Center disclosure boundary changes.

### L03-F02: Audit-log retention is intentionally decoupled from org deletion, but docs claim cascade deletion

Classification: partial / retention exception conflict
Severity: high for compliance accuracy; medium for direct security
Evidence:

- `lib/db/schema.ts:1106-1122` defines `auditLogs.clerkOrgId` as plain `text("clerk_org_id").notNull()` with no FK to `organisations`.
- `lib/db/migrations/0016_retain_audit_logs_on_org_cleanup.sql:1` drops the audit-log org FK if present.
- `lib/clerk/sync.ts:38-68` `deleteOrganisationFromClerk()` deletes Blob URLs, `orgControlStatuses`, `trustCenterRequests`, and `organisations`, but does not delete or anonymize `auditLogs`.
- `docs/legal/retention-policy.md:38` says "DB audit logs cascade on organisation deletion".
- `docs/operations/offboarding-runbook.md:74` says to confirm organisation-scoped database rows were removed by cascade or explicit cleanup, without clearly carving out retained audit logs.

Impact:

- Offboarding operators and counsel could believe audit logs are deleted when they are retained.
- Retained audit logs may contain user IDs, entity IDs, vendor/client IDs, metadata, and other personal or customer data. If retention is intended, it needs an explicit legal/security retention basis, minimisation/anonymisation rule, and export/deletion exception wording.

Recommended slice:

1. Decide whether audit logs should be retained, deleted, or anonymized on org deletion.
2. If retained: document as an explicit legal/security retention exception, define retention period, and scrub/minimise metadata as needed.
3. If deleted/anonymized: add tested deletion/anonymization behavior in `deleteOrganisationFromClerk()` or a dedicated offboarding job.
4. Add source/regression smoke that reconciles schema, migration, deletion code, and retention docs.

Rollback/feature flag:

- Documentation-only clarification has no rollback beyond revert.
- If behavior changes, gate behind a deletion-mode flag or explicit offboarding command until counsel approves.

Existing-data migration/backfill:

- Required if anonymizing existing audit logs or restoring FK cascade.

Human approval:

- Required for legal/compliance retention posture.

### L03-F03: Org deletion/Blob cleanup path exists but is not idempotent/auditable enough for production offboarding

Classification: implemented but partial
Severity: medium-high
Evidence:

- `app/api/webhooks/clerk/route.ts:73-76` invokes `deleteOrganisationFromClerk(event.data.id)` on Clerk `organization.deleted`.
- `lib/clerk/sync.ts:40-54` collects `evidence.blobUrl` and `policies.blobUrl`, then calls `deleteBlobUrls()` before deleting database rows.
- `lib/blob/cleanup.ts:20-25` requires `BLOB_READ_WRITE_TOKEN` and calls Vercel Blob `del()` in batches.
- `lib/clerk/sync.ts:56-67` explicitly deletes `orgControlStatuses` and `trustCenterRequests`, then deletes `organisations` to trigger cascades.
- `docs/operations/offboarding-runbook.md:64-88` documents manual export/delete/post-delete checks.

Risks:

- If Blob deletion fails or `BLOB_READ_WRITE_TOKEN` is missing while Blob rows exist, `deleteOrganisationFromClerk()` throws before DB deletion. The Clerk webhook can fail and the app org/data can remain after the upstream Clerk org is gone.
- There is no explicit offboarding job table, retry queue, deletion ledger, or idempotent per-step status in source.
- There is no automated source/runtime smoke proving all org-scoped tables plus known Blob URL classes are handled.
- Blob cleanup only knows URLs stored in `evidence.blobUrl` and `policies.blobUrl`; any future Blob URL stored elsewhere will need explicit collection or a central Blob ownership table.

Recommended slice:

1. Add an idempotent offboarding/deletion service that records steps and failures without silently losing cleanup obligations.
2. Keep Blob deletion scoped to URLs already read from app DB for that org; do not list production Blob by prefix as a default cleanup mechanism.
3. Add a local/source smoke that asserts all schema tables with `clerk_org_id` are cascade-covered or explicitly handled, and that all Blob URL columns are collected.
4. Add webhook failure/retry guidance to the runbook.

Rollback/feature flag:

- Keep current Clerk webhook path; introduce the new offboarding service behind a feature flag/manual admin command until verified.

Existing-data migration/backfill:

- Optional if introducing a deletion ledger table. Required if adding a Blob ownership table.

Human approval:

- Required before changing production offboarding behavior.

### L03-F04: Granular right-to-erasure workflows are mostly absent

Classification: absent/partial
Severity: medium-high
Evidence from required search terms and inspected paths:

- Required terms searched: `deleteOrg`, `deleteOrganisation`, `deleteOrganization`, `removeOrg`, `offboard`, `erasure`, `retention`, `data subject`, `right to erasure`.
- File search for `*offboard*`, `*delete*`, `*retention*`, `*cleanup*` found docs/runbooks, test cleanup, `app/(app)/training/delete-record-form.tsx`, `lib/blob/cleanup.ts`, and a migration; no broad customer DSR/erasure workflow was found.
- `docs/legal/retention-policy.md:37` says per-record delete/export workflows should be added if customers need granular deletion before workspace termination.
- `docs/legal/data-processing-map.md:22` says granular per-record deletion may be needed before workspace termination.
- `docs/operations/offboarding-runbook.md:64-88` covers workspace termination, not routine per-record right-to-erasure handling.

Covered deletion paths:

- Clerk user deletion removes `profiles` for the user: `lib/clerk/sync.ts:99-103`.
- Clerk org deletion removes app org-scoped rows by cascade/explicit cleanup and deletes known Blob URLs: `lib/clerk/sync.ts:38-68`.
- Integration disconnect deletes integration token rows and resets related controls: `lib/connectors/api-key-base/actions.ts:220-246` and integration queries.
- Training has a delete-record UI surface, but this is a narrow product delete feature rather than a full GDPR erasure flow.

Absent or incomplete per-record erasure areas:

- Uploaded evidence files and metadata.
- Generated policies, gap reports, and generated artifacts.
- Questionnaire artifacts and AI-generated evidence rows.
- Vendor assessment submissions and vendor contact details.
- Incident reports and affected-person data.
- Audit logs and security events.
- Trust Center access-request requester emails/companies after expiry.

Recommended slice:

1. Define DSR scope matrix by data set: delete, anonymize, retain under exception, or customer-controlled export/delete.
2. Add per-record delete/anonymize actions for evidence and generated documents first, including Blob cleanup.
3. Add expiry cleanup for Trust Center requests and vendor assessment tokens.
4. Add explicit audit-log retention/anonymization policy.
5. Add tests that verify deleted records are not retrievable by app routes and associated Blob URLs are queued/deleted.

Rollback/feature flag:

- Add delete features behind explicit UI confirmation and/or admin-only feature flag until counsel approves.

Existing-data migration/backfill:

- Needed for expiry cleanup jobs and any anonymization markers/legal-hold flags.

Human approval:

- Required for DSR/legal-hold/retention decisions.

### L03-F05: Vendor assessment token routes are generally sound, but token route should keep no-store response discipline

Classification: implemented with minor hardening recommendation
Severity: low-medium
Evidence:

- `app/vendor-assessment/[token]/page.tsx:17-22` sets noindex/nofollow metadata.
- `lib/db/queries/vendors.ts:251-298` parses token assessment ID, joins assessment/vendor/org, verifies signed token with assessment/org/vendor IDs, rejects invalid/expired/non-sent tokens.
- `lib/db/queries/vendors.ts:300-350` re-checks token status and updates only matching id/org/vendor/status=`sent` rows, making submission effectively one-time.
- `npm run smoke:vendor-questionnaire-delivery-status` passed.

Residual risk:

- The page is dynamic, but source did not show explicit no-store headers for the rendered token page. Next dynamic rendering normally avoids static cache, but token pages benefit from explicit cache-control where possible.

Recommended slice:

- Add/verify no-store response behavior for vendor token routes in framework-supported way and add source smoke coverage.

Rollback/feature flag:

- Header-only; revert if framework behavior conflicts.

Existing-data migration/backfill:

- None.

Human approval:

- Not required unless changing public/vendor disclosure content.

### L03-F06: Export/download org scoping is strong, with archive load-test and Blob dependency caveats

Classification: implemented with caveats
Severity: low-medium
Evidence:

- `app/api/evidence/[evidenceId]/download/route.ts:53-63` requires `auth()` user/org and calls `getEvidenceForOrg({ clerkOrgId: session.orgId, evidenceId })`.
- `app/api/evidence/[evidenceId]/download/route.ts:69-85` fetches private Blob by stored URL and returns `withPrivateNoStore()` headers.
- `app/api/exports/workspace/archive/route.ts:152-170` requires user/org and loads workspace/evidence/policy files only for `session.orgId`.
- `app/api/exports/workspace/archive/route.ts:177-185` returns 503 if Blob files exist but `BLOB_READ_WRITE_TOKEN` is missing.
- `app/api/exports/workspace/archive/route.ts:221-226` returns ZIP with `withPrivateNoStore()` headers.
- `scripts/smoke-export-endpoints-source.ts` asserts org-scoping/no-store/auth requirements for key exports and passed.
- `docs/operations/offboarding-runbook.md:59-62` notes workspace archive should be load-tested before large customer workspaces rely on it.

Caveats:

- Archive generation reads all Blob-backed files sequentially into memory (`arrayBuffer()` then ZIP). This is more Lane 07/performance than Lane 03, but it matters for offboarding/export reliability.
- The audit intentionally did not perform production Blob reads or archive downloads.

Recommended slice:

- Keep source protections. Add load-test/non-production archive smoke for representative Blob count/size and document max supported archive size.

Rollback/feature flag:

- Feature flag large archive generation if limits are introduced.

Existing-data migration/backfill:

- None.

Human approval:

- Not required for technical load limits unless customer-facing export promises change.

## Security/compliance/proof-boundary notes

- Public Trust Center must stay category/aggregate-only and avoid individual control IDs, filenames, exact test timing, or overclaims. Current smoke passes, but metadata should be tightened.
- Vendor assessment token route follows a better noindex pattern than Trust Center token routes.
- The repo contains legal/operations drafts, not final counsel-approved retention policy. Multiple docs state counsel/business-owner review is still needed.
- Production vendor/dashboard retention is not enforceable from this repo and remains a residual manual task.
- No production Blob operations were performed; Blob conclusions are source-trace only.
- No production DB operations were performed; DB deletion conclusions are source/schema trace only.

## Top risks

1. Audit-log retention mismatch: schema/migration retain audit logs while docs say cascade deletion.
2. Public Trust Center metadata leaks exact evidence timing and token pages lack explicit noindex.
3. Org deletion depends on synchronous Blob deletion and lacks an auditable/idempotent offboarding job/ledger.
4. Granular right-to-erasure workflows are absent for most customer data classes.
5. Trust Center request expiry/cleanup is not automated beyond explicit org deletion.
6. Export archive reliability for large Blob-backed workspaces is unproven by this audit.

## Recommended implementation slices

### Slice A: Trust Center public/token metadata hardening

Likely files:

- `app/(marketing)/trust/[orgSlug]/page.tsx`
- `app/(marketing)/trust/[orgSlug]/frameworks/[frameworkSlug]/page.tsx`
- `scripts/smoke-trust-center-public-disclosure.ts`

RED command:

- Add failing source assertions for no exact date/time metadata and noindex behavior, then run `npm run smoke:trust-center-public-disclosure`.

GREEN command:

- `npm run smoke:trust-center-public-disclosure`
- Optional: `npm run typecheck`

Subagent tasks:

1. Add failing smoke assertions.
2. Adjust metadata and robots behavior.
3. Re-run smoke/typecheck.

Rollback/feature flag:

- Revert metadata changes. No state.

Existing-data migration/backfill:

- None.

Human approval:

- Required for public disclosure boundary.

### Slice B: Audit-log retention decision and doc/code alignment

Likely files:

- `lib/db/schema.ts`
- `lib/db/migrations/*` if behavior changes
- `lib/clerk/sync.ts` if deletion/anonymization changes
- `docs/legal/retention-policy.md`
- `docs/operations/offboarding-runbook.md`
- New/updated smoke script under `scripts/`

RED command:

- Source smoke that fails on mismatch between audit-log schema, migration, deletion code, and docs.

GREEN command:

- New source smoke passes.
- `npm run typecheck` if code changes.

Subagent tasks:

1. Human/counsel chooses retention/delete/anonymize behavior.
2. Align docs to decision.
3. If behavior changes, implement small tested deletion/anonymization step.
4. Add regression smoke.

Rollback/feature flag:

- For behavior change, use explicit offboarding-mode flag or revert to retain-only behavior.

Existing-data migration/backfill:

- Required if anonymizing/deleting existing retained audit logs or re-adding FK cascade.

Human approval:

- Required.

### Slice C: Idempotent offboarding/deletion service and Blob cleanup verification

Likely files:

- `lib/clerk/sync.ts`
- `lib/blob/cleanup.ts`
- `lib/db/schema.ts` if adding deletion ledger
- `app/api/webhooks/clerk/route.ts`
- `docs/operations/offboarding-runbook.md`
- New tests/smoke script under `scripts/`

RED command:

- Source/schema smoke enumerating all `clerk_org_id` tables and Blob URL columns, failing if not cascade-covered or explicitly handled.

GREEN command:

- New smoke passes.
- `npm run smoke:org-boundaries`
- `npm run typecheck`

Subagent tasks:

1. Build source inventory smoke.
2. Add idempotent deletion step tracking or documented retry-safe helper.
3. Update runbook with webhook failure/retry behavior.
4. Verify with local/test-only data; no production Blob operations.

Rollback/feature flag:

- Keep existing Clerk webhook path; gate new deletion orchestration until verified.

Existing-data migration/backfill:

- Required if adding a deletion ledger table or Blob ownership table.

Human approval:

- Required before production offboarding behavior changes.

### Slice D: Granular DSR/per-record deletion roadmap

Likely files:

- `docs/legal/retention-policy.md`
- `docs/legal/data-processing-map.md`
- `docs/operations/offboarding-runbook.md`
- Later implementation candidates: evidence/policies/generated-artifacts/vendor/trust-center query/action files.

RED command:

- Documentation/source smoke asserting a DSR matrix exists and each data class is classified.

GREEN command:

- New DSR matrix smoke passes.

Subagent tasks:

1. Create DSR data-class matrix: delete/anonymize/retain/export/manual vendor task.
2. Pick first implementable product slice, likely evidence file deletion with Blob cleanup.
3. Add per-record tests before implementing behavior.

Rollback/feature flag:

- Feature flag destructive UI/actions.

Existing-data migration/backfill:

- Required for deletion markers/legal holds if introduced.

Human approval:

- Required.

## Test/validation matrix

| Area | Existing evidence | Gap |
| --- | --- | --- |
| Org-boundary DB queries | `npm run smoke:org-boundaries` passed | Add schema-wide org-scoped table/deletion coverage smoke |
| Export/download auth and no-store | `npm run smoke:export-endpoints-source` passed | Load-test archive in non-prod; include all download routes in source smoke |
| Trust Center disclosure | `npm run smoke:trust-center-public-disclosure` passed | Add metadata/noindex exact-time assertions |
| Vendor token route | `npm run smoke:vendor-questionnaire-delivery-status` passed | Add no-store/header assertion if feasible |
| Internal/test routes | Source inspection shows token/production gates | Add source smoke for all `/api/test` and `/api/internal` routes |
| Clerk org deletion | Source path exists | Add local/test deletion smoke that proves rows and Blob URL collection behavior without production Blob |
| Retention exceptions | Docs exist | Resolve audit-log conflict and counsel approvals |
| DSR granular erasure | Mostly absent | Add DSR matrix and first per-record delete flow |

## Shared-file claims and cross-lane dependencies

Shared-file claims likely to affect other lanes:

- `app/(marketing)/trust/[orgSlug]/page.tsx` and framework page: public disclosure/SEO/i18n lanes may also touch metadata and copy.
- `lib/db/schema.ts` and migrations: schema/deletion/retention changes affect DB/migration lanes.
- `lib/clerk/sync.ts`, `lib/blob/cleanup.ts`, and `app/api/webhooks/clerk/route.ts`: deletion/offboarding changes affect reliability/ops/security lanes.
- `docs/legal/retention-policy.md`, `docs/legal/data-processing-map.md`, `docs/operations/offboarding-runbook.md`: legal/compliance docs likely shared with legal/copy/ops lanes.
- `scripts/smoke-trust-center-public-disclosure.ts`, `scripts/smoke-export-endpoints-source.ts`, `scripts/smoke-org-boundaries.ts`: smoke changes may be shared with verifier lanes.

Cross-lane dependencies:

- Lane 01/architecture or DB lane: audit-log retention schema decision and deletion ledger/backfill.
- Lane 04/Trust Center/public claims: public metadata disclosure and noindex policy.
- Lane 06/legal/copy: retention, DSR, DPA/offboarding wording, vendor residual retention.
- Lane 07/performance/reliability: workspace archive large Blob export load limits.
- Lane 08/observability/ops: offboarding job retry/ledger and webhook failure monitoring.

## Human approval items

- Public Trust Center disclosure/noindex/timing boundary.
- Audit-log retention/delete/anonymize decision and exact retention period.
- DSR/right-to-erasure scope and legal-hold exceptions.
- Production offboarding behavior that deletes/anonymizes customer data.
- Vendor/dashboard residual retention wording for Clerk, Vercel/Blob, Neon, Inngest, Resend/Loops, Sentry, Upstash, PostHog, OpenAI, and Stripe.
- Any agency/client cross-org behavior change.

## Final notes

The lane is not blocked for source-level audit: required files, routes, deletion/offboarding terms, Blob paths, and lane smoke commands were inspected. The product is not fully complete for production-grade GDPR/offboarding because granular DSR deletion, audit-log retention alignment, explicit public Trust Center token/noindex behavior, and auditable deletion retry mechanics remain open.
