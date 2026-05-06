# Italy Response Tracking And Follow-Up

Status: internal operating doc.
Scope: Italian design-partner outreach after first-touch messages are manually sent.

This document defines the follow-up loop for the first Italian outreach wave. It does not authorize sending. It only describes what to record once a message has been sent by the owner.

## Tracker State Machine

Use these `status` values in `docs/outreach/italy-target-tracker.csv`.

| Status | Meaning | Required fields |
| --- | --- | --- |
| `not_sent` | Researched or drafted, but no message sent. | Company, website, sector, hook, source. |
| `sent` | First-touch message sent. | Contact route, contact name/title if known, `first_touch_date`. |
| `followed_up` | One follow-up sent after 5-7 working days without reply. | `follow_up_date`. |
| `replied` | Any human reply received. | `reply_date`, short outcome note. |
| `call_booked` | A discovery call is scheduled. | `call_date`, contact metadata. |
| `no_fit` | Conversation or reply shows no useful fit. | Outcome note. |
| `advisor_interview` | Useful market/advisor learning, not a direct customer path. | Outcome note. |
| `channel_partner` | Partner/channel conversation, not direct design partner. | Outcome note. |
| `follow_up_needed` | Problem exists but next step is unclear. | Next action and owner. |
| `design_partner_verbal_yes` | Verbal yes, onboarding not scheduled. | Outcome note and onboarding scheduling action. |
| `design_partner_active` | Onboarding scheduled or started. | Call/onboarding dates and workspace link. |

Do not mark a row as `design_partner_active` until the 3-week onboarding is actually scheduled or started.

## Daily Review Routine

Run this once per business day while outreach is active:

1. Open the inbox and LinkedIn messages.
2. For every reply, update `reply_date`, `status`, and `outcome`.
3. For every booked call, update `call_date` and set `status=call_booked`.
4. Identify sent rows older than 5 working days with no reply.
5. Send at most one follow-up per target.
6. Do not send new first-touch emails if replies/calls from the first three have not been reviewed.

## Follow-Up Rules

- Wait 5-7 working days after first touch.
- Send one follow-up only.
- Keep it shorter than the first email.
- Do not pressure, guilt, or imply urgency.
- Include the NIS2 scoping tool link only when the link is live and tested.
- If the scoping tool is not live, use the no-link fallback below.

## Generic Follow-Up With Scoping Link

```text
Oggetto: Re: NIS2 / GDPR - domanda breve

Buongiorno [Cognome],

so che l'agenda è piena, non insisto.

Solo una cosa che potrebbe essere utile: ho costruito uno strumento gratuito di scoping NIS2 che in 10 minuti aiuta a capire se e come D.Lgs. 138/2024 riguarda l'azienda. [link]

Se in futuro avesse senso parlarne, basta rispondere a questa email.

Buona giornata,
[Your Name]
```

## No-Link Follow-Up Fallback

Use this if the scoping tool is not live.

```text
Oggetto: Re: NIS2 / GDPR - domanda breve

Buongiorno [Cognome],

so che l'agenda è piena, non insisto.

Mi interessava solo capire se oggi raccogliere evidenze NIS2/GDPR per clienti, audit o procurement è già un problema concreto per voi, oppure se è ancora troppo presto.

Se in futuro avesse senso parlarne, basta rispondere a questa email.

Buona giornata,
[Your Name]
```

## First Three Follow-Up Hooks

### Cubbit

```text
Mi interessava soprattutto capire se clienti e partner chiedono già evidenze su sovranità del dato, resilienza ransomware e controlli NIS2/GDPR quando valutano storage europeo.
```

### Cleafy

```text
Mi interessava soprattutto capire se banche e partner chiedono evidenze riutilizzabili durante vendor risk review, oltre ai normali controlli DORA/NIS2.
```

### DigitalPA

```text
Mi interessava soprattutto capire se PA, fornitori o audit interni chiedono prove riutilizzabili su procurement, whistleblowing, sicurezza e compliance.
```

## Reply Triage

| Reply type | What to do |
| --- | --- |
| Positive interest | Set `status=replied`, propose 2-3 call slots, then set `call_booked` only when scheduled. |
| "Send more info" | Send the shortest relevant summary and ask one qualifying question. |
| "Not now" | Set `status=replied`, outcome `not now`, no immediate follow-up. |
| "Wrong person" | Ask for the correct owner once; update contact metadata if provided. |
| Unsubscribe / do not contact | Stop. Mark outcome clearly. |
| Competitor / partner interest | Set `advisor_interview` or `channel_partner`, not design partner. |

## Call Booking Reply

```text
Buongiorno [Nome],

grazie, volentieri.

Le propongo questi slot:

- [Giorno, ora]
- [Giorno, ora]
- [Giorno, ora]

La call dura 30 minuti. L'obiettivo è capire il vostro workflow attuale su evidenze, audit/questionari e documentazione; non sarà una demo commerciale lunga.

Se va bene, mando invito calendario.

Grazie,
[Your Name]
```

## Reporting

At the end of every outreach week, record:

- First-touch emails sent.
- Follow-ups sent.
- Replies received.
- Calls booked.
- Calls completed.
- Design-partner verbal yes/no.
- Best-performing hook.
- Weakest hook to rewrite.

Add the weekly summary to `docs/weekly-reviews/YYYY-MM-DD.md`.
