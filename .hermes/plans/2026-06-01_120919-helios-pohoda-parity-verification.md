# Helios ↔ Pohoda parity verification plan

## Goal

Verify, from the actual Splnit.eu codebase and production posture, whether Helios is integrated to the same product tier as Pohoda for Splnit's real scope:

- manual readiness checklist
- user attestation
- evidence upload/review
- CSV-assisted import where supported
- progress/agency visibility
- onboarding recommendation
- production seed availability

Also identify whether Helios is now ahead of Pohoda on CSV-assisted import, and whether either product is expected to have a runtime adapter.

This plan is verification-first. It should not assume parity from the build narrative alone.

## Current context / assumptions

Current confirmed context from this session:

- Helios production controls are live and proven:
  - 19 canonical `helios-*` controls present.
  - 19 NIS2 mappings present.
  - zero duplicate/missing/unexpected Helios controls or mappings.
  - targeted seed idempotency proven in production.
- Production seed runbook and sanitized execution record are on `github/main`:
  - `docs/operations/helios-production-seed-window-checklist.md`
  - `docs/operations/helios-production-seed-execution-2026-06-01.md`
- The latest docs record merge on main is `97b82cf Record Helios production seed window (#40)`.
- Public production health after the docs merge returned `ok: true` and `databaseConfigured: true`.

Read-only repo inspection found these relevant facts:

- `lib/workspaces/helios.ts` defines Helios as a `PlatformWorkspace` with 19 controls across the same four-layer structure as Pohoda.
- `lib/workspaces/pohoda.ts` defines Pohoda as a `PlatformWorkspace` with the same general manual/checklist tier.
- `lib/workspaces/control-seeds.ts` currently imports only `heliosWorkspace` and defines `HELIOS_CANONICAL_CONTROL_KEYS`, `HELIOS_CONTROL_SEEDS`, and Helios-specific canonical key guards.
- `lib/integrations/registry.ts` lists runtime adapters/providers for:
  - `microsoft365`
  - `github`
  - `aws`
  - `abra-flexi`
  - `hetzner`
  - `ovhcloud`
- `lib/integrations/registry.ts` does not list `pohoda` or `helios`, so neither appears to be a runtime adapter tier integration.
- Helios CSV code exists on `github/main`:
  - `lib/workspaces/helios-csv/importer.ts`
  - `lib/workspaces/helios-csv/mapping.ts`
  - `lib/workspaces/helios-csv/parser.ts`
  - `lib/workspaces/helios-csv/types.ts`
  - `scripts/smoke-helios-csv-import.ts`
  - `scripts/smoke-helios-csv-parser.ts`
  - `tests/fixtures/helios/*.csv`
- No equivalent `lib/workspaces/pohoda-csv/*` path was found in the quick inspection.
- No production-authenticated Helios or Pohoda smoke was found by filename/content search for `production.*helios`, `helios.*production`, `production.*pohoda`, or `pohoda.*production`.

Important caveat:

- The local checkout at `/Users/marcozoratto/splnit.eu` has unrelated dirty/untracked files. Final verification should run from a clean worktree cut from `github/main`, not from the dirty main checkout.

## Proposed approach

Do this as a focused verification pass, not a feature build.

1. Create a short-lived clean worktree from `github/main`.
2. Build a parity matrix from source, not memory:
   - canonical controls/seeding
   - workspace UI routes
   - attestation actions
   - evidence/progress persistence
   - CSV import paths
   - agency/client visibility
   - onboarding recommendations
   - runtime adapter expectation
   - authenticated production smoke coverage
3. Run only read-only or local/dev verification initially.
4. If production authenticated proof is missing, plan it as a separate owner-approved smoke window because it creates tenant/evidence state.
5. If Pohoda lacks CSV parity and the product wants consistent ERP import UX, open a separate implementation plan for Pohoda CSV backport rather than mixing it into the parity verification.

## Step-by-step plan

### Phase 0 — Clean verification context

1. Create a clean temporary worktree from `github/main`.
   - Example path: `/tmp/splnit-parity-verify-main`
   - Base: `github/main`
2. Confirm the worktree is clean.
3. Confirm package scripts are from `github/main`, not the dirty local checkout.
4. Do not edit production data or run any seeds in this verification pass.

Validation:

- `git log -1 --oneline` shows `97b82cf` or newer.
- `git status --short` is empty.

### Phase 1 — Canonical control parity check

Objective: confirm whether Pohoda has the same canonical control-table backing Helios now has.

Inspect:

- `lib/workspaces/control-seeds.ts`
- `lib/workspaces/pohoda.ts`
- `lib/workspaces/helios.ts`
- `scripts/seed.ts`
- `scripts/seed-helios-controls.ts`
- any seed/backfill files that reference `pohoda-*` controls

Questions to answer:

1. Are `pohoda-*` controls inserted into the canonical `controls` table today?
2. If yes, through which path?
   - broad `db:seed`
   - workspace-derived seed helper
   - older hardcoded seed list
   - migration/backfill
3. Does Pohoda have a canonical manifest equivalent to `HELIOS_CANONICAL_CONTROL_KEYS`?
4. Are Pohoda control keys protected as stable evidence identifiers?
5. Are duplicate/missing/unexpected controls checked for Pohoda anywhere?

Likely outcome based on quick inspection:

- Helios has a stronger explicit seed/readiness guard than Pohoda because `control-seeds.ts` is Helios-specific.
- Pohoda may still be present in workspace UI but not protected by the same canonical seed manifest/readiness verifier. This needs confirmation.

Acceptance criteria:

- Produce a table:
  - `helios`: control count, canonical manifest exists, seeded in production, verifier exists, idempotency proven.
  - `pohoda`: control count, canonical manifest exists/absent, seed path, production presence proof exists/absent.

Stop condition:

- If Pohoda controls are not canonical/seeded, do not say “identical parity.” Say Helios is now stronger on canonical production proof, while Pohoda remains the older reference workspace needing a seed-hardening pass.

### Phase 2 — Manual checklist / attestation / evidence flow parity

Objective: confirm Helios and Pohoda both use the same manual evidence loop.

Inspect:

- `app/(app)/workspaces/[platform]` or platform route files
- `app/(app)/workspaces/helios/*`
- `app/(app)/workspaces/pohoda/*`
- shared workspace components under `components/` and `lib/workspaces/`
- attestation/evidence actions used by both routes
- DB queries for evidence/progress under `lib/db/queries/*`

Questions to answer:

1. Do Pohoda and Helios render through the same workspace component stack?
2. Do both call the same attestation action path?
3. Do both persist evidence against canonical `controlKey`/control IDs, not UI-only keys?
4. Do both produce progress from evidence/status rows the same way?
5. Does Helios-specific CSV evidence stay separate from manual attestation evidence?

Validation targets:

- Existing smokes:
  - `npm run smoke:pohoda-workspace-config`
  - `npm run smoke:helios-workspace-config`
  - `npm run smoke:helios-live-attestation`
  - `npm run smoke:helios-agency-progress`
- E2E targets if local dev is available:
  - `npx playwright test tests/e2e/pohoda-workspace.spec.ts --project=local-demo-chromium`
  - `npx playwright test tests/e2e/helios-workspace.spec.ts --project=local-demo-chromium`

Acceptance criteria:

- Both workspace pages load.
- Both expose four layers.
- Both expose attestation/evidence controls.
- Helios attestation writes/readback is covered locally.
- Agency/client progress visibility is covered for Helios, or missing coverage is tracked.
- If Pohoda lacks equivalent smoke coverage, record that as a proof gap, not necessarily a product gap.

### Phase 3 — CSV import parity check

Objective: confirm whether Helios is ahead of Pohoda on CSV-assisted import.

Inspect:

- `lib/workspaces/helios-csv/parser.ts`
- `lib/workspaces/helios-csv/mapping.ts`
- `lib/workspaces/helios-csv/importer.ts`
- `lib/workspaces/helios-csv/types.ts`
- `app/(app)/workspaces/helios/import/*`
- `scripts/smoke-helios-csv-parser.ts`
- `scripts/smoke-helios-csv-import.ts`
- `tests/fixtures/helios/*.csv`
- search for any Pohoda CSV/import equivalents:
  - `lib/workspaces/pohoda-csv/*`
  - `app/(app)/workspaces/pohoda/import/*`
  - `scripts/smoke-pohoda-csv-*`
  - shared importer modules that include Pohoda mappings

Questions to answer:

1. Is Helios CSV a product-specific Splnit template import, not a native Helios export parser?
2. Does it write evidence type/source distinct from attestation evidence?
3. Does it cap findings/status to `manual_review` and `gap`, never `pass`?
4. Does Pohoda have any matching CSV-assisted import path?
5. If Pohoda lacks CSV, should CSV be backported to Pohoda for product consistency?

Validation targets:

- `npm run smoke:helios-csv-parser`
- `npm run smoke:helios-csv-import`
- Search/assert no import-derived `pass` in Helios CSV importer.

Acceptance criteria:

- Helios CSV import is proven as “CSV-assisted customer-reported evidence,” not automated proof.
- Pohoda CSV presence/absence is documented with exact file paths searched.
- If Pohoda lacks CSV, the conclusion should be: “Helios is ahead of Pohoda on CSV-assisted import, within the manual-review tier.”

### Phase 4 — Runtime adapter expectation check

Objective: confirm neither Pohoda nor Helios is expected to be a live API/runtime adapter integration.

Inspect:

- `lib/integrations/registry.ts`
- `lib/integrations/types.ts`
- `app/(app)/integrations/*`
- marketing/product copy mentioning Pohoda/Helios integrations
- copy hygiene guards for Helios automation claims

Current quick-inspection fact:

- `lib/integrations/registry.ts` registers ABRA Flexi, AWS, GitHub, Hetzner, Microsoft 365, and OVHcloud, not Pohoda or Helios.

Questions to answer:

1. Does any UI or copy imply Pohoda is a runtime/API integration?
2. Does any UI or copy imply Helios is a runtime/API integration?
3. Are both positioned as manual workspace/checklist/template-import tier, while ABRA Flexi is the runtime adapter tier?
4. Does the Helios copy hygiene guard have a Pohoda equivalent or is it Helios-only because of recent overclaim risk?

Validation targets:

- `npm run smoke:copy-hygiene`
- Search public copy for unsafe phrases around `Helios`, `Pohoda`, `automated`, `API`, `live checks`, `export upload`.

Acceptance criteria:

- No runtime adapter gap is assigned to Helios relative to Pohoda unless Pohoda has an actual runtime adapter path, which quick inspection says it does not.
- Product language clearly separates:
  - runtime adapters: ABRA Flexi and other registered providers
  - manual workspace/import tier: Helios/Pohoda

### Phase 5 — Production authenticated proof gap check

Objective: determine whether Helios still lacks an authenticated production smoke that Pohoda has, or whether both lack it.

Inspect:

- `scripts/smoke-authenticated-primary-flow.ts`
- `scripts/smoke-production-tenant-readiness*.ts`
- any smoke scripts mentioning `pohoda` or `helios`
- Playwright authenticated project configuration
- previous execution docs under `docs/operations/` and `docs/audits/`

Quick search found:

- no obvious production-specific Helios or Pohoda smoke by file/content search.

Questions to answer:

1. Is there a production-authenticated smoke for Pohoda workspace attestation/evidence upload?
2. Is there a production-authenticated smoke for Helios attestation and CSV upload?
3. Does existing `smoke:production-tenant-readiness` cover workspace controls generically, or not?
4. If missing, what exact minimal production smoke should be added for Helios and optionally Pohoda?

Recommended minimal Helios production smoke, if missing:

- Use a controlled production test org, not a real customer org.
- Submit one Helios manual attestation against a low-risk test control or dedicated smoke fixture path if supported.
- Upload one CSV-assisted Helios template fixture.
- Verify resulting evidence rows are scoped to the test org and use the correct evidence types/sources.
- Verify CSV-derived statuses are `manual_review` or `gap`, never `pass`.
- Clean up the smoke org/evidence if existing cleanup patterns support it, or mark the org as a controlled smoke artifact.

This should be planned as a separate owner-approved production smoke because it mutates production tenant/evidence state.

Acceptance criteria:

- Parity conclusion states whether the remaining gap is product functionality or proof coverage.
- If only proof is missing, say: “Helios is functionally integrated to the Pohoda tier; authenticated production proof remains to be captured.”

### Phase 6 — Produce the parity report

Create a repo doc or issue-ready report, depending on user preference.

Suggested path:

- `docs/audits/helios-pohoda-parity-verification.md`

Report sections:

1. Executive verdict
2. Scope definition: manual workspace tier vs runtime adapter tier
3. Source-backed parity matrix
4. Helios production seed proof summary
5. CSV import comparison
6. Runtime adapter comparison
7. Authenticated production proof status
8. Recommended follow-ups

Recommended verdict language if current assumptions hold:

> Helios is integrated to the same manual workspace tier as Pohoda and is ahead on CSV-assisted customer-reported import. Neither Pohoda nor Helios is a runtime/API adapter tier integration; ABRA Flexi is the registered ERP runtime adapter. The remaining proof gap, if any, is authenticated production smoke coverage for Helios attestation and CSV upload, not missing core Helios functionality.

## Files likely to change

For the verification/report-only pass:

- `docs/audits/helios-pohoda-parity-verification.md`

If verification exposes missing parity or proof gaps, possible follow-up files:

### If Pohoda canonical seed hardening is missing

- `lib/workspaces/control-seeds.ts`
- `scripts/seed-pohoda-controls.ts` or a generalized targeted workspace seed script
- `scripts/verify-pohoda-production-seed-readiness.ts`
- `scripts/smoke-pohoda-control-seeding.ts`
- `package.json`
- `docs/operations/pohoda-production-seed-readiness.md`

### If Pohoda CSV backport is desired

- `lib/workspaces/pohoda-csv/parser.ts`
- `lib/workspaces/pohoda-csv/mapping.ts`
- `lib/workspaces/pohoda-csv/importer.ts`
- `lib/workspaces/pohoda-csv/types.ts`
- `app/(app)/workspaces/pohoda/import/*`
- `scripts/smoke-pohoda-csv-parser.ts`
- `scripts/smoke-pohoda-csv-import.ts`
- `tests/fixtures/pohoda/*.csv`
- `messages/*` if UI copy is localized

### If authenticated production smoke is missing

- `scripts/smoke-production-helios-workspace.ts` or extension to existing production smoke scripts
- `scripts/smoke-production-pohoda-workspace.ts` if parity proof should be symmetric
- `package.json`
- `docs/operations/production-workspace-smoke.md`

## Tests / validation

Recommended read-only/local validation commands:

```sh
npm run smoke:pohoda-workspace-config
npm run smoke:helios-workspace-config
npm run smoke:helios-evidence-provenance
npm run smoke:helios-live-attestation
npm run smoke:helios-agency-progress
npm run smoke:helios-csv-parser
npm run smoke:helios-csv-import
npm run smoke:copy-hygiene
npm run typecheck
npm run lint
```

If local-demo browser validation is needed:

```sh
npx playwright test tests/e2e/pohoda-workspace.spec.ts --project=local-demo-chromium
npx playwright test tests/e2e/helios-workspace.spec.ts --project=local-demo-chromium
```

Production checks, only after explicit owner approval if they mutate tenant/evidence state:

```sh
npm run check:production-migration-drift
npm run verify:helios-production-seed-readiness
# possible future command, if implemented:
npm run smoke:production-helios-workspace
```

## Correctness guardrails

### Seed/backfill scope

- Do not run broad `npm run db:seed` for small production data changes.
- Prefer targeted idempotent seeds/backfills.
- State upsert key explicitly:
  - Helios: `controls.key` for `helios-*` controls.
  - Mappings: unique tuple of `frameworkId`, `controlId`, and `articleRef`.
- Re-run behavior must be stable:
  - same controls
  - same mappings
  - no duplicates
  - no unrelated mapping churn
- Any future Pohoda production seed hardening should include a pre-verifier, targeted seed, post-verifier, second run, and exact final verifier comparison, matching the Helios standard.

### Identifier stability

- Treat evidence-referenced keys as immutable.
- `helios-*` keys are already documented as permanent evidence identifiers.
- If adding Pohoda canonical seed guards, add a `POHODA_CANONICAL_CONTROL_KEYS` manifest or equivalent removed-key guard.
- Renames/splits/removals require explicit migration/backfill preserving evidence linkage.

### Evidence provenance

- Manual attestations, customer-reported CSV imports, and automated runtime measurements must remain distinct.
- Do not route CSV imports through an attestation helper solely because it writes evidence rows.
- CSV imports should use a distinct evidence type/source such as `helios_csv_import` or a Pohoda-specific equivalent if backported.
- Snapshot metadata should preserve whether fields are customer-reported, human-reviewed, or measured by Splnit.

### Posture inflation

- Customer-uploaded CSV/template data must not produce `pass` findings by itself.
- Safe CSV-derived states are `manual_review` and `gap`.
- Positive `pass` requires a human-review rule or automated measurement rule.
- This rule applies equally to Helios and any future Pohoda CSV import.

### UI expectation honesty

- If the import uses a Splnit-defined template, say “download/fill our Splnit template” or “CSV-assisted import.”
- Do not say “upload your native Helios/Pohoda export” unless native export formats are implemented and tested for specific editions/versions.
- Avoid “automated Helios evidence,” “live Helios checks,” or “Helios API integration” until a real runtime adapter exists.

### Strategic deferrals

- If Pohoda lacks CSV, label it as a product consistency/GTM deferral, not only a technical backlog item.
- If authenticated production smoke is missing, label it as a proof/compliance readiness gap, not necessarily a product functionality gap.
- If neither Pohoda nor Helios has runtime adapters, say the manual workspace tier is deliberate and lower than ABRA Flexi’s runtime adapter tier.

## Risks and tradeoffs

1. Pohoda may be less hardened than assumed
   - Risk: Helios is now stronger than the reference implementation because it has production seed proof and explicit key guards.
   - Response: state this honestly and plan a Pohoda seed-hardening follow-up.

2. CSV “ahead” can become copy overclaim
   - Risk: users read CSV import as native Helios export automation.
   - Response: keep copy as template/customer-reported/manual-review.

3. Production authenticated smoke mutates state
   - Risk: test evidence can pollute production if not scoped/cleaned.
   - Response: controlled org, explicit cleanup/labeling, owner-approved window.

4. Runtime adapter terminology can confuse buyers
   - Risk: “integration” means live API to some buyers and checklist/import to others.
   - Response: product surfaces should distinguish “workspace/checklist,” “CSV-assisted import,” and “runtime adapter.”

5. Proof asymmetry can be mistaken for feature asymmetry
   - Risk: Pohoda may functionally work but lack recent proof, or vice versa.
   - Response: parity report must separate functionality, test coverage, and production proof.

## Open questions

1. Should the parity report be a repo doc under `docs/audits/`, or should it become a GitHub issue/checklist?
2. Is the goal only to verify and report, or to immediately harden Pohoda if the same seed/proof gaps exist?
3. Should authenticated production smoke be added for Helios only, or for both Helios and Pohoda for symmetric proof?
4. Should Pohoda CSV-assisted import be backported if Helios is confirmed ahead?
5. What production test org should be used for authenticated workspace smokes, and what cleanup/retention policy should apply?

## Recommended next action

Run the verification report pass first. Do not implement Pohoda CSV or production smokes in the same branch.

Suggested deliverable:

- `docs/audits/helios-pohoda-parity-verification.md`

Suggested conclusion format:

- `FUNCTIONAL_PARITY_CONFIRMED`
- `HELIOS_AHEAD_ON_CSV`
- `RUNTIME_ADAPTER_NOT_IN_SCOPE_FOR_BOTH`
- `PRODUCTION_AUTH_SMOKE_MISSING_OR_CONFIRMED`
- `POHODA_SEED_HARDENING_NEEDED_OR_NOT_NEEDED`
