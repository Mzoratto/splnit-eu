# Entire Codebase Audit - Lane 01: Product Surfaces and Activation Loop

Date: 2026-06-02
Workspace: `/Users/marcozoratto/splnit.eu`
Mode: read-only audit with local/demo verification only

## Scope

Audited the user-facing authenticated product surfaces and first-use journey:

- dashboard
- onboarding/intake
- controls index and control detail
- evidence vault and first evidence path
- policies
- training
- risks
- vendors and vendor assessment/reporting
- incidents
- questionnaires
- Trust Center settings/public proof boundary
- integrations/workspaces relevant to activation
- agency/client flows

## Exclusions and guardrails followed

- No code implementation.
- No commit, push, deploy, or production mutation.
- No production database writes/backfills.
- No production Blob reads, signed URLs, uploads, downloads, deletes, or file operations.
- Commands were limited to existing local/demo Playwright and smoke scripts.
- Production-sensitive smoke scripts were not run.
- Existing T0 baseline in `.hermes/state/entire-codebase-audit-ledger.md` was used as context.

## Commands run

Initial worktree state:

```text
M docs/README.md
?? .hermes/state/entire-codebase-audit-ledger.md
?? docs/audits/entire-codebase-lane-02-data-model-db-migrations.md
?? docs/audits/entire-codebase-lane-03-auth-org-boundaries.md
?? docs/product/implementation-gap-audit.md
```

Safe local verification command executed:

```bash
git status --short && npm run test:e2e:activation-loop && npm run test:e2e:intake-prioritization && npm run smoke:primary-flow && npm run smoke:evidence-state-transitions && npm run smoke:copy-hygiene
```

Result: pass.

Relevant output summary:

```text
5 passed - tests/e2e/activation-loop.spec.ts
4 passed - tests/e2e/intake-prioritization-smoke.spec.ts
Primary flow smoke test passed.
Evidence state transition smoke test passed.
Copy hygiene smoke test passed.
```

T0 smoke baseline also records these relevant existing results:

- `npm run smoke:primary-flow` - pass
- `npm run test:e2e:activation-loop` - pass
- `npm run test:e2e:intake-prioritization` - pass
- `npm run smoke:evidence-state-transitions` - pass
- `npm run smoke:copy-hygiene` - pass
- `npm run smoke:trust-center-settings` - pass
- `npm run smoke:trust-center-public-disclosure` - pass
- `npm run smoke:training-module` - pass
- `npm run smoke:policy-drafts` - pass
- `npm run smoke:incident-notifications` - pass
- `npm run smoke:questionnaire-artifacts` - pass
- `npm run smoke:questionnaire-review-gate` - pass
- `npm run smoke:agency-model` - pass
- `npm run smoke:agency-invite-client-cache` - pass
- `npm run smoke:export-endpoints-source` - pass
- `npm run smoke:org-boundaries` - pass

Known T0 caveat:

- `npm run smoke:activation-status` fails in the baseline due to the smoke harness rendering a `next-intl` hook without the required provider context. The local/demo activation E2E and source smokes passed, so this is treated as a test harness gap, not product breakage proof.

## Files and directories inspected

Planning/context:

- `AGENTS.md`
- `.hermes/plans/2026-06-02_094729-lane-01-product-surfaces-activation.md`
- `.hermes/state/entire-codebase-audit-ledger.md`
- `docs/product/implementation-gap-audit.md`
- `package.json`

Primary app/product surfaces:

- `app/(app)/layout.tsx`
- `app/(app)/dashboard/page.tsx`
- `app/(app)/dashboard/actions.ts`
- `app/(app)/onboarding/page.tsx`
- `app/(app)/onboarding/actions.ts`
- `app/(app)/controls/page.tsx`
- `app/(app)/controls/[controlId]/page.tsx`
- `app/(app)/controls/[controlId]/actions.ts`
- `app/(app)/evidence/page.tsx`
- `app/(app)/policies/page.tsx`
- `app/(app)/policies/[type]/page.tsx`
- `app/(app)/policies/actions.ts`
- `app/(app)/training/page.tsx`
- `app/(app)/training/actions.ts`
- `app/(app)/training/delete-record-form.tsx`
- `app/(app)/risks/page.tsx`
- `app/(app)/risks/actions.ts`
- `app/(app)/incidents/page.tsx`
- `app/(app)/incidents/actions.ts`
- `app/(app)/vendors/page.tsx`
- `app/(app)/vendors/[vendorId]/page.tsx`
- `app/(app)/vendors/actions.ts`
- `app/(app)/questionnaires/page.tsx`
- `app/(app)/questionnaires/actions.ts`
- `app/(app)/trust-center/page.tsx`
- `app/(app)/trust-center/actions.ts`
- `app/(app)/trust-center/client-access-section.tsx`

Integrations/workspaces relevant to first-use activation:

- `app/(app)/integrations/page.tsx`
- `app/(app)/integrations/microsoft365/page.tsx`
- `app/(app)/integrations/github/page.tsx`
- `app/(app)/integrations/aws/page.tsx`
- `app/(app)/integrations/[provider]/page.tsx`
- `app/(app)/integrations/[provider]/actions.ts`
- `app/(app)/integrations/aws/actions.ts`
- `app/(app)/workspaces/actions.ts`
- `app/(app)/workspaces/pohoda/page.tsx`
- `app/(app)/workspaces/money-s3/page.tsx`
- `app/(app)/workspaces/helios/page.tsx`
- `app/(app)/workspaces/helios/import/page.tsx`
- `app/(app)/workspaces/helios/import/actions.ts`
- `app/(app)/workspaces/abra-flexi/page.tsx`
- `app/(app)/workspaces/abra-flexi/actions.ts`
- `app/(app)/workspaces/abra-flexi/connection-form.tsx`
- `components/workspaces/workspace-renderer.tsx`

Agency/client/settings:

- `app/(app)/agency/layout.tsx`
- `app/(app)/agency/dashboard/page.tsx`
- `app/(app)/agency/actions.ts`
- `app/(app)/agency/settings/page.tsx`
- `app/(app)/agency/signup/page.tsx`
- `app/(app)/agency/signup/actions.ts`
- `app/(app)/agency/signup/complete/page.tsx`
- `app/(app)/agency-client-invites/[token]/page.tsx`
- `app/(app)/agency/clients/[orgId]/page.tsx`
- `app/(app)/clients/page.tsx`
- `app/(app)/clients/[clientOrgId]/page.tsx`
- `app/(app)/clients/actions.ts`
- `app/(app)/settings/organisation/page.tsx`
- `app/(app)/settings/billing/page.tsx`
- `app/(app)/settings/billing/actions.ts`
- `app/(app)/settings/profile/page.tsx`
- `app/(app)/settings/audit-log/page.tsx`
- `app/(app)/team/page.tsx`
- `app/(app)/team/access-reviews/page.tsx`
- `app/(app)/team/access-reviews/actions.ts`

Shared components/domain/query seams:

- `components/onboarding/onboarding-wizard.tsx`
- `components/activation/activation-status.tsx`
- `components/app/data-mode-notice.tsx`
- `components/app/page-header.tsx`
- `components/app/status-pill.tsx`
- `components/export/compliance-report-button.tsx`
- `components/questionnaires/questionnaire-workbench.tsx`
- `components/trust-center/trust-center-preview-panel.tsx`
- `lib/db/queries/dashboard.ts`
- `lib/db/queries/onboarding.ts`
- `lib/db/queries/controls.ts`
- `lib/db/queries/evidence.ts`
- `lib/db/queries/workspaces.ts`
- `lib/db/queries/training.ts`
- `lib/db/queries/policies.ts`
- `lib/db/queries/risks.ts`
- `lib/db/queries/incidents.ts`
- `lib/db/queries/vendors.ts`
- `lib/db/queries/questionnaires.ts`
- `lib/db/queries/trust-center.ts`
- `lib/db/queries/agencies.ts`
- `lib/db/queries/export.ts`
- `lib/db/queries/workspace-export.ts`
- `lib/activation/events.ts`
- `lib/activation/evidence-state.ts`
- `lib/dashboard/priority-controls.ts`
- `lib/onboarding/intake-scope.ts`
- `lib/onboarding/intake-questions.ts`
- `lib/workspaces/pohoda.ts`
- `lib/workspaces/money-s3.ts`
- `lib/workspaces/helios.ts`
- `lib/workspaces/helios/lifecycle.ts`
- `lib/workspaces/abra-flexi.ts`
- `lib/stripe/plans.ts`
- `lib/stripe/subscriptions.ts`
- `messages/cs-CZ.json`
- `messages/en-EU.json`
- `messages/it-IT.json`
- `tests/e2e/activation-loop.spec.ts`
- `tests/e2e/intake-prioritization-smoke.spec.ts`
- `tests/e2e/onboarding.spec.ts`
- `tests/e2e/pohoda-workspace.spec.ts`
- `tests/e2e/money-s3-workspace.spec.ts`
- `tests/e2e/helios-workspace.spec.ts`
- `tests/e2e/org-aware-index-pages.spec.ts`

## Classification summary

| Surface / journey segment | Classification | Evidence |
| --- | --- | --- |
| Dashboard entry | Partial / implemented with caveats | `app/(app)/dashboard/page.tsx`, `lib/db/queries/dashboard.ts`; no-Clerk/no-DB fallback uses demo/unavailable modes; local E2E confirms dashboard renders without intake. |
| Onboarding wizard | Partial / implemented with caveats | `app/(app)/onboarding/page.tsx`, `components/onboarding/onboarding-wizard.tsx`, `app/(app)/onboarding/actions.ts`; persists company/tools/frameworks/intake/complete when live session and DB exist. |
| Intake-derived priority controls | Partial / first-use branch risk | `saveIntakeStep` seeds statuses from intake, but `seedInitialControlStatusesFromIntakeScope` filters by persisted `orgFrameworks`; if the user opens focus controls immediately after intake before framework persistence, the live priority page can be empty. |
| Controls index | Partial / implemented with caveats | `app/(app)/controls/page.tsx`, `lib/db/queries/controls.ts`; supports focus/all and scope filters; live data depends on `orgFrameworks`; demo fallback is synthetic. |
| Control detail and manual evidence upload | Partial / blocked in local/prod without Blob config | `app/(app)/controls/[controlId]/page.tsx`, `actions.ts`; upload is disabled unless `BLOB_READ_WRITE_TOKEN` exists; no browser-level Blob upload verification was run. |
| Evidence vault | Partial | `app/(app)/evidence/page.tsx`, `lib/db/queries/evidence.ts`; lists org evidence, but expiry filter currently calls `getDaysUntil(null)`, so expiry filtering cannot reflect real evidence expiry. |
| Manual evidence/status propagation | Partial / activation-loop risk | `lib/db/queries/evidence.ts` inserts/updates `orgControlStatuses` as `status: "unknown"` and only updates timestamps on conflict; manual pass/gap/manual_review evidence does not reliably propagate to dashboard/control/report status. |
| Policies | Partial / implemented with caveats | `app/(app)/policies/page.tsx`, `policies/actions.ts`; template list and generation exist; PDF generation requires `BLOB_READ_WRITE_TOKEN`; legal/public copy approval remains human-gated. |
| Training | Implemented with caveats | `app/(app)/training/page.tsx`, `training/actions.ts`, `lib/db/queries/training.ts`; live CRUD exists; fallback has demo records; TODO remains for reliable employee roster coverage denominator. |
| Risks | Implemented with caveats | `app/(app)/risks/page.tsx`, `risks/actions.ts`; live CRUD/register/report flow exists; demo/unavailable fallback; broader report pagination/capping caveats remain. |
| Incidents | Implemented with caveats | `app/(app)/incidents/page.tsx`, `incidents/actions.ts`; live incident register and notification worksheets exist; not an authority-submission integration. |
| Vendors | Implemented with caveats | `app/(app)/vendors/page.tsx`, `[vendorId]/page.tsx`, `vendors/actions.ts`; vendor CRUD/detail/report exists; vendor-submitted assessment/evidence is not yet first-class control evidence. |
| Questionnaires | Partial / blocked by AI/legal config for production | `app/(app)/questionnaires/page.tsx`, `questionnaires/actions.ts`; generation gated by `hasQuestionnaireAiConfig`; review gate/export smokes pass; legal/DPA/retention/subprocessor approval remains required. |
| Trust Center settings | Implemented with caveats | `app/(app)/trust-center/page.tsx`, `actions.ts`, `lib/db/queries/trust-center.ts`; settings/client access/public URL flow exists; custom DNS self-serve proof absent; public proof boundary must remain aggregate-only. |
| Agency dashboard/settings/client management | Partial / paid-plan gated | `app/(app)/agency/layout.tsx`, `agency/dashboard/page.tsx`, `agency/settings/page.tsx`, `clients/actions.ts`; agency layout requires active `agency` subscription unless bypass is enabled; invite/client cache smoke passes. |
| Client workspace collaboration | Partial | `components/workspaces/workspace-renderer.tsx`, `app/(app)/workspaces/actions.ts`, agency client pages; comments/attestations exist but status propagation issue affects visible progress outside workspace evidence rows. |
| Workspaces - Pohoda | Partial / manual checklist only | `app/(app)/workspaces/pohoda/page.tsx`, `lib/workspaces/pohoda.ts`; no connector/live ingestion found. |
| Workspaces - Money S3 | Partial / manual checklist only | `app/(app)/workspaces/money-s3/page.tsx`, `lib/workspaces/money-s3.ts`; no connector/live ingestion found. |
| Workspaces - Helios | Partial / CSV/manual lifecycle; no live connector | `app/(app)/workspaces/helios/page.tsx`, `import/actions.ts`, `lib/workspaces/helios/lifecycle.ts`; CSV imports must remain customer-reported manual_review/gap, never automatic pass. |
| Workspaces - ABRA Flexi | Partial integration plus manual workspace | `app/(app)/workspaces/abra-flexi/page.tsx`, `connection-form.tsx`, integration tests/checks; broader workspace remains manual; no immediate first-run enqueue after connect. |
| Integrations index/provider pages | Partial | `app/(app)/integrations/page.tsx`, provider pages/actions; Microsoft has OAuth first-run enqueue; API-key connectors lack immediate first-run enqueue. |
| Billing/plan gates | Partial / paid production blocked | `settings/billing/page.tsx`, `lib/stripe/plans.ts`, `lib/stripe/subscriptions.ts`; agency/compliance report gates exist, many buyer proof features are sparse/inconsistent in plan gating. |

## Key findings

### 1. Fresh-user activation can claim first gaps are ready before live controls are guaranteed

Evidence:

- `components/onboarding/onboarding-wizard.tsx` calls `saveIntakeStep` from the intake step and opens the reveal.
- `app/(app)/onboarding/actions.ts` records intake, marks intake completed, seeds control statuses, and records activation events.
- `lib/db/queries/onboarding.ts` seeds initial statuses only for controls mapped to `getPersistedFrameworkSlugs(clerkOrgId)`.
- `lib/db/queries/controls.ts` lists controls from `orgFrameworks` joined through framework controls.

Risk:

A fresh user who follows the post-intake CTA to focused controls can reach an empty or incomplete live controls page if frameworks have not been persisted yet. This breaks the promised first-use loop: intake -> first gaps -> first action.

Classification: partial.

### 2. Manual/workspace/CSV evidence does not reliably propagate assessment result to `orgControlStatuses.status`

Evidence:

- `app/(app)/workspaces/actions.ts` derives an `assessmentResult` from attestation answers.
- `lib/db/queries/evidence.ts` stores the evidence row with that result.
- The same function inserts `orgControlStatuses.status: "unknown"` and on conflict updates only `lastEvidenceAt` and `updatedAt`.
- `listEvidenceVault` and export metadata join `orgControlStatuses.status`, so downstream surfaces can show status that does not match latest evidence.

Impact:

Workspace progress can appear advanced because it reads latest evidence rows, while dashboard/control/report surfaces can remain `unknown`. This is the highest-risk activation-loop defect because first evidence does not visibly change readiness state everywhere.

Classification: partial / high risk.

Dependency note:

Any implementation touching `lib/db/queries/evidence.ts`, `orgControlStatuses`, or export/report routes should wait for Lane 02/03 GREEN or be coordinated against those lanes, because this is a shared data-model/auth-boundary seam.

### 3. Evidence vault expiry filter is effectively non-functional

Evidence:

- `app/(app)/evidence/page.tsx` computes `const daysUntilExpiry = getDaysUntil(null);` inside filtering.
- No row expiry value is passed into the filter.

Impact:

`expired` and `next 30 days` filters cannot match real expiry state; `none` can over-match. This is a visible product correctness issue for evidence management.

Classification: partial.

### 4. First evidence browser path is not fully verified

Evidence:

- Control detail upload is disabled unless `BLOB_READ_WRITE_TOKEN` exists.
- `app/(app)/controls/[controlId]/actions.ts` throws when Blob token is absent.
- Local command verification covered DB/query-level primary flow and evidence state transitions, not authenticated browser upload through Blob.

Impact:

The product has a code path for manual evidence but lacks safe local browser proof that a fresh user can upload evidence and see it on control/evidence/dashboard surfaces without production Blob operations.

Classification: partial / blocked by safe Blob test strategy.

### 5. Buyer-facing surfaces exist but feature gates and proof boundaries are uneven

Evidence:

- Trust Center settings/public disclosure smokes pass in T0 and public proof model is aggregate-focused.
- Vendor, risk, incident, questionnaire, audit log, workspace export, and compliance report routes exist in the codebase/T0 source smokes.
- Billing/entitlement search shows hard gates mainly around agency layout/client actions/compliance report, while vendors/risks/incidents/questionnaires/Trust Center are mostly auth/org-scoped or feature-flagged.

Impact:

The app may expose buyer-facing proof surfaces before paid plan, legal, AI, and proof-boundary decisions are fully reconciled.

Classification: implemented with caveats.

### 6. Workspaces are useful activation surfaces but several are manual/static only

Evidence:

- Pohoda and Money S3 are manual checklist workspaces with no connector/live ingestion found.
- Helios has manual workspace plus CSV-assisted import/lifecycle, but no live connector.
- ABRA Flexi has credential checks plus manual workspace, but broad workspace still relies on manual attestations.

Impact:

Public/product copy must avoid live automation claims for Pohoda, Money S3, and Helios. For ABRA, claims should distinguish automated checks from manual controls.

Classification: partial/manual.

## Surface-specific notes

### Dashboard

Implemented with caveats. The page attempts live org/dashboard data only when Clerk and DB are configured, otherwise uses demo/unavailable paths. It avoids fake live scores in no-data states but still includes demo export identity fallbacks for local/demo paths. Dashboard progress depends on `getDashboardData`, `orgFrameworks`, `orgControlStatuses`, evidence rows, and activation events.

### Onboarding and first-use journey

Implemented with caveats. Company, intake, tools, frameworks, connector recommendation, score reveal, and completion exist. Local activation-loop E2E passed. The main issue is ordering: the intake reveal can push to priority controls before persisted frameworks have guaranteed live controls.

### Controls

Implemented with caveats. Index supports priority/gap/out-of-scope filters and activation status display. Detail supports status mutation and evidence upload. Live detail mutations depend on existing control detail; fallback/demo is synthetic. User-friendly recovery for action failures is limited.

### Evidence

Partial. Evidence rows are listed and linked to controls. Download links exist for rows with files. Expiry filtering is broken. Manual evidence status propagation is the key shared data issue.

### Policies

Partial. Policy templates, generation action, detail route, source documents, and PDF download are present. Generation is blocked without Blob token and legal/copy approval remains required before public/customer reliance.

### Training

Implemented with caveats. Live training record creation/deletion and gap summary exist; training affects controls summary in `lib/db/queries/controls.ts`. Remaining caveat: employee roster denominator is TODO, so coverage metrics should not be overclaimed.

### Risks

Implemented with caveats. Risk register has live CRUD/status and report/download surface. There is demo/unavailable fallback. Recommended follow-up is report coverage/pagination smoke, not core UI existence.

### Incidents

Implemented with caveats. Incident register, status updates, 72-hour GDPR countdown, and draft report/notification worksheets exist. It is not an authority submission integration and should not be described as one.

### Vendors

Implemented with caveats. Vendor CRUD/detail, public tokenized assessment, and supply-chain report exist. Vendor answers/evidence are not yet first-class draft evidence linked to controls.

### Questionnaires

Partial/blocked. Page and workbench exist; generation requires DB/Clerk and AI config. Review gate and artifact smokes pass. Human approval is required for OpenAI DPA/retention/training/subprocessor/transfer mechanism and customer wording.

### Trust Center settings

Implemented with caveats. Authenticated settings, public URL preview, client access requests, approval/decline actions, and public-disclosure smoke exist. Keep aggregate-only public disclosure. Custom DNS/self-serve domain proof is absent.

### Agency/client flows

Partial. Agency routes exist and are subscription-gated. Client dashboard/list/detail, invites, comments, and workspace collaboration exist. Current risk is that client/manual attestation progress can diverge from dashboard/control status because of evidence status propagation.

## Security, compliance, and proof-boundary notes

- Trust Center public pages/API must continue to avoid individual control IDs, evidence filenames, raw evidence, exact test timing, exact control/document counts where attacker-useful, and continuous-verification overclaims.
- Vendor assessment token routes must remain noindex/nofollow and org/token scoped.
- Questionnaire AI outputs must remain draft/human-review only; no legal advice, certification, or final buyer-answer claims without review.
- Incident reports are worksheets/drafts, not automated authority filings.
- CSV/manual workspace evidence must not be treated as automatic pass; Helios CSV should remain `manual_review` or `gap`.
- Paid production claims are blocked until Stripe/live checkout/webhook/legal gates are verified.
- Public claims must not present Pohoda, Money S3, or Helios as live integrations.
- Evidence upload/download tests must not use production Blob in verification.

## Top risks

1. First manual evidence/workspace attestation does not update the user-visible control status everywhere.
2. Fresh-user post-intake CTA can land on empty live priority controls if frameworks are not persisted first.
3. Evidence expiry filters are visibly incorrect.
4. First browser evidence upload is not safely verified without production Blob.
5. Buyer-facing proof surfaces are broader than plan/legal/AI approval gates.
6. Manual/static workspaces can be overclaimed as automated integration readiness.
7. Agency/client progress depends on shared status/evidence seams and can diverge between workspace and dashboard/report views.

## Recommended implementation slices

### Slice A - Status propagation for manual evidence/workspace/CSV evidence

Goal:

- Make first manual evidence/gap visibly update dashboard, controls, evidence vault, reports, and exports.

Likely files:

- `lib/db/queries/evidence.ts`
- `app/(app)/workspaces/actions.ts`
- `app/(app)/workspaces/helios/import/actions.ts`
- `lib/db/queries/controls.ts`
- `lib/db/queries/dashboard.ts`
- `lib/db/queries/export.ts`
- `lib/db/queries/workspace-export.ts`
- New or updated smoke script for workspace attestation status propagation

Acceptance criteria:

- Manual evidence with `pass`, `gap`, or `manual_review` maps intentionally to `orgControlStatuses.status`.
- Helios CSV import never creates automatic pass; only `manual_review`/`gap` with customer-reported provenance.
- Dashboard/control index/evidence export reflect the updated status.
- Smoke proves a workspace attestation or Helios CSV import updates status surfaces.

RED command:

- Add/run a targeted smoke that currently fails because status remains `unknown` after manual/workspace evidence.

GREEN command:

- `npm run smoke:evidence-state-transitions`
- targeted new status propagation smoke
- `npm run smoke:primary-flow`

Rollback/flag strategy:

- No feature flag needed if mapping is conservative and tested; rollback is reverting the status mapping change.

Existing-data migration/backfill decision:

- Required decision. Existing evidence rows may need a backfill to align `orgControlStatuses.status` with latest evidence. Production backfill requires human approval and Lane 02/03 GREEN.

Dependency:

- Lane 02/03 GREEN required before changing shared `evidence.ts`, `orgControlStatuses`, or export/report behavior.

### Slice B - Fresh-user controls branch after intake

Goal:

- Ensure the post-intake CTA only sends a fresh org to priority controls after live frameworks/control statuses exist.

Likely files:

- `components/onboarding/onboarding-wizard.tsx`
- `app/(app)/onboarding/actions.ts`
- `lib/db/queries/onboarding.ts`
- `tests/e2e/activation-loop.spec.ts`
- `scripts/smoke-primary-flow.ts` or new targeted smoke

Acceptance criteria:

- After the message that first gaps are ready, `/controls?scope=priority` has non-empty live controls for a fresh org.
- Frameworks are persisted/defaulted before seeding or before focus-controls CTA is shown.
- Local activation-loop E2E remains green.

RED command:

- Add/run a fresh-org test that completes intake but has no pre-existing `orgFrameworks` and expects non-empty priority controls.

GREEN command:

- `npm run test:e2e:activation-loop`
- `npm run test:e2e:intake-prioritization`
- `npm run smoke:primary-flow`

Rollback/flag strategy:

- No persistent feature flag needed; rollback is reverting CTA ordering/default framework persistence.

Existing-data migration/backfill decision:

- No backfill expected unless implementation adds default frameworks for existing incomplete onboarding sessions. If so, human approval required.

### Slice C - Evidence vault expiry correctness and safe first-upload verification

Goal:

- Make evidence expiry filters real and prove first evidence upload without production Blob.

Likely files:

- `app/(app)/evidence/page.tsx`
- `lib/db/queries/evidence.ts`
- `app/(app)/controls/[controlId]/page.tsx`
- `app/(app)/controls/[controlId]/actions.ts`
- `tests/e2e/activation-loop.spec.ts` or new evidence upload E2E
- Optional local Blob mock/test-only upload seam

Acceptance criteria:

- Evidence rows expose/use real expiry when filtering.
- Browser test can complete onboarding, open first priority control, add a small evidence artifact through a safe local/test path, and see it on control + evidence pages.
- No production Blob is used.

RED command:

- Add/run a test proving expired/next-30/no-expiry filters currently misclassify rows.

GREEN command:

- targeted evidence filter smoke/E2E
- `npm run smoke:evidence-state-transitions`
- `npm run test:e2e:activation-loop`

Rollback/flag strategy:

- Local/test Blob mock should be gated by test env only. Expiry filter fix should not need a flag.

Existing-data migration/backfill decision:

- Depends on whether expiry is already persisted. If evidence expiry is absent from schema/query, Lane 02 must confirm schema/backfill needs.

Dependency:

- Coordinate with Lane 02 if expiry persistence or schema query shape changes.

### Slice D - Buyer proof feature gates and entitlement truth source

Goal:

- Align runtime plan gates, docs, public pricing, and buyer-facing product surfaces.

Likely files:

- `lib/stripe/plans.ts`
- `lib/stripe/subscriptions.ts`
- `app/(app)/trust-center/page.tsx`
- `app/(app)/vendors/page.tsx`
- `app/(app)/questionnaires/page.tsx`
- `app/(app)/risks/page.tsx`
- `app/(app)/incidents/page.tsx`
- export/report route handlers
- `docs/product/business-entitlement-matrix.md`
- plan-gate smoke scripts

Acceptance criteria:

- Each buyer-facing proof surface is intentionally free, paid, feature-flagged, or blocked with documented rationale.
- Docs and UI use runtime `free`/`sme`/`agency` model consistently.
- Plan-gate smoke verifies expected gates.

RED command:

- Add/run source smoke that lists ungated buyer-proof routes against desired entitlement matrix.

GREEN command:

- `npm run smoke:plan-gate-enforcement`
- new entitlement source smoke
- `npm run smoke:copy-hygiene`

Rollback/flag strategy:

- Use feature flags or plan gates per route/action; rollback by disabling flags or reverting gates.

Existing-data migration/backfill decision:

- No DB migration expected unless stored plan values change. Any plan key migration requires human approval.

### Slice E - Vendor assessment to draft evidence lifecycle

Goal:

- Convert vendor-submitted assessment answers into first-class draft evidence with provenance.

Likely files:

- `app/vendor-assessment/[token]/actions.ts`
- `app/(app)/vendors/actions.ts`
- `lib/db/queries/vendors.ts`
- `lib/db/queries/evidence.ts`
- `lib/vendors/questions.ts`
- vendor report/export smokes

Acceptance criteria:

- Vendor-submitted answers can create draft evidence linked to relevant controls.
- Provenance is `vendor_reported` or equivalent and assessment is `manual_review`, never automatic pass.
- Review/approval path is explicit.

RED command:

- Add/run smoke proving vendor assessment submission currently does not create linked draft evidence.

GREEN command:

- vendor questionnaire delivery/status smoke
- vendor report smoke
- new vendor-to-evidence smoke

Rollback/flag strategy:

- Gate draft evidence creation behind a feature flag if needed.

Existing-data migration/backfill decision:

- Backfill optional and human-approved only; likely start with new submissions.

Dependency:

- Coordinate with Lane 02/03 before writing evidence rows from public tokenized vendor routes.

## Shared-file claims / coordination registry

| File/symbol | Lane 01 claim | Why shared | Dependency / owner note |
| --- | --- | --- | --- |
| `lib/db/queries/evidence.ts` / `createManualEvidence` | Needs status propagation and expiry/query review | Core evidence persistence and org status side effects | Lane 02/03 GREEN required before implementation. |
| `orgControlStatuses` writes/read semantics | Needs mapping from evidence assessment to status | Shared DB model, reports, dashboard, exports | Lane 02 owns data-model/migration concerns; Lane 03 owns org-boundary/auth concerns. |
| `lib/db/queries/controls.ts` / `listOrgControlsForIndex` | Fresh-user activation depends on persisted `orgFrameworks` and intake scope | Controls are read by dashboard, Trust Center, agency, reports | Coordinate with Lane 02 if changing join/seed semantics. |
| `app/(app)/onboarding/actions.ts` | May need framework persistence before intake seeding/CTA | Writes org, frameworks, intake profile, activation events | Coordinate with activation/DB lanes before changing ordering. |
| `components/onboarding/onboarding-wizard.tsx` | CTA/order fix likely needed | UX-critical; affects E2E activation loop | Lane 01 owner for UX, but DB writes depend on Lane 02. |
| Export/report routes reading evidence/status | Must reflect fixed status and not leak proof details | Buyer-facing proof boundary | Wait for evidence/status semantics before changing exports. |
| Trust Center public model/API | Must stay aggregate-only | Security/proof-boundary shared with auth/org lanes | Any disclosure expansion needs human approval. |
| Plan gates/feature flags | Entitlement alignment needed | Billing/legal/product shared surface | Human approval for paid plan behavior. |

## Test/validation matrix

| Area | Existing passing verification | Additional needed verification |
| --- | --- | --- |
| Activation loop | `npm run test:e2e:activation-loop` passed locally | Fresh org with no pre-existing frameworks must land on non-empty priority controls. |
| Intake prioritization | `npm run test:e2e:intake-prioritization` passed locally | Add live-query smoke around `orgFrameworks` seeding/order. |
| Primary flow | `npm run smoke:primary-flow` passed locally | Extend to assert manual evidence updates `orgControlStatuses.status`. |
| Evidence state | `npm run smoke:evidence-state-transitions` passed locally | Add evidence-vault expiry filter tests. |
| Copy hygiene | `npm run smoke:copy-hygiene` passed locally | Keep claims guarded after workspace/integration copy changes. |
| Trust Center | T0 `smoke:trust-center-settings` and `smoke:trust-center-public-disclosure` passed | Re-run after any public model/API changes. |
| Policies | T0 `smoke:policy-drafts` passed | Add PDF/browser path coverage with safe Blob strategy. |
| Training | T0 `smoke:training-module` passed | Add roster/coverage denominator when employee roster exists. |
| Incidents | T0 `smoke:incident-notifications` passed | Add PDF/report text extraction smoke if report copy becomes buyer-critical. |
| Questionnaires | T0 questionnaire artifact/citation/review smokes passed | Production AI config/legal verification remains blocked. |
| Agency/client | T0 `smoke:agency-model`, `smoke:agency-invite-client-cache`, `smoke:org-boundaries` passed | Add client workspace attestation -> dashboard status propagation test after Slice A. |
| Entitlements | T0 plan-gate smokes passed | Add source smoke enumerating all buyer proof routes against entitlement matrix. |

## Human approval items

- Any production DB migration/backfill for `orgControlStatuses`, evidence expiry, or historical evidence status alignment.
- Any production Blob operation or live evidence upload/download verification.
- Any public Trust Center disclosure expansion, including whether aggregate `totalControls` remains acceptable.
- Any paid plan/entitlement behavior changes, pricing copy, checkout/live Stripe decisions, or production billing verification.
- Any legal/compliance posture change in public copy, policies, DPA, privacy, terms, SLA, support commitments, or incident-report wording.
- Any OpenAI/questionnaire production use decision: DPA, retention, model training/input use, subprocessors, transfer mechanism, opt-in wording, and human-review wording.
- Any claim that Pohoda, Money S3, Helios, ABRA Flexi, AWS, Hetzner, or OVHcloud are automated/live workspaces beyond the code paths proven.
- Any authority-submission claim for incident handling.
- Any public customer/auditor-facing claim that first evidence changes compliance readiness until Slice A is fixed and verified.

## Overall lane result

Status: PARTIAL.

The product has broad user-facing surfaces and the local/demo activation loop passes current E2E/smoke checks. The most important gap is not missing pages; it is state consistency in the first-use loop. A fresh user can be guided from onboarding to priority controls and evidence, but two seams can break trust:

1. intake can claim first gaps before live controls are guaranteed, and
2. manual/workspace evidence can be recorded without updating the control status users see on dashboard/report/proof surfaces.

Recommended next work order:

1. Slice A - status propagation for manual/workspace/CSV evidence, after Lane 02/03 GREEN.
2. Slice B - post-intake CTA/framework persistence ordering.
3. Slice C - evidence expiry filter and safe browser upload verification.
4. Slice D - entitlement/proof-surface gate alignment.
5. Slice E - vendor assessment to draft evidence lifecycle.
