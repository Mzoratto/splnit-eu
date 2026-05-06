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

Production legal-source import scripts were run against the live Neon database
on 2026-05-06. Group A ran through a temporary token-protected production
maintenance route; the route and token were removed before Group B. Group B ran
from the local machine with `DATABASE_URL` scoped to each command through
Vercel production env injection, without exporting the URL into the shell
session.

Legal-source import deployments:

```text
temporary Group A route deployment: dpl_J2B8kFa5MKoLkwHFF1pRDHTUhFLL
temporary route commit: 09b12d7
cleanup deployment after Group A: dpl_FwMPx8bKtB8r7sbQdgKDu8zsBfHS
cleanup revert commit: 687305b
```

Group A import results:

```text
authoritative-sources: ok, imported 32 source document definitions
italian-nis2: ok, 44 reviewed articles, 34 linked mappings
gdpr-eu-it: ok, 99 reviewed articles
italian-gdpr-garante: ok, 3 reviewed guidance rows
italian-gdpr-codice: ok, 1 reviewed law row
post-Group-A counts: 48 source documents, 147 articles, 34 article-link mappings
```

Group A cleanup verification:

```text
POST https://splnit.eu/api/internal/production-maintenance -> 404
MIGRATION_TOKEN present in Vercel Production -> false
```

Group B import results:

```text
nis2-eu --file /private/tmp/nis2-en.xhtml: ok, 2 draft EU NIS2 articles, 34 linked mappings
italian-nis2-acn: ok, 13 reviewed Italian ACN guidance rows
czech-cyber-law --law-264-pdf /private/tmp/splnit-official/Sb_2025_264_PZZ.pdf: ok, 5 draft Czech law sections, 68 linked mappings
czech-decrees --decree-409-pdf /private/tmp/splnit-official/Sb_2025_409_PZZ.pdf --decree-410-pdf /private/tmp/splnit-official/Sb_2025_410_PZZ.pdf: ok, 37 draft Czech decree sections, 132 linked mappings
```

Final knowledge counts:

```text
frameworks: 5
controls: 92
framework-control mappings: 184
articles: 204
framework-control article mappings: 268
source documents: 51
evidence templates: 34
integration tests: 16
```

Final article counts by scope:

```text
gdpr / EU / it-IT / reviewed: 99
gdpr / IT / it-IT / reviewed: 4
nis2 / CZ / cs-CZ / draft: 42
nis2 / EU / en-EU / draft: 2
nis2 / IT / it-IT / reviewed: 57
```

All citation smoke checks passed after the full import batch:

```text
npm run smoke:draft-extraction-sources: passed
npm run smoke:reviewed-article-links: passed
npm run smoke:automated-evidence-citations: passed
```

The citation smokes were run on `DATABASE_URL_UNPOOLED` with
`PGOPTIONS="-c default_transaction_read_only=on"` because Neon's pooled
connection rejects that startup parameter. This enforced read-only transactions
for the smoke assertions.

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

No remaining database bootstrap or legal-source import gap is known from this
pass. Czech and EU NIS2 rows remain `draft` by design; Italian NIS2 and GDPR
rows imported in this pass are `reviewed`.

## Source Notes

- Vercel sensitive environment variables are non-readable after creation: https://vercel.com/docs/environment-variables/sensitive-environment-variables
- `vercel env run` can run commands with project envs, but it should not be treated as a way to reveal sensitive production values: https://vercel.com/docs/cli/env
