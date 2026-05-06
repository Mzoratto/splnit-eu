# Splnit.eu Project Plan

Last updated: 2026-05-06

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

### In Progress

- Core app hardening: verify each primary app page against real data, empty states, permissions, and locale behavior.
- Knowledge layer hardening: confirm reviewed vs draft citation gates across all customer-facing outputs.
- Production database parity: imports/migrations were applied where a usable `DATABASE_URL` existed, but production DB state must be verified before relying on it.
- Legal/counsel review: public legal pages and DPA/subprocessor/retention annexes remain engineering drafts until reviewed.
- Italian outreach: first-three and second-wave packets are prepared in archive, but sending is paused until product/readiness blockers are cleared and real sender details are inserted.

### Blocked

- Real operator details are still placeholders in some internal outreach/legal workflows: founder name, OSVČ identity, IČO, ARES link, phone/LinkedIn if used.
- Czech mapping promotion is blocked on human reviewer decisions.
- Italian mapping promotion is blocked on human/advisor review for sensitive or non-auto-approved rows.
- Any customer-facing legal or auditor-ready material is blocked until legal/reviewer status is explicit.

## Deprioritized Until Core App Stability

These are useful later, but not next:

- Broad Italian cold outreach beyond the first manual test messages.
- Design-partner onboarding playbooks and templates.
- Expanding the agent-review pipeline beyond the currently validated scope.
- Custom RAG/vector search for customer-facing AI.
- More market pages, new vertical pages, or additional jurisdictions.
- Community, video onboarding, hiring, SOC 2, ISO certification for Splnit itself.

## Active Documentation Map

- `PROJECT_PLAN.md` - current plan and priority order.
- `docs/README.md` - documentation index and archive policy.
- `docs/architecture/` - architecture decisions that still affect implementation.
- `docs/legal-review.md`, `docs/subprocessors.md`, `docs/retention-policy.md`, `docs/data-processing-map.md`, `docs/offboarding-runbook.md`, `docs/audit-log-export-sop.md` - counsel/support handoff drafts.
- `docs/legal-reviews/` - mapping/template review evidence and reviewer work queues.
- `docs/outreach/italy-target-tracker.csv` - the only active outreach data table.
- `docs/weekly-reviews/` - weekly operating reviews.
- `docs/archive/` - historical plans, working notes, and premature playbooks.

## Root Directory Audit

Tracked root files are generally valid for a Next.js/Vercel app:

- Keep: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `README.md`, package/config files, Vercel/Playwright/Sentry/Drizzle configs.
- Keep ignored local directories: `.next/`, `node_modules/`, `.vercel/`, `.lighthouseci/`, `playwright-report/`, `test-results/`, `agent-skills/`.
- No stale root plan should remain outside this file.
- `agent-skills/` is an ignored upstream source copy; edit `.agents/skills/` only.

## Next Work Order

Do these before any new features:

1. **App readiness audit:** create a page-by-page matrix for app routes covering auth, data source, empty state, locale, and known gaps.
2. **Primary flow verification:** verify onboarding -> framework selection -> controls -> evidence -> policies/report outputs with local data.
3. **Citation safety audit:** run and document smoke checks proving draft mappings cannot reach auditor-ready output.
4. **Production DB audit:** verify production `DATABASE_URL`, migration state, source document counts, and review queue counts.
5. **Legal identity closeout:** replace placeholders only when real OSVČ/IČO/ARES details are available and reviewed.
6. **Only then decide outreach:** send first three manual Italian messages or pause outreach based on product readiness.

## Definition Of Ready For New Feature Work

- `npm run typecheck`, `npm run lint`, and `npm run build` pass on main.
- App readiness matrix has no critical unknowns for the primary workflow.
- Production DB state is known and documented.
- Citation gates are verified.
- Current blocker list is shorter than the next feature's risk surface.
