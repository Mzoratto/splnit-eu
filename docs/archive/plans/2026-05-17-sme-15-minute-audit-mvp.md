# Spec: SME 15-Minute Audit MVP

## Objective

Build the first high-ROI SME-market slice: a short deterministic intake that turns onboarding answers into a scoped, prioritized control gap list.

The goal is not to build an LMS, broad GRC platform, or AI-first advisor. The goal is to make a new SME user quickly understand:

1. Which compliance tasks are probably relevant to them.
2. Why those tasks apply.
3. Which controls are out of scope or not applicable, without silently deleting them.
4. What critical gaps they should work on first.

Primary user: an Italian-first SME owner/operator or internal admin using Splnit.eu for NIS2/GDPR/ISO-style readiness.

Secondary user: a consultant/advisor later reviewing a client workspace. This MVP must not add consultant write semantics yet.

## Current Codebase Findings

Existing onboarding is shallow but useful:

- `app/(app)/onboarding/page.tsx` renders the onboarding entry point.
- `components/onboarding/onboarding-wizard.tsx` runs a 5-step client wizard: company, frameworks, tools, integration, score.
- `app/(app)/onboarding/actions.ts` validates company/framework/tool/complete steps with Zod.
- `lib/db/queries/onboarding.ts` persists organisation fields, selected frameworks, tool inventory, and initial framework score.
- `organisations` already stores `country`, `primaryJurisdiction`, `locale`, `sector`, `employeeCount`, and `toolInventory`.
- `orgFrameworks`, `frameworkControls`, `controls`, and `orgControlStatuses` already provide most compliance primitives.

Important gaps confirmed in code:

- There is no structured intake profile table.
- Tool selections are stored in `organisations.toolInventory`; deeper answers would overload this field if added there.
- `completeOnboarding()` only sets `onboardingCompletedAt` and framework score. It does not seed control statuses.
- `listOrgControlsForIndex()` lists controls from enrolled frameworks, not scoped applicability.
- `getDashboardData()` reads priority controls only from existing `orgControlStatuses` with statuses `fail`, `manual_review`, or `unknown`. If statuses are not seeded, the dashboard cannot show a meaningful first gap list.

## Product Contract

### Deterministic first

The MVP must be deterministic. No AI-generated scope decisions in the first implementation.

Allowed later:
- AI can explain deterministic recommendations.
- AI can help summarize owner-provided answers.

Not allowed in MVP:
- AI deciding legal/regulatory applicability.
- AI hiding controls.
- AI claiming legal coverage.

### Scope status semantics

Use existing `orgControlStatuses` for first release if possible, but make status semantics explicit:

- `unknown`: in scope, no proof yet.
- `manual_review`: in scope, needs human confirmation or evidence review.
- `fail`: in scope, known gap.
- `pass`: in scope, evidence/proof accepted.
- `not_applicable`: not relevant for this organisation based on intake.
- `out_of_scope`: not selected for this first readiness scope or framework path.

If current DB/code cannot safely distinguish applicability rationale inside `orgControlStatuses`, add a separate `org_control_applicability` table later. For this MVP, the preferred first model is an intake profile table with derived scope JSON and seeded statuses.

### Disclosure levels

This feature is owner-private only.

Do not expose scoped-out controls, rationales, exact control IDs, evidence filenames, test timings, schedules, or implementation details in public Trust Center views.

### Jurisdiction and copy posture

- Italy-first UX copy.
- English-EU and Czech copy must be updated together when UI strings change.
- Do not imply Italian legal-final templates or reviewed legal advice unless the existing legal review status supports it.

## Tech Stack

Existing stack only:

- Next.js App Router
- React
- TypeScript
- Drizzle/Postgres
- Clerk org tenancy
- next-intl
- Existing smoke/e2e infrastructure

No new dependency should be added for this slice unless a test proves it is necessary.

## Commands

Development:

```bash
npm run dev
```

Schema/migrations when `lib/db/schema.ts` changes:

```bash
npm run db:generate
npm run db:migrate
```

Narrow verification during implementation:

```bash
npm run typecheck
npm run lint
npx playwright test tests/e2e/onboarding.spec.ts
```

Smoke verification:

```bash
npm run smoke:primary-flow
```

Pre-commit/pre-deploy baseline for this non-trivial feature:

```bash
npm run typecheck
npm run lint
npm run build
npm run smoke:primary-flow
npx playwright test tests/e2e/onboarding.spec.ts
```

Before deployment/use of schema-backed functionality:

```bash
npm run db:generate
npm run db:migrate
```

Also explicitly verify whether production migrations have been applied. If the deploy pipeline does not apply them, run `npm run db:migrate` against production `DATABASE_URL` before relying on production behavior.

## Project Structure

Likely implementation files:

- `lib/db/schema.ts` — add structured intake profile persistence.
- `lib/db/queries/onboarding.ts` — create/update/read intake profile and seed statuses.
- `lib/onboarding/intake-questions.ts` — question definitions, answer schema keys, locale-neutral metadata.
- `lib/onboarding/intake-scope.ts` — deterministic scope engine and rationale output.
- `app/(app)/onboarding/actions.ts` — validate/persist intake answers and completion.
- `components/onboarding/onboarding-wizard.tsx` — render short question flow and scoped result preview.
- `lib/db/queries/controls.ts` — expose in-scope/out-of-scope filtering for control index.
- `lib/db/queries/dashboard.ts` — show prioritized in-scope gap counts/list.
- `messages/it-IT.json`, `messages/en-EU.json`, `messages/cs-CZ.json` — all new strings.
- `tests/e2e/onboarding.spec.ts` — extend the existing browser flow.

Possible test/helper files:

- `lib/onboarding/intake-scope.test.ts` or project-equivalent test location if an existing unit-test convention exists.
- A small smoke script only if current smoke infrastructure cannot assert seeded priorities cleanly.

## Code Style

Follow existing patterns:

- Server actions validate `unknown` input with Zod before reading active Clerk org.
- DB query functions live under `lib/db/queries/*` and call `getDb()` internally.
- Use `@/*` imports.
- Keep App Router pages server-first; client state remains inside the onboarding component.
- Avoid module-scope initialization of external service clients.
- Keep changes surgical and avoid broad UI refactors.

Example style matching current onboarding actions:

```ts
const intakeSchema = z.object({
  handlesCustomerData: z.boolean(),
  usesCloudHosting: z.boolean(),
  criticalServiceExposure: z.enum(["none", "limited", "material"]),
  selectedTools: z.array(z.string()).max(24),
});

export async function saveIntakeStep(input: unknown) {
  const parsed = intakeSchema.parse(input);
  const clerkOrgId = await getActiveOrgId();

  await saveOnboardingIntakeProfile({
    clerkOrgId,
    answers: parsed,
  });

  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
}
```

## Testing Strategy

Unit/seam tests:

- Deterministic scoping rules should be tested independently from React and DB.
- Include representative profiles:
  - tiny professional-services SME
  - cloud SaaS
  - manufacturing SME
  - healthcare or sensitive-data SME
- Tests must assert both recommended controls and human-readable rationale categories.

DB/query smoke:

- Persist/create/update/read one intake profile for a Clerk org.
- Seed statuses for applicable controls without duplicating rows.
- Preserve existing onboarding behavior for orgs without an intake profile.

E2E/browser:

- Extend `tests/e2e/onboarding.spec.ts` so a user can complete the shorter intake and land on dashboard.
- Verify controls/dashboard display scoped priority gaps from the intake result, not hardcoded copy.

Regression checks:

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run smoke:primary-flow`

## Boundaries

Always:

- Keep the feature deterministic for MVP.
- Validate every server action/API input with Zod.
- Store only structured answers. Do not collect secrets or broad free-form descriptions.
- Preserve existing onboarding for organisations without intake profiles.
- Record scoped-out/not-applicable decisions with rationales.
- Update all three locale message files together for new UI strings.
- Run migration generation for schema changes.

Ask first:

- Adding a separate applicability table instead of using derived scope JSON plus `orgControlStatuses`.
- Adding dependencies.
- Adding AI to intake recommendations.
- Changing public Trust Center disclosure.
- Changing production migration/deploy behavior.

Never:

- Claim legal advice or final legal template status from intake output.
- Hide controls without storing an owner-visible rationale.
- Expose raw control IDs, evidence filenames, exact test timings, schedules, or implementation detail in public links.
- Store magic tokens/plain secrets in this feature.
- Edit `.next/`, `node_modules/`, generated `next-env.d.ts`, or generated migration metadata by hand.

## Success Criteria

The MVP is complete when:

- A new org can answer a short intake during onboarding.
- Structured answers persist per Clerk org.
- A deterministic scope engine derives applicable controls and rationales.
- Completing onboarding seeds initial `orgControlStatuses` for applicable controls.
- Dashboard priority controls and counts reflect in-scope gaps.
- Controls index can distinguish in-scope from out-of-scope/not-applicable controls.
- Existing orgs without intake profiles still load onboarding/dashboard/controls.
- No public route exposes the new private scoping rationales.
- Typecheck, lint, build, onboarding e2e, and primary-flow smoke pass.

## Implementation Plan

### Task 1: Add structured intake profile persistence

Description: Add a schema-backed home for structured answers and derived scope without overloading `organisations.toolInventory`.

Acceptance criteria:

- `org_intake_profiles` stores `clerkOrgId`, `version`, `answers`, `derivedScope`, timestamps, and optional `completedAt`.
- Read/write query functions exist in `lib/db/queries/onboarding.ts` or a small adjacent module.
- Existing `getOnboardingState()` remains backward compatible.

Verification:

```bash
npm run db:generate
npm run typecheck
```

Likely files:

- `lib/db/schema.ts`
- `lib/db/queries/onboarding.ts`
- generated migration

Dependencies: none.

### Task 2: Implement deterministic intake questions and scope engine

Description: Define the first 10-15 SME questions and map answers to applicable controls/rationales using deterministic rules.

Acceptance criteria:

- `lib/onboarding/intake-questions.ts` exports stable question keys/options.
- `lib/onboarding/intake-scope.ts` exports a pure function from answers + selected frameworks/tools to derived scope.
- Representative profile tests cover tiny SME, SaaS, manufacturing, and healthcare/sensitive data.
- Rules are conservative and produce rationale strings/categories.

Verification:

```bash
npm run typecheck
npm run lint
```

Plus the project-appropriate unit test command once the test file exists.

Likely files:

- `lib/onboarding/intake-questions.ts`
- `lib/onboarding/intake-scope.ts`
- scope-engine test file

Dependencies: Task 1 can be parallel for pure rules, but final persistence integration depends on Task 1.

### Task 3: Wire intake into onboarding server actions and wizard

Description: Add the short intake step/results to the existing onboarding flow with validated server actions.

Acceptance criteria:

- User can answer the short intake inside the existing onboarding flow.
- Answers save and reload if the user leaves/returns.
- User sees a preview of recommended priority areas and why they apply.
- No free-form secret collection.

Verification:

```bash
npm run typecheck
npm run lint
npx playwright test tests/e2e/onboarding.spec.ts
```

Likely files:

- `app/(app)/onboarding/actions.ts`
- `components/onboarding/onboarding-wizard.tsx`
- `app/(app)/onboarding/page.tsx`
- `messages/it-IT.json`
- `messages/en-EU.json`
- `messages/cs-CZ.json`

Dependencies: Tasks 1 and 2.

### Task 4: Seed initial statuses from derived scope

Description: On completion, create/update control statuses so dashboard and controls are immediately useful.

Acceptance criteria:

- Applicable controls receive initial status `unknown`, `manual_review`, or `fail` according to deterministic priority rules.
- Scoped-out controls are recorded as `not_applicable` or `out_of_scope` with a rationale in derived scope.
- Re-running onboarding is idempotent and does not duplicate status rows.
- Existing manually changed statuses are not blindly overwritten without a clear rule.

Verification:

```bash
npm run typecheck
npm run lint
npm run smoke:primary-flow
```

Likely files:

- `lib/db/queries/onboarding.ts`
- `lib/db/queries/controls.ts`
- `lib/controls/scorer.ts` if scores need recalculation only

Dependencies: Tasks 1 and 2.

### Task 5: Surface scoped gaps in dashboard and control index

Description: Make the immediate product value visible after onboarding.

Acceptance criteria:

- Dashboard shows a true derived priority gap count/list.
- Controls index can filter or visually distinguish in-scope vs out-of-scope/not-applicable controls.
- UI copy stays honest: “recommended based on intake”, not legal determination.
- Mobile and desktop layouts do not overflow.

Verification:

```bash
npm run typecheck
npm run lint
npm run build
npm run smoke:primary-flow
npx playwright test tests/e2e/onboarding.spec.ts
```

Likely files:

- `lib/db/queries/dashboard.ts`
- `lib/db/queries/controls.ts`
- controls/dashboard page or components using those queries
- locale message files

Dependencies: Task 4.

## Checkpoints

### Checkpoint A: After Tasks 1-2

- Intake profile can be persisted.
- Scope engine is deterministic and tested.
- No UI changes are required to verify the pure rules.

### Checkpoint B: After Tasks 3-4

- User can complete onboarding and seeded statuses appear in DB/query output.
- Existing onboarding still works for old orgs.

### Checkpoint C: After Task 5

- End-to-end onboarding produces visible scoped gaps on dashboard/controls.
- Full non-trivial verification baseline passes.
- Human review before moving to Policy-to-Evidence Loop.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---:|---|
| Scope engine overclaims legal applicability | High | Label output as readiness scoping, not legal advice; deterministic conservative rules; owner-visible rationale. |
| Existing status model cannot cleanly represent applicability | Medium | Start with derived scope JSON and existing statuses; ask before adding separate applicability table. |
| Re-running onboarding overwrites manual user work | High | Seed only missing statuses or preserve stronger/manual statuses unless explicit reset is requested. |
| Dashboard messaging becomes fake/hardcoded | Medium | Derive counts from actual status rows/derived scope; test smoke assertions. |
| Migration drift in production | High | Generate/apply migrations explicitly; verify production DB before deploy/use. |
| UI expands into a long questionnaire | Medium | Cap MVP to 10-15 questions and show progress/result preview. |

## Open Questions for Owner Review

1. Use `not_applicable` and `out_of_scope` in `orgControlStatuses` for MVP, or introduce a separate applicability table now?
2. Should onboarding seed only missing statuses, or should it update previous `unknown` statuses when intake changes?
3. Should the first release show scoped-out controls in the controls index by default collapsed, or hide them behind a filter?
4. What exact max question count is acceptable for the “15-minute audit” promise: 10, 12, or 15?
5. Should initial dashboard gaps be framed as “critical gaps” only when requirement level/severity supports it, otherwise “priority gaps”?

## Recommended Owner Decisions

Default decisions if not corrected:

- Use deterministic rules only.
- Add `org_intake_profiles` with derived scope JSON.
- Seed only missing statuses and preserve manual user changes.
- Use `unknown`/`manual_review`/`fail` for in-scope gaps, plus `not_applicable`/`out_of_scope` only where the existing status flow accepts them safely.
- Show in-scope controls by default; put out-of-scope/not-applicable controls behind a filter.
- Say “priority gaps” unless a severity/requirement source justifies “critical”.
