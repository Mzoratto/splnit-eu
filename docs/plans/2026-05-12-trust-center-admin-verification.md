# Trust Center Admin Verification Implementation Plan

> **For Hermes:** Use subagent-driven-development skill only if implementation becomes multi-file or parallel. Start with the audit tasks first; do not implement speculative fixes before reproducing a gap.

**Goal:** Verify that Trust Center admin settings correctly persist and drive the public Trust Center experience for saved slug behavior, visibility toggles, admin/public consistency, and public framework pages.

**Architecture:** Treat this as an audit-first hardening pass. Validate the authenticated admin settings surface at `app/(app)/trust-center`, the server actions that persist settings, the DB query/model layer that serves public Trust Center pages, and the public routes under `app/(marketing)/trust/[orgSlug]`. Implement only narrow fixes for reproduced gaps.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Clerk organisations, Drizzle ORM, Neon/Postgres, Playwright, next-intl.

---

## Task Description

PROJECT_PLAN.md identifies Trust Center admin verification as the current first work item before new features or broader outreach. The work must verify that an authenticated organisation admin can save Trust Center settings, publish or unpublish the Trust Center, select visible frameworks, toggle public detail/percentage visibility, and open public pages that match the saved admin state.

The plan starts with source-level and runtime audit steps, then adds narrow implementation tasks only for confirmed defects. Public Trust Center pages must remain category-level and must not expose individual control IDs, evidence filenames, test timing details, or attacker-useful implementation details.

## Objective

When this plan is complete, Splnit.eu has documented and tested confidence that Trust Center admin settings persist correctly and produce honest, buyer-safe public Trust Center pages for the current production-readiness path.

## PROJECT_PLAN.md Alignment

- Source priority item: `PROJECT_PLAN.md` Next Work Order item 1, "Trust Center admin verification".
- Current blocker or risk addressed: Trust Center admin slug behavior, visibility toggles, admin/public consistency, and public framework pages are explicitly called out as core app hardening risks.
- Why this is next: Prospects will see the Trust Center first; broken or misleading public Trust Center behavior kills trust before outreach conversations can proceed.
- Related standing blockers: Legal/customer-facing claims remain draft unless reviewed; no fake proof, fake customers, certifications, or auditor-ready claims.
- Out of scope:
  - Demo-vs-live clarity overhaul except where it blocks Trust Center admin verification.
  - Integration UI polish.
  - Questionnaire flow trace.
  - Audit/export endpoint smokes.
  - Legal identity closeout.
  - New Trust Center features beyond narrow bug fixes.
- Product/legal honesty constraints:
  - Do not expose individual control IDs, evidence filenames, test timing details, or implementation details publicly.
  - Do not claim certification, legal review, auditor readiness, customer proof, or production uptime unless the repo and configured runtime prove it.
  - Do not use `Splnit Technology s.r.o.`.

## Problem Statement

The product has Trust Center admin and public routes, but PROJECT_PLAN.md still marks Trust Center admin slug behavior and admin/public consistency as needing verification. The current risk is not only whether the form renders; it is whether saved settings survive reloads, publish/unpublish behavior matches public route availability, selected frameworks are the only public frameworks shown, detail pages obey drilldown access, score visibility obeys admin toggles, and public pages stay safe for buyer-facing conversations.

## Solution / Investigation Approach

1. Inspect the existing Trust Center admin, server action, DB query, public model, and public route code.
2. Run the existing slug/settings smoke test.
3. Add or extend narrow automated coverage for settings persistence and public model behavior.
4. Add Playwright coverage for admin/public UX if the test environment supports authenticated org setup.
5. Manually verify local runtime behavior with a live development database and Clerk org where available.
6. Fix only reproduced defects.
7. Document remaining gaps in an audit note instead of pretending unverified paths are ready.

## Relevant Files

- `PROJECT_PLAN.md`
  - Canonical project priority and hard constraints.
- `AGENTS.md`
  - Repository operating instructions and Trust Center public disclosure constraints.
- `app/(app)/trust-center/page.tsx`
  - Authenticated Trust Center admin settings page. Contains slug input, publish toggle, NDA toggle, framework detail toggle, percentage toggle, visible framework checkboxes, and request approval/decline UI.
- `app/(app)/trust-center/actions.ts`
  - Server actions for updating settings and approving/declining Trust Center requests.
- `lib/trust-center/settings.ts`
  - Slug normalization and reserved-slug rules.
- `scripts/smoke-trust-center-settings.ts`
  - Existing slug/settings smoke script.
- `lib/db/queries/trust-center.ts`
  - Settings load/upsert and public Trust Center DB access.
- `lib/trust-center/public-model.ts`
  - Public Trust Center model assembly, demo model, Splnit model, access/drilldown/percentage logic.
- `app/(marketing)/trust/[orgSlug]/page.tsx`
  - Public Trust Center overview page.
- `app/(marketing)/trust/[orgSlug]/frameworks/[frameworkSlug]/page.tsx`
  - Public framework detail page.
- `components/trust-center/public-trust-ui.tsx`
  - Public Trust Center UI components and link/visibility rendering.
- `messages/*.json` or active i18n message files if labels/errors need adjustments.
- `tests/e2e/*.spec.ts`
  - Existing Playwright patterns for route smoke tests.

## New Files

Create only if needed after inspection:

- `tests/e2e/trust-center-admin.spec.ts`
  - Playwright verification for authenticated admin settings and public route consistency, if the existing test setup can authenticate an organisation.
- `scripts/smoke-trust-center-admin-public-consistency.ts`
  - Node/tsx smoke for DB/model-level settings persistence and public output consistency, if Playwright auth is too brittle for this path.
- `docs/trust-center-admin-verification.md`
  - Short audit evidence note if runtime verification reveals gaps that should be tracked before implementation.

## Implementation or Audit Phases

### Phase 1: Discovery / Foundation

- Confirm current git state and avoid unrelated `.gitignore` changes.
- Read the Trust Center admin, action, DB query, public model, and public routes.
- Map expected setting flow from form field to DB row to public route output.
- Run existing slug smoke test.

### Phase 2: Core Verification

- Verify slug normalization and reserved slug behavior.
- Verify settings persistence and reload behavior.
- Verify publish/unpublish controls public page availability.
- Verify visible framework selections affect overview and detail routes.
- Verify framework drilldown toggle prevents public detail access where intended.
- Verify percentage toggle hides/shows scores consistently.
- Verify admin "open public page" link points to the currently saved public slug only when public.
- Verify public pages do not expose disallowed Trust Center details.

### Phase 3: Narrow Fixes, Integration, Documentation

- Implement small fixes for confirmed gaps only.
- Add tests/smokes that fail before each fix and pass after.
- Run targeted checks first, then project checks.
- Update audit documentation with verified behavior and any remaining unknowns.
- Commit only intentional changes if implementation occurs.

## Team Structure

Use a single implementer unless the audit finds multiple independent defects. If parallelized, use these roles:

- **Trust Center Auditor**
  - **Focus:** Source and runtime verification of admin/public consistency.
  - **Context:** PROJECT_PLAN.md priority item 1 and public Trust Center disclosure constraints.
  - **Outputs:** Gap list, reproduction steps, evidence, and recommended narrow fixes.

- **Full-stack Fix Implementer**
  - **Focus:** Small server action, query/model, route, or UI fixes for reproduced gaps.
  - **Context:** Existing App Router and Drizzle patterns; no speculative feature expansion.
  - **Outputs:** Code changes plus tests/smokes.

- **QA Validator**
  - **Focus:** Re-run source smoke, Playwright/manual route verification, disclosure-safety review.
  - **Context:** Buyer-facing readiness, public category-level only rule, no fake proof.
  - **Outputs:** Final verification record and remaining gaps.

## Step by Step Tasks

### 1. Confirm clean working scope

- **ID:** confirm-working-scope
- **Dependencies:** none
- **Assigned To:** Trust Center Auditor
- **Parallel:** false
- **Actions:**
  - Run `git status --short`.
  - Note any unrelated dirty files, especially the existing `.gitignore` modification.
  - Do not revert or edit unrelated files.
- **Files touched or inspected:** none expected.
- **Verification:** Working tree state is documented before changes.

### 2. Map admin settings form fields

- **ID:** map-admin-form
- **Dependencies:** confirm-working-scope
- **Assigned To:** Trust Center Auditor
- **Parallel:** false
- **Actions:**
  - Read `app/(app)/trust-center/page.tsx`.
  - List every setting field rendered in the form:
    - `subdomain`
    - `accentColor`
    - `isPublic`
    - `ndaRequired`
    - `showFrameworkDrilldown`
    - `showFrameworkPercentages`
    - `visibleFrameworks`
  - Confirm disabled state is tied to live data availability.
  - Confirm public link appears only when a saved slug exists and `isPublic` is true.
- **Files touched or inspected:** `app/(app)/trust-center/page.tsx`.
- **Verification:** Each admin field has an identified server-action target and expected public effect.

### 3. Map server action validation and persistence

- **ID:** map-settings-action
- **Dependencies:** map-admin-form
- **Assigned To:** Trust Center Auditor
- **Parallel:** false
- **Actions:**
  - Read `app/(app)/trust-center/actions.ts`.
  - Confirm `requireActiveOrganisation()` requires both `session.userId` and `session.orgId`.
  - Confirm `settingsSchema` validates all submitted fields.
  - Confirm `normalizeTrustCenterSlug()` handles case, whitespace, invalid syntax, and reserved slugs.
  - Confirm the action revalidates the admin page and the public path.
  - Check whether old slug path is revalidated when slug changes; if not, record as a possible stale-cache gap.
- **Files touched or inspected:** `app/(app)/trust-center/actions.ts`, `lib/trust-center/settings.ts`.
- **Verification:** Persistence and cache-invalidation behavior is documented.

### 4. Map DB query and public model behavior

- **ID:** map-public-model
- **Dependencies:** map-settings-action
- **Assigned To:** Trust Center Auditor
- **Parallel:** false
- **Actions:**
  - Read `lib/db/queries/trust-center.ts` around `getTrustCenterSettings`, `upsertTrustCenterSettings`, `getPublicTrustCenter`, and framework filtering.
  - Read `lib/trust-center/public-model.ts` around public model assembly and framework detail model.
  - Confirm `isPublic=false` returns no public Trust Center.
  - Confirm `visibleFrameworks` filters overview data and blocks hidden framework detail routes.
  - Confirm `showFrameworkDrilldown=false` blocks public framework detail pages or links consistently.
  - Confirm `showFrameworkPercentages=false` hides public score percentages.
- **Files touched or inspected:** `lib/db/queries/trust-center.ts`, `lib/trust-center/public-model.ts`.
- **Verification:** Admin setting to public model mapping is complete and gap list is updated.

### 5. Map public route rendering and disclosure safety

- **ID:** map-public-routes
- **Dependencies:** map-public-model
- **Assigned To:** Trust Center Auditor
- **Parallel:** false
- **Actions:**
  - Read `app/(marketing)/trust/[orgSlug]/page.tsx`.
  - Read `app/(marketing)/trust/[orgSlug]/frameworks/[frameworkSlug]/page.tsx`.
  - Read relevant components in `components/trust-center/public-trust-ui.tsx`.
  - Confirm public overview and detail pages render category-level aggregates only.
  - Confirm public detail page has a route back to the Trust Center/home as required by AGENTS.md learnings.
  - Record any fields that look like individual control IDs, evidence filenames, test timing details, or implementation details.
- **Files touched or inspected:** public Trust Center route and UI files.
- **Verification:** Disclosure-safety checklist is completed before any outreach-ready claim.

### 6. Run existing Trust Center settings smoke

- **ID:** run-existing-settings-smoke
- **Dependencies:** map-settings-action
- **Assigned To:** QA Validator
- **Parallel:** true
- **Actions:**
  - Run `npm run smoke:trust-center-settings`.
  - Expected result: `Trust Center settings smoke passed.`
  - If it fails, fix only the slug/settings behavior needed for this plan.
- **Files touched or inspected:** `scripts/smoke-trust-center-settings.ts`, `lib/trust-center/settings.ts` if failing.
- **Verification:** Existing smoke passes.

### 7. Add or extend model-level consistency smoke if needed

- **ID:** add-model-consistency-smoke
- **Dependencies:** map-public-model
- **Assigned To:** Full-stack Fix Implementer
- **Parallel:** false
- **Actions:**
  - Prefer extending an existing smoke if a suitable harness exists.
  - If no suitable harness exists, create `scripts/smoke-trust-center-admin-public-consistency.ts`.
  - Cover these cases with direct functions or controlled test data:
    - saved slug normalizes and persists
    - `isPublic=false` makes public model unavailable
    - selected visible framework list filters public overview
    - hidden framework detail returns unavailable
    - `showFrameworkDrilldown=false` disables detail access/links
    - `showFrameworkPercentages=false` suppresses public percentages
  - Add a package script only if the smoke is stable and useful beyond this one pass.
- **Files touched or inspected:** potential new smoke script, `package.json` if adding a script.
- **Verification:** Smoke fails before any reproduced fix where practical and passes after.

### 8. Add authenticated Playwright coverage if feasible

- **ID:** add-playwright-admin-coverage
- **Dependencies:** map-admin-form, map-settings-action
- **Assigned To:** Full-stack Fix Implementer
- **Parallel:** false
- **Actions:**
  - Inspect existing e2e auth/org setup patterns in `tests/e2e/*.spec.ts`.
  - If auth setup is already available, create `tests/e2e/trust-center-admin.spec.ts`.
  - Test the user-visible flow:
    - open `/trust-center` as an active organisation admin
    - set a non-reserved slug such as `buyer-readiness-trust`
    - publish the Trust Center
    - save settings
    - reload `/trust-center` and verify saved values remain
    - open `/trust/buyer-readiness-trust` and verify it renders the same selected frameworks
    - unpublish and verify public route no longer renders
  - If authenticated e2e setup is not available, document the gap and rely on model smoke plus manual verification.
- **Files touched or inspected:** `tests/e2e/*.spec.ts`, potential `tests/e2e/trust-center-admin.spec.ts`.
- **Verification:** Targeted Playwright test passes or the auth setup gap is explicitly documented.

### 9. Fix slug persistence and collision gaps only if reproduced

- **ID:** fix-slug-gaps
- **Dependencies:** map-settings-action, run-existing-settings-smoke
- **Assigned To:** Full-stack Fix Implementer
- **Parallel:** false
- **Actions:**
  - If slug normalization fails, fix `lib/trust-center/settings.ts` and update smoke coverage.
  - If reserved slugs are incomplete, update `TRUST_CENTER_RESERVED_SLUGS` and smoke coverage.
  - If duplicate public slug collisions across organisations are possible and not enforced, inspect schema/indexes before changing behavior.
  - If old public slug cache can remain stale after slug change, revalidate both old and new paths in `updateTrustCenterSettingsAction`.
  - Do not add custom-domain behavior unless a current defect requires it.
- **Files touched or inspected:** `lib/trust-center/settings.ts`, `app/(app)/trust-center/actions.ts`, schema/index files only if collision fix is necessary.
- **Verification:** Relevant smoke and typecheck pass.

### 10. Fix visibility toggle gaps only if reproduced

- **ID:** fix-visibility-gaps
- **Dependencies:** map-public-model, add-model-consistency-smoke
- **Assigned To:** Full-stack Fix Implementer
- **Parallel:** false
- **Actions:**
  - If `isPublic=false` still exposes a public route, fix `getPublicTrustCenter` or public model logic.
  - If `visibleFrameworks` does not filter overview or detail consistently, fix query/model filtering.
  - If `showFrameworkDrilldown=false` leaves public detail links active, fix `FrameworkCard` link rendering or model logic.
  - If `showFrameworkPercentages=false` leaves scores visible, fix public overview/detail rendering.
- **Files touched or inspected:** `lib/db/queries/trust-center.ts`, `lib/trust-center/public-model.ts`, public route/UI files.
- **Verification:** Model smoke and public route verification pass.

### 11. Runtime manual verification

- **ID:** runtime-manual-verification
- **Dependencies:** run-existing-settings-smoke, add-model-consistency-smoke, add-playwright-admin-coverage
- **Assigned To:** QA Validator
- **Parallel:** false
- **Actions:**
  - Start local app with the available development environment: `npm run dev`.
  - Sign in with a Clerk user that has an active organisation.
  - Visit `/trust-center`.
  - Save slug `buyer-readiness-trust` or another safe non-production test slug.
  - Toggle `isPublic` on and verify `/trust/buyer-readiness-trust` renders.
  - Toggle selected frameworks and verify only selected frameworks render publicly.
  - Toggle framework detail off and verify detail links/routes are unavailable.
  - Toggle percentages off and verify public overview/detail pages hide percentages.
  - Toggle `isPublic` off and verify public page is unavailable.
  - Restore safe default settings after testing.
- **Files touched or inspected:** runtime only, unless defects are found.
- **Verification:** Manual checklist is completed with observed results.

### 12. Public disclosure safety pass

- **ID:** public-disclosure-safety-pass
- **Dependencies:** runtime-manual-verification
- **Assigned To:** QA Validator
- **Parallel:** false
- **Actions:**
  - Inspect public overview and framework detail pages in browser.
  - Search rendered/source-visible text for control IDs, evidence filenames, exact test timing details, and implementation details.
  - Confirm pages state posture honestly and do not imply certification, legal review, or auditor readiness.
  - Confirm demo/sample states are not confused with real customer proof; if this expands beyond admin verification, record as follow-up under PROJECT_PLAN.md item 2.
- **Files touched or inspected:** public rendered pages, public Trust Center UI files if needed.
- **Verification:** Safety checklist has no blockers or has explicit follow-up audit items.

### 13. Run targeted validation commands

- **ID:** targeted-validation
- **Dependencies:** all fix tasks that were needed
- **Assigned To:** QA Validator
- **Parallel:** false
- **Actions:**
  - Run the narrowest relevant checks first:
    - `npm run smoke:trust-center-settings`
    - any new Trust Center smoke script
    - `npx playwright test tests/e2e/trust-center-admin.spec.ts` if added
  - Then run broader checks if implementation changed runtime code:
    - `npm run typecheck`
    - `npm run lint`
    - `npm run build`
- **Files touched or inspected:** none expected.
- **Verification:** Commands pass or failures are documented with root cause and next action.

### 14. Document results and follow-up audit items

- **ID:** document-results
- **Dependencies:** targeted-validation, public-disclosure-safety-pass
- **Assigned To:** Trust Center Auditor
- **Parallel:** false
- **Actions:**
  - If all checks pass, record concise verification in final summary and commit message.
  - If gaps remain, create or update `docs/trust-center-admin-verification.md` with:
    - routes/files checked
    - expected behavior
    - observed behavior
    - evidence captured
    - unresolved gaps
    - follow-up task recommendations
  - Do not claim buyer-ready Trust Center behavior for any unverified path.
- **Files touched or inspected:** optional `docs/trust-center-admin-verification.md`.
- **Verification:** Audit trail is precise and does not overclaim readiness.

## Acceptance Criteria

- [ ] Existing slug smoke passes with `npm run smoke:trust-center-settings`.
- [ ] Admin settings page loads in live mode for an authenticated active Clerk organisation with DB configured.
- [ ] Saving a valid slug persists after reload.
- [ ] Reserved slugs `demo` and `splnit` cannot be saved for organisation Trust Centers.
- [ ] Invalid slugs cannot be saved and do not create broken public routes.
- [ ] `isPublic=false` makes the public Trust Center unavailable.
- [ ] `isPublic=true` makes `/trust/[savedSlug]` available.
- [ ] Admin "open public page" link reflects the saved public slug only when public.
- [ ] Visible framework selections are reflected on the public overview page.
- [ ] Hidden frameworks cannot be reached through public framework detail routes.
- [ ] `showFrameworkDrilldown=false` prevents public framework drilldown from being exposed.
- [ ] `showFrameworkPercentages=false` hides public percentage scores consistently.
- [ ] Public Trust Center pages expose category-level aggregates only.
- [ ] Public pages do not expose individual control IDs, evidence filenames, exact test timing details, or attacker-useful implementation details.
- [ ] No copy claims fake customers, fake proof, certification, legal review, auditor readiness, or unsupported regulatory coverage.
- [ ] Any unverified behavior is documented as a follow-up audit item instead of marked ready.

## Validation Commands

```bash
# Existing Trust Center slug/settings smoke
npm run smoke:trust-center-settings

# Optional new DB/model smoke if added
npm run smoke:trust-center-admin-public-consistency

# Optional authenticated Trust Center admin e2e if added
npx playwright test tests/e2e/trust-center-admin.spec.ts

# TypeScript validation after runtime code changes
npm run typecheck

# Lint after code changes
npm run lint

# Production build after runtime code changes
npm run build
```

## Database / Migration Check

- Expected migration need: none for a verification-only pass or UI/model fixes.
- Before any schema/index change, inspect `lib/db/schema.ts` and `drizzle/` migrations.
- If a schema/index change is required, run:

```bash
npm run db:generate
npm run db:migrate
```

- Before deploy, explicitly confirm whether the deployment pipeline runs migrations automatically. If not, document the manual production migration command using the production `DATABASE_URL` without printing credentials.

## Risks / Edge Cases

- Clerk active-organisation state may block authenticated Playwright coverage; if so, prefer model smoke plus manual runtime verification.
- Existing local data may not include enrolled frameworks; seed or use a known development organisation before judging visible-framework behavior.
- `visibleFrameworks=[]` currently appears to mean all enrolled frameworks are visible; tests must confirm whether this is intentional and document it clearly.
- Changing a public slug may leave old route cache entries unless old and new paths are both revalidated.
- Duplicate slugs across organisations may require a DB uniqueness guarantee; do not add schema changes without confirming current schema and migration state.
- NDA/access-token behavior can affect document visibility; do not conflate it with public framework visibility.
- Demo Trust Center behavior belongs mainly to the next PROJECT_PLAN.md item unless it directly interferes with admin verification.

## Rollback Plan

- For documentation-only changes: revert the plan/audit doc commit if needed.
- For UI/action/model fixes: revert the specific commit and rerun `npm run smoke:trust-center-settings`, `npm run typecheck`, `npm run lint`, and `npm run build`.
- For schema changes, only proceed with an explicit migration rollback plan after reviewing generated Drizzle migration SQL.
- Do not use destructive git commands unless explicitly approved.

## Follow-up Audit Items

Track these separately if they are discovered but not required for Trust Center admin verification:

- Demo-vs-live clarity problems under PROJECT_PLAN.md item 2.
- Broader action-level authorization gaps outside Trust Center actions.
- Legal identity placeholder cleanup.
- Custom domain support for public Trust Centers.
- Trust Center request lifecycle cleanup/retention if outside the settings/public consistency scope.
- Production smoke after deployment, including confirming the actual Vercel production alias and redacted production DB branch metadata.
