# Splnit.eu Implementation Gap Audit

Date: 2026-06-02
Branch: main
Commit inspected: e9f2168

## Scope

This audit answers: which implementation should Splnit.eu add next?

The review focused on what a newly registered Czech SME can actually do end-to-end:

1. Dashboard / onboarding entry
2. Intake and priority gap discovery
3. Recommended integration or workspace
4. First evidence or explicit gap action
5. Buyer-facing proof: reports, Trust Center, vendors, questionnaires, exports
6. Billing/legal boundaries that affect paid production use

The audit deliberately does not infer readiness from UI cards alone. Static workspace config, demo data, or marketing copy is not treated as live implementation proof.

## Verification Performed

Read-only audit lanes inspected app routes, API routes, integration/workspace modules, DB query seams, smoke scripts, E2E tests, and current product docs.

Fresh checks run during the audit:

- `npm run smoke:primary-flow` - passed
- `npm run test:e2e:activation-loop` - passed, 5 tests
- `npm run test:e2e:intake-prioritization` - passed, 4 tests
- `npm run smoke:evidence-state-transitions` - passed
- `npm run smoke:controls-focus-activation-status-source` - passed
- `npm run smoke:activation-events-source` - passed
- `npm run smoke:trust-center-public-disclosure` - passed
- `npm run smoke:export-endpoints-source` - passed
- `npm run smoke:questionnaire-review-gate` - passed
- `npm run smoke:plan-gate-enforcement` - passed
- `npm run smoke:copy-hygiene` - passed

Known failing audit check:

- `npm run smoke:activation-status` failed because the smoke harness renders a `next-intl` hook without the required provider context. The activation UI state is still covered by passing E2E/source smokes, so this is classified as a test harness gap, not proven product breakage.

Inventory snapshot:

- App/API route files inspected/inventoried: 110 `page.tsx`/`route.ts` surfaces under `app/`
- API routes: 38
- Authenticated workspace pages: 5
  - `app/(app)/workspaces/abra-flexi/page.tsx`
  - `app/(app)/workspaces/helios/page.tsx`
  - `app/(app)/workspaces/helios/import/page.tsx`
  - `app/(app)/workspaces/money-s3/page.tsx`
  - `app/(app)/workspaces/pohoda/page.tsx`
- Authenticated integration pages: 5
  - `app/(app)/integrations/page.tsx`
  - `app/(app)/integrations/aws/page.tsx`
  - `app/(app)/integrations/github/page.tsx`
  - `app/(app)/integrations/microsoft365/page.tsx`
  - `app/(app)/integrations/[provider]/page.tsx`

## Executive Recommendation

Add implementation in this order:

1. Fix manual evidence and workspace attestations so they update `orgControlStatuses.status` from the actual assessment result.
2. Fix the first-session activation branch so a fresh user who clicks "open focused controls" after intake always sees live priority controls.
3. Add first-run enqueue for API-key connectors after successful connection.
4. Add a browser-verified first evidence upload path or safe local Blob mock.
5. Reconcile billing/entitlement docs and plan gates with runtime SME/Agency plans.
6. Finish Microsoft 365 token refresh lifecycle.
7. Decide whether AWS/Hetzner/OVHcloud get real authenticated workspace pages or remain integration/report-only surfaces.
8. Continue Helios as CSV/manual lifecycle before any live automation claim.

The strongest next product slice is not another marketing page. It is:

Fresh SME onboarding -> priority controls -> first gap/evidence action -> status reflected everywhere.

That slice directly improves the core activation loop and prevents static/manual workspace work from looking complete while dashboards/reports still read `unknown` status.

## Status Classification Legend

- Live verified: exercised by smoke/E2E/source checks in this audit or recent project verification.
- Implemented with caveats: code path exists, but production/live/customer proof or an important edge is missing.
- Static/manual/checklist: useful UI or config exists, but there is no live integration or automated workflow.
- Demo-only/UI-only: visible UX exists but is backed by synthetic data or disabled without auth/config.
- Blocked: requires legal, production credentials, counsel approval, billing proof, or customer secrets.
- Absent: no meaningful implementation found.

## 1. New-User Activation Loop

### Dashboard before intake

Classification: implemented with caveats / demo-verified.

Files:

- `app/(app)/dashboard/page.tsx`
- `lib/db/queries/dashboard.ts`
- `messages/cs-CZ.json`

What works:

- No-intake dashboard state points users toward onboarding instead of showing fake scores.
- `test:e2e:intake-prioritization` verifies dashboard rendering without intake.
- Copy is aligned with the recent support playbook: start with business records becoming evidence, not "upload evidence" as a cold first instruction.

Caveats:

- Dashboard onboarding progress is mostly static; `activeOnboardingStep` is hardcoded to `0`.
- In no-Clerk/no-DB mode the dashboard relies on demo/unavailable states.
- Activity guidance depends on priority controls; without intake/data it can be empty.

### Onboarding and intake

Classification: implemented with caveats / live primary-flow smoke verified.

Files:

- `app/(app)/onboarding/page.tsx`
- `app/(app)/onboarding/actions.ts`
- `components/onboarding/onboarding-wizard.tsx`
- `lib/db/queries/onboarding.ts`
- `lib/onboarding/intake-scope.ts`
- `lib/onboarding/intake-questions.ts`

What works:

- Six-step wizard exists: company, intake, tools, frameworks, integration, score.
- Server actions persist company, tools, frameworks, intake profile, derived scope, onboarding completion.
- Intake derives applicable/out-of-scope/priority controls and records activation events.
- `npm run smoke:primary-flow` passed.
- `npm run test:e2e:activation-loop` passed.

Key gap:

- After intake, the dialog offers "Otevřít fokus kontrol" before frameworks may be saved for a fresh org. Live `listOrgControlsForIndex` depends on `orgFrameworks`, so a user can be told first gaps are ready but then reach an empty controls page.

Recommended slice:

- Make the post-intake CTA continue through tools/framework confirmation first, or persist default frameworks before the focus-controls CTA appears.
- Acceptance criterion: after "První mezery jsou připravené", `/controls?scope=priority` shows live priority controls for a fresh org.

### Priority controls and first gap action

Classification: implemented with caveats / demo E2E and DB query path verified.

Files:

- `app/(app)/controls/page.tsx`
- `app/(app)/controls/[controlId]/page.tsx`
- `app/(app)/controls/[controlId]/actions.ts`
- `lib/db/queries/controls.ts`
- `lib/dashboard/priority-controls.ts`

What works:

- Controls index supports focus/all modes and scope filters: in-scope, priority, gaps, out-of-scope.
- Priority ranking uses intake priority, status, applicable scope, and rationale.
- Control detail status updates record audit log, recalculate score, record activation event, and can send gap alert.

Caveats:

- Live controls require `orgFrameworks` to exist.
- Demo controls are synthetic.
- Detail mutations are disabled when no live detail exists.
- Action failures throw rather than surfacing a friendly UI recovery path.

### First evidence upload / evidence vault

Classification: implemented with caveats.

Files:

- `app/(app)/controls/[controlId]/page.tsx`
- `app/(app)/controls/[controlId]/actions.ts`
- `app/(app)/evidence/page.tsx`
- `lib/db/queries/evidence.ts`

What works:

- Control detail has a manual evidence upload form.
- Upload writes private Vercel Blob, creates evidence row, audit log, activation event, and revalidates dashboard/evidence/control.
- Evidence page lists evidence and links back to controls.
- `smoke:primary-flow` creates manual evidence at DB/query level.

Caveats:

- UI upload requires `BLOB_READ_WRITE_TOKEN`.
- Demo/no-DB mode disables upload.
- There is no browser E2E proving authenticated file upload through Blob in this audit.
- Evidence expiry filtering appears wrong: page code computes days-until-expiry from `null`, so expiry filters cannot reflect actual evidence expiry.

Recommended slice:

- Fix expiry filtering and add an authenticated browser test or local Blob mock for first evidence upload.

## 2. Integrations And Workspaces

### Supported integration registry

Classification: implemented.

Current supported providers in `lib/integrations/registry.ts`:

- `microsoft365`
- `github`
- `aws`
- `abra-flexi`
- `hetzner`
- `ovhcloud`

Pohoda, Money S3, and Helios are workspaces, not live integration providers.

### Microsoft 365

Classification: mostly end-to-end implemented, with token-lifecycle gap.

Files:

- `app/api/integrations/microsoft/start/route.ts`
- `app/api/integrations/microsoft/callback/route.ts`
- `lib/integrations/microsoft365/client.ts`
- `lib/integrations/microsoft365/tests.ts`
- `lib/integrations/microsoft365/test-definitions.ts`
- `lib/integrations/first-run-enqueue.ts`

What works:

- OAuth start/callback path exists.
- Callback stores encrypted tokens, creates pending evidence, records audit/activation events, and enqueues first run.
- Graph checks map to test definitions and integration runner evidence.

Gap:

- A refresh helper exists in `lib/integrations/microsoft365/oauth.ts`, but it is not wired into `getGraphClient` or the runner path. `lib/integrations/microsoft365/client.ts` decrypts and returns only the stored access token. Long-lived readiness is incomplete after access token expiry.

Recommended slice:

- Wire token refresh before Graph checks, persist refreshed access token/expiry, and add smoke coverage for expired-token refresh and permission failures.

### AWS

Classification: end-to-end integration implemented; workspace is static/report-only.

Files:

- `app/(app)/integrations/aws/page.tsx`
- `app/(app)/integrations/aws/actions.ts`
- `lib/connectors/aws/checks.ts`
- `lib/integrations/aws/tests.ts`
- `lib/integrations/aws/test-definitions.ts`
- `lib/workspaces/aws.ts`

What works:

- API-key credential form/action.
- STS health probe.
- Checks for EC2, security groups, S3 backup recency, CloudTrail.
- Background runner creates automated evidence/status.

Gaps:

- Successful API-key connection does not enqueue an immediate first run.
- No authenticated `/workspaces/aws` page found.

### Hetzner Cloud

Classification: end-to-end integration implemented; workspace UX is demo/static/report-only.

Files:

- `app/(app)/integrations/[provider]/page.tsx`
- `app/(app)/integrations/[provider]/actions.ts`
- `lib/connectors/hetzner/checks.ts`
- `lib/integrations/hetzner/tests.ts`
- `lib/integrations/hetzner/test-definitions.ts`
- `lib/workspaces/hetzner.ts`

Gaps:

- Successful API-key connection does not enqueue immediate first run.
- Authenticated `/workspaces/hetzner` page not found; only demo workspace page exists.
- Code has TODOs for production server IDs and volume-specific snapshot history.

### OVHcloud

Classification: end-to-end integration when `serviceName` is present; workspace is static/report-only.

Files:

- `app/(app)/integrations/[provider]/page.tsx`
- `app/(app)/integrations/[provider]/actions.ts`
- `lib/connectors/ovhcloud/checks.ts`
- `lib/integrations/ovhcloud/tests.ts`
- `lib/integrations/ovhcloud/test-definitions.ts`
- `lib/workspaces/ovhcloud.ts`

Gap:

- `serviceName` is optional in the connect UX but required for dedicated-server checks. A credential can appear connected while checks fail.

Recommended slice:

- Require `serviceName` at connect time or add service discovery/selection.

### ABRA Flexi

Classification: partial end-to-end integration plus manual workspace.

Files:

- `app/(app)/workspaces/abra-flexi/page.tsx`
- `app/(app)/workspaces/abra-flexi/connection-form.tsx`
- `lib/connectors/abra-flexi/checks.ts`
- `lib/integrations/abra-flexi/tests.ts`
- `lib/integrations/abra-flexi/test-definitions.ts`
- `lib/workspaces/abra-flexi.ts`

What works:

- Credential storage/health path exists.
- Checks include user list access, HTTPS transport, backup endpoint fallback/manual review, configuration readable.
- Manual workspace controls exist.

Gaps:

- No immediate first-run enqueue after connect.
- Only a subset of ABRA controls are automated; wider workspace remains manual.
- UX is split: ABRA primarily lives under `/workspaces/abra-flexi`, not a standard integration detail page.

### Pohoda

Classification: static/manual checklist workspace only.

Files:

- `app/(app)/workspaces/pohoda/page.tsx`
- `lib/workspaces/pohoda.ts`
- `components/workspaces/workspace-renderer.tsx`
- `app/(app)/workspaces/actions.ts`

What works:

- Manual attestation workspace.
- Progress reads latest evidence rows by control.
- Smoke/E2E coverage exists for workspace config/page shape.

Absent:

- No connector, client, adapter, API callback, background runner, or live Pohoda data ingestion found.

### Money S3

Classification: static/manual checklist workspace only.

Files:

- `app/(app)/workspaces/money-s3/page.tsx`
- `lib/workspaces/money-s3.ts`
- `components/workspaces/workspace-renderer.tsx`
- `app/(app)/workspaces/actions.ts`

Absent:

- No connector, client, adapter, API callback, background runner, or live Money S3 data ingestion found.

### Helios

Classification: manual workspace plus CSV-assisted import and lifecycle; no live connector.

Files:

- `app/(app)/workspaces/helios/page.tsx`
- `app/(app)/workspaces/helios/import/page.tsx`
- `app/(app)/workspaces/helios/import/actions.ts`
- `lib/workspaces/helios.ts`
- `lib/workspaces/helios/lifecycle.ts`
- `lib/workspaces/control-seeds.ts`
- `scripts/seed-helios-controls.ts`
- `inngest/workspace-evidence-lifecycle.ts`

What works:

- Static controls plus manual workspace.
- CSV import path exists.
- Dedicated control seeding exists.
- Freshness/remediation lifecycle exists.

Boundary:

- This is stronger than a static checklist, but it is not live Helios automation. CSV imports are customer-reported and must remain `manual_review`/`gap`, not automatic pass.

### ProID

Classification: absent.

No ProID implementation was found.

### Cross-cutting integration/workspace gap

Most important implementation gap:

Manual attestation evidence appears not to propagate its `assessmentResult` into `orgControlStatuses.status`.

Observed seam:

- `app/(app)/workspaces/actions.ts` derives an assessment result.
- `lib/db/queries/evidence.ts` stores the evidence row.
- The org-control status upsert appears to insert `unknown` and only update timestamps/evidence references on conflict, rather than setting status to the actual manual assessment.

Impact:

- Workspace progress can look correct because it reads latest evidence rows.
- Dashboard/reports/control status can remain `unknown` even after a manual pass/gap/manual_review attestation.
- This affects Pohoda, Money S3, Helios, ABRA manual controls, and likely Helios CSV status propagation.

Recommended slice:

- Update manual evidence, manual attestation evidence, and Helios CSV import evidence to propagate assessment result to `orgControlStatuses.status`.
- Add smoke coverage that proves a workspace attestation or Helios CSV import changes the control status used by dashboard/reports.

## 3. Buyer-Facing Proof Surfaces

### Reports and exports

Classification: live verified for first buyer-critical paths; implemented with caveats for broader suite.

Live verified surfaces:

- Audit log CSV export
  - `app/api/audit-log/export/route.ts`
  - `lib/db/queries/audit-logs.ts`
- Vendor PDF report
  - `app/api/vendors/supply-chain-report/route.ts`
  - `lib/pdf/vendor-risk-report.tsx`
- Risk PDF report
  - `app/api/risks/register-report/route.ts`
  - `lib/pdf/risk-register.ts`
- Workspace archive ZIP
  - `app/api/exports/workspace/archive/route.ts`
  - `lib/db/queries/workspace-export.ts`

Caveats:

- Compliance report PDF requires active subscription and exact org identity fields.
- Incident reports are draft notification worksheets, not authority submission integrations.
- Questionnaire exports are gated until review passes.
- Policy PDF download exists but product docs still call out production smoke gaps.
- Generic `/api/vendors/export`, `/api/risks/export`, `/api/incidents/export` are absent by design.
- Risk report pagination/continuation beyond capped rows is absent.
- PDF text extraction is not part of production smoke, so some proof relies on scoped queries and non-empty PDF checks.

Recommended slice:

- Add focused smoke coverage for compliance report PDF, policy PDF, incident PDFs, questionnaire PDF/XLSX after approved answers, and optional PDF text extraction for vendor/risk/incident reports.

### Trust Center

Classification: live verified / implemented with caveats.

Files:

- `app/(app)/trust-center/page.tsx`
- `app/(app)/trust-center/actions.ts`
- `app/(marketing)/trust/[orgSlug]/page.tsx`
- `app/(marketing)/trust/[orgSlug]/frameworks/[frameworkSlug]/page.tsx`
- `app/api/trust/[orgSlug]/route.ts`
- `lib/db/queries/trust-center.ts`
- `lib/trust-center/public-model.ts`
- `scripts/smoke-trust-center-public-disclosure.ts`

What works:

- Authenticated settings surface.
- Public trust route.
- NDA/access request and approved access URL flow.
- Public disclosure smoke guards against exact test timing, exact control/document counts, framework score percentages, continuous-verification overclaims, and demo fallback leakage.

Caveats:

- Public API returns category-level aggregate counts and framework totals. This is currently aligned with aggregate-only disclosure, but should remain guarded.
- DB-backed public model intentionally suppresses live timing.
- Custom slug exists; custom DNS/domain self-serve proof is absent.

Recommended slice:

- Keep or strengthen tests ensuring no control IDs, evidence filenames, exact test timing, raw evidence, or attacker-useful implementation detail leaks through UI or API.
- Decide whether public API `totalControls` should remain public or be coarsened further.

### Vendors

Classification: live verified for core vendor assessment flow; implemented with caveats for vendor evidence ingestion.

Files:

- `app/(app)/vendors/page.tsx`
- `app/(app)/vendors/[vendorId]/page.tsx`
- `app/(app)/vendors/actions.ts`
- `app/vendor-assessment/[token]/page.tsx`
- `app/vendor-assessment/[token]/actions.ts`
- `lib/db/queries/vendors.ts`
- `lib/vendors/questions.ts`
- `app/api/vendors/supply-chain-report/route.ts`

What works:

- Vendor app routes.
- Public tokenized vendor assessment route is noindex/nofollow.
- Submission persistence and vendor status/risk propagation are covered by production readiness docs.
- Vendor PDF report exists.

Gap:

- Vendor-submitted answers/evidence are not yet first-class draft evidence linked into the control/evidence lifecycle.

Recommended slice:

- Convert vendor-submitted questionnaire results into first-class draft evidence with provenance such as `vendor_reported` and `manual_review`, never automatic pass.

### Questionnaires

Classification: implemented with caveats; production-smoked when OpenAI is enabled.

Files:

- `app/(app)/questionnaires/page.tsx`
- `app/(app)/questionnaires/actions.ts`
- `app/api/questionnaires/export/pdf/route.ts`
- `app/api/questionnaires/export/xlsx/route.ts`
- `lib/questionnaires/provider.ts`
- `lib/questionnaires/openai.ts`
- `lib/questionnaires/citation-guard.ts`
- `lib/questionnaires/review-gate.ts`
- `docs/ops/questionnaire-ai.md`

What works:

- Authenticated page loads org-scoped compliance context.
- OpenAI provider path exists and is configurable.
- Answers are sanitized against available controls/evidence/policies.
- Outputs are persisted as generated artifacts and default to draft/review status.
- PDF/XLSX export is blocked until review gate passes.

Blocked/caveated:

- Broad customer use requires owner/counsel verification of OpenAI DPA, retention, training/use-of-input settings, subprocessor/transfer mechanism, and opt-in/human-review wording.

### Billing / plan gates

Classification: implemented with caveats; paid live onboarding blocked.

Files:

- `app/(app)/settings/billing/page.tsx`
- `app/(app)/settings/billing/actions.ts`
- `app/api/webhooks/stripe/route.ts`
- `lib/stripe/plans.ts`
- `lib/stripe/subscriptions.ts`
- `scripts/smoke-plan-gate-enforcement.ts`
- `docs/product/business-entitlement-matrix.md`

What works:

- Runtime plans are `free`, `sme`, `agency`.
- Plan bypass is disabled in production.
- Active subscription checks gate compliance report and agency/client surfaces.
- Billing page has safe unavailable behavior when Stripe config is missing.

Gaps:

- Plan gates are sparse. Trust Center, vendors, questionnaires, risk, incident, and many export/report surfaces are mostly auth/org-scoped but not consistently feature/plan-gated.
- `docs/product/business-entitlement-matrix.md` is stale relative to runtime plans; it still centers older Business plan language.
- Hosted checkout, Customer Portal, Stripe-delivered webhook forwarding, test-card completion, and live-mode proof remain unverified.

Recommended slice:

- Reconcile entitlement docs and runtime plan gates before expanding paid onboarding.

### Legal / privacy / public claim boundaries

Classification: implemented with caveats; final legal publication blocked.

Files:

- `app/(marketing)/soukromi/page.tsx`
- `app/(marketing)/cookies/page.tsx`
- `app/(marketing)/podminky/page.tsx`
- `app/(marketing)/dpa/page.tsx`
- `app/(marketing)/security/page.tsx`
- `lib/legal/legal-page-copy.ts`
- `docs/legal/final-czech-legal-review-checklist.md`
- `scripts/smoke-copy-hygiene.ts`

What works:

- Public legal/security routes exist.
- Copy hygiene guards against fake entity, placeholder legal language, fake certifications, overbroad automation claims, and real-time compliance claims.
- Customers page redirects to early access, avoiding fake customers/logos/testimonials.

Blocked:

- Final Czech legal review remains required for public customer terms, DPA, privacy, VAT/DPO wording, subprocessors, retention, liability, refund/cancellation, SLA, special-category evidence, and support commitments.

## 4. Prioritized Implementation Plan

### P0 - Status propagation for the activation loop

Goal:

- Manual evidence, workspace attestations, and Helios CSV imports update the status surfaces users actually see.

Likely files:

- `lib/db/queries/evidence.ts`
- `app/(app)/workspaces/actions.ts`
- `app/(app)/workspaces/helios/import/actions.ts`
- `scripts/smoke-workspace-attestation-status.ts` or equivalent new smoke
- `scripts/smoke-helios-csv-import.ts`

Acceptance criteria:

- Manual attestation with pass/gap/manual_review updates `orgControlStatuses.status` accordingly.
- Helios CSV import never creates automatic pass; it creates `manual_review`/`gap` with correct provenance.
- Dashboard/control/report status reads reflect the update.
- New smoke proves the status transition.

Why first:

- This closes the core product loop: first evidence/gap must visibly change readiness state.

### P1 - Fresh-user controls branch

Goal:

- The onboarding CTA that claims first gaps are ready always lands on a non-empty live priority controls view for a fresh org.

Likely files:

- `components/onboarding/onboarding-wizard.tsx`
- `app/(app)/onboarding/actions.ts`
- `lib/db/queries/onboarding.ts`
- `tests/e2e/activation-loop.spec.ts`
- `scripts/smoke:primary-flow` coverage or new targeted smoke

Acceptance criteria:

- User cannot reach an empty focus-controls view after the "first gaps are ready" message.
- Frameworks are persisted or defaulted before the focus-controls CTA.
- Existing activation E2E still passes.

### P2 - API-key connector first-run enqueue

Goal:

- AWS, Hetzner, OVHcloud, and ABRA Flexi produce first evidence promptly after connect/rotate, not only after cron/manual queue.

Likely files:

- `lib/connectors/api-key-base/actions.ts`
- `lib/integrations/first-run-enqueue.ts`
- `scripts/smoke-integration-first-run-enqueue.ts`
- Provider-specific source smokes

Acceptance criteria:

- Successful connect enqueues exactly one first run.
- Rotate credentials enqueues a new run when appropriate.
- Audit/activation events mirror Microsoft semantics where appropriate.

### P3 - First evidence browser verification

Goal:

- Prove the visible UI can add first evidence, not just DB/query helpers.

Likely files:

- `tests/e2e/activation-loop.spec.ts` or a new authenticated/local evidence spec
- `app/(app)/controls/[controlId]/page.tsx`
- `app/(app)/controls/[controlId]/actions.ts`
- Local Blob mock or gated test Blob configuration

Acceptance criteria:

- Completed onboarding -> open first priority control -> upload small evidence file -> evidence visible on control and `/evidence`.
- Download route exists and is org-scoped.

### P4 - Entitlements and plan gates

Goal:

- Runtime plans, public pricing, docs, and feature gates tell the same story.

Likely files:

- `docs/product/business-entitlement-matrix.md`
- `lib/stripe/plans.ts`
- `app/(marketing)/pricing/page.tsx`
- `app/(marketing)/cenik/page.tsx`
- Feature routes/actions for Trust Center, vendors, questionnaires, exports
- `scripts/smoke-plan-gate-enforcement.ts`

Acceptance criteria:

- Docs use SME/Agency, not stale Business-centered vocabulary.
- Buyer-facing paid features have intentional gates or documented free access.
- Source smoke verifies the intended gates.

### P5 - Microsoft token refresh

Goal:

- Microsoft 365 remains usable after access token expiry.

Likely files:

- `lib/integrations/microsoft365/client.ts`
- `lib/db/queries/integrations.ts`
- `lib/integrations/runner.ts`
- Permission failure smokes

Acceptance criteria:

- Expired access token uses refresh token before Graph checks.
- Refreshed token/expiry is persisted.
- Failed refresh is reported as a permission/connection issue, not silent evidence failure.

### P6 - Workspace surface decision for cloud providers

Goal:

- AWS, Hetzner, and OVHcloud are either real authenticated workspaces or clearly integration/report-only surfaces.

Options:

1. Add `/workspaces/aws`, `/workspaces/hetzner`, `/workspaces/ovhcloud` using existing workspace configs and progress queries.
2. Keep them under `/integrations/*` and remove/limit workspace claims.

Acceptance criteria:

- No UI implies a workspace exists where only config/report metadata exists.
- If pages are added, progress reflects connector evidence and manual fallback.

## 5. Things Not To Claim Yet

Do not claim:

- Pohoda or Money S3 live integration readiness.
- Helios automatic evidence collection.
- Microsoft 365 durable readiness after token expiry.
- AWS/Hetzner/OVHcloud workspace readiness unless authenticated workspace pages are implemented or wording is narrowed.
- Paid production readiness until Stripe/legal blockers are closed.
- Public Trust Center live continuous verification, exact test timing, exact control counts, or raw evidence disclosure.
- Questionnaire AI answers as legal advice, certification proof, auditor-ready evidence, or final buyer response without human review.

## 6. Suggested Next Work Order

If only one implementation lane is chosen:

1. P0 status propagation.
2. Add smoke proving manual workspace/Helios CSV status updates dashboard/report state.
3. Then P1 onboarding focus-controls branch.

If three lanes can run in parallel:

- Lane A: P0 status propagation and smoke.
- Lane B: P1 onboarding branch and activation E2E update.
- Lane C: P4 entitlement truth-source update and plan-gate audit.

Do not start Helios automation or new provider surfaces before P0/P1. The current product value is blocked more by state consistency and first-session proof than by another listed integration card.
