# Primary Flow Verification

Last updated: 2026-05-06

## Scope

Core customer journey:

`Onboarding -> Framework setup -> Controls -> Evidence -> Policies -> Gap report output`

This pass verifies the flow against the local Postgres database configured by `DATABASE_URL`. It does not claim production database parity.

## Result

Status: `partial-pass`

The data-layer primary flow passes with real local database writes and cleanup. Authenticated browser verification is still blocked because local Clerk environment variables are missing:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: missing or empty
- `CLERK_SECRET_KEY`: missing or empty

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
```

Observed result:

- Local migrations applied successfully.
- Seed completed with 5 frameworks, 92 controls, 184 framework-control mappings, 48 source documents, 34 evidence templates, and 16 integration tests.
- Primary flow smoke passed.
- Citation safety smokes passed.
- Typecheck, lint, and build passed.
- Chromium demo-mode browser smoke passed after updating stale localization assertions.

## Remaining Gaps

1. Authenticated browser E2E requires a Clerk test org and test user.
2. Blob-backed evidence and policy download endpoints need authenticated tests with a safe test Blob target.
3. Framework setup browser flow still needs authenticated persistence verification, not just data-layer verification.
4. Production database parity remains unknown until production `DATABASE_URL` and migration/seed state are verified.
