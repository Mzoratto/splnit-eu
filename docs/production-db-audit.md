# Production DB Audit

Last updated: 2026-05-06

## Scope

Read-only audit of the Vercel production database wiring for Splnit.eu.

Goal:

- Verify production `DATABASE_URL` exists and is non-empty.
- Verify the production target is not a local development database.
- If reachable, record migration/table readiness and knowledge-layer counts.

## Result

Production runtime database wiring is now repaired for the live app.

A Vercel Marketplace Neon resource is connected to the project:

- resource: `splnit-production-db`
- region: `fra1`
- Vercel resource id: `store_jzJWhNVTBtpiRPuh`
- Neon external resource id: `damp-pond-09368963`

The stale Production `DATABASE_URL` that pointed at localhost was removed, and
the Neon integration provisioned a fresh Production `DATABASE_URL` plus the
companion `POSTGRES_*`, `DATABASE_URL_UNPOOLED`, and `NEON_PROJECT_ID`
variables.

The live production readiness endpoint reports all required environment groups configured:

- app
- database
- auth
- billing
- encryption
- cron
- Inngest
- Blob

Check result:

```text
GET https://splnit.eu/api/readiness
ok: true
required: 7 / 7 configured
recommended: 2 / 10 configured
```

`OPENAI_API_KEY` was also added to Vercel Production as a sensitive environment variable.

The previous local CLI result that showed sensitive variables as empty was misleading. Vercel sensitive environment variables are intentionally non-readable after creation, so `vercel env pull` and local `vercel env run` are not reliable ways to inspect their values. Use the live server-side readiness endpoint for presence checks, and never print actual values.

Production migrations, seed, and citation smoke checks were run through a
temporary token-protected production maintenance route, then the route and token
were removed. Cleanup deployment: `dpl_7441Q5NeGvMfLD6q7pYH2PuLxu2c`.

Results:

```text
maintenance deployment: dpl_7NuJgcWqNDSZ34YKd514jfmhaqGt
migrations: ok, latest migration id 14, hash aa908b87ad9f952c1cd3517cf51aa7fd78b9bbbaefc83f9d8e668d524c550a1b
seed: ok, 5 frameworks, 92 controls, 184 framework-control mappings, 48 source documents, 34 evidence templates, 16 integration tests
citation smokes: ok, automatedEvidenceRows=0, invalidEvidenceRows=0, missingReviewedLinks=0, promotedDrafts=0
```

Cleanup verification:

```text
GET https://splnit.eu/api/internal/production-maintenance -> 404
MIGRATION_TOKEN present in Vercel Production -> false
```

## Verification Commands

Environment listing:

```bash
vercel env ls production
```

Clean production env status check:

```bash
tmpdir="/tmp/splnit-vercel-env-run-clean"
rm -rf "$tmpdir"
mkdir -p "$tmpdir/.vercel"
cp .vercel/project.json "$tmpdir/.vercel/project.json"
vercel env run --cwd "$tmpdir" --environment=production -- node -e '/* status-only env check */'
rm -rf "$tmpdir"
```

The clean temp directory matters because running from the repo root can load local `.env.local` values and mask empty production values.

Runtime readiness check:

```bash
curl -sS https://splnit.eu/api/readiness
```

Environment key presence check:

```bash
vercel env ls production --format json
```

## Remaining Gaps

These checks are outside the migration/seed/citation-smoke pass above:

- Production legal-source import scripts were not rerun after provisioning the
  fresh Neon database.
- Article and framework-control article counts should be checked after any
  production legal-source import pass.

## Source Notes

- Vercel sensitive environment variables are non-readable after creation: https://vercel.com/docs/environment-variables/sensitive-environment-variables
- `vercel env run` can run commands with project envs, but it should not be treated as a way to reveal sensitive production values: https://vercel.com/docs/cli/env
