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
- `npm run agent:review:stage3` runs similarity, citation-format, domain-blacklist, and adversarial spot-check filters. It is read-only unless `--apply` is passed, and it stores Stage 3 check details on the queue row.
- `npm run agent:review:stage4` promotes only rows that are already `agent_decided` + `approved`, have reviewed source articles, have Stage 3 final status `agent_decided`, and have no Stage 3 overrides. It is read-only unless `--apply` is passed.
- `npm run agent:review:promote` is an alias for Stage 4.
- `npm run agent:review:export` writes a framework/jurisdiction review Markdown package from reviewed official article text and draft framework-control article links.
- `npm run agent:review:report` exports the queued Stage 2/Stage 3 agent output into a human-review package without promoting rows.
- `npm run agent:review:report:all` prints a cross-framework queue summary by framework, jurisdiction, status, verdict, and confidence.
- `npm run agent:review:full` runs Stage 1 through Stage 4 in sequence. It is dry-run by default and passes `--apply` through only when explicitly provided.

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

Italian NIS2 is now the first target for the full agent pipeline. `docs/legal-reviews/nis2-it-mapping-review.md` is generated from reviewed Gazzetta Ufficiale article text for D.Lgs. 138/2024 Art. 23-25 and draft Italian framework-control links. Stage 1 has imported and embedded all 34 Italian NIS2 rows in local `mapping_review_queue` with ACN as the jurisdiction regulator. Stage 2 classified all 34 rows: 1 high-confidence `agent_decided` approval, 27 approval candidates routed to human because broad Art. 24 similarity stayed below threshold, and 6 `too_broad` candidates routed to human. Stage 3 cross-checked all 34 rows, persisted `stage3_checks`, and moved the single `agent_decided` incident-notification row back to `needs_human` because NIS2 incident/deadline mappings are domain-blacklisted. Stage 4 dry-run and apply both found 0 promotable Italian rows. `docs/legal-reviews/nis2-it-agent-review.md` now exports those agent results for human review. No Italian mapping row has been promoted to `reviewed`.

## Full Pipeline

Dry-run all four stages:

```bash
npm run agent:review:full -- --framework=nis2 --jurisdiction=it --limit=34
```

Apply all four stages:

```bash
npm run agent:review:full -- --framework=nis2 --jurisdiction=it --input docs/legal-reviews/nis2-it-mapping-review.md --limit=34 --replace --embed --apply
```

The full runner is only orchestration. Each stage keeps its own guardrails: Stage 1 writes only with `--apply`, Stage 2 and Stage 3 call OpenAI only when their own requirements are met, and Stage 4 promotes only rows that passed all promotion gates.

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

## Stage 3 Cross-Check

Run a dry run first:

```bash
npm run agent:review:stage3 -- --framework=nis2 --jurisdiction=it --limit=34
```

Persist checks only after the output shape looks correct:

```bash
npm run agent:review:stage3 -- --framework=nis2 --jurisdiction=it --limit=34 --apply
```

Stage 3 records:

- Similarity threshold outcome: 0.4 for Italy/EU, 0.6 for Czech, 0.65 for future jurisdictions without reviewer coverage.
- Citation-format validation per framework/jurisdiction.
- Domain blacklist matches that force human review for sensitive areas.
- A deterministic 5% adversarial spot-check of `agent_decided` approvals, with at least one row when approvals exist.

## Agent Review Reports

Print the whole queue summary:

```bash
npm run agent:review:report:all
```

Export a human-review package for one framework and jurisdiction:

```bash
npm run agent:review:report -- --framework=nis2 --jurisdiction=it --output docs/legal-reviews/nis2-it-agent-review.md
```

The report is read-only. It includes queue IDs, mapping IDs, source citations, similarity scores, Stage 2 pass reasoning, Stage 3 overrides, and blank human-decision columns. Human reviewers still choose one of `approved`, `wrong_article`, `too_broad`, or `needs_research`; promotion remains a separate step.

## Stage 4 Promotion

Dry-run:

```bash
npm run agent:review:stage4 -- --framework=nis2 --jurisdiction=it
```

Apply:

```bash
npm run agent:review:stage4 -- --framework=nis2 --jurisdiction=it --apply
```

Stage 4 promotes only queue rows that already passed every earlier gate:

- `mapping_review_queue.status = 'agent_decided'`
- `agent_verdict = 'approved'`
- linked article has `review_status = 'reviewed'`
- Stage 3 recorded `finalStatus = 'agent_decided'`
- Stage 3 has no overrides

For each promoted row it sets `framework_control_articles.confidence = 'reviewed'`, marks the queue row `promoted`, and inserts a `mapping_promotion_audit` record with the Stage 2 and Stage 3 payloads. A row routed to `needs_human` is never promoted by this command.

## Safety Rules

- Draft source rows remain draft.
- Draft mapping confidence remains excluded from questionnaire/evidence citations.
- Agent-approved rows are not directly customer-facing until promoted through the promotion workflow.
- Czech mappings remain stricter than Italy/EU because reviewer availability is limited.
