# Mapping Review Agent Pipeline

Status: schema foundation started on 2026-05-05.

Purpose: reduce mapping-review workload across frameworks and jurisdictions without replacing human compliance review. Agent decisions are first-pass filters only. Auditor-ready promotion still flows through framework-specific promotion gates.

## Current Slice

Implemented:

- `mapping_review_queue` Drizzle schema with framework, jurisdiction, language, source/control text, citation, regulator, `vector(1536)` embeddings, similarity score, and status.
- Stage 2 persistence fields on `mapping_review_queue`: `agent_verdict`, `agent_confidence`, `stage2_passes`, `stage3_checks`, and `classified_at`.
- `mapping_promotion_audit` Drizzle schema with framework, jurisdiction, language, decision source, Stage 2 reasoning payload, Stage 3 checks payload, and promotion timestamp.
- Migration `0012_unusual_living_lightning` includes `CREATE EXTENSION IF NOT EXISTS vector`.
- Migration `0013_polite_blink` adds Stage 2 decision enums and queue persistence columns.
- `npm run smoke:mapping-review-schema` verifies pgvector, the two review tables, and the vector columns.
- `npm run agent:review:stage1` parses mapping-review Markdown, hydrates control/source text from Postgres by `framework_control_articles.id`, and imports rows into `mapping_review_queue` only when `--apply` is passed. Add `--embed` with `--apply` to populate `text-embedding-3-small` vectors and cosine similarity when `OPENAI_API_KEY` is configured.
- `npm run agent:review:stage2` classifies queued rows with the three-pass skeptic/advocate/auditor flow. It is read-only unless `--apply` is passed, and it stores final verdict/confidence plus the complete pass payload on the queue row.

Not implemented yet:

- Cross-check/domain blacklist stage.
- Generalized promotion command.

## Migration Status

Local verification on 2026-05-05:

- Installed pgvector `v0.8.2` against local PostgreSQL 14.
- Applied migration `0012_unusual_living_lightning` to local `splnit_eu_dev`.
- Verified `mapping_review_queue` and `mapping_promotion_audit` exist.
- Verified `control_embedding` and `source_embedding` use the `vector` type.

If a fresh local database fails with:

```text
could not open extension control file ".../extension/vector.control"
```

install/enable pgvector for that PostgreSQL server, then run:

```bash
npm run db:migrate
```

Neon production/staging databases must have pgvector enabled before this migration is applied.

## Stage 1 Extraction

Stage 1 is intentionally dry-run by default:

```bash
npm run agent:review:stage1 -- --framework=nis2 --jurisdiction=it
npm run agent:review:stage1 -- --framework=nis2 --jurisdiction=cz --input docs/legal-reviews/czech-nis2-batch-1-review.md
```

Add `--apply` to write rows into `mapping_review_queue`. Add `--replace` with `--apply` when regenerating a queue for the same mapping IDs. Add `--embed` with `--apply` to call the OpenAI embeddings API and populate `control_embedding`, `source_embedding`, and `similarity_score`.

The importer does not fabricate source text from Markdown. It uses the Mapping ID column to load the canonical control and article text from Postgres. This keeps the queue tied to the structured knowledge layer instead of a copied review packet.

Italian NIS2 remains the first target for the full agent pipeline, but the repository does not yet contain `docs/legal-reviews/nis2-it-mapping-review.md`. Until that file exists, the Stage 1 importer can be smoke-tested against the Czech batch package without promoting Czech mappings or blocking Italian/English-EU work.

## Stage 2 Classification

Run a small dry run first:

```bash
npm run agent:review:stage2 -- --framework=nis2 --jurisdiction=cz --limit=1
```

Persist results only after the output shape looks correct:

```bash
npm run agent:review:stage2 -- --framework=nis2 --jurisdiction=cz --limit=5 --apply
```

Stage 2 does not promote mappings. It only updates queue rows from `unclassified` to either `agent_decided` or `needs_human`. Czech approvals are conservative: even unanimous approvals are routed to human review when the embedding similarity is below the stricter Czech threshold.

## Safety Rules

- Draft source rows remain draft.
- Draft mapping confidence remains excluded from questionnaire/evidence citations.
- Agent-approved rows are not directly customer-facing until promoted through the promotion workflow.
- Czech mappings remain stricter than Italy/EU because reviewer availability is limited.
