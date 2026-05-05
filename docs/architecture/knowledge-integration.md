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

As of this decision, the code seed contains:

- 92 canonical controls.
- 184 database framework-control mappings after seed.
- 33 source documents after seed, including the official OP/EU NIS2 XHTML source.
- 2 draft NIS2 EU article rows after running `npm run knowledge:import:nis2-eu`.
- 34 draft NIS2 framework-control article links after running `npm run knowledge:import:nis2-eu`.
- 5 draft Czech cyber law section rows after running `npm run knowledge:import:czech-cyber-law` with the provided extraction PDF.
- 68 additional draft NIS2 framework-control article links to Czech transposition sections.
- 37 draft Czech implementing decree section rows after running `npm run knowledge:import:czech-decrees` with the provided 409/410 extraction PDFs.
- 132 additional draft NIS2 framework-control article links to Czech implementing decree sections.
- 34 evidence templates for the current NIS2 framework-control mappings after `npm run db:seed`.
- 16 integration test definitions across Microsoft 365, GitHub, and AWS.

The product must not claim `247 controls` publicly until the database actually contains 247 reviewed controls and the copy hygiene guard is intentionally updated.

## Layer 1 Rules

- `framework_controls.articleRef` remains as a compatibility label, but new auditable citation behavior should use `framework_control_articles`.
- An article is not authoritative until `articles.review_status = 'reviewed'`.
- AI extraction can draft article rows, but manual review is required before `reviewed`.
- Source-extracted article rows must stay `draft` until manually checked against the official source.
- Zákony pro lidi PDFs may be used as extraction aids only. Do not promote those rows to `reviewed` until the text is checked against e-Sbírka or another official source.
- `npm run smoke:draft-extraction-sources` enforces that Zákony pro lidi extraction rows remain `draft`.
- Evidence templates describe expected evidence; actual customer evidence remains in `evidence`.
- Automated integration runs create `evidence` snapshots only on the first result, status change, or after a 24-hour refresh window. Do not create evidence for every hourly cron result.
- Automated evidence snapshots may include legal/source citations only from `articles.review_status = 'reviewed'`. If no reviewed citation exists, store an explicit `citationStatus = 'no_reviewed_citations'`.
- Public Trust Center pages must continue to show category-level aggregates only, never individual control IDs or evidence filenames.

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

The current Questionnaire AI is Anthropic-based and grounded in controls, evidence, and policies. Before expanding it, add provider abstraction, reviewed article retrieval, citation validation, and generated-output storage.
