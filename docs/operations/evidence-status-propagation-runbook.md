# Evidence status propagation runbook

Manual evidence writes now propagate the human-approved assessment result into `org_control_statuses.status` and recalculate enrolled framework scores.

## Canonical mapping

- `pass` -> `pass`
- `manual_review` -> `manual_review`
- `gap` -> `fail`
- `warning` -> `warning`
- `not_applicable` -> `not_applicable`
- `unknown` -> `unknown`

Human approval recorded during T4: `gap` maps to existing control status `fail`; no new first-class `gap` control status is added in this tranche.

## Production escape hatch

Set this only as an incident rollback/containment measure:

```bash
SPLNIT_MANUAL_EVIDENCE_STATUS_PROPAGATION=disabled
```

Accepted disabled values are `disabled`, `false`, and `0`.

When disabled, manual evidence keeps the legacy behavior: it records the evidence row and `lastEvidenceAt`, but leaves the control status as `unknown` and does not recalculate framework scores. Remove the flag to restore propagation.

## Verification

Use a local or disposable database only:

```bash
npm run smoke:manual-evidence-status-propagation
```

The smoke verifies enabled behavior and all three opt-out values. Do not run DB-mutating smokes against production.
