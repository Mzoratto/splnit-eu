# Entire Codebase Audit - Lane 09: Performance, Build Health, Dependency/Security, Observability

Date: 2026-06-02
Repo: `/Users/marcozoratto/splnit.eu`
Mode: audit only; no implementation, no commit, no push, no deploy, no production DB/Blob access.

## Scope and exclusions

Audited:
- Build health: typecheck, lint, production build, build output, route rendering mode, framework config.
- Bundle/performance risk: Next config, bundle analyzer availability, dynamic/static route posture, large dependency surfaces, public asset/generated/cache hygiene, Lighthouse config.
- Dependency/security posture: `package.json`, `package-lock.json`, overrides, npm audit high-level result, runtime/dev dependency alignment.
- Observability: Sentry server/edge/client setup, Sentry build plugin options, Vercel Analytics/Speed Insights, PostHog gating, health checks, error boundaries.
- Logging/error handling and secret exposure: source-only static searches for secret-shaped env usage, console/error paths, public/private env assumptions, webhook and cron authorization shape.
- Server/client boundaries and lazy initialization for DB, Redis, Stripe, Resend, AWS connectors, PostHog, Sentry.

Excluded:
- No source-code fixes were implemented.
- No deploy, Vercel mutation, production DB read/write, or Blob operation was performed.
- No production env values were printed or inspected. Secret review was source-only and presence/shape oriented.
- No browser Lighthouse run was performed because the audit path already exercised build health and avoided additional server/process side effects after one command was blocked.

## Files/directories inspected

Primary files:
- `AGENTS.md`
- `.hermes/plans/2026-06-02_094729-lane-09-performance-security-observability.md`
- `.hermes/state/entire-codebase-audit-ledger.md`
- `package.json`
- `package-lock.json`
- `next.config.ts`
- `instrumentation.ts`
- `instrumentation-client.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `proxy.ts`
- `.gitignore`
- `.vercelignore`
- `.lighthouserc.json`
- `vercel.json`

Representative implementation files inspected:
- `components/cookie-consent.tsx`
- `components/marketing/pricing-cta.tsx`
- `components/marketing/deferred-effects.tsx`
- `app/global-error.tsx`
- `app/(app)/error.tsx`
- `app/api/webhooks/stripe/route.ts`
- `app/api/webhooks/clerk/route.ts`
- `app/api/internal/health/route.ts`
- `app/api/newsletter/route.ts`
- `lib/db/index.ts`
- `lib/redis/client.ts`
- `lib/email/client.ts`
- `lib/stripe/client.ts`
- `inngest/client.ts`
- `public/**` inventory by file listing

## Commands run and results

- `git status --short && npm run typecheck && npm run lint && npm run build && npm audit --audit-level=high`
  - Result: pass for typecheck, lint, build, and npm audit.
  - Initial status included existing dirty/untracked work from other lanes: `M docs/README.md`, untracked `.hermes/state/entire-codebase-audit-ledger.md`, lane 01-04/06/07 audit reports, and `docs/product/implementation-gap-audit.md`.
  - `npm run typecheck`: pass.
  - `npm run lint`: pass.
  - `npm run build`: pass on Next.js 16.2.6 / Turbopack. Build compiled successfully in 20.3s, completed Sentry/Next runAfterProductionCompile in 663ms, TypeScript phase in 15.0s, generated 77 static pages in 232ms, and finalized optimization.
  - Build warning: `Using edge runtime on a page currently disables static generation for that page`.
  - Build output classified almost every app route as dynamic (`ƒ`), with only `/manifest.webmanifest`, `/robots.txt`, and `/sitemap.xml` shown as static (`○`).
  - `npm audit --audit-level=high`: pass, `found 0 vulnerabilities`.

- Static source searches via repository search tooling:
  - Secret/env shape search over source/config files for `NEXT_PUBLIC_*`, `DATABASE_URL`, `SECRET`, `TOKEN`, `KEY`, `password`, `api_key`, console logging, Sentry, PostHog, Vercel Analytics, dynamic imports, and SDK initializers.
  - Result: no production secret values were printed by the audit. Source includes expected env-var names and several test placeholder values in smoke scripts.

- `node -e ... && npm ls brace-expansion esbuild postcss tmp uuid --all --depth=6`
  - Result: blocked by tool policy/user-denial before output. I did not retry the same command or attempt the same outcome through another terminal command. Dependency override evidence below therefore comes from `package.json` / `package-lock.json` reads and static search only.

## Overall classification

Partial.

The repo is buildable and passes typecheck, lint, production build, and high-severity npm audit. Sentry, Vercel Analytics/Speed Insights, PostHog consent gating, health endpoints, webhook signature checks, lazy SDK initialization, cache/generated-file ignores, and a Lighthouse CI config are present.

The main gaps are operational hardening rather than immediate build blockers: public/marketing pages are mostly dynamic in the production build, the build emits an edge-runtime static-generation warning, Sentry captures errors without repo-level `beforeSend`/PII scrub policy, dependency overrides are not documented with expiry/owner, Next-related package versions are misaligned, and there is no first-class secret-scanning command/CI gate in `package.json`.

## Positive findings

- Build health is currently good: `npm run typecheck`, `npm run lint`, `npm run build`, and `npm audit --audit-level=high` passed.
- `next.config.ts` wraps Next with `next-intl`, bundle analyzer support gated by `ANALYZE=true`, and Sentry integration.
- Security headers are configured globally: CSP, Permissions-Policy, Referrer-Policy, HSTS, X-Content-Type-Options, X-Frame-Options (`next.config.ts:24-84`).
- Production CSP excludes `unsafe-eval`; dev only adds it (`next.config.ts:6-10`).
- Sentry build plugin disables telemetry, deletes sourcemaps after upload, removes debug logging, uses a tunnel route, and is silent outside CI (`next.config.ts:104-135`).
- `proxy.ts` matcher excludes `/sentry-tunnel`, reducing risk that Sentry tunneling conflicts with auth/proxy logic (`proxy.ts:163-167`).
- Server/edge/client Sentry initialization is gated by DSN presence and environment (`instrumentation-client.ts:3-12`, `sentry.server.config.ts:7-15`, `sentry.edge.config.ts:8-16`).
- Global and app error boundaries capture exceptions to Sentry (`app/global-error.tsx:12-14`, `app/(app)/error.tsx:16-18`).
- Vercel Analytics and Speed Insights are only rendered after optional analytics consent is accepted (`components/cookie-consent.tsx:68-75`).
- PostHog is dynamically imported, disabled without optional consent, uses `autocapture: false`, and uses no automatic pageview capture (`components/marketing/pricing-cta.tsx:44-76`).
- Heavy/optional client marketing effects are dynamically imported with `ssr: false` (`components/marketing/deferred-effects.tsx:5-15`).
- DB, Redis, Resend, Stripe, and AWS clients are not initialized at module scope in the inspected modules; they are created inside getter/helper functions after env checks (`lib/db/index.ts:32-48`, `lib/redis/client.ts:11-23`, `lib/email/client.ts:12-21`, `lib/stripe/client.ts:22-34`, `lib/connectors/aws/checks.ts` search result lines 158-184).
- Webhook signature checks exist for Stripe and Clerk (`app/api/webhooks/stripe/route.ts:200-228`, `app/api/webhooks/clerk/route.ts:40-60`).
- Internal health endpoint requires an internal token or cron bearer secret and uses no-store headers (`app/api/internal/health/route.ts:34-60`, `app/api/internal/health/route.ts:120`).
- Generated/cache hygiene is covered in `.gitignore` and `.vercelignore` for `.next`, `node_modules`, coverage, Playwright reports, test results, env files, and Vercel local state (`.gitignore:13-60`, `.vercelignore:1-8`).
- `.lighthouserc.json` exists with performance/CLS/LCP/TBT thresholds for public marketing URLs (`.lighthouserc.json:1-29`).

## Findings by priority

### P1 - Public/marketing routes are not statically optimized in the current build

Evidence:
- `npm run build` passed, but the route table marked `/`, `/about`, `/blog`, `/cenik`, `/platform`, `/predpisy`, `/pricing`, `/security`, `/soukromi`, `/srovnani`, `/status`, `/tools/nis2-scope`, `/trust/[orgSlug]`, and most other pages as dynamic (`ƒ`). Only `/manifest.webmanifest`, `/robots.txt`, and `/sitemap.xml` were static (`○`).
- Build warning: `Using edge runtime on a page currently disables static generation for that page`.

Impact:
- Public acquisition/SEO pages likely pay per-request rendering overhead and may have weaker CDN cacheability than expected.
- The warning indicates at least one edge-runtime boundary is preventing static generation for a page, but the build output alone does not identify the exact source.
- This is a performance/cost risk, not a correctness blocker.

Recommended implementation slice:
- Add a small route-rendering audit script that parses `next build` output or `.next` manifests and fails only on a curated list of public routes expected to be static.
- Identify why public routes are dynamic: cookies, headers, auth/proxy interaction, next-intl request config, route-level dynamic APIs, or edge runtime.
- For truly static marketing pages, remove dynamic API usage or add explicit static/cache configuration where safe.
- Keep authenticated/app routes dynamic.

Dedicated implementation plan:
- Files likely to change: `app/(marketing)/**`, `components/marketing/**`, `i18n/request.ts`, `proxy.ts`, `scripts/*route-rendering*`, `package.json`.
- RED command: `npm run build` plus route table/manifests showing curated public routes as `ƒ`.
- GREEN command: `npm run build` plus route assertion showing approved public routes as static or explicitly waived.
- Subagent tasks: (1) build-output parser and waiver list, (2) static/dynamic root-cause on marketing shell/i18n/cookies, (3) surgical route fixes, (4) verifier reruns build and public E2E.
- Rollback/feature flag: route rendering changes can be reverted by restoring prior dynamic behavior; no feature flag needed unless changing user-visible personalization.
- Existing-data migration/backfill: not applicable.
- Human approval: approve which public routes must be static versus intentionally dynamic.

### P1 - Next ecosystem package versions are misaligned

Evidence:
- `package.json` uses `next` `^16.2.6` (`package.json:185`) but dev dependencies include `@next/bundle-analyzer` `^15.5.18` and `eslint-config-next` `^15.5.18` (`package.json:207`, `package.json:216`).
- Build/lint currently pass, so this is not an immediate breakage.

Impact:
- Next major-version mismatch can hide lint rule drift, bundle analyzer incompatibilities, or future install/build failures.
- It weakens confidence in performance tooling exactly where this lane depends on analyzer output.

Recommended implementation slice:
- Align Next-related packages to the same major version as `next` after checking compatibility/release availability.
- Re-run install, lint, build, and analyzer.

Dedicated implementation plan:
- Files likely to change: `package.json`, `package-lock.json`.
- RED command: static assertion that `next`, `@next/bundle-analyzer`, and `eslint-config-next` majors differ.
- GREEN command: `npm install`/`npm ci`, `npm run lint`, `npm run build`, and `ANALYZE=true npm run build` if analyzer is supported in local environment.
- Subagent tasks: (1) check available compatible versions, (2) update package metadata only, (3) run checks, (4) verifier clean install/build.
- Rollback/feature flag: revert dependency metadata/lockfile if checks fail.
- Existing-data migration/backfill: not applicable.
- Human approval: approve dependency upgrade/downgrade direction if Next 16-compatible analyzer/config package availability is constrained.

### P2 - Sentry captures errors but lacks explicit repo-level PII/secret scrubbing policy

Evidence:
- `instrumentation.ts` exports `Sentry.captureRequestError` directly (`instrumentation.ts:13`).
- Client/server/edge configs initialize Sentry with DSN/environment/sample rates but no `beforeSend`, `beforeSendTransaction`, `sendDefaultPii`, allowlist/denylist, or explicit scrubber (`instrumentation-client.ts:5-12`, `sentry.server.config.ts:9-15`, `sentry.edge.config.ts:10-16`).
- Error boundaries capture full `Error` objects (`app/global-error.tsx:12-14`, `app/(app)/error.tsx:16-18`).

Impact:
- Sentry defaults are safer than raw logging, but compliance-sensitive product errors may include customer/org identifiers, route params, or provider error messages.
- The repo does not document or enforce what event fields are allowed before sending telemetry.

Recommended implementation slice:
- Add a shared Sentry scrubber helper used by client/server/edge config.
- Explicitly set `sendDefaultPii: false` unless product/legal approval says otherwise.
- Redact known sensitive key names in event contexts/breadcrumbs/request data.
- Add a source-level smoke test with representative event payloads.

Dedicated implementation plan:
- Files likely to change: `lib/observability/sentry-scrub.ts` or similar, `instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `scripts/smoke-sentry-scrubbing.ts`, `package.json`.
- RED command: new smoke demonstrating current sample payload retains sensitive-shaped fields.
- GREEN command: `npm run smoke:sentry-scrubbing && npm run typecheck && npm run lint`.
- Subagent tasks: (1) design scrub allow/deny list, (2) wire all Sentry configs, (3) add smoke, (4) verifier checks no secrets printed.
- Rollback/feature flag: use env flag only if scrubber unexpectedly drops necessary diagnostic data; default should be scrubbed.
- Existing-data migration/backfill: not applicable.
- Human approval: approve observability data policy and any PII allowed in production error telemetry.

### P2 - Dependency overrides are present but not justified in-repo

Evidence:
- `package.json` overrides: `brace-expansion` `5.0.6`, `esbuild` `0.28.0`, `postcss` `8.5.10`, `tmp` `0.2.7`, `uuid` `11.1.1` (`package.json:198-204`).
- `npm audit --audit-level=high` passed with zero vulnerabilities, suggesting the overrides are currently effective for high-severity audit posture.
- No adjacent comments or docs explain why each override exists, when it can be removed, or which advisory/tooling issue it mitigates.

Impact:
- Future maintainers may remove or retain overrides blindly.
- Broad overrides like `esbuild` can affect tooling behavior outside the original advisory scope.

Recommended implementation slice:
- Add a dependency override rationale document or comments in an accepted metadata location.
- Include advisory/CVE reference where applicable, owner, date added, removal condition, and validation command.

Dedicated implementation plan:
- Files likely to change: `docs/security/dependency-overrides.md` or equivalent, possibly `package.json` if using structured metadata is preferred.
- RED command: static check/doc review showing overrides without rationale.
- GREEN command: doc exists, each override has rationale/removal condition, `npm audit --audit-level=high` still passes.
- Subagent tasks: (1) identify advisory/source for each override, (2) document rationale, (3) add review cadence, (4) verifier checks package metadata unchanged unless approved.
- Rollback/feature flag: docs-only rollback.
- Existing-data migration/backfill: not applicable.
- Human approval: approve dependency governance format.

### P2 - No first-class secret scanning command or CI gate is present

Evidence:
- `.gitignore` and `.vercelignore` correctly exclude env files and generated/cache directories (`.gitignore:46-60`, `.vercelignore:1-8`).
- `package.json` has many smoke and CI scripts, but no explicit secret-scan script was found in the inspected scripts list (`package.json:5-158`).
- Static searches found expected env-var names and test placeholders in source, but this audit did not run a dedicated entropy/secret scanner.

Impact:
- Git ignore rules reduce accidental env-file commits but do not detect hardcoded API keys, tokens, private keys, or copied production URLs in source/docs/tests.
- The product handles regulated workflows; a repeatable pre-commit/CI scan would materially reduce accidental exposure risk.

Recommended implementation slice:
- Add a deterministic source-only secret scan script with path exclusions and redacted output, or wire an established tool in CI.
- Include a baseline/allowlist for known test placeholders.
- Ensure the command never prints matched values, only file/line/key shape and redacted preview.

Dedicated implementation plan:
- Files likely to change: `scripts/secret-scan.ts`, `package.json`, CI config if present.
- RED command: `npm run security:secret-scan` missing/failing because command absent.
- GREEN command: `npm run security:secret-scan` passes and prints redacted findings only.
- Subagent tasks: (1) scanner/allowlist, (2) package script, (3) optional CI hook, (4) verifier seeds a fake secret in temp file and confirms redacted failure without committing it.
- Rollback/feature flag: remove script/CI hook if false positives block work; keep docs for manual run.
- Existing-data migration/backfill: not applicable.
- Human approval: approve scanner strictness and CI failure policy.

### P2 - Lighthouse CI exists but is not wired into package scripts

Evidence:
- `.lighthouserc.json` defines collection URLs and assertions for performance, CLS, LCP, and TBT (`.lighthouserc.json:1-29`).
- `package.json` includes `@lhci/cli` but no `lhci`/`lighthouse` npm script in the inspected script block (`package.json:5-158`, `package.json:206`).

Impact:
- Performance budgets are documented but easy to skip.
- Regressions in public pages may only be caught manually.

Recommended implementation slice:
- Add a package script such as `perf:lighthouse` that runs `lhci autorun` against the existing config.
- Decide whether it is advisory or blocking in CI.

Dedicated implementation plan:
- Files likely to change: `package.json`, maybe CI config/docs.
- RED command: `npm run perf:lighthouse` absent.
- GREEN command: `npm run perf:lighthouse` runs using `.lighthouserc.json` after `npm run build`.
- Subagent tasks: (1) add script, (2) verify locally with built app, (3) document expected runtime/artifacts, (4) verifier reruns on clean worktree.
- Rollback/feature flag: script-only rollback; CI can start non-blocking.
- Existing-data migration/backfill: not applicable.
- Human approval: approve threshold strictness and whether temporary public storage upload is acceptable.

### P3 - Inngest client is initialized at module scope

Evidence:
- `inngest/client.ts` exports `new Inngest({ id: "splnit-eu", name: "Splnit.eu" })` at module scope (`inngest/client.ts:1-6`).

Impact:
- This did not break `next build` and does not appear to require secrets at construction time.
- It is an exception to the repo's general lazy-client guidance and could become a build/runtime risk if Inngest initialization later reads env or performs side effects.

Recommended implementation slice:
- Either document that this constructor is side-effect-free and safe at module scope, or wrap it in a getter consistent with other SDK clients.

Dedicated implementation plan:
- Files likely to change: `inngest/client.ts`, `inngest/**` imports if using a getter.
- RED command: source audit showing module-scope constructor remains undocumented.
- GREEN command: docs/comment or getter pattern plus `npm run typecheck && npm run build`.
- Subagent tasks: (1) choose documentation versus getter, (2) update imports only if necessary, (3) verifier build.
- Rollback/feature flag: revert to existing export if Inngest handler integration requires singleton export shape.
- Existing-data migration/backfill: not applicable.
- Human approval: not required unless changing Inngest production behavior.

## Security/compliance/proof-boundary notes

- No secrets were printed in this report. Evidence references env variable names and file locations only.
- `.env*` is ignored in both Git and Vercel deployment ignores, except `.env.example` (`.gitignore:46-48`, `.vercelignore:1-2`).
- Public env usage (`NEXT_PUBLIC_*`) is present for expected public config such as app URL, Clerk publishable key, Stripe publishable key, Sentry DSN, Vercel env, PostHog key/host, and test-route flags. The risky one is `NEXT_PUBLIC_ENABLE_TEST_ROUTES`; it is intentionally paired with `ENABLE_TEST_ROUTES` in multiple files and should be verified false/missing in production env.
- Webhook and cron/internal health authorization shape is present and does not expose secret values in source responses.
- Newsletter and Loops calls send bearer tokens in headers but do not log responses or token values (`app/api/newsletter/route.ts:47-63`, `lib/regulations/digest.ts` search result lines 292-294).
- Test/smoke scripts include placeholder/test secret assignments. These are acceptable only if kept clearly non-production and covered by future scanner allowlists.

## Top risks

1. Public route performance/cost risk from mostly dynamic build output and an edge-runtime static-generation warning.
2. Observability privacy risk from Sentry capture without explicit repo-level scrubber/data policy.
3. Dependency governance risk from undocumented overrides and Next 16 / Next tooling 15 version mismatch.
4. Process risk from missing first-class secret scan and missing package script for existing Lighthouse budgets.
5. Future build fragility if currently safe module-scope SDK constructors grow env/side effects.

## Test/validation matrix

| Area | Current validation | Result | Recommended additional validation |
| --- | --- | --- | --- |
| TypeScript | `npm run typecheck` | Pass | Keep in CI/pre-merge |
| Lint | `npm run lint` | Pass | Keep in CI/pre-merge |
| Production build | `npm run build` | Pass with edge-runtime/static warning | Add route static/dynamic assertion for public pages |
| Dependency audit | `npm audit --audit-level=high` | Pass, 0 vulnerabilities | Add override-rationale review and clean `npm ci` verifier |
| Bundle analysis | `ANALYZE=true` support present | Not run in this lane | Run after Next tooling version alignment |
| Lighthouse | `.lighthouserc.json` present | Not run in this lane | Add `npm run perf:lighthouse` and CI/advisory policy |
| Secret exposure | Source-only static search | No secret values intentionally printed | Add deterministic redacted scanner command |
| Sentry | Config files inspected | Present, no explicit scrubber | Add scrubber smoke tests |
| Analytics consent | Code inspection | Vercel/PostHog gated by optional consent | Browser/network verification after consent changes |
| Generated/cache hygiene | `.gitignore`/`.vercelignore` inspected | Good baseline | Periodic check for generated docs/reports and local artifacts |

## Rollback / feature-flag strategy

- Build/static-route changes: revert route/config changes; no persisted state impact. Use route waivers rather than feature flags unless changing personalization/cookie behavior.
- Dependency alignment: revert `package.json`/`package-lock.json` if install/build/analyzer fails.
- Sentry scrubber: default to stricter scrub; rollback by reverting config/helper changes if diagnostics become unusable. Any expansion of PII telemetry requires human approval.
- Secret scanner/Lighthouse scripts: scripts can be introduced as advisory first, then made blocking after false-positive burn-in.
- Inngest client shape: revert getter/documentation change if Inngest route registration requires existing singleton export.

## Existing-data migration/backfill decision

No persistent data migration or backfill is required for any finding in this lane. All recommendations are config, dependency, observability, script, or route-rendering changes.

## Human approval items

- Decide which public/marketing routes must be statically generated versus intentionally dynamic.
- Approve production observability data policy: whether Sentry may include any user/org/request context and exactly which fields are allowed.
- Approve dependency override governance format and removal cadence.
- Approve secret-scanner strictness and whether it should block CI immediately.
- Approve Lighthouse threshold strictness and use of `temporary-public-storage` upload in `.lighthouserc.json`.

## Blockers / issues encountered

- One terminal command intended to inspect override dependency trees (`node -e ... && npm ls ...`) was blocked by tool policy/user-denial and produced no output. I did not retry it or attempt the same outcome through another terminal command. The report uses package file reads and static search evidence instead.
- The build output printed presence of `.env.local` as a Next environment file, but no env values were printed.
- `.next/diagnostics/route-bundle-stats.json` was not present after the build; `.next/diagnostics/build-diagnostics.json` existed and only recorded compile-stage build options.

## Files created or modified

- Created: `docs/audits/entire-codebase-lane-09-performance-security-observability.md`

## T4-I implementation closeout

Date: 2026-06-02

Scope completed without commit, push, deploy, production DB/Blob, live Stripe/provider action, package install, or production environment change.

### Changes made

- Added dependency override governance documentation with rationale, owner, validation command, and removal criteria for `brace-expansion`, `esbuild`, `postcss`, `tmp`, and `uuid`: `docs/security/dependency-overrides.md`.
- Documented the accepted Next ecosystem compatibility risk instead of changing package versions: `docs/operations/performance-security-observability-closeout.md`.
- Added a first-class local Lighthouse script: `perf:lighthouse` runs `lhci autorun --upload.target=filesystem` so reports stay local unless a future gate changes policy.
- Added an explicit Sentry scrubber policy and implementation: `lib/observability/sentry-scrubber.ts`, wired into `instrumentation-client.ts`, `sentry.server.config.ts`, and `sentry.edge.config.ts` with `sendDefaultPii: false`, `beforeSend`, and `beforeSendTransaction`.
- Added source-only smokes for Sentry scrubbing and T4-I governance/investigation coverage: `scripts/smoke-sentry-scrubbing.ts`, `scripts/smoke-t4i-performance-security-observability.ts`, and `scripts/smoke-manifest.json` entries.
- Investigated and documented build route-rendering output: the edge warning is consistent with `app/opengraph-image.tsx` exporting `runtime = "edge"`; broad public dynamic output is consistent with root/i18n dynamic API usage in `app/layout.tsx` (`cookies()`) and `i18n/request.ts` (`headers()`). No route behavior was changed.

### Measurement / verification

Baseline before changes:

- `npm run build`: PASS. Build compiled in 12.0s, Sentry/Next runAfterProductionCompile completed in 396ms, TypeScript finished in 13.6s, generated 77 static pages in 258ms. Warning persisted: `Using edge runtime on a page currently disables static generation for that page`. Route table remained mostly dynamic (`ƒ`), with only `/manifest.webmanifest`, `/robots.txt`, and `/sitemap.xml` static (`○`).
- `npm ls next @next/bundle-analyzer eslint-config-next --depth=0`: `next@16.2.6`, `@next/bundle-analyzer@15.5.18`, `eslint-config-next@15.5.18`.
- `npm view @next/bundle-analyzer version && npm view eslint-config-next version`: both returned `16.2.7`, confirming a Next 16-compatible tooling line exists, but package changes were intentionally not made in this tranche.

After changes:

- `npm run smoke:sentry-scrubbing && npm run smoke:t4i-performance-security-observability && npm run smoke:t4b-safety-gates`: PASS.
- `npm run typecheck`: PASS after the concurrent T4-H lead-capture status narrowing issue was fixed during parent integration.
- `npm run lint`: PASS.
- `npm run build`: PASS after the concurrent T4-H lead-capture status narrowing issue was fixed; build still shows the known edge-runtime static-generation warning and mostly dynamic route table.
- `npm audit --audit-level=high`: PASS, `found 0 vulnerabilities`.

### Remaining risks

- Public routes are still broadly dynamic; static public-route generation needs a separate curated-route/product behavior decision.
- The edge-runtime static-generation warning is understood but not removed; changing/removing the OG image edge runtime was out of this closeout scope.
- Next-related package versions remain misaligned until a dependency-maintenance tranche updates `next`, `@next/bundle-analyzer`, and `eslint-config-next` together and reruns install/build/analyzer checks.
- Sentry scrubbing is deny-list based and reduces risk but does not authorize sending PII/customer content; future context expansion still needs product/legal/security approval.
- Lighthouse is first-class and local/advisory, not a CI gate. A blocking performance budget still needs approval of thresholds, representative fixtures, and artifact retention.
