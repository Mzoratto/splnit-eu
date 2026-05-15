# Operator Identity and DPO Closeout

Last updated: 2026-05-14

Status: owner/counsel decision packet. This file is the next P0 blocker before changing public legal pages. Do not copy bracketed fields into public copy.

## Current Finding

The repository does not contain the final OSVČ/operator identity needed for public legal terms. Current public legal copy intentionally uses draft wording such as final name, IČO, ARES link, and address must be completed before production launch.

Known from existing public copy and docs:

- operator form: Czech sole trader / OSVČ;
- locality used in footer copy: Olomouc;
- current public contact used across legal/support/trust copy: `hello@splnit.eu`;
- public legal copy source to update later: `lib/legal/legal-page-copy.ts`;
- routes impacted later: `/soukromi`, `/cookies`, `/dpa`, `/podminky`;
- footer/marketing copy may also need update after final identity is approved.

Do not use `Splnit Technology s.r.o.`. It is not the operator.

## Decision Required From Owner/Counsel

Fill this table with exact approved values before public legal pages are edited.

| Field | Required value | Current status | Notes |
| --- | --- | --- | --- |
| Legal operator name | `[LEGAL_OPERATOR_NAME]` | missing | Exact OSVČ name as registered/used for contracting. |
| IČO | `[ICO_NUMBER]` | missing | Czech business ID. Verify formatting for public Czech copy. |
| ARES URL | `[ARES_URL]` | missing | Link to public ARES record. |
| Registered address / seat | `[REGISTERED_ADDRESS]` | missing | Confirm whether full address should appear publicly and in contracts. |
| VAT status / DIČ | `[VAT_STATUS_OR_DIC]` | missing | State VAT payer / non-payer status and DIČ if applicable. |
| Primary privacy contact | `hello@splnit.eu` or `[PRIVACY_CONTACT]` | provisional | Confirm mailbox is monitored and acceptable for data-subject/DPA/security questions. |
| Primary support/contact email | `hello@splnit.eu` or `[SUPPORT_CONTACT]` | provisional | Confirm same mailbox or separate support/security address. |
| Contracting language | Czech first; English-EU mirror; Italian localized layer | proposed | Confirm whether Czech is the governing/source language. |
| Governing law / courts | `[CZECH_GOVERNING_LAW_AND_COURTS]` | missing | Also affects `/podminky`. |
| Customer scope | `[B2B_ONLY_OR_CONSUMER_SCOPE]` | missing | Confirm if terms are B2B-only and whether consumer rules must be addressed. |

## DPO Decision Required

The current legal review asks whether a DPO is required or voluntarily appointed. Owner/counsel must choose exactly one option.

| Option | Public meaning | When to use | Public copy impact |
| --- | --- | --- | --- |
| No DPO appointed | Splnit.eu has not appointed a DPO; privacy requests go to the privacy contact. | Counsel confirms no mandatory DPO and no voluntary appointment. | Add clear no-DPO wording to `/soukromi`; DPA contact remains privacy/security mailbox. |
| Voluntary DPO/contact appointed | A named DPO or privacy lead is appointed voluntarily. | Owner wants a formal role despite no mandatory requirement. | Add DPO name/contact or role mailbox; avoid implying statutory appointment unless true. |
| Mandatory DPO appointed | DPO is legally required and appointed. | Counsel confirms Article 37 or Czech-specific requirement applies. | Add DPO identity/contact and any required details. |

Recommended default only if counsel agrees: no DPO appointed; privacy, DPA, subprocessor, objections, and security questions go to a monitored `hello@splnit.eu` or dedicated privacy/security mailbox.

## Czech Public Copy Replacement Targets

After owner/counsel provides the approved values, update Czech copy first in `lib/legal/legal-page-copy.ts`.

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

- [ ] Owner provided legal name.
- [ ] Owner provided IČO.
- [ ] Owner provided ARES URL or confirmed ARES record.
- [ ] Owner/counsel approved registered address/seat display.
- [ ] Owner/counsel approved VAT/DIČ wording.
- [ ] Owner/counsel approved privacy/support/security contact mailbox.
- [ ] Counsel confirmed DPO option.
- [ ] Counsel confirmed governing law/jurisdiction and B2B/consumer scope.
- [ ] Update Czech public legal copy first.
- [ ] Mirror into English-EU and Italian without stronger claims.
- [ ] Run copy hygiene, lint, typecheck, and browser-check Czech legal routes.
