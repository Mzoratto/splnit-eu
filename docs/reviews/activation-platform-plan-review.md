# Activation Platform Plan Review

Date: 2026-05-19
Status: review complete; implementation not started
Scope reviewed: intake -> ranked controls/gaps -> recommended connector or manual evidence -> first confirmed evidence/gap -> retention surfaces

## Source context

This review was based on the current repository surfaces for the activation loop and the follow-up outside review of the full-scope activation-platform plan.

Existing surfaces referenced during review:

- `components/onboarding/onboarding-wizard.tsx` — seven-section intake wizard with draft/autosave behavior, scoring, recommendations, and reveal modal behavior.
- `lib/onboarding/intake-scope.ts` and `lib/onboarding/intake-questions.ts` — intake-derived scope and recommendations.
- `app/(app)/controls/page.tsx` — Controls focus/all views with ranked list and pagination.
- `app/(app)/integrations/page.tsx` — connector recommendation and empty-state surface.
- `app/(app)/integrations/microsoft365/page.tsx`, `app/api/integrations/microsoft/callback/route.ts`, `lib/integrations/microsoft365/oauth.ts`, `lib/integrations/runner.ts`, `inngest/run-integration-tests.ts` — current Microsoft 365 OAuth/test-runner path.
- `lib/db/schema.ts` — existing integrations, integration runs, evidence, org control statuses, vendors, risk items, and audit logs.
- Existing verification style: Playwright E2E and TypeScript smoke scripts; no unit-test runner is currently established.

## Core product judgment

The activation loop is the right product priority, but the reviewed full-scope plan is too wide for a first implementation tranche. The user-visible value is the loop itself:

1. complete intake in one sitting,
2. reveal ranked gaps,
3. recommend the next connector or manual evidence path,
4. collect one first evidence signal,
5. show one honest confirmed pass/gap or blocked state.

Everything else should be subordinate to proving that path. Architecture work is justified only where it prevents a known data/security defect or enables the first evidence moment.

## Accepted decisions

### D25 — Split evidence state into dimensions

Decision: accepted.

The original proposed enum values were rejected as a data-model defect:

- `confirmed_pass` / `confirmed_gap` answer assessment result.
- `blocked` answers collection status.
- `not_checked` conflates no collection attempt with no assessment result.
- `manual_completed` answers source/workflow.
- `assumed_from_intake` answers source and confidence.
- `stale` answers freshness and should be computed, not stored as a primary state.

The model must represent independent axes explicitly:

| Field | Question | Initial values |
| --- | --- | --- |
| `assessment_result` | What did the control evaluation say? | `pass`, `gap`, `unknown` |
| `collection_status` | Did collection succeed? | `pending`, `collected`, `blocked`, `failed` |
| `source` | Where did the evidence come from? | `connector`, `manual`, `intake`, `imported` |
| `confidence` | How much should the system trust this value? | `high`, `medium`, `low`, `none` |
| `collected_at` | When was the evidence collected? | timestamp or null |
| `blocked_reason` | Why did connector/manual collection fail? | typed reason or null |

Freshness should be computed from `collected_at` plus the per-check TTL. Do not store a long-lived `is_stale` boolean or a primary `stale` enum value that requires background recomputation.

Default confidence must be centralized in `lib/activation/evidence-state.ts` or equivalent:

- connector -> `high`
- manual -> `medium`
- intake -> `low`
- imported -> explicit origin-dependent mapping

The important preserved-result case must be supported: a connector can become blocked while the last known assessment remains pass/gap. The UI should be able to express: “Last known: passing; Microsoft 365 connector blocked; evidence aging.”

### D4 — Microsoft 365 permission/tenant contract remains a hard prerequisite

Do not launch the OAuth UX until these are explicit:

- exact scopes,
- least-privilege rationale,
- tenant binding behavior,
- admin-consent requirement,
- what Graph data is read,
- what data is stored,
- retention and disconnect behavior,
- blocked-permission fallback.

### D6 — Manual fallback is first-class

Manual upload/attestation must feed the same dimensional evidence model as connector-collected evidence. It cannot be a secondary UI-only escape hatch.

### D8 + D23 — First Microsoft 365 run must be idempotent and locked

After successful Microsoft OAuth, queue one first run. The queue path must dedupe first-run events and enforce one active run per org/provider before it is exposed as the activation path.

### D14 — Instrumentation is typed and sanitized

Use typed activation events, but keep the first slice small. Prefer events such as:

- `IntakeCompleted`
- `ConnectorRecommended`
- `ConnectorOAuthStarted`
- `ConnectorOAuthCompleted`
- `EvidenceCollectionQueued`
- `EvidenceCollected`
- `EvidenceBlocked`
- `AssessmentChanged`
- `ManualEvidenceAdded`

The sanitizer must reject raw intake answers, Graph payloads, secrets, file contents, and implementation/evidence details that should not leave the tenant-scoped app context.

## Decisions requiring re-scope before implementation

### D13 — Do not extract the activation domain before behavior exists

Original direction: extract shared activation modules before feature work.

Revised direction: extract only the narrow model/helpers required by the first vertical slice. Do not set a wizard-size goal or split the 1228-line wizard as a prerequisite to shipping first evidence. Premature extraction would freeze boundaries before the activation behavior proves what boundaries are real.

Allowed early extraction:

- `lib/activation/evidence-state.ts` for dimensional evidence types/defaults/state transitions.
- A small recommendation/state-mapping helper only if needed by both UI and runner.
- A small sanitizer/event helper only if instrumentation is added in the same slice.

Defer broad module extraction (`scoring`, `recommendations`, `auto-writes`, `visibility`, `draft`) until callers actually need the shared boundary.

### D10 — Auto-writing risk/vendor records is not in the first activation slice

The dimensional evidence model makes auto-writes safer, but it does not make governance mutation automatically safe. Auto-writing records on behalf of users should not ship until these are specified:

- exact trigger: only `assessment_result=gap` with sufficient confidence, not blocked/stale/pending,
- idempotency key,
- ownership and user-review lifecycle,
- reopen behavior,
- audit metadata,
- how to distinguish integration-health issues from control failures,
- whether design partners accept system-suggested risk/vendor records.

### D11 — Weekly digest should be revisited, likely deferred

The digest depends on stable event semantics, recipient visibility, unsubscribe/frequency settings, and durable state transitions. It is retention infrastructure, but it should not block first activation. Revisit after the first evidence/gap path is proven.

### D17 — Visibility predicates need an explicit role/resource document

Centralized predicates are directionally correct, but the plan assumed the upstream access model. Before authenticated Trust preview, digest, or auto-writes depend on it, define:

- roles,
- tenant/org boundaries,
- resources covered,
- public vs authenticated Trust visibility,
- API/HTML/email/cache enforcement points,
- exceptions and admin behavior.

### D22 — Performance work should be minimum viable for the first slice

Use only indexes needed by the first slice. Defer read models, query-count tests, EXPLAIN gates, future partitioning, and broad query-budget observability until query volume or a concrete dashboard workload justifies them.

## Decision dashboard

| Area | Status | Decision |
| --- | --- | --- |
| Intake UX | Proceed | Keep focused seven-step flow; ensure completion triggers reveal and downstream recommendations. |
| Controls focus view | Proceed | Default to ranked top-5/focus list; allow escape to all controls. |
| Integrations empty state | Proceed | Recommend Microsoft 365 based on intake when applicable; keep manual fallback visible. |
| Evidence model | Changed | Use dimensional model; no flat all-purpose enum. |
| Microsoft 365 contract | Blocked until specified | Must document scopes, tenant binding, storage, retention, disconnect, and blocked fallback. |
| First connector run | Proceed after contract/model | Queue idempotent first run with per-org/provider lock. |
| Manual evidence | Proceed | Same evidence model and success metric as connector evidence. |
| Instrumentation | Narrow proceed | 5-8 sanitized activation events first; expand later. |
| Auto-writes | Defer | Not in first slice; requires product validation and lifecycle spec. |
| Weekly digest | Revisit/defer | Do not block first evidence loop. |
| Trust preview expansion | Defer except safe aggregate/auth spec work | Needs visibility/leak tests before shipping detailed surfaces. |
| Read models/perf program | Defer | Add only necessary first-slice indexes. |
| Vitest | Separate setup PR or minimal slice | Do not let tooling setup block product path unexpectedly. |
| Production migrations | Explicit gate | Check drift and plan migration window before deploy. |

## Recommended next implementation shape

Ship a thin vertical activation slice first:

1. Keep the existing intake wizard mostly intact.
2. Add the dimensional evidence model and state-mapping helpers.
3. Define the Microsoft 365 permission/tenant contract.
4. After OAuth callback, enqueue one idempotent first run.
5. Render one activation status panel/state on the relevant user path: queued, running, blocked, confirmed pass, confirmed gap.
6. Make manual evidence feed the same state model.
7. Add a small sanitized activation event set.
8. Add focused tests for state mapping, callback enqueue/dedupe, sanitizer rejection, blocked-permission fallback, and one Playwright happy path.

Do not include in this slice:

- broad wizard/domain extraction,
- auto-created risk/vendor records,
- weekly digest,
- dashboard read model,
- broad performance instrumentation,
- detailed Trust preview expansion.

## Refuse-to-ship gates

Do not ship Microsoft 365 activation until:

- permission/tenant contract is written,
- callback enqueue is idempotent,
- per-org/provider run lock exists,
- blocked-permission fallback is visible and tested.

Do not ship evidence state until:

- `assessment_result`, `collection_status`, `source`, `confidence`, `collected_at`, and freshness computation are separated,
- default confidence mapping is centralized,
- preserving last-known result while collection is blocked is tested.

Do not ship public or authenticated Trust preview changes until leak tests cover:

- HTML,
- API JSON,
- headers,
- unauthenticated access,
- cached/static output,
- rendered email/text.

Do not ship auto-written risk/vendor records until:

- trigger semantics use `assessment_result=gap`, not blocked/stale/failed collection,
- idempotency and lifecycle are specified,
- user-review ownership is explicit,
- audit metadata is present,
- reopen behavior is tested.

Do not ship schema-dependent code to production until:

- migration files are generated and reviewed,
- `npm run check:production-migration-drift` is part of the pre-deploy gate,
- production migration timing/rollback posture is explicit.

## Next-step decision

Next decision to make before implementation: whether to formally reduce the first engineering tranche to the thin vertical slice above.

Recommended answer: yes. Keep full activation-platform ambition, but make tranche 1 prove the user-visible loop before building retention/governance/platform layers around it.
