# Splnit.eu Project Plan

Last updated: 2026-05-17

This is the single source of truth for current project direction. Older phase plans, outreach worksheets, and onboarding playbooks are archived under `docs/archive/` and should not drive work unless this file explicitly revives them.

## Product Reality

Splnit.eu is a solo-founder EU compliance automation product for SMBs. The current strategic order is:

1. Italy and Italian NIS2/GDPR content first.
2. English-EU content second.
3. Czech content third and only where review capacity exists.

Hard constraints:

- No fabricated customers, references, testimonials, logos, advisors, metrics, certifications, or legal-review status.
- No `Splnit Technology s.r.o.` references.
- No auditor-ready citation unless the source and mapping review status allow it.
- Draft Czech mappings stay draft until reviewer-approved.
- Public Trust Center pages expose category-level posture only, never individual controls or evidence filenames.

## Current State

### Completed Or Mostly Complete

- Public marketing cleanup removed the old false-proof direction and old s.r.o. branding from the active site work.
- Marketing pages have been localized across Czech, English, and Italian, including EUR pricing for Italian/English and Italian regulatory references.
- Splnit.eu has public security/status posture pages and a public Trust Center path.
- Core app surfaces exist in code: dashboard, controls, frameworks, evidence, integrations, policies, vendors, risks, incidents, questionnaires, team/access reviews, billing/settings, and Trust Center admin.
- Public Trust Center main/detail routes exist and should stay category-level only.
- Italian NIS2 source ingestion and mapping-review pipeline work exists through the agent-review stages.
- Draft/review gates exist for citation-sensitive outputs; blacklisted or low-confidence mappings are not supposed to promote automatically.
- Public Italian NIS2 scoping tool is live at `https://splnit.eu/it/strumenti/nis2-scope`.
- Italian outreach research has a 50-row tracker, but no emails have been sent.
- Production Neon is live, migrated, seeded, imported, and citation-smoke verified.
- Primary app readiness is closed for the outreach decision: production runtime verification passed against live Clerk, Clerk custom domain, production Neon, Vercel Blob, Italian primary labels, evidence, policies, and NIS2 gap report output.
- Trust Center admin/public verification and demo-vs-live clarity passes are complete for the current outreach decision: public Trust Center proof stays category-level, demo surfaces are explicit, app-shell Trust Center fallbacks no longer route prospects to `/trust/demo`, and public pages avoid exact test timestamps or next-run schedules.
- Integration UI polish is complete for the current outreach decision: Microsoft 365, GitHub, and AWS connect/disconnect flows are buyer-ready, and Google Workspace is clearly non-interactive "coming soon".
- Questionnaire production trace is complete for the current smoke path: live OpenAI questionnaire generation passed production smoke with `SMOKE_LIVE_OPENAI_QUESTIONNAIRE=true`, the generated artifact loaded and persisted reviewed state, and the model/config proof boundary is documented.
- Vendor token submission and status propagation are production-smoked: the token link rendered, the vendor submitted answers, submission persisted, and originating vendor status propagated to assessed for the smoke path. Vendor-submitted answers still do not create reviewed evidence/control artifacts.
- Intake prioritization is approved for the current deterministic MVP path. The production smoke wrote intake through the live UI, verified dashboard priority gaps and controls index scope behavior, read back production DB persistence, and cleaned up the temporary smoke org/data. Production migrations now match the repo through `0017_wakeful_thunderbolt`; `org_intake_profiles` exists in production.
- Public regulatory/resource and platform copy has been hardened for the current honesty gate: pages now use indicative/review framing, avoid legal-classification and compliance-guarantee claims, avoid fixed setup-time claims, and avoid real-time compliance-status wording. `npm run smoke:copy-hygiene`, `npm run typecheck`, `npm run lint`, and `npm run build` passed after the changes. This repository state is committed as `b159333`; deployment is a separate step.

### In Progress

- Core app hardening: secondary surfaces still need polish, especially export/report smokes, onboarding polish, provider-configured integration smokes, Stripe test-mode billing smoke, and broader action-level authorization coverage.
- Knowledge layer hardening: Italian policy templates remain draft and intentionally fall back to reviewed EU English output until legal/template review promotes them.
- Legal/counsel review: public legal pages and DPA/subprocessor/retention annexes remain engineering drafts until reviewed.
- Italian outreach: first-three packet is revived under `docs/outreach/`; sending is now blocked by sender identity/manual route choice, not product readiness.
- Policy-to-Evidence Loop: v1 is defined in `docs/plans/policy-to-evidence-loop-v1.md` and should be reviewed before coding. Intake work should not expand further unless the approved review finds a regression or production blocker.

### Blocked

- Public legal/counsel closeout remains blocked on exact approved legal-page wording for OSVČ/operator identity, DPO/contact wording, DPA/subprocessor/retention terms, and related customer-facing legal materials.
- Czech mapping promotion is blocked on human reviewer decisions.
- Italian mapping promotion is blocked on human/advisor review for sensitive or non-auto-approved rows.
- Any customer-facing legal or auditor-ready material is blocked until legal/reviewer status is explicit.

## Deprioritized Until Core App Stability

These are useful later, but not next:

- Broad Italian cold outreach beyond the first three manual test messages.
- Design-partner onboarding playbooks and templates.
- Expanding the agent-review pipeline beyond the currently validated scope.
- Custom RAG/vector search for customer-facing AI.
- More market pages, new vertical pages, or additional jurisdictions.
- Community, video onboarding, hiring, SOC 2, ISO certification for Splnit itself.

## Active Documentation Map

- `PROJECT_PLAN.md` - current plan and priority order.
- `docs/README.md` - documentation index and archive policy.
- `docs/app-readiness-audit.md` - authenticated app route readiness matrix and immediate fix queue.
- `docs/plans/policy-to-evidence-loop-v1.md` - draft spec and implementation plan for the next Policy-to-Evidence Loop slice.
- `docs/reviews/intake-prioritization-human-review.md` - approved intake prioritization production-readiness record.
- `docs/reviews/public-regulatory-copy-readiness.md` - public regulatory/platform copy honesty and claim-boundary record.
- `docs/primary-flow-verification.md` - local database primary-flow verification record.
- `docs/production-db-audit.md` - production DB/env audit and current blocker.
- `docs/architecture/` - architecture decisions that still affect implementation.
- `docs/legal-review.md`, `docs/subprocessors.md`, `docs/retention-policy.md`, `docs/data-processing-map.md`, `docs/offboarding-runbook.md`, `docs/audit-log-export-sop.md` - counsel/support handoff drafts.
- `docs/legal-reviews/` - mapping/template review evidence and reviewer work queues.
- `docs/outreach/italy-target-tracker.csv` - the only active outreach data table.
- `docs/outreach/italy-first-three-send-packet.md` - active first-three manual outreach packet.
- `docs/weekly-reviews/` - weekly operating reviews.
- `docs/archive/` - historical plans, working notes, and premature playbooks.

## Root Directory Audit

Tracked root files are generally valid for a Next.js/Vercel app:

- Keep: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `README.md`, package/config files, Vercel/Playwright/Sentry/Drizzle configs.
- Keep ignored local directories: `.next/`, `node_modules/`, `.vercel/`, `.lighthouseci/`, `playwright-report/`, `test-results/`.
- No stale root plan should remain outside this file.
- `.agents/skills/` is the canonical skills directory. Do not keep a local `agent-skills/` clone in the repo workspace unless temporarily refreshing upstream skills.

## Next Work Order

Do these before any new features or broader outreach. This order is optimized for the first outreach conversations, where visible trust failures matter more than back-office completeness:

1. **Review the Policy-to-Evidence Loop v1 spec:** `docs/plans/policy-to-evidence-loop-v1.md` chooses the `ctrl_mfa_all_users` slice, defines recommended action, evidence collection state, honest proof/status wording, and explicit v1 non-goals. Review before coding.
2. **Audit/export endpoint smokes:** verify audit-log export pagination/limit behavior, org scoping, and stable output shape; verify buyer-visible vendor/risk/workspace export endpoints require auth and return only org-owned data before demos.
3. **Onboarding UX polish:** refine onboarding and framework setup after export/report risk is contained. This matters more for conversion than for first outreach calls.
4. **First-three outreach send:** send Cubbit, Cleafy, and DigitalPA manually once sender identity and exact send routes are confirmed. This is blocked on sender identity/manual route choice, not product readiness.
5. **Legal/operator identity closeout:** publish final legal/customer-facing wording only when OSVČ/IČO/ARES/operator, DPO/contact, DPA/subprocessor, and retention terms are approved.
6. **Vendor-submitted evidence feature:** future, not the current sprint. If built later, vendor answers should become vendor-supplied draft evidence with explicit control mapping and human review before any auditor-facing claim.

Standing blockers that still apply across the work above:

- **Legal identity closeout:** replace placeholders only when real OSVČ/IČO/ARES details are available and reviewed.
- **First-three outreach decision:** send Cubbit, Cleafy, and DigitalPA manually once sender details and exact routes are confirmed, or explicitly pause.
- **Track outreach state:** update `docs/outreach/italy-target-tracker.csv` only after each message is actually sent.
- **Legal/template review:** keep Italian policy-template promotion and mapping review in the legal-review queue.

## Definition Of Ready For New Feature Work

- `npm run typecheck`, `npm run lint`, and `npm run build` pass on main.
- App readiness matrix has no critical unknowns for the primary workflow.
- Production DB state is known and documented after real production env values are configured.
- Citation gates are verified.
- Current blocker list is shorter than the next feature's risk surface.
