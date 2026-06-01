# Helios production seed window checklist

Use this checklist for the first owner-approved Helios production data write.

This is a production data-write runbook, not a migration runbook. The production migration guard protects `db:migrate:production`; it does not protect the Helios seed path. Treat the seed as a separate, manually gated production write.

## Current required preconditions

- PR #35 migration guard is merged before the Helios feature.
- PR #34 Helios integration is merged after the guard.
- GitHub `main` is deployed to production.
- `npm run check:production-migration-drift` passes from landed `main`.
- Public production health is OK.
- Owner has explicitly approved this seed window.
- Operator is using landed `main`, not a stale dirty checkout.
- `DATABASE_URL` points to the intended production Neon target.
- No full `npm run db:seed` is used in this window.

## Stop conditions

Stop immediately if any of these happen:

- Redacted target metadata does not match the intended production target.
- Migration drift check fails or reports extra/missing applied migrations.
- The pre-seed verifier reports partial Helios state that was not expected.
- The pre-seed verifier reports duplicate Helios control keys or duplicate Helios NIS2 mappings.
- The post-seed verifier does not report exactly 19 Helios controls and 19 NIS2 Helios mappings.
- The second seed run changes the verifier result or produces any unexpected output.
- Any command wants credentials printed, a raw DB URL pasted into logs, or broad `db:seed` execution.

## Exact command sequence

Run from a clean checkout/worktree at landed GitHub `main`.

```sh
git fetch github main --prune
git switch main
git status --short
git log -1 --oneline github/main
```

Expected:

- `git status --short` is clean, or only explicitly understood local-only files are present and not used by the seed.
- Latest GitHub main is the Helios merge commit or newer.

### 1. Reconfirm migration drift, read-only

```sh
npm run check:production-migration-drift
```

Expected:

- `ok: true`
- `extraAppliedMigrationCount: 0`
- no missing expected migrations
- latest expected migration matches latest production migration inferred from the journal

### 2. Pre-seed Helios readiness verifier, read-only

```sh
npm run verify:helios-production-seed-readiness
```

Capture the full redacted JSON output in the operations log.

For the first production seed window, expected pre-seed result may fail because the 19 Helios controls are not present yet. That is acceptable only if the failure is exactly the expected empty/missing-Helios baseline:

- target metadata matches intended production
- expectedHeliosControls: 19
- actualHeliosControls: 0
- nis2HeliosMappings: 0
- missingExpectedControls: 19
- unexpectedHeliosControls: 0
- duplicateHeliosControlKeys: 0
- duplicateHeliosFrameworkMappings: 0
- controlsMissingNis2Mappings: 19

If the pre-seed verifier shows a partial state, duplicates, unexpected controls, or the wrong target, stop and investigate. Do not seed over ambiguous state.

If production was already seeded by a prior approved window, expected pre-seed result is instead the clean post-seed state listed in step 4. In that case, skip the first write unless there is an explicit reason to reconcile.

### 3. Targeted Helios seed only

```sh
npm run seed:helios-controls
```

Expected output:

- `Targeted Helios control seed completed.`
- `controls upserted: 19`
- `NIS2 mappings reconciled: 19`

Do not run:

```sh
npm run db:seed
```

### 4. Post-seed Helios verifier, read-only

```sh
npm run verify:helios-production-seed-readiness
```

Expected clean state:

- target metadata matches intended production
- expectedHeliosControls: 19
- actualHeliosControls: 19
- nis2HeliosMappings: 19
- missingExpectedControls: 0
- unexpectedHeliosControls: 0
- duplicateHeliosControlKeys: 0
- duplicateHeliosFrameworkMappings: 0
- controlsMissingNis2Mappings: 0
- final line: `Helios production seed readiness passed.`

### 5. Real-target idempotency proof

Run the targeted seed a second time:

```sh
npm run seed:helios-controls
```

Then run the verifier again:

```sh
npm run verify:helios-production-seed-readiness
```

Expected:

- seed output remains `controls upserted: 19` and `NIS2 mappings reconciled: 19`
- verifier output is unchanged from the clean post-seed state
- no duplicates appear
- no unexpected Helios controls appear

### 6. Optional public/app smoke after data write

Public health only proves the app and DB are reachable:

```sh
curl -fsS https://splnit.eu/api/health
```

Authenticated Helios UI proof requires a production session and should be recorded separately. Do not claim protected-route UI verification from signed-out curl output.

## Completion criteria

Helios production controls are live only after all of these are true:

- pre-seed target metadata was checked and logged redacted
- targeted seed ran once successfully
- post-seed verifier showed 19/19 controls and mappings, zero duplicates, zero missing, zero unexpected
- targeted seed ran a second time successfully
- final verifier output remained clean
- no full seed, production migration, or unrelated production write was run

## Operations log template

```text
Date/time UTC:
Operator:
GitHub main commit:
Production deployment ID/URL:
Migration drift result: ok=true, expected=<n>, production=<n>, latest=<migration>
Pre-seed verifier summary:
Seed run #1 output:
Post-seed verifier summary:
Seed run #2 output:
Final verifier summary:
Public health result:
Notes / anomalies:
```
