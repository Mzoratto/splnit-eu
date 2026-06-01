# Splnit.eu Project Plan

Last updated: 2026-06-01

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
- Authenticated production primary-flow proof is green for the narrowed buyer-critical path: live Clerk org creation, six-step onboarding, dashboard redirect, NIS2 assessment, control status persistence, evidence upload, evidence download, Italian primary pages, and database verification. Policy PDF and gap-report PDF generation are separate proof gates, not covered by that smoke.
- Production migration drift was reconciled after the organisation identifier fix; current recorded production state has 28 expected and 28 applied migrations through `0027_drop_ico_format_check`.
- Helios is now at the live manual ERP workspace tier: 19 canonical `helios-*` controls, 19 NIS2 mappings, targeted seed/readiness verifier, live manual attestation/user-flow smoke coverage, CSV-assisted manual evidence import, claim-safety guard, and a recorded owner-approved production seed window on GitHub `main`.
- Helios production boundary: Helios controls are seeded and verified in production; authenticated Helios workspace attestation and CSV upload are proven in local/preview smoke coverage, not yet by a logged-in production smoke against the live seed.
- Live integration adapters exist in code for Microsoft 365, GitHub, AWS, Hetzner Cloud, OVHcloud, and ABRA Flexi via `lib/integrations/registry.ts`. Their proof level must be tracked per provider: source adapter and smoke coverage are not the same as a customer-connected production tenant proof.
- ABRA Flexi remains the Czech ERP runtime adapter. Helios and Pohoda are manual/workspace-tier surfaces, not runtime/API adapter integrations.
- EU AI Act exists as a mapped manual-control framework in the product, with controls such as AI inventory, AI literacy, prohibited-practices review, high-risk provider verification, human oversight, log retention, individual notice, and content labeling. It is not an automated live-adapter framework and should be marketed as readiness/guidance unless mapping review status supports stronger wording.
- Stripe subscription primitives exist: Checkout session creation, Customer Portal session creation, signed webhook verification, subscription persistence, plan-gate enforcement, invoice/cancellation email paths, and local/test smoke coverage for billing logic.
- Pricing is sourced from `lib/stripe/plans.ts`; public UI must not hardcode plan names or prices.
- Public proof remains intentionally honest: no testimonials, customers, logos, SOC 2, ISO certification, or uptime claims without real evidence and owner approval.
- Italian outreach materials are preserved as archived context under `docs/archive/outreach/paused-italy-2026-05/`; they are not current operating instructions.

### Capability Tiers And Claim Boundaries

| Tier | Meaning | Current examples | Claim boundary |
|------|---------|------------------|----------------|
| Live integration adapter | Provider-specific adapter registered in `lib/integrations/registry.ts` that can run automated checks when a tenant connects credentials and grants required permissions. | Microsoft 365, GitHub, AWS, Hetzner Cloud, OVHcloud, ABRA Flexi. | May say automated checks exist for configured integrations. Do not imply every listed adapter is production-proven for a real customer tenant until that provider has a recorded live/customer-connected proof. |
| API-key connector | Credential-based connector with provider-specific health/check logic. | AWS IAM access key flow, Hetzner API token, OVHcloud credentials, ABRA Flexi connection primitives. | Say connector/checks are available where credentials and permissions are configured. Do not call it continuous compliance unless scheduling/evidence freshness is proven. |
| Manual ERP workspace | Guided workspace/checklist with mapped controls, manual attestation, evidence upload, and progress visibility. | Pohoda, Money S3 / S4, Helios; Helios has the strongest seed/CSV proof today. | Say workspace/manual readiness review. Do not call it native API automation. |
| CSV-assisted manual evidence import | Strict import path that converts customer-reported CSV rows into manual-review/gap evidence candidates. | Helios CSV import. | CSV imports are customer-reported and must not produce `pass` automatically. |
| Regulation guide / mapped manual framework | Framework appears in intake, controls, templates, or public guidance, but relies on manual evidence and reviewed mappings. | EU AI Act, GDPR, ISO 27001, NIS2/ZoKB depending on review status. | Say readiness/guidance/mapped controls according to review status. Do not imply legal certification or automated regulator submission. |
| Public/regulatory content | Plain-language marketing or educational pages. | `/predpisy`, NIS2 checker, blog/regulation pages. | Must remain indicative, source-backed, and not auditor-ready unless source/mapping review supports it. |

### In Progress

- Czech-first positioning and conversion work for design partners, MSPs, and SMB buyers.
- App hardening: export/report smokes, policy/gap-report PDF proof after the narrowed primary-flow pass, onboarding polish, provider-configured integration smokes, and broader action-level authorization coverage.
- Stripe readiness: local/test billing logic is partially proven, but browser-completed Stripe-hosted Checkout, Customer Portal, and Stripe-delivered webhook forwarding remain unproven. Do not claim production billing readiness until those are green and counsel-approved payment/liability wording is available.
- Legal/counsel review: public legal pages, DPA, subprocessor, retention, liability/payment wording, DPO/contact wording, and OSVČ/operator identity presentation remain drafts until reviewed. The working OSVČ identity exists, but publication wording still needs final approval.
- Knowledge layer hardening: mapping/template promotion remains gated by review status.
- Policy-to-Evidence Loop: v1 exists for selected controls; do not broaden it until product review confirms the current pattern.
- ERP parity follow-up: Helios is now stronger than Pohoda on canonical production seed proof and CSV-assisted import. Pohoda can remain the older reference workspace, but if ERP parity is important, add Pohoda seed hardening and/or CSV import as a separate scoped lane.

### Blocked

- Public legal/counsel closeout is blocked on exact approved OSVČ/operator identity, DPO/contact, DPA/subprocessor, and retention wording.
- Paid Stripe design-partner onboarding is blocked until counsel-approved payment/liability terms and live-mode billing proof are complete. A free or manually invoiced pilot can proceed if product/legal wording is clear.
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

1. **Reconcile working state before release work:** align local `main`, GitHub `main`, and any mirror/deploy branch; keep dirty/untracked docs and package changes intentional. Do not deploy from a stale local `main`.
2. **Finish Stripe hosted proof:** run browser-hosted Stripe test Checkout, Customer Portal, and Stripe-delivered webhook forwarding in a safe sandbox/test setup; record redacted evidence. Keep live-mode Stripe disabled until counsel/payment terms and live smoke are ready.
3. **Close legal/template gaps for the first Czech design partner:** finalize customer-facing operator identity wording, DPA/subprocessors/retention/liability/payment terms, and decide whether CZ/EU RoPA templates are required before onboarding.
4. **Product-review the current Czech-first primary flow and public claim surfaces:** dashboard, onboarding, controls, evidence, Helios workspace/CSV import, incidents, NIS2 checker, pricing, comparison, partner page, security page, `/platform`, and SoftwareApplication JSON-LD. Reconcile `/platform` copy against the capability-tier table, especially “automatic checks,” “manual evidence,” “internal systems,” and AI Act wording. Capture gaps as audit items instead of silently polishing everything.
5. **Choose the next Czech moat lane:** either harden Pohoda toward Helios-level seed/import proof, add public WEDOS/Forpsi/VSHosting DNS/TLS/email checks, or implement framework maturity labels. Do not run all three at once.
6. **Audit/export endpoint smokes:** verify audit-log export pagination/limit behavior, org scoping, stable output shape, and buyer-visible vendor/risk/workspace export auth/ownership boundaries.
7. **Onboarding UX polish:** refine onboarding and framework setup only after the proof/legal/billing gates above are not blocking the first design-partner path.
8. **Vendor-submitted evidence feature:** future, not the current sprint. If built later, vendor answers should become vendor-supplied draft evidence with explicit control mapping and human review before any auditor-facing claim.

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
