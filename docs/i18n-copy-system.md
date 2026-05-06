# i18n Copy System

Last updated: 2026-05-06

## Source Of Truth

`messages/en-EU.json` is the master product copy. Czech and Italian copy should be translated from the English meaning, not from each other and not from old Czech-first drafts.

Active locale files:

- `messages/en-EU.json` - master copy and English-EU runtime locale
- `messages/cs-CZ.json` - Czech runtime locale
- `messages/it-IT.json` - Italian runtime locale

Do not recreate `messages/en.json` or `messages/cs.json`. They were stale legacy files and created a false second source of truth.

## Copy Classes

System labels must preserve meaning tightly across locales:

- Navigation labels
- Buttons and CTAs
- Form labels
- Statuses
- Error messages
- Empty states
- Permission and billing state labels

Marketing and explanatory text may be naturally localized, but must preserve the same product promise and legal/compliance claims across locales.

## Glossary

| Concept | EN | CS | IT | Notes |
|---|---|---|---|---|
| Request | Request | Žádost | Richiesta | Use for access/document requests. |
| Document access request | Document access request | Žádost o přístup k dokumentům | Richiesta accesso documenti | Do not call this NDA unless an NDA workflow actually exists. |
| Submit | Submit | Odeslat | Invia | Button verb for sending a request/form. |
| Save | Save | Uložit | Salva | Persist a draft or settings change. |
| Create | Create | Vytvořit / Založit | Crea | Prefer `Založit` for incidents/reviews, `Vytvořit` for records. |
| Framework | Framework | Framework | Framework | Product term; avoid mixing with `Předpisy` in app breadcrumbs. |
| Control | Control | Kontrola | Controllo | Product object. |
| Evidence | Evidence | Evidence | Evidenza / evidenze | Czech product term intentionally uses `Evidence`. |
| Risk tier | Risk tier | Úroveň rizika | Livello di rischio | Avoid raw English `tier` in CS. |
| Access review | Access review | Přístupová revize | Revisione accessi | Use consistently for team access workflows. |
| Trust Center | Trust Center | Trust Center | Trust Center | Product name; do not localize to British `centre`. |
| Founder | Founder | Zakladatel | Fondatore | Avoid mixed English loanword in Italian marketing copy. |

## Naming Context

Prefer specific keys over generic keys when adding new copy:

- Good: `submitDocumentAccessRequestButton`
- Risky: `submit`

Generic keys are acceptable inside a narrow namespace when the UI context is unambiguous, for example `trustCenterSettings.approve`.

## Review Workflow

1. Write or normalize the English-EU master copy first.
2. Classify each key as system label or marketing/explanatory text.
3. Translate Czech and Italian from the English meaning.
4. Check the glossary before choosing synonyms.
5. Run `npm run smoke:i18n-shell` and `npm run smoke:copy-hygiene`.
6. For outreach-critical pages, do a browser pass in EN, CS, and IT before deploy.

## Current Guardrails

- `npm run smoke:i18n-shell` fails if stale `messages/en.json` or `messages/cs.json` reappear.
- `npm run smoke:i18n-shell` checks high-risk semantic keys such as Trust Center, document access requests, footer legal placeholders, and the Italian regulatory-feed badge.
- `npm run smoke:copy-hygiene` blocks public references to the nonexistent `Splnit Technology s.r.o.` identity and placeholder legal-entity copy.
