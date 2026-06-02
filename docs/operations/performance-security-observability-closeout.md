# T4-I performance/security/observability closeout

Date: 2026-06-02
Scope: source-smoke-first closeout for Lane 09 findings. No deploy, production DB/Blob, live Stripe/provider action, package install, or production environment change was performed.

## Baseline measured before changes

Command: `npm run build`

Observed result:

- Build passed on Next.js 16.2.6 / Turbopack.
- Compile phase: 12.0s.
- Sentry/Next `runAfterProductionCompile`: 396ms.
- TypeScript phase: 13.6s.
- Generated 77 static pages in 258ms.
- Warning persisted: `Using edge runtime on a page currently disables static generation for that page`.
- Route table remained mostly dynamic: public pages such as `/`, `/about`, `/blog`, `/cenik`, `/platform`, `/predpisy`, `/pricing`, `/security`, `/soukromi`, `/srovnani`, `/status`, `/tools/nis2-scope`, and `/trust/[orgSlug]` were marked `ƒ`; only `/manifest.webmanifest`, `/robots.txt`, and `/sitemap.xml` were marked `○`.

## Dependency override governance

The active root overrides are documented in `docs/security/dependency-overrides.md` with owner, validation command, rationale, and removal criteria for:

- `brace-expansion` `5.0.6`
- `esbuild` `0.28.0`
- `postcss` `8.5.10`
- `tmp` `0.2.7`
- `uuid` `11.1.1`

No package or lockfile version was changed in T4-I.

## Next ecosystem compatibility

Current source/package state:

- `next`: `^16.2.6`; installed `next@16.2.6`.
- `@next/bundle-analyzer`: `^15.5.18`; installed `@next/bundle-analyzer@15.5.18`.
- `eslint-config-next`: `^15.5.18`; installed `eslint-config-next@15.5.18`.
- Registry metadata check on 2026-06-02 showed `@next/bundle-analyzer` and `eslint-config-next` have `16.2.7` available.

Accepted compatibility risk for this tranche:

- Build and lint are currently green, so the mismatch is not an immediate blocker.
- Performance tooling confidence is reduced while analyzer/config packages remain one major behind the app framework.
- T4-I does not update packages because dependency changes are explicitly risky and were not necessary for the measured closeout.

Removal/upgrade criteria:

1. In a dependency-maintenance tranche, align `next`, `@next/bundle-analyzer`, and `eslint-config-next` to the same supported Next 16 minor/patch line.
2. Run `npm install`/clean install, `npm run lint`, `npm run typecheck`, `npm run build`, and `npm run analyze`.
3. If analyzer output is required for a budget gate, run the Lighthouse/analyzer path before making the gate blocking.

## Lighthouse/performance script

`package.json` now exposes `perf:lighthouse` as a first-class local/advisory command:

- `npm run perf:lighthouse`
- Command uses `lhci autorun --upload.target=filesystem` so local verification does not upload reports to LHCI temporary public storage.
- The existing `.lighthouserc.json` remains the budget source. The script is not made a CI blocker in T4-I.

Do not make Lighthouse blocking until product/engineering accepts the public-route budget, representative local test data, and artifact retention policy.

## Sentry PII/secret scrubber policy

Sentry initialization now has an explicit repo-level data policy:

- `sendDefaultPii: false` for client, server, and edge configs.
- `beforeSend` and `beforeSendTransaction` scrub representative secret/PII-shaped keys and token-bearing strings through `lib/observability/sentry-scrubber.ts`.
- Redacted value is `[Filtered]`.
- Source smoke `smoke:sentry-scrubbing` exercises representative payloads without sending anything to Sentry.

Policy boundary:

- The scrubber is deny-list based, not a legal approval to send user/org/customer content to Sentry.
- Expanding Sentry context fields or enabling default PII still requires explicit product/legal/security approval.

## Public route dynamic output and edge warning investigation

Source evidence for the edge warning:

- `app/opengraph-image.tsx` exports `runtime = "edge"` and is listed in build output as dynamic (`ƒ /opengraph-image`).
- Next's warning is consistent with edge runtime disabling static generation for that generated image page.

Source evidence for broad dynamic public route output:

- `app/layout.tsx` calls `cookies()` to read cookie consent before rendering `CookieConsent`.
- `i18n/request.ts` calls `headers()` to derive `X-NEXT-INTL-LOCALE` fallback.
- These dynamic APIs are used at the root/i18n layer and explain why otherwise static marketing pages are marked dynamic.

T4-I decision:

- Do not remove `cookies()` or `headers()` in this tranche because that would alter locale/cookie-consent behavior across public and authenticated routes.
- Treat static public-route generation as a separate performance/product tranche requiring a curated static route list and explicit behavior decisions.

Remaining route-rendering risk:

- Public acquisition/SEO pages likely remain server-rendered on demand and may have avoidable latency/cost.
- The edge warning is understood but not eliminated; moving/removing the generated OG edge runtime should be evaluated separately.
