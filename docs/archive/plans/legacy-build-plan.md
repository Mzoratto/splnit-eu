# Splnit.eu — Build Plan

> 32 PRs · 5 phases · ~20 weeks solo founder pace  
> MVP live at week 8 · First revenue at week 10  
> Stack: Next.js 15 · Clerk · Neon · Drizzle · Vercel · Inngest

---

## Summary

| Phase | Weeks | PRs | Focus |
|---|---|---|---|
| Phase 0 — Foundation | 1–2 | 5 | Scaffold, DB schema, auth, billing, homepage |
| Phase 1 — App core | 3–5 | 5 | Dashboard, onboarding, wizard, policies |
| Phase 2 — Integration engine | 6–9 | 6 | Runner, M365, GitHub, AWS, NÚKIB |
| Phase 3 — Growth features | 10–15 | 8 | Trust Center, vendors, incidents, risk, questionnaire AI, marketing pages |
| Phase 4 — Scale & polish | 16–20 | 8 | Consultant dashboard, ISO 27001, mobile, E2E tests, launch |

---

## Phase 0 — Foundation & scaffold (Weeks 1–2)

### PR-001 · Project scaffold · Small (1–3 days) · infra

Bootstrap the entire project infrastructure.

- `npx create-next-app splnit --typescript --tailwind --app`
- Install: `@clerk/nextjs @neondatabase/serverless drizzle-orm drizzle-kit next-intl`
- Configure next-intl: `cs.json` + `en.json`, middleware locale detection
- Setup `.env.local` with all service keys (see blueprint Section 12)
- Vercel project + connect `splnit.eu` domain + DNS (A record → 76.76.21.21, CNAME www → cname.vercel-dns.com)

---

### PR-002 · Neon schema + migrations · Medium (3–7 days) · database

Full Drizzle schema from the blueprint. All 15 tables.

- `lib/db/schema.ts` — all tables: organisations, profiles, frameworks, controls, orgFrameworks, orgControlStatuses, frameworkControls, tests, integrations, integrationRuns, evidence, policies, vendors, incidents, riskItems, trustCenters
- `drizzle.config.ts` — eu-west-1 connection string
- `npx drizzle-kit push` on dev Neon branch
- Seed script: framework rows (nis2, ai-act, gdpr, iso27001), controls library (50 controls), framework_controls cross-mappings (NIS2 + ISO 27001 + GDPR all mapped to shared controls)

---

### PR-003 · Clerk auth + webhook sync · Medium (3–7 days) · auth

Full Clerk setup: org-based multi-tenancy, webhook → Neon sync.

- `middleware.ts` — Clerk guard on `(app)/*` routes, public routes list
- `app/api/webhooks/clerk/route.ts` — svix verify + handle: organization.created/updated/deleted, organizationMembership.created, user.deleted
- `lib/db/queries/organisations.ts` — `upsertOrg()`, `upsertProfile()`
- Test: create org in Clerk → verify row in Neon organisations table

---

### PR-004 · Stripe billing + plan sync · Medium (3–7 days) · billing

Stripe subscriptions wired to Clerk org metadata.

- Stripe dashboard: 4 products (free/starter/business/consultant), price `lookup_key`s
- `lib/stripe/plans.ts` — `PLAN_LIMITS`, `requirePlan()` server action guard
- `app/api/webhooks/stripe/route.ts` — `customer.subscription.updated` → update Neon + Clerk `publicMetadata.plan`
- `app/(app)/settings/billing/page.tsx` — Stripe Customer Portal link
- Test: upgrade free → starter → verify orgId metadata updates

---

### PR-005 · Marketing site — homepage · Medium (3–7 days) · marketing

Deploy the finished homepage as Next.js route.

- Convert `splnit-homepage.html` to `app/page.tsx` + Tailwind components
- `components/nav.tsx` — sticky, frosted glass, active link detection
- `components/footer.tsx` — 6-column grid, newsletter form (Loops.so)
- `components/sticky-cta.tsx` — scroll-triggered with Framer Motion
- SEO: `metadata.ts` per page, `og:image`, `sitemap.xml`, `robots.txt`

---

## Phase 1 — App shell + onboarding (Weeks 3–5)

### PR-006 · App layout + dashboard shell · Medium (3–7 days) · ui

Protected `(app)/*` layout: sidebar, org switcher, plan gate banner.

- `app/(app)/layout.tsx` — Clerk `<OrganizationSwitcher>`, sidebar nav
- `components/sidebar.tsx` — icon + label nav items, active state, mobile collapse to bottom tab bar
- `app/(app)/dashboard/page.tsx` — compliance score ring (SVG animated), framework score cards, failing controls list, regulation updates feed
- Server components: read `orgFrameworks` + `orgControlStatuses` from Neon
- Plan gate: if `plan===free` && trying to access Business feature → upgrade modal with Stripe checkout link

---

### PR-007 · Onboarding wizard · Large (1–2 weeks) · feature
**Needs:** PR-006

5-step wizard: company details → framework selection → tool inventory → integration → score reveal.

- `app/(app)/onboarding/page.tsx` — step state machine (`useReducer`)
- Step 1: company name, IČO, sector (dropdown), employee count → save to `organisations`
- Step 2: framework selector pills (NIS2, AI Act, GDPR, ISO 27001) → insert `orgFrameworks` rows
- Step 3: AI tools quick-add from pre-seeded library of 20 tools (ChatGPT, Copilot, Personio, etc.)
- Step 4: redirect to first integration setup (Microsoft 365 recommended)
- Step 5: score reveal — animate compliance ring from 0 to calculated %
- Skip flag: `organisations.onboarding_completed_at` — skip if set

---

### PR-008 · Framework wizard + gap report · Large (1–2 weeks) · feature
**Needs:** PR-007

Per-framework guided assessment → obligation checklist + compliance score.

- `app/(app)/frameworks/[slug]/setup/page.tsx` — multi-step wizard per framework
- Question sets: NIS2 (18 questions), AI Act (12 questions), GDPR (15 questions), ISO 27001 (20 questions)
- Server action: `assessFramework()` — answers → classify → insert obligations → calculate initial score
- `app/(app)/frameworks/[slug]/page.tsx` — controls list with status, article refs, deadlines
- `lib/controls/scorer.ts` — `recalculateFrameworkScore()` triggered after any status change
- Gap report PDF: `@react-pdf/renderer` → Vercel Blob → download link in UI

---

### PR-009 · Manual controls management · Medium (3–7 days) · feature
**Needs:** PR-008

Mark controls pass/fail/na, add notes, upload evidence files.

- `app/(app)/controls/[controlId]/page.tsx` — status, linked tests, evidence list, change history
- Server action: `updateControlStatus()` → upsert `orgControlStatuses` → recalculate score
- Evidence upload: `@vercel/blob put()` → insert `evidence` row → link to control
- `app/(app)/evidence/page.tsx` — vault: all evidence filtered by framework/status/expiry
- Evidence expiry: Inngest cron checks `evidence.expires_at`, Resend email 30 + 7 days before

---

### PR-010 · Policy library + document generation · Medium (3–7 days) · feature
**Needs:** PR-008

Generate Czech-law compliance documents as PDFs per organisation.

- `lib/pdf/templates/` — 6 templates: `ai_policy`, `security_policy`, `gdpr_privacy_notice`, `training_log`, `record_of_use`, `incident_response`
- `@react-pdf/renderer` components pre-populate: org name, IČO, responsible person, date
- `app/(app)/policies/page.tsx` — list + status (draft/active/expired) + download links
- Server action: `generatePolicy(type)` → render PDF → Vercel Blob → insert `policies` row
- Policy expiry: `policies.expires_at`, annual review reminder via Inngest cron

---

## Phase 2 — Integration engine (Weeks 6–9)

### PR-011 · Integration runner core · Large (1–2 weeks) · engine

Inngest-powered hourly test runner. Adapter pattern. Result storage.

- `lib/integrations/runner.ts` — `runTestsForOrg(clerkOrgId)`: fetch connected → load adapter → run → save `integrationRuns` → upsert `orgControlStatuses`
- `lib/integrations/registry.ts` — `getAdapter(provider)` returns typed adapter
- `inngest/run-integration-tests.ts` — Inngest function: fan-out per org per integration
- `app/api/cron/run-tests/route.ts` — Vercel Cron at `:00` every hour → fire Inngest events per active org
- Upstash Redis dedup: one run per `(orgId, provider)` in flight at a time

---

### PR-012 · Microsoft 365 integration · Large (1–2 weeks) · integration
**Needs:** PR-011

OAuth2 connect + 6 automated tests via Microsoft Graph API.

- `lib/integrations/microsoft365/oauth.ts` — auth URL, token exchange, refresh
- `app/api/integrations/microsoft/callback/route.ts` — exchange → encrypt tokens → save
- 6 tests: `check_mfa_enabled`, `check_conditional_access`, `check_guest_users`, `check_privileged_roles`, `check_sensitivity_labels`, `check_security_training`
- Controls mapped: `ctrl_mfa_all_users` (NIS2 + ISO + GDPR), `ctrl_conditional_access`, `ctrl_privileged_access_reviewed`, `ctrl_guest_access_controlled`
- `app/(app)/integrations/microsoft365/page.tsx` — connect button, test results timeline

---

### PR-013 · GitHub integration · Medium (3–7 days) · integration
**Needs:** PR-011

GitHub App install + 5 automated tests.

- GitHub App: read-only permissions (org members, repos, security advisories, code scanning)
- `lib/integrations/github/tests.ts` — 5 checks: `check_2fa_enforced`, `check_branch_protection`, `check_secret_scanning`, `check_dependency_alerts`, `check_code_scanning`
- Controls mapped: `ctrl_mfa_all_users`, `ctrl_code_review_required`, `ctrl_secrets_management`
- `app/(app)/integrations/github/page.tsx` — install GitHub App button, repo list, results

---

### PR-014 · AWS integration · Medium (3–7 days) · integration
**Needs:** PR-011

IAM cross-account read-only role + 5 CloudTrail/Config tests.

- CloudFormation template: read-only IAM role with `SecurityAudit` managed policy
- `lib/integrations/aws/tests.ts` — 5 checks: `check_cloudtrail_enabled`, `check_s3_encryption`, `check_iam_mfa`, `check_root_account_mfa`, `check_vpc_flow_logs`
- AWS SDK v3: `@aws-sdk/client-iam`, `@aws-sdk/client-cloudtrail`, `@aws-sdk/client-s3`
- `app/(app)/integrations/aws/page.tsx` — role ARN input, validate, test results

---

### PR-015 · NÚKIB feed sync · Small (1–3 days) · integration
**Needs:** PR-011

Weekly sync of NÚKIB vulnerability feed → `regulation_updates` → org alerts.

- `lib/integrations/nukib/sync.ts` — fetch NÚKIB RSS/ATOM, parse, deduplicate by CVE ID
- `inngest/regulation-updates.ts` — weekly Inngest cron (Monday 08:00 Prague)
- Insert `regulation_updates` rows with severity: `info` / `warning` / `action_required`
- Alert emails: `action_required` updates → Resend to all org owners in affected plans
- Dashboard feed: latest 5 regulation updates, unread count badge in sidebar

---

### PR-016 · Integrations hub UI · Medium (3–7 days) · ui
**Needs:** PR-012, PR-013, PR-014

Integration marketplace page: connected, available, coming soon.

- `app/(app)/integrations/page.tsx` — grid: status chip, last sync timestamp, test count, connect/disconnect
- Integration status polling: `revalidatePath` every 60s while `status=connecting`
- Test result timeline: per integration, last 24h history with pass/fail/warn breakdown
- Disconnect: revoke OAuth tokens → delete `integration` row → reset affected control statuses to `unknown`

---

## Phase 3 — Growth features (Weeks 10–15)

### PR-017 · Trust Center · Large (1–2 weeks) · feature

Public compliance page. NDA gate. Real-time scores.

- `app/(marketing)/trust/[orgSlug]/page.tsx` — public, no Clerk guard
- Trust Center config: `app/(app)/trust-center/page.tsx` — toggle public, subdomain, visible frameworks, NDA on/off
- NDA gate: `trustCenterRequests` table → form → email org owner → approve → 24h signed access link
- `og:image`: `@vercel/og` dynamic image with compliance scores for social sharing
- Social proof: "Verified automatically · Last test: X minutes ago" timestamp

---

### PR-018 · Vendor risk module · Medium (3–7 days) · feature

Vendor catalogue, risk tier assessment, NIS2 supply chain compliance.

- `app/(app)/vendors/page.tsx` — list, risk tier badges, next review date
- `app/(app)/vendors/[vendorId]/page.tsx` — 12-question wizard → score → tier
- Vendor questionnaire email: Resend → vendor fills at `splnit.eu/vendor-assessment/[token]`
- NIS2 supply chain report: all vendors + compliance status → PDF export

---

### PR-019 · Access reviews · Medium (3–7 days) · feature
**Needs:** PR-012, PR-013

Pull Entra ID + GitHub users. Keep/revoke workflow. ISO 27001 A.9.2.3 evidence.

- `app/(app)/team/access-reviews/page.tsx` — start review wizard
- Pull Microsoft Graph `/users` + GitHub org members → `accessReviewItems` rows
- Review table: user × resource × access level → decision chips (keep / revoke / modify)
- Export CSV for ISO 27001 auditor evidence
- Quarterly reminder: Inngest cron → email org admins

---

### PR-020 · Incident management · Medium (3–7 days) · feature

NIS2 + GDPR incident log. 72h GDPR countdown. Czech regulator notification templates.

- `app/(app)/incidents/page.tsx` — incident log with severity, status, timeline
- Incident wizard: severity → affected systems → personal data? → mandatory notification checklist
- 72h GDPR countdown timer (Art. 33): red when < 12h remaining
- NÚKIB notification template: pre-filled Czech form (NIS2 Art. 23) → PDF export
- ÚOOÚ notification template: GDPR Art. 33 breach notification → PDF export

---

### PR-021 · Risk register · Small (1–3 days) · feature

Information security risk register. ISO 27001 required.

- `app/(app)/risks/page.tsx` — risk list, score = likelihood × impact (1-5)
- Risk matrix: 5×5 SVG heatmap, risks plotted as dots
- Risk owner, due date, mitigation notes, status tracking
- Risk register PDF export for ISO 27001 auditor
- Pre-populated with 10 common Czech SME risks

---

### PR-022 · Questionnaire AI · Large (1–2 weeks) · feature

Auto-answer inbound security questionnaires using org compliance data + Claude API.

- `app/(app)/questionnaires/page.tsx` — paste or upload questionnaire
- Claude API: system prompt loads org's passing controls + evidence + policies → answer questions
- Confidence per answer: high (automated evidence) / medium (manual) / low (none)
- Export: filled questionnaire as PDF or XLSX
- Rate limiting: 5/month on Starter, unlimited on Business

---

### PR-023 · Marketing pages — Platform + Regulations · Medium (3–7 days) · marketing

`app/platform/page.tsx` + `app/predpisy/page.tsx` + 6 framework sub-pages.

- Platform page: 3-step how it works, integrations split section, cross-mapping explainer panel, Trust Center preview, security trust badges
- Regulations hub: 6 framework cards with regulator + deadline, timeline, free resources lead capture (PDFs from reference pack)
- 6 sub-pages (`/predpisy/[slug]`): nis2, eu-ai-act, gdpr, iso-27001, csrd, dora — who it applies to, obligations table, fines, how Splnit.eu covers it
- SEO: unique title/description, structured data `schema.org/SoftwareApplication`
- Blog scaffold: `app/blog/[slug]/page.tsx` with MDX — first 3 posts: NIS2 guide, AI Act SME guide, GDPR checklist

---

### PR-024 · Marketing pages — Customers + Pricing · Medium (3–7 days) · marketing

`app/zakaznici/page.tsx` + `app/cenik/page.tsx` with full interactivity.

- Customers: 3 persona cards, 1 detailed before/after case study, testimonials wall, industry grid, qualification quiz
- Pricing: monthly/annual toggle, 3 plan cards, full comparison table (expandable), consultant callout, ROI calculator
- ROI calculator: 2 sliders → live Czech Kč savings → `Intl.NumberFormat('cs-CZ')`
- FAQ accordion: 6 items, max-height CSS transition
- PostHog feature flags for CTA copy A/B test

---

## Phase 4 — Scale & polish (Weeks 16–20)

### PR-025 · Consultant multi-client dashboard · Large (1–2 weeks) · feature

Unlimited client orgs from one dashboard. White-label option.

- `consultantClients` table: `consultant_org_id ↔ client_org_id`, `access_level`
- `app/(app)/clients/page.tsx` — client list with compliance score sparklines
- `app/(app)/clients/[clientOrgId]/*` — scoped read/write view via `consultantClients` join
- Client invite: email → client creates org → `consultant_clients` row created
- White-label: consultant logo + accent colour on their client Trust Centers

---

### PR-026 · ISO 27001 framework + CSRD scaffold · Medium (3–7 days) · feature
**Needs:** PR-008

ISO 27001 (93 controls, 80% cross-map reuse) + CSRD lite.

- Seed: `iso27001` framework row + 93 `frameworkControls` mappings (Annex A → existing controls, ~18 new controls needed)
- New controls: asset inventory, supplier agreements, physical security, media handling, cryptography policy
- CSRD framework: 24 ESG data points, supply chain questionnaire template
- ISO 27001 certification evidence package: ZIP export of all passing controls + evidence + policies
- Czech certification body integration links: Bureau Veritas CZ, Lloyd's Register CZ

---

### PR-027 · Regulation update monitoring · Small (1–3 days) · engine

Weekly regulatory sync. Per-org relevant notifications.

- Parse: CTO.cz RSS, NÚKIB feed, EU AI Office updates, eur-lex.europa.eu amendments
- Per-org notification: check enrolled frameworks → Resend email for relevant updates only
- `app/(app)/dashboard` — regulation updates feed with read/unread state
- Loops.so weekly digest: EU compliance digest email sequence

---

### PR-028 · Mobile responsive + PWA · Medium (3–7 days) · ui

Full mobile audit + PWA manifest.

- Audit all `(app)/*` pages at 375px (iPhone SE) and 390px (iPhone 15)
- Fix: sidebar → bottom tab nav on mobile, dashboard → single column, tables → card lists
- `next-pwa`: `manifest.json`, service worker, offline dashboard cache (last 24h data)
- Web push notifications: deadline alerts + failing control alerts
- App icons: 192×192 + 512×512 SVG → PNG

---

### PR-029 · Audit trail + activity log · Small (1–3 days) · feature

Immutable activity log for every compliance action.

- `audit_logs` table: `id, clerk_org_id, clerk_user_id, action, entity_type, entity_id, metadata JSONB, created_at`
- Log triggers: control status change, evidence upload, policy approval, user invite, integration connect/disconnect
- `app/(app)/settings/audit-log/page.tsx` — filterable table, CSV export
- Append-only policy enforced at DB level (no UPDATE/DELETE on audit_logs)

---

### PR-030 · Playwright E2E test suite · Medium (3–7 days) · testing

Critical path coverage for CI.

- `tests/e2e/onboarding.spec.ts` — full wizard from sign-up to first score
- `tests/e2e/integration-connect.spec.ts` — M365 OAuth mock + test run trigger
- `tests/e2e/billing.spec.ts` — free → starter upgrade in Stripe test mode
- GitHub Actions CI: E2E on every PR against Neon branch + Vercel preview deploy
- Playwright report: uploaded to Vercel Blob, linked in PR description

---

### PR-031 · Performance + Core Web Vitals · Small (1–3 days) · infra

LCP < 2.5s, CLS < 0.1, FID < 100ms.

- `next/image` for all images, blur placeholder, `priority` on hero
- Font preload: DM Sans + DM Mono subset via `next/font/google`
- `@next/bundle-analyzer` — split large chunks
- Vercel Speed Insights + Web Analytics
- Lighthouse CI in GitHub Actions: fail PR if LCP > 3s

---

### PR-032 · Launch checklist + go-live · Small (1–3 days) · infra

Production readiness.

- `next.config.ts`: CSP, HSTS, X-Frame-Options, Permissions-Policy headers
- Sentry: DSN, source maps uploaded, error boundary on `(app)` layout
- Neon: point-in-time recovery enabled, daily backup to S3
- GDPR: Privacy policy page, cookie consent banner (`cc-cookie`), DPA with all vendors
- BetterStack: uptime monitors on `/`, `/api/health` → status.splnit.eu
- Cloudflare WAF: rate limit `/api/scanner` (30 req/min), `/api/webhooks/*` (50 req/min)

---

## Git branching convention

```
main          → production (splnit.eu)
staging       → staging.splnit.eu — Neon staging branch
feature/PR-XXX-short-description → PR branch
```

PR naming: `feat/PR-007-onboarding-wizard`, `fix/PR-012-m365-token-refresh`, `chore/PR-031-web-vitals`

Each PR merges to `staging` first, passes E2E, then merges to `main` → auto-deploys to production.

---

## Neon branch strategy per PR

```bash
# On PR open (GitHub Action)
neon branches create --name preview/pr-$PR_NUMBER --parent staging
npx drizzle-kit migrate  # run against preview branch
vercel deploy --env DATABASE_URL=$PREVIEW_BRANCH_URL

# On PR close
neon branches delete preview/pr-$PR_NUMBER
```

---

*Build plan v1.0 · April 2026 · Splnit.eu*
