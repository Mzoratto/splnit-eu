# Trust Center public disclosure model

Last updated: 2026-06-02
Status: T4-F product/security decision record. This is an engineering/legal-public proof boundary, not final counsel approval for all public legal copy.

## Decision

Splnit.eu retains the aggregate-only public Trust Center model for T4-F.

Public Trust Center surfaces may expose category/framework-level aggregate counts/scores. This includes framework-level readiness scores, total/in-progress/available-evidence/not-applicable counts, and category-level status totals where the route is intentionally public.

This model is APPROVED aggregate-only for T4-F because it avoids publishing individual implementation details while still giving buyers a bounded public readiness signal.

## Publicly allowed

Public Trust Center UI and API may show:

- organisation name and public Trust Center slug;
- visible framework slugs/status labels;
- category/framework-level aggregate counts/scores;
- category names and category-level status summaries;
- document titles and locked/unlocked state;
- bounded readiness/evidence wording.

## Publicly forbidden

Public Trust Center UI and API must not expose individual control IDs, control keys, evidence filenames, Blob URLs, raw evidence descriptions, individual test results, exact run timestamps, next-test timing details, internal audit timing, or attacker-useful implementation detail.

The public model intentionally sets exact test timing fields to null and keeps live-test indicators disabled. Month-level assessment display in the UI is acceptable for category/framework context, but the public API must not return exact test timing fields.

## Copy boundary

Public Trust Center trust signals must not say "Compliant since <year>", "GDPR compliant", "certified", "auditor-ready", or equivalent completion/coverage overclaims.

Allowed style: bounded readiness/evidence wording such as "Readiness evidence since <year>". This indicates that internal evidence exists from a coarse period; it is not a legal compliance opinion or certification claim.

## Vendor-submitted proof boundary

Vendor-submitted questionnaire answers are vendor-reported inputs for manual review. They may inform vendor risk reporting, but they must not automatically create passing control evidence, certification proof, or customer compliance claims.

If vendor answers are later converted into first-class evidence, the provenance must remain vendor_reported/manual_review until an authenticated reviewer explicitly promotes it under an approved evidence/status mapping.

## Future changes

Any expansion beyond this aggregate-only model, including individual control disclosure, evidence-file disclosure, exact test timing, detailed implementation notes, or replacing numeric aggregates with labels/buckets, requires a separate product/security decision and legal/public-claim review.

## Verification

The T4-F source smoke enforces this decision:

```sh
npm run smoke:t4f-legal-public-proof
```

It checks the durable decision record, Trust Center API/UI disclosure boundaries, narrowed compliance wording, vendor-reported/manual-review provenance, and expanded source coverage for private buyer-proof export/report routes.
