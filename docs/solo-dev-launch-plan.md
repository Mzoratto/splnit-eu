# Splnit.eu Solo Dev Launch Plan

Owner: [Your Name], OSVČ, IČO [your number], Olomouc  
Product: splnit.eu - EU compliance automation for NIS2, GDPR, and ISO 27001  
Status: Pre-launch, no verified customers, solo developer  
Strategic decision: Path A - pivot to English and Italian markets; Czech becomes secondary  
Last updated: 2026-05-04

## Phase 0 - Honesty Pass

Timeline: Week 0, roughly 2-3 evenings  
Goal: the site stops claiming things that are not true before any Italian-market work begins.

### 0.1 Remove Fake Social Proof

- [ ] Delete the current `/zakaznici` page content: quotes, before/after case studies, customer names, percentages, and made-up outcomes.
- [ ] Replace `/zakaznici` with the design-partner page from section 0.2, or redirect it to `/early-access`.
- [ ] Remove from the homepage: "Stovky českých firem", any logo wall, "ISO 27001 za 3 týdny", and "NIS2 za jeden víkend".
- [ ] Remove from `/cenik`: the savings calculator and any made-up savings numbers such as "282 tis. Kč ušetřeno".
- [ ] Search the codebase for `Acme`, `FinEdge`, `TechBrno`, `DataFlow`, `Jan K.`, `Petra M.`, `Tomáš V.`, `Marek S.`, `Lucie H.`, and `Petr V.`. Delete every unsupported customer, testimonial, or metric reference.

### 0.2 Publish the Design-Partner Page

Create `/early-access` or rewrite `/zakaznici` around this honest offer:

```markdown
# Hledáme prvních 10 design partnerů
# Looking for our first 10 design partners

Splnit.eu is in early access. I'm building it as a solo developer
in Olomouc and looking for 10 companies who want to shape the
product before public launch.

What you get:
- 12 months free on the Business plan
- 3-week guided onboarding directly with me
- Features built around your sector
- Direct line to the founder

What I ask:
- Real use on your NIS2 or GDPR project
- 30 minutes weekly feedback during onboarding
- Permission to use your name as a reference - only if you're happy

Currently signed: [X] / 10
```

### 0.3 Fix Every Legal Entity Reference

Search and replace across the codebase and any CMS content:

- [ ] `Splnit Technology s.r.o.` -> `[Your Name], OSVČ`
- [ ] Footer: replace with the real OSVČ block below.
- [ ] Privacy policy: rewrite the controller block with real OSVČ details.
- [ ] Terms and conditions: rewrite party identification.
- [ ] DPA: rewrite processor identification.
- [ ] Cookie policy: use the same entity details.
- [ ] Meta tags and schema.org structured data: remove all non-existent company references.

Footer block:

```text
Splnit.eu - provozuje [Your Name], OSVČ
IČO: [your number] . ARES: [direct ARES URL]
[Registered address], Olomouc
hello@splnit.eu
```

### 0.4 Soften Unsupported Claims

| Delete | Replace with |
| --- | --- |
| "Splňte EU předpisy. Automaticky." | "Připravte se na audit s automatizovanou compliance platformou." |
| "ISO 27001 za 3 týdny" | "Zkraťte přípravu na ISO 27001 audit." |
| "NIS2 za jeden víkend" | "Zjistěte za 10 minut, jestli a jak vás NIS2 ovlivňuje." |
| "Stovky českých firem" | "Hledáme prvních 10 design partnerů." |
| "200+ automatických testů" | "Automatické kontroly napojené na Microsoft 365, AWS a GitHub." |

### 0.5 Add a Real About Page

- [ ] Add `/about` or `/o-nas`.
- [ ] Use a real founder bio, real photo, and real OSVČ details.
- [ ] State clearly what is real today and what is not ready yet.
- [ ] Include the founder contact route and the ARES link once final legal details are available.

### 0.6 Legal Review - First Pass

Before anything goes live:

- [ ] Confirm whether spouse review of commercial docs is permitted under court ethics rules.
- [ ] Review privacy policy: UOOU requirements, controller identification, and electronic acceptance validity.
- [ ] Review terms: consumer protection, jurisdiction, and limitation of liability.
- [ ] Review DPA: processor obligations, subprocessors, and breach notification language.
- [ ] If spouse review is not appropriate, get a fixed-fee review from Czech tech counsel before public launch.

### Phase 0 Acceptance Criteria

- [ ] No `Splnit Technology s.r.o.` anywhere in the codebase or live site.
- [ ] No fake testimonials, customers, logos, or metrics on any page.
- [ ] Legal docs reviewed and updated for OSVČ status.
- [ ] `/about` or `/o-nas` exists with real founder information.
- [ ] `/early-access` exists or `/zakaznici` has been replaced with the design-partner page.
- [ ] Build passes, deploy succeeds, and the site loads correctly.

### Phase 0 Verification - 2026-05-04

Code honesty cleanup is complete:

- `/zakaznici` redirects to `/early-access`.
- Public pages no longer include fake customer names, logo walls, testimonials, or unsupported savings claims.
- The homepage presents early access and `0 / 10` design partners instead of fabricated proof.
- Targeted scans of `app`, `components`, `lib`, `messages`, and `public` found no unsupported references to `Splnit Technology s.r.o.`, fake customer names, or the old inflated launch claims.
- Trust Center demo uptime no longer displays a fabricated percentage.

Still launch-blocking and requiring owner input:

- Final OSVČ identity details: legal name, IČO, ARES URL, and registered address.
- Legal review of privacy policy, terms, DPA, and cookie policy.
- Real founder photo and final founder bio for `/about`.
- Production deploy verification after the final identity/legal pass.

## Non-Negotiable Guardrails

- Never fabricate customers, testimonials, logos, advisor names, or metrics.
- Never reference `Splnit Technology s.r.o.` anywhere unless and until that legal entity actually exists.
- Never promise founder-led onboarding beyond what can be delivered: first 10 only, maximum 5 simultaneous.
- Never send Czech outreach to a buyer who cannot receive fluent Czech follow-up from the business.
- Never claim coverage for a regulation whose controls are not in the knowledge base.
- Never ship customer-facing legal templates with the wrong legal entity.

## Honest Operating Context

- This is a solo-developer business, not a compliance consultancy.
- The current legal operating form is OSVČ with an IČO, not an s.r.o.
- The founder's strongest languages are English and Italian; Czech is basic.
- The current Czech-first positioning is structurally weak without fluent Czech sales and compliance support.
- The real edge is developer-led EU compliance automation plus unscalable founder work for the first 10 customers.
- Italy is the primary beachhead, English-EU is secondary, and Czech is tertiary through partners.

## 12-Week Roadmap

| Phase | Weeks | Focus | Outcome |
| --- | --- | --- | --- |
| 0 | Week 0 | Honesty pass | Site is true, even if smaller |
| 1 | Weeks 1-2 | KB refactor stages 1-2 | Jurisdiction-aware schema |
| 2 | Weeks 3-4 | KB refactor stages 3-4 plus i18n shell | Multi-locale capable |
| 3 | Weeks 5-8 | Italian content production | Real Italian KB |
| 4 | Weeks 9-10 | Italian site plus advisor outreach | Outreach-ready |
| 5 | Weeks 11-12 | First 50 Italian emails | Validated demand signal |

## Phase 1 - Jurisdiction-Aware Knowledge Base

Goal: Czech content still works, but Italy and English-EU become possible.

### 1.1 Pre-Refactor Decisions

Create `docs/architecture/jurisdiction.md` before changing schema. Answer:

1. What does it mean for a control to be active for a tenant?
2. If the same control appears in multiple active frameworks, is it displayed once or once per framework?
3. Is one evidence upload sufficient across frameworks that share the same control?
4. If an Italian tenant requests a document but only a Czech template exists, do we hard error, fall back to EU/EN, fall back to Czech with warning, or block?
5. Default jurisdiction for new tenants: ask at signup or infer from billing country?
6. Can a tenant have multiple jurisdictions?

### 1.2 Add Jurisdiction Fields

Add to `organisations`:

```typescript
country: text('country').notNull().default('CZ');
primaryJurisdiction: text('primary_jurisdiction').notNull().default('CZ');
locale: text('locale').notNull().default('cs-CZ');
```

Tasks:

- [ ] Update Drizzle schema.
- [ ] Generate and apply migration.
- [ ] Backfill existing tenants to `CZ`, `CZ`, `cs-CZ`.
- [ ] Update signup to capture country or infer it from billing.
- [ ] Expose country, primary jurisdiction, and locale in tenant settings for admins.

### 1.3 Neutralize Controls, Enrich Framework Controls

Add to `framework_controls`:

```typescript
regulatorGuidance: text('regulator_guidance');
evidenceRequirements: text('evidence_requirements');
localizedTitle: text('localized_title');
localizedDescription: text('localized_description');
```

Tasks:

- [ ] Audit `library.ts` for `NUKIB`, `CTU`, `UOOU`, `Cesky`, `cesk`, `zakon 264`, and `vyhlaska`.
- [ ] Rewrite canonical `controls` content as jurisdiction-neutral English.
- [ ] Move Czech regulator-specific text into the Czech `framework_controls` row.
- [ ] Keep inherently Czech-only controls scoped to `NIS2-CZ`.
- [ ] Confirm no regulator-specific names remain in canonical `controls`.

### 1.4 Add Source Documents

Create a `source_documents` table:

```typescript
export const sourceDocuments = pgTable('source_documents', {
  id: uuid('id').primaryKey(),
  jurisdiction: text('jurisdiction').notNull(),
  locale: text('locale').notNull(),
  title: text('title').notNull(),
  citation: text('citation').notNull(),
  url: text('url'),
  filename: text('filename'),
  effectiveDate: timestamp('effective_date'),
  lastReviewed: timestamp('last_reviewed'),
});
```

Tasks:

- [ ] Replace hardcoded `*-cs.pdf` references in templates with source document references.
- [ ] Populate the table with current Czech sources.
- [ ] Regression test that Czech tenants still see the same practical content.

## Phase 2 - Locale-Aware Templates and UI

Goal: templates resolve by jurisdiction and locale; UI can render Czech, English-EU, and Italian.

### 2.1 Template Refactor

Add to `templates`:

```typescript
locale: text('locale').notNull();
jurisdiction: text('jurisdiction').notNull();
templateFamily: text('template_family').notNull();
```

Tasks:

- [ ] Audit `templates.ts` for Czech-law references, including IČO, ÚOOÚ, ČTÚ, Czech legal entity labels, and Czech-only GDPR phrasing.
- [ ] Replace hardcoded labels with tenant and jurisdiction placeholders.
- [x] Add a jurisdiction context provider for authority names, citation formats, and local labels.
- [x] Use a resolver that tries exact tenant jurisdiction and locale, then EU/EN, then throws a clear `TemplateNotFoundError`.

### 2.2 i18n Shell

- [x] Confirm `next-intl` setup or install it if missing.
- [x] Create locale files for `cs-CZ`, `en-EU`, and `it-IT`.
- [x] Wire SSR locale to tenant locale.
- [ ] Translate critical paths in this order: public marketing pages, signup/onboarding, dashboard navigation, document generation UI, error messages, and email templates.
- [ ] Leave admin UIs in English unless there is a direct product reason to translate them.

### 2.3 End-to-End Smoke Test

- [ ] Create a fake Italian tenant with `country='IT'`, `primaryJurisdiction='IT'`, `locale='it-IT'`.
- [ ] Verify the UI renders Italian strings or intentional placeholders.
- [ ] Verify framework lists show `NIS2-IT` or fall back gracefully.
- [ ] Verify document generation falls back to EU/EN without crashing.
- [ ] Repeat for an English-EU tenant.
- [ ] Confirm Czech tenant behavior is unchanged.

## Phase 3 - Italian Content Production

Goal: a real Italian KB credible enough for a design partner.

### 3.1 Source Ingestion

Ingest each source into `source_documents` with citation, URL, effective date, and last reviewed date:

- [ ] D.Lgs. 4 settembre 2024, n. 138 from Gazzetta Ufficiale.
- [ ] Current ACN determinations from acn.gov.it.
- [ ] GDPR Regulation (EU) 2016/679 Italian text from EUR-Lex.
- [ ] Current consolidated D.Lgs. 196/2003, Codice Privacy.
- [ ] Garante guidance relevant to SMBs.

### 3.2 Italian Control Mapping

For each NIS2 Article 21 measure:

- [ ] Find the Italian provision in D.Lgs. 138/2024 and relevant ACN guidance.
- [ ] Create an Italian `framework_controls` row.
- [ ] Fill `articleRef`, `regulatorGuidance`, `evidenceRequirements`, `localizedTitle`, and `localizedDescription`.
- [ ] Tag sources from `source_documents`.
- [ ] Mark uncertain mappings as `confidence: low` and queue them for advisor review.

Working method:

1. Read the source article in full.
2. Draft the mapping with AI assistance.
3. Verify every citation against the decree text.
4. Cross-check with at least one published commentary or official guidance.
5. Do not ship uncertain legal mapping as authoritative.

### 3.3 Italian Document Templates

Produce and get advisor review for:

- [ ] Politica di sicurezza delle informazioni.
- [ ] Piano di gestione degli incidenti.
- [ ] Registro dei trattamenti.
- [ ] DPIA template.
- [ ] Accordo sul trattamento dei dati.
- [ ] Elenco dei sub-responsabili.
- [ ] Inventario degli asset.
- [ ] Valutazione del rischio.
- [ ] Politica di uso accettabile.
- [ ] Questionario per fornitori.
- [ ] Piano di continuità operativa.
- [ ] Politica di controllo degli accessi.

Each template must:

- [ ] Use Italian language written for Italian SMBs.
- [ ] Reference D.Lgs. 138/2024 and Codice Privacy correctly where relevant.
- [ ] Use abstract tenant and jurisdiction placeholders.
- [ ] Set `templateFamily` to link translated siblings.
- [ ] Pass Italian advisor review before customer use.

### 3.4 Notification Flows

- [ ] Build ACN incident notification workflow: 24-hour early warning, 72-hour notification, and 1-month report.
- [ ] Build Garante breach notification workflow.
- [ ] Use Italian SMB-appropriate labels.
- [ ] Verify output format with the advisor before shipping.

## Phase 4 - Italian Site and Advisor Readiness

Goal: marketing presence and support signals match the Italian product direction.

### 4.1 Italian Public Pages

- [ ] Italian homepage.
- [ ] `/chi-siamo`.
- [ ] `/normative` pages for D.Lgs. 138/2024, GDPR plus Codice Privacy, ISO 27001, and EU AI Act.
- [ ] `/prezzi`.
- [ ] No linked coming-soon pages. If content is not ready, it is not linked.

Italian homepage structure:

```markdown
# Conformità EU automatizzata.
# NIS2 . GDPR . ISO 27001

Mappata al D.Lgs. 138/2024 per le PMI italiane.
Costruito da uno sviluppatore - non da un'agenzia.

Cerchiamo i primi 10 design partner.

[Diventa design partner ->]   [Demo (3 min)]

Senza carta di credito . Contatto diretto col fondatore . Dati nell'UE
```

### 4.2 Advisor and Trust Signals

- [ ] Sign one Italian advisor on a paid retainer, advisory equity, or paid review cadence.
- [ ] Credit the advisor publicly only with permission.
- [ ] Add `/security` or `/sicurezza` with a real security posture: done vs in progress.
- [ ] Publish a current subprocessor list.
- [ ] State EU data residency with the actual provider and region.
- [ ] Make DPA available on request or publish it if ready.
- [ ] Add a simple status page, even if static at launch.

## Phase 5 - Italian Outreach and First Design Partner

Goal: 50 researched outreach emails, 3 real conversations, and 1 verbal design-partner commitment.

### 5.1 Target List

Build a list of 50 Italian SMBs:

- [ ] Location: Italy.
- [ ] Size: 50-250 employees.
- [ ] Sectors: manufacturing, IT services, pharmaceuticals, healthcare, software, energy.
- [ ] Contacts: CTO, CIO, IT Manager, Responsabile Sicurezza Informatica, DPO, Direttore IT.
- [ ] Add a specific hook for every target based on company news, sector, LinkedIn activity, or likely NIS2 exposure.

### 5.2 First-Touch Email

```text
Oggetto: NIS2 / GDPR - domanda breve da uno sviluppatore italiano

Buongiorno [Cognome],

mi chiamo [Your Name], sono uno sviluppatore italiano che vive
a Olomouc (Repubblica Ceca). Sto costruendo Splnit.eu - una
piattaforma per automatizzare la conformità a NIS2 (D.Lgs. 138/2024)
e GDPR per PMI italiane.

Le scrivo perché [UNA FRASE SPECIFICA - settore, dimensione,
indizio NIS2, news recente].

Non sto cercando un cliente adesso. Cerco 30 minuti del Suo tempo
per capire cosa rende la conformità frustrante in azienda - e cosa
potrebbe davvero aiutare. Posso fare una call quando Le è comodo.

Per i primi 10 design partner ho un'offerta dedicata: piano Business
gratis per 12 mesi e onboarding personale di 3 settimane. Ma e
secondario - l'obiettivo della call è capire il problema, non vendere.

Vale 30 minuti la prossima settimana?

Cordiali saluti,
[Your Name]
[Telefono] . [LinkedIn]
Splnit.eu - [Your Name], OSVČ, IČO [number]
```

### 5.3 Follow-Up

```text
Oggetto: Re: NIS2 / GDPR - domanda breve da uno sviluppatore italiano

Buongiorno,

so che ha l'agenda piena - non insisto.

Solo una cosa che potrebbe servirLe: ho costruito uno strumento
gratuito di NIS2 scoping che in 10 minuti dice se e come D.Lgs.
138/2024 La riguarda. [link]

Se in futuro avesse senso parlarne, basta rispondere a questa email.

Buona giornata,
[Your Name]
```

### 5.4 Cadence and Tracking

- [ ] Week 11: send 25 first-touch emails Monday-Wednesday.
- [ ] Week 11 end: review response rate and rewrite weak hooks.
- [ ] Week 12: send 25 more first-touch emails plus follow-ups to Week 11 non-replies.
- [ ] Track company, contact, sector, date sent, opened, replied, call booked, and outcome in one spreadsheet.

### 5.5 First Design Partner Onboarding

- [ ] Schedule the 3-week onboarding.
- [ ] Record every session with permission.
- [ ] Take notes immediately after each session.
- [ ] Update the KB and templates based on real friction.
- [ ] At the end of onboarding, ask for written feedback and permission to use the company as a reference.

## Founder-Facing Reusable Materials

### Founding Customer Offer

```markdown
Founding customer offer - first 10 companies only

Looking for 10 EU SMBs who want to shape Splnit.eu before public launch.

What you get:
- 3-week onboarding directly with the founder
- Business plan free for 12 months
- Direct line after onboarding
- Features built around your sector

What we ask:
- Real use on a NIS2 or GDPR project
- 30 minutes weekly feedback during onboarding
- Permission to use your name as a reference - only when you're happy

Filled: [X] / 10
[Apply as a design partner ->]
```

### Three-Week Onboarding Playbook

Week 1 - Scoping and gap analysis, 90 minutes:

- Confirm jurisdiction.
- Walk through NIS2 applicability.
- Identify higher/lower obligation classification.
- Map current control state.
- Output a 1-page gap report.

Week 2 - Connect and configure, 60 minutes:

- Connect Microsoft 365, AWS, and/or GitHub integrations.
- Configure automated controls.
- Set up team roles and access.
- Start the first evidence collection cycle.

Week 3 - Documents and audit prep, 60 minutes:

- Generate the first policy set from templates.
- Tailor documents to sector.
- Prepare the evidence pack format for the auditor.
- Agree the roadmap to the audit deadline.

Throughout: async support via email or Slack.

### Italian Advisor Outreach

```text
Buongiorno [Nome],

mi chiamo [Your Name], sviluppatore italiano a Olomouc. Sto
costruendo Splnit.eu - automazione conformità NIS2/GDPR per
PMI europee, focus iniziale Italia.

Vedo che [DETTAGLIO SPECIFICO dal loro profilo - articolo,
ruolo, conferenza].

Cerco 1-2 advisor informali per rivedere come mappiamo D.Lgs.
138/2024 e darmi feedback dove sbaglio. Niente impegno, niente
NDA per iniziare - 30 minuti di call. Se ha senso, possiamo
parlare di una collaborazione formale.

Vale 30 minuti?

Saluti,
[Your Name]
```

## Tools and Infrastructure

- [ ] Loom for onboarding recordings.
- [ ] Calendly or Cal.com for booking.
- [ ] Notion or Obsidian for onboarding notes and KB drafts.
- [ ] Airtable or Google Sheets for outreach tracking.
- [ ] Plausible or Fathom for privacy-respecting analytics.
- [ ] Sentry for error tracking.
- [ ] Status page.
- [ ] Email signature with real OSVČ and IČO, no s.r.o.

## If It Is Not Working

If there are 0 design partners after 50 Italian emails, do not send 50 more without diagnosis:

1. Hook too weak: rewrite and A/B test 10 vs 10.
2. Italian SMBs not feeling NIS2 pressure yet: test ISO 27001 urgency among Italian SaaS, fintech, and healthtech.
3. Founder credibility too thin: sign advisor, publish Italian content, and build in public for 4 weeks.
4. Wrong segment: move away from slow-moving manufacturing and test software, fintech, healthtech, and ICT services.

If Phase 3 takes longer than 4 weeks, extend the timeline. Do not ship half-complete citations.

If Czech legal review through spouse is not appropriate, use paid Czech tech counsel.

If Italian advisor outreach gets no replies, lower the ask to a paid 30-minute review call.

## Weekly Review Ritual

Every Sunday evening, commit a short review to `docs/weekly-reviews/YYYY-MM-DD.md`:

1. What got done this week vs the plan?
2. What is blocking next week?
3. What did I learn about Italian, EU, or Czech compliance buyers?
4. What did I learn about the product?
5. One change I am making to the plan and why.

## 12-Week Definition of Done

- [ ] No false claims anywhere on the site.
- [ ] Architecture supports CZ, IT, and EU jurisdictions cleanly.
- [ ] Italian KB has verified citations for all NIS2 Article 21 controls.
- [ ] At least 12 Italian document templates are reviewed by an Italian advisor.
- [ ] One Italian advisor is publicly credited.
- [ ] At least 1 Italian design partner is onboarded.
- [ ] Privacy policy, terms, and DPA are reviewed and match OSVČ status.
- [ ] Founder bio, photo, and real story are live on `/about` or `/o-nas`.
- [ ] Recorded onboarding sessions exist.
- [ ] Weekly review log has 12 entries.
