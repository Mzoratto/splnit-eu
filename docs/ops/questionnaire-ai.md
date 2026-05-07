# Questionnaire AI Operations Notes

Last updated: 2026-05-07

## Provider

The inbound questionnaire assistant uses OpenAI through `lib/questionnaires/openai.ts` when questionnaire AI is enabled.

Required environment variables:

```bash
QUESTIONNAIRE_AI_ENABLED=true
OPENAI_API_KEY=...
```

Optional model variables, resolved in this exact order:

```bash
OPENAI_QUESTIONNAIRE_MODEL
OPENAI_MODEL
gpt-4.1-mini
```

Be explicit when changing models. If `OPENAI_QUESTIONNAIRE_MODEL` is missing, the app will silently use `OPENAI_MODEL`; if both are missing, it uses `gpt-4.1-mini`.

## Runtime smoke

Run from the repo root:

```bash
QUESTIONNAIRE_AI_ENABLED=true npx tsx scripts/smoke-questionnaire-provider.ts
```

Latest verified result:

```text
Questionnaire provider config smoke passed.
Questionnaire provider runtime smoke passed with model gpt-4.1-mini-2025-04-14.
```

This proves the local provider-backed OpenAI call path works with configured credentials and model resolution. It does not prove production tenant data quality, reviewer approval flow, or customer-facing readiness.
