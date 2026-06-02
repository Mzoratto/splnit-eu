# Entire-codebase audit Lane 08: Test Coverage, Smoke Reliability, CI, Harness Health

Created: 2026-06-02
Mode: audit only; no implementation, no commit, no push, no deploy, no production DB/Blob writes.

## Scope and exclusions

Scope audited:
- Test and smoke entry points in `package.json`.
- Smoke scripts under `scripts/**`, with emphasis on source-only vs runtime/DB/prod-sensitive behavior.
- Playwright harness in `playwright.config.ts` and `tests/e2e/**`.
- CI/pipeline coverage in `.github/workflows/**` and `.woodpecker/vercel.yml`.
- Existing audit/verification evidence under `.hermes/state/**`, `docs/audits/**`, and `docs/verification/**`.

Exclusions observed:
- Did not run commands that would use the live Neon `DATABASE_URL` inherited from `.env.local`, live Clerk/Stripe/Blob/OpenAI credentials, or production URLs.
- Did not run `npm run test:e2e:local-demo` locally because the repository's `.env.local` contains a non-local Neon `DATABASE_URL`; Playwright local-demo would inherit it unless explicitly overridden.
- Did not run `db:migrate`, `db:seed`, import/promote scripts, live-key smokes, production readiness smokes, deploy, or Woodpecker production pipeline.
- Did not implement fixes or create commits.

## Files/directories inspected

Primary:
- `AGENTS.md`
- `.hermes/plans/2026-06-02_094729-lane-08-tests-ci-harness.md`
- `.hermes/state/entire-codebase-audit-ledger.md`
- `package.json`
- `playwright.config.ts`
- `tests/e2e/**`
- `scripts/**` sampled for smoke safety and RED/self-tests
- `.github/workflows/e2e.yml`
- `.github/workflows/product-safety.yml`
- `.github/workflows/knowledge-layer.yml`
- `.github/workflows/production-migration-drift.yml`
- `.github/workflows/lighthouse.yml`
- `.github/workflows/codeql.yml`
- `.woodpecker/vercel.yml`
- `test-results/.last-run.json`

Representative script files read:
- `scripts/run-production-migrations-safe.ts`
- `scripts/check-production-migration-drift.ts`
- `scripts/smoke-production-tenant-readiness.ts`
- `scripts/smoke-stripe-billing-runtime.ts`
- `scripts/smoke-demo-routes.ts`
- `scripts/smoke-i18n-shell.ts`
- `scripts/smoke-copy-hygiene.ts`
- `scripts/smoke-trust-center-public-disclosure.ts`
- `scripts/lint-intake-prioritization-copy.ts`

## Commands run and results

Worktree/status discovery:
- `git status --short` before audit showed pre-existing dirty/untracked audit/doc files:
  - `M docs/README.md`
  - `?? .hermes/state/entire-codebase-audit-ledger.md`
  - existing lane reports under `docs/audits/**`
  - `?? docs/product/implementation-gap-audit.md`
- Count script confirmed: `scripts=129`, `tests=31`, `tests/e2e=26`, `.github/workflows=6`, `.woodpecker=1`, `docs/verification=1`, `docs/audits=18`.

Package/test inventory:
- Parsed `package.json`: 152 npm scripts, 88 `smoke:*` scripts, 8 `test:e2e*` scripts, 3 `ci:*` scripts.
- Sensitive script-name scan identified production/DB/live/import/promote/deploy candidates including `deploy`, `db:migrate:production`, `check:production-migration-drift`, `db:migrate`, `db:seed`, `seed:helios-controls`, `knowledge:import:*`, `knowledge:promote:*`, `agent:review:promote`, live-key smokes, production readiness smokes, and controlled-mailbox checks.

Verification commands actually executed:
- `npm run typecheck` -> PASS, exit 0, 9s.
- `npm run lint` -> PASS, exit 0, 12s.
- `npm run smoke:production-migration-guard` -> PASS, exit 0; output: `Production migration guard self-test passed.`
- `npm run smoke:activation-status` -> FAIL, exit 1; next-intl provider/harness failure in `components/activation/activation-status.tsx`, matching T0 known starting point.
- `npm run smoke:demo-routes` -> FAIL, exit 1; `fetch failed`, `ECONNREFUSED 127.0.0.1:3000`; pre-existing harness expectation that a server is already running.
- `npm run test:e2e:public` before build -> FAIL; Playwright webServer could not start because `.next` production build was missing.
- `npm run build && npm run test:e2e:public` -> PASS; build passed, then public Playwright suite ran 60 tests across desktop/mobile and all 60 passed in 6.7s.

Local/prod DB safety discovery:
- `.env.local` exists and contains keys including `DATABASE_URL`, Clerk, Resend, Blob, OpenAI, Stripe, AWS, Sentry, cron, Inngest, and other live-capable credentials.
- Redacted classification of inherited `DATABASE_URL`: `postgresql://ep-shy-poetry-alzdu6ud-pooler.c-3.eu-central-1.aws.neon.tech/neondb` (non-local Neon host). This is why DB-mutating local smokes and local-demo E2E were not run without an explicit local override.

T0 baseline incorporated:
- Standard T0 baseline in ledger: `npm run typecheck` pass, `npm run lint` pass, `npm run build` pass.
- T0 smoke failures already recorded: `smoke:i18n-shell`, `smoke:intake-scope`, `smoke:activation-status`, `smoke:demo-routes`, `smoke:italian-tenant`, `smoke:italian-gdpr-layer`, `smoke:tenant-locales`, `smoke:italian-nis2-layer`, `smoke:nis2-evidence-templates`.
- T0 blocked production/live smokes: Stripe runtime/upgrades/invoice, Hetzner/AWS live keys, authenticated/production tenant readiness, production migration drift/guard except self-test variants.

## Classification: implemented / partial / blocked / absent

Implemented:
- Static quality gates exist and pass locally: `typecheck`, `lint`, `build`.
- Public Playwright coverage is meaningful for public legal pages, pricing, navigation shell, protected-route containment, readiness, security headers, API auth boundaries, cron scheduling, and service-worker private-cache guard.
- CI has separate workflows for product safety, E2E, knowledge layer, Lighthouse, production migration drift, and CodeQL.
- Production migration wrapper has a real self-test and strong guardrails: explicit confirmation token, non-local DB requirement, dirty migration-source refusal, landed-HEAD requirement, migration hash/baseline reproducibility check, and dry self-test path.
- Some copy/proof guards include RED/self-test style samples, e.g. Helios claim guard self-test in `smoke-copy-hygiene.ts`, Trust Center public disclosure source assertions, invalid Stripe webhook event, invalid plan gate, agency model rejection tests, connector invalid-key mappings, and production migration guard self-test.
- CI E2E uses a local Postgres service and explicitly prepares local demo data with `db:migrate && seed:helios-controls` before local-demo E2E.

Partial:
- Smoke taxonomy is implicit in 88 npm `smoke:*` names and T0 audit notes, not encoded as first-class metadata. There is no single safe command for all source-only smokes and no manifest that declares `source-only`, `local-db`, `external-live`, `production-read-only`, or `production-mutating` behavior.
- Several DB-mutating smokes are named like ordinary smoke tests and can inherit `.env.local` non-local Neon credentials if run locally. Some clean up their smoke orgs, but local/prod safety depends on operator discipline and script-specific checks rather than a common DB-target guard.
- `smoke:demo-routes` is a runtime smoke but package naming does not say it requires a running server. It defaults to port 3000 and fails with `ECONNREFUSED` if no server is up.
- `test:e2e:public` is a runnable E2E command only after `npm run build`; the script itself does not build or provide a preflight. CI is correct because it builds first, but local harness behavior is surprising.
- Product-safety CI includes `smoke:i18n-shell`, which T0 says is failing. That makes the intended gate good in principle but currently red until the i18n assertions/copy are reconciled.
- Knowledge-layer CI is useful but combines `db:migrate`, `db:seed`, imports, and knowledge smokes. It is safe in GitHub Actions because `DATABASE_URL` points at service Postgres, but unsafe to run locally without a local DB override because `.env.local` can be non-local.
- Authenticated and production readiness E2E/smokes exist but are intentionally env/prod-sensitive and not regular CI gates.

Blocked from safe audit execution:
- `npm run test:e2e:local-demo` locally, because current shell/.env loads a non-local Neon `DATABASE_URL`; running it would risk touching non-local data.
- DB/import/promote scripts and DB-backed smokes without a local override.
- Production readiness, live-key, Stripe live/runtime, controlled mailbox, deploy, and Woodpecker production flow.

Absent:
- No standard unit-test runner (`vitest`, `jest`, or Node test runner) and no `test` script. Most non-E2E verification is hand-written `tsx scripts/smoke-*.ts`.
- No smoke manifest or harness wrapper that refuses non-local DBs for local smoke groups by default.
- No CI job that validates every smoke script can be classified or that every production/live script has a self-test/guard.
- No CI gate that runs all source-only smokes as a stable group.
- No deterministic flaky-selector lint or selector policy. Playwright tests use a mixture of role/label/testid selectors and some broader locators; there is no automated check for `waitForTimeout`, `nth`, `first`, fragile text-only selectors, or missing accessible names.
- No local Playwright preflight command that builds if necessary or errors with a clearer message before `next start` fails.

## Known smoke failures and lane classification

Pre-existing T0 failures, not newly caused by Lane 08:
- `smoke:i18n-shell`: assertion mismatch in localization shell/copy expectations.
- `smoke:intake-scope`: assertion mismatch in intake scope expectations.
- `smoke:activation-status`: next-intl provider harness failure; reproduced in this lane.
- `smoke:demo-routes`: runtime server missing/default port harness failure; reproduced in this lane as `ECONNREFUSED 127.0.0.1:3000`.
- `smoke:italian-tenant` / `smoke:tenant-locales`: expected English/NÚKIB feed wording mismatch.
- `smoke:italian-gdpr-layer`: expected GDPR layer data missing/undefined.
- `smoke:italian-nis2-layer`: expected 44 NIS2 items but got 0.
- `smoke:nis2-evidence-templates`: expected empty diff but got array mismatch.

Lane 08 findings derived from those failures:
- The failures are visible in T0 and at least two are reproducible locally, but the harness does not classify them by safety/type or route them into appropriate CI groups.
- `ci:product-safety` includes at least one known-red smoke (`smoke:i18n-shell`), so current CI either blocks product-safety changes or is not being treated as a required passing gate.
- `smoke:demo-routes` should not be grouped with source-only smokes; it is a runtime HTTP smoke and needs a server lifecycle wrapper or explicit naming.

## Security/compliance/proof-boundary notes

- Production DB migration safety is stronger than average in `run-production-migrations-safe.ts`: confirmation token, non-local-only target, clean migration source, landed HEAD, hash comparison, reproducibility read-only baseline, and self-test.
- `check-production-migration-drift.ts` is read-only but accepts broad fallback env names including non-production `DATABASE_URL`; this is useful in CI/local with `--allow-local`, but the script name says production and local `.env.local` can point at a Neon database. Human/operator clarity is still required.
- Woodpecker production deploy runs `npm run db:migrate` after `vercel pull --environment=production`, not `npm run db:migrate:production` or the checked wrapper. This bypasses the explicit confirmation/hash/landed-head production migration guard that `package.json` deploy uses via `predeploy`.
- Several live/prod smokes intentionally touch production systems and Blob/Clerk/Resend; they have asserts for required envs and some target compatibility checks, but they are not isolated behind a common production confirmation wrapper.
- Public proof-boundary source guards exist for Trust Center disclosure and copy hygiene, including RED-like samples for Helios automation claims. This is good but scattered and not enforced as a complete source-only smoke suite.

## Top risks

1. Woodpecker deploy bypasses the safer production migration wrapper.
   - Evidence: `.woodpecker/vercel.yml` runs `vercel pull --environment=production`, then `npm run db:migrate`, then `vercel build --prod` and deploy.
   - Impact: production migration can run without the explicit production migration confirmation, landed-HEAD check, dirty-source check, or hash reproducibility check.

2. Local DB-mutating smokes can inherit a non-local Neon `DATABASE_URL`.
   - Evidence: `.env.local` contains non-local Neon `DATABASE_URL`; many smoke/import/seed scripts use `getDb()`/Drizzle/Neon and are exposed as normal npm scripts.
   - Impact: accidental writes/deletes/imports against non-local data by developers or agents.

3. Smoke taxonomy is absent.
   - Evidence: 88 `smoke:*` scripts but no manifest/wrapper that declares safety class, runtime requirements, env requirements, or CI group membership.
   - Impact: known-red, runtime, local-DB, and production/live smokes are mixed by name; difficult to run the right checks safely.

4. Known-red smokes are in or adjacent to CI gates.
   - Evidence: T0 `smoke:i18n-shell` fails and `ci:product-safety` invokes it.
   - Impact: either CI is red/noisy, or required-gate policy is being bypassed/ignored.

5. Playwright local harness has hidden prerequisites.
   - Evidence: `test:e2e:public` failed before build because `next start` requires `.next`; passing run required `npm run build` first. `test:e2e:local-demo` also needs a safe local DB, migrations, and seed data.
   - Impact: local verification failures are easy to misread as product regressions.

6. Unit-level coverage is absent.
   - Evidence: no `test` script or unit-test runner; verification depends on smoke scripts and E2E.
   - Impact: many domain rules are tested through ad hoc scripts rather than maintainable RED/GREEN unit tests.

7. Selector and flake controls are informal.
   - Evidence: tests use role/label/testid selectors, but no linter/policy enforces stable selectors; helper contains `waitForTimeout` retry delay; broad locators/text selectors are present across e2e suite.
   - Impact: UI copy/localization changes can break tests unnecessarily, while true accessibility/test-id gaps are not systematically caught.

## Recommended implementation slices

### Slice 1: Smoke taxonomy manifest and safe runner

Goal:
- Add a manifest that classifies all `smoke:*` scripts by safety and requirements, plus a wrapper that refuses unsafe groups unless explicit env confirms the target.

Likely files:
- `package.json`
- `scripts/smoke-manifest.ts` or `scripts/smoke-manifest.json`
- `scripts/run-smoke-group.ts`
- Existing smoke scripts only where metadata exposes missing guard problems.

RED command:
- `npm run smoke:manifest:self-test` should fail if any `smoke:*` package script is missing from the manifest or any DB/live/prod smoke lacks a target class.

GREEN command:
- `npm run smoke:source-only` runs only source-only/non-DB smokes.
- `npm run smoke:manifest:self-test` passes.

Rollback/feature flag:
- No product behavior changes; remove manifest/wrapper scripts and package entries if needed.

Existing data migration/backfill:
- None.

Human approval:
- Required to decide which prod/live smokes are allowed to remain direct npm scripts vs wrapper-only.

### Slice 2: Common DB-target guard for local smoke/import/seed scripts

Goal:
- Prevent accidental writes to non-local DBs from smoke/import/seed scripts unless explicitly confirmed.

Likely files:
- `scripts/lib/db-target-guard.ts` (new)
- DB-mutating smoke/import/seed scripts using `getDb()`
- `package.json` for self-test command

RED command:
- A self-test with fake URLs proves local URLs pass, Neon/non-local URLs fail by default, and explicit confirmation is required for non-local.

GREEN command:
- `npm run smoke:db-target-guard:self-test` passes.
- Representative DB smoke with `DATABASE_URL=postgresql://user:pass@127.0.0.1:5432/db` passes target preflight.

Rollback/feature flag:
- Guard can be bypassed only by a clearly named env such as `SPLNIT_ALLOW_NONLOCAL_SMOKE_DB=I_UNDERSTAND_NONLOCAL_WRITES` after human approval.

Existing data migration/backfill:
- None.

Human approval:
- Required for bypass env name/value and whether production readiness smokes remain exempt.

### Slice 3: Repair known-red source/runtime smoke harnesses

Goal:
- Fix or explicitly quarantine known T0 smoke failures so CI groups are trustworthy.

Likely files:
- `scripts/smoke-i18n-shell.ts`
- `scripts/smoke-intake-scope.ts`
- `scripts/smoke-activation-status.tsx`
- `scripts/smoke-demo-routes.ts`
- Italian/tenant/knowledge smoke scripts and source fixtures as needed
- `package.json`

RED command:
- Current failing commands: `npm run smoke:i18n-shell`, `npm run smoke:intake-scope`, `npm run smoke:activation-status`, `npm run smoke:demo-routes`, `npm run smoke:tenant-locales`, `npm run smoke:italian-gdpr-layer`, `npm run smoke:italian-nis2-layer`, `npm run smoke:nis2-evidence-templates`.

GREEN command:
- Same commands pass in their intended safety class, or are renamed/moved to a quarantined non-CI group with documented expected failure.

Rollback/feature flag:
- No product behavior changes unless copy/source assertions reveal real product fixes; rollback script-only harness changes independently.

Existing data migration/backfill:
- None unless knowledge layer fixtures change; if DB knowledge data changes, verifier must use isolated local CI DB.

Human approval:
- Required for legal/localization copy expectation changes and knowledge/proof-boundary changes.

### Slice 4: Align production deploy migration safety

Goal:
- Ensure production deploy paths use the safe production migration wrapper or explicitly document a safer equivalent.

Likely files:
- `.woodpecker/vercel.yml`
- `package.json`
- `scripts/run-production-migrations-safe.ts` if Woodpecker env integration needs a noninteractive mode

RED command:
- Static source smoke fails while `.woodpecker/vercel.yml` contains `npm run db:migrate` after `vercel pull --environment=production`.

GREEN command:
- Static smoke passes when Woodpecker uses `npm run db:migrate:production` with required confirmation/secret or another checked wrapper.

Rollback/feature flag:
- Revert Woodpecker command only; no application behavior change.

Existing data migration/backfill:
- None.

Human approval:
- Required because this changes production deployment behavior.

### Slice 5: Playwright local preflight and selector hygiene

Goal:
- Make E2E local commands self-explanatory and reduce flake.

Likely files:
- `package.json`
- `playwright.config.ts`
- `tests/e2e/helpers.ts`
- New script such as `scripts/playwright-preflight.ts`
- Optional selector-lint script for `tests/e2e/**`

RED command:
- `npm run test:e2e:public` on a clean checkout without `.next` currently fails with Next's missing-build error.
- Selector lint self-test catches intentionally bad patterns in a fixture.

GREEN command:
- Public E2E command either builds first or fails with a clear preflight message.
- Selector lint passes and catches fixture bad selectors/`waitForTimeout` outside allowed helper retry.

Rollback/feature flag:
- Revert script/config changes; no product data changes.

Existing data migration/backfill:
- None.

Human approval:
- Not required unless CI runtime/cost changes materially.

## Test/validation matrix

Minimum safe local/static gates:
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run smoke:production-migration-guard`
- Future: `npm run smoke:manifest:self-test`
- Future: `npm run smoke:source-only`

Runtime public gates:
- `npm run build && npm run test:e2e:public`
- `npm run smoke:demo-routes` only with a managed local server and explicit base URL/port.

Local DB gates, isolated DB only:
- `DATABASE_URL=postgresql://...localhost... npm run db:migrate`
- `DATABASE_URL=postgresql://...localhost... npm run db:seed`
- `DATABASE_URL=postgresql://...localhost... npm run test:e2e:local-demo`
- DB-backed smoke groups after common DB-target guard is in place.

Production/live gates, human-approved only:
- `npm run check:production-migration-drift` with production read-only URL.
- `npm run db:migrate:production` only with explicit confirmation and landed clean HEAD.
- Production tenant readiness/live-key/Stripe/Blob/controlled-mailbox smokes only with approved credentials and cleanup plan.

CI gates recommended as required checks:
- Product safety, but only after known-red `smoke:i18n-shell` and related source smokes are fixed or quarantined.
- Public E2E.
- Local-demo E2E with CI local Postgres.
- Knowledge layer with CI local Postgres.
- CodeQL.
- Production migration drift on main only.
- Lighthouse as non-blocking or blocking depending on performance budget maturity.

## Human approval items

- Whether Woodpecker should switch from `npm run db:migrate` to the safe production migration wrapper and what secrets/confirmation should be used.
- Which smoke classes may ever touch non-local DBs and what explicit confirmation string is acceptable.
- Whether live production readiness smokes may create/delete production organisations and Blob objects, and under what schedule.
- Public legal/localization/claim-boundary decisions for fixing known-red copy and knowledge-layer smokes.
- Whether authenticated E2E should be introduced as a regular CI gate with test Clerk credentials.

## Final lane status

Lane 08 status: PARTIAL.

Reason:
- Core static and public E2E gates pass when prerequisites are satisfied.
- CI coverage exists and is more complete than a basic setup.
- However, smoke taxonomy is missing, known-red smokes are present, local DB safety is not centralized, Woodpecker production migration safety is weaker than the npm deploy wrapper, and local E2E/runtime smoke commands have hidden prerequisites.
