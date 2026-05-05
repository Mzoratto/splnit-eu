# Knowledge Integration Architecture

Date: 2026-05-05  
Status: Accepted for Layer 1 implementation

## Context

Splnit.eu has three separate knowledge integration problems that are easy to confuse:

1. Customer-facing AI features: Questionnaire AI, regulation explainers, and generated gap analysis.
2. Internal product intelligence: reviewed mappings between controls, frameworks, legal articles, and evidence expectations.
3. Trust signal generation: integration results becoming auditor-ready evidence with citations.

The static mapping layer must be the source of truth. AI features are allowed to draft and summarize from reviewed data, but they must not invent controls, articles, evidence, certifications, customers, or legal conclusions.

## Decision

Use a three-layer architecture, built in order:

1. Static mapping layer in Postgres/Drizzle.
2. RAG knowledge layer only after the reviewed corpus or customer volume justifies it.
3. AI generation layer that reads scoped structured data first and validates citations.

Layer 1 is the current priority. The repo already has `controls`, `frameworks`, `framework_controls`, `tests`, `source_documents`, `evidence`, `integration_runs`, and `org_control_statuses`. This increment adds the missing Layer 1 primitives:

- `articles`: reviewed official legal article text with citation metadata.
- `framework_control_articles`: auditable many-to-many link between a framework-control mapping and reviewed legal articles.
- `evidence_templates`: reusable definitions of what good evidence looks like for a control or framework-control mapping.

## Current Counts

Current local database after the 2026-05-05 official-source verification contains:

- 92 canonical controls.
- 184 database framework-control mappings after seed.
- 48 source documents, including canonical EUR-Lex PDF source rows, Italian Gazzetta Ufficiale rows, official ACN/Garante rows, and official e-Sbírka PZZ PDF sources for 264/2025, 409/2025, and 410/2025.
- 91 article rows:
  - 2 reviewed NIS2 EU rows linked to the canonical EUR-Lex CELEX PDF source row.
  - 3 reviewed Italian NIS2 rows from Gazzetta Ufficiale.
  - 42 reviewed Czech rows from official e-Sbírka PZZ PDFs.
  - 42 draft Czech extraction rows from the provided Zákony pro lidi PDFs kept only as provenance/audit aids.
  - 2 legacy OP/EU extraction rows kept as draft after the EUR-Lex source migration.
- 434 framework-control article links:
  - 34 reviewed direct EU Article 21/23 links.
  - Czech links copied to official e-Sbírka rows remain `confidence='draft'` pending compliance/legal mapping review.
- 34 evidence templates for the current NIS2 framework-control mappings after `npm run db:seed`.
- 16 integration test definitions across Microsoft 365, GitHub, and AWS.

The product must not claim `247 controls` publicly until the database actually contains 247 reviewed controls and the copy hygiene guard is intentionally updated.

## Layer 1 Rules

- `framework_controls.articleRef` remains as a compatibility label, but new auditable citation behavior should use `framework_control_articles`.
- An article is not authoritative until `articles.review_status = 'reviewed'`.
- AI extraction can draft article rows, but official-source verification or manual review is required before `reviewed`.
- Source-extracted article rows must stay `draft` until checked against the official source.
- Zákony pro lidi PDFs may be used as extraction aids only. Do not promote those rows to `reviewed` until the text is checked against e-Sbírka or another official source.
- `npm run smoke:draft-extraction-sources` enforces that Zákony pro lidi extraction rows remain `draft`.
- `npm run knowledge:verify:official-sources` compares imported rows against official EUR-Lex and e-Sbírka sources without writing to the database. If EUR-Lex blocks CLI PDF fetches, download the CELEX PDF manually and pass `--nis2-eu-file <path>`.
- `npm run knowledge:promote:official-sources` performs the same verification and then promotes verified official-source article rows.
- Evidence templates describe expected evidence; actual customer evidence remains in `evidence`.
- Automated integration runs create `evidence` snapshots only on the first result, status change, or after a 24-hour refresh window. Do not create evidence for every hourly cron result.
- Automated evidence snapshots may include legal/source citations only from `articles.review_status = 'reviewed'` and `framework_control_articles.confidence = 'reviewed'`. If no reviewed citation exists, store an explicit `citationStatus = 'no_reviewed_citations'`.
- Public Trust Center pages must continue to show category-level aggregates only, never individual control IDs or evidence filenames.

## Authoritative Source Policy

Authoritative citation rows must come only from primary sources:

- EU regulations and directives: EUR-Lex, using CELEX-backed URLs and locale-specific official text.
- National transpositions: official state journals or official consolidated law databases.
- Regulator guidance: the regulator's own website, such as ACN, NÚKIB, Garante, ÚOOÚ, AGID, or the European Commission AI Office.
- ISO 27001/27002: ISO Store or national standards bodies for internal licensed reference only.

Third-party legal copies, summaries, commercial law portals, blogs, and vendor commentary may be used only as research/provenance aids. They must not be marked as authoritative source documents for auditor-ready citations.

`lib/regulations/authoritative-sources.ts` is the canonical registry for core source-document rows:

- NIS2 Directive, GDPR, and EU AI Act from EUR-Lex in EN, IT, and CS.
- Italian NIS2 transposition from Gazzetta Ufficiale.
- Italian ACN NIS determinations and Garante GDPR guidance from regulator-owned URLs.
- Italian Codice Privacy from Normattiva consolidated legal text.
- Czech NIS2 and Czech privacy law references from e-Sbírka.
- ISO 27001 and ISO 27002 store references, without publishing ISO copyrighted control text.

Use `npm run knowledge:import:authoritative-sources` to upsert these rows into `source_documents`. Use `npm run smoke:source-documents` to verify required source rows, source URLs, review timestamps, and official-source hostnames.

## Layer 2 Deferral Criteria

Do not build pgvector/RAG until at least one condition is true:

- 50+ paying customers create enough questionnaire volume to justify retrieval infrastructure.
- Reviewed source context no longer fits in a scoped prompt for a single framework or workflow.
- Customer-uploaded policies require per-organisation semantic retrieval.
- The product reaches roughly 1000+ controls or 10+ active frameworks.

When Layer 2 starts, prefer pgvector in the existing Postgres/Neon database before adding a separate vector database.

## Layer 3 Rules

Customer-facing AI must:

- Use only scoped context supplied by the application.
- Cite only IDs and citations provided in that context.
- Refuse or answer conservatively when support is missing.
- Frame output as draft material for legal or compliance review.
- Save generated outputs into the evidence/audit trail when they affect customer-facing compliance work.

The current Questionnaire AI uses a provider boundary with Anthropic as the only implemented provider. Provider calls require the explicit `QUESTIONNAIRE_AI_ENABLED=true` gate in addition to provider credentials. It is grounded in controls, evidence, policies, and reviewed legal citations, validates returned references against supplied context, stores generated outputs as generated artifacts, and writes artifact creation to the audit trail. Before adding another AI provider, update subprocessors, retention, opt-in wording, and data-processing docs for that provider.
