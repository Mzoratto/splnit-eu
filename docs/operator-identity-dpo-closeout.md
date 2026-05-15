# Operator Identity and DPO Closeout

Last updated: 2026-05-14

Status: owner/counsel decision packet. This file is the next P0 blocker before changing public legal pages. Do not copy bracketed fields into public copy.

## Current Finding

ARES public search for `Marco Zoratto` returned one economic subject on 2026-05-15. The public legal pages have not been updated yet; they still intentionally use draft wording such as final name, IČO, ARES link, and address must be completed before production launch.

Verified ARES facts:

- source: ARES public API search and detail endpoint;
- ARES UI URL: https://ares.gov.cz/ekonomicke-subjekty?ico=23821370;
- ARES detail API: https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/23821370;
- legal operator name / obchodní jméno: Marco Zoratto;
- IČO: 23821370;
- seat / sídlo: č.p. 424, 78347 Hněvotín, Česká republika;
- region/district from ARES: Olomoucký kraj / Olomouc;
- date of creation / datum vzniku: 2025-10-09;
- ARES update date / datum aktualizace: 2026-01-10;
- registration states: ROS active, RES active, RŽP active;
- VAT source state in ARES: DPH `NEEXISTUJICI` and SK DPH `NEEXISTUJICI`; counsel/owner should translate this into final VAT/DIČ public wording.

Known from existing public copy and docs:

- operator form: Czech sole trader / OSVČ;
- current public contact used across legal/support/trust copy: `hello@splnit.eu`;
- public legal copy source to update later: `lib/legal/legal-page-copy.ts`;
- routes impacted later: `/soukromi`, `/cookies`, `/dpa`, `/podminky`;
- footer/marketing copy may also need update after final identity is approved.

Do not use `Splnit Technology s.r.o.`. It is not the operator.

## Decision Required From Owner/Counsel

Fill this table with exact approved values before public legal pages are edited.

| Field | Required value | Current status | Notes |
| --- | --- | --- | --- |
| Legal operator name | Marco Zoratto | owner accepted ARES value; counsel/public-copy acceptance pending | Exact ARES `obchodniJmeno`. |
| IČO | 23821370 | owner accepted ARES value; counsel/public-copy acceptance pending | Czech business ID from ARES. |
| ARES URL | https://ares.gov.cz/ekonomicke-subjekty?ico=23821370 | owner accepted ARES value; counsel/public-copy acceptance pending | Public ARES UI URL returned HTTP 200. |
| Registered address / seat | č.p. 424, 78347 Hněvotín, Česká republika | owner accepted ARES value; counsel/public-copy acceptance pending | Use this exact public ARES seat unless counsel recommends a different display format. |
| VAT status / DIČ | ARES shows DPH `NEEXISTUJICI` and SK DPH `NEEXISTUJICI` | ARES checked; owner unsure; counsel wording pending | This is the Czech VAT-registration question: whether public/contract copy should say non-VAT payer / not registered for VAT, omit VAT wording, or include another approved DIČ/VAT statement. |
| Primary privacy contact | `hello@splnit.eu` | owner accepted; counsel/public-copy acceptance pending | Confirm mailbox is monitored and acceptable for data-subject/DPA/security questions. |
| Primary support/contact email | `hello@splnit.eu` | owner accepted; counsel/public-copy acceptance pending | Same mailbox is accepted for now for support/security/legal contact. |
| Contracting language | Czech first; English-EU mirror; Italian localized layer | proposed | Confirm whether Czech is the governing/source language. |
| Governing law / courts | likely Czech law/courts, exact clause pending | owner asked for explanation; counsel wording pending | Also affects `/podminky`; see Terms Scope Explanation below. |
| Customer scope | likely B2B-only SaaS, exact exclusion/consumer wording pending | owner asked for explanation; counsel wording pending | Confirm if terms are B2B-only and whether consumer rules must be addressed. |

## DPO Decision Required

Owner status as of 2026-05-15: DPO status remains under legal review for Czech-law compliance. Do not publish a final no-DPO or appointed-DPO statement until counsel confirms the position.

The current legal review asks whether a DPO is required or voluntarily appointed. Owner/counsel must choose exactly one option.

| Option | Public meaning | When to use | Public copy impact |
| --- | --- | --- | --- |
| No DPO appointed | Splnit.eu has not appointed a DPO; privacy requests go to the privacy contact. | Counsel confirms no mandatory DPO and no voluntary appointment. | Add clear no-DPO wording to `/soukromi`; DPA contact remains privacy/security mailbox. |
| Voluntary DPO/contact appointed | A named DPO or privacy lead is appointed voluntarily. | Owner wants a formal role despite no mandatory requirement. | Add DPO name/contact or role mailbox; avoid implying statutory appointment unless true. |
| Mandatory DPO appointed | DPO is legally required and appointed. | Counsel confirms Article 37 or Czech-specific requirement applies. | Add DPO identity/contact and any required details. |

Recommended default only if counsel agrees: no DPO appointed; privacy, DPA, subprocessor, objections, and security questions go to a monitored `hello@splnit.eu` or dedicated privacy/security mailbox.

## Terms Scope Explanation

This is what the B2B/Czech-law question means.

### Customer scope

You need the terms to say who is allowed to buy/use Splnit.eu.

Most likely position for Splnit.eu, if counsel agrees:

```text
Splnit.eu is intended for business customers, entrepreneurs, companies, and organisations, not for consumers using the service for private household purposes.
```

Why this matters:

- B2B-only terms can be simpler and can avoid consumer-specific cancellation/withdrawal rules.
- If consumers can buy or subscribe, Czech/EU consumer protection rules may require extra notices, withdrawal/cancellation wording, and payment disclosures.
- If the app has self-serve checkout, pricing pages, or onboarding that does not block consumers, counsel should decide whether B2B-only wording is enough or whether consumer terms are needed.

### Governing law and courts

This decides which law applies to the contract and where disputes are handled.

Likely Czech-first position, if counsel agrees:

```text
The contract is governed by Czech law. Disputes are handled by the competent courts of the Czech Republic, unless mandatory law says otherwise.
```

Why this matters:

- It keeps the Czech OSVČ/operator position consistent with the public legal pages.
- It gives a default dispute forum for customer contracts.
- For EU customers, mandatory local/customer-protection rules may still override parts of the clause, especially if consumers are allowed.

Counsel should provide the exact Czech wording before `/podminky` is finalized.

## Czech Public Copy Replacement Targets

After owner/counsel accepts the ARES-verified values and provides the remaining decisions, update Czech copy first in `lib/legal/legal-page-copy.ts`.

### `/soukromi` Privacy Policy

Replace draft intro/controller wording with approved Czech text along these lines:

```text
Tyto zásady popisují, jak [LEGAL_OPERATOR_NAME], IČO [ICO_NUMBER], se sídlem [REGISTERED_ADDRESS], provozující službu Splnit.eu, zpracovává osobní údaje návštěvníků webu, uživatelů aplikace, obchodních kontaktů a osob, jejichž údaje zákazník do služby vloží.
```

Controller/contact block should include:

```text
Správcem pro web, obchodní komunikaci, účet zákazníka, fakturaci a provozní bezpečnost je [LEGAL_OPERATOR_NAME], IČO [ICO_NUMBER], [REGISTERED_ADDRESS]. Záznam v ARES: [ARES_URL]. Pro dotazy k ochraně osobních údajů nás kontaktujte na [PRIVACY_CONTACT].
```

DPO line should be one of:

```text
Pověřenec pro ochranu osobních údajů nebyl jmenován. Žádosti a dotazy k ochraně osobních údajů posílejte na [PRIVACY_CONTACT].
```

or

```text
Pověřencem pro ochranu osobních údajů je [DPO_NAME_OR_ROLE], kontakt [DPO_CONTACT].
```

### `/dpa` DPA

Replace processor identity wording with approved Czech text:

```text
U zákaznických dat vystupuje [LEGAL_OPERATOR_NAME], IČO [ICO_NUMBER], provozující službu Splnit.eu, zpravidla jako zpracovatel a zákazník jako správce. U obchodní komunikace a provozních metrik vystupujeme jako správce.
```

Confirm whether the DPA contact remains:

```text
Kontaktní adresa pro DPA, subdodavatele, námitky a bezpečnostní otázky je [PRIVACY_OR_SECURITY_CONTACT].
```

### `/podminky` Terms

Replace service operator wording with approved Czech text:

```text
Službu Splnit.eu provozuje [LEGAL_OPERATOR_NAME], IČO [ICO_NUMBER], se sídlem [REGISTERED_ADDRESS], zapsaný/á v živnostenském rejstříku. Záznam v ARES: [ARES_URL].
```

Counsel must also approve governing law, jurisdiction, liability, refunds/cancellation, SLA/support, and B2B/consumer scope before these terms are final.

### `/cookies`

Operator identity may not need a full replacement if the cookie page only points to privacy/contact details, but confirm:

- optional analytics providers listed match production reality;
- contact mailbox is final;
- no draft operator wording remains if reused from privacy copy.

## English-EU and Italian Mirroring Rules

After Czech approval:

- English-EU should translate the approved Czech legal position without adding stronger guarantees.
- Italian should remain a localization layer unless Italian counsel/advisor approves Italian-specific claims.
- Do not leave unexplained `OSVČ` in English/Italian public copy unless paired with a plain-language explanation such as Czech sole-trader operator / lavoratore autonomo registrato nella Repubblica Ceca.

## ARES Verification Step

When the owner provides IČO or ARES URL:

1. Open the ARES public record.
2. Confirm the exact name, IČO, registered address/seat, active status, and VAT/DIČ information if relevant.
3. Capture the ARES URL in this file or in counsel notes.
4. Do not infer or guess address/name details from memory.

## Before Public Legal Page Edit

- [x] ARES search verified legal name: Marco Zoratto.
- [x] ARES search verified IČO: 23821370.
- [x] ARES UI/API URL captured: https://ares.gov.cz/ekonomicke-subjekty?ico=23821370.
- [x] Owner accepted ARES-verified operator identity/address for public/contract use, subject to counsel/public-copy wording.
- [ ] Owner/counsel approved VAT/DIČ wording.
- [x] Owner approved `hello@splnit.eu` as privacy/support/security contact, subject to counsel/public-copy wording.
- [ ] Counsel confirmed DPO option; currently under Czech-law legal review.
- [ ] Counsel confirmed governing law/jurisdiction and B2B/consumer scope.
- [ ] Update Czech public legal copy first.
- [ ] Mirror into English-EU and Italian without stronger claims.
- [ ] Run copy hygiene, lint, typecheck, and browser-check Czech legal routes.
