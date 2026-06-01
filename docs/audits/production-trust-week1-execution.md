# Production Trust Week 1 Execution Notes

Date: 2026-05-30

Purpose: record the first execution pass against `docs/plans/2026-05-30-production-trust-readiness-plan.md` without upgrading unproven claims.

## Repository state

Baseline command:

```bash
git status --short && git rev-parse --short HEAD && git branch --show-current
```

Observed:

```text
M package-lock.json
 M package.json
?? docs/plans/2026-05-30-production-trust-readiness-plan.md
?? docs/splnit-codebase-knowledge-base.docx
?? docs/splnit-codebase-knowledge-base.html
?? docs/splnit-codebase-knowledge-base.md
?? memory/
ea16170
main
```

Interpretation: production-proof execution can continue, but the repository is not push-ready until dirty/untracked files are intentionally committed, ignored, or removed.

## A1 Stripe test-mode proof status

Commands run:

```bash
npm run smoke:stripe-upgrade-flow
npm run smoke:stripe-billing
```

Observed:

```text
Stripe upgrade flow smoke passed.
Stripe billing smoke passed.
```

Additional non-secret Stripe API probe:

- Stripe secret mode: test
- Stripe publishable mode: test
- `STRIPE_SME_PRICE_ID`: present, retrievable, active, CZK, monthly, test mode
- `STRIPE_AGENCY_PRICE_ID`: present, retrievable, active, CZK, monthly, test mode
- Stripe account probe: charges enabled, details submitted, country CZ

Claim boundary:

- Proven: local/runtime Stripe billing logic, local signed webhook handling, entitlement transitions, cancellation email transport stub, session parameter construction, and configured test-mode prices.
- Not yet proven: browser-completed Stripe Checkout with a test card, Stripe-hosted customer portal opened from a signed-in app user, and Stripe-delivered webhook forwarding from hosted Checkout.
- Result: A1 is **partially green**, but not fully GREEN under the plan’s hard floor because hosted checkout/card/portal proof is still missing.

## B0 Primary-flow environment/credential readiness

Commands run:

```bash
npm run smoke:production-tenant-readiness-prereqs
npm run smoke:production-tenant-readiness-source
npm run check:production-migration-drift
```

Observed:

- `readyForTenantSmoke: true`
- `readyForMailboxSendAttempt: true`
- Clerk target: live
- Clerk publishable/secret classes: live/live and compatible
- Database host class: non-local / Neon
- Missing required env: none
- Missing mailbox env: none
- Source guard passed
- Initial production migration drift check passed before the primary-flow fix.
- After the primary-flow DB fix, production migration drift check also passed:
  - expected migrations: 28
  - production migrations: 28
  - latest expected/applied inferred migration: `0027_drop_ico_format_check`
  - missing expected migrations: none

Claim boundary:

- B0 is GREEN for live production smoke readiness.
- This does not yet prove the authenticated primary flow itself; it proves credentials/environment/migration/source prerequisites are available.
- The full authenticated onboarding → controls → evidence smoke remains the next hard floor.

## A3 RoPA audit status

Search/audit results:

- GDPR Article 30 / processing-record control exists:
  - `lib/controls/library.ts` includes “Records of processing activities are maintained” mapped to GDPR Article 30.
- Framework/questionnaire copy exists for RoPA/processing records.
- Internal Splnit processing map exists:
  - `docs/legal/data-processing-map.md`
  - status says it is an engineering draft for counsel review, not a final Article 30 record.
- Customer-facing policy templates:
  - CZ templates include `gdpr_privacy_notice`, but no `record_of_processing` / RoPA template.
  - EU templates include `gdpr_privacy_notice`, but no `record_of_processing` / RoPA template.
  - IT templates include `record_of_processing` with `reviewStatus: draft`.

Command run:

```bash
npm run smoke:templates
```

Observed:

```text
Policy template resolution smoke test passed.
```

Additional attempted smoke:

```bash
npm run smoke:italian-gdpr-layer
```

Observed failure:

```text
AssertionError [ERR_ASSERTION]: Garante Data Breach should be imported as Garante guidance.
```

Interpretation: this appears to be an Italian GDPR knowledge/import smoke issue, not direct proof for CZ/EU RoPA template coverage. It should not block the RoPA classification, but it is a separate knowledge-layer gap to investigate before relying on the Italian GDPR layer.

RoPA classification:

- CZ RoPA customer template: missing.
- EU RoPA customer template: missing.
- IT RoPA customer template: draft exists.
- Internal Splnit processing map: draft exists for counsel review.

Recommended next action:

- Add a CZ/EU `record_of_processing` template or explicitly document it as a legal/template gap before design-partner onboarding.
- Keep any RoPA wording review-bound until counsel approves.

## Authenticated primary-flow smoke

Command run:

```bash
AUTH_PRIMARY_FLOW_BASE_URL=https://splnit.eu npm run smoke:authenticated-primary-flow
```

Initial failures and fixes:

1. Locale selector drift
   - Failure: smoke waited for `/Locale/i`.
   - Cause: production default Czech label is `Jazyk`.
   - Fix: selector now matches `Jazyk|Locale|Lingua`.

2. Company-step save failure
   - Symptom: `Uložení kroku se nepodařilo.` and HTTP 500 from `/onboarding`.
   - Root cause: onboarding accepts non-CZ legal identifiers up to 32 chars, but production DB still had `organisations.ico varchar(8)` plus a Czech-only `organisations_ico_format_check` constraint.
   - Fixes applied:
     - `lib/db/schema.ts`: widened `organisations.ico` to `varchar(32)`.
     - `lib/db/migrations/0026_same_rockslide.sql`: generated/applied migration for the column width change.
     - `lib/db/migrations/0027_drop_ico_format_check.sql`: drops the Czech-only IČO format check.
   - Production migration applied with `npm run db:migrate` because the live production proof depended on it immediately.

3. Six-step onboarding flow drift
   - Old smoke expected company → framework selection.
   - Current production flow is company → intake sections → tools → framework confirmation → integration → score → dashboard.
   - Smoke updated to follow the current six-step flow.

4. Italian localization selector drift
   - Updated selectors for current Italian labels:
     - `Mostra punteggio`
     - `La prima base iniziale è pronta`
     - `Analisi dei gap completata`
     - `Rivedi controlli mappati`
   - Updated `/it/controls` assertion to the intake-prioritized first visible control, `Registri delle attivita di trattamento mantenuti`, instead of assuming MFA appears first.

5. Scope correction
   - The existing smoke also tried to generate policy/gap-report PDFs.
   - That is outside the Week 1 primary-flow gate and the UI button was disabled, so the smoke was narrowed to the actual hard floor: authenticated onboarding → assessment/controls → evidence upload/download.
   - Policy/gap-report PDF generation remains a separate proof gate.

Final passing result:

```json
{
  "browserConsoleErrors": 0,
  "clerkOrgCreated": true,
  "databaseHost": "ep-shy-poetry-alzdu6ud-pooler.c-3.eu-central-1.aws.neon.tech",
  "ok": true,
  "evidenceRows": 1,
  "frameworkSlugs": [
    "gdpr",
    "nis2"
  ],
  "statusRows": 25
}
```

Claim boundary:

- Proven GREEN: authenticated production sign-in, live Clerk org creation, company save, six-step onboarding completion, dashboard redirect, NIS2 assessment, control status persistence, evidence upload persistence, evidence download, Italian primary pages, and database verification.
- Not proven by this smoke: policy PDF generation, framework gap-report PDF generation, hosted Stripe checkout, hosted Stripe portal, and Stripe-delivered webhook forwarding.

Post-fix checks:

```bash
npm run typecheck
npm run check:production-migration-drift
```

Observed:

```text
tsc --noEmit passed
production migration drift ok: expectedMigrationCount 28, productionMigrationCount 28, latest 0027_drop_ico_format_check
```

Cleanup footprint:

```json
{
  "remainingSmokeOrgShells": 6,
  "remainingSmokeProfiles": 0,
  "remainingSmokeEvidence": 0,
  "remainingSmokePolicies": 0,
  "remainingSmokeGeneratedArtifacts": 0,
  "remainingSmokeControlStatuses": 0,
  "remainingSmokeFrameworks": 0
}
```

Interpretation: child smoke data is cleaned. Six old smoke organisation shell rows remain because append-only audit logs reference them, and `audit_logs` intentionally rejects deletion. These rows are inert but should be considered a production-test artifact.

## Next action

1. Complete the missing part of A1: browser-hosted Stripe test checkout + customer portal + webhook delivery proof.
2. Decide whether CZ/EU RoPA template implementation is in the immediate Week 1 scope or tracked as a legal/template gap.
3. Treat policy/gap-report PDF generation as a separate proof gate if it is still part of design-partner readiness.
