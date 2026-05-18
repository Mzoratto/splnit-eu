# Policy-to-Evidence Loop v1 Review

Date: 2026-05-18
Status: v1 implemented and deployed for the `ctrl_mfa_all_users` and `ctrl_backup_tested` slices

## Implemented scope

- Added deterministic recommendation metadata for `ctrl_mfa_all_users`.
- Added the next deterministic recommendation slice for `ctrl_backup_tested`, reusing the existing security-policy support path and review-oriented proof status card.
- Added deterministic proof-state derivation from existing evidence rows and manual control status.
- Rendered the recommendation card on configured control detail pages when the recommendation exists.
- Linked the card to `/policies/security_policy`, `#evidence-upload`, and `#status-review`.
- Preserved existing evidence upload and manual status update flows.
- Kept dashboard priority-gap rows linked to `/controls/[controlKey]` and filtered intake `not_applicable` / `out_of_scope` controls out of the default dashboard priority list.
- Extended copy hygiene coverage over the policy-to-evidence control/detail helper surfaces.
- Extended production intake/profile smoke coverage to include the `ctrl_mfa_all_users` and `ctrl_backup_tested` policy-to-evidence control detail cards on desktop and mobile widths.

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

Production verification passed after deployment to `https://splnit.eu`:

- `npm run check:production-migration-drift`
- `curl -fsS https://splnit.eu/api/health`
- `npm run smoke:production-intake-profile`

The policy-to-evidence smoke covers:

- `ctrl_mfa_all_users` returns recommendation metadata.
- `ctrl_backup_tested` returns recommendation metadata.
- Unknown controls return `null`.
- The rendered recommendation card contains the policy link, evidence/status anchors, and no prohibited proof/compliance wording.
- Dashboard priority shaping filters not-applicable controls and sorts intake-priority controls first.
- Proof-state derivation covers no evidence, evidence-needs-review, reviewed pass, open issue, expired evidence, and not-applicable/out-of-scope.

The production intake/profile smoke now also covers the policy-to-evidence control detail path:

- `/controls/ctrl_mfa_all_users` renders for a temporary authenticated production org.
- `/controls/ctrl_backup_tested` renders for a temporary authenticated production org.
- The “Recommended next action” card renders with conservative review-oriented status when no supporting evidence exists.
- The security-policy link, evidence upload section, and status review section are present.
- Desktop and mobile widths have no horizontal overflow for the control-detail card.
- The smoke cleans up the temporary production organization and rows after the run.

## Not verified in this pass

- Evidence upload file persistence was not re-tested as a new behavior; the implementation intentionally reuses the existing org-scoped upload action/form.
- Manual status-update persistence was not re-tested as a new behavior; the implementation intentionally reuses the existing org-scoped status action/form.
- Additional controls beyond `ctrl_mfa_all_users` and `ctrl_backup_tested` are not configured for v1 recommendations.

## Production reliance notes

No new database migration was introduced by this v1 slice. Production drift guard passed before and after deployment.

Safe reliance boundary:

- Safe to rely on the narrow `ctrl_mfa_all_users` and `ctrl_backup_tested` recommendation/status cards and dashboard-to-control paths as production-smoked review-oriented workflows.
- Do not claim a complete Policy-to-Evidence Loop across all controls.
- Do not claim compliance, certification, auditor readiness, legal proof, or real-time compliance status from this flow.
- Public Trust Center output remains category-level; this v1 slice does not expose individual control IDs or evidence filenames publicly.
