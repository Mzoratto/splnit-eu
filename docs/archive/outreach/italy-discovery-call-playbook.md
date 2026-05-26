# Italy Discovery Call Playbook

Status: internal operating doc.
Scope: first 30-minute calls from Italian outreach.

Use this before any design-partner commitment. The call goal is to learn whether the problem is real, urgent, and a fit for Splnit.eu. Do not promise custom features, legal advice, certifications, or public references.

## Pre-Call Checklist

- Company row exists in `docs/archive/outreach/paused-italy-2026-05/italy-target-tracker.csv`.
- `status` is `replied` or `call_booked`, not `sent` only.
- Contact name, role, company, date, and source route are recorded.
- Call goal is written in one sentence.
- Relevant company hook is copied from the outreach doc.
- Known product limitations are clear before the call.
- Recording permission will be asked at the start.

## 30-Minute Agenda

| Time | Topic | Goal |
| --- | --- | --- |
| 0-3 min | Context and recording permission | Confirm why the call exists and ask permission to record for internal product notes. |
| 3-8 min | Their compliance pressure | Understand why NIS2/GDPR/ISO matters now. |
| 8-15 min | Current workflow | Map how they collect evidence, answer questionnaires, and prepare documents today. |
| 15-22 min | Pain and urgency | Identify what is manual, slow, risky, repeated, or owned by the wrong person. |
| 22-26 min | Splnit.eu fit | Explain only the relevant workflow; do not do a full product tour. |
| 26-30 min | Next step | Decide: no fit, follow-up call, design-partner onboarding, or advisor/channel conversation. |

## Questions To Ask

### Why Now

- What triggered the current NIS2/GDPR/ISO work?
- Is this driven by regulation, customer procurement, auditor pressure, board pressure, or partner requirements?
- Is there a deadline attached?

### Current Workflow

- Where do you keep evidence today?
- Who answers security or compliance questionnaires?
- Which evidence is easiest to provide?
- Which evidence is painful or repeatedly requested?
- How do technical checks become documents for customers or auditors?

### Buyer And Owner

- Who owns this internally: IT, security, product, legal, compliance, or operations?
- Who feels the pain most often?
- Who would approve a tool if the problem were solved?

### Fit And Constraints

- Which systems matter most: Microsoft 365, GitHub, AWS, Azure, Google Workspace, other?
- Which regulation or framework is the first priority?
- What would make a compliance tool unacceptable for your company?
- What must be in Italian versus English?
- Would draft outputs need lawyer/advisor review before internal use?

## Design-Partner Qualification

Mark each row after the call:

| Signal | Strong fit | Weak fit |
| --- | --- | --- |
| Real project | Active deadline, customer request, audit, procurement, or internal program. | General curiosity only. |
| Scope match | NIS2, GDPR, ISO 27001, evidence collection, questionnaires, integrations. | Needs unrelated GRC, SOC 2, enterprise risk, or custom consulting. |
| Company size | Roughly 50-250 employees or intentional strategic exception. | Too small to need process, too large for solo-founder onboarding. |
| Access | Can share workflow details and join 3 sessions. | Cannot commit time or discuss workflow. |
| Feedback value | Clear sector/use-case learning for Italy or English-EU. | Mostly competitor research or generic market chat. |

## Outcome Codes

Use these in `docs/archive/outreach/paused-italy-2026-05/italy-target-tracker.csv`:

- `no_fit`: useful conversation, no follow-up.
- `advisor_interview`: useful market/advisor learning, not a customer path.
- `channel_partner`: partner/channel potential, not direct design partner.
- `follow_up_needed`: problem exists, more discovery needed.
- `design_partner_verbal_yes`: verbal yes, onboarding not scheduled.
- `design_partner_active`: onboarding scheduled or started.

## Post-Call Note Template

```markdown
# Discovery Call Notes

Company:
Contact:
Role:
Date:
Recording permission: yes / no
Recording link:

## Why now

## Current workflow

## Pain points

## Systems mentioned

## Compliance scope

## Buying / ownership notes

## Splnit.eu fit

## Risks or reasons not to proceed

## Outcome code

## Follow-up
```

## Follow-Up Email

```text
Subject: Re: NIS2 / GDPR - grazie per la call

Buongiorno [Nome],

grazie per il tempo oggi.

Mi porto via questi punti:

1. [Punto specifico sul problema]
2. [Punto specifico sul workflow]
3. [Punto specifico su evidenze / audit / cliente]

Come prossimo passo propongo [prossimo passo concreto].

Per chiarezza: eventuali documenti o output di Splnit.eu restano bozze per revisione interna/legale finché non sono approvati da voi o dal vostro consulente.

Grazie,
[Your Name]
```

## Guardrails

- Do not say they are a customer until there is explicit agreement.
- Do not ask for a testimonial during the first discovery call.
- Do not promise features outside current product scope unless recorded as a request.
- Do not treat Czech draft mappings as auditor-ready citations.
- Do not provide legal advice; frame outputs as drafts for review.
- Do not record without permission.
