# Entire Codebase Audit - Lane 06: Legal, Public Claims, Trust Center, Reports, Exports, Buyer Proof

Date: 2026-06-02
Mode: read-only audit / no implementation
Workspace: `/Users/marcozoratto/splnit.eu`

## Scope and exclusions

Scope audited:

- Public legal pages: privacy, cookies, terms, DPA/subprocessors, security.
- Public marketing claims and customer-proof boundaries.
- Public Trust Center UI/API disclosure.
- Buyer-facing report/export surfaces: CSV, PDF, XLSX, ZIP, policy/evidence downloads.
- Questionnaire AI proof boundaries, citations, review gate, PDF/XLSX exports.
- Vendor/questionnaire/public proof surfaces.
- Shared-file claim surfaces relevant to other lanes.

Explicit exclusions honored:

- No implementation changes.
- No commit, push, deploy, or production DB/Blob mutation.
- No production data or Blob access. The only DB-touching command was the repository smoke `npm run smoke:compliance-report`, which seeds and cleans its own smoke fixture through the configured local/test environment path used by the repo smoke.
- No legal/public claim wording changes. Recommendations below require owner/counsel approval before public copy or legal terms change.

## Files/directories inspected

Instructions/context:

- `AGENTS.md`
- `.hermes/plans/2026-06-02_094729-lane-06-legal-claims-proof.md`
- `.hermes/state/entire-codebase-audit-ledger.md`
- `docs/product/implementation-gap-audit.md`

Public marketing/legal/security:

- `app/(marketing)/page.tsx`
- `app/(marketing)/soukromi/page.tsx`
- `app/(marketing)/cookies/page.tsx`
- `app/(marketing)/podminky/page.tsx`
- `app/(marketing)/dpa/page.tsx`
- `app/(marketing)/security/page.tsx`
- `app/(marketing)/zakaznici/page.tsx`
- `app/(marketing)/trust/[orgSlug]/page.tsx`
- `app/(marketing)/trust/[orgSlug]/frameworks/[frameworkSlug]/page.tsx`
- `app/(marketing)/trust/[orgSlug]/opengraph-image.tsx`
- `lib/legal/legal-page-copy.ts`
- `lib/marketing/platform-copy.ts`
- `components/marketing/software-json-ld.tsx`
- `messages/cs-CZ.json`, `messages/en-EU.json`, `messages/it-IT.json` by targeted searches/smokes

Trust Center:

- `app/(app)/trust-center/page.tsx`
- `app/(app)/trust-center/actions.ts` by plan/smoke coverage
- `components/trust-center/public-trust-ui.tsx`
- `lib/trust-center/public-model.ts`
- `lib/trust-center/public-copy.ts`
- `lib/trust-center/public-documents.ts` by model references
- `lib/db/queries/trust-center.ts` by model references
- `app/api/trust/[orgSlug]/route.ts`
- `scripts/smoke-trust-center-public-disclosure.ts`

Reports/exports/PDF/XLSX/ZIP:

- `app/api/audit-log/export/route.ts`
- `lib/db/queries/audit-logs.ts` by smoke coverage
- `app/api/export/compliance-report/route.ts`
- `lib/export/pdf.ts`
- `lib/export/report-template.ts` by smoke coverage
- `app/api/vendors/supply-chain-report/route.ts`
- `lib/pdf/vendor-risk-report.tsx` by smoke/source coverage
- `app/api/risks/register-report/route.ts`
- `lib/pdf/risk-register.ts` by smoke/source coverage
- `app/api/incidents/[incidentId]/data-protection-report/route.ts` by route inventory/search
- `app/api/incidents/[incidentId]/cybersecurity-report/route.ts` by route inventory/search
- `app/api/incidents/[incidentId]/uoou-report/route.ts` by route inventory/search
- `app/api/incidents/[incidentId]/nukib-report/route.ts` by route inventory/search
- `app/api/documents/generate/[type]/route.ts`
- `app/api/frameworks/iso27001/certification-package/route.ts`
- `app/api/access-reviews/[reviewId]/export/route.ts`
- `app/api/policies/[policyId]/download/route.ts`
- `app/api/evidence/[evidenceId]/download/route.ts`
- `app/api/exports/workspace/route.ts`
- `app/api/exports/evidence-metadata/route.ts`
- `app/api/exports/workspace/archive/route.ts`
- `lib/db/queries/workspace-export.ts` by smoke/source coverage
- `lib/exports/evidence-metadata.ts` by archive route

Questionnaires/vendors:

- `app/(app)/questionnaires/page.tsx`
- `app/(app)/questionnaires/actions.ts` by targeted search
- `app/api/questionnaires/export/pdf/route.ts`
- `app/api/questionnaires/export/xlsx/route.ts`
- `lib/questionnaires/review-gate.ts`
- `lib/questionnaires/citation-guard.ts`
- `lib/questionnaires/provider.ts` by implementation-gap context
- `lib/questionnaires/openai.ts` by implementation-gap context
- `lib/questionnaires/fallback.ts` by smoke coverage
- `lib/questionnaires/xlsx.ts` by export route
- `app/(app)/vendors/page.tsx` by implementation-gap context/search
- `app/(app)/vendors/[vendorId]/page.tsx` by implementation-gap context/search
- `app/vendor-assessment/[token]/page.tsx` by implementation-gap context
- `app/vendor-assessment/[token]/actions.ts` by implementation-gap context
- `lib/vendors/questions.ts` by search/context
- `lib/db/queries/vendors.ts` by report route/source coverage

Smoke scripts:

- `scripts/smoke-copy-hygiene.ts`
- `scripts/smoke-trust-center-public-disclosure.ts`
- `scripts/smoke-export-endpoints-source.ts`
- `scripts/smoke-questionnaire-review-gate.ts`
- `scripts/smoke-questionnaire-citations.ts`
- `scripts/smoke-compliance-report.ts`

## Commands run and results

Note: an initial combined shell command containing `git status --short` plus package-script inspection was denied by the execution environment. I did not retry that denied combined command. The lane verification commands below were run successfully.

- `npm run smoke:copy-hygiene`
  - PASS
  - Output: `Copy hygiene smoke test passed.`

- `npm run smoke:trust-center-public-disclosure`
  - PASS
  - Output: `Trust Center public disclosure smoke passed.`

- `npm run smoke:export-endpoints-source`
  - PASS
  - Output: `Export endpoint source smoke passed.`

- `npm run smoke:questionnaire-review-gate`
  - PASS
  - Output: `Questionnaire review gate smoke passed.`

- `npm run smoke:questionnaire-citations`
  - PASS
  - Output: `Questionnaire citation guard smoke passed.`

- `npm run smoke:compliance-report`
  - PASS
  - Output: `Compliance report smoke passed`

## Classification by area

### 1. Public legal pages

Classification: implemented with caveats / legal-publication approval blocked.

Evidence:

- `lib/legal/legal-page-copy.ts` contains localized copy for cookies, DPA/subprocessors, privacy, and terms.
- Operator identity is present as Marco Zoratto / IČO 23821370 / Hněvotín address / ARES link in DPA, privacy, and terms copy.
- The copy expressly disclaims legal advice, audit opinion, certification, and guaranteed legal/regulatory compliance in terms/service sections.
- Cookies copy distinguishes required cookies from optional Vercel analytics/Speed Insights consent.
- Privacy copy states DPO is not appointed as of publication and describes customer-as-controller / Splnit-as-processor boundaries.
- DPA copy lists subprocessors and a general subprocessor authorization/objection mechanism.
- `scripts/smoke-copy-hygiene.ts` guards legal placeholders and fake entity patterns; smoke passed.

Caveats:

- Public legal text still needs final Czech legal/counsel approval before customer reliance. This is also documented in `docs/product/implementation-gap-audit.md` and `PROJECT_PLAN.md`.
- Retention periods, liability limitations, payment/refund/cancellation terms, subprocessor transfer mechanisms, DPO wording, special-category evidence handling, SLA/support commitments, and OpenAI/subprocessor terms remain human approval items.
- Security page copy calls legal/DPA text a working baseline before paid production reliance, which is appropriately bounded but reinforces that final legal publication remains blocked.

### 2. Public marketing claims and customer proof

Classification: implemented with caveats / claim-boundary guarded.

Evidence:

- `app/(marketing)/zakaznici/page.tsx` redirects to `/early-access`; no fabricated customer page, logos, or testimonials are shipped there.
- `scripts/smoke-copy-hygiene.ts` guards against `Splnit Technology`, placeholder identity, fake certifications, fake high automation counts, Helios automation overclaims, unsupported pricing/product claims, and public legal placeholder markers; smoke passed.
- Homepage metadata and copy scope claims to evidence from verified integrations, manual inputs, and Czech ERP workspaces "where available" rather than universal automation.
- `PROJECT_PLAN.md` and `docs/product/implementation-gap-audit.md` explicitly prohibit claims around fake customers/testimonials, SOC 2/ISO certification, uptime, Helios/Pohoda/Money S3 live automation, paid production readiness, and unsupported customer proof.

Caveats / shared-file claim notes:

- `app/(marketing)/page.tsx` renders connector badges for Pohoda, ABRA Flexi, Microsoft 365, Hetzner, AWS, Helios, and Money S3. The text is bounded by surrounding copy, but this is a shared public-claim surface with Lane 04 integration/workspace ownership. Future copy must preserve distinctions:
  - Microsoft 365/GitHub/AWS/Hetzner/OVHcloud/ABRA Flexi: adapters/checks exist, but live customer tenant proof varies by provider.
  - Pohoda and Money S3: manual workspace/checklist, not live integrations.
  - Helios: manual workspace plus CSV-assisted import, not native API automation.
- Messages still include support/playbook boundary text such as "Splnit.eu zatím není enterprise dodavatel s 24/7 SLA..."; this is safe as a limitation, not a claim.
- Any move from early access to production/paid language requires human approval for public claim boundaries.

### 3. Security page and subprocessor disclosure

Classification: implemented with caveats / human approval required.

Evidence:

- `app/(marketing)/security/page.tsx` lists active/current subprocessors and labels OpenAI as active only by configuration and human review.
- It states ISO 27001 is preparation, not completed certification.
- It states legal/DPA terms are public as a working baseline and subject to legal review before paid production reliance.
- It includes security and privacy contact addresses.

Caveats:

- The security page includes production location statements: Neon on AWS eu-central-1, Vercel serverless functions observed in iad1, Blob in fra1. I did not verify current production infrastructure because production/deploy/Blob access is out of scope. These claims should remain tied to recorded owner-approved production checks and be re-verified before public launch or material provider-region changes.
- Subprocessor list must be reconciled with actual production configuration before final legal approval, especially PostHog/analytics, OpenAI, Loops/Resend, Upstash, and Stripe activation status.

### 4. Public Trust Center UI/API disclosure

Classification: implemented with caveats / public API count coarsening decision open.

Evidence:

- `lib/trust-center/public-model.ts` returns `lastTestedAt: null`, `nextTestAt: null`, and `showLiveIndicator: false` for DB-backed public models.
- `coarsenTimestamp()` truncates framework assessment timestamps to `YYYY-MM`.
- Public UI copy explicitly states details of controls, control IDs, evidence files, test results, and audit timing are not shown publicly.
- `components/trust-center/public-trust-ui.tsx` renders framework/category aggregate names/status bars, not evidence filenames or raw test outputs.
- `scripts/smoke-trust-center-public-disclosure.ts` checks against exact timestamp formatting, exact schedule copy, demo fallback leakage, exact public framework/control/document counts in UI, public framework score percentages, and continuous-verification overclaims; smoke passed.
- `app/api/trust/[orgSlug]/route.ts` returns a reduced JSON model and omits raw evidence, control IDs, filenames, and exact run timing.

Caveats / risks:

- `app/api/trust/[orgSlug]/route.ts` still returns numeric `totalControls`, `verified`, `inProgress`, `notApplicable`, category totals, `score`, and `lastAssessedAt` at month granularity. This is less sensitive than raw control IDs/evidence filenames, but it is more exact than the public UI guard allows. Product/security should decide whether the API is intentionally a semi-public aggregate API or should be coarsened to labels/buckets only.
- Public trust model `buildTrustSignals()` can display `Compliant since <year>` for GDPR when a GDPR framework exists. This is not currently blocked by the Trust Center smoke. Legal/public-claim review should decide whether "GDPR compliant" language is acceptable even with year coarsening; safer wording would be "GDPR readiness evidence available" or similar, but changing it requires human approval.
- Public trust copy uses "Automated evidence checks configured" / "Auto". This is acceptable only when it refers to configured automated evidence, not framework-wide automatic compliance. Keep this wording under claim review as integrations mature.

### 5. Reports, exports, PDFs, XLSX, ZIPs

Classification: implemented with caveats / source-smoke verified for key buyer surfaces.

Evidence:

- `scripts/smoke-export-endpoints-source.ts` passed and verifies source-level guards for:
  - Audit log CSV export cap/pagination/org scoping/private no-store.
  - Vendor PDF report auth/org scoping/private no-store.
  - Risk PDF report auth/org scoping/private no-store.
  - Workspace archive ZIP org-scoped data/blob listing/private no-store.
  - Production readiness smoke contains expected proof markers for auth rejection, cross-tenant isolation, pagination, and downloads.
- `app/api/audit-log/export/route.ts` uses `MAX_AUDIT_LOG_EXPORT_LIMIT`, auth/session org checks, private no-store, pagination/truncation headers.
- `app/api/vendors/supply-chain-report/route.ts` and `app/api/risks/register-report/route.ts` require auth/org, query by active org, and return private PDFs.
- `app/api/export/compliance-report/route.ts` requires Clerk auth, matching `orgId`, active subscription, required IČO/DIČ/Sídlo fields, rate limiting, agency branding, and private no-store PDF response.
- `scripts/smoke-compliance-report.ts` passed and proves PDF buffer generation, Czech labels, org identity rendering, NÚKIB/Vyhláška mapping output, manual vs automated source labeling, agency branding, and no control comments in the report HTML.
- `app/api/documents/generate/[type]/route.ts` requires auth/org, database, feature flag, and returns XLSX for gap analysis, SoA ISO27001, and vendor report using org-scoped query functions.
- `app/api/exports/workspace/archive/route.ts` requires auth/org and database; includes `workspace-export.json`, `evidence-metadata.csv`, evidence/policy Blob files if configured, and an export manifest with missing-file results/redactions.
- `app/api/evidence/[evidenceId]/download/route.ts` and `app/api/policies/[policyId]/download/route.ts` are private, auth/org-scoped download surfaces by route inspection/search.

Caveats / risks:

- Export source smoke covers selected endpoints, not every report/download path. It does not deeply inspect incident report routes, access-review export, certification package contents, evidence download streaming, policy PDF text, or all XLSX sheet contents.
- Compliance report endpoint is subscription-gated; broader report/export plan gates remain inconsistent across vendors, questionnaires, risks, incidents, evidence metadata, workspace export, and smart document generation. This overlaps billing/entitlement work and requires product approval.
- Workspace ZIP archive paths include control keys and evidence/policy IDs truncated to 8 chars inside private ZIPs. That is acceptable for authenticated private export, but must not appear on public Trust Center or marketing surfaces.
- `app/api/frameworks/iso27001/certification-package/route.ts` uses "certification-package" naming. It is private and useful operationally, but public copy must not imply Splnit.eu or the customer is certified merely because a package can be generated.
- Risk report pagination/continuation and PDF text extraction coverage remain limited, as already noted in `docs/product/implementation-gap-audit.md`.

### 6. Questionnaire AI proof boundaries

Classification: implemented with caveats / OpenAI legal review blocked for broad customer use.

Evidence:

- `lib/questionnaires/citation-guard.ts` strips unsupported evidence/legal/policy refs from generated answers and downgrades to `no-context` if no valid support remains.
- `scripts/smoke-questionnaire-citations.ts` passed and verifies unsupported evidence/legal/policy refs are removed and fallback/no-context behavior exists.
- `lib/questionnaires/review-gate.ts` permits export only when every answer has `reviewStatus: "approved"`.
- `scripts/smoke-questionnaire-review-gate.ts` passed and verifies draft/flagged answers block export.
- `app/api/questionnaires/export/pdf/route.ts` and `app/api/questionnaires/export/xlsx/route.ts` require Clerk auth/org, fetch the generated artifact by `artifactId`, `clerkOrgId`, and questionnaire artifact kind, parse schema, apply review gate, and return private no-store PDF/XLSX only when approved.
- Security page labels OpenAI as questionnaire draft-answer generation when AI is enabled and active by configuration/human review.

Caveats / risks:

- Review gate is export-focused. Generated draft answers can still appear in authenticated UI for user review, which is expected, but copy must keep "draft / human review required" visible anywhere answers are shown or copied.
- Broad AI customer use is blocked until owner/counsel confirms OpenAI DPA, retention/training settings, subprocessors, transfer mechanism, and customer opt-in/human-review wording.
- Citation guard only validates references against supplied context; it does not prove answer factual correctness beyond available evidence/policy/legal references.

### 7. Vendor and buyer questionnaire proof surfaces

Classification: implemented with caveats.

Evidence:

- Vendor PDF report route exists and is source-smoke covered for auth/org scoping.
- Vendor assessment flow is documented in `docs/product/implementation-gap-audit.md` as tokenized/noindex and submission-persisting.
- Vendor questions include ISO/SOC/security-owner/data-processing prompts, which are suitable as questionnaire inputs, not proof of vendor certification.

Caveats:

- Vendor-submitted answers/evidence are not yet first-class draft evidence linked into the control/evidence lifecycle. They should be treated as `vendor_reported` / `manual_review`, never automatic pass.
- No implementation was performed in this lane; this remains a recommended slice.

## Top risks

1. Public Trust Center API exposes exact aggregate counts and scores even though UI guards avoid exact public counts/percentages. This may be acceptable but needs explicit product/security/legal decision.
2. Trust signals can use "Compliant since <year>" for GDPR. This is a stronger legal/compliance claim than surrounding readiness wording and should be approved or narrowed.
3. Legal/DPA/privacy/terms are present but not final counsel-approved customer terms. Paid production reliance remains blocked.
4. Security page production-region/subprocessor statements are public operational claims that require a current verified source before final launch.
5. Export/report surfaces are mostly auth/org-scoped, but plan gates are inconsistent outside the compliance report and smart document flag path.
6. Broader export suite lacks end-to-end binary/text validation for some PDFs/XLSX/ZIP contents and incident/access-review/certification-package paths.
7. Vendor responses are not yet incorporated as first-class draft evidence with provenance, leaving buyer proof fragmented.
8. AI questionnaire output is review-gated for export but still requires legal/vendor approval for production AI use and customer-facing wording.

## Recommended implementation slices

### Slice 06-A: Coarsen or explicitly approve public Trust Center API aggregates

Goal:

- Decide whether public API counts/scores are intentionally public. If not, coarsen API output to buckets/labels matching the UI boundary.

Likely files:

- `app/api/trust/[orgSlug]/route.ts`
- `lib/trust-center/public-types.ts`
- `lib/trust-center/public-model.ts`
- `scripts/smoke-trust-center-public-disclosure.ts`
- Optional API contract test/smoke

RED command:

- Add/adjust a source smoke asserting public API does not expose `totalControls`, exact category totals, exact `score`, or exact `verified/inProgress/notApplicable` counts if coarsening is chosen.

GREEN command:

- `npm run smoke:trust-center-public-disclosure`
- Optional new `npm run smoke:trust-center-public-api-disclosure`

Subagent-sized tasks:

1. Product/security decision: keep exact aggregate counts or coarsen.
2. If coarsening: adjust API response shape and UI consumers if any.
3. Extend smoke to cover API source/output boundary.
4. Document approved public disclosure model.

Rollback/feature flag:

- No persisted-state change. API response can be reverted. If clients depend on current shape, add versioning or retain a private/internal endpoint.

Existing-data migration/backfill:

- None.

Human approval:

- Required for public disclosure boundary and any public API contract change.

### Slice 06-B: Review and narrow Trust Center compliance wording

Goal:

- Replace or approve `Compliant since <year>` style Trust Center signals and any equivalent public compliance claim.

Likely files:

- `lib/trust-center/public-model.ts`
- `lib/trust-center/public-copy.ts`
- `scripts/smoke-trust-center-public-disclosure.ts`
- `scripts/smoke-copy-hygiene.ts`

RED command:

- Add smoke case that fails on public Trust Center `GDPR compliant` / `Compliant since` unless explicitly allowlisted.

GREEN command:

- `npm run smoke:copy-hygiene`
- `npm run smoke:trust-center-public-disclosure`

Subagent-sized tasks:

1. Counsel/product approve final wording.
2. Update localized copy/model values only after approval.
3. Add guard to prevent regression.

Rollback/feature flag:

- Text-only rollback. No feature flag needed unless keeping an approved allowlist.

Existing-data migration/backfill:

- None.

Human approval:

- Required. This is a public legal/compliance claim boundary.

### Slice 06-C: Expand report/export proof coverage

Goal:

- Prove the broader buyer export suite beyond the current source smoke and compliance PDF smoke.

Likely files:

- `scripts/smoke-export-endpoints-source.ts`
- New smoke(s) for incident reports, access-review CSV, policy PDF/download, evidence download, certification ZIP, smart document XLSX
- `app/api/incidents/[incidentId]/*/route.ts`
- `app/api/access-reviews/[reviewId]/export/route.ts`
- `app/api/policies/[policyId]/download/route.ts`
- `app/api/evidence/[evidenceId]/download/route.ts`
- `app/api/frameworks/iso27001/certification-package/route.ts`
- `app/api/documents/generate/[type]/route.ts`

RED command:

- Add smoke cases that fail until each endpoint has auth/org scoping, private no-store, expected content type, and minimal content validation.

GREEN command:

- `npm run smoke:export-endpoints-source`
- New report/export binary smoke command(s)
- `npm run smoke:compliance-report`

Subagent-sized tasks:

1. Inventory all report/export endpoints and expected content types.
2. Add source guards for missing endpoints.
3. Add fixture-based binary generation checks where no live Blob/prod data is needed.
4. Add explicit exclusions for production Blob-dependent tests.

Rollback/feature flag:

- Test-only unless endpoint behavior changes. If behavior changes, rollback route changes and retain old private output.

Existing-data migration/backfill:

- None.

Human approval:

- Required only for changing customer-visible report wording or legal/regulatory submission labels.

### Slice 06-D: Vendor-submitted proof becomes draft evidence

Goal:

- Convert vendor questionnaire submissions into first-class draft evidence with provenance, not automatic control pass.

Likely files:

- `app/vendor-assessment/[token]/actions.ts`
- `lib/db/queries/vendors.ts`
- `lib/db/queries/evidence.ts`
- `lib/vendors/questions.ts`
- New smoke, e.g. `scripts/smoke-vendor-questionnaire-draft-evidence.ts`

RED command:

- Add smoke proving a vendor submission creates `vendor_reported` / `manual_review` draft evidence linked to the relevant vendor/control context and never `pass`.

GREEN command:

- New vendor evidence smoke
- Existing vendor delivery/report smokes as applicable

Subagent-sized tasks:

1. Define provenance/status mapping for vendor answers.
2. Persist draft evidence rows on submission or explicit reviewer action.
3. Surface review status in vendor detail/evidence page.
4. Ensure reports label vendor-submitted proof as vendor-reported/manual-review.

Rollback/feature flag:

- Feature flag recommended if automatically creating evidence from submissions. Roll back by disabling creation and leaving vendor submissions intact.

Existing-data migration/backfill:

- Decision needed. Default: no backfill unless owner approves mapping historical submissions to draft evidence.

Human approval:

- Required for buyer-facing wording and evidence/provenance semantics.

### Slice 06-E: Entitlement/plan-gate audit for buyer proof surfaces

Goal:

- Align runtime plan gates, public pricing/docs, and buyer proof features.

Likely files:

- `lib/stripe/plans.ts`
- `lib/stripe/subscriptions.ts`
- `app/api/export/compliance-report/route.ts`
- `app/api/exports/**/route.ts`
- `app/api/questionnaires/export/**/route.ts`
- `app/api/vendors/supply-chain-report/route.ts`
- `app/api/risks/register-report/route.ts`
- `app/(marketing)/pricing/page.tsx`
- `app/(marketing)/cenik/page.tsx`
- `docs/product/business-entitlement-matrix.md`
- `scripts/smoke-plan-gate-enforcement.ts`

RED command:

- Extend plan-gate smoke to assert intended free/paid access for Trust Center, vendors, questionnaires, risk, incident, evidence metadata, workspace archive, and smart documents.

GREEN command:

- `npm run smoke:plan-gate-enforcement`
- `npm run smoke:export-endpoints-source`
- `npm run smoke:questionnaire-review-gate`

Subagent-sized tasks:

1. Product decides which buyer-proof features are free, SME, or Agency.
2. Update docs/pricing to match runtime plan names.
3. Add gates or document intentional ungated access.
4. Extend smoke.

Rollback/feature flag:

- Use feature flags or centralized entitlement helper to avoid hard-to-revert route-level changes.

Existing-data migration/backfill:

- None unless subscription records/plans change.

Human approval:

- Required for pricing/entitlement and public paid-plan claims.

## Test/validation matrix

Current passing verification:

| Area | Command | Result |
| --- | --- | --- |
| Copy/legal/claim hygiene | `npm run smoke:copy-hygiene` | PASS |
| Trust Center public disclosure | `npm run smoke:trust-center-public-disclosure` | PASS |
| Export endpoint source guards | `npm run smoke:export-endpoints-source` | PASS |
| Questionnaire review gate | `npm run smoke:questionnaire-review-gate` | PASS |
| Questionnaire citations | `npm run smoke:questionnaire-citations` | PASS |
| Compliance report PDF | `npm run smoke:compliance-report` | PASS |

Recommended additional validation before customer/public launch:

- Public Trust Center API disclosure smoke that checks actual JSON shape or source for exact count/score exposure.
- Export/report smoke covering incident PDFs, access-review CSV, policy download/PDF, evidence download, ISO27001 certification ZIP, smart document XLSX content, and private no-store headers.
- Browser-level smoke for questionnaire approval -> PDF/XLSX export after approved answers.
- Plan-gate smoke for all buyer proof/export routes.
- Legal copy review checklist signed off by owner/counsel.
- Subprocessor/region statement review against current production configuration.

## Human approval items

Human approval is required before changing or publishing:

- Terms, DPA, privacy, cookies, security, subprocessor, retention, liability, SLA/support, refund/cancellation, payment, DPO, special-category evidence wording.
- Any claim that Splnit.eu, a customer, or a framework is "compliant", "certified", "auditor-ready", continuously verified, or regulator-ready.
- Trust Center public disclosure boundaries, including whether exact aggregate counts/scores remain publicly available via API.
- OpenAI/AI questionnaire customer-facing use: DPA, retention/training settings, subprocessors, transfer mechanism, opt-in, and human-review wording.
- Pricing/entitlement boundaries for buyer proof exports and Trust Center features.
- Any customer logo/testimonial/reference or uptime/security metric.

## Shared-file claims and lane coordination

- `app/(marketing)/page.tsx`, `messages/*.json`, `lib/marketing/platform-copy.ts`, `components/marketing/software-json-ld.tsx`: shared with marketing/i18n/integration lanes; all provider/workspace claims must preserve current bounded distinctions.
- `lib/trust-center/public-model.ts`, `lib/trust-center/public-copy.ts`, `components/trust-center/public-trust-ui.tsx`, `app/api/trust/[orgSlug]/route.ts`: shared with Trust Center/auth/org-boundary lanes; public disclosure changes require independent verifier review.
- `app/api/export/compliance-report/route.ts`, `lib/export/pdf.ts`, `lib/export/report-template.ts`: shared with billing/entitlement, agency branding, NÚKIB/reporting lanes; report wording changes require legal/product approval.
- `app/api/exports/workspace/archive/route.ts`, `lib/db/queries/evidence.ts`, `lib/db/queries/policies.ts`, `lib/db/queries/workspace-export.ts`: shared with evidence/blob/org-boundary lanes; do not expose private archive path details publicly.
- `app/api/questionnaires/export/*`, `lib/questionnaires/*`, `app/(app)/questionnaires/actions.ts`: shared with AI/provider/product lanes; export gating and citation guard must remain intact.
- `app/vendor-assessment/[token]/*`, `lib/vendors/*`, `app/api/vendors/supply-chain-report/route.ts`: shared with vendor/supply-chain lanes; vendor evidence must remain vendor-reported/manual-review until reviewed.

## Overall lane result

Status: PARTIAL PASS / implemented with caveats.

The core guardrails for public honesty, legal placeholders, Trust Center public disclosure, export source scoping, questionnaire review-gated exports, citation sanitization, and compliance report generation are present and passing their lane smokes.

The remaining work is not emergency implementation but approval/proof hardening:

1. Decide and test public Trust Center API aggregate disclosure.
2. Approve or narrow GDPR/compliance-style Trust Center wording.
3. Expand report/export proof coverage for the full buyer suite.
4. Convert vendor submissions into draft evidence with safe provenance.
5. Reconcile entitlements/plan gates for buyer proof features.
6. Complete counsel/owner approval before paid production reliance on legal/public claims.
