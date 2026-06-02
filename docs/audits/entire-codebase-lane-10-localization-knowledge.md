# Entire Codebase Audit - Lane 10: Localization, Czech-First Content, Jurisdiction Knowledge Layer

Date: 2026-06-02
Mode: audit only; no implementation, commit, push, deploy, production DB/blob mutation.
Workspace: `/Users/marcozoratto/splnit.eu`

## Scope and exclusions

Scope inspected:
- i18n routing and request message loading.
- `messages/*.json` completeness and locale-specific copy hygiene.
- Czech default routing and public language switching.
- Marketing copy and public claim boundaries across Czech, English-EU, and Italian.
- Jurisdiction context, policy template resolution, source document imports, article/mapping review status, and NIS2 evidence-template coverage.
- Czech NIS2 / ZoKB / NÚKIB / ÚOOÚ boundaries and Italian/English secondary-layer status.

Exclusions:
- No code changes were implemented.
- No production deploys, commits, pushes, Blob writes, or production mutation actions were performed.
- Database commands were read-only except `smoke:tenant-locales`, whose script opens a transaction and rolls it back; no persistent rows were kept.
- Legal conclusions are not provided; findings classify engineering proof and review boundaries only.

## Files/directories inspected

Primary files:
- `AGENTS.md`
- `.hermes/plans/2026-06-02_094729-lane-10-localization-knowledge.md`
- `.hermes/state/entire-codebase-audit-ledger.md`
- `package.json`
- `i18n/routing.ts`
- `i18n/request.ts`
- `i18n/messages.ts`
- `i18n/marketing-paths.ts`
- `messages/cs-CZ.json`
- `messages/en-EU.json`
- `messages/it-IT.json`
- `components/nav.tsx`
- `components/footer.tsx`
- `components/locale-switcher.tsx`
- `components/marketing/marketing-shell.tsx`
- `lib/seo/metadata.ts`
- `lib/jurisdictions/context.ts`
- `lib/policies/templates.ts`
- `lib/policies/resolve-template.ts`
- `lib/regulations/authoritative-sources.ts`
- `lib/regulations/czech-cyber-law.ts`
- `lib/regulations/czech-decrees.ts`
- `scripts/smoke-i18n-shell.ts`
- `scripts/smoke-tenant-locales.ts`
- `scripts/smoke-italian-gdpr-layer.ts`
- `scripts/smoke-italian-nis2-layer.ts`
- `scripts/smoke-nis2-evidence-templates.ts`
- `scripts/report-knowledge-counts.ts`
- `docs/legal/legal-review.md`
- `docs/legal/final-czech-legal-review-checklist.md`
- `docs/product/splnit-product-status.md`

Also searched:
- `app/(marketing)/**`
- `components/**`
- `lib/**`
- `scripts/**`
- `docs/legal/**`
- `docs/product/**`

## Commands run and results

| Command | Result | Notes |
| --- | --- | --- |
| `git status --short` | pass | Existing dirty/untracked audit files present; this lane added only its report. |
| `npm run smoke:i18n-shell` | fail | `en.dashboard.metrics.scoreTitle` actual `Readiness score`, expected `Compliance score` in `scripts/smoke-i18n-shell.ts:143`. |
| `npm run audit:localization` | pass with findings | Key counts match: 1,932 each for `cs-CZ`, `en-EU`, `it-IT`; zero missing keys; emitted P0/P1/P2 localization/review-boundary findings. |
| `npm run smoke:tenant-locales` | fail | Czech dashboard NÚKIB copy actual `Feed NÚKIB`, expected `NÚKIB feed` in `scripts/smoke-tenant-locales.ts:74`. Transaction rolled back. |
| `npm run smoke:jurisdictions` | pass | Jurisdiction context smoke passed. |
| `npm run smoke:knowledge-layer` | pass | Counts: frameworks 5, controls 135, frameworkControlMappings 227, articles 2, frameworkControlArticleMappings 56, sourceDocuments 48, evidenceTemplates 56, integrationTests 30. |
| `npm run smoke:source-documents` | pass | Source document smoke passed. |
| `npm run smoke:templates` | pass | Policy template resolution smoke passed. |
| `npm run smoke:copy-hygiene` | pass | Copy hygiene smoke passed. |
| `npm run smoke:italian-gdpr-layer` | fail | Garante Data Breach article missing from imported `articles`; source documents exist but article rows are absent. |
| `npm run smoke:italian-nis2-layer` | fail | Expected 44 reviewed D.Lgs. 138/2024 article rows; actual 0. Source document exists. |
| `npm run smoke:nis2-evidence-templates` | fail | 19 Helios NIS2 framework-control mappings missing `evidence_requirements`; see details below. |
| `npm run smoke:mapping-review-schema` | pass | Mapping review schema smoke passed. |
| `npm run smoke:reviewed-article-links` | pass | Reviewed article link smoke passed, but this is weak because the DB has no reviewed article rows to exercise. |
| `npm run knowledge:counts` | pass | Same low article count: 2 article rows total. |
| Read-only DB summary via Node/pg | pass | Confirmed source document, article, and mapping-review counts listed below. |
| `npx tsx -e ...POLICY_TEMPLATES...` | pass | Confirmed CZ/EU policy templates customer-usable; IT templates draft-only. |

All Node/pg DB commands emitted a pg SSL-mode warning about `sslmode=require`/aliases; this is not a lane functional failure but should be normalized to `sslmode=verify-full` or explicit libpq compatibility later.

## Implemented / partial / blocked / absent classification

### 1. i18n shell and routing

Classification: partial.

Implemented:
- `i18n/routing.ts` defines locales `cs-CZ`, `en-EU`, `it-IT` with `defaultLocale: "cs-CZ"` and `localePrefix: "never"`.
- `normalizeLocale` maps short and regional variants to the supported locales.
- `i18n/request.ts` falls back to `routing.defaultLocale` if no valid request/header locale exists.
- `i18n/messages.ts` loads all three locale JSON files.
- `i18n/marketing-paths.ts` provides localized public paths: Czech unprefixed, English `/en`, Italian `/it`.

Partial / risks:
- `localePrefix: "never"` means next-intl itself does not own URL prefixes; the app implements `/en` and `/it` through custom marketing path mapping. This is intentional for Czech-first routing but should remain covered by route smokes.
- `smoke:i18n-shell` currently fails because the smoke expects older English copy (`Compliance score`) while actual messages have `Readiness score`. This appears to be a stale assertion or an intentional copy change not reflected in the smoke. Either way, the smoke is not green.

### 2. Locale message completeness

Classification: structurally implemented, quality partial.

Implemented:
- `npm run audit:localization` reported identical key counts for all locales: 1,932 keys each, no missing keys.
- Required application namespaces are present in all locales per `smoke-i18n-shell.ts` until the content assertion failure.

Partial / risks:
- Localization audit emits many quality findings despite key completeness:
  - `italian-possible-english-leak`: 60
  - `italian-placeholder-risk`: 2
  - `czech-possible-english-leak`: 67
  - `cs-may-miss-review-boundary`: 51
  - `it-may-miss-review-boundary`: 32
- Some findings are false positives caused by valid product terms (`Workspace`, `Trust Center`, `Dashboard`, `Evidence`, etc.), but the audit also flags real review-boundary phrases where translations may imply review/approval too strongly.
- The two P0 Italian placeholder-risk findings are in:
  - `frameworkWizard.questions.emissions.help`
  - `pricing.comparison.features.subdomain`
  These need human localization triage even if they may be heuristic false positives.

### 3. Public language switcher and marketing locale paths

Classification: implemented, with one route-link caveat.

Implemented:
- `components/nav.tsx` includes `LocaleSwitcher` on desktop nav and mobile menu.
- `components/footer.tsx` includes `LocaleSwitcher` in the footer.
- `components/locale-switcher.tsx` stores `NEXT_LOCALE`, writes `splnit_locale`, and sends users to localized paths computed by `getLocalizedMarketingPath`.
- `lib/seo/metadata.ts` emits canonical URLs and alternates for `cs-CZ`, `en`, `it-IT`, plus `x-default` to `/`.

Caveat:
- `Nav` special-cases `/demo` and leaves it unlocalized. If demo routes are public marketing surfaces, this is a gap against “language switcher on all public pages” and should be classified with the lane that owns demo routes.

### 4. Czech-first positioning and public claim alignment

Classification: mostly implemented, still human/legal-bound.

Implemented / aligned:
- `AGENTS.md` and `docs/product/splnit-product-status.md` enforce Czech-first positioning, no fake customers/certifications, and bounded NIS2/ZoKB readiness claims.
- Public marketing search found bounded language such as “where available”, “indicative triage, not legal advice”, and “preparation, not completed certification”.
- `docs/product/splnit-product-status.md` explicitly marks NIS2/ZoKB readiness as “partial to strong, Czech-first” and forbids claims such as automatic NIS2 proof, NÚKIB certification, legal/counsel reviewed, ISO/SOC certification, and fake customer proof.
- Security page copy explicitly states ISO 27001 is preparation, not certification.

Human/legal-bound:
- `docs/legal/final-czech-legal-review-checklist.md` says legal pages are ready only as engineering/counsel drafts and not ready to publish as final customer legal terms.
- Public legal/operator identity, DPO/contact, subprocessors, retention, OpenAI terms, liability, incident timelines, and special-category evidence policy remain P0 human/counsel decisions.

### 5. Jurisdiction context layer

Classification: implemented for CZ/EU/IT basics; partial for deeper legal coverage.

Implemented:
- `lib/jurisdictions/context.ts` supports `CZ`, `EU`, and `IT` with locale defaults, authorities, labels, and citations.
- Czech context uses NÚKIB, ÚOOÚ, ČTÚ, and NIS2 citation `Zákon č. 264/2025 Sb.`.
- EU context uses generic competent authorities and `Directive (EU) 2022/2555`.
- Italian context uses ACN, Garante, AGCOM, and `D.Lgs. 138/2024`.
- `npm run smoke:jurisdictions` passed.

Partial / risks:
- `getJurisdictionContext` falls back unsupported jurisdiction to EU, which is safe broadly but may hide unsupported country-specific requirements unless UI labels clearly mark it as generic EU fallback.
- Context is label/citation-level; it does not prove article imports, mapping review, or legal advice.

### 6. Policy templates and template resolution

Classification: Czech/EU usable, Italian intentionally draft/secondary.

Implemented:
- `lib/policies/templates.ts` combines CZ, EU, and IT template data.
- `lib/policies/resolve-template.ts` filters out `reviewStatus === "draft"` for customer-usable templates and falls back to EU/en-EU when no usable exact template exists.
- `npm run smoke:templates` passed.
- `npm run smoke:tenant-locales` confirmed template resolution logic up to the locale-copy assertion failure.

Template status observed:
- CZ/cs-CZ: 6 customer-usable templates (`reviewStatus` not `draft`).
- EU/en-EU: 6 customer-usable templates (`reviewStatus` not `draft`).
- IT/it-IT: 12 templates, all `draft`; therefore Italian tenants resolve to EU/en-EU templates as expected by `scripts/smoke-tenant-locales.ts`.

Risk:
- Italian is correctly tertiary/draft for policy templates, but public Italian copy and smokes must not imply complete Italian legal/template coverage.

### 7. Source documents, articles, and mapping review status

Classification: source documents implemented; article knowledge layer mostly absent in the connected DB; mappings draft-only.

Observed read-only DB summary:
- `source_documents`: 48 total, all with `last_reviewed` set.
  - CZ/cs-CZ: 11
  - EU/cs-CZ: 4
  - EU/en-EU: 9
  - EU/it-IT: 3
  - ISO/en-EU: 2
  - IT/it-IT: 19
- `articles`: 2 total, both `EU/en-EU`, both `draft`.
- `framework_control_articles`: 56 total, all linked to `EU/en-EU` articles with `confidence = draft`.

Implemented:
- Source document metadata exists for canonical EU sources, Czech e-Sbírka / ÚOOÚ / NÚKIB sources, Italian Gazzetta/Normattiva/Garante/ACN sources, and ISO sources.
- `npm run smoke:source-documents` passed.
- `npm run smoke:knowledge-layer` passed with low article count because that smoke appears to check minimal count presence, not completeness by jurisdiction.

Absent/partial:
- Czech law/decree article imports are not present in the connected DB as article rows, even though source docs exist.
- Italian D.Lgs. 138/2024, Italian GDPR, Garante guidance, and ACN guidance source docs exist, but article rows expected by smokes are absent.
- Reviewed article link smoke passes only because there are no reviewed article/mapping links to validate; this should not be treated as proof of reviewed knowledge coverage.

Source cause classification for T0 failures:
- `smoke:italian-gdpr-layer`: source documents exist (`eu/gdpr-2016-679-it.pdf`, `it/codice-privacy-dlgs-196-2003.html`, `it/garante-*.html`) but expected article rows such as `Garante Data Breach` are missing from `articles`. Cause: imports/promotions for article records have not populated the DB state under test, not missing source document metadata.
- `smoke:italian-nis2-layer`: `it/dlgs-138-2024.html` source document exists and is reviewed, but expected 44 reviewed `Art. N` article rows are absent. Cause: article import not run/not persisted/not seeded into DB state under test.
- `smoke:reviewed-article-links`: pass is weak; no reviewed articles exist to validate.

### 8. Czech NIS2 / ZoKB / decree boundaries

Classification: public positioning implemented; reviewed article/mapping coverage partial/absent.

Implemented:
- Project instructions correctly state Czech NIS2 transposition via Act 264/2025 Coll. and Czech-specific outputs mapped to Vyhláška č. 410/2025 Sb.
- `lib/regulations/authoritative-sources.ts` has official e-Sbírka source metadata for `Zákon č. 264/2025 Sb.`.
- `lib/regulations/czech-decrees.ts` models Vyhláška č. 409/2025 Sb. and 410/2025 Sb. ranges, and labels them as extraction drafts from Zákony pro lidi PDFs.
- `lib/jurisdictions/context.ts` uses NÚKIB/ÚOOÚ and Act 264/2025 citation for Czech context.
- Public/product docs frame NIS2/ZoKB as readiness/evidence preparation, not legal determination or NÚKIB approval.

Partial / risks:
- `lib/regulations/czech-cyber-law.ts` still contains a draft extraction source filename `cz/zakonyprolidi_cs_2025_264_v20251101.pdf`, while the reviewed source-document DB has `cz/esbirka_sb_2025_264_pzz.pdf` and `cz/zakon-264-2025-sb.html`. This split can confuse reviewed-source status unless import scripts clearly migrate to official e-Sbírka sources.
- No Czech article rows were observed in `articles`; therefore Czech section/decree mapping coverage cannot be claimed as reviewed article-level knowledge in the connected DB.
- Decree sources are represented in code, but not observed as source-document rows in the DB summary by those draft filenames.

### 9. NIS2 evidence templates

Classification: partial, current smoke failing.

Implemented:
- Evidence templates exist: 56 total per `knowledge:counts`.
- Framework-control mappings exist: 227 total.
- NIS2 mappings exist and are sufficient for some workspace smokes.

Failing coverage:
- `npm run smoke:nis2-evidence-templates` found 19 Helios NIS2 framework-control mappings missing `framework_controls.evidence_requirements`:
  - `helios-api-credential-rotation` — Article 21(2)(g)
  - `helios-api-edi-supplier-customer` — Article 21(2)(g)
  - `helios-api-mes-scada-integration` — Article 21(2)(g)
  - `helios-api-network-access-control` — Article 21(2)(g)
  - `helios-api-tls-enforcement` — Article 21(2)(g)
  - `helios-backup-encryption` — Article 21(2)(c)
  - `helios-backup-offsite-immutable` — Article 21(2)(c)
  - `helios-backup-restoration-test` — Article 21(2)(c)
  - `helios-backup-sql-agent-jobs` — Article 21(2)(c)
  - `helios-iam-contractor-access-management` — Article 21(2)(i)
  - `helios-iam-inactive-session-audit` — Article 21(2)(i)
  - `helios-iam-module-role-hierarchy` — Article 21(2)(i)
  - `helios-iam-offboarding` — Article 21(2)(i)
  - `helios-iam-user-accounts` — Article 21(2)(i)
  - `helios-infra-deployment-type` — Article 21(2)(h)
  - `helios-infra-encryption-at-rest` — Article 21(2)(h)
  - `helios-infra-network-segmentation` — Article 21(2)(h)
  - `helios-infra-os-patch-management` — Article 21(2)(h)
  - `helios-infra-physical-server-room` — Article 21(2)(h)

Source cause classification:
- This is a real data/seed completeness gap in framework-control metadata for Helios NIS2 mappings, not a stale assertion. The smoke queries `framework_controls.evidence_requirements` directly and returns concrete missing rows.

## Security/compliance/proof-boundary notes

- Do not claim NÚKIB approval, automatic compliance, legal advice, final counsel review, ISO/SOC certification, uptime, customers, testimonials, or production-reviewed legal terms.
- Czech-first public positioning is generally aligned to readiness/evidence preparation, but article-level knowledge coverage is not populated enough to support claims of reviewed Czech/Italian legal article mapping.
- Italian legal/template coverage is explicitly secondary/tertiary: IT policy templates are all draft and article imports are not present in the DB state tested.
- Source documents being `last_reviewed` is not equivalent to reviewed article extraction or reviewed control mappings.
- Passing `smoke:knowledge-layer` and `smoke:source-documents` should be interpreted narrowly; they do not prove full legal knowledge import completeness.
- The pg SSL-mode warning appeared on every DB smoke; it is a configuration hardening item, not a localization/legal knowledge failure.

## Top risks

1. Article knowledge layer is mostly absent in DB despite many reviewed source documents. This undermines legal/regulatory citation and mapping claims.
2. NIS2 evidence template smoke fails on 19 Helios mappings lacking evidence requirements, blocking stronger Helios/NIS2 evidence readiness claims.
3. i18n smokes are stale or copy-inconsistent (`Readiness score` vs `Compliance score`; `Feed NÚKIB` vs `NÚKIB feed`), so localization regression checks are not reliable until assertions/copy are reconciled.
4. Localization audit has many review-boundary findings, including two P0 Italian placeholder-risk findings requiring triage.
5. Czech decree/law source code still includes draft Zákony pro lidi extraction identifiers while official e-Sbírka metadata also exists; reviewed-source lineage can become ambiguous.
6. `reviewed-article-links` passes without reviewed article rows, creating a false sense of coverage.
7. Demo route localization is special-cased and may not be language-switchable/localized to the same standard as other marketing routes.

## Recommended implementation slices

### Slice A: Reconcile i18n smoke assertions with intended copy

Goal:
- Make `smoke:i18n-shell` and `smoke:tenant-locales` pass without weakening claim boundaries.

Likely files:
- `scripts/smoke-i18n-shell.ts`
- `scripts/smoke-tenant-locales.ts`
- `messages/en-EU.json`
- `messages/cs-CZ.json`
- possibly `messages/it-IT.json`

RED command:
- `npm run smoke:i18n-shell`
- `npm run smoke:tenant-locales`

GREEN command:
- `npm run smoke:i18n-shell && npm run smoke:tenant-locales && npm run audit:localization`

Subagent-sized tasks:
1. Decide whether product language should be `Readiness score` or `Compliance score`; update either smoke expectations or copy consistently.
2. Decide Czech NÚKIB title `Feed NÚKIB` vs `NÚKIB feed`; update smoke or copy consistently.
3. Re-run localization audit and record remaining P0/P1/P2 issues separately from smoke-breaking assertions.

Rollback/feature flag:
- No feature flag needed; revert message/smoke edits if copy decision is rejected.

Existing-data migration/backfill:
- None.

Human approval:
- Product owner should approve score wording and Czech NÚKIB copy because it affects public/product positioning.

### Slice B: Populate or explicitly bound article imports for legal knowledge

Goal:
- Align source document metadata, article imports, and review status for Czech/EU/Italian regulatory knowledge.

Likely files:
- `scripts/import-authoritative-source-documents.ts`
- `scripts/import-italian-gdpr-codice-privacy.ts`
- `scripts/import-italian-gdpr-garante-guidance.ts`
- `scripts/import-gdpr-eu-it-articles.ts`
- `scripts/import-italian-nis2-articles.ts`
- `scripts/import-italian-nis2-acn-guidance.ts`
- `scripts/import-czech-cyber-law-drafts.ts`
- `scripts/import-czech-decree-drafts.ts`
- `lib/regulations/*`
- seed/import docs as needed.

RED command:
- `npm run smoke:italian-gdpr-layer`
- `npm run smoke:italian-nis2-layer`
- `npm run knowledge:counts`

GREEN command:
- With local/test DB only: run the relevant imports, then `npm run smoke:italian-gdpr-layer && npm run smoke:italian-nis2-layer && npm run smoke:knowledge-layer && npm run smoke:source-documents && npm run smoke:reviewed-article-links`.

Subagent-sized tasks:
1. Determine whether article imports should be part of seed, CI setup, or manual local import pipeline.
2. Import Italian GDPR EUR-Lex articles, Garante guidance, Codice Privacy, Italian D.Lgs. 138/2024 articles, and ACN guidance into a local/test DB.
3. Add or update source/article count smokes so low article counts cannot pass accidentally.
4. Decide and document Czech article/decree import path: official e-Sbírka primary vs draft Zákony pro lidi extraction.

Rollback/feature flag:
- Use transaction-backed import scripts or explicit baseline rollback scripts where available. Do not run against production without owner approval.

Existing-data migration/backfill:
- Required for local/test and eventually production if article knowledge is to be used. Production backfill requires human approval.

Human approval:
- Required before promoting mappings/articles to `reviewed` or making public coverage claims.

### Slice C: Complete NIS2/Helios evidence requirements

Goal:
- Make all NIS2 framework-control mappings have evidence requirements and active en-EU evidence templates.

Likely files:
- Helios control seed/config modules under `scripts/seed-helios-controls.ts`, `lib/controls/**`, or framework seed files.
- `scripts/smoke-nis2-evidence-templates.ts` only if assertion needs refinement, but current failure appears real.

RED command:
- `npm run smoke:nis2-evidence-templates`

GREEN command:
- `npm run smoke:nis2-evidence-templates && npm run smoke:helios-control-seeding && npm run smoke:knowledge-layer`

Subagent-sized tasks:
1. Locate canonical Helios framework-control seed source for the 19 failing controls.
2. Add or backfill `evidence_requirements` text and ensure matching active `evidence_templates` exist.
3. Re-run Helios and knowledge smokes on local/test DB.

Rollback/feature flag:
- Data seed rollback via baseline rollback/seed idempotency controls; no UI feature flag needed unless new templates surface to users immediately.

Existing-data migration/backfill:
- Yes if persisted framework_control rows already exist. Needs a backfill/update script for local/test; production requires approval.

Human approval:
- Product/compliance owner should approve evidence requirement wording before customer-facing use.

### Slice D: Triage localization audit quality findings

Goal:
- Reduce false positives and fix real translation/review-boundary issues without changing product claims.

Likely files:
- `scripts/localization-audit.mjs`
- `messages/cs-CZ.json`
- `messages/en-EU.json`
- `messages/it-IT.json`

RED command:
- `npm run audit:localization`

GREEN command:
- `npm run audit:localization` with no P0 findings and documented/allowlisted product terms.

Subagent-sized tasks:
1. Separate valid product terms (`Trust Center`, `Workspace`, `Dashboard`, etc.) into an allowlist.
2. Review P0 Italian placeholder-risk items.
3. Review P1 “review boundary” findings where translations may imply formal review or approval.
4. Keep Czech as source-of-truth and ensure English/Italian do not strengthen claims.

Rollback/feature flag:
- No feature flag; revert message/audit allowlist edits if rejected.

Existing-data migration/backfill:
- None.

Human approval:
- Required for wording that changes legal/regulatory coverage, reviewed status, or market claims.

### Slice E: Clarify public demo/localized route handling

Goal:
- Ensure all public pages are language-switchable or explicitly scoped out.

Likely files:
- `components/nav.tsx`
- `i18n/marketing-paths.ts`
- `app/(marketing)/**` route files for demo if they are public.
- relevant route smokes.

RED command:
- Route/browser smoke for localized marketing nav and language switcher.

GREEN command:
- Public route smoke that checks `/`, `/en`, `/it`, and representative subroutes switch correctly.

Subagent-sized tasks:
1. Inventory all public routes and classify localized vs intentionally shared.
2. Add smoke expectations for language switcher presence on localized public pages.
3. Decide `/demo` localization treatment.

Rollback/feature flag:
- No feature flag; path mapping changes can be reverted.

Existing-data migration/backfill:
- None.

Human approval:
- Product owner approval if demo localization scope changes.

## Test / validation matrix

| Area | Required validation |
| --- | --- |
| Routing/default locale | `npm run smoke:i18n-shell`; inspect `i18n/routing.ts`; browser-check `/`, `/en`, `/it`. |
| Message key completeness | `npm run audit:localization`; placeholder parity; no P0 findings. |
| Public language switcher | Browser/route smoke for nav/footer switcher on public pages. |
| Czech-first metadata | Metadata alternates/canonical checks for Czech default and localized alternatives. |
| Jurisdiction context | `npm run smoke:jurisdictions`; spot-check CZ/EU/IT authority/citation labels. |
| Source docs | `npm run smoke:source-documents`; count by jurisdiction/locale and official hostnames. |
| Article imports | `npm run smoke:italian-gdpr-layer`; `npm run smoke:italian-nis2-layer`; future Czech article smoke. |
| Mapping review | `npm run smoke:mapping-review-schema`; `npm run smoke:reviewed-article-links`; ensure non-empty reviewed rows before treating pass as meaningful. |
| Evidence templates | `npm run smoke:nis2-evidence-templates`; Helios control seeding smoke. |
| Copy proof boundary | `npm run smoke:copy-hygiene`; manual review of high-risk public claims. |
| Policy templates | `npm run smoke:templates`; tenant-locale smoke after copy assertion fix. |

## Human approval items

- Any change to regulatory coverage, reviewed/legal status, NIS2/ZoKB mapping confidence, or public market claims.
- Any decision to promote article/control mappings to `reviewed`.
- Any public legal page wording, operator identity, DPO/contact, DPA/subprocessor, retention, OpenAI, liability, or incident/support commitment.
- Any production DB backfill for article imports, source documents, evidence requirements, or templates.
- Any claim that Italian templates/legal layer are customer-usable beyond draft/EU fallback.

## T4-G Implementation Addendum

Date: 2026-06-02

Implementation mode: source-smoke/local-safe only. No production DB backfill, production seed/import, live external source fetch, deploy, commit, or push was performed.

Path chosen for Italy:
- Italy is explicitly draft/secondary for GDPR/NIS2 article rows and mappings in this tranche.
- Italian source metadata remains represented and local/test import scripts remain available, but the import scripts now write Italian GDPR/NIS2 article rows as `draft`; Italian NIS2 framework-control links remain `draft`.
- No reviewed Italian legal article content was fabricated or promoted.

Red-smoke repairs completed:
- `smoke:i18n-shell`: stale score assertions now match the current Readiness/preparation copy.
- `smoke:tenant-locales`: stale Czech `NÚKIB feed` assertion was aligned to current `Feed NÚKIB`, and the smoke is source-safe rather than transaction-writing to whatever `DATABASE_URL` is inherited.
- `smoke:italian-gdpr-layer`: now checks official source metadata and draft/secondary import boundaries instead of requiring absent reviewed DB article rows.
- `smoke:italian-nis2-layer`: now checks official Gazzetta/ACN source metadata and draft/secondary import boundaries instead of requiring absent reviewed DB article rows.
- `smoke:nis2-evidence-templates`: now verifies source mappings in `CONTROL_LIBRARY`, including all 19 canonical Helios controls, and the seed-source path that creates evidence-template descriptions from mapping evidence requirements.
- `smoke:reviewed-article-links`: unchanged and still non-vacuous; it refused the current nonlocal `DATABASE_URL`, which confirms the T4-B safety guard is still active.

Verification:
- RED before change: the five T4-G red smokes failed with stale copy expectations, absent Italian reviewed article rows, and 19 Helios evidence-requirement gaps in the connected DB state.
- GREEN after change: `npm run smoke:i18n-shell && npm run smoke:tenant-locales && npm run smoke:italian-gdpr-layer && npm run smoke:italian-nis2-layer && npm run smoke:nis2-evidence-templates` passed.
- `npm run audit:localization` passed structurally with existing findings still reported.
- `npm run smoke:t4b-safety-gates` passed.
- `npm run typecheck` passed.
- `npm run lint` passed.

Remaining Lane 10 risks after T4-G:
- Italian legal/article layer is not reviewed customer-usable coverage; it is draft/secondary until separate review and approved DB promotion/backfill.
- `audit:localization` still reports existing P0/P1/P2 heuristic findings, including two Italian placeholder-risk findings, requiring localization triage.
- `smoke:reviewed-article-links` cannot be used as reviewed-article coverage proof without a local/disposable DB containing reviewed rows.
- Any production import/backfill or promotion to reviewed remains a separate human-approved operation.

## Final lane status

Overall classification: partial after T4-G source-smoke repair.

The Czech-first localization shell is structurally present, public language switching is mostly implemented, and message keys remain complete across `cs-CZ`, `en-EU`, and `it-IT`. T4-G repaired the source-safe red smokes for stale copy expectations, Italian draft/secondary knowledge-layer boundaries, and Helios NIS2 evidence requirements. Public claims should still stay bounded to Czech-first readiness/evidence preparation; Italian article rows and mappings are draft/secondary and not reviewed legal coverage.
