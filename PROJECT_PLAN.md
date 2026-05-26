# Splnit.eu Project Plan

Last updated: 2026-05-26

This is the single source of truth for current project direction. Older phase plans, outreach worksheets, and onboarding playbooks are archived under `docs/archive/` and should not drive work unless this file explicitly revives them.

## Product Reality

Splnit.eu is a solo-founder EU compliance automation product for SMBs. The current strategic order is:

1. Czech market first (`cs-CZ` default, no URL prefix).
2. English-EU second.
3. Italian tertiary.

Hard constraints:

- No fabricated customers, references, testimonials, logos, advisors, metrics, certifications, uptime, or legal-review status.
- No `Splnit Technology s.r.o.` references.
- No auditor-ready citation unless the source and mapping review status allow it.
- Czech market context must stay specific: NÚKIB for cybersecurity, ÚOOÚ for data protection, Act 264/2025 Coll., and Vyhláška č. 410/2025 Sb. where applicable.
- Public Trust Center pages expose category-level posture only, never individual controls, evidence filenames, test timing details, or attacker-useful implementation details.

## Current State

### Completed Or Mostly Complete

- Czech is the default locale. English uses `/en/`; Italian uses `/it/`.
- Public marketing, pricing, comparison, blog, partner, security, regulations, and NIS2 checker routes exist.
- Core app surfaces exist in code: dashboard, controls, frameworks, evidence, integrations, policies, vendors, risks, incidents, questionnaires, training, team/access reviews, billing/settings, agency, and Trust Center admin.
- NÚKIB/ÚOOÚ incident workflow, 72-hour countdown, and reporting fields exist.
- Trust Center, MSP/agency portal, vendor questionnaire flow, risk register, training records, access reviews, audit log, and NÚKIB regulatory feed exist.
- Pricing is sourced from `lib/stripe/plans.ts`; public UI must not hardcode plan names or prices.
- Public proof remains intentionally honest: no testimonials, customers, logos, SOC 2, ISO certification, or uptime claims without real evidence and owner approval.
- Italian outreach materials are preserved as archived context under `docs/archive/outreach/paused-italy-2026-05/`; they are not current operating instructions.

### In Progress

- Czech-first positioning and conversion work for design partners, MSPs, and SMB buyers.
- App hardening: export/report smokes, onboarding polish, provider-configured integration smokes, Stripe test-mode billing smoke, and broader action-level authorization coverage.
- Legal/counsel review: public legal pages, DPA, subprocessor, retention, and operator identity wording remain drafts until reviewed.
- Knowledge layer hardening: mapping/template promotion remains gated by review status.
- Policy-to-Evidence Loop: v1 exists for selected controls; do not broaden it until product review confirms the current pattern.

### Blocked

- Public legal/counsel closeout is blocked on exact approved OSVČ/operator identity, DPO/contact, DPA/subprocessor, and retention wording.
- Real testimonials/customer proof are blocked until design partners complete onboarding and give written consent.
- SOC 2, ISO certification, and pen-test claims are blocked until the external work is actually complete or formally in progress with an approved status line.
- Full NÚKIB portal API submission is blocked until NÚKIB publishes a stable API.

## Deprioritized Until Core App Stability

These are useful later, but not next:

- Broad Italian cold outreach.
- New jurisdictions beyond the current Czech-first, English-EU, and Italian-localized scope.
- Community, video onboarding, hiring, SOC 2 Type II, ISO certification for Splnit itself.
- More market pages unless they directly support Czech-first acquisition or buyer trust.

## Active Documentation Map

- `PROJECT_PLAN.md` - current plan and priority order.
- `docs/README.md` - documentation index and archive policy.
- `docs/audits/` - route, runtime, copy, billing, questionnaire, tranche, and production-readiness audits.
- `docs/verification/primary-flow-verification.md` - local database primary-flow verification record.
- `docs/plans/` - active or recent implementation plans.
- `docs/reviews/` - human/product review records.
- `docs/legal/` - counsel handoff drafts and legal/operator records.
- `docs/legal-reviews/` - mapping/template review evidence and reviewer work queues.
- `docs/operations/` - launch, export, offboarding, and support runbooks.
- `docs/product/business-entitlement-matrix.md` - plan entitlement and claim-boundary source.
- `docs/i18n/` and `docs/i18n-audits/` - localization process and audit records.
- `docs/decisions/` and `docs/architecture/` - decisions and architecture context that still affect implementation.
- `docs/weekly-reviews/` - weekly operating reviews.
- `docs/archive/` - historical plans, working notes, and paused outreach/playbook material.

## Root Directory Audit

Tracked root files are intentionally minimal for a Next.js/Vercel app:

- Keep: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `README.md`, `PROJECT_PLAN.md`, package/config files, Vercel/Playwright/Sentry/Drizzle configs.
- Keep ignored local directories: `.next/`, `node_modules/`, `.vercel/`, `.lighthouseci/`, `playwright-report/`, `test-results/`, `tmp/`.
- No stale root plan should remain outside `PROJECT_PLAN.md`.
- `.agents/skills/` is the canonical skills directory. Do not keep a local `agent-skills/` clone in the repo workspace unless temporarily refreshing upstream skills.

## Next Work Order

Do these before broad new feature work:

1. **Verify current PR and production deploy state:** keep GitHub and Codeberg `main` aligned; confirm CI, Vercel preview, and production smoke checks after merge.
2. **Product-review the Czech-first primary flow:** dashboard, controls, evidence, incidents, NIS2 checker, pricing, comparison, partner page, and security page.
3. **Audit/export endpoint smokes:** verify audit-log export pagination/limit behavior, org scoping, and stable output shape; verify buyer-visible vendor/risk/workspace export endpoints require auth and return only org-owned data.
4. **Onboarding UX polish:** refine onboarding and framework setup after export/report risk is contained.
5. **Legal/operator identity closeout:** publish final legal/customer-facing wording only when OSVČ/IČO/ARES/operator, DPO/contact, DPA/subprocessor, and retention terms are approved.
6. **Vendor-submitted evidence feature:** future, not the current sprint. If built later, vendor answers should become vendor-supplied draft evidence with explicit control mapping and human review before any auditor-facing claim.

Standing blockers that still apply across the work above:

- **Legal identity closeout:** replace placeholders only when real OSVČ/IČO/ARES details are available and reviewed.
- **Customer proof:** add testimonials/logos only after written consent.
- **Archived Italy outreach:** do not send from archived Italy materials unless this plan explicitly revives them.
- **Legal/template review:** keep jurisdiction-specific mappings and policy templates in the review queue until approved.

## Definition Of Ready For New Feature Work

- `npm run typecheck`, `npm run lint`, and `npm run build` pass on main.
- Primary Czech workflow has no critical unknowns.
- Production DB state is known and documented after real production env values are configured.
- Citation gates are verified.
- Current blocker list is shorter than the next feature's risk surface.
