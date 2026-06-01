# Plan: Helios Workspace Evidence Lifecycle Automation

## Goal

Build the safe automation layer around Helios workspace evidence without changing Helios from manual/workspace tier into a live ERP integration.

Priority order:

1. Evidence freshness / staleness monitoring for Helios workspace evidence.
2. Gap -> remediation task generation for Helios attestations and imports.
3. Change detection on Helios CSV re-import.
4. Review-cadence automation for recurring Helios/NIS2/ZoKB evidence obligations.

Recommended implementation now: build #1 and #3 first as one coherent MVP, then add #2 and #4 as follow-up slices. Freshness + remediation tasks deliver the most buyer-visible value with the lowest overclaim risk.

## Current codebase context checked

Branch/worktree context at planning time:

- Current workspace: `/Users/marcozoratto/splnit.eu`
- Current branch was clean before this plan file write.
- Local `main` already has recent local-only commits; do not assume it is pushed or aligned with GitHub before implementation.

Relevant existing files and patterns:

- Helios static workspace config:
  - `lib/workspaces/helios.ts`
  - 19 `helios-*` controls across infrastructure, IAM, backup/DR, and API/connectivity layers.
- Workspace type model:
  - `lib/workspaces/types.ts`
- Workspace UI:
  - `app/(app)/workspaces/helios/page.tsx`
  - `components/workspaces/workspace-renderer.tsx`
- Workspace attestation server action:
  - `app/(app)/workspaces/actions.ts`
- Attestation result logic:
  - `lib/workspaces/attestation.ts`
- Workspace progress query:
  - `lib/db/queries/workspaces.ts`
- Evidence schema/query layer:
  - `lib/db/schema.ts`
  - `lib/db/queries/evidence.ts`
- Existing evidence state helper:
  - `lib/activation/evidence-state.ts`
  - already has `computeEvidenceFreshness()` with `fresh | stale | missing` derivation.
- Existing Inngest pattern:
  - `inngest/evidence-expiry-alerts.ts`
  - `inngest/access-review-reminders.ts`
  - `app/api/inngest/route.ts`
- Existing reminders/email pattern:
  - `lib/evidence/expiry-alerts.ts`
  - `lib/access-reviews/reminders.ts`
  - `lib/email/templates/alerts.ts`
- Existing audit log table:
  - `auditLogs` in `lib/db/schema.ts`
- Existing agency comments:
  - `controlComments` in `lib/db/schema.ts`
  - useful for consultant/client discussion, not ideal as general remediation tasks because it requires `agencyId` and an agency relationship.
- Existing risk table:
  - `riskItems` in `lib/db/schema.ts`
  - useful for risk register, but too broad for concrete control remediation tasks.

Important discovery:

- In the current checkout, I do not see a Helios CSV import route/action/parser (`helios_csv_import`, `app/(app)/workspaces/helios/import/*`, or a Helios CSV parser) even though prior lane context says it existed in another clean worktree/lane.
- Implementation must therefore start with a reconciliation check:
  - either pull/merge/rebase the existing Helios CSV import lane before implementing #2,
  - or add the minimal Helios CSV import parser/path as part of the #2 slice.
- Do not implement CSV diffing until the current target branch actually contains the import parser/action it will wrap.

## Core product boundary

This is safe automation around customer-provided evidence.

Allowed claims:

- Splnit monitors the age of Helios workspace evidence already uploaded/attested in Splnit.
- Splnit reminds the user when manual Helios evidence is stale or review is due.
- Splnit turns gaps and stale evidence into mapped remediation tasks.
- Splnit can compare two customer-uploaded Splnit Helios CSV templates and show reported changes.

Forbidden claims:

- Splnit connects directly to Helios.
- Splnit automatically pulls Helios data.
- Splnit continuously monitors Helios via API/database/agent.
- CSV upload is a native Helios export unless native export parsing is actually implemented and tested.
- Customer-reported import rows produce a positive `pass` finding without a defined human-review approval or automated-measurement rule.

## Recommended architecture

### 1. Add a first-class remediation task model

Do not overload `controlComments` or `riskItems` for this MVP.

Create a dedicated table, e.g. `remediation_tasks`, because these are actionable control-level tasks with source/provenance and idempotency requirements.

Proposed fields:

- `id uuid primary key defaultRandom()`
- `clerkOrgId text not null references organisations.clerkOrgId on delete cascade`
- `controlId uuid not null references controls.id`
- `controlKey text not null`
- `sourceType text not null`
  - examples: `workspace_evidence_stale`, `workspace_gap`, `helios_csv_change`, `workspace_review_due`
- `sourceKey text not null`
  - stable idempotency key, e.g. `helios:stale:<evidenceId>` or `helios:gap:<evidenceId>` or `helios:review_due:<controlKey>:2026-Q3`
- `title text not null`
- `description text`
- `frameworkRefs jsonb default []`
  - include NIS2 article refs, ZoKB section refs, and workspace metadata from `heliosWorkspace`.
- `severity text not null default 'medium'`
  - start with `low | medium | high`.
- `status text not null default 'open'`
  - start with `open | in_progress | resolved | dismissed`.
- `dueDate date`
- `metadata jsonb default {}`
  - provenance details: evidence id, evidence type, import id, change summary, stale days, collectedAt, threshold days.
- `createdAt timestamp defaultNow()`
- `updatedAt timestamp defaultNow()`

Indexes/constraints:

- Unique idempotency constraint: `(clerkOrgId, controlId, sourceType, sourceKey)`.
- Index `(clerkOrgId, status, dueDate)` for dashboard/workspace display.
- Index `(clerkOrgId, controlKey)` for workspace/control detail pages.

Why this table instead of comments/risk items:

- `controlComments` requires agency context and is conversation-oriented.
- `riskItems` are organization-level risk register entries; using them for every stale evidence/gap would pollute risk management.
- Remediation tasks need source idempotency and lifecycle state.

### 2. Keep freshness as derived state plus explicit lifecycle action

Do not mutate old evidence rows to pretend they are different records.

Use:

- `evidence.collectedAt` as the immutable source timestamp.
- `computeEvidenceFreshness()` for derivation.
- Inngest cron to persist side effects:
  - create/update remediation task,
  - create audit log,
  - downgrade `orgControlStatuses.status` to `manual_review` or `unknown` depending current status,
  - do not overwrite existing `gap` with `manual_review`.

Recommended status downgrade rule:

- If current status is `pass` or `manual_review`, set to `manual_review` and add/update stale task.
- If current status is `gap`, leave `gap`; create or keep remediation task, because stale evidence should not soften a known gap.
- If current status is `not_applicable`, do nothing.
- If current status is `unknown`, leave `unknown` but create stale/re-attestation task if there is stale evidence.

Important: current `getWorkspaceProgress()` defines completion as "has at least one evidence row." The freshness MVP should extend the returned type so UI can show:

- `freshnessStatus: 'fresh' | 'stale' | 'missing'`
- `expiresAt: Date | null`
- `staleDays: number | null`
- `nextReviewDueAt: Date | null`

Then UI can show stale evidence without needing a fake replacement evidence row.

### 3. Use a shared Helios lifecycle module

Add a small domain module so Inngest, server actions, and scripts use the same rules.

Likely file:

- `lib/workspaces/helios/lifecycle.ts`

Responsibilities:

- Return Helios control metadata by `controlKey` from `heliosWorkspace`.
- Define default TTL/review cadence by control or layer.
- Determine if latest evidence is stale.
- Build remediation task title/body/framework refs.
- Create source keys.
- Apply status downgrade safely.

Suggested defaults for MVP:

- General Helios workspace evidence TTL: 90 days.
- Backup restoration test: 365 days.
- Access/user review controls: 90 days.
- Backup encryption/offsite backup evidence: 180 days unless a more specific cadence is encoded later.

Specific controls to treat as cadence-sensitive first:

- `helios-iam-user-accounts` -> 90 days
- `helios-iam-inactive-session-audit` -> 90 days
- `helios-iam-offboarding` -> 90 days
- `helios-backup-sql-agent-jobs` -> 90 days
- `helios-backup-encryption` -> 180 days
- `helios-backup-offsite-immutable` -> 180 days
- `helios-backup-restoration-test` -> 365 days

All other `helios-*` controls can use 180 days or 90 days depending product preference. For design partner #1, prefer conservative 90 days unless it creates too much noise.

### 4. Add Inngest-driven stale evidence scan

Add:

- `inngest/workspace-evidence-lifecycle.ts`
- register it in `app/api/inngest/route.ts`.

Function:

- id: `workspace-evidence-lifecycle`
- name: `Workspace evidence lifecycle`
- trigger: daily cron, e.g. `0 7 * * *`

Implementation shape:

- Call `processWorkspaceEvidenceLifecycle({ platformId: 'helios', now })` from `lib/workspaces/helios/lifecycle.ts`.
- Query latest evidence for all Helios control IDs across all orgs.
- For each latest evidence row:
  - only evidence types/sources in scope:
    - `type = 'attestation_answers'` with description/source metadata identifying Helios workspace,
    - `type = 'helios_csv_import'` once import exists,
    - `source = 'manual' | 'imported'`.
  - compute TTL from control key.
  - if stale, upsert remediation task and downgrade posture as above.
  - log `auditLogs.action = 'workspace.evidence_marked_stale'` once per evidence/source key.

Idempotency:

- Task upsert key: `(clerkOrgId, controlId, 'workspace_evidence_stale', evidenceId)`.
- Audit log should either be allowed to duplicate daily only if useful, or guarded via task creation result. Preferred MVP: audit only when a new task is inserted or a resolved task is reopened.
- Re-run behavior: no duplicate tasks; existing open task updated with current stale days and due date.

### 5. Add gap -> task generation at write-time

For immediate value, generate gap tasks when new evidence is created, not only in cron.

Touch points:

- `app/(app)/workspaces/actions.ts` after `createManualAttestationEvidence()` returns.
- Helios CSV import action once present.

Create helper:

- `lib/workspaces/remediation-tasks.ts` or `lib/remediation/tasks.ts`

Function examples:

- `upsertWorkspaceGapRemediationTask({ clerkOrgId, controlKey, controlId, evidenceId, assessmentResult, workspace })`
- `upsertWorkspaceStaleEvidenceTask(...)`
- `upsertWorkspaceReviewDueTask(...)`

For Helios attestation:

- If `assessmentResult === 'gap'`, create task.
- If `assessmentResult === 'manual_review'`, optionally create review task only if answer is incomplete/partial; do not create a scary remediation item by default.
- If current code still returns `pass` for all-yes Helios attestations, decide explicitly whether Helios workspace attestations should be capped to `manual_review`/`gap`. Given the stated boundary "nothing auto-passes," the safer plan is to change Helios workspace attestation writes so `yes` becomes `manual_review`, `no` becomes `gap`, and `partial` becomes `manual_review` or `gap` based on required fields. This should be implemented as a targeted Helios/workspace rule, not a broad change to all evidence sources.

Task text example:

- Title: `Shared account found in Helios`
- Description: `Review and disable the shared Helios account, or document an approved exception with owner and expiry. Maps to NIS2 Article 21(2)(i) and ZoKB § 7.`
- Due date: 30 days for high-risk gaps; 14 days for shared/admin account gaps if detected from CSV; 30 days default.

Mapping source:

- Use `heliosWorkspace` control metadata:
  - `nis2ArticleRef`
  - `zobkSectionRef`
  - `frameworkMappings`
  - `nukibTier`
  - `nukibPriority`

### 6. Add CSV re-import change detection after import path is confirmed

Prerequisite: reconcile/import the existing Helios CSV parser/action into the current branch, or build one.

Do not store a separate snapshot table unless evidence snapshots are too large or queries become awkward. For MVP:

- Store parsed CSV snapshot in `evidence.snapshotData` for `type = 'helios_csv_import'`.
- Include a stable normalized snapshot shape:
  - `schemaVersion`
  - `platformId: 'helios'`
  - `templateVersion`
  - `rows`
  - `summary`
  - `detectedFindings`
  - `provenance: 'customer_reported_splnit_template'`

On each new import:

- Load previous latest `helios_csv_import` evidence for same org/control/template scope.
- Normalize both snapshots into comparable maps.
- Compute changes:
  - added/removed users
  - new shared accounts
  - new admin/privileged accounts
  - boolean changes like backup encryption `true -> false`
  - missing required fields
- Save change summary in new evidence `snapshotData.changeSummary`.
- Generate remediation task only for negative/security-relevant changes.
- Do not generate `pass` from clean import. Clean import can create `manual_review` with a positive note, pending human review.

Idempotency:

- Import evidence rows can be append-only because each upload is a new customer-reported artifact.
- Diff tasks must be idempotent by source key, e.g. `helios:csv-change:<newEvidenceId>:<changeHash>`.
- Re-processing same evidence must not duplicate tasks.

### 7. Add review-cadence automation as a distinct follow-up

Review cadence overlaps with freshness but should not be identical:

- Freshness asks: "Is the evidence artifact too old?"
- Review cadence asks: "Is the required review/test due even if no evidence exists yet?"

For MVP after freshness:

- Use Helios cadence map from lifecycle module.
- For each active org with Helios workspace controls present/applicable:
  - if no evidence exists and cadence applies, create `workspace_review_due` task.
  - if latest evidence exists but next due date is today/past, create/update `workspace_review_due` task.
- Do not create due tasks for out-of-scope or not-applicable controls if intake scope says they are out of scope.

This may need access to intake-derived scope if noisy. Prefer initial scope:

- only orgs that have at least one Helios evidence row or have selected/recommended Helios workspace,
- only controls seeded as Helios controls,
- avoid blanket due tasks for every org in database.

## Step-by-step implementation plan

### Phase 0 — Reconcile branch state and define source of truth

Purpose: avoid building against a stale or partial tree.

Tasks:

1. Start from a clean worktree/branch cut from the intended base.
2. Confirm whether the Helios CSV import lane exists on the target branch.
3. If it exists elsewhere, bring it in before planning #2 implementation details.
4. Confirm current migration state and whether adding `remediation_tasks` requires a Drizzle migration.
5. Confirm whether Helios workspace attestations are allowed to produce `pass`; if not, include a targeted cap in Phase 2.

Verification:

- `git status --short`
- `git log --oneline -5`
- `npm run typecheck`
- `npm run smoke:helios-workspace-config`

### Phase 1 — Data model: remediation tasks

Files likely to change:

- `lib/db/schema.ts`
- generated migration files under the project migration directory used by Drizzle
- `lib/db/queries/remediation-tasks.ts` (new)
- `scripts/smoke-remediation-tasks.ts` (new)
- `package.json` if adding a smoke script

Implementation details:

- Add `remediationTasks` table with unique idempotency constraint.
- Add query helpers:
  - `upsertRemediationTask()`
  - `listOpenRemediationTasksForOrg()`
  - `resolveRemediationTask()`
  - `dismissRemediationTask()`
- Do not backfill broad production data in this phase.

Acceptance criteria:

- Duplicate upserts with same source key update one task, not create two.
- Tasks are scoped by `clerkOrgId` and cannot leak across orgs.
- Metadata can store evidence provenance and framework mapping refs.

Verification:

- `npm run db:generate`
- Local/disposable DB only: `npm run db:migrate`
- `npx tsx scripts/smoke-remediation-tasks.ts`
- `npm run typecheck`

### Phase 2 — Freshness/staleness lifecycle MVP

Files likely to change:

- `lib/workspaces/helios/lifecycle.ts` (new)
- `lib/db/queries/workspaces.ts`
- `lib/db/queries/evidence.ts`
- `inngest/workspace-evidence-lifecycle.ts` (new)
- `app/api/inngest/route.ts`
- `scripts/smoke-helios-evidence-lifecycle.ts` (new)
- possibly `components/workspaces/workspace-renderer.tsx`
- possibly `messages/*.json` if adding stale UI copy

Implementation details:

- Add Helios freshness/cadence map.
- Extend workspace progress return shape with freshness fields.
- Add daily Inngest function.
- Process only Helios workspace evidence:
  - manual attestation evidence tied to Helios via description/snapshot metadata,
  - imported Helios evidence once import exists.
- Upsert stale remediation task when latest evidence exceeds TTL.
- Downgrade status safely:
  - `pass` -> `manual_review`
  - `manual_review` -> `manual_review`
  - `gap` remains `gap`
  - `not_applicable` remains `not_applicable`
- Add audit log on first stale flag/reopened stale task.

Acceptance criteria:

- Evidence collected today is fresh and creates no stale task.
- Evidence older than its TTL creates exactly one stale task on repeated runs.
- A stale task downgrades `pass` to `manual_review` but does not soften `gap`.
- Workspace UI shows stale/re-attestation prompt without creating fake evidence.
- No production DB touched during implementation.

Verification:

- `npx tsx scripts/smoke-helios-evidence-lifecycle.ts`
  - seed disposable org + Helios controls + stale evidence
  - run lifecycle twice
  - assert one task, expected status, no duplicates
- `npm run smoke:helios-workspace-config`
- `npm run smoke:copy-hygiene`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

### Phase 3 — Gap -> remediation task generation

Files likely to change:

- `app/(app)/workspaces/actions.ts`
- `lib/workspaces/remediation-tasks.ts` or `lib/remediation/tasks.ts` (new)
- `lib/workspaces/attestation.ts` if Helios-specific cap is added
- `scripts/smoke-helios-gap-remediation.ts` (new)
- possibly `components/workspaces/workspace-renderer.tsx`

Implementation details:

- After Helios attestation evidence is created, call remediation task helper if assessment result is `gap`.
- For Helios manual workspace evidence, do not create positive `pass` task/status unless human-review logic exists.
- Generate specific task text from control metadata.
- Store evidence id and answered fields in metadata.
- Keep task idempotency by evidence id.

Acceptance criteria:

- A `no` answer on `helios-iam-user-accounts` creates one mapped remediation task.
- Re-submitting/re-processing the same evidence does not duplicate the task.
- A `yes` answer does not create a remediation task and does not auto-pass if the Helios cap is accepted.
- Task includes NIS2/ZoKB refs from workspace metadata where present.

Verification:

- `npx tsx scripts/smoke-helios-gap-remediation.ts`
- `npm run smoke:helios-workspace-config`
- targeted Playwright or test-route smoke for Helios attestation if needed:
  - `npx playwright test tests/e2e/helios-workspace.spec.ts --project=local-demo-chromium`
- `npm run typecheck`
- `npm run lint`

### Phase 4 — CSV re-import change detection

Dependency: Helios CSV import parser/action must exist on this branch first.

Files likely to change if parser exists:

- existing Helios import parser/action files once identified
- `lib/workspaces/helios/import-diff.ts` (new)
- `lib/workspaces/helios/import-findings.ts` (new or existing parser module extension)
- `scripts/smoke-helios-csv-diff.ts` (new)
- possibly `components/workspaces/workspace-renderer.tsx` or import result UI component

Implementation details:

- Normalize imported rows into stable comparable maps.
- Compare new import against previous latest import for same org/control/template.
- Store diff summary in evidence snapshot.
- Create tasks only for negative changes/findings.
- Keep all import-derived evidence as `manual_review` or `gap`; never `pass`.

Acceptance criteria:

- Second import with two new users reports two added users.
- Shared/admin account newly appearing creates a remediation task.
- Backup encryption `true -> false` creates a gap/task.
- Unchanged re-import does not create noisy tasks.
- Re-running same import processing creates no duplicate tasks.

Verification:

- `npx tsx scripts/smoke-helios-csv-diff.ts`
- `npm run smoke:copy-hygiene`
- `npm run typecheck`
- `npm run lint`

### Phase 5 — Review-cadence automation

Files likely to change:

- `lib/workspaces/helios/lifecycle.ts`
- `inngest/workspace-evidence-lifecycle.ts`
- `lib/db/queries/remediation-tasks.ts`
- `scripts/smoke-helios-review-cadence.ts` (new)
- possibly workspace UI components/messages

Implementation details:

- Use cadence map to create due tasks even when no evidence exists.
- Start only for orgs with Helios activity/recommendation to avoid noisy global tasks.
- Task source type: `workspace_review_due`.
- Task source key should include cadence period to avoid duplicate tasks but allow future cycles:
  - e.g. `helios:review_due:<controlKey>:<YYYY-MM>` or computed due date.

Acceptance criteria:

- Missing annual backup restoration evidence creates a due task for `helios-backup-restoration-test`.
- Fresh evidence suppresses due task until next due date.
- Re-run produces no duplicates.
- Resolved old due task can re-open or a new cycle task can be created when next cadence period arrives, depending final product decision.

Verification:

- `npx tsx scripts/smoke-helios-review-cadence.ts`
- `npm run typecheck`
- `npm run lint`

## UI plan

MVP UI should be small and buyer-visible.

Workspace cards / controls should show:

- Freshness badge:
  - `Fresh`
  - `Review needed`
  - `Stale — re-attestation needed`
- Last evidence date.
- Next review due date when known.
- A CTA near stale controls:
  - `Re-attest Helios control`
  - `Upload updated CSV template` only once import path exists.

Dashboard can optionally show:

- `Helios evidence needs review` card with count of stale/open remediation tasks.

Avoid broad UI scope in the first implementation. The first slice can expose tasks on the Helios workspace page only.

## Correctness guardrails

### Seed/backfill scope

- Do not run broad production `db:seed` for this feature.
- Schema migration is allowed if implementing `remediation_tasks`, but production migration should wait for an explicit deployment/migration window.
- No production data writes during development.
- If a production backfill is later needed, it must be targeted:
  - scan only `helios-*` controls,
  - process only customer orgs with existing Helios workspace evidence,
  - upsert by `(clerkOrgId, controlId, sourceType, sourceKey)`,
  - re-run creates no duplicate tasks.

### Identifier stability

- `helios-*` control keys are immutable.
- Do not rename/split/remove Helios keys as part of this feature.
- If a key change is ever needed, require a migration/backfill plan preserving evidence linkage.
- Add smoke assertions that all expected Helios keys still resolve.

### Evidence provenance

- Keep these distinct:
  - manual attestation: `type = 'attestation_answers'`, `source = 'manual'`
  - Helios CSV template import: `type = 'helios_csv_import'`, `source = 'imported'`
  - automated connector evidence: `source = 'connector'` only for real integrations, not Helios workspace CSV/attestation.
- Do not route CSV imports through attestation helpers just because they already create evidence.
- Snapshot metadata must state `customer_reported` / `manual_review_required` for CSV imports.

### Posture inflation

- Customer uploads/imports may create:
  - `gap`
  - `manual_review`
- Customer uploads/imports must not create positive `pass` unless a separate human-review approval or automated measurement rule exists.
- Freshness automation may downgrade posture toward review needed; it must never upgrade posture.
- Stale evidence must not soften an existing `gap`.

### UI expectation honesty

- If the import uses a Splnit template, UI must say:
  - `Download/fill the Splnit Helios CSV template`
- Do not say:
  - `Upload your Helios export`
  - unless native Helios export formats are implemented and tested per edition/version.

### Strategic deferrals

- Native Helios ERP connection remains deferred.
  - Product/GTM cost: users still manually attest/upload, so heavy users may ask for direct ERP extraction later.
  - Benefit: safe now, no on-prem agent/security surface, no overclaim risk.
- Native vendor-export parsing is deferred unless the existing parser lane already supports it.
  - Product/GTM cost: customers must map data into Splnit template.
  - Benefit: deterministic parser, safer claims, faster design-partner feedback.
- Global multi-workspace lifecycle automation is deferred.
  - Product/GTM cost: Pohoda/Money S3 do not get the same living-workspace feel immediately.
  - Benefit: Helios-first focus for design partner #1 and avoids broad noisy tasks.

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---:|---|
| Current branch lacks Helios CSV import parser despite prior context | High | Gate #2 behind branch reconciliation; do not build diffing against imaginary parser. |
| Existing Helios attestations can currently return `pass` from all-yes answers | High | Decide in Phase 0; safest implementation caps Helios workspace attestation/import output to `manual_review`/`gap`. |
| Stale marker implemented as fake evidence row | High | Do not do this; derive freshness and persist task/status/audit side effects only. |
| Task spam from daily Inngest | Medium | Strong source keys and upsert; only create audit log on insert/reopen. |
| Noise from review-cadence tasks for orgs not using Helios | Medium | Restrict to orgs with Helios evidence/activity or explicit Helios recommendation/selection. |
| Overwriting real gap with stale manual_review | High | Status downgrade rule preserves `gap`. |
| UI claims imply live Helios monitoring | High | Copy guard and review: say evidence age/re-import monitoring inside Splnit, not ERP connection. |
| Broad schema/backfill affects production | High | Use migration only; no production writes without explicit window. Backfill, if any, targeted/idempotent. |

## Test and validation matrix

Core commands:

- `npm run smoke:helios-workspace-config`
- `npm run smoke:copy-hygiene`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

New smoke scripts to add:

- `scripts/smoke-remediation-tasks.ts`
- `scripts/smoke-helios-evidence-lifecycle.ts`
- `scripts/smoke-helios-gap-remediation.ts`
- later: `scripts/smoke-helios-csv-diff.ts`
- later: `scripts/smoke-helios-review-cadence.ts`

Disposable DB checks:

- Apply migrations locally only.
- Create synthetic org id.
- Seed/insert only Helios control/evidence rows needed by the smoke.
- Run lifecycle twice.
- Assert:
  - no duplicate remediation tasks,
  - no duplicate mappings/controls touched,
  - status downgrade rules hold,
  - no CSV/manual evidence produces `pass`,
  - cleanup synthetic org rows if script writes to shared local DB.

Browser checks after UI changes:

- Local dev/prod server.
- Helios workspace desktop width.
- Helios workspace mobile width.
- At least one stale control renders without overflow and shows re-attestation CTA.

## Suggested implementation lanes

### Lane A: Remediation task foundation

- Schema + query helpers + smoke.
- No UI yet except maybe hidden data path.
- Must be merged before #1/#3 can land cleanly.

### Lane B: Helios freshness lifecycle

- Lifecycle module + Inngest function + workspace freshness fields + minimal stale UI.
- Depends on Lane A.

### Lane C: Helios gap -> task generation

- Attestation write-time task generation.
- Optional/strongly recommended Helios pass-cap to `manual_review`/`gap`.
- Depends on Lane A; can run after or alongside Lane B if contract is stable.

### Lane D: Helios CSV diffing

- Only after CSV import parser/action is present on target branch.
- Parser/diff/finding/task smoke.

### Lane E: Review cadence

- Cadence due tasks for selected controls/orgs.
- Depends on lifecycle map and task foundation.

## Open questions for human review before implementation

1. Should Helios workspace attestations be capped to `manual_review`/`gap` now?
   - I recommend yes, because the requested feature explicitly says nothing auto-passes.
2. What default TTL should general Helios evidence use?
   - Recommendation: 90 days for design-partner value, 365 days only for annual restore-test evidence.
3. Should remediation tasks have their own page in this first slice, or appear only inline on the Helios workspace page?
   - Recommendation: inline on Helios first; separate task list later.
4. Where is the canonical Helios CSV import parser/action branch/file if it is not in this checkout?
   - Required before implementing change detection.
5. Should stale evidence send email immediately, or only create in-app tasks first?
   - Recommendation: create in-app tasks first; email can reuse alert infrastructure later after noise is validated.

## Definition of done for the first build slice

First slice = remediation task foundation + Helios evidence freshness + Helios gap task generation.

Done when:

- Stale Helios attestation evidence older than TTL creates exactly one open remediation task.
- Stale Helios evidence downgrades posture toward `manual_review` without overwriting `gap`.
- New Helios attestation gap creates a mapped remediation task with NIS2/ZoKB refs.
- Re-running Inngest/lifecycle processing is idempotent.
- Workspace UI clearly prompts re-attestation for stale controls.
- No Helios manual/CSV path creates automatic positive `pass` unless explicitly approved and reviewed.
- Copy remains workspace/manual-tier honest.
- All targeted smoke scripts, typecheck, lint, and build pass.
