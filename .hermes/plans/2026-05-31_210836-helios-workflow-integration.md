# Helios Workflow Integration Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task. Keep the initial implementation honest: live manual workflow and CSV/import MVP are in scope; real Helios API/MES/SCADA/EDI automation is explicitly out of scope until a later adapter phase.

**Goal:** Make Helios work end-to-end as a live Splnit workspace workflow, matching the current practical Pohoda-style manual readiness flow first: seeded canonical controls, working manual attestations, evidence visibility, progress updates, agency/client progress, onboarding recommendation proof, and a pragmatic CSV/import MVP before any real API automation claims.

**Architecture:** Treat the 19 current `helios-*` keys as permanent evidence identifiers. `lib/workspaces/helios.ts` may remain the authoring source for the current UI checklist, but seed logic must guard against key removal/renaming before it updates canonical controls. Add deterministic smoke coverage around targeted Helios seed idempotency and the live attestation path before touching broader UI. Only after the manual path is green, add a Helios CSV template import surface that creates customer-reported manual evidence/status records without claiming runtime automation.

**Tech Stack:** Next.js 15 App Router, TypeScript, Drizzle/Postgres, Clerk org context, Playwright, `tsx` smoke scripts, npm.

---

## Current Context / Evidence From Review

Verified GREEN:
- `npm run smoke:helios-workspace-config`
  - 4 layers: `infrastructure`, `iam`, `backup_dr`, `api_connectivity`
  - 19 Helios controls
  - all 19 have `nis2ArticleRef`
  - all 19 have ZoKB/NÚKIB metadata
  - IAM layer contains manufacturing role hierarchy language
  - API layer contains MES/SCADA/EDI references
  - no Pohoda/Money S3 terminology found
- `E2E_SUITE=local-demo ENABLE_LOCAL_DEMO_DATA=true npx playwright test tests/e2e/helios-workspace.spec.ts --project=local-demo-chromium`
  - 5 passed

Verified blocker:
- DB canonical `controls` table has 0 rows for the 19 `helios-*` workspace keys.
- `createManualAttestationEvidence()` resolves by `controls.key` and throws:
  - `Unknown control: helios-iam-user-accounts`

Correct classification before this plan is implemented:
- Helios workspace/checklist: mostly implemented and smoke-tested.
- Helios live manual attestation/evidence workflow: blocked by missing canonical controls.
- Helios automated/runtime integration: absent.
- Helios CSV/import adapter: absent.
- Helios API/MES/SCADA/EDI checks: checklist-only.

Product/legal copy constraint:
- Do not claim Helios automated evidence collection, Helios runtime API integration, or live MES/SCADA/EDI checks until a real adapter and automated evidence path exist.
- Do not let CSV-derived positive findings inflate posture: CSV imports may produce `manual_review` or `gap` only. A human-reviewed workflow is required before any CSV-supported control can become `pass`.

---

## Master Plan Alignment

- Source priority item: Czech-first ERP readiness workflow, especially local ERP systems used by Czech SMEs and manufacturing companies.
- Why this is next: Helios static workspace already exists, but the live evidence loop is broken because canonical controls are missing. Fixing this unlocks the core activation loop for Helios: checklist -> attestation -> evidence -> progress -> agency view/export.
- Related blockers:
  - 19 `helios-*` keys missing from canonical `controls`.
  - No smoke proving Helios attestation creates evidence and updates progress.
  - No smoke proving onboarding selection recommends Helios.
  - No CSV/import workflow for integration-ish value.
- Out of scope for this implementation plan:
  - Helios OAuth/API connection.
  - Direct SQL Server connection to customer Helios databases.
  - Live MES/SCADA/EDI endpoint checks.
  - Network/TLS scanning of customer infrastructure.
  - Any marketing claim that Helios is automated.
- Product/legal/safety constraints:
  - Preserve sales-safe wording: “Helios workspace/checklist” and “manual readiness review”.
  - Never expose individual control IDs on public Trust Center pages.
  - Do not print or store secrets from uploaded CSV/import data.
  - Use `assessment_result = gap` for gaps, not `fail`; reserve `collection_status = failed` for collection errors.
  - Treat Helios control keys as immutable once seeded; changes require an explicit migration/backfill plan, not a silent config rename.
  - Record ZoKB-first framework support as a deliberate deferral with GTM cost: mapping to NIS2 plus ZoKB guidance unblocks this lane, but it does not provide first-class ZoKB coverage reporting yet.

---

## Implementation Strategy

Implement in 4 phases:

1. **Foundation: canonical control seeding**
   - Add a reusable conversion layer from workspace controls to `ControlSeed`-like seed entries, with immutable-key guards.
   - Add a targeted Helios seed/backfill that upserts only the 19 Helios controls and their NIS2 mappings; do not require full `db:seed` in production.
   - Add a DB smoke that fails before the seed change, proves idempotency on repeated runs, and fails loudly if a previously seeded Helios key disappears from config.

2. **Live manual workflow proof**
   - Add a Helios live-attestation smoke using safe synthetic/test org data.
   - Prove evidence row creation, org control status update, workspace progress increase, evidence vault visibility, and cleanup.

3. **User-flow proof**
   - Add onboarding recommendation smoke selecting Helios and asserting `/controls` shows the Helios workspace callout.
   - Add or extend agency/client smoke to prove Helios progress appears for client view.

4. **CSV/import MVP**
   - Add a Helios CSV template importer for mapped customer data: users/roles, backups, integration endpoints/partners. Do not call the template a native Helios export.
   - Convert CSV rows into manual evidence snapshots and status updates for matching Helios controls.
   - Label this as “CSV-assisted manual evidence”, not automated runtime integration.

The phase 1-3 floor is required before production-safe “Helios manual workflow works”. Phase 4 is required before any “integration-ish” import claim.

---

## Files Likely To Change

Foundation / seed:
- Modify: `lib/controls/library.ts`
- Create: `lib/workspaces/control-seeds.ts`
- Modify: `scripts/seed.ts` only to share seed primitives if needed; do not rely on full `db:seed` for production Helios rollout
- Create: `scripts/seed-helios-controls.ts`
- Create: `scripts/smoke-helios-control-seeding.ts`
- Modify: `package.json`

Live manual workflow proof:
- Create: `scripts/smoke-helios-live-attestation.ts`
- Possibly modify: `app/api/test/workspace-attestation/route.ts`
- Possibly modify: `lib/db/queries/workspaces.ts`
- Possibly modify: `lib/db/queries/evidence.ts`

Onboarding / UI proof:
- Create: `tests/e2e/helios-onboarding-recommendation.spec.ts`
- Possibly modify: `tests/e2e/helios-workspace.spec.ts`
- Possibly modify: `tests/e2e/agency-client-workspace.spec.ts` or create `tests/e2e/helios-agency-client.spec.ts`
- Possibly modify: `app/(app)/controls/page.tsx` only if the smoke finds the Helios callout path incomplete

CSV/import MVP:
- Create: `lib/workspaces/helios-csv/types.ts`
- Create: `lib/workspaces/helios-csv/parser.ts`
- Create: `lib/workspaces/helios-csv/mapping.ts`
- Create: `lib/workspaces/helios-csv/importer.ts`
- Create: `app/(app)/workspaces/helios/import/page.tsx`
- Create: `app/(app)/workspaces/helios/import/actions.ts`
- Modify: `app/(app)/workspaces/helios/page.tsx`
- Create: `scripts/smoke-helios-csv-import.ts`
- Create: `tests/fixtures/helios/users.csv`
- Create: `tests/fixtures/helios/roles.csv`
- Create: `tests/fixtures/helios/backups.csv`
- Create: `tests/fixtures/helios/integrations.csv`
- Modify: `package.json`

Optional docs/copy safety:
- Modify: `lib/marketing/platform-copy.ts` only if current copy overstates Helios automation.
- Modify: `scripts/smoke-copy-hygiene.ts` to prevent future “Helios automated” claims before adapter exists.

---

## Hermes Orchestration Protocol — Role-Based Multi-Agent Execution

**Applies to:** this plan.
**Model:** orchestrator + ephemeral role-specialized subagents, gated tranche-by-tranche.
**Core principle:** independence of incentive. The agent that judges "did it pass" must never be the agent that wrote the code. If those collapse into one, the crew adds overhead and catches nothing.

### 0. State Ownership

State lives only in the orchestrator (Hermes main session). Subagents are stateless and ephemeral: they receive a self-contained packet, return a structured report, and are discarded. They never carry context between dispatches.

The orchestrator is the only thing that persists:
- current tranche position
- per-lane green/red ledger
- integrated git state (which lane branches are merged)
- the human-approval queue (risk items awaiting Marco)
- blockers and their owner-controlled vs external classification

If the orchestrator session is lost, recover position from merged branches plus `.hermes/state/helios-ledger.md`. The orchestrator must update this ledger after every tranche gate.

### 1. Roles

#### 1.1 Orchestrator (Hermes)

Owns the plan, dependency graph, tranche gates, dispatch, and integration. Does not write feature code. Runs combined post-integration validation. Escalates risk items to the human. Advances tranches only when the tranche gate passes.

#### 1.2 Implementer (worker)

One per lane. Writes the code and debugs its own lane; debugging is not a separate role because it needs the same context as implementing. Runs the lane's RED command first, implements to GREEN, and returns the implementer contract below.

Fallback: if the Implementer fails the GREEN gate 2 consecutive times in a loop, the orchestrator discards it and dispatches a fresh Implementer with accumulated failure logs as a circuit breaker. Do not keep prompting a stuck agent.

#### 1.3 Verifier (tester)

A different agent that did not write the implementation. Checks out the lane branch clean in a fresh worktree, runs RED→GREEN from scratch, and returns the verifier contract below. Clean checkout is mandatory because it catches "works on the implementer's dirty tree" bugs.

The Verifier also performs mechanical approval checks:
- diff stays within the lane's declared file allowlist; flag any out-of-allowlist file
- no secrets in the diff using `password|secret|token|api_key|DATABASE_URL`
- copy hygiene passes if the lane touches copy/marketing
- acceptance criteria checked one by one, each marked pass/fail

The Verifier never edits feature code. If it finds a defect, it reports RED with specifics; it does not fix.

#### 1.4 Approver split

Mechanical approval is performed by the Verifier. Human approval by Marco is required, and only required, for risk-bearing items:
- claim-boundary wording (any new public/product copy)
- production `seed:helios-controls` execution
- schema changes
- removed/renamed `helios-*` control keys or a removed-key guard firing
- ZoKB-as-framework decision

Everything mechanical and green is pre-cleared by the Verifier so Marco only reviews exceptions plus the one-page tranche summary. Do not let an LLM be the final authority on overclaim/claim-boundary judgments.

### 2. Tranches (dispatch order)

A tranche opens only after the previous tranche gate passes.

| Tranche | Lane(s) | Parallel? | Ceremony |
|---------|---------|-----------|----------|
| T0 | A — canonical control seeding + RED/GREEN seed smoke | serial foundation | light: Implementer + orchestrator runs smoke |
| T0.5 | A2 — shared query-layer carve-out (`evidence.ts`, `workspaces.ts`): `helios_csv_import` type, `customer_reported_csv_template` provenance, snapshot metadata, progress/vault counting both evidence types | serial | full crew; shared file, high blast radius |
| T1 | B — live-attestation smoke (new script, read-only) + C — onboarding/agency E2E (+ callout/UI) | parallel, file-disjoint | B light, C full crew |
| T2 | D — CSV MVP (`lib/workspaces/helios-csv/*`, import page/action, fixtures, smoke) | serial, large/risk-bearing | full crew |
| T3 | E — copy-hygiene guard, full validation, production-seed readiness note/scripts | serial integration gate | full crew + mandatory human approval |

T3 hard boundary:
- Automated T3 scope ends at `production-seed-ready, verified, drift-clean, copy-guard proven`.
- T3 must not run production `npm run seed:helios-controls`, `npm run deploy`, production migrations, or any production DB write.
- T3 may add read-only production target/count verification tooling that prints metadata/presence/counts only and never secrets.
- Actual production `seed:helios-controls` execution is a separate owner-approved deploy-window step after T3.

Worktree bootstrap precondition:
- The orchestrator, not the implementer, must bootstrap every fresh worktree before dispatch: install dependencies when `node_modules`/`tsx`/test runners are missing or mismatched, prepare disposable local DB prerequisites for DB-backed smokes, and only then count RED/GREEN output.
- Missing `tsx`, module-resolution floods, or ESLint version mismatches from an unbootstrapped worktree are harness failures, not implementation verdicts.

Rationale for T0.5: both B and D may touch the shared query layer. Carving that change into its own serial lane before forking dependent lanes makes T1 and T2 collision-safe. After T0.5, `lib/db/queries/evidence.ts` and `lib/db/queries/workspaces.ts` are frozen unless the orchestrator explicitly reopens the shared-query lane.

Concurrency cap:
- at most 2 lanes live at once
- at most 1 app-code lane live at once
- T1 is allowed because B is verification-only and C is the single app-code lane

Ceremony scales to the lane. Do not run a five-role crew on T0 if the seed smoke is the spec. Reserve full crew for shared-layer and risk-bearing lanes: T0.5, T2, T3.

### 3. Structured Contracts

Gating is on structured fields, never on an agent's narrated "looks good."

#### 3.1 Implementer return contract

```text
LANE: <id>
PRECONDITION_CONFIRMED: <which prior lanes were green before starting>
RED_COMMAND: <command>
RED_OUTPUT: <exact output, proving it failed first>
FILES_CHANGED: <list — must be subset of allowlist>
COMMANDS_RUN: <each command + exact output>
GREEN_OUTPUT: <exact output of the lane smoke passing>
CLEANUP: <synthetic org ids created + confirmation rows removed in finally>
BLOCKERS: <none | description + founder-controlled vs external>
CLAIM_BOUNDARY_NOTES: <any copy/evidence-type/provenance decisions made>
```

#### 3.2 Verifier return contract

```text
LANE: <id>
CLEAN_CHECKOUT: <branch + confirmation of fresh worktree>
ACCEPTANCE:
  - <criterion 1>: PASS|FAIL <evidence>
  - <criterion 2>: PASS|FAIL <evidence>
  ...
ALLOWLIST_CHECK: PASS|FAIL <any out-of-allowlist files>
SECRET_SCAN: PASS|FAIL <matches found, redacted>
COPY_HYGIENE: PASS|FAIL|N/A
RED_THEN_GREEN_REPRODUCED: YES|NO
RISK_ITEMS_FOR_HUMAN: <list, or none>
VERDICT: GREEN | RED <one-line reason>
```

#### 3.3 Dispatch packet (orchestrator → any subagent)

Each subagent receives only:
- its lane scope, not the whole plan
- its explicit file allowlist
- its precondition (what must already be green)
- a bootstrap step before RED: run `npm install` if `node_modules/.bin/tsx` is missing, then use a disposable local Postgres `DATABASE_URL` for DB-backed smokes unless the orchestrator explicitly supplies another non-production database
- the RED command, GREEN acceptance criteria, and verification commands
- the cleanup requirement
- the return contract it must fill
- the shared invariants below

Scope minimization is mandatory. Never hand a subagent the full five-phase plan. Seeing other lanes' files invites wandering.

### 4. Tranche Gate (the orchestrator OK)

The orchestrator advances to the next tranche only when all of the following hold:

1. Every lane in the current tranche has Verifier `VERDICT = GREEN`.
2. Every `RISK_ITEMS_FOR_HUMAN` entry in the tranche is human-approved by Marco.
3. The integrated branch (all current-tranche lanes merged) passes combined validation together:
   ```bash
   npm run typecheck
   npm run lint
   npm run build
   <relevant smokes for the tranche, run together>
   ```
   This is post-integration validation, not a sum of per-lane greens. Lanes can be individually green and still conflict once merged.
4. `git status --short` on the integrated branch is clean; no stray/uncommitted files.
5. `.hermes/state/helios-ledger.md` is updated with the tranche result.

If any gate item fails: do not open the next tranche. Either bounce the failing lane back to an Implementer with the Verifier findings, or escalate the blocker to Marco with founder-controlled vs external classification.

Hard floor: T0 and T0.5 are foundation. No dependent tranche opens until the 19 `helios-*` keys are green in canonical `controls` and the shared query layer is frozen.

### 5. Shared Invariants (include in every dispatch packet)

- Subagents do not commit to main, push, deploy, or modify the production DB.
- Subagents never print or store secrets; redact in all reports.
- All `helios-*` controls stay `testType = manual` permanently — CSV assistance does not make them hybrid or automated.
- CSV-derived evidence may only be `manual_review` or `gap`, never `pass`.
- Manual form submission → `attestation_answers`; CSV import → `helios_csv_import`; CSV snapshot provenance → `customer_reported_csv_template`.
- `helios-*` control keys are permanent evidence identifiers; a missing previously-seeded key must fail loudly and escalate to human approval.
- Every DB smoke uses a unique synthetic org id, cleans up in a `finally` block, deletes by exact id (never by prefix), and serializes against other running smokes on the same DB.
- No public/product copy may claim Helios automated evidence, runtime API, or live MES/SCADA/EDI checks.
- Each lane runs in its own branch/worktree.

### 6. Per-Lane Loop

```text
orchestrator: open tranche, pick lane, build dispatch packet
  -> Implementer (own branch): RED -> implement -> GREEN -> return 3.1
  -> Verifier (clean checkout): RED->GREEN reproduce, acceptance, mechanical checks -> return 3.2
       if RED:
         -> bounce findings to Implementer, or fresh Implementer after 2 failed loops
       if GREEN:
         -> mechanical pre-clear done by Verifier
         -> any RISK_ITEMS_FOR_HUMAN -> Marco approves/rejects
            if rejected: -> back to Implementer with reason
            if approved: -> orchestrator integrates lane branch
  -> when all lanes in tranche integrated: run section 4 gate
       if gate GREEN: update ledger, open next tranche
       if gate RED: fix or escalate, do not advance
```

### 7. When not to use the full crew

- Tiny, low-risk lanes such as T0 seed bridge: Implementer + orchestrator-runs-the-smoke is enough; a Verifier adds little when the smoke is the spec.
- Verification-only lanes such as B: no Implementer "make it pass" incentive to counterbalance, so the orchestrator can run the smoke directly.
- The bottleneck is human review, not agent count. Do not fan out all lanes at once; a pile of simultaneous greens you cannot review is worse than serial progress you can.

---

## Phase 1: Seed Helios Workspace Controls Into Canonical Controls

### Task 1.1: Add RED smoke for missing Helios canonical controls, idempotency, and immutable key coverage

**Objective:** Create a smoke test that proves all 19 `helios-*` workspace controls exist in the DB canonical `controls` table after targeted seeding, repeated seed runs are idempotent, and no previously seeded Helios key silently disappears from config.

**Files:**
- Create: `scripts/smoke-helios-control-seeding.ts`
- Modify: `package.json`

**Steps:**
1. Create `scripts/smoke-helios-control-seeding.ts`.
2. Import `heliosWorkspace`, `getDb`, `controls`, `frameworkControls`, and `frameworks`.
3. Flatten `heliosWorkspace.layers[].controls[]` into expected control keys.
4. Query `controls` for those keys.
5. Assert:
   - expected count is exactly 19
   - all 19 keys exist in `controls`
   - all 19 rows have `requiresEvidence = true`
   - all 19 rows have `isAutomated = false`
   - all 19 rows have `testType = manual`; CSV assistance must not make these controls `hybrid` or automated
   - all 19 rows have at least one NIS2 `framework_controls` row
   - re-running the targeted Helios seed does not create duplicate `controls` rows
   - re-running the targeted Helios seed does not create duplicate `framework_controls` mappings
   - a persisted seeded-key manifest/check fails if a previously seeded `helios-*` key is removed from the current config without an explicit migration entry
6. Print a compact summary like:
   - `Helios control seeding smoke passed.`
   - `Controls: 19/19`
   - `NIS2 framework mappings: 19/19`
7. Add package scripts:
   - `"seed:helios-controls": "tsx scripts/seed-helios-controls.ts"`
   - `"smoke:helios-control-seeding": "tsx scripts/smoke-helios-control-seeding.ts"`
8. Run RED before implementation:
   - `npm run smoke:helios-control-seeding`
   - Expected now: FAIL, listing missing `helios-*` keys.

**Notes:**
- This smoke requires `DATABASE_URL` and should call `loadEnvConfig(process.cwd())` like `scripts/seed.ts` does.
- The smoke may run the targeted Helios seed against a disposable/local DB to prove idempotency, but it must not mutate unrelated seed data and must not call full `npm run db:seed`.
- If split into read-only and mutating modes, name them explicitly and use the mutating mode only for local/CI test databases.

### Task 1.2: Add workspace-to-control seed conversion helper

**Objective:** Convert Helios workspace controls into canonical seed rows without manually duplicating all 19 controls in `CONTROL_LIBRARY`.

**Files:**
- Create: `lib/workspaces/control-seeds.ts`
- Modify: `lib/controls/library.ts`

**Approach:**
Add a helper that takes a `PlatformWorkspace` and returns objects compatible with `ControlSeed`.

Expected conversion rules:
- `key`: `WorkspaceControl.controlKey`
- `titleCs`: `WorkspaceControl.title ?? WorkspaceControl.question`
- `titleEn`: if no English exists, use a safe English technical fallback based on platform/layer/control key. Do not fabricate customer proof. Prefer deterministic labels like `Helios: user accounts and access review`.
- `descriptionCs`: `WorkspaceControl.guidance`
- `category`: derive from layer/control key:
  - `iam` -> `access_control`
  - `backup_dr` -> `business_continuity`
  - `infrastructure` encryption/network -> `data_protection` or `asset_management`; physical server room -> `physical`
  - `api_connectivity` -> `supplier` or `asset_management`; network/TLS -> `data_protection`
- `testType`: always `manual`; CSV assistance does not make a Helios control automated or hybrid
- `requiresEvidence`: `true`
- `isAutomated`: `false`
- `frameworkMappings`: include at least NIS2 using `WorkspaceControl.nis2ArticleRef`
  - `frameworkSlug: "nis2"`
  - `articleRef: control.nis2ArticleRef`
  - `localizedTitle: titleCs`
  - `localizedDescription: guidance`
  - `regulatorGuidance`: include `zobkSectionRef`/ZoKB metadata in Czech if present
  - `evidenceRequirements`: short Czech evidence requirement based on `evidenceType`
  - `level`: `mandatory` for high/mandatory NÚKIB priority, otherwise `recommended`

Example helper shape:

```ts
import type { ControlSeed } from "@/lib/controls/library";
import type { ComplianceLayer, PlatformWorkspace, WorkspaceControl } from "@/lib/workspaces/types";

export function workspaceToControlSeeds(workspace: PlatformWorkspace): ControlSeed[] {
  return workspace.layers.flatMap((layer) =>
    layer.controls.map((control) => workspaceControlToSeed(workspace, layer, control)),
  );
}

function workspaceControlToSeed(
  workspace: PlatformWorkspace,
  layer: ComplianceLayer,
  control: WorkspaceControl,
): ControlSeed {
  const titleCs = control.title ?? control.question;

  return {
    key: control.controlKey,
    titleCs,
    titleEn: buildEnglishTitle(workspace, layer, control),
    descriptionCs: control.guidance,
    category: inferCategory(layer, control),
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      {
        frameworkSlug: "nis2",
        articleRef: control.nis2ArticleRef,
        localizedTitle: titleCs,
        localizedDescription: control.guidance,
        regulatorGuidance: buildRegulatorGuidance(control),
        evidenceRequirements: buildEvidenceRequirements(control),
        level: control.nukibPriority === "high" || control.nukibTier === "mandatory_minimum" ? "mandatory" : "recommended",
      },
    ],
  };
}
```

**Implementation detail:**
- `ControlSeed` is currently exported from `lib/controls/library.ts`, so the helper can import it.
- If importing `ControlSeed` from `library.ts` causes circular runtime dependency, split the type into `lib/controls/types.ts` and update `library.ts` plus `control-seeds.ts` to import from there.

### Task 1.3: Add immutable Helios seed rows and removed-key guard

**Objective:** Make Helios seed entries available to a targeted seed/backfill while treating control keys as permanent identifiers.

**Files:**
- Modify: `lib/controls/library.ts`

**Steps:**
1. Import `heliosWorkspace` and `workspaceToControlSeeds`.
2. Define:
   - `const WORKSPACE_CONTROL_LIBRARY: ControlSeed[] = [...workspaceToControlSeeds(heliosWorkspace)];`
3. Export:
   - `export const CONTROL_LIBRARY = [...BASE_CONTROL_LIBRARY, ...WORKSPACE_CONTROL_LIBRARY];`
4. Add a local duplicate-key guard if one does not already exist near the export.
5. Ensure Helios keys do not collide with existing base controls.
6. Add a seeded-key manifest or guard source, e.g. `HELIOS_CANONICAL_CONTROL_KEYS`, that contains the 19 permanent keys expected in the first seed.
7. Add a guard that fails if `HELIOS_CANONICAL_CONTROL_KEYS` contains a key not present in the current generated Helios seed set. This catches accidental removal/rename before seed code can orphan existing evidence.
8. Document directly in code comments: `helios-*` keys are immutable evidence identifiers. To rename/split a key, create a migration/backfill plan and preserve old evidence linkage.

**Risk:**
- `lib/workspaces/helios.ts` imports NÚKIB types only, so importing it into `library.ts` should be safe. If a cycle appears, move static seed entries to a standalone generated/handwritten module instead.
- DRY generation from workspace config is acceptable only with the immutable-key guard. Without the guard, UI checklist churn can corrupt the stable evidence taxonomy.

### Task 1.4: Implement targeted Helios seed and verify idempotency locally

**Objective:** Turn the RED seeding smoke GREEN with a narrow seed that touches only Helios controls and mappings.

**Files:**
- Create: `scripts/seed-helios-controls.ts`
- Modify: `package.json`
- Modify: shared seed helpers only if needed for upsert/reconcile reuse.

**Targeted seed requirements:**
- Upsert only the 19 `helios-*` rows by `controls.key`.
- Reconcile only NIS2 `framework_controls` rows for those 19 controls.
- Do not delete unrelated framework mappings or unrelated controls.
- Do not orphan evidence: never delete Helios control rows as part of routine seed.
- Re-running the seed must be idempotent: same 19 control rows, same mapping count, no duplicates.

**Commands:**
1. Run targeted seed twice:
   - `npm run seed:helios-controls`
   - `npm run seed:helios-controls`
2. Run narrow smokes:
   - `npm run smoke:helios-workspace-config`
   - `npm run smoke:helios-control-seeding`
3. Expected:
   - Helios config smoke remains GREEN.
   - Helios control seeding smoke reports all 19 controls and 19 NIS2 framework mappings.

**Important:**
- Do not run production DB migrations/seeding without explicit deploy window approval.
- Do not run full `npm run db:seed` in production to land Helios. Use the targeted `npm run seed:helios-controls` backfill after approval.
- Local targeted seeding is acceptable for development verification.
- Before deploy, run migration drift check because this changes seed data, not schema:
  - `npm run check:production-migration-drift`

---

## Phase 1.5 / T0.5: Shared Query-Layer Carve-Out

**Objective:** Freeze the shared evidence/progress query behavior before live-attestation, onboarding/agency, and CSV lanes branch off. This prevents B and D from racing on `lib/db/queries/evidence.ts` and `lib/db/queries/workspaces.ts`.

**Files:**
- Modify: `lib/db/queries/evidence.ts`
- Modify: `lib/db/queries/workspaces.ts`
- Create or modify: `scripts/smoke-helios-evidence-provenance.ts`
- Modify: `package.json`

**Lane:** A2

**Ceremony:** full crew. This lane touches shared query code and is high blast radius.

**Precondition:** T0/A is green: targeted Helios seed exists, is idempotent, and all 19 canonical controls are present.

**RED command:**
- `npm run smoke:helios-evidence-provenance`

Expected RED before implementation:
- CSV-derived evidence type/provenance support is missing or not counted by progress/vault queries.

**Implementation requirements:**
1. Add or expose a generic manual evidence creation path that can create CSV-derived evidence with:
   - `type = helios_csv_import`
   - `source = manual` unless a distinct source enum already exists
   - `assessment_result IN ('manual_review', 'gap')`
   - snapshot provenance `customer_reported_csv_template`
2. Preserve existing manual attestation behavior:
   - `createManualAttestationEvidence()` continues to produce `type = attestation_answers`
   - `snapshot_data.attestationAnswers` remains unchanged for manual forms
3. Ensure `getWorkspaceProgress()` counts both:
   - `attestation_answers`
   - `helios_csv_import`
   as evidence presence for workspace controls.
4. Ensure `listEvidenceVault()` shows both evidence types without collapsing provenance.
5. Add a narrow smoke that creates synthetic evidence rows for one Helios control using both types, verifies progress/vault inclusion, then cleans up by exact synthetic org id in `finally`.
6. Do not implement CSV parsing or UI in this lane; only the shared evidence/query substrate.

**Verifier acceptance:**
- `attestation_answers` still works for manual form submissions.
- `helios_csv_import` exists for CSV-derived evidence and is never mislabeled as `attestation_answers`.
- CSV-derived test rows cannot use `assessment_result = pass`.
- `customer_reported_csv_template` provenance appears in snapshot metadata.
- Workspace progress and evidence vault count both evidence types.
- Diff is limited to the A2 allowlist unless the Verifier flags and the orchestrator approves an explicit exception.

**GREEN commands:**
- `npm run smoke:helios-evidence-provenance`
- `npm run smoke:manual-evidence-dimensions-source`
- `npm run typecheck`

**Freeze rule:** after A2 is GREEN and integrated, `lib/db/queries/evidence.ts` and `lib/db/queries/workspaces.ts` are frozen for dependent lanes unless the orchestrator reopens A2 with a new verifier cycle.

---

## Phase 2: Prove Helios Live Manual Attestation/Evidence Workflow

### Task 2.1: Add RED smoke for Helios manual attestation

**Objective:** Prove Helios attestation creates evidence and updates status/progress for a safe test org.

**Files:**
- Create: `scripts/smoke-helios-live-attestation.ts`
- Modify: `package.json`

**Smoke behavior:**
1. Load `.env.local` via `loadEnvConfig(process.cwd())`.
2. Use synthetic org ID:
   - `smoke_helios_attestation_${Date.now()}`
3. Insert synthetic `organisations` row if required by FK constraints.
4. Assert selected Helios control exists:
   - `helios-iam-user-accounts`
5. Call `createManualAttestationEvidence()` directly:
   - `clerkOrgId`: synthetic org
   - `collectedBy`: `smoke-helios-live-attestation`
   - `controlKey`: `helios-iam-user-accounts`
   - `assessmentResult`: `manual_review` or `gap` depending on answers
   - `answers`: deterministic values, e.g. `{ individualAccounts: true, sharedAccountsForbidden: true, reviewedAt: "2026-05-31" }`
6. Query `evidence` joined to `controls` and assert:
   - evidence exists
   - `controls.key = helios-iam-user-accounts`
   - `type = attestation_answers`
   - `source = manual`
   - `collection_status = collected`
   - `assessment_result` is expected
   - `snapshot_data.attestationAnswers` contains the answers
7. Query `orgControlStatuses` and assert:
   - row exists for synthetic org/control
   - `lastEvidenceAt` is not null
8. Call `getWorkspaceProgress(syntheticOrgId, heliosWorkspace)` and assert:
   - overall completed/evidence count increases from 0 to at least 1
   - IAM layer has at least one evidenced control
9. Call `listEvidenceVault(syntheticOrgId)` and assert:
   - evidence vault includes `helios-iam-user-accounts`
10. Cleanup:
   - delete evidence rows for synthetic org
   - delete org control status rows for synthetic org
   - delete synthetic organisation row if inserted
11. Assert cleanup leaves no rows for synthetic org.

**Commands:**
1. Add package script:
   - `"smoke:helios-live-attestation": "tsx scripts/smoke-helios-live-attestation.ts"`
2. Run RED before seed fix:
   - `npm run smoke:helios-live-attestation`
   - Expected before phase 1 GREEN: FAIL with unknown/missing Helios control.
3. Run GREEN after phase 1:
   - `npm run smoke:helios-live-attestation`
   - Expected: pass and cleanup summary.

### Task 2.2: Fix any generic workflow gaps surfaced by the smoke

**Objective:** If the smoke reveals real gaps beyond missing controls, fix only those gaps.

**Possible files:**
- Modify: `lib/db/queries/evidence.ts`
- Modify: `lib/db/queries/workspaces.ts`
- Modify: `app/(app)/workspaces/actions.ts`

**Rules:**
- Do not change status semantics broadly unless the test proves a bug.
- Do not set `orgControlStatuses.status = pass` automatically unless the attestation result clearly supports it and existing semantics allow it. Current generic path sets `status = unknown`; preserve unless product rules say otherwise.
- If a progress calculation ignores `manual_review` evidence but should count `hasEvidence`, update the progress query/test narrowly.

**Verification:**
- `npm run smoke:helios-live-attestation`
- `npm run smoke:manual-evidence-dimensions-source`
- `npm run typecheck`

---

## Phase 3: Prove Helios User Flows

### Task 3.1: Add Helios onboarding recommendation smoke

**Objective:** Prove a user selecting Helios in onboarding gets a Helios recommendation/callout on `/controls`.

**Files:**
- Create: `tests/e2e/helios-onboarding-recommendation.spec.ts`
- Possibly modify: `lib/onboarding/intake-scope.ts` if the smoke reveals missing or wrong recommendation details
- Possibly modify: `app/(app)/controls/page.tsx` if the callout is incomplete

**Steps:**
1. Follow existing local-demo E2E patterns.
2. Select accounting platform answer `helios` during intake.
3. Assert derived recommendation includes:
   - platform key `helios`
   - label `Helios (Asseco)`
   - reason mentioning SQL Server backups, access, MES/SCADA, and EDI security
4. Navigate to `/controls`.
5. Assert Helios callout is visible and links to `/workspaces/helios`.
6. Assert no automated-integration wording appears.

**Command:**
- `E2E_SUITE=local-demo ENABLE_LOCAL_DEMO_DATA=true npx playwright test tests/e2e/helios-onboarding-recommendation.spec.ts --project=local-demo-chromium`

**Expected:**
- Passes without requiring real Clerk or production data.

### Task 3.2: Extend Helios workspace E2E to submit one attestation in test mode

**Objective:** Browser-test the live submission path, not only static rendering.

**Files:**
- Modify: `tests/e2e/helios-workspace.spec.ts`
- Possibly modify: `app/api/test/workspace-attestation/route.ts`

**Steps:**
1. Use existing test-only route `app/api/test/workspace-attestation/route.ts` if the browser path cannot authenticate.
2. Ensure route is guarded by:
   - not production
   - `ENABLE_TEST_ROUTES=true` outside test
3. In the test, submit attestation for `helios-iam-user-accounts`.
4. Assert HTTP 200 JSON includes:
   - `controlKey: helios-iam-user-accounts`
   - `platformId: helios`
   - `evidenceId`
   - `controlId`
5. Add cleanup if this route creates data under `org_e2e_attestation_test`.

**Command:**
- `E2E_SUITE=local-demo ENABLE_LOCAL_DEMO_DATA=true ENABLE_TEST_ROUTES=true npx playwright test tests/e2e/helios-workspace.spec.ts --project=local-demo-chromium`

**Expected:**
- Existing 5 tests still pass.
- New live attestation test passes.

### Task 3.3: Add Helios agency/client progress smoke

**Objective:** Prove agency/client view includes Helios progress after evidence exists.

**Files:**
- Create: `scripts/smoke-helios-agency-progress.ts` or a focused Playwright spec if agency fixtures already exist
- Modify: `package.json`
- Possibly modify: `app/(app)/agency/clients/[orgId]/page.tsx` if the smoke reveals display gaps

**Steps:**
1. Seed synthetic agency/client org relationship if needed using existing agency smoke patterns.
2. Create one Helios attestation evidence row for the client org.
3. Call/get agency client workspace data path.
4. Assert Helios workspace appears with progress > 0.
5. Assert comments grouping by control key still works if comments are included.
6. Cleanup all synthetic rows.

**Command:**
- `npm run smoke:helios-agency-progress`

**Expected:**
- Helios is listed with non-zero progress for the client org.

---

## Phase 4: Add Helios CSV/Import MVP

### Scope Decision

This is not runtime automation. It is CSV-assisted manual evidence import.

Supported MVP CSV templates:
1. `users.csv` / user access template
   - maps to `helios-iam-user-accounts`
   - maps to `helios-iam-inactive-session-audit`
   - maps to `helios-iam-offboarding` if disabled/departure fields exist
2. `roles.csv` / module-role template
   - maps to `helios-iam-module-role-hierarchy`
3. `backups.csv` / SQL Agent or backup job template
   - maps to `helios-backup-sql-agent-jobs`
   - maps to `helios-backup-encryption`
   - maps to `helios-backup-restoration-test` only if restore test rows exist
4. `integrations.csv` / MES/SCADA/EDI connections inventory template
   - maps to `helios-api-mes-scada-integration`
   - maps to `helios-api-edi-supplier-customer`
   - maps to `helios-api-credential-rotation`
   - maps to `helios-api-network-access-control`
   - maps to `helios-api-tls-enforcement`

Out of MVP:
- Direct database introspection.
- Vendor-specific proprietary file parsing beyond simple CSV.
- Network scans.
- Any CSV-derived `pass`. CSV imports are customer-reported and unreviewed; they may create `manual_review` or `gap` only. Human review is required before a control can become `pass`.
- Native/raw Helios export parsing unless the exact edition/export format is known and tested. The MVP supports Splnit templates that customers map their Helios exports into.

### Task 4.1: Add parser types and fixtures

**Objective:** Define supported Splnit CSV template formats and provide deterministic test fixtures. These are mapping templates, not guaranteed native Helios exports.

**Files:**
- Create: `lib/workspaces/helios-csv/types.ts`
- Create: `tests/fixtures/helios/users.csv`
- Create: `tests/fixtures/helios/roles.csv`
- Create: `tests/fixtures/helios/backups.csv`
- Create: `tests/fixtures/helios/integrations.csv`

**Expected template fields:**

UI copy must say: download the Splnit template, map/export your Helios data into it, then upload the completed CSV. Do not say “upload your Helios export” unless native Helios export formats are separately implemented and tested.

**Template fields:**

`users.csv`:
- `username`
- `display_name`
- `active`
- `last_login_at`
- `role`
- `employee_type`
- `shared_account_flag`

`roles.csv`:
- `role`
- `module`
- `permission`
- `business_owner`

`backups.csv`:
- `job_name`
- `backup_type`
- `last_success_at`
- `encrypted`
- `offsite_or_immutable`
- `restore_tested_at`

`integrations.csv`:
- `name`
- `type` (`MES`, `SCADA`, `EDI`, `OTHER`)
- `protocol`
- `auth_type`
- `tls_enabled`
- `network_restricted`
- `credentials_rotated_at`

### Task 4.2: Add RED parser smoke

**Objective:** Prove parser accepts valid fixtures, rejects malformed CSV, and never logs secrets.

**Files:**
- Create: `scripts/smoke-helios-csv-parser.ts`
- Modify: `package.json`

**Assertions:**
- valid fixtures parse into typed records
- required columns are enforced
- malformed rows return row-level errors
- unknown columns are tolerated but preserved only in sanitized metadata if safe
- any column matching `password|secret|token|api_key` is rejected or redacted

**Command:**
- `npm run smoke:helios-csv-parser`

### Task 4.3: Implement CSV parser and control mapping

**Objective:** Convert CSV records into proposed evidence snapshots per Helios control.

**Files:**
- Create: `lib/workspaces/helios-csv/parser.ts`
- Create: `lib/workspaces/helios-csv/mapping.ts`

**Mapping output type:**
```ts
export type HeliosCsvEvidenceCandidate = {
  assessmentResult: "gap" | "manual_review";
  controlKey: string;
  description: string;
  evidenceType: "helios_csv_import";
  provenance: "customer_reported_csv_template";
  snapshotData: Record<string, unknown>;
  sourceFileKind: "users" | "roles" | "backups" | "integrations";
};
```

**Assessment rules:**
- Shared accounts found -> `gap` for `helios-iam-user-accounts`.
- No shared accounts but evidence is export-only -> `manual_review`; CSV must never produce `pass` in the MVP.
- Backup last success missing or stale -> `gap` for `helios-backup-sql-agent-jobs`.
- `encrypted = false` -> `gap` for `helios-backup-encryption`.
- `restore_tested_at` missing/stale -> `gap` for `helios-backup-restoration-test`.
- MES/SCADA/EDI entries without TLS/auth/network restriction -> `gap` for corresponding API controls.
- Otherwise return `manual_review`. There is no CSV-to-`pass` rule in the MVP.
- For fields such as `tls_enabled`, `network_restricted`, and `credentials_rotated_at`, snapshot metadata must label values as customer-reported, not measured by Splnit.

### Task 4.4: Add import service that writes manual evidence safely

**Objective:** Persist CSV-derived evidence candidates through the same evidence/status path used by manual attestations.

**Files:**
- Create: `lib/workspaces/helios-csv/importer.ts`
- Possibly modify: `lib/db/queries/evidence.ts` to allow snapshot metadata beyond attestation answers, or call `createManualEvidence()` with `snapshotData` if adequate

**Rules:**
- Use `createManualEvidence()` or a new generic evidence helper that can set `type = helios_csv_import` and preserve sanitized CSV provenance. Do not route CSV through `createManualAttestationEvidence()` because it hardcodes `attestation_answers`.
- Evidence type must be explicit:
  - manual form submission -> `attestation_answers`
  - CSV-derived evidence -> `helios_csv_import`
- `source = manual` remains acceptable for CSV-assisted import unless a distinct `EvidenceSource` exists, but snapshot/provenance must say `customer_reported_csv_template`.
- Do not store raw secrets.
- Store sanitized row counts and derived findings, not full sensitive exports unless explicitly required and reviewed.

### Task 4.5: Add authenticated Helios import UI/action

**Objective:** Let a signed-in org upload CSV files from the Helios workspace.

**Files:**
- Create: `app/(app)/workspaces/helios/import/page.tsx`
- Create: `app/(app)/workspaces/helios/import/actions.ts`
- Modify: `app/(app)/workspaces/helios/page.tsx`

**UI behavior:**
- Show import link/card from `/workspaces/helios`.
- Clearly label: “CSV-assisted evidence import” / “Import nepředstavuje automatické napojení na Helios API.”
- Clearly state this is a Splnit CSV template workflow: “Stáhněte šablonu Splnit, namapujte export z Heliosu do této šablony a nahrajte vyplněné CSV.”
- Do not label the upload as a native Helios export unless native export support is added later.
- Accept only CSV files.
- Show supported templates and expected columns.
- After import, show:
  - records parsed
  - controls updated
  - gaps detected
  - rows skipped/errors
- Link back to `/workspaces/helios` and `/evidence`.

**Server action rules:**
- Require Clerk org.
- Enforce file size limit.
- Validate MIME/extension.
- Parse server-side.
- Sanitize sensitive columns.
- Write evidence under current org only.
- Return structured import result; do not expose stack traces.

### Task 4.6: Add CSV import smoke

**Objective:** Prove CSV import creates evidence/status/progress and cleans up.

**Files:**
- Create: `scripts/smoke-helios-csv-import.ts`
- Modify: `package.json`

**Assertions:**
- Parses fixtures.
- Creates evidence rows with `type = helios_csv_import` and `assessment_result IN ('manual_review', 'gap')` for at least:
  - `helios-iam-user-accounts`
  - `helios-iam-module-role-hierarchy`
  - `helios-backup-sql-agent-jobs`
  - `helios-api-mes-scada-integration`
- Updates `orgControlStatuses.lastEvidenceAt`.
- `getWorkspaceProgress()` reports increased evidence coverage.
- `listEvidenceVault()` includes CSV-derived Helios evidence.
- No CSV-derived evidence row has `assessment_result = pass`.
- Snapshot metadata labels imported fields as `customer_reported_csv_template`.
- Cleanup removes synthetic rows.

**Command:**
- `npm run smoke:helios-csv-import`

---

## Phase 5: Claim Safety, Final Validation, Deployment Readiness

### Task 5.1: Add Helios automation claim guard

**Objective:** Prevent public/product copy from overstating the implementation.

**Files:**
- Modify: `scripts/smoke-copy-hygiene.ts`
- Possibly modify: `lib/marketing/platform-copy.ts`

**Guard examples:**
- Flag phrases like:
  - `Helios automated evidence`
  - `Helios API checks are live`
  - `MES/SCADA automatically verified`
  - `EDI automatically verified`
- Allow safe phrases:
  - `Helios workspace/checklist`
  - `manual readiness review`
  - `CSV-assisted evidence import`
  - `not an automated Helios API connection`

**Command:**
- `npm run smoke:copy-hygiene`

### Task 5.2: Run narrow validation suite

**Objective:** Prove the Helios implementation works without full-suite noise.

**Commands:**
- `npm run smoke:helios-workspace-config`
- `npm run smoke:helios-control-seeding`
- `npm run smoke:helios-live-attestation`
- `npm run smoke:helios-evidence-provenance`
- `npm run smoke:helios-csv-parser`
- `npm run smoke:helios-csv-import`
- `E2E_SUITE=local-demo ENABLE_LOCAL_DEMO_DATA=true npx playwright test tests/e2e/helios-workspace.spec.ts --project=local-demo-chromium`
- `E2E_SUITE=local-demo ENABLE_LOCAL_DEMO_DATA=true npx playwright test tests/e2e/helios-onboarding-recommendation.spec.ts --project=local-demo-chromium`

### Task 5.3: Run repository validation before commit/deploy

**Objective:** Catch TypeScript/lint/build issues and migration drift.

**Commands:**
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run check:production-migration-drift`

**Expected:**
- All pass, or unrelated pre-existing failures are documented with exact output and separated from Helios changes.

### Task 5.4: Production data deployment note

**Objective:** Avoid shipping code that still fails in production because seed data was not applied.

**Requirement:**
- Since this plan primarily changes seed data, production must run the targeted `npm run seed:helios-controls` backfill against the intended production database during an approved deployment window after code deploy. Do not run full `npm run db:seed` for this rollout unless explicitly approved for a broader seed refresh.
- Before doing that, verify production DB target metadata without printing secrets.
- After targeted seeding production, run a production-safe read-only verification that checks only key presence/count and mapping count:
  - all 19 `helios-*` keys exist in `controls`
  - all 19 have NIS2 framework mappings
  - no duplicate Helios controls or framework mappings exist
  - no secret values printed

**Do not:**
- Run production seed/migration from an agent without explicit approval.
- Print `DATABASE_URL` or any Neon credentials.

---

## Acceptance Criteria

Hard floor for “Helios live manual workflow implemented”:
- [ ] All 19 `helios-*` keys exist in canonical `controls` after targeted seed.
- [ ] All 19 have NIS2 framework mappings through `framework_controls`.
- [ ] Targeted Helios seed is idempotent across at least two runs.
- [ ] Removed-key guard fails if a seeded Helios key disappears from current config without an explicit migration/backfill plan.
- [ ] All 19 Helios controls remain `testType = manual`, `isAutomated = false`.
- [ ] `createManualAttestationEvidence()` works for `helios-iam-user-accounts`.
- [ ] Evidence row is created with `type = attestation_answers`, `source = manual`, `collection_status = collected`.
- [ ] `orgControlStatuses` row updates for the Helios control.
- [ ] `/workspaces/helios` progress increases after evidence exists.
- [ ] `/evidence` / evidence vault query includes the Helios attestation evidence.
- [ ] Agency/client view reflects Helios progress.
- [ ] Smoke proves cleanup or uses a safe disposable test org.
- [ ] Onboarding smoke proves selecting Helios recommends the Helios workspace/callout.

Hard floor for “Helios CSV/import MVP implemented”:
- [ ] Supported Splnit CSV template formats are documented in parser types and UI copy; UI does not imply raw/native Helios exports are supported.
- [ ] Parser accepts valid fixtures and rejects malformed/secret-bearing files safely.
- [ ] CSV import creates evidence for at least one IAM, one backup, and one API/connectivity control.
- [ ] CSV-derived evidence updates progress and evidence vault visibility.
- [ ] CSV-derived evidence uses `type = helios_csv_import`, never `attestation_answers`.
- [ ] CSV-derived evidence can only use `assessment_result = manual_review` or `gap`; never `pass`.
- [ ] CSV snapshots label imported values as customer-reported/provenance `customer_reported_csv_template`.
- [ ] UI labels the feature as CSV-assisted/manual template import, not automated API integration and not native Helios export support.

Hard floor for “production-safe wording”:
- [ ] Copy hygiene smoke blocks Helios automation claims.
- [ ] No public copy says Helios API/MES/SCADA/EDI checks are live.
- [ ] Final status wording remains: Helios workspace/checklist and manual/CSV-assisted evidence workflow.

---

## Risks, Tradeoffs, Open Questions

Risks:
- Importing workspace configs into `CONTROL_LIBRARY` may create circular dependencies. If so, split shared types and seed adapters into lower-level modules.
- `titleEn` for Helios controls is not currently authored. Deterministic English fallback is acceptable for internal canonical controls, but user-facing EN copy should be reviewed before public reliance.
- Production seed process may not run automatically in deploy. This is a data deployment step, not a schema migration.
- CSV exports from real Helios installations may vary by version/customer. MVP uses Splnit templates that customers map into; native Helios exports should be a later, explicitly tested parser per edition/export format.

Tradeoffs:
- Mapping Helios controls to NIS2 only is the smallest change that unblocks current app flows. Direct ZoKB as a canonical framework may require schema/framework work if `zokb` is not present in `FRAMEWORK_LIBRARY`. This is a deliberate deferral with known GTM cost because ZoKB/NÚKIB is the headline Czech buyer framework.
- CSV-assisted import gives near-term value without risky customer DB/API access, but it must be clearly framed as manual/template import evidence.
- CSV imports must never produce `pass`; deriving a negative `gap` from reported data is safe, but deriving a positive pass from unreviewed customer upload would overstate posture.

Open questions:
- Should Helios controls eventually be first-class handcrafted entries instead of generated from workspace config? For this lane, generated entries are allowed only with immutable key manifest and removed-key guard.
- Should ZoKB become a canonical framework in `frameworks`, or remain workspace metadata/regulator guidance attached to NIS2 controls for now?
- Which Helios product/version export formats should be supported first: Helios iNuvio, Orange, Easy, or customer-defined SQL exports?
- Should CSV import store raw uploaded files in blob storage, or only sanitized derived evidence snapshots? Default recommendation: sanitized derived snapshots only.

---

## Final Verification Checklist

Run before marking complete:

```bash
git status --short
npm run smoke:helios-workspace-config
npm run seed:helios-controls
npm run seed:helios-controls
npm run smoke:helios-control-seeding
npm run smoke:helios-evidence-provenance
npm run smoke:helios-live-attestation
npm run smoke:helios-csv-parser
npm run smoke:helios-csv-import
E2E_SUITE=local-demo ENABLE_LOCAL_DEMO_DATA=true npx playwright test tests/e2e/helios-workspace.spec.ts --project=local-demo-chromium
E2E_SUITE=local-demo ENABLE_LOCAL_DEMO_DATA=true npx playwright test tests/e2e/helios-onboarding-recommendation.spec.ts --project=local-demo-chromium
npm run smoke:copy-hygiene
npm run typecheck
npm run lint
npm run build
npm run check:production-migration-drift
```

Report with exact outputs:
- changed files
- smokes run and pass/fail status
- whether production DB seeding is still pending
- exact safe wording that can be used publicly

---

## Safe Public/Product Wording After Phase 1-3

Allowed:
- “Helios workspace/checklist is implemented.”
- “Helios-specific controls and Czech guidance are available.”
- “Helios can be used for manual readiness review and evidence collection.”
- “Helios progress appears in workspace, evidence, and agency/client views after manual attestation.”

Allowed after Phase 4 only:
- “CSV-assisted Helios evidence import is available through Splnit mapping templates.”
- “CSV import can pre-fill manual-review/gap evidence findings for users, roles, backups, and integration inventories.”

Still not allowed:
- “Helios integration is automated.”
- “Helios evidence is collected automatically.”
- “Helios API checks are live.”
- “MES/SCADA/EDI checks are automatically verified.”
- “Helios workflow is fully production-ready” unless production seed and live smokes have been verified on the actual production target.
