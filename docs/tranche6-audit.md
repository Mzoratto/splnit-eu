# Tranche 6 audit: NÚKIB-native compliance baseline

## Existing workspace and evidence patterns

### Legal reference fields

The platform-specific workspace controls use legacy legal-reference fields on `WorkspaceControl`:

- `lib/workspaces/types.ts:19` defines required `nis2ArticleRef: string`.
- `lib/workspaces/types.ts:20` defines optional `zobkSectionRef?: string`.

Files currently assigning those fields:

- `lib/workspaces/pohoda.ts`
- `lib/workspaces/money-s3.ts`
- `lib/workspaces/helios.ts`
- `lib/workspaces/hetzner.ts`
- `lib/workspaces/ovhcloud.ts`
- `lib/db/queries/__tests__/workspaces.smoke.ts`

Files currently rendering or validating those fields:

- `components/workspaces/workspace-renderer.tsx:270` renders `control.nis2ArticleRef`.
- `components/workspaces/workspace-renderer.tsx:272` checks `control.zobkSectionRef`.
- `components/workspaces/workspace-renderer.tsx:274` renders `ZoKB {control.zobkSectionRef}`.
- `scripts/smoke-money-s3-workspace-config.ts:43` asserts `nis2ArticleRef` is non-empty.
- `scripts/smoke-helios-workspace-config.ts:43` asserts `nis2ArticleRef` is non-empty.
- `scripts/smoke-hetzner-workspace-config.ts:17` includes `nis2ArticleRef` in validation.
- `scripts/smoke-ovhcloud-workspace-config.ts:17` includes `nis2ArticleRef` in validation.

The separate seed control library already uses a different `frameworkMappings` shape:

- `lib/controls/library.ts:29` defines seeded control `frameworkMappings`.
- `app/(app)/controls/page.tsx:83`, `app/(app)/controls/[controlId]/page.tsx:118`, `app/(app)/frameworks/[frameworkSlug]/page.tsx:132`, `lib/onboarding/intake-scope.ts:322`, `lib/onboarding/intake-scope.ts:407`, `lib/db/queries/onboarding.ts:180`, `scripts/seed.ts:165`, and `scripts/seed.ts:424` consume that seed-library mapping.

That existing seed-library mapping is separate from `lib/workspaces/types.ts` and is not yet available on platform workspace controls.

### EvidenceAssessmentResult

`lib/activation/evidence-state.ts:1` defines:

```ts
export type EvidenceAssessmentResult =
  | "pass"
  | "gap"
  | "warning"
  | "manual_review"
  | "not_applicable"
  | "unknown";
```

The evidence model already has result/source typing and must not be changed for Tranche 6.

### Existing PDF export subtitle

`lib/export/report-template.ts:527` currently renders:

```html
<p class="subtitle">Zákon č. 264/2025 Sb., o kybernetické bezpečnosti</p>
```

This is the subtitle to replace in Phase 3 with:

```text
Přehled bezpečnostních opatření dle § 3 odst. 2 vyhl. č. 410/2025 Sb.
```

The current legal-reference line is generated in `lib/export/report-template.ts:181` through `getVyhlaskaRef(...)`, then rendered at `lib/export/report-template.ts:206`, `lib/export/report-template.ts:225`, and `lib/export/report-template.ts:244`.

### Pohoda backup_dr controls

`lib/workspaces/pohoda.ts:118` starts the `backup_dr` layer titled `Zálohy a obnova po havárii`.

Current controls:

| Line | controlKey | question | evidenceType | Current ZoKB reference |
| --- | --- | --- | --- | --- |
| `lib/workspaces/pohoda.ts:123` | `pohoda-backup-db-maintenance` | `Je v Pohodě nebo SQL Serveru pravidelně spouštěna údržba databáze a kontrola integrity?` | `both` (`lib/workspaces/pohoda.ts:129`) | `§ 8 odst. 1` (`lib/workspaces/pohoda.ts:131`) |
| `lib/workspaces/pohoda.ts:133` | `pohoda-backup-automated-daily` | `Probíhá automatická denní záloha Pohoda databáze a sdílených příloh mimo pracovní stanice?` | `both` (`lib/workspaces/pohoda.ts:139`) | `§ 8 odst. 2` (`lib/workspaces/pohoda.ts:141`) |
| `lib/workspaces/pohoda.ts:143` | `pohoda-backup-offsite-immutable` | `Je alespoň jedna kopie zálohy uložena mimo provozovnu nebo v immutable/cloud úložišti?` | `both` (`lib/workspaces/pohoda.ts:149`) | `§ 8 odst. 3` (`lib/workspaces/pohoda.ts:151`) |
| `lib/workspaces/pohoda.ts:153` | `pohoda-backup-restoration-test` | `Byla v posledních 12 měsících provedena testovací obnova Pohoda databáze?` | `both` (`lib/workspaces/pohoda.ts:159`) | `§ 8 odst. 4` (`lib/workspaces/pohoda.ts:161`) |

### `lib/compliance/`

`lib/compliance/` does not exist yet. Phase 2 creates it fresh.

## XLSX internals

Source file:

`docs/compliance/official-baselines/prehled-bezpecnostnich-opatreni_v10_uid_69cbcd208cab4.xlsx`

ZIP entries inspected:

- `xl/workbook.xml`
- `xl/sharedStrings.xml`
- `xl/worksheets/sheet1.xml`
- `xl/worksheets/sheet2.xml`

`xl/workbook.xml` declares two sheets:

- `Přehled bezpečnostních opatření`
- `Legenda`

`xl/worksheets/sheet1.xml` has dimension `A1:K330`. The useful main-register headers are split across rows 2 and 3:

| Column | Header / meaning |
| --- | --- |
| A | `§` — legal paragraph reference, e.g. `§ 6` |
| B | `Název paragrafu` — paragraph title |
| C | First `Úroveň členění` column — usually odstavce / subsection number |
| D | Second `Úroveň členění` column — usually písmeno / letter |
| E | Third `Úroveň členění` column — nested point, e.g. numbered item |
| F | `Text znění požadavku` — full requirement text |
| G | `Stav bezpečnostního opatření` |
| H | `Popis bezpečnostního opatření` |
| I | `Termín zavedení bezpečnostního opatření` |
| J | `Priorita zavedení bezpečnostního opatření` |
| K | `Odpovědnost za bezpečnostní opatření` |

There is no populated explicit implementation-level column (`neopominutelná` / `vyhodnotitelná`) in sheet1. The parser will infer `NukibControlTier` from the official paragraph ranges in the Tranche 6 spec: mandatory minimum for §§3,4,5,6,10 and assessable for §§7,8,9,11,12,13.

`xl/worksheets/sheet2.xml` (`Legenda`) contains:

- State enum values in rows 2-5: `Zavedeno`, `V procesu`, `Nezavedeno`, `Nerelevantní`.
- Priority enum values in rows 34-39: `Nízká`, `Střední`, `Vysoká`, `Kritická`, plus `Zavedeno` and `Nerelevantní` as non-priority status-like values used by the official template in the priority column.
- Column documentation and examples for legal references, implementation description, deadline, priority, and responsibility.

The workbook uses `xl/sharedStrings.xml` for strings and regular worksheet XML cell references. Existing dependencies include `fast-xml-parser` and `jszip`; no spreadsheet-specific dependency is needed.
