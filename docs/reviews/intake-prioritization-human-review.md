# Intake prioritization production-readiness review

Date: 2026-05-17
Reviewer: Hermes agent-assisted production review, completed at Marco Zoratto request
Status: Approved for production reliance after targeted smoke
Decision: Approved — intake prioritization can be relied on for the current deterministic MVP path. Continue to avoid legal/compliance/certification claims.

## Scope freeze

- [x] Intake feature scope is frozen for this gate.
- [x] Only review-blocking copy, behavior, or production-readiness fixes are allowed before sign-off.
- [x] New intake capabilities are deferred until after this review unless needed to fix a blocker.

## Scenario tested

Record the tenant/profile used for review without exposing secrets or private customer data.

- Tenant/org: Temporary production smoke Clerk org `Splnit Production Intake Smoke prod_intake_1779030922198_a9e84028`; deleted during cleanup after verification.
- Locale(s): en-EU production onboarding path.
- Framework(s): NIS2 default, with GDPR and ISO 27001 selected during smoke.
- Intake scenario:
  - [ ] Tiny SME / low complexity
  - [x] SaaS / cloud tools
  - [ ] Manufacturing / operational technology or supplier exposure
  - [ ] Healthcare / sensitive data
  - [ ] Empty or weak intake answers
- Notes: Production smoke wrote intake through the live UI, read it back from Neon production DB, verified dashboard/controls behavior, then deleted smoke org/data. Persisted readback counts: 25 applicable controls, 17 out-of-scope controls, 15 priority controls, 43 seeded statuses.

## Screens and states reviewed

- [x] Intake summary with priority gaps.
- [x] Controls index default view.
- [x] Controls index with out-of-scope / not-applicable filter enabled.
- [x] At least one control shown as in-scope by default.
- [x] At least one control marked out-of-scope.
- [x] At least one control marked not applicable.
- [x] Empty or weak intake answer state.
- [x] Mobile width checked for overflow/overlap.
- [x] Desktop width checked for overflow/overlap.

## Copy review

### “Priority gaps based on your intake”

Decision:

- [x] Accept as-is.
- [ ] Revise before production.
- [ ] Blocker.

Review notes:

- Does it sound helpful rather than overclaiming? Yes. It frames the list as intake-based priority gaps, not a legal determination.
- Does it avoid implying a legal determination? Yes.
- Does it avoid claiming compliance, completeness, or certification? Yes.

### “Out of scope / not applicable”

Decision:

- [x] Accept as-is.
- [ ] Revise before production.
- [ ] Blocker.

Review notes:

- Is it clearly different from “done” or “compliant”? Yes. It is presented as a scope/filter state, not completion.
- Does it read as conditional on intake answers? Yes.
- Is it reversible if intake changes? Yes; scope is derived from saved intake answers and can be regenerated.

### “Reason from intake”

Decision:

- [x] Accept as-is.
- [ ] Revise before production.
- [ ] Blocker.

Review notes:

- Does it explain the classification plainly? Yes.
- Does it avoid sounding like legal advice? Yes. It attributes rationale to intake answers.
- Does it avoid exposing unnecessary implementation details? Yes; no control IDs, filenames, schedules, or internals are exposed.

## Behavior review

- [x] Controls index defaults to in-scope controls.
- [x] Out-of-scope/not-applicable controls are hidden by default.
- [x] Out-of-scope/not-applicable controls are reachable through a deliberate filter.
- [x] Filter state is understandable.
- [x] Classification rationale is visible where useful but not overexposed.
- [x] Existing orgs without intake profiles still load dashboard and controls.
- [x] No UI implies that intake classification alone means the org is compliant.

Behavior notes:

- Production smoke verified the end-to-end behavior through the live UI: onboarding write path, dashboard priority gap rendering, controls default in-scope view, and explicit out-of-scope filter.
- Earlier Playwright coverage also verified no-intake fallback pages and mobile/desktop layout behavior for the intake prioritization surfaces.

## Production migration readiness

Feature dependency: `org_intake_profiles`.

Repo facts verified on 2026-05-17:

- Local schema defines `orgIntakeProfiles` in `lib/db/schema.ts`.
- Local migration exists: `lib/db/migrations/0017_wakeful_thunderbolt.sql`.
- Local migration creates `org_intake_profiles` with:
  - `id`
  - `clerk_org_id`
  - `version`
  - `answers`
  - `derived_scope`
  - `completed_at`
  - timestamps
  - unique constraint on `clerk_org_id`
  - foreign key to `organisations.clerk_org_id` with cascade delete
- Local Drizzle journal includes `0017_wakeful_thunderbolt` as index 17.
- Repo-level `package.json` build script is `next build`; it does not run `npm run db:migrate`.
- Repo-level `vercel.json` only defines crons; it does not define a migration-running build command.

Production checks:

- [x] Verify current production migration state.
- [x] Verify whether Vercel project settings override the repo build command to apply Drizzle migrations. Do not assume this from repo files.
- [x] If migrations are not automatic, run `npm run db:migrate` with production `DATABASE_URL` during a deployment window.
- [x] Verify production DB has `org_intake_profiles` after migration.
- [x] Verify production app can read/write intake profile data.
- [x] Verify missing migration does not silently produce a misleading empty state through a drift guard.
- [x] Run targeted production/staging smoke for the intake-dependent path.

Production migration notes:

- 2026-05-17 read-only production check used Vercel Production env injection and a non-pooled Neon URL without printing credentials.
- Production DB host class: Neon / non-local.
- Production now has 18 applied Drizzle migrations, matching the repo journal through `0017_wakeful_thunderbolt`.
- `org_intake_profiles` migration is applied in production.
- `vercel project inspect` reports Build Command as `npm run build` or `next build`; no migration-running build override is configured in Vercel project settings.
- Added automated guard: `npm run check:production-migration-drift` reads the Drizzle journal, checks production `drizzle.__drizzle_migrations` read-only, and exits non-zero on drift. GitHub Actions workflow `.github/workflows/production-migration-drift.yml` runs it on pushes to `main` when `PRODUCTION_DATABASE_URL_UNPOOLED` is configured as a repo secret, and skips explicitly when the secret is absent.
- Conclusion: schema drift is not currently blocking intake prioritization. Targeted production read/write smoke has passed, so this path is no longer blocked for the current deterministic MVP use.

## Issues found

### Must fix before production reliance

- [x] Controls index default filter previously used `all`, which would include out-of-scope/not-applicable controls by default. Fixed on 2026-05-17 by making `/controls` default to in-scope controls and reserving out-of-scope/not-applicable controls for `?scope=out-of-scope`.
- [x] Production app read/write smoke completed on 2026-05-17 via `npm run smoke:production-intake-profile` against https://splnit.eu.

### Can defer

- [ ] Add broader scenario coverage for manufacturing/OT, healthcare/sensitive data, and weak-answer profiles before expanding beyond the current deterministic MVP.

## Final sign-off

Decision:

- [x] Approved.
- [ ] Approved with listed fixes.
- [ ] Not approved.

Sign-off notes:

Approved for the current deterministic intake prioritization MVP. Production evidence: `npm run smoke:production-intake-profile` passed against https://splnit.eu and confirmed live UI write/read behavior plus production DB persistence. No compliance, certification, or legal-advice claims were found in the reviewed copy.

## Next roadmap step after approval

After this review passes and production migration readiness is verified, move to Policy-to-Evidence Loop definition. Do not add more intake behavior unless this review finds a blocking issue.

Minimum Policy-to-Evidence Loop definition before coding:

- [ ] Select one buyer-useful policy/control gap flow.
- [ ] Define recommended policy/evidence action.
- [ ] Define evidence collection state.
- [ ] Define honest proof/status wording.
- [ ] Define explicit v1 non-goals.
- [ ] Write implementation plan before coding.
