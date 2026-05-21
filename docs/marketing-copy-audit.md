# Marketing copy audit for Tranche 5 updates

Date: 2026-05-21

Scope: copy-only updates for `/`, `/platform`, and `/predpisy/nis2` in Czech, English, and Italian.

## Homepage `/`

- Step text "Připojte nástroje" lives in:
  - `messages/cs-CZ.json` under `home.steps.connectTitle` and `home.steps.connectBody`
  - `messages/en-EU.json` under `home.steps.connectTitle` and `home.steps.connectBody`
  - `messages/it-IT.json` under `home.steps.connectTitle` and `home.steps.connectBody`
- The homepage route consumes these keys through `getTranslations("home")` in `app/(marketing)/page.tsx`; the steps array uses `key: "connect"` and renders `steps.connectTitle` / `steps.connectBody`.

- Feature copy "Automatické dokumenty" lives in:
  - `messages/cs-CZ.json` under `home.features.documentsTitle` and `home.features.documentsBody`
  - `messages/en-EU.json` under `home.features.documentsTitle` and `home.features.documentsBody`
  - `messages/it-IT.json` under `home.features.documentsTitle` and `home.features.documentsBody`
- The homepage route consumes these keys through `getTranslations("home")` in `app/(marketing)/page.tsx`; the features array uses `key: "documents"` and renders `features.documentsTitle` / `features.documentsBody`.

## Platform page `/platform`

- The "Dostupné integrace" section label and local regulatory source copy live in:
  - `lib/marketing/platform-copy.ts` under `platformCopy["cs-CZ"].integrations.available`, `localSourcesTitle`, `localSourcesBadge`, and `localSourcesBody`
  - `lib/marketing/platform-copy.ts` under `platformCopy["en-EU"].integrations.available`, `localSourcesTitle`, `localSourcesBadge`, and `localSourcesBody`
  - `lib/marketing/platform-copy.ts` under `platformCopy["it-IT"].integrations.available`, `localSourcesTitle`, `localSourcesBadge`, and `localSourcesBody`
- The Microsoft 365, GitHub, and AWS badge labels are currently hardcoded in `app/(marketing)/platform/page.tsx` inside the inline integrations tile array rendered below `copy.integrations.available`.
- The platform page consumes config with `getPlatformCopy(locale)` from `lib/marketing/platform-copy.ts`.

- The integrations bullet list lives in:
  - `lib/marketing/platform-copy.ts` under `platformCopy["cs-CZ"].integrations.bullets`
  - `lib/marketing/platform-copy.ts` under `platformCopy["en-EU"].integrations.bullets`
  - `lib/marketing/platform-copy.ts` under `platformCopy["it-IT"].integrations.bullets`
- The platform page renders the list from `copy.integrations.bullets` in `app/(marketing)/platform/page.tsx`.

## NIS2 regulation page `/predpisy/nis2`

- The Czech "Jak Splnit.eu pomáhá" items for NIS2 live in:
  - `lib/marketing/frameworks.ts` in the `frameworkDetails` entry with `slug: "nis2"`, under `splnitHelps`
  - Current item keys are `title` and `description` for "NÚKIB feed", "21 opatření", and "Hlášení a důkazy".
- The English NIS2 localized items live in:
  - `lib/marketing/framework-detail-copy.ts` under `englishDetails.nis2.splnitHelps`
- The Italian NIS2 localized items live in:
  - `lib/marketing/framework-detail-copy.ts` under `italianDetails.nis2.splnitHelps`
- The route `app/(marketing)/predpisy/[slug]/page.tsx` loads the base framework through `getFrameworkDetail(slug)` and applies localized overrides with `localizeFrameworkDetail(baseFramework, locale)`, then renders `framework.splnitHelps`.
