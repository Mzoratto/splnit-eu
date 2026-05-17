# SME Growth Features Implementation Plan

> Planning only. No implementation code changes were made.

**Goal:** Add the five high-ROI SME-market features in a way that reuses the existing Splnit.eu app, database, export, policy, evidence, trust-center, and consultant workspace surfaces without overbuilding an LMS or exposing sensitive compliance details.

**Architecture:** Build this as a sequence of vertical product slices: scoped intake first, then task prioritisation, then document generation/evidence linking, then auditor/export packaging, then advisor workspace hardening, then lightweight employee attestations. The existing app already has most core primitives: Clerk org tenancy, Drizzle/Postgres schema, onboarding, control statuses, policy PDFs, private Blob evidence/policy storage, workspace ZIP export, Trust Center public/share surfaces, audit logs, and consultant-client relationships.

**Tech Stack:** Next.js App Router, React, TypeScript, Drizzle/Postgres, Clerk, Vercel Blob, jszip, @react-pdf/renderer, next-intl, Resend/Microsoft Graph where applicable.

---

## Feasibility Summary

### 1. 15-Minute Audit / Smart AI Intake

**Feasibility:** High, but the current onboarding is too shallow for the promised outcome.

Existing support:
- `app/(app)/onboarding/page.tsx`
- `components/onboarding/onboarding-wizard.tsx`
- `app/(app)/onboarding/actions.ts`
- `lib/db/queries/onboarding.ts`
- `organisations` fields: `country`, `primaryJurisdiction`, `locale`, `sector`, `employeeCount`, `toolInventory`
- `orgFrameworks`, `orgControlStatuses`, `frameworkControls`, `controls`

Current gap:
- The wizard collects company/framework/tool data, but does not store detailed intake answers or derive scoped controls.
- `listOrgControlsForIndex()` currently lists controls by enrolled frameworks, not by applicability.
- `completeOnboarding()` only writes an initial framework score; it does not seed relevant statuses or hide irrelevant controls.

Best strategy:
- Add structured intake answers and deterministic rules first, not free-form AI.
- Use AI only later to explain or refine recommendations after deterministic scoping is proven.
- Treat hidden controls as `not_applicable` or `out_of_scope`, with a visible rationale and ability to override.

ROI rank: #1. This should be the first major feature because it directly reduces activation friction.

### 2. Dynamic Evidence & Policy Generator

**Feasibility:** High for semi-automated policies; medium for editable document builder.

Existing support:
- `lib/policies/templates.ts`
- `lib/policies/policy-template-data/{cz,eu,it}.ts`
- `lib/policies/resolve-template.ts`
- `app/(app)/policies/page.tsx`
- `app/(app)/policies/[type]/page.tsx`
- `app/(app)/policies/actions.ts`
- `lib/pdf/policy-document.tsx`
- `policies`, `policyControls`, `evidence`, `generatedArtifacts`
- Private Blob upload/download already exists for policies and evidence.

Current gap:
- Generated policies are direct PDF outputs, not editable drafts.
- Policy generation links to controls via `policyControls`, but does not create/attach evidence rows automatically for each linked control.
- IT templates are intentionally draft/fallback until legal review promotion; do not claim Italian legal-final templates until promoted.

Best strategy:
- First add a review/edit draft layer around current templates and generated PDF output.
- On approval/generation, create evidence rows linked to the relevant control IDs.
- Keep output status honest: draft, reviewed, approved, expired.
- Use existing Blob and PDF infrastructure; avoid introducing DOCX/Word editing initially.

ROI rank: #2. It turns checklist items into completed artifacts and gives users tangible progress.

### 3. One-Click Auditor Export

**Feasibility:** High for private ZIP export; medium for public/read-only shared package.

Existing support:
- `app/api/exports/workspace/archive/route.ts`
- `app/api/exports/workspace/route.ts`
- `lib/db/queries/workspace-export.ts`
- `app/api/audit-log/export/route.ts`
- `app/api/vendors/supply-chain-report/route.ts`
- `app/api/risks/register-report/route.ts`
- Trust Center public routes: `app/(marketing)/trust/[orgSlug]/page.tsx`, `app/(marketing)/trust/[orgSlug]/frameworks/[frameworkSlug]/page.tsx`
- Trust Center access tokens: `lib/trust-center/access.ts`

Current gap:
- Workspace archive exists and is production-smoked, but it is a full workspace export, not a curated auditor/buyer package.
- Public Trust Center intentionally exposes category-level summaries only; it must not expose control IDs, filenames, exact test times, schedules, or implementation details.
- No share-package model exists for expiring auditor links with selectable included documents.

Best strategy:
- Split exports into two products:
  1. Private owner export: complete workspace archive for internal records.
  2. Auditor/buyer package: curated, redacted, expiring link or ZIP.
- Build an `auditPackages`/`auditPackageItems` model rather than overloading Trust Center rows.
- Reuse Trust Center disclosure rules for public links.

ROI rank: #3. Strong sales proof, but should come after the system can generate useful policies/evidence.

### 4. Multi-Tenant Advisor Workspace

**Feasibility:** Medium-high because the foundation already exists, but onboarding/invite UX is incomplete.

Existing support:
- `consultantClients` table in `lib/db/schema.ts`
- `lib/db/queries/consultant-clients.ts`
- `app/(app)/clients/page.tsx`
- `app/(app)/clients/[clientOrgId]/page.tsx`
- `hasPlanAccess(plan, "consultant")`

Current gap:
- Consultant linking requires a raw Clerk org ID, which is not SME-friendly.
- Permission semantics need tightening before consultants can perform write actions across clients.
- White-label fields exist but are minimal.
- There is no invite/acceptance flow for client companies.

Best strategy:
- Improve this after the SME core workflow is compelling.
- Add advisor invite links and client acceptance before broad write access.
- Start with read-only portfolio scorecards and “needs attention” lists, then add delegated manage actions.

ROI rank: #4. Huge distribution value, but dangerous to build too early if single-SME activation is still weak.

### 5. Micro-Learning & Team Attestation

**Feasibility:** Medium. It is currently a clear product gap but can be implemented without a full LMS.

Existing support:
- `app/(app)/team/page.tsx` already has `trainingLog` as coming soon.
- `accessReviews` and `accessReviewItems` provide useful pattern for team/task attestations.
- `auditLogs` can record campaigns and completions.
- Resend is already used elsewhere for emails; Microsoft Graph mailbox tooling exists for controlled smoke proof.
- Training control exists in content/mapping references, e.g. `ctrl_security_training_annual`.

Current gap:
- No `trainingCampaigns`, `trainingModules`, `trainingRecipients`, or attestation tokens.
- No magic-link recipient flow.
- No evidence creation from employee completion percentage.

Best strategy:
- Build micro-attestations as short campaigns tied to a control, not an LMS.
- Start with one module: phishing/security basics.
- Store recipient email, token hash, sent/read/signed timestamps, module version, IP/user agent metadata if legally acceptable.
- When completion threshold is met, create an evidence row for the training control.

ROI rank: #5. Valuable, but best after evidence/policy paths are clean.

---

## Recommended Sequencing

### Phase 0: Product Contract and Safety Rules

**Objective:** Freeze product semantics before schema/API work.

**Decisions:**
- Status model for controls: keep `pass`, `fail`, `manual_review`, `unknown`, add/standardize `not_applicable` and optionally `out_of_scope`.
- Disclosure levels: owner-private, auditor-private-link, public Trust Center.
- Jurisdiction support: Italy-first for UI/copy, but only use legally reviewed templates/sources for claims.
- AI posture: deterministic scoping first; AI summaries/explanations only after safeguards.

**Files likely touched later:**
- `docs/plans/...`
- `lib/controls/*`
- `lib/db/schema.ts`
- `messages/{cs-CZ,en-EU,it-IT}.json`

**Verification:** Human review of product contract before implementation.

---

## Phase 1: 15-Minute Audit MVP

### Task 1: Add an intake data model

**Objective:** Store reusable structured answers instead of squeezing everything into `organisations.toolInventory`.

**Likely files:**
- Modify: `lib/db/schema.ts`
- Create migration via: `npm run db:generate`
- Modify/query: `lib/db/queries/onboarding.ts`

**Suggested tables/fields:**
- `org_intake_profiles`
  - `id`
  - `clerkOrgId`
  - `version`
  - `answers jsonb`
  - `derivedScope jsonb`
  - `completedAt`
  - `createdAt`
  - `updatedAt`

**Acceptance criteria:**
- Intake answers persist per active Clerk org.
- Existing onboarding still works for orgs without an intake profile.
- No sensitive free-form secrets are collected.

**Verification:**
- `npm run db:generate`
- Add smoke script or unit-level query test for create/update/read.
- `npm run typecheck`

### Task 2: Define deterministic scoping rules

**Objective:** Convert 10-15 business answers into a list of applicable controls and rationales.

**Likely files:**
- Create: `lib/onboarding/intake-questions.ts`
- Create: `lib/onboarding/intake-scope.ts`
- Modify: `components/onboarding/onboarding-wizard.tsx`
- Modify: `app/(app)/onboarding/actions.ts`

**Rule examples:**
- Employee count and sector influence NIS2 relevance.
- Customer data yes/no influences GDPR-related tasks.
- Third-party cloud hosting yes/no prioritizes vendor/access/security controls.
- Microsoft 365/GitHub/AWS tool selections prioritize relevant integration checks.

**Acceptance criteria:**
- A user sees a short question flow, not an 80-control checklist.
- Each recommended control has a human-readable “why this applies” reason.
- Non-applicable controls are not silently deleted; they are recorded as scoped out or not applicable.

**Verification:**
- Unit tests for representative intake profiles: tiny professional-services SME, cloud SaaS, manufacturing, healthcare.
- `npm run smoke:primary-flow`

### Task 3: Seed initial control statuses from intake

**Objective:** Make the dashboard and controls page immediately show a small prioritized gap list.

**Likely files:**
- Modify: `lib/db/queries/onboarding.ts`
- Modify: `lib/db/queries/controls.ts`
- Modify: `lib/db/queries/dashboard.ts`

**Acceptance criteria:**
- Completion creates/updates `orgControlStatuses` for applicable controls.
- Dashboard priority list uses scoped controls and shows “14 critical gaps” style messaging where true.
- Controls index can filter/show in-scope vs out-of-scope controls.

**Verification:**
- Add smoke assertion to primary flow: number of priority gaps is derived from intake, not hardcoded.
- `npm run typecheck`
- `npm run lint`

---

## Phase 2: Policy/Evidence Generator Upgrade

### Task 4: Add editable policy draft state

**Objective:** Let users review/edit before generating the final PDF.

**Likely files:**
- Modify: `lib/db/schema.ts` or reuse `policies.content` carefully
- Modify: `app/(app)/policies/[type]/page.tsx`
- Modify: `app/(app)/policies/actions.ts`
- Possibly create: `components/policies/policy-editor.tsx`

**Acceptance criteria:**
- User can review prefilled sections before PDF generation.
- Company name, legal ID, jurisdiction, review date, and source citations are visible.
- Generated output remains clearly marked as template/draft unless approved.

**Verification:**
- Policy generation smoke still passes.
- Browser check for mobile/desktop editor layout.

### Task 5: Auto-link generated policies as evidence

**Objective:** Make “Generate Policy” close real checklist gaps.

**Likely files:**
- Modify: `app/(app)/policies/actions.ts`
- Modify: `lib/db/queries/policies.ts`
- Modify: `lib/db/queries/evidence.ts`
- Modify: `lib/db/queries/controls.ts`

**Acceptance criteria:**
- Generating a policy creates `policyControls` and evidence rows for linked controls.
- Evidence rows point back to `sourceArtifactId` or policy metadata safely.
- Control status can move to `manual_review` or `pass` depending on chosen policy.

**Verification:**
- Extend `npm run smoke:primary-flow` to assert generated policy appears in evidence vault.
- `npm run smoke:gap-analysis-artifacts`
- `npm run smoke:generated-artifact-audit`

---

## Phase 3: Auditor Export / Peace-of-Mind Package

### Task 6: Design curated audit package schema

**Objective:** Separate full private export from buyer/auditor package.

**Likely files:**
- Modify: `lib/db/schema.ts`
- Create: `lib/db/queries/audit-packages.ts`
- Create: `lib/audit-packages/disclosure.ts`

**Suggested tables:**
- `audit_packages`
  - `id`, `clerkOrgId`, `title`, `status`, `visibility`, `tokenHash`, `expiresAt`, `createdBy`, `createdAt`
- `audit_package_items`
  - `id`, `packageId`, `itemType`, `itemId`, `redactionLevel`, `sortOrder`

**Acceptance criteria:**
- Packages are org-scoped.
- Tokens are hashed at rest.
- Expiry is mandatory for public/private share links.

**Verification:**
- Org-boundary smoke covers package access.
- Token verification tests mirror Trust Center/vendor token style.

### Task 7: Add package generation and ZIP export

**Objective:** Generate a curated ZIP/report using existing workspace archive logic without leaking secrets.

**Likely files:**
- Create: `app/api/audit-packages/[packageId]/archive/route.ts`
- Create: `app/api/audit-packages/[token]/route.ts` or public route under `app/(marketing)/share/[token]/page.tsx`
- Reuse/extend: `app/api/exports/workspace/archive/route.ts`
- Reuse/extend: `lib/db/queries/workspace-export.ts`

**Acceptance criteria:**
- Package ZIP includes manifest, policies, evidence metadata, and selected PDFs.
- Public/read-only link never exposes raw control IDs, evidence filenames, exact test timestamps, or secrets.
- Owner can revoke or expire package.

**Verification:**
- Extend `npm run smoke:production-tenant-readiness` with one curated package path.
- Add DLP-style smoke checks for obvious token/env leakage.

---

## Phase 4: Advisor Workspace Hardening

### Task 8: Replace raw client-org linking with invite/acceptance

**Objective:** Make consultant onboarding commercially usable.

**Likely files:**
- Modify: `lib/db/schema.ts`
- Modify: `lib/db/queries/consultant-clients.ts`
- Modify: `app/(app)/clients/page.tsx`
- Create: `app/client-invites/[token]/page.tsx`
- Create: `lib/consultants/invites.ts`

**Acceptance criteria:**
- Consultant enters client email/company, not raw Clerk org ID.
- Client accepts via token and links their org or creates one.
- Access level is explicit: view/manage/admin.

**Verification:**
- Token expiry and hashed-token tests.
- Org-boundary smoke for consultant view/manage access.

### Task 9: Advisor portfolio gaps dashboard

**Objective:** Show consultants a useful “which client needs attention” dashboard.

**Likely files:**
- Modify: `app/(app)/clients/page.tsx`
- Modify: `lib/db/queries/consultant-clients.ts`
- Possibly create: `lib/db/queries/consultant-dashboard.ts`

**Acceptance criteria:**
- Consultant sees each client’s framework count, average score, stale evidence count, open critical gaps.
- No cross-tenant leakage.
- Non-consultant plans remain gated.

**Verification:**
- `npm run smoke:org-boundaries`
- Browser mobile/desktop check for `/clients`.

---

## Phase 5: Micro-Learning & Team Attestation

### Task 10: Add attestation campaign model

**Objective:** Model a tiny, auditable training completion flow.

**Likely files:**
- Modify: `lib/db/schema.ts`
- Create: `lib/db/queries/training.ts`
- Create: `lib/training/modules.ts`
- Modify: `app/(app)/team/page.tsx`
- Create: `app/(app)/team/training/page.tsx`

**Suggested tables:**
- `training_modules`: key, locale, title, content, version, controlKey
- `training_campaigns`: clerkOrgId, moduleKey, status, createdBy, createdAt, dueDate
- `training_recipients`: campaignId, email, tokenHash, sentAt, openedAt, attestedAt, name, metadata

**Acceptance criteria:**
- Owner can create a campaign for a short module.
- Recipient records are org-scoped.
- Module version is captured for proof.

**Verification:**
- Query tests for campaign creation/listing.
- `npm run typecheck`

### Task 11: Magic-link attestation flow

**Objective:** Let employees read a 2-minute training and attest without creating an account.

**Likely files:**
- Create: `app/training-attestation/[token]/page.tsx`
- Create: `app/training-attestation/[token]/actions.ts`
- Create: `lib/training/tokens.ts`
- Modify: email templates under `lib/email/templates/*` or add `lib/email/templates/training.ts`

**Acceptance criteria:**
- Token links are signed/hashed and expire.
- Employee can read module and check an attestation box.
- Completion writes an audit log without requiring the employee to be a Clerk member.

**Verification:**
- Token invalid/expired/used tests.
- Browser smoke for signed link rendering and submit.

### Task 12: Convert completion into evidence

**Objective:** Make training completion prove a compliance task.

**Likely files:**
- Modify: `lib/db/queries/training.ts`
- Modify: `lib/db/queries/evidence.ts`
- Modify: `lib/db/queries/controls.ts`

**Acceptance criteria:**
- Campaign completion produces an evidence record for `ctrl_security_training_annual` or the mapped training control.
- Evidence summary shows completion count/percentage, module version, and date range.
- Raw recipient details stay private; public exports show only summary counts unless explicitly included in a private package.

**Verification:**
- Extend workspace archive smoke to include training evidence metadata without leaking unnecessary PII.

---

## Cross-Cutting Requirements

### Security and privacy

- Validate all server action/API inputs with Zod.
- Keep token values hashed/signed, never stored in plaintext.
- Use private no-store responses for exports and sensitive downloads.
- Do not expose secrets, Blob URLs, integration tokens, raw file names, exact test times, or internal control IDs in public links.
- Add audit logs for generation, package creation, package access/revocation, training campaign send, and attestation completion.

### Database/migration requirements

Every phase that changes `lib/db/schema.ts` requires:
- `npm run db:generate`
- Local `npm run db:migrate` where `DATABASE_URL` is available
- Explicit pre-deploy check: confirm production migrations are applied or run `npm run db:migrate` against production `DATABASE_URL` before relying on the deployed feature.

### Internationalization

Touch all locales together:
- `messages/it-IT.json`
- `messages/en-EU.json`
- `messages/cs-CZ.json`

Strategy:
- Italy-first UX copy for new SME flow.
- Do not promote Italian legal template claims until legal review marks templates reviewed.
- Czech and EU copy can be present but should not imply broader legal finality.

### Verification baseline before commit/deploy

For non-trivial implementation phases:
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run smoke:primary-flow`
- Relevant narrower smokes:
  - onboarding/intake: new intake smoke plus `tests/e2e/onboarding.spec.ts`
  - policies/evidence: `npm run smoke:gap-analysis-artifacts`, `npm run smoke:generated-artifact-audit`
  - exports: `npm run smoke:export-endpoints-source`, production tenant smoke when ready
  - org boundaries: `npm run smoke:org-boundaries`

---

## Suggested MVP Cut

If the goal is fastest market impact, do not build all five at once. Build this MVP in order:

1. 15-Minute Audit MVP
   - 10-15 question intake
   - deterministic scope engine
   - dashboard “critical gaps” output
   - controls filtered to in-scope tasks

2. Policy-to-Evidence Loop
   - review/edit generated policy draft
   - generate PDF
   - auto-link as evidence
   - update checklist status

3. Curated Auditor ZIP
   - package selected policies/evidence summary
   - private ZIP first
   - public expiring link second

Defer until MVP proves activation:
- Consultant invite workspace hardening
- Micro-learning campaigns

Reason: #4 and #5 are strong, but they multiply tenancy, permissions, email, token, and PII complexity. The core SME sale will be much stronger once one SME can go from intake to scoped gaps to generated evidence to exportable proof.

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---:|---|
| Overclaiming legal/regulatory coverage | High | Keep reviewed/draft status explicit; only map to existing reviewed source coverage. |
| Public share leaks attacker-useful implementation detail | High | Reuse Trust Center disclosure constraints; category summaries only on public links. |
| AI produces wrong scoping advice | High | Deterministic rules first; AI explanations optional and review-gated. |
| Schema changes drift from production migrations | High | Explicit migration verification before deploy/use. |
| Consultant access causes cross-tenant writes | High | Start read-only; extend `smoke:org-boundaries` before manage/admin. |
| Training attestations collect employee PII | Medium | Minimize fields; document retention; summarize in public exports. |
| Feature scope balloons into LMS/GRC suite | Medium | Keep each phase vertical and SME-focused; no LMS, no broad auditor portal initially. |

---

## Open Questions for Owner Decision

1. Should scoped-out controls be stored as `not_applicable`, `out_of_scope`, or hidden with a separate applicability table?
2. Should AI be used at all in the first intake release, or should it be deterministic only?
3. What is the minimum acceptable “auditor export”: private ZIP only, or expiring read-only link from day one?
4. For policies, is an in-app editor required for MVP, or is “review template + generate PDF” enough?
5. For consultant workspace, should advisors be able to write client data in MVP, or view-only first?
6. For micro-learning, is email-only enough, or should imported employee lists from Microsoft 365 be included later?

---

## Recommended Next Step

Write a short product spec for the first MVP slice only: 15-Minute Audit + scoped dashboard/control list. After owner approval, implement with TDD/incremental workflow, then move to the policy-to-evidence loop.
