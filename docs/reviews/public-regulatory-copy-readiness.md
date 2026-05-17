# Public regulatory copy readiness review

Date: 2026-05-17
Reviewer: Hermes agent-assisted copy/product review
Status: Approved for current public-site honesty gate on local `main`
Commit: `b159333 Harden public regulatory copy claims`
Deployment status: Not deployed in this pass. This records the repository state after local verification.

## Scope

Reviewed and hardened public copy that can imply legal classification, complete obligations coverage, auditor readiness, real-time compliance proof, or guaranteed setup speed.

Touched surfaces:

- `app/(marketing)/predpisy/page.tsx`
- `lib/marketing/platform-copy.ts`
- `messages/cs-CZ.json`
- `messages/en-EU.json`
- `messages/it-IT.json`
- `scripts/smoke-copy-hygiene.ts`

## Decision

Approved for the current honest public-site baseline.

The public regulation/resources and platform pages now frame regulatory content as an indicative starting point, not a legal determination or compliance guarantee. The platform page now describes published Trust Center output as a control-status/posture summary chosen by the customer, not a live compliance status claim.

## What changed

### Regulation and lead-capture wording

- Replaced “Which EU regulations apply to you?” / equivalent Czech and Italian copy with “may matter” / “may be relevant” wording.
- Replaced “Who must comply” with “Who may be in scope”.
- Replaced “What needs to be provable” with “What often needs evidence or review”.
- Reframed resource/download copy as indicative overviews, draft templates, and checklists for review.
- Removed personalized obligations framing from the lead capture block and replaced it with an indicative starting-point framing.

### Platform wording

- Removed fixed “setup in 5 minutes” claims.
- Softened “continuously tests” to “helps check security settings over time”.
- Softened direct “MFA satisfies NIS2/GDPR/ISO” wording to “can support” when it matches scope and evidence.
- Removed “compliance status in real time” from Trust Center copy.
- Replaced auditor-ready framing with review/control-posture wording.

### Guardrail added

`npm run smoke:copy-hygiene` now includes public regulatory/resource claim guards for:

- direct applicability claims;
- direct “must comply” labels;
- complete/free download-pack claims;
- real-time compliance status claims;
- fixed setup-speed claims;
- direct “control satisfies regulation” claims;
- auditor-documentation-ready framing.

## Verification

Commands run after the copy and guard updates:

- `npm run smoke:copy-hygiene` — passed
- `npm run typecheck` — passed
- `npm run lint` — passed
- `npm run build` — passed

Build note: Next.js emitted the existing warning that using edge runtime on a page disables static generation for that page.

## Current claim boundaries

Allowed public framing:

- Splnit.eu provides EU compliance automation workflows for NIS2, GDPR, ISO 27001, EU AI Act, and related readiness work where implemented.
- Public regulation pages are plain-language, indicative overviews and starting points.
- Controls and evidence can support review and buyer-readiness workflows when they match the customer’s scope and evidence.
- Public Trust Center pages show customer-published category/control-posture summaries only.

Still not allowed:

- Legal advice or legal classification claims.
- Claims that a regulation definitively applies to a visitor or customer based only on marketing/tool input.
- Claims of compliance, certification, audit readiness, or regulator acceptance.
- Claims of complete obligations coverage unless the reviewed knowledge base and legal review support it.
- Real-time compliance status claims.
- Exact setup-time guarantees.

## Remaining production/public-site caveats

- This pass was verified locally and committed; it was not deployed.
- Public legal pages remain engineering/counsel drafts until the Czech-first legal closeout is completed.
- Italian policy templates remain draft and fall back to reviewed EU English templates where required.
- Stripe billing still needs a real Stripe test-mode end-to-end smoke before production billing readiness can be claimed.
- Provider-configured integration smokes, audit/export pagination smokes, and broader secondary-surface hardening remain separate readiness work.
