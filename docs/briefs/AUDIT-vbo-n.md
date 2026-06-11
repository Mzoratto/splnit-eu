# AUDIT — NÚKIB baseline VBO-N (vyhláška č. 410/2025 Sb.)

Phase 0 read-only audit for `docs/briefs/BRIEF-vbo-n-baseline.md`. Date: 2026-06-11.

## 1. Spec file verification

`regulations/cz-vbo-n/v1.1.json` — created in this session as a **byte-identical copy** of the provided file (verified `sha256 b1dd6f27…`). Parses cleanly:

- **47 controls** ✓ (22 `neopominutelné`, 25 `vyhodnotitelné`)
- 11 areas; every control has a non-empty `ref`
- IDs unique; ID scheme `N-*` / `V-*` matches tier prefix consistently

## 2. Control library (data model + paths)

| Layer | Location | Notes |
|---|---|---|
| Seed definitions | `lib/controls/library.ts` → `CONTROL_LIBRARY: ControlSeed[]` (68 controls incl. `HELIOS_CONTROL_SEEDS` from `lib/workspaces/control-seeds.ts`) | `key`, `titleCs/En`, `category`, `testType`, `frameworkMappings[]` |
| DB tables | `lib/db/schema.ts:302` `controls` (key unique), `framework_controls`, `org_control_statuses:741` | per-org status with CHECK: `unknown/pass/fail/warning/error/manual_review/not_applicable/out_of_scope` |
| Seeding | `scripts/seed.ts` `seedControls()` — upsert by `key` with `onConflictDoUpdate` | **A1 migration + seed sync point:** add `baseline_refs jsonb NOT NULL DEFAULT '[]'` to `controls`, add `baselineRefs?: string[]` to `ControlSeed`, include in upsert `set` |
| Scoring | `lib/controls/scorer.ts` `calculateWeightedControlScore` | pass=1, manual_review/warning=0.5 |

**Second control plane (do not confuse):** `lib/workspaces/*` defines per-workspace checklist controls (`WorkspaceControl` in `lib/workspaces/types.ts`), enriched by the imported NÚKIB **overview spreadsheet** (`lib/compliance/nukib/generated/baseline-current.json`, 110 §-odst-písm rows from `prehled-bezpecnostnich-opatreni_v10.xlsx`) via `lib/compliance/nukib/adapter.ts`.

⚠️ **Naming collision:** the workspace extension model already has `officialBaselineRefs: string[]` (values like `"§ 3 odst. 1 písm. a)"`). The new field on the org control library is `baselineRefs: string[]` with values like `"N-4-01"`. Different planes, different value domains — I will keep the names as the brief specifies but document the distinction in code comments.

⚠️ **Relationship to the 110-row import:** the 47 manual controls and the 110 overview rows both derive from vyhláška 410/2025 §3–§14, but are different granularities of different NÚKIB artifacts. A1 treats `regulations/cz-vbo-n/v1.1.json` as the canonical baseline for coverage; the 110-row import stays untouched (it powers workspace checklist enrichment).

## 3. i18n setup + fallback convention

- `messages/{cs-CZ,en-EU,it-IT}.json`, loaded statically in `i18n/messages.ts`; `i18n/request.ts` resolves locale → **no runtime key fallback exists**. If a key is missing from a locale file, next-intl errors.
- Repo convention (enforced by existing unit tests, e.g. `tests/unit/vendor-questions.test.ts`): **every key exists in all three files**.
- → Brief's CZ-first rule maps to: add new keys to all three files, with the **Czech string duplicated into `en-EU` and `it-IT`** as placeholder values. (Matches "Czech value as placeholder".)

## 4. PDF export

- `lib/export/pdf.ts` — `renderComplianceReportPdf(ctx)`: HTML from `lib/export/report-template.ts` `renderReportTemplate()` → **Playwright Chromium** `page.pdf()` (A4, 20mm margins). Served by `app/api/export/compliance-report/route.ts`.
- `report-template.ts` already branches on `organisations.rezimPovinnosti` (`"vyssi"`/`"nizsi"`, schema line 102) and labels vyhláška 409 vs 410 — A2's cz-vbo-n branch hooks in here or as a sibling template.
- **`REVIEW_DISCLAIMER` constant does NOT exist** anywhere in the repo, nor the phrase "Výstup je návrh vygenerovaný AI". A2 will define it (proposed home: `lib/export/constants.ts`) and use it in the export footer.
- Blob storage available: `@vercel/blob` used by policies/evidence download routes; `BLOB_READ_WRITE_TOKEN` configured. A2 `prehled_versions` will store the PDF in blob storage + snapshot JSON in the row (byte-identical re-download = serve the stored blob, never re-render).
- ⚠️ Playwright-on-Vercel: the existing compliance-report route already uses this pipeline in production, so A2 inherits a working pattern.

## 5. A2/A3 model decisions (proposed)

- A2's three-status enum (`zavedeno`/`planovano`/`nezavedeno` + per-status required fields) is **per baseline ID, per org** — new table `prehled_entries` (org, baselineId, status, fields, updatedAt) rather than overloading `org_control_statuses` (whose CHECK enum and semantics serve automated/manual control testing). The statutory Přehled is a distinct legal artifact.
- A2 versions: new table `prehled_versions` (org, createdAt, createdBy, blobKey, snapshot jsonb).
- A3 records: new tables `vbo_responsible_persons`, `vbo_management_trainings`, `vbo_recovery_priorities` (org-scoped, CRUD only). Coverage rules per N-4-xx defined in code (see §7).
- Opt-in: **organisations.rezimPovinnosti === "nizsi"** gates the cz-vbo-n surfaces (gap view, Přehled export). Orgs without it see no change — satisfies "zero changes unless they opt in". *(Confirm below.)*

## 6. Proposed coverage semantics

For baseline ID **X**: controls whose `baselineRefs` contain X are its *mapped controls*; their org statuses come from `org_control_statuses`.

- **missing** — no mapped controls (or org has no status rows for any of them)
- **covered** — ≥1 mapped control and **all** mapped controls with statuses are `pass`
- **partial** — everything else (mapped controls exist; some/none passing)

A3 record rules (N-4-xx) override upward: a satisfied record rule makes the ID at least `covered` regardless of control mapping. *(Confirm below.)*

## 7. PROPOSED MAPPING TABLE (for your review — not yet applied)

Legend: ✓ = reasonable direct match · (p) = partial/loose match, will still report `partial` until statuses pass · — = no existing control (gap view will show it).

| Baseline ID | Area | Proposed existing control key(s) | Fit |
|---|---|---|---|
| N-3.1-01 | Systém min. KB | — *(the Přehled itself; A2 feature is the remedy, not a control)* | — |
| N-3.1-02 | Systém min. KB | ctrl_security_policy_approved | ✓ |
| N-3.1-03 | Systém min. KB | ctrl_media_disposal | (p) |
| N-3.1-04 | Systém min. KB | ctrl_supplier_contract_security | ✓ |
| N-3.1-05 | Systém min. KB | ctrl_secure_development_policy | (p) |
| N-4-01 | Vrcholné vedení | ctrl_security_roles_responsibilities + **A3 rule:** pověřená osoba record with qualification evidence | (p)/A3 |
| N-4-02 | Vrcholné vedení | **A3 rule:** every management member has vstupní školení + last pravidelné ≤ 12 months | A3 |
| N-4-03 | Vrcholné vedení | — *(no record type in A3; see open question Q2)* | — |
| N-4-04 | Vrcholné vedení | ctrl_management_review | ✓ |
| N-4-05 | Vrcholné vedení | — | — |
| N-4-06 | Vrcholné vedení | **A3 rule:** ≥1 recovery priority + "schváleno vedením dne" set | A3 |
| N-5-01 | Lidské zdroje | ctrl_security_policy_approved | (p) |
| N-5-02 | Lidské zdroje | ctrl_security_training_annual, ctrl_password_policy | ✓ |
| N-5-03 | Lidské zdroje | ctrl_security_training_annual | (p) |
| N-6-01 | Kontinuita | ctrl_business_continuity_plan | ✓ |
| N-6-02 | Kontinuita | ctrl_business_continuity_plan, ctrl_incident_plan_documented | (p) |
| N-6-03 | Kontinuita | ctrl_backup_policy, ctrl_backup_tested | ✓ |
| N-10-01 | Incidenty | ctrl_incident_plan_documented | (p) |
| N-10-02 | Incidenty | ctrl_incident_plan_documented | (p) |
| N-10-03 | Incidenty | ctrl_logging_monitoring, ctrl_security_event_alerting | ✓ |
| N-10-04 | Incidenty | ctrl_incident_72h_notification | ✓ |
| N-10-05 | Incidenty | — *(závěrečná zpráva — B1 scope)* | — |
| V-7-01 | Přístup | ctrl_identity_lifecycle_policy, ctrl_privileged_access_reviewed | ✓ |
| V-7-02 | Přístup | ctrl_identity_lifecycle_policy | (p) |
| V-7-03 | Přístup | ctrl_mobile_device_management | ✓ |
| V-7-04 | Přístup | ctrl_privileged_access_reviewed, ctrl_guest_access_controlled | ✓ |
| V-7-05 | Přístup | ctrl_offboarding_access_revoked | ✓ |
| V-7-06 | Přístup | ctrl_physical_access_control | ✓ |
| V-8-01 | Identity | ctrl_password_policy, ctrl_identity_lifecycle_policy | (p) |
| V-8-02 | Identity | ctrl_mfa_all_users, ctrl_password_policy | ✓ |
| V-8-03 | Identity | — *(recovery-credential parametry — B2 scope)* | — |
| V-9-01 | Detekce | — *(perimetr filtering; no existing control)* | — |
| V-9-02 | Detekce | ctrl_endpoint_protection | ✓ |
| V-9-03 | Detekce | — *(autorun výměnných médií)* | — |
| V-9-04 | Detekce | ctrl_security_event_alerting | ✓ |
| V-9-05 | Detekce | ctrl_endpoint_protection | (p) |
| V-9-06 | Detekce | ctrl_logging_monitoring | ✓ |
| V-9-07 | Detekce | ctrl_data_retention_schedule, ctrl_logging_monitoring | (p) |
| V-11-01 | Sítě | ctrl_network_segmentation | ✓ |
| V-11-02 | Sítě | ctrl_network_segmentation | (p) |
| V-11-03 | Sítě | ctrl_information_transfer_rules | (p) |
| V-11-04 | Sítě | ctrl_remote_work_policy, ctrl_conditional_access | ✓ |
| V-12-01 | Aplikační | ctrl_patch_management | ✓ |
| V-12-02 | Aplikační | ctrl_asset_inventory, ctrl_vulnerability_management | (p) |
| V-12-03 | Aplikační | ctrl_vulnerability_management, ctrl_dependency_vulnerability_monitoring | ✓ |
| V-13-01 | Kryptografie | ctrl_cryptography_policy | ✓ |
| V-13-02 | Kryptografie | — *(E2E komunikace; ctrl_cryptography_policy je o politice, ne o komunikačních kanálech)* | — |

**Totals:** 38 of 47 IDs get ≥1 mapped control; **9 unmapped** (N-3.1-01, N-4-03, N-4-05, N-10-05, V-8-03, V-9-01, V-9-03, V-13-02 + N-4-02 control-less but A3-ruled) → these populate the A1 gap view, which is the desired honest outcome (several are explicitly B-task scope).

## 8. Open questions before implementation

- **Q1 — coverage semantics** (§6): is "covered = all mapped statuses pass" the rule you want, or "≥1 passes"?
- **Q2 — N-4-03/N-4-04/N-4-05:** A3 defines record rules only for N-4-01/02/06. Proposal: N-4-04 maps to `ctrl_management_review`; N-4-03 and N-4-05 stay unmapped gaps (honest — no feature covers them yet). OK, or should A3 add an attestation field for them?
- **Q3 — opt-in gate:** `organisations.rezimPovinnosti === "nizsi"` as the trigger for all cz-vbo-n surfaces? (Field exists and is already used by the export template.)
- **Q4 — A2 statuses in a new `prehled_entries` table** (not `org_control_statuses`) — confirm.
- **Q5 — REVIEW_DISCLAIMER** doesn't exist; A2 will create it with the brief's wording ("Výstup je návrh vygenerovaný AI a vyžaduje odbornou kontrolu před použitím." — exact wording yours to adjust).

No codebase contradictions with the brief were found beyond the absent REVIEW_DISCLAIMER constant (brief anticipated this with "if present").
