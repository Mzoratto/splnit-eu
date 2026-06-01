# Helios production seed readiness

T3 scope is a safety/readiness gate only. T3 does not run the production Helios seed, does not deploy, does not run production migrations, and does not perform any production database write.

## Read-only verifier

Use this command to verify a selected database target without exposing credentials:

```sh
npm run verify:helios-production-seed-readiness
```

The verifier opens a read-only transaction and prints only redacted target metadata, presence flags, and counts. It checks that the selected target has exactly the 19 expected `helios-*` controls, all 19 have NIS2 framework mappings, no expected controls are missing, no unexpected Helios controls exist, and there are no duplicate Helios control keys or duplicate Helios NIS2 mappings.

## Later human-approved production sequence

After an owner approves the deploy window and target:

1. Point `DATABASE_URL` at the intended target and run the read-only verifier to confirm current target metadata and counts.
2. Deploy application changes if applicable.
3. During the approved deploy window, run the targeted seed only with explicit owner approval:
   `npm run seed:helios-controls`
4. Rerun the read-only verifier:
   `npm run verify:helios-production-seed-readiness`
5. Record the redacted verifier output in the operations log.

## Copy boundary

Until a real Helios adapter exists, product and marketing copy must not claim Helios native/API/runtime automation. Safe phrasing includes `Helios workspace/checklist`, `manual readiness review`, `CSV-assisted evidence import`, and `not an automated Helios API connection`.
