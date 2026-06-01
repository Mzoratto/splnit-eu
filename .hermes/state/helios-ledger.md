# Helios Workflow Execution Ledger

Plan: `.hermes/plans/2026-05-31_210836-helios-workflow-integration.md`

## Current Position

- Current tranche: T2 GREEN after independent verification and orchestrator integrated gate.
- Integrated branch: not merged into main; T0/T0.5/T1/T2 work lives in worktree `/Users/marcozoratto/splnit-worktrees/helios-t05-query` on branch `helios-t05-query`.
- Human approval queue: none for T2. Production `seed:helios-controls` remains not approved/not run.

## Tranche Ledger

### T2 — Lane D Helios CSV/import MVP

Status: GREEN in integrated worktree, not yet merged to main.

Integrated branch/worktree:
- Branch: `helios-t05-query`
- Worktree: `/Users/marcozoratto/splnit-worktrees/helios-t05-query`
- Merge commit: `765494c` (`merge: T2 Helios CSV import MVP`)
- Lane commit: `2364ed2` (`feat: add Helios CSV import MVP`)

Files changed by lane:
- `app/(app)/workspaces/helios/import/actions.ts`
- `app/(app)/workspaces/helios/import/page.tsx`
- `app/(app)/workspaces/helios/page.tsx`
- `lib/workspaces/helios-csv/importer.ts`
- `lib/workspaces/helios-csv/mapping.ts`
- `lib/workspaces/helios-csv/parser.ts`
- `lib/workspaces/helios-csv/types.ts`
- `package.json`
- `scripts/smoke-helios-csv-import.ts`
- `scripts/smoke-helios-csv-parser.ts`
- `tests/fixtures/helios/backups.csv`
- `tests/fixtures/helios/integrations.csv`
- `tests/fixtures/helios/roles.csv`
- `tests/fixtures/helios/users.csv`

Independent verifier:
- RED base: `/Users/marcozoratto/splnit-worktrees/helios-t2-base-red` at `42d22d8`
- GREEN verifier: `/Users/marcozoratto/splnit-worktrees/helios-t2-csv-import-verifier` at `2364ed2`
- RED reproduced: `smoke:helios-csv-parser` and `smoke:helios-csv-import` missing on T1 base; Helios CSV files/fixtures absent.
- GREEN reproduced against disposable local Postgres.
- Verified parser accepts fixtures, enforces required columns, returns row-level errors, redacts secret-like unknown columns, and does not preserve raw secret values.
- Verified mapping emits only `gap`/`manual_review`, `helios_csv_import`, `customer_reported_csv_template`, `customerReported=true`; no `pass` path.
- Verified mapping covers required IAM/roles/backup/API controls, plus additional backup/API gap controls.
- Verified importer does not use `createManualAttestationEvidence`; it persists through the shared manual evidence helper with `type=helios_csv_import`, source `manual`, bounded findings/summary snapshots, and no raw sensitive export storage.
- Verified import page/action copy and behavior: Clerk org required, file extension/MIME/size validation, server-side parsing, no stack traces, Splnit-template wording, not automatic Helios API connection, no native/raw export claim, links to `/workspaces/helios` and `/evidence`.
- Verified `/workspaces/helios` links to `/workspaces/helios/import` with safe CSV-assisted wording.
- Verified frozen query files unchanged and no live Helios API/OAuth/SQL Server/MES/SCADA/EDI implementation.
- Allowlist passed. Copy hygiene passed. Secret scan found only benign literal forbidden-column/copy mentions; no secret values.

Orchestrator integrated GREEN validation:
- Disposable local Postgres initialized under `/tmp/helios-t2-gate-pg.s8UmNe` on port `58851` and stopped after validation; no production DB touched.
- `npm run db:migrate` passed.
- `npm run smoke:helios-workspace-config` passed.
- `npm run seed:helios-controls` passed twice.
- `npm run smoke:helios-control-seeding` passed.
- `npm run smoke:helios-evidence-provenance` passed and cleaned exact synthetic org.
- `npm run smoke:helios-live-attestation` passed and cleaned exact synthetic org.
- `npm run smoke:helios-agency-progress` passed and cleaned exact synthetic org.
- `npm run smoke:helios-csv-parser` passed.
- `npm run smoke:helios-csv-import` passed:
  - parsed rows: `11`
  - created evidence rows: `11`
  - gaps: `9`
  - manual_review: `2`
  - cleanup confirmed `organisations=0`, `evidence=0`, `statuses=0`
- `npm run smoke:manual-evidence-dimensions-source` passed.
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run build` passed.
- `E2E_SUITE=local-demo ENABLE_LOCAL_DEMO_DATA=true npx playwright test tests/e2e/helios-onboarding-recommendation.spec.ts --project=local-demo-chromium` passed `1/1`.
- `E2E_SUITE=local-demo ENABLE_LOCAL_DEMO_DATA=true ENABLE_TEST_ROUTES=true npx playwright test tests/e2e/helios-workspace.spec.ts --project=local-demo-chromium` passed `6/6`.
- Integrated worktree status is clean.

Blockers:
- None for T2.
- Implementer subagent timed out after partial work; orchestrator inspected the diff, ran the full T2 validation suite, committed the coherent implementation, then sent it through independent verification.

Notes:
- T2 implements CSV-assisted manual/template import only. It does not implement native Helios exports, Helios API, SQL Server introspection, network scans, or automated MES/SCADA/EDI checks.
- CSV imports remain customer-reported and can create only `manual_review`/`gap`; no CSV-derived `pass` exists.

### T1 — Lane B live attestation + Lane C user-flow proof

Status: GREEN in integrated worktree, not yet merged to main.

Integrated branch/worktree:
- Branch: `helios-t05-query`
- Worktree: `/Users/marcozoratto/splnit-worktrees/helios-t05-query`
- Merge commits:
  - `d701e21` (`merge: T1 Helios live attestation`)
  - `42d22d8` (`merge: T1 Helios user flows`)

Lane B implementer:
- Branch: `helios-t1-live-attestation`
- Commit: `94d70fb` (`test: add Helios live attestation smoke`)
- Files changed:
  - `package.json`
  - `scripts/smoke-helios-live-attestation.ts`

Lane B verifier:
- RED base: `/Users/marcozoratto/splnit-worktrees/helios-t1-base-red` at `cf177bd`
- GREEN verifier: `/Users/marcozoratto/splnit-worktrees/helios-t1-live-attestation-verifier` at `94d70fb`
- RED reproduced: `smoke:helios-live-attestation` missing on T0.5 base.
- GREEN reproduced against disposable local Postgres.
- Verified manual attestation evidence type/source/snapshot, orgControlStatuses update, workspace progress, evidence vault inclusion, and exact-org cleanup.
- Allowlist/secret scan passed; copy hygiene N/A.

Lane C implementer:
- Branch: `helios-t1-user-flows`
- Commit: `104e2b1` (`test: prove Helios user flows`)
- Files changed:
  - `app/(app)/controls/page.tsx`
  - `app/api/test/workspace-attestation/route.ts`
  - `package.json`
  - `playwright.config.ts`
  - `scripts/smoke-helios-agency-progress.ts`
  - `tests/e2e/helios-onboarding-recommendation.spec.ts`
  - `tests/e2e/helios-workspace.spec.ts`

Lane C verifier:
- RED base: `/Users/marcozoratto/splnit-worktrees/helios-t1-base-red` at `cf177bd`
- GREEN verifier: `/Users/marcozoratto/splnit-worktrees/helios-t1-user-flows-verifier` at `104e2b1`
- RED reproduced: onboarding spec and agency smoke absent on T0.5 base; workspace live route proof absent before T1.
- GREEN reproduced against disposable local Postgres.
- Verified onboarding recommendation E2E: Helios (Asseco), SQL Server backups, access, MES/SCADA, EDI security, controls callout link, and no automation overclaim wording.
- Verified workspace E2E: previous 5 Helios static tests plus live test route attestation proof.
- Verified test route is opt-in and disabled when `VERCEL_ENV=production`; route creates/cleans only `org_e2e_attestation_test`.
- Verified agency progress smoke: synthetic agency/client, Helios manual attestation evidence, progress > 0, exact cleanup.
- Verified frozen query files unchanged and no CSV/import files touched.
- Allowlist passed with orchestrator-approved `playwright.config.ts` exception for local-demo test selection.
- Secret scan found only benign env-var names; no secret values. Copy hygiene passed.

Orchestrator integrated GREEN validation:
- Disposable local Postgres initialized under `/tmp/helios-t1-gate-pg.ct4eNb` on port `58484` and stopped after validation; no production DB touched.
- `npm run db:migrate` passed.
- `npm run smoke:helios-workspace-config` passed.
- `npm run seed:helios-controls` passed twice.
- `npm run smoke:helios-control-seeding` passed.
- `npm run smoke:helios-evidence-provenance` passed and cleaned exact synthetic org.
- `npm run smoke:helios-live-attestation` passed:
  - control: `helios-iam-user-accounts`
  - evidence type: `attestation_answers`
  - source: `manual`
  - assessment result: `manual_review`
  - completed controls before/after: `0 -> 1`
  - cleanup confirmed `organisations=0`, `evidence=0`, `statuses=0`
- `npm run smoke:helios-agency-progress` passed:
  - platform: `helios`
  - completed controls: `1`
  - cleanup confirmed `organisations=0`, `evidence=0`, `statuses=0`
- `npm run smoke:manual-evidence-dimensions-source` passed.
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run build` passed.
- `E2E_SUITE=local-demo ENABLE_LOCAL_DEMO_DATA=true npx playwright test tests/e2e/helios-onboarding-recommendation.spec.ts --project=local-demo-chromium` passed `1/1`.
- `E2E_SUITE=local-demo ENABLE_LOCAL_DEMO_DATA=true ENABLE_TEST_ROUTES=true npx playwright test tests/e2e/helios-workspace.spec.ts --project=local-demo-chromium` passed `6/6`.
- Integrated worktree status is clean.

Blockers:
- None for T1.
- Lane C implementer timed out after partial work; orchestrator inspected the partial diff, fixed scoped validation blockers, reran the lane checks, then committed and sent to independent verifier.

Notes:
- T1 proves live manual Helios workflow and local-demo user-flow proof; it does not implement CSV parser/import UI or real Helios automation.
- The test route remains a local/test-only helper and is hard-disabled for Vercel production environments.

### T0.5 — Lane A2 shared query-layer carve-out

Status: GREEN in isolated worktree, not yet merged.

Implementer branch/worktree:
- Branch: `helios-t05-query`
- Worktree: `/Users/marcozoratto/splnit-worktrees/helios-t05-query`
- Commit: `cf177bd` (`feat: add Helios evidence provenance smoke`)

Verifier worktrees:
- RED base: `/Users/marcozoratto/splnit-worktrees/helios-t05-verifier-red` at `c19dab9`
- GREEN verifier: `/Users/marcozoratto/splnit-worktrees/helios-t05-verifier` at `cf177bd`

Files changed by lane:
- `lib/db/queries/evidence.ts`
- `scripts/smoke-helios-evidence-provenance.ts`
- `package.json`

Independent verifier result:
- RED reproduced on T0 base: `smoke:helios-evidence-provenance` gate and script/helper absent before T0.5.
- GREEN reproduced on T0.5 implementation against disposable local Postgres.
- Manual attestation remains `attestation_answers` with `snapshotData.attestationAnswers`.
- Helios CSV-derived evidence uses `helios_csv_import` with `snapshotData.provenance = customer_reported_csv_template`.
- `pass` is rejected for `helios_csv_import`; allowed outcomes are `manual_review` and `gap`.
- `listEvidenceVault()` exposes both evidence rows with distinct types and CSV provenance.
- `getWorkspaceProgress()` counts both manual attestation and CSV import evidence.
- Cleanup confirmed exact synthetic org rows at zero.
- Allowlist and secret scan passed; copy hygiene N/A.

Orchestrator integrated GREEN validation:
- Disposable local Postgres initialized under `/tmp/helios-t05-gate-pg.W8IkV5` and stopped after validation; no production DB touched.
- `npm run db:migrate` passed.
- `npm run smoke:helios-workspace-config` passed.
- `npm run seed:helios-controls` passed twice.
- `npm run smoke:helios-control-seeding` passed.
- `npm run smoke:helios-evidence-provenance` passed:
  - manual evidence type: `attestation_answers`
  - CSV evidence type: `helios_csv_import`
  - CSV provenance: `customer_reported_csv_template`
  - workspace completed controls: 2
  - cleanup confirmed `organisations=0`, `evidence=0`, `statuses=0`
- `npm run smoke:manual-evidence-dimensions-source` passed.
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run build` passed.

Blockers:
- None for T0.5.
- First verifier attempt was incomplete because a checkout command was denied; verification was rerun with pre-created RED and GREEN worktrees so the verifier did not need to checkout.

Notes:
- T0.5 did not implement parser/UI/import actions.
- `getWorkspaceProgress()` needed no code change because it already counts evidence rows generically; smoke now proves Helios CSV rows count as `hasEvidence`.
- Worktree bootstrap rule added to the plan: install deps if `tsx` is missing and use disposable local Postgres for DB-backed smokes.

### T0 — Lane A canonical targeted Helios control seeding

Status: GREEN in isolated worktree, not yet merged.

Implementer branch/worktree:
- Branch: `helios-t0-seed`
- Worktree: `/Users/marcozoratto/splnit-worktrees/helios-t0-seed`

Files changed by lane:
- `lib/controls/library.ts`
- `lib/workspaces/control-seeds.ts`
- `scripts/seed-helios-controls.ts`
- `scripts/smoke-helios-control-seeding.ts`
- `package.json`

RED result:
- Initial `npm run smoke:helios-control-seeding` failed before implementation in the isolated worktree because dependencies were not installed there (`tsx: command not found`).
- After dependency installation, DB-backed RED/GREEN depended on a database URL. The orchestrator did not use production DB and instead created a disposable local Postgres instance for the GREEN gate.

Orchestrator GREEN validation:
- Disposable local Postgres initialized under `/tmp/helios-t0-seed-pg.QWnRrR`.
- `npm run db:migrate` passed against disposable DB.
- `npm run smoke:helios-workspace-config` passed.
- `npm run seed:helios-controls` passed.
- second `npm run seed:helios-controls` passed.
- `npm run smoke:helios-control-seeding` passed:
  - canonical keys: 19
  - controls present: 19
  - NIS2 mappings present: 19
  - idempotency verified across two targeted seed runs
  - immutable key guard verified missing-key failure
- `npm run typecheck` passed.

Blockers:
- None for T0 after disposable DB validation.
- Production seed execution remains a future human-approved risk item; it was not run.

Notes:
- T0 does not depend on `smoke:helios-evidence-provenance`; that remains the T0.5 gate.
- T0 did not touch `lib/db/queries/evidence.ts` or `lib/db/queries/workspaces.ts`.
- T0 keeps Helios controls `testType = manual`, `isAutomated = false`, and `requiresEvidence = true`.

## Next Tranche

T3 — claim-safety/final production-readiness gate:
- Add or extend copy-hygiene guard to block Helios automation/native-export overclaims.
- Run final narrow validation plus repository validation and production migration drift check.
- Prepare production seed/backfill note for human approval; do not run production `seed:helios-controls` without explicit approval.
