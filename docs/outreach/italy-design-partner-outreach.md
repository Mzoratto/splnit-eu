# Italy Design Partner Outreach Playbook

Status: internal operating doc.
Owner: founder.
Scope: first 50 Italian SMB outreach targets for Splnit.eu early access.

Do not treat this as proof of customer demand. It is a process for creating proof.

## Goal

Book 3 real conversations and earn 1 verbal design-partner commitment from 50 researched Italian SMB outreach attempts.

The call objective is learning first, not closing. Design partner terms are offered only when the company has a real NIS2, GDPR, or ISO 27001 problem Splnit.eu can support honestly.

## Guardrails

- Do not say Splnit.eu has customers, references, advisors, certifications, or audited mappings unless that proof exists.
- Do not send a generic email without a company-specific hook.
- Do not claim ACN, Garante, ISO, or legal-advisor review for material still marked draft.
- Do not promise more than the first 10 design partner slots or more than 5 active onboardings at once.
- Do not use Czech proof, Czech legal review, or Czech regulator language as the primary credibility signal for Italian buyers.

## Target Criteria

Use this filter before adding a company to the tracker:

- Country: Italy.
- Size: 50-250 employees.
- Priority sectors: ICT services, software, healthcare, pharmaceuticals, manufacturing, energy.
- Buyer roles: CTO, CIO, IT Manager, Responsabile Sicurezza Informatica, DPO, Direttore IT.
- Likely pain: NIS2 scope pressure, GDPR audit readiness, supplier questionnaire pressure, ISO 27001 customer requirement.

Reject targets where:

- The company is too small to feel the compliance pain now.
- The company is too large for a solo-founder onboarding motion.
- The available contact is not plausibly connected to security, IT, privacy, or procurement.
- The hook is only "you are in Italy" or "NIS2 exists".

## Research Hook Checklist

One hook per target. Use one of:

- Sector exposure: "ICT managed services", healthcare, energy, manufacturing supply chain, SaaS selling to enterprise.
- Public signal: hiring security/compliance roles, ISO page, privacy/DPO page, enterprise customer logos, public tenders.
- Trigger event: recent funding, new product, acquisition, international expansion, public-sector work.
- Compliance signal: NIS2-relevant sector, GDPR-heavy processing, supplier/security questionnaire language.

Hook quality rule:

- Good: "Ho visto che fornite servizi IT gestiti a clienti industriali: immagino che NIS2 e i questionari dei clienti stiano diventando più concreti."
- Weak: "La vostra azienda potrebbe essere interessata a NIS2."

## First-Touch Email

Subject:

```text
NIS2 / GDPR - domanda breve da uno sviluppatore italiano
```

Body:

```text
Buongiorno [Cognome],

mi chiamo [Your Name], sono uno sviluppatore italiano che vive a Olomouc
(Repubblica Ceca). Sto costruendo Splnit.eu: una piattaforma per automatizzare
la conformità a NIS2 (D.Lgs. 138/2024) e GDPR per PMI italiane.

Le scrivo perché [UNA FRASE SPECIFICA: settore, dimensione, indizio NIS2,
notizia recente, customer/supplier pressure].

Non sto cercando un cliente adesso. Cerco 30 minuti del Suo tempo per capire
cosa rende la conformità frustrante in azienda e cosa potrebbe davvero aiutare.
Posso fare una call quando Le è comodo.

Per i primi 10 design partner ho un'offerta dedicata: piano Business gratis per
12 mesi e onboarding personale di 3 settimane. Ma è secondario: l'obiettivo
della call è capire il problema, non vendere.

Vale 30 minuti la prossima settimana?

Cordiali saluti,
[Your Name]
[Telefono] · [LinkedIn]
Splnit.eu - [Your Name], OSVČ, IČO [number]
```

## Follow-Up

Send 5-7 working days after first touch if no reply.

Subject:

```text
Re: NIS2 / GDPR - domanda breve da uno sviluppatore italiano
```

Body:

```text
Buongiorno,

so che ha l'agenda piena, non insisto.

Solo una cosa che potrebbe servirLe: ho costruito uno strumento gratuito di
NIS2 scoping che in 2 minuti indica se e come D.Lgs. 138/2024 può riguardare
la Sua azienda.
https://splnit.eu/it/strumenti/nis2-scope

Se in futuro avesse senso parlarne, basta rispondere a questa email.

Buona giornata,
[Your Name]
```

## Cadence

Week 11:

- Monday: research 10 targets, send 8-10 emails.
- Tuesday: research 10 targets, send 8-10 emails.
- Wednesday: research 10 targets, send remaining first batch.
- Friday: review hook quality, reply rate, and bounced emails.

Week 12:

- Monday-Wednesday: send 25 more first-touch emails.
- Wednesday-Friday: send follow-ups to Week 11 non-replies.
- Friday: classify outcomes and decide whether to continue, revise segment, or pause.

## Outcome Codes

Use the canonical tracker state machine in `docs/outreach/italy-response-tracking-and-follow-up.md`.

- `not_sent`: target researched but not contacted.
- `sent`: first-touch sent.
- `followed_up`: follow-up sent.
- `replied`: any human reply received; put `not now`, `bad fit`, or learning context in `outcome`.
- `call_booked`: meeting scheduled.
- `no_fit`: conversation or reply shows no useful fit.
- `advisor_interview`: useful market/advisor learning, not a customer path.
- `channel_partner`: partner/channel conversation, not direct design partner.
- `follow_up_needed`: problem exists but next step is unclear.
- `design_partner_verbal_yes`: verbal yes, onboarding not scheduled yet.
- `design_partner_active`: onboarding scheduled or started.

Do not add ad hoc statuses such as `replied_learning`, `replied_not_now`, or `replied_bad_fit`; keep those details in the `outcome` field so the tracker stays easy to filter.

## Weekly Review

After each outreach week, record:

- Sent count.
- Reply count.
- Calls booked.
- Strongest hook.
- Weakest hook.
- Segment with best signal.
- One change for next batch.

If 0 calls after 50 emails, pause outreach. Diagnose before sending more.
