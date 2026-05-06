# Primary Flow Verification

Last updated: 2026-05-06

## Scope

Core customer journey:

`Onboarding -> Framework setup -> Controls -> Evidence -> Policies -> Gap report output`

This pass verifies the flow against the local Postgres database configured by `DATABASE_URL`. It does not claim production database parity.

## Result

Status: `partial-pass`

The data-layer primary flow passes with real local database writes and cleanup.
Production migrations, seed, and legal-source imports are now complete. The
remaining blocker is narrower than before: Clerk test keys are available, but
the supplied Clerk test instance does not have Organizations enabled, so the app
cannot obtain the active `session.orgId` required by protected app routes and
server actions.

Authenticated browser verification was attempted on 2026-05-06 with production
Neon env and the supplied Clerk test keys. Test user creation required a
generated username and then succeeded, but Clerk rejected organization creation:

```text
organization_not_enabled_in_instance
The organizations feature is not enabled for this instance.
```

The existing Playwright config intentionally clears Clerk variables and therefore runs app pages in no-auth demo mode.

## Repeatable Smoke

Command:

```bash
npm run smoke:primary-flow
```

What it verifies:

- Creates a synthetic local organisation with `country=IT`, `primaryJurisdiction=IT`, `locale=it-IT`.
- Saves onboarding company, framework, and tool selections.
- Completes onboarding and verifies selected NIS2/GDPR frameworks.
- Runs NIS2 framework assessment against seeded controls.
- Updates a real control status.
- Creates a manual evidence record.
- Resolves and renders a policy PDF buffer.
- Saves a generated policy record.
- Renders a gap report PDF buffer.
- Saves a gap report record.
- Saves and lists a generated gap-analysis artifact without creating audit-log residue.
- Verifies dashboard data reflects the synthetic organisation.
- Cleans up all synthetic org-scoped rows it creates.

Safety note: the script intentionally does not upload to Vercel Blob and does not call Clerk. Blob-backed download endpoints still need an authenticated integration test.

## Authenticated Browser Smoke

Command:

```bash
npm run smoke:authenticated-primary-flow
```

What it verifies once the Clerk test instance has Organizations enabled:

- Creates a temporary Clerk test user and organization.
- Mirrors the Clerk organization/profile into the configured database, matching
  the production webhook side effects needed for local verification.
- Signs in through a real browser session using a Clerk testing token.
- Completes onboarding through the browser and persists Italy jurisdiction,
  Italian locale, selected NIS2/GDPR frameworks, and tool inventory.
- Runs the NIS2 framework setup browser flow and verifies control status
  persistence.
- Updates a real control status.
- Uploads a real evidence file to the configured Blob store and verifies the
  authenticated evidence download route.
- Generates a real security policy PDF and verifies the authenticated policy
  download route.
- Generates a real NIS2 gap report PDF, verifies the generated artifact row,
  and verifies the authenticated report download route.
- Deletes the temporary database rows, uploaded blobs, Clerk organization, and
  Clerk user in cleanup.

Safety notes:

- The script refuses local database hosts unless
  `AUTH_PRIMARY_FLOW_ALLOW_LOCAL_DB=1` is set.
- Clerk keys are supplied only through environment variables. Do not commit
  them to `.env`, `.env.local`, or Playwright config.
- For this production-parity pass, run it through Vercel production env
  injection and source the Clerk test keys from a permission-restricted temp
  file.

Observed result on 2026-05-06:

```text
blocked before browser execution
reason: supplied Clerk test instance has Organizations disabled
production cleanup check: 0 test organisation rows remained
```

## Commands Run

```bash
npm run db:migrate
npm run db:seed
npm run smoke:primary-flow
npm run smoke:draft-extraction-sources
npm run smoke:reviewed-article-links
npm run smoke:automated-evidence-citations
npm run typecheck
npm run lint
npm run build
npx playwright test tests/e2e/onboarding.spec.ts tests/e2e/settings-organisation.spec.ts tests/e2e/integration-connect.spec.ts --project=chromium
npm run smoke:authenticated-primary-flow
```

Observed result:

- Local migrations applied successfully.
- Seed completed with 5 frameworks, 92 controls, 184 framework-control mappings, 48 source documents, 34 evidence templates, and 16 integration tests.
- Primary flow smoke passed.
- Citation safety smokes passed.
- Typecheck, lint, and build passed.
- Chromium demo-mode browser smoke passed after updating stale localization assertions.
- Authenticated primary-flow smoke was added and attempted against production
  Neon env with Clerk test keys, but stopped at Clerk organization creation
  because Organizations are disabled in the supplied Clerk test instance.

## Remaining Gaps

1. Enable Organizations in the supplied Clerk test instance, then rerun
   `npm run smoke:authenticated-primary-flow`.
2. Blob-backed evidence, policy, and gap-report download endpoints are wired
   into that smoke, but remain unverified until the Clerk org blocker is cleared.
3. Framework setup browser persistence is wired into that smoke, but remains
   unverified until the Clerk org blocker is cleared.
