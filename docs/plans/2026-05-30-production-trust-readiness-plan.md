# Production Trust Readiness Plan

> **For Hermes:** This is a planning/review document, not an implementation request. Use it to confront, fine-tune, and choose the next execution scope before dispatching subagents or editing product code.

**North star / definition of done:** after this 4-week cycle, Splnit.eu can safely onboard **one design partner without a single overclaim**. If counsel-approved payment/liability terms and Stripe live-mode proof are ready, that partner can be paid through Stripe. If counsel or live billing is not ready, the first partner runs as a free or manually invoiced pilot with payment explicitly outside the product critical path.

**Goal:** Convert the corrected gap review into an executable readiness plan that separates founder-controlled work from external lead-time dependencies.

**Architecture:** Treat this as a production-readiness gate, not a feature sprint. Freeze broad feature scope until the founder-controlled proof gates are green. Run legal/pentest/partner/customer work as async lead-time clocks that start immediately but are not falsely treated as week-boxed deliverables.

**Tech Stack:** Next.js 15 App Router, TypeScript, Clerk, Drizzle/Postgres, Inngest, Stripe, Playwright/smoke scripts, Vercel production environment.

---

## Master Plan Alignment

- **Source priority item:** `PROJECT_PLAN.md` Next Work Order items 1, 2, 4, and 5.
- **Why this is next:** The app has strong core surfaces, but a real design partner needs legal-safe wording, authenticated product proof, a clear payment path, and no fake trust/customer/partner claims. “Paying through Stripe” is a separate gate that requires counsel-approved payment/liability terms and live-mode billing proof.
- **Related blockers:** Counsel turnaround, pentest vendor scheduling, design-partner consent, partner replies, Stripe test/live config, production smoke credentials, and external NÚKIB API availability.
- **Out of scope:** ISO 27001 certification for Splnit.eu, full real-time Pohoda/Money S3/Helios APIs, automated commission payouts, fake testimonials/logos/certifications, and direct NÚKIB API submission until a stable public API exists.
- **Safety constraints:** Public copy must not overclaim legal readiness, security validation, compliance status, customer proof, or partner relationships. Trust Center output stays aggregate-level only.

---

## Planning Correction Applied

This revision fixes the main weakness in the first draft: the calendar mixed controllable engineering proof with external dependencies. The plan now has two synchronized views:

1. **Founder-controlled sprint work** — work that can and must turn green through code, tests, docs, or product decisions.
2. **External lead-time clocks** — work that starts on day 1 but depends on counsel, vendors, customers, partners, or regulators.

A documented blocker is not success for founder-controlled proof gates. If Stripe test-mode proof is not green by end of Week 1, the schedule slips. The authenticated primary-flow smoke is a hard floor for early Week 2, after a day-1 credential/environment check confirms it is founder-controlled.

---

## Current Verified Baseline

### 2026-06-01 status update

This plan is no longer a blank Week 1 starting point. The current app posture has advanced in three important ways:

1. **Authenticated primary flow is GREEN for the narrowed buyer-critical path.** Production proof covers live Clerk org creation, current six-step onboarding, dashboard redirect, NIS2 assessment, control status persistence, evidence upload/download, Italian primary pages, and database verification. It does not cover policy PDF generation or framework gap-report PDF generation.
2. **Helios moved from static workspace to live manual ERP workspace tier.** GitHub `main` now has Helios canonical controls, targeted seed/readiness verification, live manual attestation/user-flow smokes, CSV-assisted manual evidence import, claim-safety guard, and a recorded production seed window. Production Helios controls are recorded as 19/19 controls and 19/19 NIS2 mappings with no duplicate/missing/unexpected Helios state.
3. **Stripe is still not fully GREEN.** Billing code and local/test-mode logic are partially proven, but browser-hosted Stripe Checkout, Stripe Customer Portal, and Stripe-delivered webhook forwarding remain unproven. Live paid onboarding stays gated by counsel-approved payment/liability terms plus live-mode proof.

Operational caution: the local `main` checkout may lag GitHub `main` and currently has unrelated dirty/untracked files. Release, deploy, seed, or production-smoke work must start from an intentionally reconciled clean checkout/worktree.

### Implemented or partially implemented

- Czech-first public app and app surfaces exist.
- Auth, orgs, protected routes, onboarding, controls, frameworks, evidence, Trust Center, vendor questionnaires, risks/incidents, access reviews, billing source paths, background jobs, and smoke scripts exist.
- NÚKIB baseline module exists and `npm run smoke:nukib-baseline` passed.
- Pohoda, Money S3, Helios, and ABRA Flexi workspace/checklist modules exist and workspace config smokes passed.
- Helios has live manual workflow proof and production seed proof: 19 canonical controls, 19 NIS2 mappings, live attestation/user-flow smokes, CSV-assisted manual import, and read-only production seed readiness verification.
- ABRA Flexi is registered as a runtime integration adapter.
- Helios and Pohoda are manual/workspace-tier surfaces, not runtime/API adapter integrations.
- Hetzner and OVHcloud adapters exist; WEDOS/Forpsi/VSHosting do not.
- Agency/MSP portal and white-label/client workspace primitives exist.
- Public copy currently avoids fake customers, fake testimonials, fake certification, and fake pentest claims.
- Authenticated production primary-flow smoke is green for onboarding -> controls/status -> evidence upload/download. Policy and gap-report PDF generation require separate proof.
- Production migration drift is recorded clean after the organisation identifier migrations: 28 expected migrations and 28 production-applied migrations through `0027_drop_ico_format_check`.

### Not implemented, not proven, or not claimable

| # | Gap | Correct status | Claim boundary |
|---|-----|----------------|----------------|
| 1 | External pentest/security badge | Missing | Do not display a badge until review is complete and naming permission exists. |
| 2 | Real customer testimonials/case studies | Missing | Blocked until design partners complete onboarding and give written consent. |
| 3 | Law/accounting/security partner proof | Missing | Outreach can start; no public names/logos until permission. |
| 4 | Legal closeout | In progress | DPA, subprocessors, retention, OSVČ/operator identity, DPO/contact, and liability/payment wording need counsel approval. |
| 5 | Stripe end-to-end proof | Partial | Local/test billing logic and signed webhook handling are proven; browser-hosted Checkout, Customer Portal, and Stripe-delivered webhook forwarding are not green yet. |
| 6 | Authenticated production smoke coverage | Partial/mostly green for primary path | Authenticated onboarding -> controls/status -> evidence upload/download is green; policy PDF, gap-report PDF, and broader app areas still need separate proof. |
| 7 | Pohoda/Money S3/Helios full automated integrations | Partial | Helios is live at manual workspace + CSV-assisted import tier; Pohoda/Money S3 workspaces exist; no full runtime adapter/evidence pipeline for these ERPs. |
| 8 | WEDOS/Forpsi/VSHosting checks | Missing | Start with public DNS/TLS/email/header checks. |
| 9 | Google Workspace integration | Planned | UI card only; no OAuth/client/adapter/tests/runner/evidence path. |
| 10 | NÚKIB portal API submission | Blocked externally | Baseline/mapping exists; direct submission waits on stable public API. |
| 11 | Affiliate/referral tracking | Missing | Agency portal exists; referral attribution is not implemented. |
| 12 | Commission/revenue-share workflow | Missing | Manual export/spreadsheet MVP is enough initially. |
| 13 | Partner onboarding beyond MSP/agency | Partial | Agency portal exists; law/accounting/reseller onboarding does not. |
| 14 | Framework maturity labels | Missing/refinement | Need explicit customer-safe states. |
| 15 | ÚOOÚ RoPA/processing-record template | Gap confirmed | GDPR Article 30 control and internal processing map exist; CZ/EU customer RoPA templates are missing, IT draft exists. |
| 16 | Broader authenticated production smokes | Partial | Extend after primary flow and Stripe are green. |

---

## Binding Readiness Floors

These floors distinguish controllable engineering proof from external legal/payment dependencies.

### Hard GREEN floor A: Stripe test-mode proof

Current status as of 2026-06-01: **PARTIAL, not GREEN.** `smoke:stripe-upgrade-flow` and `smoke:stripe-billing` have passed, Stripe test keys/prices were present in the checked environment, and local signed webhook entitlement transitions are proven. The remaining hard-floor gaps are browser-completed Stripe-hosted Checkout, Stripe-hosted Customer Portal, and Stripe-delivered webhook forwarding.

Must be green by the end of Week 1.

Required proof:
- Checkout starts from app billing/pricing path.
- Test payment completes.
- Stripe webhook updates app entitlement/subscription state.
- Billing page reflects the resulting plan.
- Customer portal opens for the same Stripe customer.
- Cancel/downgrade/failure path is tested or intentionally scoped with a concrete follow-up.

Not acceptable as success:
- “Blocked, documented.”
- “Source code exists.”
- “Stripe should work.”

Important claim boundary:
- Test-mode proof proves the product billing flow shape.
- It does not prove you can charge a real design partner through Stripe.
- Real payment through Stripe also requires counsel-approved payment/liability terms and live-mode proof.

### Hard GREEN floor B0: Primary-flow environment/credential check

Current status as of 2026-06-01: **GREEN.** Live Clerk, Neon, mailbox prerequisites, source guard, and production migration drift were verified without printing secrets.

Must be complete on Day 1.

Purpose: confirm whether the authenticated primary-flow smoke is actually founder-controlled.

Required proof:
- Test user/org credentials or creation path are available.
- Target environment is defined: production-like staging preferred if production credentials/cleanup are risky.
- Test data cleanup or isolation is documented.
- Required env vars and DB state are available without printing secrets.

If credentials/environment are not in hand:
- Do not pretend this is founder-controlled.
- Scope the Week 2 hard floor to a production-like staging environment the founder fully controls.
- Keep production execution as a follow-up once credentials are available.

### Hard GREEN floor B: Authenticated primary product smoke

Current status as of 2026-06-01: **GREEN for the narrowed buyer-critical path.** Production proof covers authenticated onboarding, assessment/control status, and first evidence upload/download. Policy PDF and gap-report PDF generation were intentionally removed from this hard floor and remain separate proof gates.

Target: green by the first half of Week 2, after B0 confirms the environment.

Required proof:
- Authenticated user/org path works.
- Onboarding intake completes.
- Derived controls/gaps appear.
- First evidence can be created or attached.
- Dashboard/control status reflects the change.

Not acceptable as success:
- Build/typecheck only.
- Source-only smoke only.
- Demo-mode proof only.

### Payment/live-mode gate

This is not founder-controlled until counsel-approved payment/liability terms are available.

A real paid Stripe design partner requires:
- counsel-approved payment/liability terms,
- live Stripe mode configured,
- live checkout/customer/webhook path tested with safe low-risk procedure,
- rollback/support path documented.

If counsel is not back by the end of the cycle, the honest launch mode is:
- free design-partner pilot, or
- manually invoiced pilot with counsel-approved/manual terms, or
- “ready to onboard paid partner pending counsel/live-billing sign-off.”

### External lead-time floor

These must be started by Week 1, but completion is not fully controlled:
- Counsel packet sent.
- Pentest quote/scope requests sent.
- Design-partner target list drafted.
- Partner target list drafted.

Success means the clock is ticking and owner follow-up dates exist, not that external parties have already replied.

---

## Capacity Model

This plan assumes one owner/founder plus agent/subagent assistance.

The bottleneck is not the number of parallel subagents. The bottleneck is owner review and decisions.

Weekly owner decision budget:
- 2 major product/legal/GTM decisions per week.
- 1 production proof review per normal week.
- 1 implementation scope decision per week.

Week 1 exception:
- Week 1 remains heavy, but it now has only one full proof review: Stripe test-mode proof.
- The primary-flow work in Week 1 is limited to B0 environment/credential readiness.
- The full primary-flow proof review moves to early Week 2.

Maximum active implementation lanes at once:
- 1 founder-controlled proof lane.
- 1 supporting audit/docs lane.
- 1 async outreach/lead-time lane.

If more lanes are opened, work may appear parallel but will bottleneck at review. Do not dispatch eight lanes at once.

---

## Early GTM Fork

The GTM fork happens before Week 2 outreach, not after.

Choose one primary Week 2 outreach motion after Week 1 hard floors are green or clearly blocked:

### Motion 1: Design-partner beta

Best if the goal is to onboard one real design partner now, with payment handled only if counsel/live-billing gates are green.

Targets:
- 3–5 Czech SMEs.
- Founder/network/LinkedIn.
- Offer: discounted or free pilot in exchange for structured feedback; testimonial/logo only after success and written consent.

### Motion 2: Partner-channel beta

Best if sales depends on advisors/MSPs/accountants/law firms.

Targets:
- 3 law/compliance firms.
- 2 accounting/ERP ecosystem contacts.
- 1 security/pentest vendor.

### Motion 3: Czech-market differentiation

This is not co-equal with the north star. It is a deliberate deviation from the “one design partner without overclaim” goal unless a specific prospect/partner says the missing local feature is the reason they will not proceed. Use it only when the Week 1/early Week 2 proof floors are green or when you intentionally choose product differentiation over design-partner onboarding.

Targets:
- CSV import MVP for Czech accounting workspaces.
- WEDOS/Forpsi/VSHosting public checks.
- Framework maturity labels.

Recommended default:
- Week 1 stays track-agnostic and proof-first.
- Before Week 2 starts, choose Motion 1 unless there is a specific reason to prioritize partner-channel outreach.

---

# Two-Track Four-Week Plan

## Track A — Founder-Controlled Sprint Work

This track contains work the founder/team can directly complete. It has hard green gates.

### Week 1: Stripe Proof, Primary-Flow Readiness, and External Clocks

Week 1 is intentionally narrower than the previous draft. It has one full founder-controlled proof review, not two.

#### Task A1: Stripe test-mode proof — hard GREEN floor

**Objective:** Prove billing end-to-end in test mode.

**Likely files:**
- `lib/stripe/plans.ts`
- `lib/stripe/actions.ts`
- `app/api/webhooks/stripe/route.ts`
- `app/(app)/settings/billing/page.tsx`
- `scripts/smoke-stripe-upgrade-flow.ts`
- `docs/audits/billing-stripe-runtime-audit.md`

**Steps:**
1. Verify Stripe test env presence without printing secrets.
2. Use an authenticated test org.
3. Start checkout for the selected plan.
4. Complete test payment.
5. Verify webhook entitlement update.
6. Open customer portal.
7. Test or explicitly scope cancel/downgrade/failure path.
8. Record redacted evidence in `docs/audits/billing-stripe-runtime-audit.md`.

**Acceptance criteria:**
- Checkout green.
- Webhook entitlement green.
- Billing page green.
- Portal green.
- Failure/cancel/downgrade behavior known.

**If not green:** timeline slips; do not move to integration polish as if production proof passed.

#### Task A2-B0: Authenticated primary-flow environment check

**Objective:** Prove that the primary-flow smoke is founder-controlled before making it a no-excuses hard floor.

**Steps:**
1. Confirm test user/org credentials or self-service creation path.
2. Decide target environment: production-like staging by default; production only if cleanup/isolation is safe.
3. Confirm DB/env prerequisites without printing secrets.
4. Define test data cleanup/isolation.
5. Write the exact smoke command and expected output shape.

**Acceptance criteria:**
- Environment and credentials are confirmed.
- If they are not confirmed, the Week 2 proof target becomes controlled staging, not production.
- No secret values are printed.

#### Task A3: RoPA audit pulled forward

**Objective:** Confirm whether ÚOOÚ/GDPR Article 30 processing-record coverage exists before counsel review and product/legal claims proceed.

**Why Week 1:** For a GDPR/Czech compliance product, RoPA/processing records are table-stakes and likely to be flagged during legal review.

**Files to inspect:**
- `lib/policies/*`
- `lib/documents/*`
- `app/(app)/policies/*`
- `app/api/documents/*`
- `messages/*.json`

**Acceptance criteria:**
- RoPA status classified as implemented, draft/review-bound, or missing.
- If missing, create a follow-up implementation task with exact files and acceptance criteria.
- No public legal-ready claim is made from unreviewed template coverage.

#### Task A4: Framework maturity label taxonomy

**Objective:** Define the label model before implementing public/admin badges.

**Suggested states:**
- `production_proven`
- `implemented`
- `source_mapped`
- `review_pending`
- `draft`
- `planned`
- `blocked_external`

**Acceptance criteria:**
- Labels are tied to claim boundaries.
- NIS2/Czech ZoKB does not imply legal finality unless reviewed.
- ISO 27001 is preparation support, not Splnit certification.
- AI Act/CSRD are not shown as production-proven unless review supports it.

### Week 2: Choose GTM Motion, Then Execute One Narrow Lane

Week 2 starts only after the Week 1 proof status is known.

#### Task A2: Authenticated primary-flow smoke — hard GREEN floor

**Objective:** Prove onboarding → controls → evidence in the controlled environment selected by B0.

**Flow:**
1. Login/sign up.
2. Create/select org.
3. Complete onboarding intake.
4. Confirm derived controls/gaps appear.
5. Create or attach first evidence.
6. Confirm dashboard/control status updates.

**Acceptance criteria:**
- Browser smoke passes in production-like staging or production if safe credentials/cleanup exist.
- Test data cleanup strategy is documented.
- No secrets printed.
- Failure output is actionable.

**If not green by the first half of Week 2:** timeline slips; do not treat outreach or product polish as launch readiness.

#### If Motion 1 — Design-partner beta

Founder-controlled work:
- Create one clean design-partner onboarding script.
- Create consent/status tracker.
- Define the product demo path using the green primary-flow smoke.

Success:
- 3–5 candidates contacted.
- At least 1 live onboarding call scheduled or completed.
- No testimonial/logo claim added yet.

#### If Motion 2 — Partner-channel beta

Founder-controlled work:
- Create one partner pitch for law/compliance firms.
- Create one partner pitch for accounting/ERP ecosystem contacts.
- Define manual attribution process before building referral code.

Success:
- Outreach sent and tracked.
- Partner proof remains private until consent.

#### If Motion 3 — Czech-market differentiation

Founder-controlled work:
- Decide whether CSV import or hosting checks comes first.
- Do not start both unless Week 1 gates are green and capacity allows.

Success:
- One implementation lane selected with exact acceptance criteria.

### Week 3: Build One High-ROI Product Improvement

Pick only one unless capacity is clearly available.

#### Option A: CSV import MVP for Pohoda/Money S3/Helios

**Objective:** Turn workspace/checklist modules into a lightweight data intake path, not full APIs.

**MVP scope:**
- Strict CSV template or mapping preview.
- Header validation.
- Import summary.
- Draft evidence or workspace finding.
- Human review before compliance claim.

**Out of scope:**
- Full real-time APIs.
- Credential storage.
- Continuous sync.

**Acceptance criteria:**
- Invalid CSV returns safe localized errors.
- Valid CSV creates draft evidence/finding.
- Existing workspace smokes still pass.

#### Option B: WEDOS/Forpsi/VSHosting generic checks

**Objective:** Add Czech-hosting-friendly public checks without provider APIs.

**Checks:**
- DNS resolution.
- TLS validity/expiry.
- SPF.
- DKIM guidance/presence where feasible.
- DMARC.
- MX.
- Security headers.
- Optional DNSSEC.

**Acceptance criteria:**
- Runs without credentials.
- Results are evidence candidates/manual review.
- UI says public DNS/TLS/email checks, not provider API integration.

#### Option C: Framework maturity labels implementation

**Objective:** Make framework coverage honest and visible.

**Likely files:**
- `lib/frameworks/registry.ts`
- `app/(app)/frameworks/page.tsx`
- `app/(marketing)/predpisy/page.tsx`
- `messages/*.json`

**Acceptance criteria:**
- Labels visible where buyers need claim boundaries.
- Copy-hygiene smoke passes.

### Week 4: Tighten Trust and Attribution

#### Task A5: Honest trust/security page update

**Objective:** Reflect only real external validation status.

Allowed copy:
- “External security review: planned.”
- “External security review: scheduled for Q3 2026.”
- “Results will be summarized after completion.”

Forbidden copy:
- “Security tested by X” before completion/permission.
- “Certified” unless certification exists.
- “Trusted by” logos without written consent.

Verification:
- `npm run smoke:trust-center-public-disclosure`
- `npm run smoke:copy-hygiene`

#### Task A6: Referral attribution MVP, only if GTM motion needs it

**Objective:** Attribute a subscription to a referral source without payout automation.

MVP scope:
- Referral code in URL or signup form.
- Store referral code internally or in Stripe metadata.
- Monthly manual export.

Out of scope:
- Automated payouts.
- Partner dashboard.
- Commission tax/accounting automation.

---

## Track B — External Lead-Time Clocks

These start immediately. They run across all four weeks. They do not count as sprint completion unless the external party actually responds.

| Clock | Start action | Owner-controlled output | External dependency | Follow-up cadence |
|------|--------------|--------------------------|---------------------|------------------|
| Counsel legal closeout | Send legal packet | Packet sent, questions listed, requested decision date | Counsel turnaround | Follow up every 3–5 business days |
| Pentest/security review | Send scope to 2–3 vendors | Scope and quote request sent | Vendor quote/schedule | Follow up weekly |
| Design partners | Build target list and send first outreach | Shortlist + sent messages | SME replies/consent | Follow up weekly |
| Partner proof | Send law/accounting/security partner outreach | Sent messages + tracker | Partner replies/permission | Follow up weekly |
| Customer testimonials/logos | Ask only after successful onboarding | Consent request template ready | Written consent | After partner success |
| NÚKIB portal API | Monitor public availability | Status documented as externally blocked | NÚKIB stable public API | Recheck monthly |

### Lead-time success criteria

By end of Week 1:
- Counsel packet sent.
- Pentest quote requests sent.
- Design-partner shortlist exists.
- Partner shortlist exists.
- Payment mode decision drafted: live Stripe if counsel/live proof green, otherwise free/manual pilot.

By end of Week 2:
- First outreach wave sent for the selected GTM motion.
- Follow-up dates scheduled.

By end of Week 4:
- At least one of these is true:
  - counsel review returned,
  - pentest scheduled,
  - design partner onboarded/scheduled,
  - partner meeting scheduled.

If none happen, the product can still be technically improved, but trust/GTM readiness has not advanced enough for broad launch.

---

## Subagent Execution Strategy — Capacity-Limited

Use this only after the plan is approved. Do not dispatch all lanes at once.

| Lane | Scope | Depends on | Can run now? | Owner decision needed |
|------|-------|------------|--------------|----------------------|
| 1 | Stripe proof | Stripe test env/test org | Yes | Accept proof format |
| 2 | Primary-flow smoke | Day-1 credential/environment check | Yes after B0 | Accept test data strategy and target env |
| 3 | RoPA audit | None | Yes | Decide implement vs document gap |
| 4 | Legal packet | Owner/counsel docs | Yes | Approve packet/questions |
| 5 | GTM outreach | Early fork choice | After Week 1 status | Choose design-partner vs partner-channel |
| 6 | CSV import OR hosting checks OR framework labels | Week 1 gates | After hard floors green | Pick one implementation lane |
| 7 | Referral attribution | GTM motion + Stripe proof | Later | Decide whether needed now |

Dispatch limit:
- At most 2 subagents at once.
- At most 1 implementation lane touching app code at once.
- Owner reviews outputs before new code lane starts.

---

## Global Verification Checklist

Run before production deploy or public launch claim:

```bash
npm run typecheck
npm run lint
npm run build
npm run check:production-migration-drift
npm run smoke:copy-hygiene
npm run smoke:trust-center-public-disclosure
npm run smoke:production-tenant-readiness-prereqs
npm run smoke:production-tenant-readiness-source
```

Additional checks after specific work:

```bash
npm run smoke:nukib-baseline
npm run smoke:pohoda-workspace-config
npm run smoke:money-s3-workspace-config
npm run smoke:helios-workspace-config
npm run smoke:abra-flexi-workspace-config
npm run smoke:stripe-upgrade-flow
```

For UI/browser changes:
- Verify desktop and mobile widths.
- Verify Czech default locale has no unwanted URL prefix.
- Verify public pages do not expose internal control IDs, evidence filenames, exact test timings, or sensitive implementation details.

For schema changes:
- Run `npm run db:generate`.
- Run local migration if a local DB is configured.
- Before production reliance, verify migration drift and schedule production migration during a deploy window if needed.

---

## Revised Readiness Scorecard

Grades now separate **implemented surface** from **proven reliance**.

| Area | Current status | Why | Required for one real design partner |
|------|----------------|-----|----------------------------------------|
| Implemented product surface | Strong but not fully proven | Major app surfaces exist, but production proof is incomplete. | Keep stable; avoid broad new scope. |
| Production reliance | Weak-to-medium | Stripe and primary flow are not fully green yet. | Stripe and primary-flow smoke must be green. |
| Legal readiness | Pending | Counsel closeout still needed. | Counsel packet sent; no overclaim; paid terms approved before broad self-serve. |
| Trust/external validation | Weak | No pentest/customer/partner proof yet. | Honest planned/scheduled status acceptable for design partner; no badge. |
| GTM/partner readiness | Early | Agency portal exists; referral/channel proof is missing. | One selected outreach motion active. |
| Integration depth | Good base, partial automation | Czech workspaces exist; full adapters missing. | Workspace/checklist acceptable for beta if claim boundary is clear. |

Do not assign letter grades unless the rubric is explicit. The previous A-/C+/D style was too vibes-based.

---

## Recommended Sequence

### Week 1, no debate

1. Stripe test-mode proof GREEN.
2. Authenticated primary-flow environment/credential check complete.
3. RoPA audit result known.
4. Counsel packet sent.
5. Pentest quote requests sent.
6. Design-partner and partner shortlists drafted.
7. Payment-mode fallback drafted: paid Stripe if counsel/live proof green; otherwise free/manual pilot.

### First half of Week 2, no debate

1. Authenticated onboarding → controls → evidence smoke GREEN in the controlled environment selected by B0.
2. If not green, the schedule slips before product polish or launch claims continue.

### Before Week 2 outreach starts

Make the GTM fork:
- Design-partner beta, or
- Partner-channel beta, or
- Czech-market differentiation sprint.

Recommended default: **Design-partner beta** unless there is already a warm partner-channel opportunity.

### Weeks 2–4

Only after Week 1 founder-controlled gates are green:
1. Execute selected GTM motion.
2. Build exactly one high-ROI product improvement.
3. Update trust/security copy only with real status.
4. Keep external lead-time clocks moving.

---

## Open Questions For Marco

1. Is the corrected north star right: “one real design partner without a single overclaim,” with paid Stripe only if counsel/live-billing gates are green?
2. If counsel is not back by then, should design partner #1 be free, manually invoiced, or delayed until Stripe live payment is safe?
3. For Week 2, do you want the primary GTM motion to be design partners or partner channel? Treat Czech-market differentiation as a deliberate deviation, not a peer default.
4. Do you want RoPA implemented immediately if missing, or documented as a legal/template gap first?
5. What is your actual weekly review capacity: 1, 2, or 3 major decisions per week?
6. Should live-mode Stripe proof wait for counsel-approved payment/liability terms?

---

## Do Not Do Next

- Do not build full real-time Pohoda/Money S3 APIs before CSV/import MVP is validated.
- Do not apply for ISO 27001 certification for Splnit.eu now.
- Do not build automated commission payout logic before manual referral attribution proves demand.
- Do not display “Security tested by” before pentest completion and naming permission.
- Do not add customer logos/testimonials without written consent.
- Do not wait for NÚKIB portal API submission; document it as externally blocked.

---

## Final Summary

The next 4 weeks are not “feature completion.” They are a readiness gate for one real design partner. Whether that partner is paid through Stripe, manually invoiced, or free depends on counsel/live-billing readiness.

The founder-controlled hard floor is:
- Stripe test-mode proof green by end of Week 1.
- Primary-flow environment/credential check complete by end of Week 1.
- Authenticated primary product smoke green by early Week 2.
- RoPA status known.
- Framework claim labels decided.

The external lead-time work is:
- counsel,
- pentest,
- design partners,
- partner proof,
- NÚKIB API monitoring.

If the hard floor is not green, the schedule slips. If the hard floor is green, choose one GTM motion and one high-ROI product improvement, then keep the public story honest.
