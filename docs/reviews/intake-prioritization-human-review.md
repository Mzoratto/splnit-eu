# Intake prioritization production-readiness review

Date: 2026-05-17
Reviewer: Marco Zoratto
Status: Pending human review
Decision: Pending — do not rely on this intake prioritization path in production until this checklist is completed.

## Scope freeze

- [ ] Intake feature scope is frozen for this gate.
- [ ] Only review-blocking copy, behavior, or production-readiness fixes are allowed before sign-off.
- [ ] New intake capabilities are deferred until after this review unless needed to fix a blocker.

## Scenario tested

Record the tenant/profile used for review without exposing secrets or private customer data.

- Tenant/org:
- Locale(s):
- Framework(s):
- Intake scenario:
  - [ ] Tiny SME / low complexity
  - [ ] SaaS / cloud tools
  - [ ] Manufacturing / operational technology or supplier exposure
  - [ ] Healthcare / sensitive data
  - [ ] Empty or weak intake answers
- Notes:

## Screens and states reviewed

- [ ] Intake summary with priority gaps.
- [ ] Controls index default view.
- [ ] Controls index with out-of-scope / not-applicable filter enabled.
- [ ] At least one control shown as in-scope by default.
- [ ] At least one control marked out-of-scope.
- [ ] At least one control marked not applicable.
- [ ] Empty or weak intake answer state.
- [ ] Mobile width checked for overflow/overlap.
- [ ] Desktop width checked for overflow/overlap.

## Copy review

### “Priority gaps based on your intake”

Decision:

- [ ] Accept as-is.
- [ ] Revise before production.
- [ ] Blocker.

Review notes:

- Does it sound helpful rather than overclaiming?
- Does it avoid implying a legal determination?
- Does it avoid claiming compliance, completeness, or certification?

### “Out of scope / not applicable”

Decision:

- [ ] Accept as-is.
- [ ] Revise before production.
- [ ] Blocker.

Review notes:

- Is it clearly different from “done” or “compliant”?
- Does it read as conditional on intake answers?
- Is it reversible if intake changes?

### “Reason from intake”

Decision:

- [ ] Accept as-is.
- [ ] Revise before production.
- [ ] Blocker.

Review notes:

- Does it explain the classification plainly?
- Does it avoid sounding like legal advice?
- Does it avoid exposing unnecessary implementation details?

## Behavior review

- [ ] Controls index defaults to in-scope controls.
- [ ] Out-of-scope/not-applicable controls are hidden by default.
- [ ] Out-of-scope/not-applicable controls are reachable through a deliberate filter.
- [ ] Filter state is understandable.
- [ ] Classification rationale is visible where useful but not overexposed.
- [ ] Existing orgs without intake profiles still load dashboard and controls.
- [ ] No UI implies that intake classification alone means the org is compliant.

Behavior notes:

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
- [ ] Verify production app can read/write intake profile data.
- [x] Verify missing migration does not silently produce a misleading empty state through a drift guard.
- [ ] Run targeted production/staging smoke for the intake-dependent path.

Production migration notes:

- 2026-05-17 read-only production check used Vercel Production env injection and a non-pooled Neon URL without printing credentials.
- Production DB host class: Neon / non-local.
- Production now has 18 applied Drizzle migrations, matching the repo journal through `0017_wakeful_thunderbolt`.
- `org_intake_profiles` migration is applied in production.
- `vercel project inspect` reports Build Command as `npm run build` or `next build`; no migration-running build override is configured in Vercel project settings.
- Added automated guard: `npm run check:production-migration-drift` reads the Drizzle journal, checks production `drizzle.__drizzle_migrations` read-only, and exits non-zero on drift. GitHub Actions workflow `.github/workflows/production-migration-drift.yml` runs it on pushes to `main` when `PRODUCTION_DATABASE_URL_UNPOOLED` is configured as a repo secret, and skips explicitly when the secret is absent.
- Conclusion: schema drift is not currently blocking intake prioritization, but the production app still needs a targeted read/write smoke before relying on the path for buyer-facing production use.

## Issues found

### Must fix before production reliance

- [x] Controls index default filter previously used `all`, which would include out-of-scope/not-applicable controls by default. Fixed on 2026-05-17 by making `/controls` default to in-scope controls and reserving out-of-scope/not-applicable controls for `?scope=out-of-scope`.
- [ ] Production app read/write smoke is still required before production reliance, even though schema migration drift is now clear.

### Can defer

- [ ]

## Final sign-off

Decision:

- [ ] Approved.
- [ ] Approved with listed fixes.
- [ ] Not approved.

Sign-off notes:

## Next roadmap step after approval

After this review passes and production migration readiness is verified, move to Policy-to-Evidence Loop definition. Do not add more intake behavior unless this review finds a blocking issue.

Minimum Policy-to-Evidence Loop definition before coding:

- [ ] Select one buyer-useful policy/control gap flow.
- [ ] Define recommended policy/evidence action.
- [ ] Define evidence collection state.
- [ ] Define honest proof/status wording.
- [ ] Define explicit v1 non-goals.
- [ ] Write implementation plan before coding.
