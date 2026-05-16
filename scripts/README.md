# Smoke and maintenance scripts

This directory contains small TypeScript scripts that validate specific product and compliance surfaces. Run them through the `npm run ...` aliases in `package.json` unless you are intentionally debugging the script directly with `tsx`.

Do not print secret values from these scripts. If a script checks credentials or connection strings, it should report presence, missing names, or redacted/classified metadata only.

## Default local checks

Use these after code or content changes before a commit:

| Command | Use when | Notes |
| --- | --- | --- |
| `npm run typecheck` | Any TypeScript change | Runs `tsc --noEmit`. |
| `npm run lint` | Any source, script, or docs-adjacent code change | Runs ESLint. |
| `npm run build` | Runtime app changes or larger refactors | Verifies the Next.js production build. |

## Trust Center checks

| Command | Use when | What it protects |
| --- | --- | --- |
| `npm run smoke:trust-center-settings` | Changing Trust Center slug/settings logic | Reserved public slugs, normalization, and invalid slug rejection. |
| `npm run smoke:trust-center-public-disclosure` | Changing public Trust Center UI/copy | Prevents exact test timestamps, next-run schedules, and demo fallback leaks from public surfaces. |
| `npm run smoke:public-module-seams` | Changing `lib/trust-center/public-*` or `lib/policies/templates.ts` | Protects public document ordering, framework filtering, locked-document behavior, Splnit demo document ordering, and policy-template facade ordering. |

Public Trust Center pages must stay category-level. Do not expose individual control IDs, evidence filenames, exact test timings, or attacker-useful implementation details.

## Policy template checks

| Command | Use when | What it protects |
| --- | --- | --- |
| `npm run smoke:templates` | Changing `lib/policies/*`, policy template data, or template resolution | Verifies CZ/EU customer-facing template resolution, Italian draft gating, placeholder substitution, and unknown-template failure. |
| `npm run smoke:public-module-seams` | Changing policy template module organization | Verifies the stable facade exported by `lib/policies/templates.ts` preserves jurisdiction and family ordering. |

Italian policy templates under `lib/policies/policy-template-data/it.ts` include draft/review-sensitive material. Customer-facing resolution must not silently expose draft-only template families.

## Legal, marketing, and public disclosure checks

| Command | Use when | What it protects |
| --- | --- | --- |
| `npm run smoke:copy-hygiene` | Changing public copy, legal pages, marketing pages, messages, or app copy | Guards against stale/wrong legal identity, unsubstantiated automation claims, and Czech-only copy leaking into other locales. |
| `npm run smoke:seo` | Changing marketing routes, localized paths, robots, sitemap, blog, or framework pages | Verifies sitemap coverage, production host URLs, hreflang alternates, x-default, and robots disallow rules for private/app routes. |
| `npm run smoke:source-documents` | Changing legal/source document imports or source metadata | Verifies source document availability and integrity expected by the knowledge layer. |
| `npm run smoke:reviewed-article-links` | Changing reviewed legal article links or knowledge mappings | Guards reviewed source links used by article/mapping workflows. |

Public legal text must not ship with placeholders, fake entity names, fake certifications, or unverified claims. Use the real operator identity only where the relevant page is ready for publication.

## Production readiness checks

Production smokes can touch live services and should be run deliberately.

| Command | Use when | Environment and side effects |
| --- | --- | --- |
| `npm run smoke:production-tenant-readiness-prereqs` | Before running the full production tenant smoke | Loads `.env.local` for missing shell values, reports missing env names only, classifies DB host as local/non-local without printing the host, and exits non-zero if required prerequisites are missing. |
| `npm run smoke:production-tenant-readiness-source` | After editing the production tenant smoke itself | Static guard that verifies the smoke keeps required safety gates, cleanup, redacted JSON output, and live questionnaire proof checks. |
| `SMOKE_LIVE_OPENAI_QUESTIONNAIRE=true npm run smoke:production-tenant-readiness` | Proving buyer-facing authenticated production readiness | Requires production/non-local `DATABASE_URL`, Clerk smoke user credentials, Blob token, and live questionnaire generation opt-in. Creates and cleans up smoke org/data, exercises authenticated app surfaces, and may attempt mailbox delivery only when mailbox env is present. |

Before production readiness work, confirm whether migrations are needed and whether the deployment pipeline actually applies them. If not, run or document the manual production migration command with the production `DATABASE_URL` without exposing credentials.

## Choosing the smallest useful command

- Trust Center copy/UI change: `smoke:trust-center-public-disclosure`, then `typecheck` and `lint`.
- Trust Center model/document refactor: `smoke:public-module-seams`, `smoke:trust-center-public-disclosure`, `typecheck`, and `lint`.
- Policy template data/resolution change: `smoke:templates`, `smoke:public-module-seams`, `typecheck`, and `lint`.
- Public legal/marketing copy change: `smoke:copy-hygiene`, `smoke:seo` if route metadata changed, `typecheck`, and `lint`.
- Buyer-readiness production proof: `smoke:production-tenant-readiness-prereqs`, then the full production smoke only when prerequisites are present and the run is intentional.
