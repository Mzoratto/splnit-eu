# NÚKIB Registration Artifact Hardening Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan lane-by-lane. Do not let subagents commit or push. The controller integrates diffs, resolves overlap, runs final checks, and commits only intentional files.

**Goal:** Harden the NÚKIB registration artifact generator into a beta/design-partner-ready Czech asset without turning it into a public production claim.

**Architecture:** Keep the current artifact flow, but tighten the trust boundaries: i18n through `messages/*.json`, visible beta framing, synthetic fixtures, data-residency documentation, PDF content-fidelity tests, explicit test-mode behavior, stricter validation, and safer JSONB storage. Defer full production/broad rollout until the beta surface has browser/UI, authenticated-org, and production-smoke coverage.

**Tech Stack:** Next.js App Router, React 19, TypeScript, next-intl, Clerk, Drizzle/Postgres, generated_artifacts JSONB, Playwright, `pdftotext`, `@react-pdf/renderer`.

---

## Master Plan Alignment

Source documents:
- `docs/app-readiness-audit.md`
- `docs/reviews/nukib-registration-hardening-checklist.md`
- branch `codex/nukib-registration-artifact`

Source priority item:
- Close product-trust gaps before broader outreach while preserving useful Czech design-partner assets.

Why this is next:
- The NÚKIB artifact generator is a strong Czech differentiator, but it currently has hardcoded Czech UI copy, weak fixture hygiene, no data-residency note, byte-only PDF testing, and environment-sensitive E2E behavior.

Product/legal/safety constraints:
- Do not market this as production-ready filing automation.
- Do not imply legal advice, successful NÚKIB filing, certification, or regulatory approval.
- Do not expose registration data, IP ranges, domains, contact names, or artifact filenames publicly.
- Use the route as beta/design-partner material only after P1 hardening.

Out of scope:
- Automating NÚKIB portal submission.
- BankID or datová schránka automation.
- Public Trust Center disclosure.
- Full Czech compliance-platform expansion.
- Production smoke until P1 beta hardening passes.

---

## Current Evidence

Already verified during review:
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run build` passed.
- `npx tsx scripts/validate-nukib-template.ts` passed.
- `tests/e2e/nukib-registration.spec.ts` passes only when the app is run with Clerk env cleared and test flags enabled.
- Browser render of `/compliance/nukib-registration` passed with zero console errors in local test mode.

Current risk:
- The route is useful, but not ready to be counted as production/broad-outreach scope.

---

## Target State

```text
Design partner opens beta route
  |
  v
Visible beta banner explains:
  - preparation support only
  - official submission still happens on NÚKIB portal
  - feedback/design-partner status
  |
  v
Localized UI copy via messages/*.json
  |
  v
Form validates with stricter schema
  |
  v
POST /api/compliance/nukib-registration
  |
  | explicit Clerk or explicit local test mode
  v
generated_artifacts.content stores object JSONB
  |
  v
PDF route renders artifact
  |
  v
E2E extracts PDF text and asserts core fields
```

---

## Subagent Lane Overview

| Lane | Owner profile | Scope | Can run parallel? | Depends on |
|---|---|---|---:|---|
| A | frontend/i18n | i18n messages + beta banner | yes | none |
| B | tester/security | fixture hygiene + git-history check + API negative tests + PDF fidelity | yes | none for fixture/API, PDF fidelity may need C |
| C | backend/datamodel | schema validation + JSONB object storage + parser compatibility | yes | none |
| D | docs/security | data residency/data-processing documentation | yes | none |
| E | tester/frontend | browser UI/mobile E2E | after A/C preferred | A, C |
| F | reviewer/controller | integration review, final validation, commit plan | after A-E | all lanes |

Parallel launch:
- Start A + B + C + D together.
- Start E after A and C land, because selectors/copy/storage behavior may change.
- F runs last.

Subagent rule:
- Subagents may edit scoped files only.
- Subagents must not commit, push, deploy, or print secrets.
- Subagents must return: files changed, tests run, exact outputs, remaining risks.

---

## Lane A — Frontend/i18n: Messages and Beta Framing

### Task A1: Inventory hardcoded user-facing copy

**Objective:** Identify all user-facing strings in the NÚKIB page and label modules that must move to i18n.

**Files:**
- Read: `app/(app)/compliance/nukib-registration/page.tsx`
- Read: `lib/compliance/nukib/registration-labels.ts`
- Read: `messages/cs-CZ.json`
- Read: `messages/it-IT.json`
- Read: `messages/en-EU.json`

**Steps:**
1. Search for hardcoded Czech text in the page.
2. Classify each string as:
   - route copy
   - field label
   - field hint
   - button text
   - status/error text
   - beta banner copy
   - stable literal allowed to remain, e.g. `NÚKIB`, `zákon č. 264/2025 Sb.`
3. Produce a list of message keys under a single namespace, recommended: `nukibRegistration`.

**Verification:**
- Report exact string groups and proposed keys.
- Do not edit code in A1 unless doing A2 in the same subagent pass.

### Task A2: Add i18n message keys for Czech, Italian, and English

**Objective:** Add complete message keys for the route in all three locale files.

**Files:**
- Modify: `messages/cs-CZ.json`
- Modify: `messages/it-IT.json`
- Modify: `messages/en-EU.json`

**Implementation requirements:**
- Czech is the primary reviewed copy.
- Italian/English copy must honestly frame the feature as a Czech NÚKIB preparation artifact.
- Do not imply Italian filing support or EU-wide regulatory filing support.
- Keep stable legal names literal where appropriate.

**Suggested namespace:**

```json
"nukibRegistration": {
  "eyebrow": "NÚKIB",
  "title": "...",
  "subtitle": "...",
  "beta": {
    "title": "...",
    "body": "...",
    "submissionNote": "..."
  },
  "status": {
    "title": "...",
    "latest": "...",
    "none": "...",
    "downloadPdf": "..."
  },
  "sections": { },
  "fields": { },
  "actions": { },
  "errors": { },
  "networkScope": { },
  "contacts": { },
  "disclaimer": { }
}
```

**Verification:**

```bash
npm run typecheck
npm run lint
npm run smoke:i18n-shell
```

Expected: all pass.

### Task A3: Refactor page to consume i18n messages

**Objective:** Replace hardcoded UI copy in the page with next-intl translations.

**Files:**
- Modify: `app/(app)/compliance/nukib-registration/page.tsx`
- Modify only if needed: `lib/compliance/nukib/registration-labels.ts`

**Implementation requirements:**
- Use existing project next-intl patterns.
- Keep stable enum values and schema values unchanged.
- Keep stable literal names only when intentionally not translatable.
- Add the visible beta/design-partner banner near the top of the page, before the form.
- Banner must say official submission still happens on the NÚKIB portal.

**Verification:**

```bash
npm run typecheck
npm run lint
npm run build
```

Expected: all pass.

---

## Lane B — Test/Security: Fixture Hygiene, API Negatives, PDF Fidelity

### Task B1: Replace masked fixture data with synthetic valid data

**Objective:** Remove masked/possibly-derived contact data from test fixtures.

**Files:**
- Modify: `scripts/fixtures/nukib-registration-fixture.json`

**Implementation requirements:**
- Replace `+420****6789` with an obviously fake valid Czech-style number, e.g. `+420 200 000 001`.
- Ensure all emails are reserved/synthetic, preferably `example.test`.
- Keep fixture schema-valid.

**Verification:**

```bash
npx tsx scripts/validate-nukib-template.ts
git log -S '+420' -- scripts/fixtures/nukib-registration-fixture.json app lib scripts tests
```

Expected:
- fixture validation passes.
- history check output reviewed and summarized without overstating certainty.

### Task B2: Make NÚKIB E2E test mode explicit

**Objective:** Prevent local Clerk env from causing false 401 failures in NÚKIB E2E.

**Files:**
- Modify: `tests/e2e/nukib-registration.spec.ts`
- Modify if needed: `playwright.config.ts`
- Modify if needed: `.github/workflows/e2e.yml`
- Optional: add a package script in `package.json`

**Implementation options:**
- Preferred: add a package script that runs the NÚKIB E2E with explicit local test-mode env and a started server.
- Acceptable: document and enforce env in Playwright project setup.

**Acceptance criteria:**
- Running the targeted test locally does not depend on a developer having no Clerk keys in `.env.local`.
- CI still runs the same behavior.
- The test still fails closed when neither Clerk auth nor explicit test mode is available.

**Verification:**

```bash
npm run build
# then run the explicit NÚKIB test command added by this task
```

Expected: targeted NÚKIB E2E passes.

### Task B3: Add API negative tests

**Objective:** Cover the main failure/security paths for the registration API and PDF route.

**Files:**
- Modify: `tests/e2e/nukib-registration.spec.ts`

**Tests to add:**
- POST invalid JSON returns 400.
- GET before any artifact returns 404.
- PDF invalid UUID returns 400.
- PDF unknown valid UUID returns 403 or 404 according to current route contract. Current route returns 403 for not found after valid UUID; keep or intentionally change, but test it.
- Unauthorized path returns 401 when test mode is disabled and no Clerk session exists. If hard to express in existing Playwright config, document as follow-up for authenticated smoke, not silently skip.

**Verification:**

```bash
npx playwright test tests/e2e/nukib-registration.spec.ts --project=chromium
```

Expected: all NÚKIB tests pass in explicit test mode.

### Task B4: Add PDF content-fidelity test

**Objective:** Prove the generated PDF contains the submitted artifact data, not just valid bytes.

**Files:**
- Modify: `tests/e2e/nukib-registration.spec.ts`
- Reuse pattern from: `tests/e2e/compliance-report-gap.spec.ts`
- Check CI dependency already present: `.github/workflows/e2e.yml` installs `poppler-utils`.

**Implementation requirements:**
- Submit fixture data.
- Download PDF via API or page download.
- Write response buffer to a temp file if using APIRequestContext.
- Run `pdftotext <file> -` using Node `execFileSync`.
- Assert extracted text contains:
  - IČO
  - organisation name
  - at least one contact name
  - at least one contact email
  - at least one domain or IP/CIDR value

**Verification:**

```bash
npx playwright test tests/e2e/nukib-registration.spec.ts --project=chromium
```

Expected: fails if PDF mapping drops core fields.

---

## Lane C — Backend/Datamodel: Validation and JSONB Storage

### Task C1: Store NÚKIB artifact content as object JSONB

**Objective:** Stop storing JSON as a string in a `jsonb` column.

**Files:**
- Modify: `lib/compliance/nukib/registration-artifact.ts`
- Modify if needed: `lib/db/queries/generated-artifacts.ts`

**Current issue:**
- `serializeNukibRegistrationContent()` returns a JSON string.
- `buildNukibRegistrationArtifact()` casts the string to `Record<string, unknown>`.

**Implementation requirements:**
- Store the parsed registration object directly as JSONB.
- Keep `parseNukibRegistrationContent()` backward-compatible with string content, in case local/prod test rows already exist.
- Do not add a migration unless the schema changes. This is content shape, not table shape.

**Verification:**

```bash
npm run typecheck
npx playwright test tests/e2e/nukib-registration.spec.ts --project=chromium
```

Expected: API creates and reads artifacts successfully.

### Task C2: Strengthen IP/CIDR and phone validation

**Objective:** Prevent obviously invalid network/contact data from entering compliance-prep artifacts.

**Files:**
- Modify: `lib/compliance/nukib/registration-schema.ts`
- Modify if needed: `scripts/fixtures/nukib-registration-fixture.json`
- Modify tests: `tests/e2e/nukib-registration.spec.ts` or add a focused validation script/test

**Implementation requirements:**
- IP/CIDR validation must reject invalid IPv4 octets and invalid CIDR masks.
- Domain validation should continue to accept realistic domain names and reject bad shapes.
- Phone validation must either:
  - enforce a conservative Czech/international phone shape, or
  - intentionally remain free text with clear copy.
- Recommendation: enforce a simple international phone shape such as `+420 200 000 001`, allowing spaces, and require at least plausible digits.

**Test cases:**
- reject `999.999.999.999`
- reject `192.0.2.0/99`
- accept `192.0.2.0/24`
- accept `+420 200 000 001`
- reject `+420****6789`

**Verification:**

```bash
npx tsx scripts/validate-nukib-template.ts
npm run typecheck
npx playwright test tests/e2e/nukib-registration.spec.ts --project=chromium
```

Expected: tests pass and bad values are rejected.

---

## Lane D — Docs/Security: Data Residency and Processing Map

### Task D1: Add NÚKIB registration artifact to the data-processing map

**Objective:** Document the sensitive data category and processor/storage posture before collecting real partner data.

**Files:**
- Modify: `docs/legal/data-processing-map.md`
- Modify: `docs/reviews/nukib-registration-hardening-checklist.md` if needed

**Content requirements:**
- Add or update a processing operation for NÚKIB registration artifacts / generated compliance filing-prep artifacts.
- Name data categories:
  - IČO
  - organisation/service description
  - statutory/technical/security contacts
  - email/phone/role/position
  - domains
  - IP ranges/CIDR blocks
  - cross-border dependencies
  - generated PDF metadata
- Name systems/processors:
  - Neon
  - Vercel runtime
  - Vercel logs where applicable
  - any Blob usage only if actually used by this route. Current route generates PDF on demand and stores content in Neon, not Blob.
- State open decision: confirm production Neon region and Vercel runtime/data handling; do not imply EU-only if not proven.

**Verification:**

```bash
npm run check:production-migration-drift
```

Also perform redacted region/processor metadata check if available. Never print credentials.

### Task D2: Add partner-demo wording guardrail

**Objective:** Make the demo posture usable but safe.

**Files:**
- Modify: `docs/reviews/nukib-registration-hardening-checklist.md`
- Optional create: `docs/archive/outreach/paused-italy-2026-05/czech-design-partner-nukib-demo-notes.md`

**Content requirements:**
- Partner-safe framing:
  - “preparation artifact”
  - “feedback beta”
  - “official filing remains on NÚKIB portal”
- Explicitly avoid:
  - “production-ready filing”
  - “legal advice”
  - “guaranteed accepted by NÚKIB”
  - “EU-only data residency” unless verified

**Verification:**
- Documentation diff only.
- No code checks required unless docs tooling exists.

---

## Lane E — Browser UI/Mobile E2E

### Task E1: Add browser form-flow E2E

**Objective:** Prove the page works as a user-facing beta form, not only as an API.

**Files:**
- Create or modify: `tests/e2e/nukib-registration-ui.spec.ts`
- Reuse helper: `tests/e2e/helpers.ts`

**Test flow:**
1. Navigate to `/compliance/nukib-registration` in explicit local test mode.
2. Assert beta/design-partner banner is visible.
3. Fill required fields with synthetic data.
4. Add at least one domain or IP row.
5. Submit.
6. Assert status card shows latest preparation/artifact.
7. Trigger PDF download or call PDF API and assert success.
8. Assert no visible legal/filing guarantee copy appears.

**Verification:**

```bash
npx playwright test tests/e2e/nukib-registration-ui.spec.ts --project=chromium
```

Expected: pass.

### Task E2: Add validation and mobile overflow E2E

**Objective:** Catch the failure paths users actually see.

**Files:**
- Modify: `tests/e2e/nukib-registration-ui.spec.ts`

**Tests:**
- Empty IČO or bad IČO shows validation.
- Bad IP/CIDR shows validation near the correct row.
- Missing required contact role set shows validation.
- Mobile Chrome renders without horizontal overflow.

**Mobile overflow assertion pattern:**

```ts
const hasOverflow = await page.evaluate(() =>
  document.documentElement.scrollWidth > document.documentElement.clientWidth,
);
expect(hasOverflow).toBe(false);
```

**Verification:**

```bash
npx playwright test tests/e2e/nukib-registration-ui.spec.ts --project=chromium
npx playwright test tests/e2e/nukib-registration-ui.spec.ts --project=mobile-chrome
```

Expected: both pass.

---

## Lane F — Controller Final Integration

### Task F1: Review combined diff

**Objective:** Confirm all lanes compose cleanly and no scope creep landed.

**Files:**
- Review all changed files with `git diff --stat` and targeted diffs.

**Checklist:**
- i18n keys are present in all three locale files.
- Page uses i18n for user-facing copy.
- Beta banner exists.
- Fixtures are clearly synthetic.
- Git-history check result is noted.
- Data-processing map documents NÚKIB artifacts and open residency questions.
- PDF fidelity test extracts text and asserts key fields.
- JSONB content stores object data.
- Validation rejects bad IP/CIDR and masked phone fixture.
- UI E2E covers desktop and mobile.

### Task F2: Run final validation

**Objective:** Prove the hardening pass is ready to commit.

**Commands:**

```bash
npm run typecheck
npm run lint
npm run build
npm run smoke:i18n-shell
npx tsx scripts/validate-nukib-template.ts
npx playwright test tests/e2e/nukib-registration.spec.ts --project=chromium
npx playwright test tests/e2e/nukib-registration-ui.spec.ts --project=chromium
npx playwright test tests/e2e/nukib-registration-ui.spec.ts --project=mobile-chrome
```

Expected: all pass.

### Task F3: Commit intentional changes

**Objective:** Commit the plan/hardening implementation as reviewable units.

**Recommended commits:**

```bash
git add docs/plans/2026-05-29-nukib-registration-hardening.md docs/reviews/nukib-registration-hardening-checklist.md
git commit -m "docs: plan NUKIB registration hardening"
```

Then after implementation:

```bash
git add app components lib messages scripts tests .github package.json package-lock.json docs
git commit -m "test: harden NUKIB registration beta artifact"
```

Adjust staged files to actual changes. Do not use `git add -A` blindly.

---

## Acceptance Gate for Czech Design-Partner Demo

The feature is demo-ready for a Czech design partner only when:

- P1 lanes A-D are complete.
- Targeted API/PDF tests pass.
- PDF content-fidelity test passes.
- Beta banner is visible.
- Fixture hygiene is clean.
- Data residency/open-processor note is documented.
- No public copy claims production-ready filing or legal advice.

The feature is production/broad-rollout-ready only after:

- UI/mobile E2E passes.
- Authenticated Clerk/org smoke passes.
- Production smoke is added and passes against the Vercel Production Neon branch.
- Any legal/data-residency objections are resolved or explicitly disclosed.

---

## Subagent Dispatch Prompts

### Subagent A prompt: frontend/i18n

Implement Lane A from `docs/plans/2026-05-29-nukib-registration-hardening.md`.

Scope:
- Move NÚKIB registration page user-facing copy into `messages/cs-CZ.json`, `messages/it-IT.json`, `messages/en-EU.json`.
- Add visible beta/design-partner banner.
- Modify only NÚKIB registration page/i18n files unless a small label helper change is necessary.

Constraints:
- Do not commit or push.
- Do not add public marketing claims.
- Keep Italian/English copy honest: Czech NÚKIB prep artifact, not Italian/EU filing support.

Return:
- Files changed.
- Message namespace added.
- Tests run and exact outputs.
- Any hardcoded strings intentionally left and why.

### Subagent B prompt: tester/security

Implement Lane B from `docs/plans/2026-05-29-nukib-registration-hardening.md`.

Scope:
- Replace masked fixture data with synthetic data.
- Add/adjust API negative tests.
- Make NÚKIB E2E test mode explicit.
- Add PDF content-fidelity test using `pdftotext` pattern from `tests/e2e/compliance-report-gap.spec.ts`.

Constraints:
- Do not commit or push.
- Do not print secrets.
- Keep tests deterministic in local test mode.

Return:
- Files changed.
- Git-history check summary.
- Tests run and exact outputs.
- Any test that remains follow-up-only and why.

### Subagent C prompt: backend/datamodel

Implement Lane C from `docs/plans/2026-05-29-nukib-registration-hardening.md`.

Scope:
- Store NÚKIB artifact content as object JSONB.
- Keep parser backward-compatible with string content.
- Strengthen IP/CIDR validation.
- Strengthen phone validation or clearly document intentional free-text handling.

Constraints:
- Do not commit or push.
- Do not add dependencies unless absolutely necessary and justified.
- Do not change DB schema unless unavoidable. Prefer content-shape fix only.

Return:
- Files changed.
- Validation decisions.
- Tests run and exact outputs.
- Migration impact: yes/no and why.

### Subagent D prompt: docs/security

Implement Lane D from `docs/plans/2026-05-29-nukib-registration-hardening.md`.

Scope:
- Update `docs/legal/data-processing-map.md` for NÚKIB registration artifacts.
- Update checklist or add Czech design-partner demo notes if useful.
- Document open data-residency/processor questions without claiming EU-only unless verified.

Constraints:
- Do not commit or push.
- Do not print secrets.
- Do not fabricate production region metadata.

Return:
- Files changed.
- Exact data categories documented.
- Remaining open decisions.
- Verification performed or explicitly deferred.

### Subagent E prompt: browser UI/mobile

Implement Lane E after A and C land.

Scope:
- Add browser E2E for form fill, beta banner, submit, status, PDF download/API success.
- Add validation and mobile overflow tests.

Constraints:
- Do not commit or push.
- Reuse existing Playwright helpers where possible.
- Keep selectors resilient and user-visible.

Return:
- Files changed.
- Tests run and exact outputs.
- Any flaky selector or route issue found.

---

## Controller Notes

Do not dispatch lanes that touch the same files at the same time if the implementation environment cannot isolate worktrees.

If using Hermes `delegate_task` without worktree isolation, safest order is:
1. A
2. C
3. B
4. D
5. E
6. F

If using separate worktrees or Kanban worker profiles, parallelize:
- A, C, D in parallel.
- B can run in parallel except PDF fidelity may need C’s storage/parser changes.
- E after A/C.

Do not deploy during this plan.
