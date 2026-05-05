# Mapping Review Agent Pipeline

Status: schema foundation started on 2026-05-05.

Purpose: reduce mapping-review workload across frameworks and jurisdictions without replacing human compliance review. Agent decisions are first-pass filters only. Auditor-ready promotion still flows through framework-specific promotion gates.

## Current Slice

Implemented:

- `mapping_review_queue` Drizzle schema with framework, jurisdiction, language, source/control text, citation, regulator, `vector(1536)` embeddings, similarity score, and status.
- `mapping_promotion_audit` Drizzle schema with framework, jurisdiction, language, decision source, Stage 2 reasoning payload, Stage 3 checks payload, and promotion timestamp.
- Migration `0012_unusual_living_lightning` includes `CREATE EXTENSION IF NOT EXISTS vector`.

Not implemented yet:

- Stage 1 markdown extraction into `mapping_review_queue`.
- OpenAI embedding generation.
- Three-pass classifier.
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

## Safety Rules

- Draft source rows remain draft.
- Draft mapping confidence remains excluded from questionnaire/evidence citations.
- Agent-approved rows are not directly customer-facing until promoted through the promotion workflow.
- Czech mappings remain stricter than Italy/EU because reviewer availability is limited.
