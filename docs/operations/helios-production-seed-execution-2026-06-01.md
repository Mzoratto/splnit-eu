# Helios production seed execution record — 2026-06-01

This records the first owner-approved Helios production control seed window.
It is intentionally sanitized: no raw `DATABASE_URL`, credentials, cookies, or secret values are stored here.

## Source and deployment state

- Feature PR merged first: #35 `Add production migration safety guard`
- Helios PR merged second: #34 `Integrate Helios readiness gates`
- Production app deployment was already green before the seed window.
- Seed arc worktree: clean branch cut from `github/main` at `1fc73d4 Integrate Helios readiness gates (#34)`, then docs-only checklist commit `6d2e9ed` used for the runbook context.
- Local raw execution logs were captured at `/tmp/helios-production-seed-arc-20260601T095332Z` during the window. The durable record below is the repo-safe summary.

## Commands run

Only these production-affecting/read commands were used:

```sh
npm run check:production-migration-drift
npm run verify:helios-production-seed-readiness
npm run seed:helios-controls
npm run verify:helios-production-seed-readiness
npm run seed:helios-controls
npm run verify:helios-production-seed-readiness
curl -fsS https://splnit.eu/api/health
```

Explicitly not run:

```sh
npm run db:seed
npm run db:migrate
npm run db:migrate:production
```

## Migration drift gate

```json
{
  "databaseHostClass": "neon",
  "expectedMigrationCount": 28,
  "extraAppliedMigrationCount": 0,
  "latestExpectedMigration": "0027_drop_ico_format_check",
  "latestProductionMigrationCreatedAt": "1780177874665",
  "latestProductionMigrationInferredFromJournal": "0027_drop_ico_format_check",
  "migrationTableExists": true,
  "missingExpectedMigrations": [],
  "ok": true,
  "productionMigrationCount": 28
}
```

Result: passed. Production migration baseline matched committed source and had no extra applied migrations.

## Pre-seed verifier

The pre-seed verifier intentionally exited non-zero because the first-window baseline was empty. The parsed read-only summary matched the expected empty Helios baseline, so the seed window continued.

```json
{
  "actualHeliosControls": 0,
  "controlsMissingNis2Mappings": 19,
  "databaseNamePresent": true,
  "duplicateHeliosControlKeys": 0,
  "duplicateHeliosFrameworkMappings": 0,
  "expectedHeliosControls": 19,
  "missingExpectedControls": 19,
  "nis2HeliosMappings": 0,
  "serverVersionNumPresent": true,
  "target": {
    "databasePresent": true,
    "host": "ep-shy-poetry-alzdu6ud-pooler.c-3.eu-central-1.aws.neon.tech",
    "portPresent": false,
    "protocol": "postgresql",
    "sslMode": "require"
  },
  "unexpectedHeliosControls": 0,
  "userPresent": true
}
```

Gate result:

- expectedHeliosControls: 19
- actualHeliosControls: 0
- nis2HeliosMappings: 0
- missingExpectedControls: 19
- unexpectedHeliosControls: 0
- duplicateHeliosControlKeys: 0
- duplicateHeliosFrameworkMappings: 0
- controlsMissingNis2Mappings: 19

## Targeted seed run #1

Expected output lines were present:

```text
Targeted Helios control seed completed.
  controls upserted: 19
  NIS2 mappings reconciled: 19
```

## Post-seed verifier

```json
{
  "actualHeliosControls": 19,
  "controlsMissingNis2Mappings": 0,
  "databaseNamePresent": true,
  "duplicateHeliosControlKeys": 0,
  "duplicateHeliosFrameworkMappings": 0,
  "expectedHeliosControls": 19,
  "missingExpectedControls": 0,
  "nis2HeliosMappings": 19,
  "serverVersionNumPresent": true,
  "target": {
    "databasePresent": true,
    "host": "ep-shy-poetry-alzdu6ud-pooler.c-3.eu-central-1.aws.neon.tech",
    "portPresent": false,
    "protocol": "postgresql",
    "sslMode": "require"
  },
  "unexpectedHeliosControls": 0,
  "userPresent": true
}
```

Result: passed. Production now had 19 canonical Helios controls, 19 NIS2 mappings, and zero duplicate/missing/unexpected Helios state.

## Targeted seed run #2 — idempotency proof

Expected output lines were present again:

```text
Targeted Helios control seed completed.
  controls upserted: 19
  NIS2 mappings reconciled: 19
```

## Final verifier

```json
{
  "actualHeliosControls": 19,
  "controlsMissingNis2Mappings": 0,
  "databaseNamePresent": true,
  "duplicateHeliosControlKeys": 0,
  "duplicateHeliosFrameworkMappings": 0,
  "expectedHeliosControls": 19,
  "missingExpectedControls": 0,
  "nis2HeliosMappings": 19,
  "serverVersionNumPresent": true,
  "target": {
    "databasePresent": true,
    "host": "ep-shy-poetry-alzdu6ud-pooler.c-3.eu-central-1.aws.neon.tech",
    "portPresent": false,
    "protocol": "postgresql",
    "sslMode": "require"
  },
  "unexpectedHeliosControls": 0,
  "userPresent": true
}
```

Result: passed. The final verifier summary exactly matched the post-seed verifier summary, proving real production idempotency for the targeted seed.

## Public health check

```json
{"checks":{"databaseConfigured":true},"ok":true,"readiness":"/api/readiness","service":"splnit.eu","timestamp":"2026-06-01T09:53:44.864Z"}
```

Public health confirmed the app could reach its configured database after the seed.
This does not claim authenticated Helios UI verification.

## Final verdict

Helios production controls are live and proven for the honest scoped claim:

- 19 canonical `helios-*` controls present.
- 19 NIS2 mappings present.
- zero duplicate Helios control keys.
- zero duplicate Helios framework mappings.
- zero missing expected controls.
- zero unexpected Helios controls.
- targeted seed idempotency proven by second run plus exact final verifier match.
- no full seed, production migration, or unrelated production write was run.
