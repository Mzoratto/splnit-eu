# Brief: Integrace NÚKIB baseline (vyhláška č. 410/2025 Sb., režim nižších povinností)

**Spec file:** `regulations/cz-vbo-n/v1.1.json` (47 controls, extracted from NÚKIB Manuál v1.1, 2. 6. 2026)
**Scope:** Tranche A only (tasks A1–A3). Do not start B/C tasks.

## Ground rules

- **Audit before write.** Before touching anything, map the existing control library, i18n message files, and PDF export code. Produce a short written audit (file paths, key names, data model) and STOP for review before implementing.
- Czech copy follows existing style rules: úřední čeština, correct diacritics, legal refs formatted as "vyhláška č. 410/2025 Sb., § 3 odst. 2" / "§ 15 zákona č. 264/2025 Sb." Never invent paragraph numbers — every legal ref must come from the spec JSON.
- Forbidden phrases anywhere in UI/exports: "soulad zaručen", "certifikováno NÚKIB", "jste v souladu". Use "návrh dle požadavků vyhlášky", "doporučená opatření".
- **CZ-first:** all new copy ships in `cs` only. For `en`/`it`, do not write translations — add the new keys with the Czech value as placeholder (or whatever the project's existing fallback convention is; confirm in audit) so builds don't break. Localization is postponed pending CZ market feedback.
- Conventional commits, one task = one PR-sized commit series. Run the existing test suite + lint before declaring a task done.

---

## A1 — Baseline ingestion + coverage computation

1. Add `regulations/cz-vbo-n/v1.1.json` as a versioned regulation config (copy provided file verbatim; do not edit its content).
2. Extend the control data model with `baselineRefs: string[]` (IDs like `N-4-01`). Migration must default to `[]`, no data loss.
3. In the audit step, propose a mapping of every existing control to baseline IDs. **Do not auto-apply** — output the proposed mapping table for human review; statuses in any pre-existing coverage estimates are unverified.
4. Implement a coverage service: for a workspace, return per-baseline-ID status derived from mapped controls (`covered` / `partial` / `missing`), grouped by `tier` and `area`. Unit-test with fixture data.
5. Gap view in UI: list baseline IDs with no mapped control, tier badge (neopominutelné = always required; vyhodnotitelné = assessable), provision ref, control text from JSON.

**Acceptance:** new regulation selectable; coverage endpoint returns all 47 IDs; gap list renders; zero changes to existing workspaces' behavior unless they opt in.

## A2 — Přehled bezpečnostních opatření (formal export)

Rework the compliance PDF export for cz-vbo-n workspaces into the statutory "Přehled bezpečnostních opatření" (§ 3 odst. 2 VBO-N):

1. Per control, status enum: `zavedeno` (requires: popis zavedení), `planovano` (requires: termín, priorita, odpovědná osoba), `nezavedeno` (requires: odůvodnění). Validation: the required fields are hard-required per status.
2. Tier logic: `neopominutelné` controls cannot be `nezavedeno` — only degree of implementation; UI must not offer that option. `vyhodnotitelné` controls can, but odůvodnění is mandatory and rendered in the export.
3. Export layout: header (organizace, datum, verze dokumentu), sections by tier then area, footer with the review disclaimer ("Výstup je návrh vygenerovaný AI…" — reuse existing REVIEW_DISCLAIMER constant if present).
4. Version retention: every generated export is stored immutably (new table, e.g. `prehled_versions`: workspace, created_at, created_by, pdf blob/objstore key, snapshot JSON of statuses). UI: list + download of past versions. Retention note in UI: "uchovávejte verze nejméně 4 roky".
5. Annual review nudge: if newest version older than 11 months, show a reminder banner.

**Acceptance:** export validates against the three-status schema; a neopominutelné control cannot be saved as nezavedeno; versions persist and re-download byte-identical.

## A3 — Workspace "Vrcholné vedení" (§ 4)

New workspace/module with three records, CRUD only, no integrations:

1. **Pověřená osoba KB:** jméno, datum určení, odkaz/upload dokumentu ukotvujícího pravomoci, doklad odborné způsobilosti (školení/certifikace/praxe — free text + optional file).
2. **Školení vrcholného vedení:** per member — jméno, funkce, datum vstupního školení, datum posledního pravidelného školení, zdroj školení. Reminder when last training > 12 months (configurable). Link the free NÚKIB courses: https://osveta.nukib.gov.cz/.
3. **Priority obnovy:** ordered list of primary assets (název, pořadí, poznámka), plus "schváleno vedením dne" date field.
4. Wire these to baseline IDs N-4-01..N-4-06 via `baselineRefs` so A1 coverage flips automatically when records exist (define the rule per ID in code, e.g. N-4-01 covered iff a pověřená osoba record with qualification evidence exists).

**Acceptance:** creating the records changes the relevant gap statuses in the A1 view; reminders fire on stale training dates; i18n complete in cs; en/it keys present with fallback values.

---

## Backlog (do NOT implement now — context only)

- **B1 (§ 10/§ 14–16):** incident significance wizard, NÚKIB Portál reporting deadline surfacing, závěrečná zpráva template via policy generator.
- **B2 (§ 8):** encode parameter checks — MFA-conditional password fallback (12/17/22 chars, history 12, max age 18 months), lockout, session re-auth; M365 where reachable, attestation+evidence otherwise. Recovery credential 24h TTL as attestation.
- **C1 (příloha 2):** supplier contract clause checklist incl. 5 disposal clauses, per-supplier N/A with note.
