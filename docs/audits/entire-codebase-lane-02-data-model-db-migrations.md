# Entire-Codebase Audit Lane 02: Data Model, DB Schema, Migrations, Seeds, Status Semantics

Date: 2026-06-02
Lane: 02 - Data Model, DB Schema, Migrations, Seeds, Status Semantics
Mode: read-only source audit; no implementation; no commit; no deploy; no production DB/Blob writes
Repository: `/Users/marcozoratto/splnit.eu`

## Scope and exclusions

In scope:

- DB schema integrity in `lib/db/schema.ts`.
- Drizzle configuration and migration journal/schema shape.
- Production migration guard scripts and operations documentation.
- Seed and targeted seed behavior, especially canonical Helios controls.
- Evidence/status/progress semantics across manual, imported, connector, dashboard, report, Trust Center, workspace, and score surfaces.
- Tenant scoping at query level for inspected high-risk reads/writes.
- Backfill/recalculation/rollback/flag guardrails for recommended fixes.
- Shared-file claims and impact on Lane 01 implementation plans touching evidence/status.

Explicit exclusions:

- No production DB connection, migration, seed, broad seed, backfill, or Blob write was run.
- No code was implemented.
- No commit, push, or deploy was performed.
- No legal/compliance posture decisions were made.
- No `.hermes/plans/*` implementation plan was created because this lane has not yet been independently verified; the lane plan says to write plans only for findings accepted by a verifier.

## Files/directories inspected

Primary files inspected:

- `AGENTS.md`
- `.hermes/plans/2026-06-02_094729-lane-02-data-model-db-migrations.md`
- `.hermes/state/entire-codebase-audit-ledger.md`
- `docs/product/implementation-gap-audit.md`
- `package.json`
- `drizzle.config.ts`
- `lib/db/schema.ts`
- `lib/db/migrations/meta/_journal.json`
- `lib/db/queries/evidence.ts`
- `lib/db/queries/controls.ts`
- `lib/db/queries/workspace-export.ts` via targeted search
- `lib/db/queries/integrations.ts` via targeted search
- `lib/activation/evidence-state.ts`
- `lib/controls/scorer.ts`
- `lib/integrations/runner.ts`
- `lib/workspaces/control-seeds.ts`
- `lib/workspaces/helios/lifecycle.ts`
- `lib/workspaces/helios-csv/importer.ts`
- `app/(app)/workspaces/actions.ts`
- `scripts/seed.ts`
- `scripts/seed-helios-controls.ts`
- `scripts/check-production-migration-drift.ts`
- `scripts/run-production-migrations-safe.ts`
- `scripts/verify-helios-production-seed-readiness.ts`
- `docs/operations/production-migration-discipline.md`
- `docs/operations/production-migration-0028-great-wasp-2026-06-01.md`
- `docs/operations/helios-production-seed-readiness.md`
- `docs/operations/helios-production-seed-window-checklist.md`

Inventory from read-only file search:

- `lib/db/migrations/*.sql`: 29 files, `0000_warm_nico_minoru.sql` through `0028_great_wasp.sql`.
- `lib/db/migrations/meta/_journal.json`: 29 entries with matching tags through `0028_great_wasp`.
- Seed scripts found: `scripts/seed.ts`, `scripts/seed-helios-controls.ts`, `scripts/verify-helios-production-seed-readiness.ts`, and Helios/onboarding smoke scripts.
- Migration guard scripts found: `scripts/check-production-migration-drift.ts`, `scripts/run-production-migrations-safe.ts`.
- No files matching `scripts/*backfill*` were found.

## Commands/tool actions run and results

Read-only repository inspection was performed with file/search tools.

A terminal command intended to gather `git status --short` and package script names was blocked by the tool consent layer before execution. I did not retry the same terminal outcome. As a result:

- Fresh `git status --short` was not available from this lane.
- I did not run npm smokes locally during this lane.
- I relied on source inspection plus the audit ledger's T0 baseline and existing operations logs for command-history evidence.

Relevant existing command evidence from inspected files:

- `.hermes/state/entire-codebase-audit-ledger.md` records T0 baseline:
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - `npm run build` passed.
  - Lane-relevant smokes in T0 included passes for `smoke:helios-control-seeding`, `smoke:evidence-state-transitions`, `smoke:knowledge-layer`, `smoke:mapping-review-schema`, `smoke:source-documents`, `smoke:reviewed-article-links`, `smoke:org-boundaries`, `smoke:helios-evidence-provenance`, `smoke:helios-live-attestation`, `smoke:helios-csv-import`, and others.
  - Known T0 failures unrelated or adjacent include `smoke:nis2-evidence-templates` and locale/layer smokes.
- `docs/operations/production-migration-0028-great-wasp-2026-06-01.md` records prior production migration execution for `0028_great_wasp` with post-migration drift `ok: true`, expected count 29, production count 29, no missing/extra migrations, and Helios seed readiness 19/19 controls and mappings.

Because this lane did not run fresh local smokes, final classification is audit confidence from source plus existing ledger/ops evidence, not clean verifier PASS.

## Implemented / partial / blocked / absent classification

### 1. Schema baseline and migration chain

Classification: implemented with caveats.

Evidence:

- `drizzle.config.ts` points to `./lib/db/schema.ts`, outputs to `./lib/db/migrations`, uses PostgreSQL, `strict: true`, `verbose: true`, and throws if `DATABASE_URL` is absent.
- `lib/db/migrations/meta/_journal.json` contains 29 ordered entries, indexes 0 through 28, latest tag `0028_great_wasp`.
- File inventory found matching SQL migrations for each journal tag from `0000` through `0028`.
- `docs/operations/production-migration-0028-great-wasp-2026-06-01.md` records production at expected count 29 after `0028_great_wasp`.

Caveats:

- I did not run `drizzle-kit check/generate/migrate` locally due the terminal block and no local DB check.
- Most status columns are `text` with TypeScript types/checks only in selected tables, not DB enum/check coverage across all status-bearing tables.
- Several org-scoped tables use `clerkOrgId text` without direct FK to `organisations.clerkOrgId`; some intentionally retain records after org cleanup, but others are structurally less constrained than tables with FK.

### 2. Production migration guardrails

Classification: implemented.

Evidence:

- `scripts/run-production-migrations-safe.ts` requires `SPLNIT_CONFIRM_PRODUCTION_MIGRATION=I_UNDERSTAND_PRODUCTION_MIGRATIONS`, refuses local targets, checks migration-relevant source cleanliness, checks HEAD landed in base ref, verifies applied migration hashes against committed SQL, runs `drizzle-kit migrate`, then runs `check:production-migration-drift`.
- `scripts/check-production-migration-drift.ts` uses a read-only transaction, compares expected journal count to applied production count, refuses local DB unless `--allow-local`, reports redacted host classification and missing/extra counts.
- `docs/operations/production-migration-discipline.md` documents no raw production `drizzle-kit migrate`, no production seed while drift is red, and exact drift recovery sequence.

Caveats:

- `check-production-migration-drift.ts` chooses from both production-specific env vars and generic `DATABASE_URL`; this is acceptable for read-only checks but increases operator-target ambiguity. The production wrapper itself uses production-specific env vars only.
- No fresh drift check was run by this lane.

### 3. Seeds and canonical controls

Classification: implemented with caveats.

Evidence:

- `scripts/seed.ts` is mostly idempotent via `onConflictDoUpdate` and updates frameworks, controls, framework mappings, source documents, integration tests, and evidence templates.
- `scripts/seed.ts` deliberately deletes all ISO27001 framework-control mappings before reseeding ISO mappings. This is controlled by framework ID but is still a broad destructive reconciliation within the ISO mapping subset.
- `scripts/seed-helios-controls.ts` is a targeted Helios seed. It asserts canonical keys, upserts the NIS2 framework, upserts only 19 permanent `helios-*` controls, reconciles only NIS2 framework-control rows for those Helios control IDs, and does not delete control rows.
- `lib/workspaces/control-seeds.ts` declares `HELIOS_CANONICAL_CONTROL_KEYS` and states Helios keys are permanent evidence identifiers; rename/split/removal requires explicit migration/backfill.
- `scripts/verify-helios-production-seed-readiness.ts` is read-only and verifies 19 expected Helios controls, 19 NIS2 mappings, no duplicates, no missing expected keys, and no unexpected `helios-*` keys.
- `docs/operations/helios-production-seed-window-checklist.md` bans broad `npm run db:seed` in the production seed window and requires verifier-before/after plus a second idempotency run.

Caveats:

- There is no generic seed dry-run mode for `scripts/seed.ts`.
- No `scripts/*backfill*` exist for historical data correction.
- Full `db:seed` is not safe to run broadly in production; docs correctly prohibit it for Helios seed windows.
- Existing ledger shows `smoke:nis2-evidence-templates` failing at T0, so evidence template completeness is partial and needs Lane 03/knowledge-layer follow-up before claims relying on NIS2 evidence templates.

### 4. Evidence/status/progress semantics

Classification: partial; P0 issue confirmed by source.

The current model separates:

- Evidence collection state: `evidence.assessmentResult`, `evidence.collectionStatus`, `evidence.source`, `evidence.confidence`, `evidence.blockedReason`.
- Control status state: `orgControlStatuses.status`, `lastTestedAt`, `lastEvidenceAt`.
- Framework score: `orgFrameworks.score` recalculated by `recalculateFrameworkScore` from `orgControlStatuses.status`.

Implemented and good:

- `lib/activation/evidence-state.ts` defines clear evidence states and default confidence by source:
  - connector: high
  - manual: medium
  - intake: low
  - imported: explicit confidence required
- `createManualEvidence` stores dimensional evidence (`assessmentResult`, `collectionStatus`, `confidence`, `source`, `blockedReason`) and prevents Helios CSV `pass` evidence by file type.
- `createHeliosCsvImportEvidence` permits only `manual_review` or `gap`.
- `lib/workspaces/helios-csv/importer.ts` maps CSV candidates into manual-review/gap evidence with provenance in `snapshotData`.
- `lib/integrations/runner.ts` propagates connector run result status into `orgControlStatuses.status` and recalculates enrolled framework scores after a run.
- `lib/controls/scorer.ts` uses weights `pass=1`, `manual_review=0.5`, `warning=0.5`, excludes `not_applicable`, and treats unknown/fail/gap/error as zero.
- `lib/workspaces/helios/lifecycle.ts` downgrades stale Helios `pass`/`manual_review` statuses to `manual_review` and creates remediation tasks for stale evidence.

Critical semantic gap:

- `lib/db/queries/evidence.ts:createManualEvidence` inserts the evidence row with the actual `manualEvidenceState.assessment_result`, but then upserts `orgControlStatuses` with `status: "unknown"` on insert and only updates `lastEvidenceAt`/`updatedAt` on conflict. It does not propagate `pass`, `gap`, or `manual_review` into `orgControlStatuses.status`, and it does not recalculate framework score.
- This affects `createManualAttestationEvidence`, `createHeliosCsvImportEvidence`, `lib/workspaces/helios-csv/importer.ts`, and `app/(app)/workspaces/actions.ts` because they all route through `createManualEvidence`.
- User-visible impact matches `docs/product/implementation-gap-audit.md`: workspace progress can count latest evidence as complete while dashboards, reports, Trust Center aggregates, documents, scores, and control status surfaces remain `unknown` or stale.
- Existing smokes such as `smoke:helios-live-attestation` prove evidence/vault/workspace evidence behavior but do not prove `orgControlStatuses.status` propagation or score recalculation for the manual path.

Adjacent semantic caveats:

- `createManualEvidence` accepts `expiresAt` but the schema has no `evidence.expiresAt` column and the function ignores the input. `listExpiringEvidenceAlerts` currently returns `[]`. Product docs already flag evidence expiry filtering as wrong/incomplete.
- `EvidenceSource` includes `imported`, but Helios CSV import currently routes through `createManualEvidence` and sets `source: "manual"` while provenance is in `snapshotData`. This is defensible for customer-reported CSV, but source/provenance language should be consistently documented as customer-reported/import-assisted, not connector evidence.
- `orgControlStatuses.status` has no DB-level check/enum. Code uses `pass`, `fail`, `warning`, `manual_review`, `not_applicable`, `unknown`, and `error`. Intake uses `fail`; evidence uses `gap`. This means mapping from evidence `gap` to control status must be explicit and canonical.

### 5. Tenant scoping at query level

Classification: implemented for inspected high-risk paths, with structural caveats.

Evidence:

- Evidence reads use `evidence.clerkOrgId` and control ID filters: `listEvidenceForControl`, `getEvidenceForOrg`, `listEvidenceVault`, metadata export, archive files.
- Control status reads/writes use `clerkOrgId + controlId` unique target: `listOrgControlStatusesForFramework`, `getControlDetailByKey`, `updateControlStatus`, scorer.
- Controls index joins `orgFrameworks` scoped by `orgFrameworks.clerkOrgId` and left-joins statuses with matching `clerkOrgId`.
- Integration runner reads connected integrations by `integrations.clerkOrgId`, writes integration runs with `clerkOrgId`, and updates statuses by `clerkOrgId + controlId`.
- Workspace export searches show org filters across statuses, integrations, integration runs via integration join, evidence, generated artifacts, policies, vendors, assessments, incidents, risks, trust center, access review items, and audit logs.
- `scripts/smoke-org-boundaries.ts` is present in the ledger as passing.

Caveats:

- Public/tokenized flows and agency flows need their own lane verification beyond this data-model lane.
- Several schema tables do not enforce FK from `clerkOrgId` to organisations, including `orgControlStatuses`, `integrationRuns`, `vendorAssessments`, `trustCenterRequests`, `reminderLog`, `accessReviewItems`, and `auditLogs`. Some are probably intentional for retention/token flows, but lack of FK means query-level scoping and cleanup discipline are the safety mechanism.
- No DB row-level security is visible in schema/migrations; tenancy is application-query enforced.

## Security/compliance/proof-boundary notes

- Production migration discipline is strong and documented. Continue treating production migrations as human-approved operations only.
- Do not claim broad production seed safety from the existence of `db:seed`; only targeted seeds with pre/post verifier are suitable for production data writes.
- Helios remains manual/CSV-assisted. Evidence imported from CSV is customer-reported and must remain manual-review/gap, never automated pass.
- Public Trust Center and reports depend on `orgControlStatuses.status`; the manual-evidence propagation bug can cause under-reporting or stale reporting. This is safer than overclaiming in some cases but breaks product truth and activation feedback.
- Evidence expiry is not persisted; do not claim automated evidence expiry/reminder coverage from current DB model.
- No production DB/Blob action was run in this audit lane.

## Top risks

1. P0 manual evidence/status propagation gap.
   - Manual evidence, workspace attestations, and Helios CSV imports create evidence rows but do not update `orgControlStatuses.status` or recalculate scores.
   - This blocks the core activation loop: first gap/evidence action does not reliably change dashboard/report/control readiness state.

2. Status vocabulary mismatch.
   - Evidence uses `gap`; control statuses and scorer expect `fail` for zero-weight gap/failure in many paths.
   - Some code also uses `error`. There is no DB-level status check on `orgControlStatuses.status`.

3. Evidence expiry model absent.
   - `expiresAt` is accepted by manual evidence APIs but not persisted; `listExpiringEvidenceAlerts` is stubbed.
   - Evidence vault/report expiry filters cannot be trusted until schema and queries are reconciled.

4. Broad seed has destructive reconciliation within ISO mappings.
   - `scripts/seed.ts` deletes all ISO27001 mappings before reseeding. This may be acceptable for local/CI but should remain forbidden for production unless explicitly approved with backup/rollback.

5. Application-level tenancy only.
   - Query-level scoping is present in inspected paths, but no row-level security and some no-FK org fields mean any future query missing `clerkOrgId` can become a cross-tenant exposure.

## Recommended implementation slices

### Slice A - P0 manual evidence to control-status propagation

Goal:

- Manual uploads, workspace attestations, and Helios CSV imports update the control status surfaces users actually see, then recalculate framework scores.

Likely files:

- `lib/db/queries/evidence.ts`
- `lib/controls/scorer.ts` if mapping helpers are centralized there
- `app/(app)/workspaces/actions.ts` only if action-specific events need enriched metadata
- `lib/workspaces/helios-csv/importer.ts` only if CSV source/provenance handling is made explicit
- New or updated smoke: e.g. `scripts/smoke-workspace-attestation-status.ts`
- Update `scripts/smoke-helios-csv-import.ts` or add a source smoke for status propagation

RED command:

- Add a failing smoke that creates manual attestation evidence with `pass`, `gap`, and `manual_review` and asserts `orgControlStatuses.status` changes to the canonical mapped status and `orgFrameworks.score` is recalculated.

GREEN commands:

- `npm run smoke:evidence-state-transitions`
- `npm run smoke:helios-evidence-provenance`
- `npm run smoke:helios-csv-import`
- New `npm run smoke:workspace-attestation-status` or equivalent
- `npm run smoke:primary-flow`
- `npm run typecheck`

Implementation notes:

- Define a single mapping from evidence assessment result to control status. Recommended mapping:
  - `pass -> pass`
  - `gap -> fail` unless the product intentionally adds `gap` to `orgControlStatuses.status` and all score/report mappers
  - `warning -> warning`
  - `manual_review -> manual_review`
  - `not_applicable -> not_applicable`
  - `unknown -> unknown`
- After status upsert, recalculate every framework mapped to that control for the affected org.
- Do not allow Helios CSV or customer-reported imported evidence to set `pass`.

Rollback/flag/backfill/recalculation guardrails:

- Put any behavior change behind an env/feature flag if there is concern about existing manual evidence instantly changing customer-visible status.
- Prefer a narrow helper that can be disabled by flag, not a schema change for this slice.
- Backfill should be dry-run first and scoped by org/date/type/source:
  - Identify latest evidence per `(clerk_org_id, control_id)` for manual/workspace/helios CSV sources.
  - Exclude connector evidence and any control with a more recent explicit `orgControlStatuses.updatedAt` after the evidence timestamp unless owner approves overwrite.
  - Map latest evidence assessment to canonical control status.
  - Upsert status only where current status is `unknown`/null/stale and evidence is newer than `lastEvidenceAt`, or emit conflicts for human review.
  - Recalculate affected frameworks after each batch.
  - Log counts by old status/new status/source/type.
  - Use transaction batches and idempotent upsert keys `(clerk_org_id, control_id)`.
  - Rollback plan: snapshot affected `org_control_statuses` rows before update to a CSV/table; restore status/lastEvidenceAt/updatedAt from snapshot if needed.

Human approval items:

- Approval of canonical mapping `gap -> fail` versus adding `gap` as a first-class control status.
- Approval before any production backfill/recalculation.

### Slice B - Status vocabulary hardening

Goal:

- Make status semantics explicit and prevent future drift between evidence assessment, run status, control status, document status, Trust Center status, and score weights.

Likely files:

- `lib/activation/evidence-state.ts`
- `lib/controls/scorer.ts`
- `lib/documents/status-map.ts`
- `lib/documents/generators.ts`
- `lib/trust-center/public-model.ts`
- `lib/db/schema.ts` and a Drizzle migration only if DB checks/enums are adopted
- Status source smokes

RED command:

- Add a source/unit smoke that enumerates all allowed control statuses and verifies scorer/report/Trust Center/document mappings cover every value exactly once.

GREEN commands:

- New status semantics smoke
- `npm run smoke:evidence-state-transitions`
- `npm run smoke:trust-center-public-disclosure`
- `npm run smoke:compliance-report`
- `npm run typecheck`

Rollback/flag/backfill/recalculation guardrails:

- If only adding TypeScript constants/source smoke, rollback is code revert.
- If adding DB check constraints, do it as a separate migration after a read-only invalid-status audit.
- Backfill decision: required only if invalid statuses exist; dry-run query must group by status and org count before changes.
- Recalculation owner: `lib/controls/scorer.ts` after status normalization.

Human approval items:

- Approve user-facing semantics for `manual_review`, `warning`, `fail`, `error`, and `not_applicable`.

### Slice C - Evidence expiry persistence and alerts

Goal:

- Persist evidence expiry/freshness semantics or remove unused expiry affordances from manual evidence until ready.

Likely files:

- `lib/db/schema.ts`
- New Drizzle migration under `lib/db/migrations`
- `lib/db/queries/evidence.ts`
- Evidence vault UI/filter files
- `listExpiringEvidenceAlerts` callers/jobs if any
- Expiry smoke script

RED command:

- Add a smoke proving manual evidence with `expiresAt` persists the value and appears in expiring alerts for target dates.

GREEN commands:

- `npm run db:generate` for schema change
- `npm run db:migrate` only against local/test DB
- New expiry smoke
- `npm run smoke:evidence-state-transitions`
- `npm run typecheck`

Rollback/flag/backfill/recalculation guardrails:

- Schema migration rollback: additive nullable `expires_at` column is low-risk; rollback would stop reading column rather than drop immediately in production.
- Backfill: optional. For historical evidence, either leave `expires_at=null` or calculate only for known workspace TTLs in a dry-run batch; do not fabricate expiry for generic manual uploads.
- Feature flag alerts until UI and notification copy are verified.

Human approval items:

- Approve retention/expiry policy language before customer-visible expiry alerts.

### Slice D - Seed production safety boundaries

Goal:

- Keep broad `db:seed` non-production and make targeted seed/backfill commands self-documenting and dry-run friendly.

Likely files:

- `scripts/seed.ts`
- `scripts/seed-helios-controls.ts`
- `scripts/verify-helios-production-seed-readiness.ts`
- `docs/operations/*seed*`
- Possibly package scripts for `seed:helios-controls:dry-run`

RED command:

- Add source smoke asserting broad `db:seed` is not referenced as a production command and targeted Helios seed has verifier docs.

GREEN commands:

- `npm run smoke:helios-control-seeding`
- `npm run verify:helios-production-seed-readiness` against local/test only if DB available
- New source smoke

Rollback/flag/backfill/recalculation guardrails:

- Targeted seed remains idempotent; no control deletes.
- Any production run needs owner approval, clean checkout, drift ok, pre/post verifier, duplicate checks, and second idempotency run.
- Broad seed should remain local/CI only unless an explicit production seed window is approved.

Human approval items:

- Production seed/backfill windows and target DB approval.

## Test/validation matrix

Recommended clean verifier matrix after fixes:

- `git status --short` before/after in clean worktree.
- `npm ci --prefer-offline --no-audit --no-fund` unless disk/network blocks it.
- `npm run typecheck`
- `npm run lint`
- `npm run smoke:evidence-state-transitions`
- `npm run smoke:helios-control-seeding`
- `npm run smoke:helios-evidence-provenance`
- `npm run smoke:helios-csv-import`
- `npm run smoke:org-boundaries`
- New smoke for manual/workspace/Helios CSV evidence status propagation and score recalculation.
- If local DB is available: run targeted migration/seed smokes twice for idempotency. Do not point at production.
- Do not run `npm run check:production-migration-drift` unless explicitly authorized and secrets are safe; it is read-only but can target production.

## Shared-file claims

Lane 02 claims/recommends changes to these shared files if implementation proceeds:

- `lib/db/queries/evidence.ts` - owner candidate for P0 manual evidence/status propagation.
- `lib/controls/scorer.ts` - owner candidate for status-to-score mapping and recalculation semantics.
- `lib/activation/evidence-state.ts` - owner candidate for evidence/control status mapping constants if centralized.
- `lib/db/schema.ts` and migrations - owner candidate only for status hardening or evidence expiry persistence; requires human approval and verifier acceptance.
- `scripts/seed.ts`, `scripts/seed-helios-controls.ts`, `scripts/verify-helios-production-seed-readiness.ts` - owner candidate only for seed safety/dry-run improvements.
- `app/(app)/workspaces/actions.ts` and `lib/workspaces/helios-csv/importer.ts` are dependent callers of `createManualEvidence`; Lane 02 should coordinate with UX/workspace lanes but should not duplicate behavior there if a central helper fixes it.
- `lib/trust-center/public-model.ts`, `lib/documents/status-map.ts`, `lib/documents/generators.ts` are dependent status consumers and should be verifier targets if status vocabulary changes.

Conflict status:

- Potential conflict with Lane 01 implementation plans touching evidence/status is real but manageable. Lane 02 should own canonical schema/status semantics; Lane 01 should not implement ad hoc status propagation or divergent `gap`/`fail` mapping in UI/action code.

## Are Lane 01 evidence/status implementation plans blocked?

Yes, partially blocked by schema/semantic findings.

Blocked until Lane 02 findings are accepted/resolved:

- Any Lane 01 plan that updates manual evidence, workspace attestation, Helios CSV import, dashboard readiness, report readiness, Trust Center readiness, or score/progress based on evidence/status.
- Specifically, the P0 plan in `docs/product/implementation-gap-audit.md` should not proceed without adopting one canonical mapping from evidence assessment to control status and one recalculation owner.

Not blocked:

- Pure UI copy improvements that do not change persisted status/progress semantics.
- Source smokes that characterize the current bug as RED tests.
- Non-production local fixture setup, as long as it does not write production DB/Blob.

Required unblock condition:

- Verifier accepts Lane 02 P0 semantic finding.
- Implementation plan chooses canonical mapping, rollback/backfill approach, recalculation owner, and smoke matrix.
- Human approval is obtained before any production backfill or schema migration.

## Human approval items

- Any production DB migration, production seed, backfill, or score recalculation batch.
- Canonical mapping from evidence assessment `gap` to control status `fail` versus introducing `gap` into control statuses.
- Any DB-level status check/enum migration.
- Any existing-data migration/backfill of `org_control_statuses` from historical evidence.
- Any evidence expiry/retention customer-facing semantics.
- Any change to persistent canonical control keys, especially `helios-*` keys.

## Bottom line

The migration chain and production migration guardrails are strong and documented, and targeted Helios seeding has unusually good canonical-key and verifier discipline. The critical blocker is semantic, not migration-order related: manual/customer-reported evidence records store their assessment result, but do not propagate that result to `orgControlStatuses.status` or recalculate scores. This directly blocks the activation-loop goal from the product gap audit and should be treated as Lane 02's P0 finding for verifier review.
