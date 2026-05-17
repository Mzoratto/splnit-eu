# Policy-to-Evidence Loop v1 Review

Date: 2026-05-18
Status: Tasks 1-4 implemented locally; runtime/browser verification blocked by protected-route auth challenge in this environment

## Implemented scope

- Added deterministic recommendation metadata for `ctrl_mfa_all_users` only.
- Added deterministic proof-state derivation from existing evidence rows and manual control status.
- Rendered the recommendation card on `/controls/ctrl_mfa_all_users` when the configured recommendation exists.
- Linked the card to `/policies/security_policy`, `#evidence-upload`, and `#status-review`.
- Preserved existing evidence upload and manual status update flows.
- Kept dashboard priority-gap rows linked to `/controls/[controlKey]` and filtered intake `not_applicable` / `out_of_scope` controls out of the default dashboard priority list.
- Extended copy hygiene coverage over the policy-to-evidence control/detail helper surfaces.

## Honest proof/status behavior

The v1 helper emits these review-oriented states only:

- `no_supporting_evidence`: “No supporting evidence yet.”
- `draft_or_uploaded_evidence`: “Evidence added — needs review.”
- `reviewed_pass`: “Reviewed as passing with supporting evidence.”
- `reviewed_issue`: “Gap still open.”
- `not_applicable`: “Out of scope or not applicable based on intake/review.”

`pass` without current supporting evidence is still treated as `reviewed_issue` for the policy-to-evidence proof label. Expired-only evidence is also treated as `reviewed_issue`.

## Verification completed

Local/source checks passed:

- `npm run smoke:policy-evidence-loop`
- `npm run smoke:copy-hygiene`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

The policy-to-evidence smoke covers:

- `ctrl_mfa_all_users` returns recommendation metadata.
- Unknown controls return `null`.
- The rendered recommendation card contains the policy link, evidence/status anchors, and no prohibited proof/compliance wording.
- Dashboard priority shaping filters not-applicable controls and sorts intake-priority controls first.
- Proof-state derivation covers no evidence, evidence-needs-review, reviewed pass, open issue, expired evidence, and not-applicable/out-of-scope.

## Not verified in this pass

- Protected-route browser visual QA for `/controls/ctrl_mfa_all_users` was attempted locally but redirected to Clerk and then hit the accounts-domain Cloudflare/security challenge. No authenticated browser screenshot/desktop/mobile pass was completed in this environment.
- Evidence upload runtime behavior was not re-tested; the implementation intentionally reuses the existing upload action/form.
- Production behavior was not deployed or smoked.

## Production reliance notes

No new database migration was introduced by this v1 slice.

Before relying on this in production, run the normal pre-deploy checks and a targeted authenticated tenant smoke that confirms:

- Dashboard priority gap for `ctrl_mfa_all_users` links to `/controls/ctrl_mfa_all_users`.
- The control detail card renders for `ctrl_mfa_all_users` and not for unconfigured controls.
- The card layout has no overflow/overlap on desktop and mobile widths.
- Upload/status review flows still work for the active org.
- Public Trust Center output remains category-level and does not expose individual control IDs or evidence filenames.
