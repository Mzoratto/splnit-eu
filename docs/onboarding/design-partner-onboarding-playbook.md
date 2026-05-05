# Design Partner Onboarding Playbook

Status: internal operating doc.
Scope: first 10 design partners only.
Capacity cap: maximum 5 simultaneous onboardings.

This playbook is for real design partners using Splnit.eu on an actual NIS2, GDPR, or ISO 27001 project. Do not use it to imply the product has customer proof before a partner completes onboarding and grants explicit reference permission.

## Before Scheduling

Confirm these points before accepting a design partner:

- The company has a real compliance project or buyer pressure.
- The active jurisdiction is clear: Italy, EU-English, Czech, or another future jurisdiction.
- Splnit.eu has usable controls/templates for the requested scope.
- Any draft-only content is disclosed as draft and not used as auditor-ready legal citation.
- Founder time is available for the full 3-week onboarding.
- Recording permission is requested before any session is recorded.

## Required Workspace

Create one folder or workspace per design partner with:

- `00-intake.md`
- `01-week-1-gap-analysis.md`
- `02-week-2-integrations.md`
- `03-week-3-documents.md`
- `04-feedback.md`
- `recordings/`
- `exports/`

Do not store customer secrets, raw access tokens, or sensitive evidence in this folder unless it is inside the approved product storage path.

## Intake Questions

Ask before Week 1:

- Company name and website.
- Sector and approximate headcount.
- Primary compliance pressure: NIS2, GDPR, ISO 27001, customer questionnaire, procurement, audit.
- Jurisdiction and operating countries.
- Current tools: Microsoft 365, Google Workspace, GitHub, AWS, Azure, other.
- Current deadline or triggering event.
- Who will join each session.
- Whether calls may be recorded for internal product improvement.

## Week 1 - Scoping And Gap Analysis

Duration: 90 minutes.

Goal: understand scope, classify likely obligations, and produce a one-page gap report.

Agenda:

- Confirm jurisdiction and business context.
- Walk through NIS2/GDPR applicability questions.
- Identify higher/lower obligation or equivalent scope.
- Capture current control state at a high level.
- Identify top 5 missing evidence areas.
- Agree which integrations and documents matter for Week 2 and Week 3.

Output:

- One-page gap report.
- Top 5 controls or documents to fix first.
- Customer language notes: exact phrases they use for the problem.

Internal note template:

```markdown
# Week 1 Gap Analysis

Company:
Date:
Participants:
Recording link:
Jurisdiction:
Primary framework:

## Why now

## Current state

## Top gaps

1.
2.
3.
4.
5.

## Product friction observed

## Follow-up before Week 2
```

## Week 2 - Connect And Configure

Duration: 60 minutes.

Goal: connect real systems where possible and start evidence collection.

Agenda:

- Confirm integrations selected from Week 1.
- Connect Microsoft 365, AWS, GitHub, or another supported integration.
- Configure team roles and access.
- Run the first automated checks.
- Explain what evidence is collected and what is not.
- Capture errors, confusing copy, and missing controls.

Output:

- First integration run completed, or a documented blocker.
- Evidence collection started.
- Product bug/friction list.

Internal note template:

```markdown
# Week 2 Integrations

Company:
Date:
Participants:
Recording link:

## Integrations attempted

## What worked

## What failed

## Controls/evidence generated

## Product friction observed

## Follow-up before Week 3
```

## Week 3 - Documents And Audit Prep

Duration: 60 minutes.

Goal: generate a first document/evidence pack and identify what must be customized for the company.

Agenda:

- Generate the first relevant policy or report set.
- Mark draft/legal-review limitations clearly.
- Tailor sections to sector and jurisdiction.
- Prepare the evidence pack format the auditor or buyer would expect.
- Agree next 30-day roadmap.

Output:

- First document pack or draft worksheet.
- Evidence pack outline.
- 30-day roadmap.
- Written feedback request.

Internal note template:

```markdown
# Week 3 Documents And Audit Prep

Company:
Date:
Participants:
Recording link:

## Documents generated

## Evidence pack outline

## Draft/legal-review limitations disclosed

## 30-day roadmap

## Product friction observed

## Feedback requested
```

## Feedback Request

Send after Week 3.

```text
Subject: Splnit.eu onboarding feedback

Buongiorno [Nome],

grazie per le tre sessioni di onboarding. Mi sarebbe molto utile una risposta
breve a queste domande:

1. Quale parte di Splnit.eu è stata più utile?
2. Quale parte è stata confusa o mancava?
3. Usereste Splnit.eu su un progetto reale nei prossimi 3 mesi?
4. Posso usare il nome dell'azienda come riferimento, solo dopo vostra
   approvazione esplicita del testo?

Grazie,
[Your Name]
```

## Reference Rule

No logo, quote, customer name, metric, or case study can be published until:

- onboarding is complete;
- the customer gives explicit written permission;
- the exact public text is approved by the customer;
- any legal/compliance claims in the reference are independently true.
