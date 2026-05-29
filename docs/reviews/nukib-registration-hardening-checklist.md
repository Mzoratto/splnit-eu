# NÚKIB Registration Artifact Hardening Checklist

Date: 2026-05-29
Branch reviewed: `codex/nukib-registration-artifact`
Status: beta/internal design-partner asset, not production-ready public claim

## Positioning

This feature should not be marketed as a production-ready filing solution yet.
It can be shown to Czech design partners as a beta artifact generator:

> "This is the NÚKIB registration prep workflow we are building. It helps collect the data you would need to prepare before filing on the NÚKIB portal. We want feedback before treating it as production-ready."

The page should make that posture visible in-product with a beta/design-partner banner.

## P1 hardening before first Czech design-partner demo

### 1. Move all UI copy into the i18n message system

Why: Splnit.eu is Czech/Italian/English. Hardcoded Czech copy inside the component makes the feature structurally Czech-only and creates future rewrite cost.

Required work:

- Move page headings, labels, hints, button copy, status text, validation fallback text, and beta banner copy out of `app/(app)/compliance/nukib-registration/page.tsx`.
- Add keys to:
  - `messages/cs-CZ.json`
  - `messages/it-IT.json`
  - `messages/en-EU.json`
- Keep Czech as the primary reviewed copy for this feature.
- Use honest fallback wording in Italian/English: this is a Czech NÚKIB preparation artifact, not an Italian or EU-wide filing tool.

Acceptance criteria:

- No user-facing NÚKIB page copy remains hardcoded in the page component, except stable product/legal names such as `NÚKIB` and statute references when intentionally literal.
- Czech, Italian, and English locales render without missing keys.
- Copy does not imply legal filing, certification, or production-ready status.

Verification:

```bash
npm run typecheck
npm run lint
npm run build
npm run smoke:i18n-shell
npx playwright test tests/e2e/nukib-registration.spec.ts --project=chromium
```

### 2. Add visible beta/design-partner framing

Why: Beta does not mean hidden. This is a strong Czech design-partner asset, but it must not be confused with a production-ready regulatory filing promise.

Required work:

- Add a visible banner on `/compliance/nukib-registration`.
- Frame it as preparation support and feedback-oriented beta.
- Do not add public marketing claims.
- If linked, link only from an internal/beta Czech compliance area, not broad public marketing.

Acceptance criteria:

- User sees the beta/design-partner status before entering data.
- Banner states that submission still happens on the official NÚKIB portal.
- Banner avoids legal advice, filing guarantee, compliance guarantee, and production-ready wording.

### 3. Replace masked/possibly-derived fixture data with obviously synthetic valid data

Why: `+420****6789` is masked, not clearly synthetic. For a compliance product, repo fixtures should demonstrate clean data hygiene.

Required work:

- Replace masked contact data in `scripts/fixtures/nukib-registration-fixture.json` with obviously fake but valid Czech test data, e.g. `+420 200 000 001`.
- Ensure all emails use reserved/synthetic domains such as `example.test`.
- Check git history for any unmasked version of the same phone/contact data before demoing this to a security-conscious buyer.

Acceptance criteria:

- Fixture contains no masked real-looking data.
- Fixture remains schema-valid.
- Git-history check has been run and documented in the PR/review notes.

Verification:

```bash
npx tsx scripts/validate-nukib-template.ts
git log -S '+420' -- scripts/fixtures/nukib-registration-fixture.json app lib scripts tests
```

### 4. Document data residency for registration artifacts

Why: This route stores IČO, service descriptions, security/technical contacts, domains, IP ranges, and CIDR blocks. For a Czech regulated entity, that is sensitive infrastructure and filing-prep data.

Required work:

- Confirm the production Neon region that stores `generated_artifacts`.
- Confirm Vercel runtime/data handling for this route.
- Document whether the data path is EU-only or whether US-controlled infrastructure/processors are involved.
- Add this feature to the data-processing map if not already covered by generated artifacts.

Acceptance criteria:

- A Czech design partner can be told where this data is stored and which processors touch it.
- If EU-only storage is not true, the product copy and partner conversation do not imply EU-only residency.
- Data residency/responsibility is documented before collecting real customer network topology.

Verification:

```bash
# Verify metadata only. Do not print database credentials.
npm run check:production-migration-drift
```

Also verify Vercel/Neon region metadata using the existing redacted production-env inspection pattern.

Lane D documentation status, 2026-05-29:

- Added the NÚKIB registration preparation-artifact operation to `docs/legal/data-processing-map.md`.
- Current implementation stores registration artifact content in Neon `generated_artifacts` and generates the PDF on demand in the Vercel Node.js runtime; Blob is not used by this route.
- `npm run check:production-migration-drift` was run without printing credentials. It confirmed the configured database host class is `neon`, but did not expose or verify the production Neon region. The command failed because production has 26 applied migrations while this checkout expects 23, so migration drift must be resolved separately.
- Remaining open data-residency decisions: confirm production Neon region, Vercel runtime region/data handling, Vercel log retention/content for this route, transfer mechanisms/subprocessor terms, and whether any non-EU or US-controlled infrastructure/processors touch the data path.
- Partner guardrail until those decisions close: describe this as a feedback-beta preparation artifact only; do not claim EU-only residency, production filing readiness, legal advice, or guaranteed NÚKIB acceptance.

### 5. Add PDF content-fidelity test

Why: A PDF that downloads but omits or mis-maps fields is worse than a failed PDF, because users will trust it in compliance prep.

Required work:

- Extend `tests/e2e/nukib-registration.spec.ts` or add a focused test.
- Submit known fixture data.
- Download the PDF.
- Extract text with `pdftotext` or a project-approved PDF text extraction helper.
- Assert key fields appear:
  - IČO
  - organisation name
  - at least one contact name
  - at least one contact email
  - at least one domain or IP/CIDR value

Acceptance criteria:

- PDF test fails if the PDF renderer drops core fields.
- Test checks content, not only byte length and content type.
- CI installs/uses the required PDF extraction tooling consistently.

Verification:

```bash
npx playwright test tests/e2e/nukib-registration.spec.ts --project=chromium
```

## P1 hardening already identified by engineering review

- Make NÚKIB E2E env explicit so local Clerk keys do not produce false 401 failures.
- Add API negative tests: invalid JSON, unauthorized access, no artifact, invalid UUID, wrong-org artifact.
- Strengthen IP/CIDR validation beyond loose regex.
- Strengthen phone validation or intentionally label it as free text.
- Store NÚKIB artifact content as object JSONB, not string-cast JSON.

## P2 hardening before production/broad rollout

- Split the 1008-line client page into section components and mapper modules.
- Add browser UI E2E for form fill, validation, submit, reload, download, and mobile overflow.
- Add authenticated Clerk/org smoke for the real app path.
- Decide whether DOCX review exports belong in git or CI artifacts.
- Add a production smoke only when this leaves beta/internal status.

## Not in scope

- Automating NÚKIB portal submission.
- BankID/datová schránka automation.
- Public Trust Center disclosure of registration data, IP ranges, domains, contact names, or artifact filenames.
- Claims of legal advice, completed filing, certification, or regulatory approval.
- General Czech compliance-platform expansion beyond this artifact-prep slice.
