# Splnit.eu Product Status

Last updated: 2026-06-01

## One-line definition

Splnit.eu is a Czech-first compliance evidence workspace for small and medium-sized enterprises that need to prepare, organize, and explain cybersecurity and data-protection evidence for NÚKIB-related obligations, primarily NIS2 / ZoKB readiness under Act 264/2025 Coll. and related Czech requirements.

It is not a law firm, certification body, auditor, or automatic proof that a company is compliant.

## Target customer

Primary target:

- Czech small and medium-sized enterprises.
- Companies that must show security governance, access-control, continuity, supplier, incident, and evidence posture to buyers, auditors, partners, or NÚKIB-facing processes.
- Manufacturing, logistics, IT service, MSP-supported, ERP-heavy, and supplier-chain companies that run common Czech business systems.

Current strongest niche:

- Czech SMEs that need a one-sitting intake -> ranked gaps -> recommended integration/workspace -> first evidence loop.
- Czech ERP/security context where buyers ask for proof, not just policy documents.
- NÚKIB/ZoKB readiness where the company needs a clear evidence trail and gap list before counsel, auditor, MSP, or security vendor review.

## What the product does

Splnit.eu helps an SME answer four practical questions:

1. What rules and controls likely apply to us?
2. What evidence do we already have?
3. What gaps need work before buyer/auditor/regulator conversations?
4. What should we collect, review, or fix next?

The product currently combines:

- Public readiness and education pages.
- Authenticated onboarding and intake.
- Framework/control mapping.
- Evidence upload and evidence state tracking.
- Integration-backed checks where a supported adapter exists.
- Manual ERP workspaces for Czech systems.
- CSV-assisted evidence import for Helios templates.
- Remediation tasks for stale evidence and reported gaps.
- Trust Center and export-oriented buyer-readiness surfaces.

## Current positioning and claim boundary

Safe positioning:

> Splnit.eu helps Czech SMEs prepare NIS2/ZoKB evidence, organize gaps, and build a buyer-ready compliance record using guided workflows, mapped controls, manual evidence review, and selected integration checks.

Unsafe positioning unless future proof exists:

- “Automatically proves NIS2 compliance.”
- “Certified by NÚKIB.”
- “Auditor-ready out of the box.”
- “Native Helios API automation is live.”
- “All evidence is collected automatically.”
- “Legal/counsel reviewed.”
- “SOC 2 / ISO certified.”
- “Used by named customers” without consent and real proof.

## Functional implementation status

Legend:

- Live / functional: implemented and verified enough to be used with the stated claim boundary.
- Partial: implemented in code or smoke-tested in a narrower scope, but not fully production-proven or not complete enough for broad claims.
- Missing / blocked: not implemented, externally blocked, or not safe to claim.

### Product and app shell

| Area | Status | What exists | Claim boundary |
|---|---|---|---|
| Public marketing site | Live / functional | Czech-first public routes, pricing, comparison, partner, security/status, regulations, blog, NIS2 checker. | Must stay indicative and proof-backed. No fake customers, logos, certifications, or legal-review claims. |
| Localization | Live / functional | Czech default, English-EU and Italian localized routes/messages. | Czech is the primary market. Italian is tertiary and not current GTM focus. |
| Authenticated app shell | Live / functional | Dashboard, controls, frameworks, evidence, integrations, policies, vendors, risks, incidents, questionnaires, team/access reviews, agency, settings. | Some surfaces exist but not all are production-smoked end to end. |
| Primary buyer-critical flow | Live / functional for narrowed path | Live Clerk org creation, six-step onboarding, dashboard redirect, NIS2 assessment, control status persistence, evidence upload/download, database verification. | Does not cover every app route, policy PDF, or gap-report PDF. |
| Production DB migration state | Live / functional | Production migrations reconciled through `0028_great_wasp`; expected 29, production 29, drift ok. | Deploys still need drift gate before runtime changes. |

### Compliance and framework coverage

| Area | Status | What exists | Claim boundary |
|---|---|---|---|
| NIS2 / Czech ZoKB readiness | Partial to strong, Czech-first | NIS2 controls/mappings, NÚKIB/ZoKB contextual guidance, Helios mappings, incident workflow, evidence model. | Readiness/evidence preparation. Not legal classification or formal NÚKIB approval. |
| GDPR | Partial | GDPR controls, privacy/legal drafts, Article 30 internal processing map draft, privacy templates. | Customer-facing CZ/EU RoPA template is still a gap. Counsel review still needed. |
| ISO 27001 | Partial | Framework/control surfaces and export/certification-package route exist. | Do not imply Splnit or a customer is ISO certified. |
| EU AI Act | Partial / manual guidance | Mapped manual controls and public/regulatory content exist. | Not automated. Market as readiness/guidance unless review status supports stronger wording. |
| Mapping/source review | Partial | Legal review queues and mapping-review agent workflows exist. | Unreviewed mappings/templates stay review-bound. |

### Evidence and remediation loop

| Area | Status | What exists | Claim boundary |
|---|---|---|---|
| Evidence upload/download | Live / functional for primary path | Authenticated primary-flow smoke covers first evidence upload and download. | Broader export/report paths need separate proof. |
| Evidence provenance | Live / functional as a rule | Manual attestations, customer-reported imports, and automated measurements are kept conceptually separate. | Imported/customer-reported evidence must not become automatic `pass`. |
| Helios CSV import | Live / functional as CSV-assisted manual evidence | Splnit Helios templates, parser/importer smokes, customer-reported rows create `manual_review` or `gap`. | Not native Helios vendor export support. Not Helios API automation. |
| Remediation task foundation | Live / functional | `remediation_tasks` table, idempotent task creation, gap/stale evidence task sources, production migration applied. | Task generation is internal workflow support, not legal proof. |
| Evidence freshness/staleness | Live / functional for Helios lane | Inngest lifecycle logic tracks stale Helios evidence and can downgrade stale `pass` to `manual_review`. | Full review-cadence automation across all frameworks/providers is not complete. |
| Gap-to-task generation | Live / functional for Helios gaps | Helios negative/gap attestations create remediation tasks with mapped references. | Positive posture from uploads/imports remains capped unless reviewed/measured. |

### Integrations and workspaces

| Area | Status | What exists | Claim boundary |
|---|---|---|---|
| Microsoft 365 | Partial / adapter exists | Registered adapter and check logic exist. | Automated checks can be claimed only for configured tenants with permissions; customer-connected production proof must be tracked separately. |
| GitHub | Partial / adapter exists | Registered adapter and check logic exist. | Same: adapter exists, but production tenant proof is separate. |
| AWS | Partial / adapter exists | Registered adapter, IAM/key flow, smoke coverage. | Do not call it continuous compliance until scheduling/freshness is proven. |
| Hetzner Cloud | Partial / adapter exists | Registered adapter and token/check flow. | Provider-configured proof still needs careful tracking. |
| OVHcloud | Partial / adapter exists | Registered adapter and credential/check flow. | Provider-configured proof still needs careful tracking. |
| ABRA Flexi | Partial / runtime adapter exists | Registered Czech ERP adapter. | Stronger than manual workspace, but still needs customer-connected proof before strong public claims. |
| Helios | Strong manual ERP workspace | 19 canonical controls, 19 NIS2 mappings, production seed readiness green, manual attestation, CSV-assisted import. | Manual workspace and Splnit template import only. No native/API automation claim. |
| Pohoda | Partial manual workspace | Workspace/checklist exists. | Not yet hardened to Helios-level production seed/import proof. |
| Money S3 / S4 | Partial manual workspace | Workspace/checklist exists. | No full runtime/API adapter or import proof comparable to Helios. |
| Google Workspace | Missing / planned | Mentioned as a planned/card-level target in docs. | No OAuth/client/adapter/tests/runner/evidence path yet. |
| WEDOS / Forpsi / VSHosting | Missing | Identified as useful Czech moat checks. | Not implemented. |

### Trust, vendors, agency, and reporting

| Area | Status | What exists | Claim boundary |
|---|---|---|---|
| Trust Center | Partial / functional surface | Public Trust Center route and admin/settings surfaces exist. | Public pages must show category-level aggregates only, never individual controls/evidence filenames/test timing. |
| Vendor questionnaires | Partial / functional surface | Vendor questionnaire route/flow exists. | Vendor-submitted evidence as first-class draft evidence is future work. |
| Risk register | Partial / functional surface | Risk routes and register report endpoints exist. | Needs broader production smoke/export proof. |
| Incidents / NÚKIB / ÚOOÚ | Partial / functional surface | Incident routes, NÚKIB/ÚOOÚ report endpoints, 72-hour countdown fields. | Does not submit to NÚKIB portal API. Direct API submission is externally blocked. |
| Agency/MSP portal | Partial / functional surface | Agency dashboard/client portal primitives exist. | Referral attribution, commissions, law/accounting partner onboarding are missing. |
| Exports/reports | Partial | Several export endpoints exist for evidence, workspace, vendors, risks, questionnaires, audit log. | Needs focused smoke coverage for pagination, org scoping, ownership, stable output shape. |

### Billing, legal, and production readiness

| Area | Status | What exists | Claim boundary |
|---|---|---|---|
| Stripe billing primitives | Partial | Checkout session creation, Customer Portal session creation, signed webhook verification, subscription persistence, plan gates, invoice/cancellation emails, local/test smoke coverage. | Browser-completed hosted Checkout, Customer Portal, Stripe-delivered webhook forwarding, and live-mode proof are not fully green. |
| Pricing source | Live / functional | Plans/prices sourced from `lib/stripe/plans.ts`. | UI must not hardcode plan names/prices. |
| Legal/operator identity | Partial / counsel-bound | Working OSVČ identity exists in internal context and legal drafts. | Public legal wording, DPA, subprocessors, retention, liability/payment terms, DPO/contact wording need final counsel/owner approval. |
| Paid live onboarding | Blocked | Billing code exists. | Blocked on counsel-approved payment/liability terms plus live Stripe proof. Free or manually invoiced pilot is safer until then. |
| External security proof | Missing / blocked | Security page and internal controls exist. | No pentest badge, SOC 2, ISO certification, uptime or external assurance claim until real proof exists. |
| Testimonials/customer logos | Missing / blocked | No real customer proof should be displayed. | Requires completed design partner proof and written consent. |

## What is currently fully live enough for a first design-partner conversation

A safe design-partner conversation can show:

- Czech-first positioning for NIS2/ZoKB evidence readiness.
- Intake and onboarding flow.
- Controls/gaps/evidence workspace.
- Evidence upload/download.
- Helios manual workspace with 19 seeded/verifiable controls.
- Helios CSV-assisted Splnit-template import as customer-reported evidence.
- Gap and stale-evidence remediation task generation.
- Public Trust Center concept with aggregate-only disclosure.
- Integration direction for Microsoft 365, GitHub, AWS, Hetzner, OVHcloud, ABRA Flexi, with proof level explained per provider.

It should be framed as:

- design-partner / pilot-ready for evidence preparation,
- not certified,
- not legal advice,
- not a guarantee of compliance,
- not fully automated across every system.

## What is missing before it is fully live

### Must-have before paid production onboarding

1. Stripe hosted proof:
   - browser-completed test Checkout,
   - Customer Portal from a signed-in app user,
   - Stripe-delivered webhook forwarding,
   - cancellation/downgrade/failure handling or explicit scoped follow-up.
2. Counsel/owner-approved public legal wording:
   - DPA,
   - subprocessors,
   - retention,
   - liability/payment terms,
   - operator identity wording,
   - DPO/contact wording.
3. Live-mode billing procedure:
   - safe low-risk live test or approved manual invoice path,
   - rollback/support process.
4. Public claim review across high-risk pages:
   - pricing,
   - security,
   - platform,
   - partner page,
   - NIS2 checker,
   - comparison pages,
   - blog CTAs and older copy.

### Must-have before stronger compliance claims

1. Mapping/template review status for jurisdiction-specific controls.
2. CZ/EU customer-facing RoPA / Article 30 processing-record template or explicit documented gap.
3. Audit/export endpoint smokes:
   - org scoping,
   - pagination/limits,
   - stable file shape,
   - ownership boundaries.
4. Separate proof for policy PDF and gap-report PDF generation.
5. Broader authenticated app smoke coverage beyond the narrowed primary path.
6. Framework maturity labels so customers can distinguish:
   - automated integration check,
   - manual evidence requirement,
   - customer-reported import,
   - draft/review-bound mapping,
   - guidance-only content.

### Must-have before stronger Czech moat claims

1. Pohoda hardening to Helios-level seed/import proof, or an explicit decision to keep Pohoda lower-tier.
2. Money S3 / S4 hardening or explicit lower-tier wording.
3. WEDOS / Forpsi / VSHosting public DNS/TLS/email checks if this becomes the next moat lane.
4. More production/customer-connected proof for ABRA Flexi and infrastructure adapters.
5. Full review cadence automation beyond Helios staleness.
6. CSV re-import diffing so changed customer-reported evidence can generate safe review tasks instead of only initial imports.

### Externally blocked or not under direct control

1. NÚKIB portal API submission:
   - blocked until a stable public API exists.
2. Pentest/security badge:
   - blocked until external review is complete and naming permission exists.
3. Real customer testimonials/logos:
   - blocked until design partners complete onboarding and give written consent.
4. Legal/counsel approval:
   - owner/counsel-dependent, not purely engineering.

## Recommended next work order

1. Finish Stripe hosted test proof and record redacted evidence.
2. Close legal wording enough to choose between paid Stripe pilot, manual invoice pilot, or free design-partner pilot.
3. Product-review Czech-first primary flow and public claim surfaces for buyer readiness.
4. Add CZ/EU RoPA template or record it as an explicit design-partner gap.
5. Choose one Czech moat lane:
   - harden Pohoda toward Helios-level proof,
   - add WEDOS/Forpsi/VSHosting public checks,
   - add framework maturity labels.
6. Add export/report smokes for audit log, workspace, vendor, risk, and questionnaire outputs.
7. Extend authenticated production smokes after billing/legal gates are no longer blocking.

## Current production evidence snapshot

As of 2026-06-01:

- Production migration drift is green:
  - expected migration count: 29,
  - production migration count: 29,
  - latest expected/applied migration: `0028_great_wasp`,
  - missing expected migrations: 0,
  - extra applied migrations: 0.
- Helios production seed readiness is green:
  - expected Helios controls: 19,
  - actual Helios controls: 19,
  - NIS2 Helios mappings: 19,
  - missing expected controls: 0,
  - unexpected Helios controls: 0,
  - duplicate Helios control keys: 0,
  - duplicate framework mappings: 0,
  - controls missing NIS2 mappings: 0.

## Source docs

- `PROJECT_PLAN.md`
- `README.md`
- `docs/plans/2026-05-30-production-trust-readiness-plan.md`
- `docs/operations/production-migration-0028-great-wasp-2026-06-01.md`
- `docs/operations/helios-production-seed-readiness.md`
- `docs/operations/helios-production-seed-execution-2026-06-01.md`
- `docs/audits/production-trust-week1-execution.md`
- `docs/product/business-entitlement-matrix.md`
