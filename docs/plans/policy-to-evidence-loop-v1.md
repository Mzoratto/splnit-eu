# Policy-to-Evidence Loop v1 Spec and Plan

Date: 2026-05-18
Status: Draft for owner/product review before implementation
Owner: Marco Zoratto / Splnit.eu

## Why this is the next phase

Intake prioritization is approved for the current deterministic MVP path. The next product step should turn one priority gap into a concrete buyer-useful workflow: what policy/evidence action should the customer take, what state does Splnit track, and what can be honestly shown later without implying compliance or certification.

This document intentionally defines one narrow v1 flow before coding. It should be reviewed before implementation.

## Assumptions

1. v1 should build on existing app surfaces instead of adding a new large module.
2. v1 should not require new AI behavior, new legal mappings, or Italian template promotion.
3. v1 should use existing org-scoped controls, policies, evidence, and intake-priority data.
4. v1 should be useful in buyer conversations but must avoid claims like compliant, auditor-ready, certified, or legally sufficient.
5. v1 should prefer a vertical slice that can be smoked locally and in production with a temporary tenant.

## Objective

Build a first Policy-to-Evidence Loop that helps a customer move from a prioritized control gap to a recommended action and visible proof state.

The user story:

- As an authenticated org user with intake-based priority gaps, I can open a priority control, see what evidence or policy action is recommended, upload or create the relevant support, and see an honest review-oriented status that shows progress without claiming compliance.

## Selected v1 flow

### Flow name

Priority control gap -> MFA evidence action -> proof status

### Control

Use existing control key:

- `ctrl_mfa_all_users`

Why this control:

- It is a concrete, common buyer/security-review gap.
- It has an existing evidence requirement in `lib/controls/evidence-requirements.ts`:
  - “Automated identity-provider snapshot showing MFA state for active user accounts, plus exception list with owner and review date.”
- It can be supported by existing integrations later, but v1 can work with manual evidence upload.
- It naturally connects to an existing broad security policy template without claiming the policy alone proves the control.

### Entry points

v1 should expose the loop from existing surfaces:

1. Dashboard priority gaps
   - When `ctrl_mfa_all_users` is a priority gap, provide a route to the control detail page.
2. Control detail page
   - Show the recommended policy/evidence action.
   - Show evidence status for the control.
   - Preserve existing upload/status-update behavior.
3. Policies page or policy detail page
   - If the recommended policy support is missing, link to the relevant policy template/draft path.

Do not create a separate “Policy-to-Evidence” top-level navigation item in v1 unless the existing surfaces cannot support the flow clearly.

## Recommended action definition

For `ctrl_mfa_all_users`, v1 recommendation:

- Primary evidence action:
  - Upload or connect evidence showing MFA status for active accounts and documented exceptions.
- Supporting policy action:
  - Review or generate/update the security policy so it describes MFA requirements, exceptions, ownership, and review cadence.
- Human review action:
  - Mark the control status manually after reviewing evidence and policy support.

Suggested product copy:

- Title: “Recommended next action”
- Evidence copy: “Add an identity-provider MFA export or screenshot showing active users, MFA state, exceptions, owner, and review date.”
- Policy copy: “Use the security policy to document the MFA rule and exception handling. A policy supports the review, but it does not prove the control by itself.”
- Status copy: “Evidence added — needs review” or “No supporting evidence yet”, not “compliant”.

## Evidence collection state

Use honest, review-oriented states derived from existing rows where possible:

1. `no_supporting_evidence`
   - No evidence rows exist for the control.
   - Copy: “No supporting evidence yet.”
2. `draft_or_uploaded_evidence`
   - At least one evidence row exists, but the control status is still `unknown` or `manual_review`.
   - Copy: “Evidence added — needs review.”
3. `reviewed_pass`
   - Control status is `pass` and evidence exists.
   - Copy: “Reviewed as passing with supporting evidence.”
4. `reviewed_issue`
   - Control status is `fail` and/or evidence is missing or expired.
   - Copy: “Gap still open.”
5. `not_applicable`
   - Control status or intake scope says not applicable/out of scope.
   - Copy: “Out of scope or not applicable based on intake/review.”

Do not create compliance labels in v1. Keep wording tied to internal review state and supporting evidence.

## Honest proof/status wording

Allowed:

- “Recommended next action”
- “Supporting evidence”
- “Evidence added — needs review”
- “Reviewed as passing with supporting evidence”
- “Gap still open”
- “Reason from intake”
- “Policy support”
- “This helps prepare for buyer/security review.”

Not allowed:

- “Compliant”
- “NIS2 compliant”
- “GDPR compliant”
- “Auditor-ready”
- “Certified”
- “Legal proof”
- “This satisfies Article …”
- “Real-time compliance status”

## v1 non-goals

- No new legal classification or applicability engine.
- No claim that a policy or evidence item proves compliance.
- No customer-facing auditor-ready report from this loop.
- No AI-generated remediation plan in v1.
- No automatic promotion of evidence to reviewed status.
- No Italian draft policy-template promotion.
- No integration-run automation requirement; manual evidence upload is enough for v1.
- No public Trust Center exposure of individual control IDs or evidence filenames.

## Technical approach

### Existing pieces to reuse

- Intake priority and rationale:
  - `org_intake_profiles.derived_scope`
  - `listOrgControlsForIndex`
  - dashboard priority gap data
- Control detail and mutation path:
  - `app/(app)/controls/[controlId]/page.tsx`
  - `app/(app)/controls/[controlId]/actions.ts`
  - `getControlDetailByKey`
  - `createManualEvidence`
- Evidence requirements:
  - `lib/controls/evidence-requirements.ts`
- Policy templates and drafts:
  - `lib/policies/templates.ts`
  - `lib/policies/resolve-template.ts`
  - `app/(app)/policies/[type]/page.tsx`
  - `upsertPolicyDraft`
- Status rows:
  - `org_control_statuses`
- Evidence rows:
  - `evidence`
- Policy-control links for generated policies:
  - `policy_controls`

### Preferred v1 shape

Add a small deterministic recommendation layer rather than scattering hard-coded copy through pages:

- `lib/policy-evidence/recommendations.ts`
  - Maps selected control keys to recommended action metadata.
  - v1 includes only `ctrl_mfa_all_users`.
  - Exposes a function like `getPolicyEvidenceRecommendation(controlKey)`.
- `lib/policy-evidence/status.ts`
  - Derives the honest proof state from existing control detail data.
  - Avoids schema change for v1 unless implementation proves existing rows cannot express the state.
- Control detail UI component:
  - `components/policy-evidence/recommended-action-card.tsx`
  - Rendered only when a recommendation exists for the control.

Avoid a DB migration in v1 unless needed after implementation discovery. Existing evidence/status/policy rows are probably sufficient for the first loop.

## Data model decision

Initial decision: no new table for v1.

Reason:

- Existing `evidence`, `policies`, `policy_controls`, `org_control_statuses`, and intake-derived priority data can express the first loop.
- A new “remediation tasks” table may be useful later, but it would expand scope before the product behavior is proven.
- Keeping v1 deterministic and derived reduces migration/deploy risk.

Revisit after v1 if Splnit needs explicit task assignment, due dates, reminders, audit trail for recommendation dismissal, or multi-action remediation workflows.

## UX requirements

### Control detail card

For `ctrl_mfa_all_users`, render a card near the evidence upload/status area:

- Header: “Recommended next action”
- Short explanation of why the action matters.
- Evidence requirement text from the deterministic recommendation.
- Policy-support text and link to `/policies/security_policy`.
- Current proof state label.
- Primary CTA:
  - If no evidence: focus/lead to existing upload form.
  - If evidence exists and status is not reviewed: lead to status review controls.
  - If reviewed pass: show non-claiming completion state.

### Dashboard priority gap behavior

If dashboard priority gaps already link to controls, preserve that behavior. If not, add a control-detail link for the selected v1 recommendation.

### Policy page behavior

Do not add new generated-policy behavior unless existing draft/save flows support it safely. Linking to the security policy detail page is enough for v1.

## Acceptance criteria

1. When `ctrl_mfa_all_users` is available to the active org, its control detail page shows the recommended next action card.
2. The card states the evidence requirement and links to the security policy detail page.
3. The card derives one of the v1 honest proof states from existing evidence/status data.
4. The upload and manual status flows remain unchanged and org-scoped.
5. No UI copy claims compliance, certification, legal sufficiency, auditor readiness, or real-time compliance status.
6. Existing controls without recommendations do not show a broken or generic recommendation card.
7. The flow remains usable for orgs without intake profiles; it should not crash or imply intake certainty.
8. Public Trust Center output remains category-level only and does not expose this control-level loop.

## Verification strategy

Narrow checks during implementation:

- Unit or smoke coverage for recommendation/status derivation.
- Existing controls page/control detail tests where practical.
- Copy hygiene smoke:
  - `npm run smoke:copy-hygiene`
- Type/lint/build before commit:
  - `npm run typecheck`
  - `npm run lint`
  - `npm run build`

Production reliance later requires:

- Run existing migration drift guard before deploy if any migration is introduced.
- Run a targeted smoke with a temporary production org if the flow changes production behavior.
- Confirm no public Trust Center control/evidence detail leaks.

## Implementation plan

### Task 1: Add deterministic recommendation/status helpers

Acceptance:

- `ctrl_mfa_all_users` returns a recommendation with evidence text, policy link/type, and allowed copy.
- Unknown controls return `null`.
- Proof status derivation covers no evidence, evidence-needs-review, reviewed pass, open issue, and not-applicable.

Verification:

- Add focused tests or a small smoke script for helper outputs.
- `npm run typecheck`.

Likely files:

- `lib/policy-evidence/recommendations.ts`
- `lib/policy-evidence/status.ts`
- `tests` or `scripts` coverage, following existing project pattern.

### Task 2: Render the recommendation card on control detail

Acceptance:

- `ctrl_mfa_all_users` detail page renders the v1 card.
- Card links to `/policies/security_policy`.
- Card uses honest review/proof wording only.
- Other controls do not render the card unless configured.

Verification:

- Browser check desktop and mobile for the control detail page.
- `npm run typecheck`.

Likely files:

- `components/policy-evidence/recommended-action-card.tsx`
- `app/(app)/controls/[controlId]/page.tsx`
- locale/message files if copy is localized now instead of plain English fallback.

### Task 3: Ensure dashboard priority gaps route cleanly into the loop

Acceptance:

- A priority gap for `ctrl_mfa_all_users` has a clear path to `/controls/ctrl_mfa_all_users`.
- Existing intake-priority behavior is preserved.
- No out-of-scope/not-applicable controls are promoted by default.

Verification:

- Existing intake prioritization smoke still passes locally or with the narrowest available test.
- `npm run typecheck`.

Likely files:

- `app/(app)/dashboard/page.tsx`
- dashboard query/helpers if links are missing today.

### Task 4: Add copy-hygiene guard coverage for loop wording

Acceptance:

- Guard fails on prohibited phrases in the new policy-to-evidence surfaces.
- Guard permits the approved review-oriented copy.

Verification:

- `npm run smoke:copy-hygiene`.

Likely files:

- `scripts/smoke-copy-hygiene.ts`

### Task 5: End-to-end local/browser verification and docs update

Acceptance:

- User can start at dashboard priority gap, open the control detail, see the recommendation, upload evidence where env permits, and update/review status.
- Mobile/desktop layout has no overflow/overlap.
- Docs record what is proven and what remains unproven.

Verification:

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- Targeted browser verification.

Likely files:

- `docs/audits/app-readiness-audit.md`
- `docs/reviews/policy-to-evidence-loop-v1.md` after implementation/smoke

## Checkpoints

### Before coding

- [ ] Owner/product review of this spec.
- [ ] Confirm `ctrl_mfa_all_users` is the right first slice.
- [ ] Confirm v1 should avoid schema changes unless discovery proves they are necessary.

### After Tasks 1-2

- [ ] Recommendation and status derivation are implemented and visible on the selected control detail page.
- [ ] Copy does not overclaim.
- [ ] Typecheck passes.

### After Tasks 3-5

- [ ] Dashboard-to-control loop works.
- [ ] Copy hygiene, typecheck, lint, and build pass.
- [ ] Browser verification covers desktop and mobile.
- [ ] Docs are updated with actual proof, not assumptions.

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| The loop sounds like compliance proof | High | Use review-oriented labels only; extend copy hygiene guard. |
| v1 becomes a generic remediation/task system | High | Keep only one deterministic control recommendation in v1. |
| Evidence state is ambiguous | Medium | Derive simple labels from existing evidence count and control status; avoid hidden magic. |
| Policy support is mistaken for evidence | Medium | Copy must explicitly say policy supports review but does not prove the control by itself. |
| Existing policy templates are jurisdiction-sensitive | Medium | Link to existing resolver/template page; do not promote Italian draft templates. |
| Production schema drift | Low if no migration | Avoid schema change in v1; if migration becomes necessary, use the production drift guard and deploy-window migration process. |

## Open questions for review

1. Is `ctrl_mfa_all_users` the right first buyer-useful flow, or should v1 use a policy-heavy control such as incident response plan or security policy baseline?
2. Should v1 copy be localized immediately in `messages/*`, or is English-only internal/app copy acceptable for the first implementation slice?
3. Should a reviewed-pass state require evidence to be non-expired, or only require at least one evidence row plus manual `pass` status?
4. Should the policy link create/update a draft automatically later, or should v1 only link to the policy detail page?
