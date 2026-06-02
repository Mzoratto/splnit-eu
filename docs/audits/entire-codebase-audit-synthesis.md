# Entire Codebase Audit Synthesis

Date: 2026-06-02
Repo: `/Users/marcozoratto/splnit.eu`
Branch at audit start: `main`
Commit observed during T0: `e9f2168`

## Scope

This is the T3 synthesis for the entire-codebase audit program. It combines all ten audit lanes plus the T0 baseline ledger.

No implementation, production DB write, production Blob/file operation, Stripe live action, deploy, commit, or push was performed.

## Audit artifacts

| Lane | Report | Status |
| --- | --- | --- |
| 01 Product surfaces / activation | `docs/audits/entire-codebase-lane-01-product-surfaces-activation.md` | PARTIAL |
| 02 Data model / DB / migrations | `docs/audits/entire-codebase-lane-02-data-model-db-migrations.md` | PARTIAL / blocker for status semantics |
| 03 Auth / org boundaries / deletion | `docs/audits/entire-codebase-lane-03-auth-org-boundaries.md` | PARTIAL |
| 04 Integrations / workspaces / jobs | `docs/audits/entire-codebase-lane-04-integrations-workspaces-jobs.md` | PARTIAL |
| 05 Billing / Stripe / entitlements | `docs/audits/entire-codebase-lane-05-billing-entitlements.md` | PARTIAL |
| 06 Legal / claims / proof | `docs/audits/entire-codebase-lane-06-legal-claims-proof.md` | PARTIAL PASS / caveats |
| 07 Frontend UX / a11y | `docs/audits/entire-codebase-lane-07-frontend-ux-a11y.md` | PARTIAL |
| 08 Tests / CI / harness | `docs/audits/entire-codebase-lane-08-tests-ci-harness.md` | PARTIAL |
| 09 Performance / security / observability | `docs/audits/entire-codebase-lane-09-performance-security-observability.md` | PARTIAL |
| 10 Localization / knowledge | `docs/audits/entire-codebase-lane-10-localization-knowledge.md` | PARTIAL |

## T0 baseline

T0 created `.hermes/state/entire-codebase-audit-ledger.md` and inventoried:

- 998 tracked files.
- 110 `page.tsx` / `route.ts`-style app/API surfaces from earlier product audit context.
- 88 `npm run smoke:*` scripts.
- Top tracked directories: `lib` 294, `app` 156, `scripts` 129, `docs` 104, `.agents` 75, `components` 47, `tests` 31.

T0 standard checks:

| Command | Result |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS |

T0 smoke snapshot:

- 68 pass
- 9 fail
- 11 blocked
- 0 timeout

Known failed smoke baseline included:

- `smoke:i18n-shell`
- `smoke:intake-scope`
- `smoke:activation-status`
- `smoke:demo-routes`
- `smoke:italian-tenant`
- `smoke:italian-gdpr-layer`
- `smoke:tenant-locales`
- `smoke:italian-nis2-layer`
- `smoke:nis2-evidence-templates`

Blocked smokes were production/env/Blob/Stripe sensitive and were not run under audit guardrails.

Known weak green gate / T4 correction:

- `npm run smoke:reviewed-article-links` passed in T0, but Lane 10 identified it as a false green: the smoke passed vacuously because there were no reviewed article rows to validate. T4-B corrected this gate: the smoke now fails when there are zero reviewed article rows and must not be used as proof of reviewed article coverage until a reviewed-row baseline exists.

Repeated DB warning baseline:

- Several DB-backed smokes emitted the pg SSL-mode warning around `sslmode=require` / `uselibpqcompat`. Treat this as a configuration-hardening finding owned by Lane 08, not as a per-lane one-off. T4-B should normalize the connection mode to `sslmode=verify-full` where appropriate or document an accepted configuration.

## Executive verdict

The codebase is meaningfully implemented, but it is not uniformly production-ready.

The strongest areas are:

- core authenticated app shell and many product surfaces;
- Czech-first public routing and localized navigation;
- production migration guardrails;
- Helios canonical controls and many Helios workspace smokes;
- Trust Center and buyer-proof guardrails in public copy;
- basic Stripe billing foundations and safe plan-gate bypass protections;
- broad smoke and E2E harness inventory.

The highest-risk gaps are cross-cutting rather than isolated missing pages:

1. Evidence/status semantics are inconsistent: manual/workspace/CSV evidence can be created while control status remains `unknown`.
2. Existing evidence expiry UI/jobs are incomplete because expiry is not reliably persisted/read.
3. Org deletion/offboarding exists but GDPR erasure, Blob cleanup, residual vendor/dashboard data, and audit-log retention policy are not production-grade.
4. Buyer-proof/report/export plan gates and public Trust Center disclosure need product/legal/security decisions.
5. Billing docs and runtime plan model are out of sync: Business-era docs vs current Free/SME/Agency runtime.
6. Several i18n/knowledge smokes are red and indicate stale copy expectations, missing article imports, and Helios evidence-template metadata gaps.
7. CI/test harness safety is uneven; local `.env.local` can point at non-local Neon, and some smokes require hidden prerequisites.

## P0 blockers before implementation planning can be finalized

### P0-1: Evidence/status semantics owner decision

Affected lanes:

- Lane 01 product surfaces
- Lane 02 data model/status semantics
- Lane 04 integrations/workspaces
- Lane 06 buyer-proof reports

Problem:

- `createManualEvidence` stores the actual assessment result but upserts `orgControlStatuses.status` as `unknown`.
- Workspace attestations and Helios CSV/manual paths can produce evidence but not reliably update visible control status/score surfaces.
- This creates a broken first-user activation loop: evidence exists, but readiness remains stale.

Required owner lane:

- Lane 02 owns canonical status semantics and score/recalculation rules.
- Lane 01 owns UI/activation behavior only after Lane 02 defines the mapping.

Gate:

- No implementation plan touching `lib/db/queries/evidence.ts`, `orgControlStatuses`, evidence status, or score surfaces is final until Lane 02 semantic mapping and recalculation owner are accepted.

T4 human-approved decision:

- Accepted canonical mapping for this tranche: evidence `gap` maps to existing control status `fail`; no new first-class `gap` control status is added.
- Manual evidence status propagation has a production escape hatch: `SPLNIT_MANUAL_EVIDENCE_STATUS_PROPAGATION=disabled` with accepted disabled values `disabled`, `false`, and `0`.
- Operations runbook: `docs/operations/evidence-status-propagation-runbook.md`.

### P0-2: Org deletion, retention, and Blob cleanup decision

Affected lanes:

- Lane 03 auth/org/deletion
- Lane 06 proof/legal
- Lane 08 test harness

Problem:

- Clerk `organization.deleted` cleanup exists, but right-to-erasure/offboarding is not granular or auditable enough for production-grade operation.
- Audit-log retention docs conflict with actual schema/migration behavior.
- Residual vendor/dashboard cleanup remains manual/documented only.
- Production Blob reads/signed URLs/file ops were intentionally not exercised during audit.

Required owner lane:

- Lane 03 owns deletion/offboarding/retention semantics.
- Lane 06 reviews legal/retention wording.

Gate:

- No public/legal deletion promise should be strengthened until Lane 03 produces an accepted deletion/offboarding implementation plan.

### P0-3: Test harness safety for DB-mutating smokes

Affected lanes:

- Lane 08 test/CI
- All lanes that rely on DB smokes

Problem:

- `.env.local` can point at a non-local Neon DB.
- Some local/demo smokes or E2E tests can mutate data unless an explicit local disposable DB is used.
- Hidden prerequisites exist for E2E and smoke execution.
- DB-backed smokes repeatedly emit pg SSL-mode warnings around `sslmode=require` / `uselibpqcompat`, creating recurring noise and an unresolved connection-hardening decision.

Required owner lane:

- Lane 08 owns smoke taxonomy, local DB safety gates, CI safety, clean-verifier instructions, and pg SSL-mode normalization/documentation.

Gate:

- No implementation tranche should rely on DB-mutating smokes unless the verifier uses a clean worktree, fresh `npm ci`, and documented local/disposable DB env with no inherited production-like env.

### P0-4: Woodpecker production migration gate

Affected lanes:

- Lane 08 test/CI
- Lane 09 performance/security/observability
- All future production implementation tranches

Problem:

- Lane 08 classifies `.woodpecker/vercel.yml` as a P0 deployment-safety issue because the Woodpecker production deployment path runs bare `npm run db:migrate` instead of the guarded production migration wrapper.
- This is not just a test-harness issue: every future implementation tranche that reaches production can pass through this deployment path.

Required owner lane:

- Lane 08 owns the CI/deploy safety gate.
- Ops/human approval owns any accepted-risk exception.

Gate:

- No production implementation tranche should deploy through Woodpecker until `.woodpecker/vercel.yml` is changed to use the guarded migration wrapper or the bare migration path is explicitly accepted as a known risk with ops sign-off.

## Shared-file conflict registry

| File / symbol / table | Claimed by lanes | Assigned owner lane | Conflict status | Resolution |
| --- | --- | --- | --- | --- |
| `lib/db/queries/evidence.ts` | 01, 02, 04, 06 | 02 | OPEN | Lane 02 defines canonical evidence/status/recalculation semantics before Lane 01/04 implementation. |
| `orgControlStatuses` table/status semantics | 01, 02, 04, 06 | 02 | OPEN | Lane 02 owner; Lane 01/04 dependent. |
| `lib/db/schema.ts` | 02, 03, 05, 08 | 02 for evidence/status; 03 for deletion; 05 for Stripe events | SPLIT | Any migration requires separate human-approved carve-out. |
| `app/api/**/export*` and report routes | 03, 05, 06, 08 | 03 for auth; 06 for disclosure; 05 for plan gates | OPEN | Needs T3 human/product assignment per route group before implementation. |
| `lib/stripe/plans.ts` | 05, 06, 08, 10 | 05 | OPEN | Lane 05 owns runtime plan semantics; Lane 06/10 approve public copy; Lane 08 smokes. |
| `docs/product/business-entitlement-matrix.md` | 05, 06, 10 | 05 | OPEN | Replace/archive Business-era matrix with Free/SME/Agency matrix after human approval. |
| `components/marketing/pricing-widgets.tsx` | 05, 06, 07, 10 | 06 for claims; 05 for runtime alignment | OPEN | Public pricing changes need claim/legal/localization review. |
| `app/(app)/settings/billing/page.tsx` | 05, 07, 10 | 05 | REVIEW | Lane 07/10 review UI/a11y/localization only. |
| `app/(app)/agency/layout.tsx` | 03, 05 | 03 for access boundary; 05 for plan meaning | REVIEW | Auth boundary and entitlement semantics must both pass. |
| `app/api/webhooks/stripe/route.ts` | 03, 05, 09 | 05 | REVIEW | Lane 05 owns billing behavior; Lane 03/09 review security/observability. |
| `messages/*` | 06, 07, 10, 05 | 10 | OPEN | Lane 10 owns i18n completeness/quality; Lane 06 approves claim boundaries. |
| `scripts/smoke-*` | 08 plus all lanes | 08 | OPEN | Lane 08 owns taxonomy, prerequisites, CI safety, weak-gate labeling, and pg SSL warning normalization. |
| `scripts/smoke-reviewed-article-links.ts` | 08, 10 | 10 for knowledge assertion; 08 for harness semantics | OPEN / WEAK GREEN | Current pass is vacuous when no reviewed article rows exist; cannot prove reviewed article coverage until strengthened. |
| `.woodpecker/vercel.yml` | 08, 09 | 08 | P0 OPEN | Production deploy/migration safety gate; no production tranche should deploy through Woodpecker until guarded wrapper or ops sign-off. |
| `vercel.json` cron routes | 04, 08, 09 | 04 for scheduler-of-record; 08 for harness | OPEN | Deduplicate scheduler ownership before implementation. |
| Trust Center public API/UI | 03, 06, 07, 10 | 06 for disclosure; 03 for access | OPEN | Exact aggregate disclosure/noindex requires human/legal/security decision. |

If T3 cannot assign a clear owner lane for any future shared file, escalate to human approval before writing an implementation plan for that file.

## Cross-lane dependency gates

1. Lane 02 and Lane 03 must be GREEN or PARTIAL-with-accepted-risk before finalizing implementation plans touching:
   - `lib/db/queries/evidence.ts`
   - `lib/db/schema.ts`
   - `orgControlStatuses`
   - evidence status/provenance semantics
   - export/download/report routes

2. Lane 05 and Lane 06 must both approve any public pricing, plan name, buyer-proof entitlement, or paid-readiness claim.

3. Lane 08 must approve any new/revised smoke/CI gate before it becomes a tranche gate.

4. Lane 10 must approve localized public/regulatory wording changes before they are treated as customer-facing proof.

5. Production DB migrations, production seeds/backfills, production Blob actions, live Stripe actions, deploys, and legal/public-claim decisions require human approval.

## Prioritized roadmap

### T4-A: Status semantics and first-evidence activation repair

Owner lane: 02
Dependent lanes: 01, 04, 06, 08
Priority: P0

Scope:

- Define canonical mapping from evidence assessment/result/source to `orgControlStatuses.status`.
- Preserve provenance boundaries:
  - customer-reported CSV/ERP imports never produce `pass`;
  - authenticated human attestations may produce `pass` only where UI presents explicit assertion;
  - automated measurement may produce positive/negative status only where rule exists.
- Decide score recalculation owner and acceptance criteria.
- Add rollback/feature flag/dry-run strategy.
- Decide existing stale `unknown` migration/backfill: leave until re-attestation vs targeted repair.

Suggested implementation plan:

- Use existing `.hermes/plans/2026-06-02_093218-activation-status-consistency.md` as base, but update it with Lane 02/03 findings before implementation.

### T4-B: Test harness safety, smoke taxonomy, and deploy gate

Owner lane: 08
Dependent lanes: all
Priority: P0

Scope:

- Add a smoke manifest/taxonomy: safe, DB-local-only, prod-read-only, prod-write, Blob-sensitive, Stripe-sensitive, email-sensitive.
- Refuse DB-mutating smokes unless `DATABASE_URL` is explicitly local/disposable.
- Document hidden prerequisites for E2E commands.
- Repair or quarantine known-red T0 smokes.
- Mark weak green smokes explicitly. `smoke:reviewed-article-links` is currently a false green because no reviewed article rows exist; it cannot be accepted as reviewed-article coverage until strengthened.
- Normalize pg SSL connection mode to `sslmode=verify-full` where appropriate or document the accepted `sslmode=require` / `uselibpqcompat` configuration.
- Fix Woodpecker production deployment using raw `npm run db:migrate` instead of guarded production migration wrapper, or explicitly document the accepted risk with ops sign-off.

Production gate:

- No production implementation tranche should deploy through Woodpecker until the migration wrapper issue is resolved or explicitly accepted by ops/human approval.

### T4-C: Retention/offboarding/right-to-erasure and Blob cleanup

Owner lane: 03
Dependent lanes: 02, 06, 08
Priority: P0/P1

Pre-start approval gates resolved on 2026-06-02:

- Stale existing `unknown` statuses: leave until re-attestation/new evidence. No production DB operation or status repair job for T4-C; status state self-heals over time as new evidence is collected. Revisit before paid launch only if customer feedback shows stale status is a practical problem.
- Audit-log retention on org deletion: retain audit logs with documented legal basis; exact retention period must be set before paid launch. This matches current schema behavior after migration `0016` intentionally removed the audit-log org FK and unblocks T4-C without counsel approval today.

Scope:

- Reconcile audit-log retention docs vs schema behavior.
- Add/verify granular offboarding and right-to-erasure paths.
- Make Blob cleanup auditable/idempotent.
- Separate retention exceptions from deletion failures.
- Add source and local-only verification; no production Blob actions without approval.

T4-C implementation completed in this tranche:

- Audit-log retention docs now match schema behavior: audit logs are retained on organisation deletion with documented legal/security/compliance basis; exact retention period remains a before-paid-launch decision.
- Offboarding service blocks root organisation deletion if Blob URL collection fails, preserving Blob URL provenance for retry.
- Blob cleanup is auditable and idempotent via normalized/deduped URL batches and per-URL deleted/skipped/failed results.
- Granular evidence erasure blocks row deletion if Blob cleanup fails/skips or audit logging fails; retained audit log is written before evidence row deletion.
- T4-C source smoke enumerates `clerk_org_id` tables and Blob/logo URL columns and verifies these guards locally.

### T4-D: Integration/workspace execution correctness

Owner lane: 04
Dependent lanes: 02, 03, 08
Priority: P1

Scope:

- Wire Microsoft 365 token refresh into Graph client/runner path.
- Enqueue first-run evidence for API-key connectors after successful connect/rotate where intended.
- Fix OVHcloud `serviceName` connection-validity bug.
- Decide scheduler-of-record between Vercel Cron and Inngest for duplicate jobs.
- Fix evidence expiry query/job path after Lane 02 expiry persistence decision.

T4-D implementation completed in this tranche:

- Microsoft Graph client now refreshes near-expired/expired tokens through the existing OAuth helper and persists refreshed token metadata before checks run.
- API-key connector connect/rotate paths enqueue first-run checks where intended without blocking successful credential save on enqueue failure.
- OVHcloud `serviceName` is required at form/action/type/storage boundaries; stored OVH credentials without `serviceName` no longer appear runnable.
- Vercel Cron is recorded as scheduler-of-record for duplicate scheduled jobs; duplicate Inngest cron triggers were removed while event-triggerable functions remain.
- Evidence expiry alerts stay disabled by default because expiry persistence is still absent; source smoke keeps that blocker explicit instead of fabricating behavior.

### T4-E: Plan entitlement and buyer-proof gate alignment

Owner lane: 05
Dependent lanes: 06, 08, 10
Priority: P1

Resolved plan-model decision for T4-E/T4-G dispatch:

- Free/SME/Agency is the canonical plan model.
- Business, Starter, and Consultant are legacy aliases only, not public plan names.
- `lib/stripe/plans.ts` is the runtime truth source for plan names, limits, and pricing.
- `docs/product/business-entitlement-matrix.md` is archived/superseded and will be replaced by `docs/product/plan-entitlement-matrix.md` in T4-E.
- Public pricing pages and locale messages must use SME/Agency vocabulary consistently.
- This is documentation/copy alignment only; do not change the runtime plan offers unless `lib/stripe/plans.ts` already does so.

Scope:

- Replace/archive Business-era entitlement matrix with Free/SME/Agency matrix.
- Create route/API/export/report entitlement matrix.
- Add smokes for plan gates on buyer-proof routes.
- Add Stripe webhook idempotency plan keyed by Stripe event id.
- Run a separately approved Stripe test-mode proof lane.

### T4-F: Legal/public proof and Trust Center disclosure closeout

Owner lane: 06
Dependent lanes: 03, 05, 10
Priority: P1

Scope:

- Decide whether public Trust Center API aggregate counts/scores are acceptable or need coarsening.
- Review/narrow `Compliant since <year>` style wording.
- Keep vendor-submitted proof as draft/manual-review provenance, not automatic pass.
- Expand export/report proof coverage after entitlement gates are clear.

### T4-G: Localization and knowledge-layer red-smoke repair

Owner lane: 10
Dependent lanes: 08
Priority: P1/P2

Dispatch status: unblocked. T4-G can proceed immediately; Italy localization scope may either populate reviewed rows or mark Italy explicitly draft/secondary, and plan vocabulary must align to canonical Free/SME/Agency public names.

Scope:

- Fix stale smoke expectations for `Readiness score` vs `Compliance score` and `Feed NÚKIB` vs `NÚKIB feed`, or decide copy source of truth.
- Populate/review missing IT GDPR/NIS2 article rows or mark Italy as explicitly draft/secondary.
- Add Helios evidence requirements metadata for 19 mappings or document why not applicable.
- Keep `smoke:reviewed-article-links` non-vacuous; T4-B already corrected the old weak-green behavior so it fails on zero reviewed article rows.

### T4-H: Frontend UX/a11y hardening

Owner lane: 07
Dependent lanes: 01, 10
Priority: P2

Scope:

- Add labels to placeholder-only newsletter/lead inputs.
- Improve mobile drawer and onboarding dialog focus/modal semantics.
- Add route-level loading/error/not-found boundaries.
- Reduce raw Tailwind palette/design-token drift where it affects consistency.
- Make progress/selection states programmatically accessible.

### T4-I: Performance/security/observability closeout

Owner lane: 09
Dependent lanes: 08
Priority: P2

Scope:

- Document dependency override rationale/removal criteria.
- Align Next ecosystem package versions or document compatibility risk.
- Add first-class Lighthouse script if performance budget becomes a gate.
- Add explicit Sentry PII/secret scrubber policy.
- Investigate all-public-routes-dynamic build output and edge runtime static-generation warning.

## Human approval queue

Before implementation:

1. Accept or change owner assignment for shared-file conflicts.
2. RESOLVED for T4-C: stale existing `unknown` statuses are left until re-attestation/new evidence; no production DB repair/backfill job in T4-C.
3. Decide public Trust Center aggregate disclosure/coarsening.
4. RESOLVED for T4-E/T4-G: Free/SME/Agency is the canonical plan model; Business, Starter, and Consultant are legacy aliases only; `lib/stripe/plans.ts` is runtime truth; `docs/product/business-entitlement-matrix.md` is archived/superseded and will be replaced by `docs/product/plan-entitlement-matrix.md`.
5. Approve paid-readiness proof scope and Stripe test/live boundaries.
6. RESOLVED for T4-C: retain audit logs on org deletion with documented legal basis; exact retention period must be set before paid launch.
7. NOT A T4-G BLOCKER: Italy localization can proceed by either populating reviewed rows or marking Italy explicitly draft/secondary; record whichever path T4-G implements.
8. Approve Woodpecker production migration path: guarded wrapper required before deploy, or explicit ops sign-off accepting the bare `npm run db:migrate` risk.
9. Decide pg SSL-mode configuration hardening: normalize to `sslmode=verify-full` where appropriate or document accepted `sslmode=require` / `uselibpqcompat` behavior.

## Recommended next action

Do not implement all findings at once.

Start with a T4-A/T4-B combined tranche:

1. Lane 08 creates the smoke taxonomy/local DB safety gate first.
2. Lane 02 creates the evidence/status semantics carve-out plan and RED tests.
3. Lane 01 consumes the accepted status semantics plan to repair visible activation behavior.
4. Independent verifier uses a clean worktree, fresh `npm ci`, no inherited env, and local/disposable DB only.

This order prevents the highest-risk bug from being implemented on top of unsafe verification harnesses or ambiguous DB semantics.
