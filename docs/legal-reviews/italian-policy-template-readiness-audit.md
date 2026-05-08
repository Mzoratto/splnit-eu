# Italian Policy Template Readiness Audit

Last updated: 2026-05-09

Purpose: track whether Italian policy templates are ready to become customer-facing. This is an internal readiness audit, not a legal approval record.

## Current conclusion

Status: blocked from promotion.

Splnit.eu has 12 Italian draft policy templates available for advisor/legal review, but none have recorded reviewer decisions yet. They must remain non-customer-facing until an Italian advisor explicitly marks each family as `approved` in the review package and the corresponding code change promotes that template from `reviewStatus: "draft"` to `reviewStatus: "reviewed"`.

The current safe product behavior is correct: Italian tenants do not receive draft Italian policy templates in customer-facing template resolution. They continue to fall back to reviewed EU/English templates for the covered families.

## Evidence from this pass

Commands run on 2026-05-09:

```bash
npm run policies:export:template-review
npm run smoke:templates
```

Result:

```text
Wrote 12 draft templates to docs/legal-reviews/italian-policy-template-batch-1-review.md.
Policy template resolution smoke test passed.
```

The export refreshed:

- `docs/legal-reviews/italian-policy-template-batch-1-review.md`

The smoke verifies:

- Czech tenants resolve every template family to Czech reviewed templates.
- English-EU tenants resolve every template family to EU/English reviewed templates.
- Italian tenants resolve every template family to EU/English reviewed templates, not draft Italian templates.
- Italian draft templates are available through the review-export path only.
- Italian draft templates remain marked `draft`.
- Unknown template families fail loudly.
- Resolved customer-facing templates do not leak unresolved `{{...}}` placeholders.

## Draft template families awaiting advisor decision

| Template family | Current status | Customer-facing? | Required next action |
| --- | --- | --- | --- |
| `security_policy` | draft | No | Italian advisor decision in review package |
| `incident_response` | draft | No | Italian advisor decision in review package |
| `record_of_processing` | draft | No | Italian advisor decision in review package |
| `dpia` | draft | No | Italian advisor decision in review package |
| `data_processing_agreement` | draft | No | Italian advisor decision in review package |
| `subprocessor_list` | draft | No | Italian advisor decision in review package |
| `asset_inventory` | draft | No | Italian advisor decision in review package |
| `risk_assessment` | draft | No | Italian advisor decision in review package |
| `acceptable_use` | draft | No | Italian advisor decision in review package |
| `vendor_questionnaire` | draft | No | Italian advisor decision in review package |
| `business_continuity` | draft | No | Italian advisor decision in review package |
| `access_control` | draft | No | Italian advisor decision in review package |

## Reviewer package

Primary review file:

- `docs/legal-reviews/italian-policy-template-batch-1-review.md`

That package contains:

- allowed reviewer decisions: `approved`, `needs_changes`, `reject`
- one blank decision row per template family
- full draft template content
- source document references
- control-key coverage for each template

Reviewer question:

> Is this template suitable as an Italian SMB starting point for the stated document family, and are the legal/regulatory references accurate enough for customer use?

## Promotion gate

A template may only be promoted when all of the following are true:

1. The reviewer decision for that template family is `approved`.
2. Any reviewer notes or required edits have been applied.
3. The exact promoted template is still the version reviewed by the advisor, or the delta is separately reviewed.
4. `npm run smoke:templates` passes after promotion.
5. `npm run typecheck`, `npm run lint`, and `npm run build` pass before deployment.
6. The release notes and readiness docs state which Italian families were promoted.

No bulk promotion should happen just because the review package exists. Promotion is per family.

## Sales-safe wording

Allowed:

- "Italian draft templates are prepared for advisor review."
- "Italian tenants currently receive reviewed EU/English fallback templates until Italian legal review is complete."
- "Italian template promotion is pending advisor approval."

Do not claim yet:

- "Italian policy templates are approved."
- "Italian policies are legal-reviewed."
- "Italian templates are customer-ready."
- "Italian policy generation is fully localized."

## Next actions

1. Send `docs/legal-reviews/italian-policy-template-batch-1-review.md` to an Italian advisor.
2. Capture one decision per template family: `approved`, `needs_changes`, or `reject`.
3. Apply required edits for `needs_changes` families and re-export the review package.
4. Promote only approved families from `draft` to `reviewed` in `lib/policies/templates.ts`.
5. Re-run `npm run smoke:templates && npm run typecheck && npm run lint && npm run build`.
6. Deploy only after the promoted families are verified and documented.
