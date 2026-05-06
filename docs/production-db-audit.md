# Production DB Audit

Last updated: 2026-05-06

## Scope

Read-only audit of the Vercel production database wiring for Splnit.eu.

Goal:

- Verify production `DATABASE_URL` exists and is non-empty.
- Verify the production target is not a local development database.
- If reachable, record migration/table readiness and knowledge-layer counts.

## Result

Production database audit is currently blocked.

Vercel lists `DATABASE_URL` as a production environment variable, but pulling/running production env from a clean linked directory resolves it as empty. This means the variable exists as a placeholder but does not provide an actual database target to the app or to audit commands.

The clean production env check also found these runtime variables empty:

- `DATABASE_URL`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `OPENAI_API_KEY`
- `ENCRYPTION_KEY`

`BLOB_READ_WRITE_TOKEN` is set.

Because `DATABASE_URL` is empty, no production database connection was attempted and no production migrations, imports, or seed scripts were run.

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

## Not Verified Yet

These checks remain pending until a real production `DATABASE_URL` is configured:

- Production migration state.
- `pgvector` extension availability.
- Core table presence.
- `frameworks`, `controls`, `framework_controls`, `source_documents`, `articles`, `evidence_templates`, `tests`, `mapping_review_queue`, and `mapping_promotion_audit` counts.
- Production citation-gate smoke results.

## Required Fix

Configure real production environment values in Vercel. Do not copy the current local `DATABASE_URL`; it points to `localhost/splnit_eu_dev` and is not a production database target.

Minimum required before production DB audit can continue:

- Real hosted Postgres/Neon `DATABASE_URL` scoped to Production.
- Clerk production keys scoped to Production.
- `ENCRYPTION_KEY` scoped to Production.
- Stripe production or intentional test-mode keys scoped to Production.
- `OPENAI_API_KEY` scoped to Production before agent/AI features run there.

After fixing env values:

```bash
npm run db:migrate
npm run smoke:draft-extraction-sources
npm run smoke:reviewed-article-links
npm run smoke:automated-evidence-citations
```

Run those commands with the production `DATABASE_URL` loaded intentionally, then update this audit with counts and smoke results.
