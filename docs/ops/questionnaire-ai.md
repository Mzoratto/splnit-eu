# Questionnaire AI Operations Notes

Last updated: 2026-05-14

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

## Production enablement and proof boundary

As of 2026-05-14, production closeout checks show:

- Vercel Production has `QUESTIONNAIRE_AI_ENABLED` present.
- Vercel Production has `OPENAI_API_KEY` present.
- `/api/readiness` reports `questionnaires=configured`.
- The provider registry in `lib/questionnaires/provider.ts` supports OpenAI only; Anthropic is not a production provider unless code/config changes.
- Prior production smoke evidence in `docs/questionnaire-flow-audit.md` proves one controlled live OpenAI questionnaire generation/review path with model `gpt-4.1-mini-2025-04-14`.

Do not expose API keys, prompt payloads, database URLs, generated artifact IDs, or customer workspace content in public proof. Reporting the model name and high-level result is acceptable.

## Data sent to OpenAI

The call in `lib/questionnaires/openai.ts` sends:

- pasted/uploaded questionnaire questions;
- organisation name and plan when available;
- active control summaries;
- evidence summaries and metadata, not raw uploaded files;
- active policy metadata;
- reviewed legal citation metadata only.

The system prompt explicitly instructs the provider not to invent certifications, tooling, dates, policy names, or missing legal citations. Returned answers are schema-constrained, sanitized against the available context, persisted as generated artifacts, and default to `reviewStatus: "draft"`.

## Customer opt-in and review wording

Until counsel/business owner approves final wording, use this internal policy:

- Treat OpenAI questionnaire generation as an enabled but not yet legally approved customer-facing processor path.
- Use only with clear customer notice/opt-in that questionnaire questions and relevant workspace context may be sent to OpenAI to draft answers.
- Generated answers are drafts, not legal advice, certification proof, or auditor-ready evidence.
- A human reviewer must approve or edit each answer before external/vendor/auditor use.
- Export and external sharing should remain tied to the review gate; current UI copy already blocks PDF/XLSX export until every answer is approved.
- Do not send special-category personal data, secrets, credentials, raw uploaded evidence files, or unnecessary personal data in questionnaire prompts.

## Evidence targets still requiring owner/counsel verification

Public/account URLs to verify in browser or OpenAI account settings:

- Business terms: https://openai.com/policies/business-terms/
- Data Processing Addendum: https://openai.com/policies/data-processing-addendum/
- Security: https://openai.com/security/
- API data usage / retention: https://openai.com/policies/api-data-usage-policies/
- Enterprise privacy: https://openai.com/enterprise-privacy/

This environment received HTTP 403 for the OpenAI public policy/security URLs during the 2026-05-14 closeout pass. Treat the URLs as evidence targets, not verified acceptance. Before broad customer use, confirm signed/account terms, data-retention controls, training/use-of-inputs settings, subprocessors/transfer mechanism, and support/log retention in the OpenAI account or counsel packet.
