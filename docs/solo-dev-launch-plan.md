# Splnit.eu Solo Dev Launch Plan

Owner: [Your Name], OSVČ, IČO [your number], Olomouc  
Product: splnit.eu - EU compliance automation for NIS2, GDPR, and ISO 27001  
Status: Pre-launch, no verified customers, solo developer  
Strategic decision: Path A - pivot to English and Italian markets; Czech becomes secondary  
Last updated: 2026-05-05

## Phase 0 - Honesty Pass

Timeline: Week 0, roughly 2-3 evenings  
Goal: the site stops claiming things that are not true before any Italian-market work begins.

### 0.1 Remove Fake Social Proof

- [ ] Delete the current `/zakaznici` page content: quotes, before/after case studies, customer names, percentages, and made-up outcomes.
- [ ] Replace `/zakaznici` with the design-partner page from section 0.2, or redirect it to `/early-access`.
- [ ] Remove from the homepage: "Stovky českých firem", any logo wall, "ISO 27001 za 3 týdny", and "NIS2 za jeden víkend".
- [ ] Remove from `/cenik`: the savings calculator and any made-up savings numbers such as "282 tis. Kč ušetřeno".
- [ ] Search the codebase for `Acme`, `FinEdge`, `TechBrno`, `DataFlow`, `Jan K.`, `Petra M.`, `Tomáš V.`, `Marek S.`, `Lucie H.`, and `Petr V.`. Delete every unsupported customer, testimonial, or metric reference.

### 0.2 Publish the Design-Partner Page

Create `/early-access` or rewrite `/zakaznici` around this honest offer:

```markdown
# Hledáme prvních 10 design partnerů
# Looking for our first 10 design partners

Splnit.eu is in early access. I'm building it as a solo developer
in Olomouc and looking for 10 companies who want to shape the
product before public launch.

What you get:
- 12 months free on the Business plan
- 3-week guided onboarding directly with me
- Features built around your sector
- Direct line to the founder

What I ask:
- Real use on your NIS2 or GDPR project
- 30 minutes weekly feedback during onboarding
- Permission to use your name as a reference - only if you're happy

Currently signed: [X] / 10
```

### 0.3 Fix Every Legal Entity Reference

Search and replace across the codebase and any CMS content:

- [ ] `Splnit Technology s.r.o.` -> `[Your Name], OSVČ`
- [ ] Footer: replace with the real OSVČ block below.
- [ ] Privacy policy: rewrite the controller block with real OSVČ details.
- [ ] Terms and conditions: rewrite party identification.
- [ ] DPA: rewrite processor identification.
- [ ] Cookie policy: use the same entity details.
- [ ] Meta tags and schema.org structured data: remove all non-existent company references.

Footer block:

```text
Splnit.eu - provozuje [Your Name], OSVČ
IČO: [your number] . ARES: [direct ARES URL]
[Registered address], Olomouc
hello@splnit.eu
```

### 0.4 Soften Unsupported Claims

| Delete | Replace with |
| --- | --- |
| "Splňte EU předpisy. Automaticky." | "Připravte se na audit s automatizovanou compliance platformou." |
| "ISO 27001 za 3 týdny" | "Zkraťte přípravu na ISO 27001 audit." |
| "NIS2 za jeden víkend" | "Zjistěte za 10 minut, jestli a jak vás NIS2 ovlivňuje." |
| "Stovky českých firem" | "Hledáme prvních 10 design partnerů." |
| "200+ automatických testů" | "Automatické kontroly napojené na Microsoft 365, AWS a GitHub." |

### 0.5 Add a Real About Page

- [ ] Add `/about` or `/o-nas`.
- [ ] Use a real founder bio, real photo, and real OSVČ details.
- [ ] State clearly what is real today and what is not ready yet.
- [ ] Include the founder contact route and the ARES link once final legal details are available.

### 0.6 Legal Review - First Pass

Before anything goes live:

- [ ] Confirm whether spouse review of commercial docs is permitted under court ethics rules.
- [ ] Review privacy policy: UOOU requirements, controller identification, and electronic acceptance validity.
- [ ] Review terms: consumer protection, jurisdiction, and limitation of liability.
- [ ] Review DPA: processor obligations, subprocessors, and breach notification language.
- [ ] If spouse review is not appropriate, get a fixed-fee review from Czech tech counsel before public launch.

### Phase 0 Acceptance Criteria

- [ ] No `Splnit Technology s.r.o.` anywhere in the codebase or live site.
- [ ] No fake testimonials, customers, logos, or metrics on any page.
- [ ] Legal docs reviewed and updated for OSVČ status.
- [ ] `/about` or `/o-nas` exists with real founder information.
- [ ] `/early-access` exists or `/zakaznici` has been replaced with the design-partner page.
- [ ] Build passes, deploy succeeds, and the site loads correctly.

### Phase 0 Verification - 2026-05-04

Code honesty cleanup is complete:

- `/zakaznici` redirects to `/early-access`.
- Public pages no longer include fake customer names, logo walls, testimonials, or unsupported savings claims.
- The homepage presents early access and `0 / 10` design partners instead of fabricated proof.
- Targeted scans of `app`, `components`, `lib`, `messages`, and `public` found no unsupported references to `Splnit Technology s.r.o.`, fake customer names, or the old inflated launch claims.
- Trust Center demo uptime no longer displays a fabricated percentage.

Still launch-blocking and requiring owner input:

- Final OSVČ identity details: legal name, IČO, ARES URL, and registered address.
- Legal review of privacy policy, terms, DPA, and cookie policy.
- Real founder photo and final founder bio for `/about`.
- Production deploy verification after the final identity/legal pass.

## Non-Negotiable Guardrails

- Never fabricate customers, testimonials, logos, advisor names, or metrics.
- Never reference `Splnit Technology s.r.o.` anywhere unless and until that legal entity actually exists.
- Never promise founder-led onboarding beyond what can be delivered: first 10 only, maximum 5 simultaneous.
- Never send Czech outreach to a buyer who cannot receive fluent Czech follow-up from the business.
- Never claim coverage for a regulation whose controls are not in the knowledge base.
- Never ship customer-facing legal templates with the wrong legal entity.

## Honest Operating Context

- This is a solo-developer business, not a compliance consultancy.
- The current legal operating form is OSVČ with an IČO, not an s.r.o.
- The founder's strongest languages are English and Italian; Czech is basic.
- The current Czech-first positioning is structurally weak without fluent Czech sales and compliance support.
- The real edge is developer-led EU compliance automation plus unscalable founder work for the first 10 customers.
- Italy is the primary beachhead, English-EU is secondary, and Czech is tertiary through partners.

## 12-Week Roadmap

| Phase | Weeks | Focus | Outcome |
| --- | --- | --- | --- |
| 0 | Week 0 | Honesty pass | Site is true, even if smaller |
| 1 | Weeks 1-2 | KB refactor stages 1-2 | Jurisdiction-aware schema |
| 2 | Weeks 3-4 | KB refactor stages 3-4 plus i18n shell | Multi-locale capable |
| 3 | Weeks 5-8 | Italian content production | Real Italian KB |
| 4 | Weeks 9-10 | Italian site plus advisor outreach | Outreach-ready |
| 5 | Weeks 11-12 | First 50 Italian emails | Validated demand signal |

## Knowledge Integration Architecture - 2026-05-05 Alignment

The product has three different knowledge problems. Do not solve them with one architecture:

1. Customer-facing AI features: AI Questionnaire, regulation explainer, and gap analysis.
2. Internal product intelligence: how controls map to NIS2, GDPR, ISO 27001, AI Act, and local laws.
3. Trust signal generation: how integration runs become auditor-ready evidence with citations.

Decision: build these as three layers, in order. The static mapping layer is the product source of truth. AI can summarize and draft, but it must not invent controls, legal articles, evidence, customers, certifications, or legal conclusions.

### Current Repo State vs Target

Aligned and already present:

- `controls`, `frameworks`, `framework_controls`, `tests`, `source_documents`, `evidence`, `integration_runs`, `org_control_statuses`, and Trust Center visibility settings exist in Drizzle/Postgres.
- `framework_controls` already carries `articleRef`, regulator guidance, evidence requirements, localized title, and localized description.
- Current local database seed contains `92` canonical controls, `184` framework-control mappings, `36` source documents, `86` article rows, `434` framework-control article links, `34` evidence templates, and `16` integration test definitions across Microsoft 365, GitHub, and AWS.
- Official-source verification now uses the EUR-Lex CELEX-backed NIS2 PDF source row for EU Article 21/23 and e-Sbírka PZZ PDFs for Czech 264/2025, 409/2025, and 410/2025 imported sections.
- EU Article 21/23 rows and direct NIS2 framework-control links are promoted to reviewed.
- Czech e-Sbírka article rows are promoted to reviewed source text, but Czech control-to-article mappings remain `confidence='draft'` until compliance/legal mapping review.
- Integration runs update organisation control status, and the evidence table can store manual uploads and automated snapshots.
- Questionnaire AI exists behind a provider boundary, with Anthropic as the only implemented provider today. Provider calls require `QUESTIONNAIRE_AI_ENABLED=true` in addition to credentials. It is grounded in organisation controls, evidence, policies, and reviewed legal citations, and stores generated outputs as generated artifacts with audit-log entries.

Not aligned yet:

- The original Zákony pro lidi extraction rows remain draft and must stay draft; they are extraction aids, not official source rows.
- Czech control-to-article mappings are not reviewed yet, so they must not be used as auditor-ready reviewed citations.
- There is no pgvector/RAG layer. This is intentional for now.
- The product must not publicly claim `247 controls` until the database actually contains 247 reviewed controls and the copy hygiene guard allows that claim. Current factual count is `92` seeded canonical controls.

### Layer 1 - Static Mapping Layer

Status: partially built. This is the next foundation to harden before more AI work.

Add `articles`:

```typescript
export const articles = pgTable("articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceDocumentId: uuid("source_document_id").references(() => sourceDocuments.id),
  frameworkId: uuid("framework_id").references(() => frameworks.id),
  jurisdiction: text("jurisdiction").notNull(),
  locale: text("locale").notNull(),
  articleKey: text("article_key").notNull(),
  title: text("title"),
  officialText: text("official_text").notNull(),
  citation: text("citation").notNull(),
  effectiveDate: timestamp("effective_date", { withTimezone: true }),
  lastReviewed: timestamp("last_reviewed", { withTimezone: true }),
  reviewStatus: text("review_status").notNull().default("draft"),
});
```

Add a mapping table rather than overloading `framework_controls.articleRef`:

```typescript
export const frameworkControlArticles = pgTable(
  "framework_control_articles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    frameworkControlId: uuid("framework_control_id").notNull().references(() => frameworkControls.id),
    articleId: uuid("article_id").notNull().references(() => articles.id),
    citationNote: text("citation_note"),
    confidence: text("confidence").notNull().default("reviewed"),
  },
  (table) => [unique().on(table.frameworkControlId, table.articleId)],
);
```

Add evidence templates:

```typescript
export const evidenceTemplates = pgTable("evidence_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  controlId: uuid("control_id").references(() => controls.id),
  frameworkControlId: uuid("framework_control_id").references(() => frameworkControls.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  evidenceType: text("evidence_type").notNull(),
  exampleFields: jsonb("example_fields").$type<Record<string, unknown>>().default({}),
  locale: text("locale").notNull().default("en-EU"),
});
```

Layer 1 next tasks:

- [x] Create `docs/architecture/knowledge-integration.md` with this three-layer decision.
- [x] Add Drizzle schema and migration for `articles`, `framework_control_articles`, and `evidence_templates`.
- [x] Seed NIS2 EU directive and Czech law/decree article rows from official sources.
- [x] Keep extraction PDFs as drafting support only; original extraction rows remain draft.
- [ ] Review Czech framework-control-to-article mappings before promoting their `confidence` to `reviewed`.
- [x] Link existing NIS2 framework-control rows to reviewed EU article rows.
- [x] Add smoke tests that fail when a reviewed framework control has no linked official article.
- [x] Add seed/report script that prints real counts for controls, mappings, articles, source documents, evidence templates, and tests.

Layer 1 foundation verification - 2026-05-05:

- [x] Added `docs/architecture/knowledge-integration.md`.
- [x] Added Drizzle schema and migration for `articles`, `framework_control_articles`, and `evidence_templates`.
- [x] Applied migration `0010_familiar_stepford_cuckoos` to local Postgres `splnit_eu_dev`.
- [x] Added `knowledge:counts` and `smoke:knowledge-layer`.
- [x] Local count report verified `92` controls, `184` framework-control mappings, `29` source documents, `16` integration tests, and intentionally `0` articles/evidence templates before reviewed legal content is seeded.

Layer 1 official source ingestion slice - 2026-05-05:

- [x] Added the official NIS2 EU source document for `Directive (EU) 2022/2555, CELEX 32022L2555`.
- [x] Added `knowledge:import:nis2-eu` to read the canonical EUR-Lex PDF source or a local `--file` copy and import Article 21 and Article 23.
- [x] Imported `2` draft NIS2 EU article rows into local Postgres: Article 21 and Article 23.
- [x] Linked `34` existing NIS2 framework-control rows to those draft article rows.
- [x] Parser sanity check confirmed Article 21 extraction does not include Article 22.
- [x] Added `smoke:reviewed-article-links`; it passes while rows are draft and will fail once reviewed article rows exist without matching framework-control links.
- [x] Added idempotent `evidence_templates` seeding for mappings that explicitly define `evidenceRequirements`.
- [x] Added NIS2 evidence requirements for all `34` NIS2 framework-control mappings and seeded `34` evidence templates.
- [x] Added `smoke:nis2-evidence-templates` so NIS2 mappings fail verification if evidence requirements or active evidence templates are missing.
- [x] Local count report now verifies `92` controls, `184` framework-control mappings, `33` source documents, `44` articles, `234` framework-control article mappings, `34` evidence templates, and `16` integration tests.
- [x] Added `knowledge:verify:official-sources` to compare imported legal text against official EUR-Lex and e-Sbírka sources without database writes.
- [x] Added `knowledge:promote:official-sources` to verify and promote reviewed official-source article rows.
- [x] Promoted `2` NIS2 EU article rows and `34` direct EU framework-control article links to reviewed.
- [x] Migrated NIS2 EU Article 21/23 provenance from the legacy OP/EU XHTML helper row to the canonical EUR-Lex CELEX PDF source row; the legacy OP/EU rows now remain draft and unlinked.
- [x] Added `knowledge:import:czech-cyber-law` and imported draft Czech law rows for `Zákon č. 264/2025 Sb.` sections § 12-§ 16 from the provided extraction PDF.
- [x] Linked `68` NIS2 framework-control mappings to draft Czech transposition sections.
- [x] Verified those `5` Czech law sections against official e-Sbírka PZZ PDF and inserted reviewed official e-Sbírka article rows.
- [x] The original Zákony pro lidi law rows stay draft and are still guarded by `smoke:draft-extraction-sources`.
- [x] Added `knowledge:import:czech-decrees` and imported `37` draft section rows for Vyhláška 409/2025 Sb. and Vyhláška 410/2025 Sb.
- [x] Linked `132` NIS2 framework-control mappings to draft Czech implementing decree sections.
- [x] Verified `25` Vyhláška 409/2025 Sb. sections and `12` Vyhláška 410/2025 Sb. sections against official e-Sbírka PZZ PDFs and inserted reviewed official e-Sbírka article rows.
- [x] Added `lib/regulations/authoritative-sources.ts` as the canonical source registry for EUR-Lex EN/IT/CS PDFs, Italian and Czech official national references, and ISO Store references.
- [x] Added `knowledge:import:authoritative-sources` and expanded `smoke:source-documents` so source rows must use official hostnames only.
- [x] Czech framework-control article links copied to the official e-Sbírka rows remain `confidence='draft'` pending compliance/legal mapping review.
- [x] Added `smoke:draft-extraction-sources` so Zákony pro lidi extraction rows fail verification if marked `reviewed`.

Layer 1 trust signal generation slice - 2026-05-05:

- [x] Added automated evidence snapshot creation for integration runs.
- [x] Evidence is created conservatively: first automated result, status change, or one refresh per 24 hours.
- [x] Integration-run summaries now report how many evidence records were created.
- [x] Added `smoke:integration-evidence-policy` to guard the evidence cadence.
- [x] Automated evidence snapshots now include reviewed source/article citations when reviewed mappings exist.
- [x] Snapshots with no reviewed article support now store `citationStatus='no_reviewed_citations'` instead of implying legal support.
- [x] Automated evidence citation lookup now requires both reviewed article source text and reviewed mapping confidence.
- [x] Added `smoke:automated-evidence-citations` so stored automated snapshots fail verification if they include draft citations, draft mapping confidence, or lack citation status.
- [x] Questionnaire AI context now includes only reviewed legal citations from Layer 1 for the tenant's supported controls.
- [x] Generated questionnaire answers now expose `legalRefs` and strip any evidence, policy, or legal reference not present in the supplied context.
- [x] Added `smoke:questionnaire-citations` so draft or invented questionnaire citation references are rejected before export/display.
- [x] Questionnaire AI now returns a conservative localized fallback without calling the model when the workspace has no controls, evidence, policies, or reviewed legal citations.
- [x] Questionnaire AI now uses a provider boundary (`QUESTIONNAIRE_AI_PROVIDER`, default `anthropic`) so app pages/actions do not import Anthropic-specific code.
- [x] Questionnaire AI provider calls now require the explicit `QUESTIONNAIRE_AI_ENABLED=true` gate so credentials alone do not send customer content to a provider.
- [x] Questionnaire AI now persists generated answer sets as `generated_artifacts` rows and returns the saved artifact ID to the UI/export payload.
- [x] Gap report generation now also writes a `generated_artifacts` row linked to the private PDF blob and framework metadata.
- [x] Generated artifacts now create audit-log records without duplicating generated content or private blob URLs into audit metadata.
- [ ] Czech mappings still need compliance/legal review before they can become reviewed auditor-ready citations.

### Layer 2 - RAG Knowledge Layer

Status: explicitly deferred.

Do not build pgvector/RAG until one of these is true:

- 50+ paying customers create enough questionnaire volume to justify retrieval infrastructure.
- The reviewed source corpus no longer fits in prompt context for a scoped framework query.
- Customer-uploaded policies need per-organisation semantic retrieval.
- There are 1000+ controls or 10+ active frameworks.

When this starts, use Postgres/Neon with pgvector first unless there is a measured reason to add another vector database. Store citation metadata on every chunk. Regulations should chunk by article, methodologies by section, and controls/evidence templates as one chunk each.

Embedding/provider note: OpenAI `text-embedding-3-small` remains a plausible low-cost default according to current OpenAI docs, but model and pricing must be re-verified immediately before implementation.

### Layer 3 - AI Generation Layer

Status: Questionnaire AI is citation-guarded for the current feature, but broader AI features are not built yet.

Short-term decision: keep the simple Layer-1 retrieval path before custom RAG. Customer-facing AI should receive only scoped, structured context from Postgres: active controls, reviewed articles, evidence records, policies, and source citations.

Required before expanding AI features:

- [x] Add provider abstraction so Questionnaire AI is not hardwired to Anthropic-specific code paths.
- [x] Add citation validation: generated questionnaire answers may cite only reviewed legal citation IDs, evidence IDs, and policy IDs provided in context.
- [x] Add refusal/fallback behavior when no supporting evidence or reviewed article exists.
- [x] Save generated questionnaire answers as linked generated artifacts.
- [x] Save gap-analysis outputs as evidence-vault records or linked generated artifacts.
- [x] Add legal disclaimer copy: generated answers are drafts for customer legal/compliance review, not legal advice or certification.
- [ ] Update subprocessors and data-processing docs before sending customer content to any new AI provider.

Model note: the earlier `gpt-4o-mini` / `gpt-4o` plan is directionally valid as a small/strong model split, and current official OpenAI model pages still list those models. Current OpenAI model docs also list newer GPT-5.x families, so the exact production model should be chosen from current docs during implementation, not hardcoded in the plan.

## Phase 1 - Jurisdiction-Aware Knowledge Base

Goal: Czech content still works, but Italy and English-EU become possible.

### 1.1 Pre-Refactor Decisions

Create `docs/architecture/jurisdiction.md` before changing schema. Answer:

1. What does it mean for a control to be active for a tenant?
2. If the same control appears in multiple active frameworks, is it displayed once or once per framework?
3. Is one evidence upload sufficient across frameworks that share the same control?
4. If an Italian tenant requests a document but only a Czech template exists, do we hard error, fall back to EU/EN, fall back to Czech with warning, or block?
5. Default jurisdiction for new tenants: ask at signup or infer from billing country?
6. Can a tenant have multiple jurisdictions?

### 1.2 Add Jurisdiction Fields

Add to `organisations`:

```typescript
country: text('country').notNull().default('CZ');
primaryJurisdiction: text('primary_jurisdiction').notNull().default('CZ');
locale: text('locale').notNull().default('cs-CZ');
```

Tasks:

- [ ] Update Drizzle schema.
- [ ] Generate and apply migration.
- [ ] Backfill existing tenants to `CZ`, `CZ`, `cs-CZ`.
- [ ] Update signup to capture country or infer it from billing.
- [ ] Expose country, primary jurisdiction, and locale in tenant settings for admins.

### 1.3 Neutralize Controls, Enrich Framework Controls

Add to `framework_controls`:

```typescript
regulatorGuidance: text('regulator_guidance');
evidenceRequirements: text('evidence_requirements');
localizedTitle: text('localized_title');
localizedDescription: text('localized_description');
```

Tasks:

- [ ] Audit `library.ts` for `NUKIB`, `CTU`, `UOOU`, `Cesky`, `cesk`, `zakon 264`, and `vyhlaska`.
- [ ] Rewrite canonical `controls` content as jurisdiction-neutral English.
- [ ] Move Czech regulator-specific text into the Czech `framework_controls` row.
- [ ] Keep inherently Czech-only controls scoped to `NIS2-CZ`.
- [ ] Confirm no regulator-specific names remain in canonical `controls`.

### 1.4 Add Source Documents

Create a `source_documents` table:

```typescript
export const sourceDocuments = pgTable('source_documents', {
  id: uuid('id').primaryKey(),
  jurisdiction: text('jurisdiction').notNull(),
  locale: text('locale').notNull(),
  title: text('title').notNull(),
  citation: text('citation').notNull(),
  url: text('url'),
  filename: text('filename'),
  effectiveDate: timestamp('effective_date'),
  lastReviewed: timestamp('last_reviewed'),
});
```

Tasks:

- [ ] Replace hardcoded `*-cs.pdf` references in templates with source document references.
- [ ] Populate the table with current Czech sources.
- [ ] Regression test that Czech tenants still see the same practical content.

### Phase 1 Verification - 2026-05-04

Completed and verified locally:

- `docs/architecture/jurisdiction.md` exists and records the jurisdiction decisions before further schema work.
- `organisations` has `country`, `primary_jurisdiction`, and `locale` with Czech defaults for existing tenants.
- Onboarding and organisation settings expose country, primary jurisdiction, and locale.
- `framework_controls` has regulator guidance, evidence requirements, localized title, and localized description fields.
- Canonical control content is jurisdiction-neutral; Czech regulator references are scoped to Czech framework guidance.
- `source_documents` exists and seed data now preserves each template/source document jurisdiction and locale instead of forcing everything to Czech.
- Local migration and seed ran successfully; seed verified `23` source document rows across Czech, Italian, and EU locales.
- Policy list, policy detail pages, generated policy metadata, and generated PDFs resolve source document title/citation through `source_documents` with safe template fallbacks.

Phase 1 is locally complete. Production `DATABASE_URL` was set on Vercel and the current source-ingestion scripts were applied against the production database on 2026-05-05. Before public launch, still verify public/legal identity details from Phase 0 and rerun any newer migrations or seeds added after that date.

## Phase 2 - Locale-Aware Templates and UI

Goal: templates resolve by jurisdiction and locale; UI can render Czech, English-EU, and Italian.

### 2.1 Template Refactor

Add to `templates`:

```typescript
locale: text('locale').notNull();
jurisdiction: text('jurisdiction').notNull();
templateFamily: text('template_family').notNull();
```

Tasks:

- [ ] Audit `templates.ts` for Czech-law references, including IČO, ÚOOÚ, ČTÚ, Czech legal entity labels, and Czech-only GDPR phrasing.
- [x] Replace hardcoded labels with tenant and jurisdiction placeholders.
- [x] Add a jurisdiction context provider for authority names, citation formats, and local labels.
- [x] Use a resolver that tries exact tenant jurisdiction and locale, then EU/EN, then throws a clear `TemplateNotFoundError`.

### Phase 2 Verification - 2026-05-05

Completed and verified locally:

- Policy template resolver materializes tenant and jurisdiction placeholders for legal identifier labels, authority names, and regulation citations.
- Czech templates no longer hardcode the repeated `IČO`, `ÚOOÚ`, and `ČTÚ` values directly in reusable sections; they resolve through jurisdiction context.
- Template smoke tests assert Czech exact-match resolution, English-EU exact-match resolution, Italian fallback to EU/EN, and no unresolved `{{...}}` placeholders in resolved templates.
- Copy hygiene smoke tests guard EN/IT messages and authenticated app code against Czech regulator/UI copy regressions.
- Tenant locale smoke test creates fake `CZ`, `EU`, and `IT` tenants inside a rolled-back DB transaction, verifies exact Czech and EU/EN template resolution, and verifies Italian fallback to EU/EN plus Italian source document availability.

Remaining before calling Phase 2 fully done:

- Continue translating any newly added authenticated app paths and email/error copy.
- Keep Italian legal templates out of the product until Phase 3 advisor review.

### 2.2 i18n Shell

- [x] Confirm `next-intl` setup or install it if missing.
- [x] Create locale files for `cs-CZ`, `en-EU`, and `it-IT`.
- [x] Wire SSR locale to tenant locale.
- [ ] Translate critical paths in this order: public marketing pages, signup/onboarding, dashboard navigation, document generation UI, error messages, and email templates.
- [ ] Leave admin UIs in English unless there is a direct product reason to translate them.

### 2.3 End-to-End Smoke Test

- [ ] Create a fake Italian tenant with `country='IT'`, `primaryJurisdiction='IT'`, `locale='it-IT'`.
- [ ] Verify the UI renders Italian strings or intentional placeholders.
- [ ] Verify framework lists show `NIS2-IT` or fall back gracefully.
- [ ] Verify document generation falls back to EU/EN without crashing.
- [ ] Repeat for an English-EU tenant.
- [ ] Confirm Czech tenant behavior is unchanged.

## Phase 3 - Italian Content Production

Goal: a real Italian KB credible enough for a design partner.

### 3.1 Source Ingestion

Ingest each source into `source_documents` with citation, URL, effective date, and last reviewed date:

- [x] D.Lgs. 4 settembre 2024, n. 138 from Gazzetta Ufficiale.
- [x] Current ACN determinations from acn.gov.it.
- [x] GDPR Regulation (EU) 2016/679 Italian text from EUR-Lex.
- [x] Current consolidated D.Lgs. 196/2003, Codice Privacy.
- [x] Garante guidance relevant to SMBs.

### Phase 3 Source Ingestion - 2026-05-05

Started and verified locally:

- Added ACN Determinazione n. 136117/2025 on NIS platform access and entity updates; PDF text states it applies from 2025-04-15.
- Added ACN Determinazione n. 164179/2025 on NIS baseline specifications; PDF text states it applies from 2025-04-30.
- Added ACN 164179/2025 annexes 1-4 for important/essential security measures and incident categories.
- Kept ACN Determinazione n. 38565/2024 in the source library as superseded history and marked it as replaced by 136117/2025.
- Added `smoke:source-documents` to verify required Italian NIS/GDPR/Garante source rows, canonical EUR-Lex EN/IT/CS PDF rows, official hostnames, effective dates where known, and review timestamps.
- Added `knowledge:import:italian-nis2` to import all 44 D.Lgs. 138/2024 articles from Gazzetta Ufficiale as reviewed official-source article text. Only Art. 23-25 are currently linked to controls, and those links stay draft pending mapping review.
- Added `smoke:italian-nis2-layer` to verify Italian article text is reviewed while Italian framework-control mapping links remain draft pending mapping review.
- Generated `docs/legal-reviews/nis2-it-mapping-review.md` with 34 Italian NIS2 draft mapping rows.
- Ran Stage 1 for Italian NIS2 with embeddings and Stage 2 classification for all 34 rows. Result: 1 `agent_decided` approval, 33 `needs_human`, 0 promoted mappings.
- Added and ran Stage 3 for Italian NIS2. It persisted cross-check metadata for all 34 rows and forced the single incident-notification approval back to `needs_human` because NIS2 incident/deadline mappings require human review.
- Added `agent:review:report` and generated `docs/legal-reviews/nis2-it-agent-review.md` so an Italian reviewer can see Stage 2 reasoning, Stage 3 overrides, source citations, and blank human-decision columns without database access.
- Added `agent:review:stage4` / `agent:review:promote` as the generalized promotion gate. It promotes only `agent_decided` + `approved` rows with reviewed articles, Stage 3 final status `agent_decided`, and no Stage 3 overrides.
- Added `agent:review:full` to run Stage 1 through Stage 4 in sequence while preserving dry-run-by-default behavior.
- Added `agent:review:human` so an advisor can fill `docs/legal-reviews/nis2-it-agent-review.md` and promote only explicitly `approved` mappings with a `human_approved` audit trail.
- Centralized Italian ACN/Garante source rows in `lib/regulations/authoritative-sources.ts` so `knowledge:import:authoritative-sources` can reproduce Phase 3.1 source ingestion without a full `db:seed`.
- Switched the Italian Codice Privacy source row from a Garante convenience PDF to the official Normattiva consolidated legal text, and made the importer retire the old unreferenced convenience row when present.
- Added `knowledge:import:italian-gdpr-codice` to import the official Normattiva consolidated Codice Privacy text as a reviewed Italian GDPR source-text row in `articles`.
- Added `knowledge:import:italian-nis2-acn` to import ACN Determinazioni 136117/2025 and 164179/2025 plus annexes 1-4 as reviewed regulator guidance text rows in `articles`.
- Extended `knowledge:import:italian-nis2-acn` with current ACN NIS determinations listed on the official ACN "La normativa" page: 112335/2026, 276206/2025, 127437/2026, 136118/2025, 379907/2025, 127434/2026, and 155238/2026.
- Added `knowledge:import:italian-gdpr-garante` to import official Garante guidance pages for data breach, DPIA, and registro delle attività di trattamento as reviewed Italian GDPR guidance text rows in `articles`.
- Added `smoke:italian-gdpr-layer` to verify those Garante article rows are reviewed, sourced from `www.garanteprivacy.it`, and do not create or promote any framework-control mapping links.
- Added `knowledge:import:gdpr-eu-it` to resolve the official Italian GDPR Formex manifestation from the Publications Office/CELLAR resource and import all 99 GDPR articles as reviewed Italian source text tied to the canonical EUR-Lex CELEX PDF source row. It creates no mapping links.
- Applied the current source-ingestion scripts against the Vercel production database after fixing the previously empty Production `DATABASE_URL`; after importing all Gazzetta D.Lgs. 138/2024 articles, current ACN NIS determinations, and Italian GDPR EUR-Lex articles, local and production `knowledge:counts` both report `54` source documents, `248` article rows, and `468` framework-control article links.
- Current Italian NIS2 queue status after Stage 3: 34 `needs_human`, 0 `agent_decided`, 0 promoted.

Still open before calling 3.1 complete:

- Add official ACN guidance/reading-guide documents if ACN publishes additional stable source URLs beyond the determinations already listed on the official "La normativa" page.
- Keep EU-level citation work on EUR-Lex CELEX-backed sources, national transpositions on official state journals or official consolidated law databases, regulator guidance on regulator websites, and ISO references limited to licensed/internal use without reproducing ISO control text.

### 3.2 Italian Control Mapping

For each NIS2 Article 21 measure:

- [ ] Find the Italian provision in D.Lgs. 138/2024 and relevant ACN guidance.
- [ ] Create an Italian `framework_controls` row.
- [ ] Fill `articleRef`, `regulatorGuidance`, `evidenceRequirements`, `localizedTitle`, and `localizedDescription`.
- [ ] Tag sources from `source_documents`.
- [ ] Mark uncertain mappings as `confidence: low` and queue them for advisor review.

Working method:

1. Read the source article in full.
2. Draft the mapping with AI assistance.
3. Verify every citation against the decree text.
4. Cross-check with at least one published commentary or official guidance.
5. Do not ship uncertain legal mapping as authoritative.

Progress note - 2026-05-05:

- Generated `docs/legal-reviews/nis2-it-batch-1-agent-review.md` for the first advisor pass: identity/access, incident response/logging, and backup/continuity rows.
- The batch contains 14 NIS2 IT rows, all still `needs_human`.
- Ran `agent:review:human` dry-run against the batch file; it found 0 human decisions and promoted nothing.
- Do not run `agent:review:human -- --apply` until an Italian reviewer fills the Human decision column with explicit `approved`, `wrong_article`, `too_broad`, or `needs_research` values.

### 3.3 Italian Document Templates

Produce and get advisor review for:

- [ ] Politica di sicurezza delle informazioni.
- [ ] Piano di gestione degli incidenti.
- [ ] Registro dei trattamenti.
- [ ] DPIA template.
- [ ] Accordo sul trattamento dei dati.
- [ ] Elenco dei sub-responsabili.
- [ ] Inventario degli asset.
- [ ] Valutazione del rischio.
- [ ] Politica di uso accettabile.
- [ ] Questionario per fornitori.
- [ ] Piano di continuità operativa.
- [ ] Politica di controllo degli accessi.

Each template must:

- [ ] Use Italian language written for Italian SMBs.
- [ ] Reference D.Lgs. 138/2024 and Codice Privacy correctly where relevant.
- [ ] Use abstract tenant and jurisdiction placeholders.
- [ ] Set `templateFamily` to link translated siblings.
- [ ] Pass Italian advisor review before customer use.

Progress note - 2026-05-05:

- Added review-only Italian drafts for all 12 Phase 3 template families: `security_policy`, `incident_response`, `record_of_processing`, `dpia`, `data_processing_agreement`, `subprocessor_list`, `asset_inventory`, `risk_assessment`, `acceptable_use`, `vendor_questionnaire`, `business_continuity`, and `access_control`.
- Added a policy resolver guard so customer-facing template resolution ignores `reviewStatus: "draft"` templates and Italian tenants continue to fall back to reviewed EU/EN templates.
- Added `policies:export:template-review` to generate `docs/legal-reviews/italian-policy-template-batch-1-review.md` for advisor review without database access.
- `smoke:templates` now verifies the draft guard and confirms Italian draft templates are available only through the review-export path.
- Draft-only review families are not added to the customer-facing policy generator route list.
- Do not change any Italian template to `reviewed` until an Italian advisor explicitly approves it.

### 3.4 Notification Flows

- [x] Build ACN incident notification workflow: 24-hour early warning, 72-hour notification, and 1-month report.
- [x] Build Garante breach notification workflow.
- [x] Use Italian SMB-appropriate labels.
- [ ] Verify output format with the advisor before shipping.

Progress note - 2026-05-05:

- Added jurisdiction-aware incident report profiles for cybersecurity authority and data-protection authority exports.
- Added generic export routes: `/api/incidents/[incidentId]/cybersecurity-report` and `/api/incidents/[incidentId]/data-protection-report`.
- Kept legacy Czech `/nukib-report` and `/uoou-report` routes as compatibility aliases.
- Italian cybersecurity exports now use ACN / CSIRT Italia copy with D.Lgs. 138/2024 Art. 25 and the 24h preallarme, 72h notifica, and one-month relazione finale checklist.
- Italian data-protection exports now use Garante copy with GDPR Art. 33-34 and 72-hour breach-notification checklist.
- Added `smoke:incident-notifications` to verify ACN/Garante report profiles and PDF rendering.
- Output is still a draft worksheet for internal/customer preparation; advisor review is required before claiming portal-format compatibility.

## Phase 4 - Italian Site and Advisor Readiness

Goal: marketing presence and support signals match the Italian product direction.

### 4.1 Italian Public Pages

- [x] Italian homepage.
- [x] `/chi-siamo`.
- [x] `/normative` pages for D.Lgs. 138/2024, GDPR plus Codice Privacy, ISO 27001, and EU AI Act.
- [x] `/prezzi`.
- [x] No linked coming-soon pages. If content is not ready, it is not linked.

Italian homepage structure:

```markdown
# Conformità EU automatizzata.
# NIS2 . GDPR . ISO 27001

Mappata al D.Lgs. 138/2024 per le PMI italiane.
Costruito da uno sviluppatore - non da un'agenzia.

Cerchiamo i primi 10 design partner.

[Diventa design partner ->]   [Demo (3 min)]

Senza carta di credito . Contatto diretto col fondatore . Dati nell'UE
```

### 4.2 Advisor and Trust Signals

- [ ] Sign one Italian advisor on a paid retainer, advisory equity, or paid review cadence.
- [ ] Credit the advisor publicly only with permission.
- [x] Add `/security` or `/sicurezza` with a real security posture: done vs in progress.
- [x] Publish a current subprocessor list.
- [ ] State EU data residency with the actual provider and region.
- [x] Make DPA available on request or publish it if ready.
- [x] Add a simple status page, even if static at launch.

Progress note - 2026-05-05:

- Added public `/security` and Italian-localized `/it/sicurezza` routes with honest early-access posture, done/in-progress sections, and `security@splnit.eu` / `privacy@splnit.eu` contacts.
- Added public `/status` route backed by the readiness check counts and `/api/health` link; this is explicitly not an SLA or historical uptime report.
- Updated Splnit.eu's own Trust Center document link from a missing markdown path to `/security`.
- Replaced older AWS-hosting marketing claims with the documented provider stack: Vercel hosting plus Neon Postgres. Exact production processing regions still need vendor-dashboard confirmation before the data-residency checklist item can be closed.
- Kept certification, legal-review, and ACN/Garante portal-format claims as in progress until human/advisor review is complete.
- Added Italian-friendly marketing aliases and sitemap entries for `/it/chi-siamo`, `/it/accesso-anticipato`, `/it/normative`, `/it/normative/*`, `/it/prezzi`, and `/it/sicurezza`; middleware rewrites these to the existing localized page implementations.
- Removed links and sitemap entries for coming-soon framework detail pages; DORA can still appear as a roadmap card, but it is not linked as a ready content page.

## Phase 5 - Italian Outreach and First Design Partner

Goal: 50 researched outreach emails, 3 real conversations, and 1 verbal design-partner commitment.

### 5.1 Target List

Build a list of 50 Italian SMBs:

- [ ] Location: Italy.
- [ ] Size: 50-250 employees.
- [ ] Sectors: manufacturing, IT services, pharmaceuticals, healthcare, software, energy.
- [ ] Contacts: CTO, CIO, IT Manager, Responsabile Sicurezza Informatica, DPO, Direttore IT.
- [ ] Add a specific hook for every target based on company news, sector, LinkedIn activity, or likely NIS2 exposure.

### 5.2 First-Touch Email

```text
Oggetto: NIS2 / GDPR - domanda breve da uno sviluppatore italiano

Buongiorno [Cognome],

mi chiamo [Your Name], sono uno sviluppatore italiano che vive
a Olomouc (Repubblica Ceca). Sto costruendo Splnit.eu - una
piattaforma per automatizzare la conformità a NIS2 (D.Lgs. 138/2024)
e GDPR per PMI italiane.

Le scrivo perché [UNA FRASE SPECIFICA - settore, dimensione,
indizio NIS2, news recente].

Non sto cercando un cliente adesso. Cerco 30 minuti del Suo tempo
per capire cosa rende la conformità frustrante in azienda - e cosa
potrebbe davvero aiutare. Posso fare una call quando Le è comodo.

Per i primi 10 design partner ho un'offerta dedicata: piano Business
gratis per 12 mesi e onboarding personale di 3 settimane. Ma è
secondario - l'obiettivo della call è capire il problema, non vendere.

Vale 30 minuti la prossima settimana?

Cordiali saluti,
[Your Name]
[Telefono] · [LinkedIn]
Splnit.eu - [Your Name], OSVČ, IČO [number]
```

### 5.3 Follow-Up

```text
Oggetto: Re: NIS2 / GDPR - domanda breve da uno sviluppatore italiano

Buongiorno,

so che ha l'agenda piena - non insisto.

Solo una cosa che potrebbe servirLe: ho costruito uno strumento
gratuito di NIS2 scoping che in 2 minuti indica se e come D.Lgs.
138/2024 può riguardare la Sua azienda.
https://splnit.eu/it/strumenti/nis2-scope

Se in futuro avesse senso parlarne, basta rispondere a questa email.

Buona giornata,
[Your Name]
```

### 5.4 Cadence and Tracking

- [ ] Week 11: send 25 first-touch emails Monday-Wednesday.
- [ ] Week 11 end: review response rate and rewrite weak hooks.
- [ ] Week 12: send 25 more first-touch emails plus follow-ups to Week 11 non-replies.
- [ ] Track company, contact, sector, date sent, opened, replied, call booked, and outcome in one spreadsheet.

Prepared materials:

- `docs/outreach/italy-design-partner-outreach.md` defines target criteria, hook quality rules, first-touch/follow-up templates, cadence, and outcome codes.
- `docs/outreach/italy-target-tracker.csv` provides the initial tracker columns for the first 50 researched targets.
- `docs/outreach/italy-target-batch-1.md` records the first 10 company-level Italian candidates with source URLs, hooks, and verification caveats. These are not send-ready until employee range and contact owner are verified.
- `docs/outreach/italy-target-batch-2.md` records the next 10 company-level Italian candidates across platform SaaS, sovereign cloud, industrial IoT, healthcare software, and cybersecurity ecosystem targets. These are not send-ready until employee range, contact owner, and low-confidence source rows are verified.
- `docs/outreach/italy-target-batch-3.md` records another 10 Italian candidates across privacy SaaS, cloud/data sovereignty, cybersecurity assessment, healthcare software, PA-facing SaaS, and compliance-software ecosystem targets. Competitor or ecosystem rows must be treated as learning targets unless a clear outreach rationale is verified.
- `docs/outreach/italy-target-batch-4.md` records another 10 Italian candidates around NIS2 incident management, SOC/MXDR, cybersecurity training, VAPT, threat intelligence, sovereign AI, and SaaS modernization. Several rows are competitor or ecosystem learning targets, not first-choice design-partner prospects.
- `docs/outreach/italy-target-batch-5.md` records the final 10 candidates needed for the initial 50-company source list, spanning regulated-finance cybersecurity, awareness SaaS, browser security, RegTech AI, AI SaaS, accessibility compliance, and OT/ICS cybersecurity. Rows with indirect fit or outside-ICP size must remain research-only until a concrete contact and hook are verified.
- `docs/outreach/italy-outreach-verification-queue.md` triages the 50 sourced targets into a first 25-company verification queue, secondary queue, and learning-only / competitor-watch list. It is not a send list; each row still needs employee range, contact owner, and hook verification before outreach.
- `docs/outreach/italy-verification-batch-1.md` verifies the first 10 companies from the queue at company-fit level. Result: 0 / 10 send-ready because named contact/owner verification is still missing.
- `docs/outreach/italy-verification-batch-2.md` verifies priorities 11-20 from the queue. Result: 0 / 10 send-ready; Cubbit, Netalia and DigitalPA remain strong top-queue candidates, while several below-ICP companies should be moved to learning/channel unless intentionally selected.
- `docs/outreach/italy-verification-batch-3.md` verifies priorities 21-25 and closes the first 25-company verification queue. Result: 0 / 5 send-ready; Cleafy and Cyber Guru remain the strongest candidates, while Cerbeyra, Ermes and Swascan are better treated as learning/channel or market-research rows unless a precise owner is identified.
- `docs/outreach/italy-contact-verification-shortlist.md` narrows the next pass to six Tier 1 companies: Cubbit, Cleafy, Netalia, DigitalPA, Cyber Guru / LibraCyber, and ReeVo. The next blocker is one verified role owner and hook per company, not more broad sourcing.
- `docs/outreach/italy-tier-1-contact-pass.md` records owner-candidate rows and exact hooks for the six Tier 1 companies. Cubbit, Cleafy and DigitalPA are the first three send-prep draft candidates; Netalia and Cyber Guru / LibraCyber are second-wave; ReeVo stays blocked until a durable partner/channel owner is verified.
- `docs/outreach/italy-first-touch-drafts-tier-1.md` drafts the first three manual first-touch emails for Cubbit, Cleafy and DigitalPA. These are not sent and still require verified recipient route plus real OSVČ/IČO sender details before use.
- `docs/outreach/italy-tier-1-send-prep.md` records current public sending routes for Cubbit, Cleafy and DigitalPA. Cubbit and DigitalPA have usable generic public routes; Cleafy needs either a verified LinkedIn route or its official contact form. No tracker row is marked sent.
- `docs/outreach/italy-tier-1-short-form-variants.md` provides shortened contact-form and LinkedIn-note variants for Cubbit, Cleafy and DigitalPA so generic routes do not receive overlong cold emails.
- `docs/outreach/italy-discovery-call-playbook.md` defines the 30-minute discovery call agenda, qualification rules, outcome codes, post-call note template, follow-up email, and guardrails for the first Italian replies.
- `docs/outreach/italy-response-tracking-and-follow-up.md` defines tracker status transitions, daily review routine, one-follow-up rule, reply triage, call-booking response, and weekly outreach reporting.

### 5.5 First Design Partner Onboarding

- [ ] Schedule the 3-week onboarding.
- [ ] Record every session with permission.
- [ ] Take notes immediately after each session.
- [ ] Update the KB and templates based on real friction.
- [ ] At the end of onboarding, ask for written feedback and permission to use the company as a reference.

Prepared materials:

- `docs/onboarding/design-partner-onboarding-playbook.md` defines intake, Week 1-3 agendas, note templates, feedback request, and reference-permission guardrails.
- `docs/onboarding/templates/` contains reusable `00-intake` through `04-feedback` Markdown files for each private design-partner workspace.

## Founder-Facing Reusable Materials

### Founding Customer Offer

```markdown
Founding customer offer - first 10 companies only

Looking for 10 EU SMBs who want to shape Splnit.eu before public launch.

What you get:
- 3-week onboarding directly with the founder
- Business plan free for 12 months
- Direct line after onboarding
- Features built around your sector

What we ask:
- Real use on a NIS2 or GDPR project
- 30 minutes weekly feedback during onboarding
- Permission to use your name as a reference - only when you're happy

Filled: [X] / 10
[Apply as a design partner ->]
```

### Three-Week Onboarding Playbook

Week 1 - Scoping and gap analysis, 90 minutes:

- Confirm jurisdiction.
- Walk through NIS2 applicability.
- Identify higher/lower obligation classification.
- Map current control state.
- Output a 1-page gap report.

Week 2 - Connect and configure, 60 minutes:

- Connect Microsoft 365, AWS, and/or GitHub integrations.
- Configure automated controls.
- Set up team roles and access.
- Start the first evidence collection cycle.

Week 3 - Documents and audit prep, 60 minutes:

- Generate the first policy set from templates.
- Tailor documents to sector.
- Prepare the evidence pack format for the auditor.
- Agree the roadmap to the audit deadline.

Throughout: async support via email or Slack.

### Italian Advisor Outreach

```text
Buongiorno [Nome],

mi chiamo [Your Name], sviluppatore italiano a Olomouc. Sto
costruendo Splnit.eu - automazione conformità NIS2/GDPR per
PMI europee, focus iniziale Italia.

Vedo che [DETTAGLIO SPECIFICO dal loro profilo - articolo,
ruolo, conferenza].

Cerco 1-2 advisor informali per rivedere come mappiamo D.Lgs.
138/2024 e darmi feedback dove sbaglio. Niente impegno, niente
NDA per iniziare - 30 minuti di call. Se ha senso, possiamo
parlare di una collaborazione formale.

Vale 30 minuti?

Saluti,
[Your Name]
```

## Tools and Infrastructure

- [ ] Loom for onboarding recordings.
- [ ] Calendly or Cal.com for booking.
- [ ] Notion or Obsidian for onboarding notes and KB drafts.
- [ ] Airtable or Google Sheets for outreach tracking.
- [ ] Plausible or Fathom for privacy-respecting analytics.
- [ ] Sentry for error tracking.
- [ ] Status page.
- [ ] Email signature with real OSVČ and IČO, no s.r.o.

## If It Is Not Working

If there are 0 design partners after 50 Italian emails, do not send 50 more without diagnosis:

1. Hook too weak: rewrite and A/B test 10 vs 10.
2. Italian SMBs not feeling NIS2 pressure yet: test ISO 27001 urgency among Italian SaaS, fintech, and healthtech.
3. Founder credibility too thin: sign advisor, publish Italian content, and build in public for 4 weeks.
4. Wrong segment: move away from slow-moving manufacturing and test software, fintech, healthtech, and ICT services.

If Phase 3 takes longer than 4 weeks, extend the timeline. Do not ship half-complete citations.

If Czech legal review through spouse is not appropriate, use paid Czech tech counsel.

If Italian advisor outreach gets no replies, lower the ask to a paid 30-minute review call.

## Weekly Review Ritual

Every Sunday evening, commit a short review to `docs/weekly-reviews/YYYY-MM-DD.md`:

1. What got done this week vs the plan?
2. What is blocking next week?
3. What did I learn about Italian, EU, or Czech compliance buyers?
4. What did I learn about the product?
5. One change I am making to the plan and why.

Use `docs/weekly-reviews/TEMPLATE.md` for the weekly entry format.

Progress note - 2026-05-06:

- Added `docs/weekly-reviews/2026-05-06.md` as the first weekly review entry. It records the current outreach-prep state, blockers, buyer/product learnings, and the plan change from sending 25 first-touch emails to sending the first 3 high-quality messages before expanding.

## 12-Week Definition of Done

- [ ] No false claims anywhere on the site.
- [ ] Architecture supports CZ, IT, and EU jurisdictions cleanly.
- [ ] Italian KB has verified citations for all NIS2 Article 21 controls.
- [ ] At least 12 Italian document templates are reviewed by an Italian advisor.
- [ ] One Italian advisor is publicly credited.
- [ ] At least 1 Italian design partner is onboarded.
- [ ] Privacy policy, terms, and DPA are reviewed and match OSVČ status.
- [ ] Founder bio, photo, and real story are live on `/about` or `/o-nas`.
- [ ] Recorded onboarding sessions exist.
- [ ] Weekly review log has 12 entries.
