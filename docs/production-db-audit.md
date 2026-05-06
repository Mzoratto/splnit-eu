# Production DB Audit

Last updated: 2026-05-06

## Scope

Read-only audit of the Vercel production database wiring for Splnit.eu.

Goal:

- Verify production `DATABASE_URL` exists and is non-empty.
- Verify the production target is not a local development database.
- If reachable, record migration/table readiness and knowledge-layer counts.

## Result

Production runtime environment repair is complete enough for the live app.

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

Production database table/count audit was attempted with a temporary token-protected production route, then the route and token were removed. Cleanup deployment: `dpl_7vLqkeZQddoY3v6NPgZ2RteFesHz`.

The route proved that production `DATABASE_URL` currently points to `127.0.0.1:5432`, not a hosted Postgres/Neon database:

```text
Error: connect ECONNREFUSED 127.0.0.1:5432
```

Because the production function cannot connect to Postgres, production migrations and citation smoke checks could not run.

A Vercel Marketplace Neon resource provisioning attempt for Frankfurt (`fra1`) was blocked by marketplace terms acceptance. Those legal/billing terms must be accepted by the owner before provisioning can continue.

Cleanup verification:

```text
GET https://splnit.eu/api/internal/production-db-audit -> 404
PRODUCTION_AUDIT_TOKEN present in Vercel Production -> false
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

## Not Verified Yet

These checks remain pending until a production DB connection can be used by local audit scripts or an internal protected production audit route:

- Production migration state.
- `pgvector` extension availability.
- Core table presence.
- `frameworks`, `controls`, `framework_controls`, `source_documents`, `articles`, `evidence_templates`, `tests`, `mapping_review_queue`, and `mapping_promotion_audit` counts.
- Production citation-gate smoke results.

## Required Fix

Do not copy the current local `DATABASE_URL`; it points to `localhost/splnit_eu_dev` and is not a production database target.

To finish the production DB audit, first replace the production `DATABASE_URL` with a real hosted Postgres/Neon URL. Use one of these paths:

1. Accept the Neon Marketplace terms in Vercel, provision/connect a Neon resource in `fra1`, then migrate/seed/audit that database.
2. Get the production Neon/Postgres connection string directly from the database provider and run the audit commands locally with that value loaded only for the command.
3. Re-add a temporary, token-protected internal audit route that runs read-only count queries inside Vercel production, then remove it after the audit.

After a production DB connection path exists:

```bash
npm run db:migrate
npm run smoke:draft-extraction-sources
npm run smoke:reviewed-article-links
npm run smoke:automated-evidence-citations
```

Run those commands with the production `DATABASE_URL` loaded intentionally, then update this audit with counts and smoke results. Do not run them against the local `localhost/splnit_eu_dev` database and call the result production.

## Source Notes

- Vercel sensitive environment variables are non-readable after creation: https://vercel.com/docs/environment-variables/sensitive-environment-variables
- `vercel env run` can run commands with project envs, but it should not be treated as a way to reveal sensitive production values: https://vercel.com/docs/cli/env
