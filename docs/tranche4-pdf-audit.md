# Tranche 4 PDF audit

## Phase 1 findings

Read files:
- `lib/activation/evidence-state.ts`
- `lib/db/queries/evidence.ts`
- `lib/workspaces/pohoda.ts`
- `lib/workspaces/money-s3.ts`
- `components/activation/activation-status.tsx`
- `lib/db/schema.ts`
- `lib/db/queries/organisations.ts`
- `lib/db/queries/workspaces.ts`
- `lib/db/queries/integrations.ts`
- `app/(app)/settings/organisation/page.tsx`
- `app/(app)/settings/organisation/actions.ts`

### Evidence model

- Evidence rows live in `evidence` and are keyed by `clerkOrgId` plus `controlId`.
- The DB schema stores evidence fields as camel-case Drizzle properties backed by snake-case columns:
  - `source` -> `source`
  - `confidence` -> `confidence`
  - `assessmentResult` -> `assessment_result`
  - `collectedAt` -> `collected_at`
  - `controlId` -> `control_id`
- `EvidenceAssessmentResult` supports `pass`, `gap`, `warning`, `manual_review`, `not_applicable`, and `unknown`.
- `EvidenceSource` currently supports `connector`, `manual`, `intake`, and `imported`. It does not currently contain a literal `api` value. For the PDF, connector evidence should be rendered to the Czech-visible line `source=api (...)` while preserving the existing stored value unless a later migration explicitly changes the evidence model.
- Manual workspace attestations use `createManualAttestationEvidence`, with answers stored under `snapshotData.attestationAnswers`.
- Workspace completion is already computed by `getWorkspaceProgress`, where a control is complete when at least one evidence row exists for the workspace control.

### Workspace config

- `PlatformWorkspace` is the shared config type for Pohoda, Money S3 / S4, and Helios.
- `WorkspaceControl` currently has `controlKey`, `question`, `guidance`, `evidenceType`, `nis2ArticleRef`, and optional `zobkSectionRef`.
- There is no `nukibBlock` or equivalent grouping field yet. Phase 3 must add grouping metadata to `WorkspaceControl` and populate all workspace configs before the template can group by NÚKIB blocks without hardcoding control names in the template.
- Existing workspace configs still contain `nis2ArticleRef` values such as `Article 21(...)`. The PDF output must not render these references; it must render references to `zákon č. 264/2025 Sb.` and the correct Czech vyhláška number by obligation regime.

### Organisation and identity model

- The organisation table is `organisations`; the primary app identifier is `clerkOrgId`.
- Company name exists as `organisations.name`.
- IČO exists as `organisations.ico`, but it is currently `text("ico")`, nullable, and the settings form validates only `.max(32)`. Phase 2 should keep migration-safe nullability for existing rows and add application-level validation for exactly 8 digits.
- DIČ does not exist.
- Sídlo does not exist.
- Režim povinností does not exist as `nizsi | vyssi` or as a display string. Phase 2 should add `rezim_povinnosti` with default `nizsi`.
- `tier` does not exist on the organisation model. `plan` exists, but it is billing state and should not drive agency PDF branding.
- `brandingConfig` does not exist on the organisation model. There is Trust Center / consultant branding elsewhere, but no organisation-level PDF fields. Phase 2 should add `branding_logo_url`, `branding_display_name`, and `branding_footer_text`.

### Existing settings route

- The current organisation settings page is `/settings/organisation`, not `/settings/profile`.
- It already edits name, IČO, sector, employee count, country, primary jurisdiction, and locale.
- Phase 5 should extend this route and link export gating to `/settings/organisation` unless a dedicated `/settings/profile` alias is added.

## PDF proof of concept

- Playwright is available through the existing `@playwright/test` dependency, which installs `playwright`.
- `scripts/pdf-poc.ts` renders a UTF-8 HTML document with Czech diacritics, green/grey/amber evidence blocks, and an explicit print page break.
- The generated PDF path is `docs/poc-report.pdf`.
- The requested command `npx ts-node scripts/pdf-poc.ts` succeeds after allowing `npx` to fetch `ts-node`; the script is CommonJS-compatible because the app TypeScript config is ESM-oriented.
- Verification from `docs/poc-report.pdf`:
  - `file` reports `PDF document, version 1.4, 2 pages`.
  - `pdfinfo` reports `Pages: 2` and `Page size: 595.92 x 842.88 pts (A4)`.
  - `pdftotext` extracts Czech characters correctly: `ě, š, č, ř, ž, ý, á, í, é, ů, ú`.
  - Rasterized page sampling found the expected border colours: `#1a5c3a`, `#6b7280`, and `#b45309`.
- HTML to PDF via Playwright is confirmed for this repository.
