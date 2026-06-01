# Production migration execution: 0028_great_wasp

Date: 2026-06-01
Operator: Hermes Agent, with human approval from Marco Zoratto
Scope: Apply pending production migration `0028_great_wasp` only.

## Safety scope

Included:

- Guarded production migration wrapper: `npm run db:migrate:production`
- Pending migration applied: `0028_great_wasp`
- Post-migration read-only drift verification
- Post-migration read-only Helios seed readiness verification

Excluded:

- No broad production seed
- No targeted production seed/backfill
- No deploy
- No raw SQL outside the committed Drizzle migration
- No secret values printed or recorded

## Production target metadata

Redacted metadata reported by the guarded wrapper:

```json
{
  "protocol": "postgresql",
  "host": "ep-shy-poetry-alzdu6ud-pooler.c-3.eu-central-1.aws.neon.tech",
  "portPresent": false,
  "databasePresent": true,
  "sslMode": "require"
}
```

## Before migration

The guarded wrapper reported:

```json
{
  "phase": "before-production-migration",
  "expectedMigrationCount": 29,
  "productionMigrationCount": 28,
  "latestProductionMigrationInferredFromJournal": "0027_drop_ico_format_check",
  "pendingMigrationCount": 1,
  "pendingMigrations": ["0028_great_wasp"]
}
```

## Migration result

Command used, with the existing local `DATABASE_URL` supplied to the wrapper as `PRODUCTION_DATABASE_URL` in-process and not printed:

```bash
SPLNIT_CONFIRM_PRODUCTION_MIGRATION=I_UNDERSTAND_PRODUCTION_MIGRATIONS npm run db:migrate:production
```

Drizzle result:

```text
migrations applied successfully
```

## After migration

The wrapper's post-migration drift check reported:

```json
{
  "databaseHostClass": "neon",
  "expectedMigrationCount": 29,
  "productionMigrationCount": 29,
  "migrationTableExists": true,
  "latestExpectedMigration": "0028_great_wasp",
  "latestProductionMigrationInferredFromJournal": "0028_great_wasp",
  "missingExpectedMigrations": [],
  "extraAppliedMigrationCount": 0,
  "ok": true
}
```

The wrapper's final summary reported:

```json
{
  "phase": "after-production-migration",
  "expectedMigrationCount": 29,
  "productionMigrationCount": 29,
  "pendingMigrationCount": 0,
  "ok": true
}
```

## Independent read-only verification

Command:

```bash
npm run check:production-migration-drift
```

Result:

```json
{
  "databaseHostClass": "neon",
  "expectedMigrationCount": 29,
  "productionMigrationCount": 29,
  "migrationTableExists": true,
  "latestExpectedMigration": "0028_great_wasp",
  "latestProductionMigrationInferredFromJournal": "0028_great_wasp",
  "missingExpectedMigrations": [],
  "extraAppliedMigrationCount": 0,
  "ok": true
}
```

Command:

```bash
npm run verify:helios-production-seed-readiness
```

Result:

```json
{
  "expectedHeliosControls": 19,
  "actualHeliosControls": 19,
  "nis2HeliosMappings": 19,
  "missingExpectedControls": 0,
  "unexpectedHeliosControls": 0,
  "duplicateHeliosControlKeys": 0,
  "duplicateHeliosFrameworkMappings": 0,
  "controlsMissingNis2Mappings": 0
}
```

## Outcome

- Production migration drift is green.
- Helios production seed readiness is green.
- No production seed/backfill was run.
- No deploy was run as part of this operation.
