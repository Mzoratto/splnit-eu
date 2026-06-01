# Production migration discipline

Production migrations are a global production-safety gate. If production has applied migrations that are not present in committed source, stop seeds, deploys, and additional migrations until the drift is reconciled.

## Why this exists

Production previously had applied Drizzle migrations that existed only as uncommitted local files. That made the production schema non-reproducible from source and created an avoidable compliance/change-control risk.

## Required production sequence

1. Generate migrations locally only:
   - `npm run db:generate`
2. Review the SQL, snapshots, and journal.
3. Commit the complete migration set:
   - `lib/db/schema.ts`
   - `lib/db/migrations/*.sql`
   - `lib/db/migrations/meta/*.json`
   - `lib/db/migrations/meta/_journal.json`
4. Push/land the commit to the production source branch.
5. Run production migration only through the safe wrapper:
   - `SPLNIT_CONFIRM_PRODUCTION_MIGRATION=I_UNDERSTAND_PRODUCTION_MIGRATIONS npm run db:migrate:production`
6. Confirm the wrapper prints `ok: true` after the post-migration drift check.

## What the wrapper enforces

`npm run db:migrate:production` uses `scripts/run-production-migrations-safe.ts` and refuses to run unless:

- an explicit confirmation variable is set;
- the target database URL comes from a production-specific env var;
- the target is not localhost;
- migration-relevant source files are clean;
- `HEAD` is already landed in the configured production base ref, default `origin/main`;
- production has no extra applied migrations beyond committed source;
- already-applied production migration hashes match committed SQL files;
- only redacted target metadata is printed;
- the post-migration drift check is green.

## Important boundaries

- Do not run raw `drizzle-kit migrate` against production.
- Do not run production migrations from a feature branch, dirty checkout, or unpushed local commit.
- Do not seed production while migration drift is red.
- Targeted production seeds, including Helios controls, must wait until this gate is green from committed source.

## If drift is red

1. Do not run more production-changing commands.
2. Read production migration rows in read-only mode.
3. Compare production row hashes with local migration SQL hashes.
4. If matching local files exist, commit the exact SQL, snapshots, journal, and schema reconciliation set.
5. Re-run the drift gate from a clean committed tree.
6. Resume feature or seed work only after the gate is green.
