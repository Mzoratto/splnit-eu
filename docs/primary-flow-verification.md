# Primary Flow Verification

Last updated: 2026-05-06

## Scope

Core customer journey:

`Onboarding -> Framework setup -> Controls -> Evidence -> Policies -> Gap report output`

This pass verifies the flow against production Neon using a Clerk test instance
and real Blob-backed downloads. The unauthenticated local smoke remains useful
as a fast data-layer regression check.

## Result

Status: `pass`

The authenticated browser primary flow passed on 2026-05-06 against production
Neon with the supplied Clerk test keys. Production migrations, seed, legal-source
imports, citation smokes, and the authenticated primary flow are all clear.

A temporary token-gated production Vercel verification route also passed on
2026-05-06 using live production runtime secrets. It verified the Clerk custom
domain, enabled live Clerk Organizations, created a temporary live Clerk
user/organization, exercised production Neon and Blob-backed evidence, generated
policy and NIS2 gap report PDFs, verified Italian primary domain labels, and
deleted its temporary rows, blobs, Clerk user, and Clerk organization. The route
was removed immediately after the pass.

Clerk dashboard showed Organizations configured, but the Backend API still
reported `enabled: false`. The test instance was corrected through Clerk's
Backend API by setting only `organizationSettings.enabled=true`, then the smoke
created a temporary Clerk user and organization successfully.

The existing Playwright config intentionally clears Clerk variables and
therefore still runs app pages in no-auth demo mode. Use the authenticated smoke
for Clerk-backed verification.

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

What it verifies:

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
- Deletes uploaded blobs, mutable temporary database rows, Clerk organization,
  and Clerk user in cleanup.

Safety notes:

- The script refuses local database hosts unless
  `AUTH_PRIMARY_FLOW_ALLOW_LOCAL_DB=1` is set.
- Clerk keys are supplied only through environment variables. Do not commit
  them to `.env`, `.env.local`, or Playwright config.
- For this production-parity pass, run it through Vercel production env
  injection and source the Clerk test keys from a permission-restricted temp
  file.
- Production audit logs are append-only. Smoke audit rows are retained, and the
  minimal smoke organization rows that satisfy their foreign keys are retained.
  Mutable child rows, profiles, evidence, policies, generated artifacts, status
  rows, framework rows, and blobs are cleaned up.

Observed result on 2026-05-06:

```json
{
  "browserConsoleErrors": 0,
  "clerkOrgCreated": true,
  "databaseHost": "ep-weathered-glitter-alyve8jv-pooler.c-3.eu-central-1.aws.neon.tech",
  "ok": true,
  "evidenceRows": 1,
  "frameworkSlugs": ["gdpr", "nis2"],
  "generatedArtifacts": 1,
  "policies": 2,
  "statusRows": 25
}
```

Post-run cleanup check:

```json
{
  "organisations": 3,
  "profiles": 0,
  "evidence": 0,
  "policies": 0,
  "generated_artifacts": 0,
  "statuses": 0,
  "frameworks": 0,
  "audit_logs": 10
}
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
- Authenticated primary-flow smoke passed against production Neon env with Clerk
  test keys and real Blob-backed downloads.

## Remaining Gaps

1. Legal identity closeout remains externally blocked.
2. Decide whether to retain the current append-only audit-log behavior for
   smoke tests or introduce a documented production smoke tenant.
