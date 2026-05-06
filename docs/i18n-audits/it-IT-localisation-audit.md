# Italian Localisation Audit - it-IT

Date: 2026-05-06  
Target language: Italian  
Target market: Italian SMBs  
File audited: `messages/it-IT.json`  
Scope: Full audit, all sections

Status: Pre-fix audit captured for traceability. The definitive non-human-review findings below were applied in `messages/it-IT.json`; unresolved judgment calls remain under "Needs Human Review".

## Summary

Total keys audited: 1235

Total issues found: 67 grouped issue entries

Breakdown: 31 translation smell · 10 register · 8 local credibility · 9 completeness · 9 internal consistency

## Issues By Section

### app

KEY: `app.tagline`  
Current: "Automazione compliance per PMI europee"  
Issue: Translation smell - Italian normally needs the article/preposition here; this reads like compressed English SaaS copy.  
Suggested: "Automazione della compliance per PMI europee"

### navigation

✓ Clean

### shell

KEY: `shell.trustCenter`  
Current: "Trust center"  
Issue: Internal consistency - product name casing differs from `Trust Center` elsewhere.  
Suggested: "Trust Center"

### appError

KEY: `appError.title`  
Current: "Qualcosa non è stato caricato"  
Issue: Translation smell - grammatical but not natural product Italian.  
Suggested: "Non siamo riusciti a caricare la pagina"

KEY: `appError.body`  
Current: "L'evento è stato registrato. Aggiorna la pagina o torna alla dashboard."  
Issue: Register - "evento" sounds like internal telemetry, not a user-facing error.  
Suggested: "Abbiamo registrato l'errore. Aggiorna la pagina o torna alla dashboard."

### authFallback

✓ Clean for developer-facing fallback copy.

### appDataNotice

KEY: `appDataNotice.demoBody`  
Current: "Questa pagina mostra dati demo locali perché ENABLE_LOCAL_DEMO_DATA è attivo fuori produzione. Non considerarli dati tenant."  
Issue: Translation smell - "dati tenant" is internal platform language for an Italian SMB user.  
Suggested: "Questa pagina mostra dati demo locali perché ENABLE_LOCAL_DEMO_DATA è attivo fuori produzione. Non considerarli dati dell'organizzazione."

KEY: `appDataNotice.unavailableBody`  
Current: "I dati live del workspace non sono stati caricati. In produzione i dati demo non vengono mostrati."  
Issue: Translation smell - "live del workspace" is mixed English/Italian.  
Suggested: "I dati dell'area di lavoro non sono stati caricati. In produzione i dati demo non vengono mostrati."

### billingSettings

KEY: `billingSettings.plans.consultant.description`  
Current: "Workspace clienti illimitati e reportistica white-label."  
Issue: Translation smell - word order is clipped and English-led.  
Suggested: "Workspace illimitati per i clienti e reportistica white-label."

### frameworkWizard

KEY: `frameworkWizard.step`  
Current: "Step {step}"  
Issue: Translation smell - "step" is understandable, but "passaggio" is more native in a guided setup.  
Suggested: "Passaggio {step}"

KEY: `frameworkWizard.questions.training.help`  
Current: "Formazione in onboarding e refresh annuale con evidenze."  
Issue: Translation smell - "refresh annuale" is unnecessary English.  
Suggested: "Formazione in onboarding e aggiornamento annuale con evidenze."

KEY: `frameworkWizard.questions.asset_inventory.help`  
Current: "Includi SaaS, cloud, endpoint, applicazioni e owner responsabili."  
Issue: Translation smell - "owner responsabili" is redundant and unnatural.  
Suggested: "Includi SaaS, cloud, endpoint, applicazioni e relativi responsabili."

KEY: `frameworkWizard.questions.cloud_audit.help`  
Current: "CloudTrail, root MFA, cifratura S3 o equivalenti."  
Issue: Register - fine for AWS specialists, but too shorthand for a framework wizard.  
Suggested: "CloudTrail, MFA sull'account root, cifratura S3 o controlli equivalenti."

### dashboard

KEY: `dashboard.frameworks.subtitle`  
Current: "Punteggi sulle normative attive."  
Issue: Internal consistency - the section is about framework status, not all normative content.  
Suggested: "Punteggi dei framework attivi."

KEY: `dashboard.summary.failedControls`  
Current: "controlli falliti"  
Issue: Register - "falliti" sounds crude for enterprise compliance status.  
Suggested: "controlli non superati"

### evidence

KEY: `evidence.subtitle`  
Current: "Archivio per upload manuali e snapshot automatici collegati ai controlli."  
Issue: Translation smell - "upload manuali" is awkward; "snapshot" is acceptable but should not carry the sentence.  
Suggested: "Archivio per caricamenti manuali e snapshot automatici collegati ai controlli."

KEY: `evidence.records.title`  
Current: "Record evidenze"  
Issue: Translation smell - noun stack copied from English.  
Suggested: "Registro evidenze"

KEY: `evidence.statuses.fail`  
Current: "Fallito"  
Issue: Register - harsh and inconsistent with compliance status language.  
Suggested: "Non superato"

### frameworks

KEY: `frameworks.index.enrolledTitle`  
Current: "Framework iscritti"  
Issue: Translation smell - "iscritti" sounds like school/course enrollment, not active compliance frameworks.  
Suggested: "Framework attivi"

KEY: `frameworks.index.availableTitle`  
Current: "Disponibili per iscrizione"  
Issue: Translation smell - same enrollment metaphor problem.  
Suggested: "Disponibili per l'attivazione"

KEY: `frameworks.index.availableSubtitle`  
Current: "I framework della libreria sono opzioni di setup, non scope tenant attivo."  
Issue: Translation smell - "setup", "scope" and "tenant" are internal English.  
Suggested: "I framework della libreria sono opzioni di configurazione, non fanno ancora parte dell'ambito attivo dell'organizzazione."

KEY: `frameworks.detail.csrdQuestionnaireTitle`  
Current: "Template questionario supply-chain"  
Issue: Translation smell - unnatural compound.  
Suggested: "Modello di questionario per la supply chain"

### integrations

KEY: `integrations.index.lastSync`  
Current: "Ultimo sync"  
Issue: Translation smell - common internally, but less polished for B2B UI.  
Suggested: "Ultima sincronizzazione"

KEY: `integrations.planned.dependencyBody`  
Current: "Aggiungete questo adapter dopo aver validato il set attuale di provider."  
Issue: Translation smell - "adapter" is an English developer term.  
Suggested: "Aggiungete questo connettore dopo aver validato il set attuale di provider."

KEY: `integrations.planned.scopeItemStatus`  
Current: "Pianificato. Il runner di produzione non è ancora abilitato."  
Issue: Register - "runner" exposes implementation language.  
Suggested: "Pianificato. L'esecuzione in produzione non è ancora abilitata."

KEY: `integrations.providerPages.aws.subtitle`  
Current: "Un ruolo read-only cross-account controlla CloudTrail, crittografia S3, IAM MFA, root MFA e VPC Flow Logs."  
Issue: Translation smell - too much English syntax.  
Suggested: "Un ruolo in sola lettura tra account controlla CloudTrail, crittografia S3, MFA IAM, MFA sull'account root e VPC Flow Logs."

### incidents

KEY: `incidents.eyebrow`  
Current: "Incident management"  
Issue: Completeness - untranslated English label where Italian is natural.  
Suggested: "Gestione incidenti"

KEY: `incidents.subtitle`  
Current: "Registro incidenti NIS2 e GDPR con countdown 72h, checklist regolatorie ed export delle notifiche."  
Issue: Translation smell - "countdown" and "export" read like mixed product jargon.  
Suggested: "Registro incidenti NIS2 e GDPR con conto alla rovescia di 72 ore, checklist regolatorie e notifiche esportabili."

KEY: `incidents.countdown.overdue`  
Current: "Scaduto · deadline {date}"  
Issue: Completeness - "deadline" is untranslated.  
Suggested: "Scaduto · scadenza {date}"

KEY: `incidents.countdown.remaining`  
Current: "{hours}h rimanenti · deadline {date}"  
Issue: Completeness - "deadline" is untranslated.  
Suggested: "{hours}h rimanenti · scadenza {date}"

KEY: `incidents.checklist.markCybersecurity` / `incidents.checklist.markDataProtection`  
Current: "Marca notifica {authority}"  
Issue: Translation smell - "marca" is literal and awkward for this UI action.  
Suggested: "Segna come notificato a {authority}"

### risks

KEY: `risks.eyebrow`  
Current: "Risk register"  
Issue: Completeness - untranslated English section label.  
Suggested: "Registro rischi"

KEY: `risks.subtitle`  
Current: "Registro rischi ISO 27001 con punteggio likelihood × impact, responsabile, scadenza e stato della mitigazione."  
Issue: Completeness - `likelihood × impact` is untranslated and breaks the Italian sentence.  
Suggested: "Registro rischi ISO 27001 con punteggio probabilità × impatto, responsabile, scadenza e stato della mitigazione."

KEY: `risks.form.likelihood` / `risks.form.impact`  
Current: "Likelihood" / "Impact"  
Issue: Completeness - untranslated labels.  
Suggested: "Probabilità" / "Impatto"

KEY: `risks.matrix.ariaLabel`  
Current: "Matrice rischi likelihood per impact"  
Issue: Completeness - mixed-language accessibility copy.  
Suggested: "Matrice dei rischi per probabilità e impatto"

KEY: `risks.demoRisks[1].owner` / `risks.demoRisks[2].owner`  
Current: "Operations" / "Procurement"  
Issue: Register - English department labels in otherwise Italian demo content.  
Suggested: "Operazioni" / "Acquisti"

### clientsPage

KEY: `clientsPage.lock.demoBody`  
Current: "Clerk o il database non sono disponibili, quindi il form è bloccato e la pagina usa dati cliente demo."  
Issue: Translation smell - "form" is unnecessary English.  
Suggested: "Clerk o il database non sono disponibili, quindi il modulo è bloccato e la pagina usa dati cliente demo."

KEY: `clientsPage.eyebrow`  
Current: "Consultant"  
Issue: Register - plan name is fine, but as an eyebrow it reads like an untranslated label.  
Suggested: "Consulenti"

### teamPage

KEY: `teamPage.modules.accessReviews.description`  
Current: "Workflow trimestrale keep/revoke/modify per utenti Microsoft 365 e GitHub."  
Issue: Completeness - English decision verbs are left in the copy.  
Suggested: "Workflow trimestrale per mantenere, revocare o modificare gli accessi degli utenti Microsoft 365 e GitHub."

### vendorsPage

KEY: `vendorsPage.assessment.save`  
Current: "Salva assessment"  
Issue: Translation smell - mixed English where "valutazione" is natural.  
Suggested: "Salva valutazione"

KEY: `vendorsPage.history.title`  
Current: "Storico assessment"  
Issue: Translation smell - same mixed term.  
Suggested: "Storico valutazioni"

### vendorAssessmentPage

KEY: `vendorAssessmentPage.eyebrow` / `vendorAssessmentPage.submit`  
Current: "Assessment fornitore" / "Invia assessment"  
Issue: Translation smell - "assessment" is overused where Italian SaaS copy would use "valutazione".  
Suggested: "Valutazione fornitore" / "Invia valutazione"

### controlsPage

KEY: `controlsPage.index.activeTitle`  
Current: "Controlli nello scope"  
Issue: Translation smell - English "scope" in Italian UI.  
Suggested: "Controlli in ambito"

KEY: `controlsPage.index.emptyActive`  
Current: "Nessun controllo è nello scope perché non è iscritto alcun framework."  
Issue: Translation smell - "nello scope" and "iscritto" are both unnatural in this product context.  
Suggested: "Non ci sono controlli in ambito perché non è stato attivato alcun framework."

KEY: `controlsPage.statuses.fail`  
Current: "Fallito"  
Issue: Register - inconsistent and too harsh for control status.  
Suggested: "Non superato"

### auditLogPage

KEY: `auditLogPage.subtitle`  
Current: "Storico append-only delle azioni compliance per l'organizzazione Clerk attiva."  
Issue: Translation smell - "append-only" is developer/database language.  
Suggested: "Storico non modificabile delle azioni compliance per l'organizzazione Clerk attiva."

KEY: `auditLogPage.records.title`  
Current: "Record"  
Issue: Register - too generic and English-led.  
Suggested: "Voci del log"

KEY: `auditLogPage.actions.consultant_client_linked` / `auditLogPage.entityTypes.consultant_client`  
Current: "Cliente consulenza collegato" / "cliente consulenza"  
Issue: Translation smell - noun stack is unnatural.  
Suggested: "Cliente collegato al consulente" / "cliente del consulente"

### clientDetailPage

KEY: `clientDetailPage.accentColour`  
Current: "Colore accent"  
Issue: Completeness - untranslated English adjective.  
Suggested: "Colore di accento"

KEY: `clientDetailPage.statuses.fail`  
Current: "fallito"  
Issue: Register - same status issue as evidence and controls.  
Suggested: "non superato"

### accessReviews

KEY: `accessReviews.eyebrow`  
Current: "Access review"  
Issue: Completeness - untranslated English label.  
Suggested: "Revisione accessi"

KEY: `accessReviews.subtitle`  
Current: "Importa utenti da Entra ID e GitHub, registra decisioni keep/revoke/modify ed esporta evidenze CSV per ISO 27001 A.9.2.3."  
Issue: Completeness - decision values are left in English.  
Suggested: "Importa utenti da Entra ID e GitHub, registra decisioni di mantenimento, revoca o modifica ed esporta evidenze CSV per ISO 27001 A.9.2.3."

KEY: `accessReviews.metrics.providerTitle` / `accessReviews.form.provider`  
Current: "Provider"  
Issue: Register - acceptable technical term, but inconsistent with Italianized admin labels elsewhere.  
Suggested: "Origine"

### trustCenterSettings

KEY: `trustCenterSettings.requestsTitle`  
Current: "Richieste accesso documenti"  
Issue: Translation smell - missing prepositions.  
Suggested: "Richieste di accesso ai documenti"

KEY: `trustCenterSettings.accessExpires`  
Current: "Accesso scade"  
Issue: Translation smell - clipped English word order.  
Suggested: "Scadenza accesso"

### marketing

KEY: `marketing.footer.status`  
Current: "Status"  
Issue: Completeness - English label in footer navigation.  
Suggested: "Stato"

KEY: `marketing.footer.operator` / `marketing.footer.copyright`  
Current: "Splnit.eu — OSVČ Olomouc" / "© 2026 Splnit.eu · OSVČ Olomouc"  
Issue: Local credibility - Italian SMBs will not understand `OSVČ`; it looks like an unexplained foreign placeholder.  
Suggested: "Use the verified operator identity in an Italian-readable format, or link to a legal page that explains the Czech sole-trader status."

KEY: `marketing.earlyAccess.body`  
Current: "È una piattaforma guidata dal fondatore, costruita a Olomouc per aziende che vogliono influenzare il prodotto prima del lancio pubblico."  
Issue: Translation smell - "influenzare il prodotto" is unnatural.  
Suggested: "È una piattaforma guidata dal fondatore, costruita a Olomouc per aziende che vogliono contribuire a modellare il prodotto prima del lancio pubblico."

KEY: `marketing.earlyAccess.filledLabel`  
Current: "Coorte fondatori aperta"  
Issue: Translation smell - literal from "founding cohort", not natural Italian.  
Suggested: "Gruppo iniziale aperto"

KEY: `marketing.earlyAccess.benefits.guidedOnboarding`  
Current: "3 settimane di onboarding guidato direttamente con il founder"  
Issue: Internal consistency - mixes `founder` with `fondatore`.  
Suggested: "3 settimane di onboarding guidato direttamente con il fondatore"

KEY: `marketing.earlyAccess.week1Heading`  
Current: "Scoping e gap analysis"  
Issue: Register - too consultancy-English for Italian SMB marketing.  
Suggested: "Ambito e gap analysis"

KEY: `marketing.about.photoPlaceholder`  
Current: "Foto del fondatore prima del lancio"  
Issue: Placeholder - this should not be public-facing copy.  
Suggested: "Remove the placeholder or replace it with an actual caption only when the image exists."

KEY: `marketing.about.body`  
Current: "Splnit.eu è una piattaforma focalizzata, guidata dal fondatore..."  
Issue: Translation smell - "piattaforma focalizzata" reads translated.  
Suggested: "Splnit.eu è un prodotto mirato, guidato dal fondatore..."

KEY: `marketing.about.notYet.entity`  
Current: "I dati identificativi OSVČ finali devono essere aggiunti prima del lancio in produzione."  
Issue: Placeholder/local credibility - live Italian copy still says legal identifiers are missing.  
Suggested: "Replace with verified operator details, or remove the claim until legal identity is final."

### home

KEY: `home.titleLine1`  
Current: "Compliance fluente nella tua giurisdizione."  
Issue: Translation smell - literal metaphor from English; not credible Italian B2B copy.  
Suggested: "Compliance chiara nella vostra giurisdizione."

KEY: `home.mobileLead` / `home.lead`  
Current: "NIS2, EU AI Act, GDPR e ISO 27001 nativi, con le citazioni normative che il tuo auditor locale si aspetta..."  
Issue: Translation smell/register - "nativi" and "auditor locale si aspetta" sound translated.  
Suggested: "NIS2, EU AI Act, GDPR e ISO 27001 con citazioni normative pronte per il vostro revisore."

KEY: `home.primaryCta` / `home.secondaryCta`  
Current: "Diventa design partner" / "Guarda demo"  
Issue: Internal consistency - singular informal imperative conflicts with the file's mostly `voi` B2B register.  
Suggested: "Diventate design partner" / "Guardate la demo"

KEY: `home.partnerTag`  
Current: "Coorte fondatori aperta"  
Issue: Translation smell - unnatural literal rendering.  
Suggested: "Gruppo iniziale aperto"

KEY: `home.trustLine`  
Current: "Accesso anticipato · Contatto diretto col founder · Stack produzione Vercel + Neon"  
Issue: Internal consistency/register - `founder` and `stack produzione` are English-heavy.  
Suggested: "Accesso anticipato · Contatto diretto con il fondatore · Infrastruttura Vercel + Neon"

KEY: `home.stepsTitle`  
Current: "Configurate una volta. Funziona nel tempo."  
Issue: Translation smell - literal "Set once..." loses punch in Italian.  
Suggested: "Configurate una volta, poi resta aggiornato."

KEY: `home.featuresTitle`  
Current: "Compliance costruita per team moderni."  
Issue: Register - generic SaaS phrasing, not locally credible compliance copy.  
Suggested: "Compliance costruita per team IT e compliance."

KEY: `home.features.residencyTitle`  
Current: "Stack produzione documentato"  
Issue: Translation smell - noun stack copied from English.  
Suggested: "Infrastruttura di produzione documentata"

KEY: `home.features.documentsBody`  
Current: "Generate documenti di lavoro ed evidence pack da inviare a legale, auditor o consulente per revisione finale."  
Issue: Translation smell - `evidence pack` and `auditor` are English-heavy.  
Suggested: "Generate documenti di lavoro e pacchetti di evidenze da inviare a legale, revisore o consulente per la revisione finale."

KEY: `home.trustBadges.onboarding`  
Current: "Onboarding col founder"  
Issue: Internal consistency - use `fondatore`, not `founder`.  
Suggested: "Onboarding con il fondatore"

### leadCapture

KEY: `leadCapture.cta`  
Current: "Ottieni panoramica"  
Issue: Register/internal consistency - singular imperative and missing article.  
Suggested: "Ricevete la panoramica"

### pricing

KEY: `pricing.cards.annualSuffix`  
Current: "/ mese annuale"  
Issue: Translation smell - unnatural billing phrase.  
Suggested: "/mese con fatturazione annuale"

KEY: `pricing.cards.free.cta` / `pricing.cards.business.cta`  
Current: "Inizia gratis" / "Contatta vendite"  
Issue: Internal consistency - singular imperative; `vendite` is unnatural as a department label here.  
Suggested: "Iniziate gratis" / "Contattateci"

KEY: `pricing.cards.starter.features[3]` / `pricing.cards.business.features[3-5]`  
Current: "Evidence vault" / "Modulo vendor risk" / "Access reviews" / "Incident log"  
Issue: Completeness - untranslated module names in a pricing table.  
Suggested: "Archivio evidenze" / "Modulo rischio fornitori" / "Revisioni accessi" / "Registro incidenti"

KEY: `pricing.comparison.features.scheduler` / `pricing.comparison.optional` / `pricing.comparison.soon`  
Current: "Scheduler" / "opzionale" / "presto"  
Issue: Internal consistency - some comparison values are product names, others are generic labels; `Scheduler` remains English without being a visible module name elsewhere.  
Suggested: "Pianificatore" / keep `opzionale` / "in arrivo"

KEY: `pricing.comparison.features.ndaGate`  
Current: "Workflow richiesta accesso"  
Issue: Internal consistency - the product now describes this as document access, not NDA.  
Suggested: "Workflow richieste di accesso ai documenti"

### regulations

KEY: `regulations.timelineTag` / `regulations.currentMilestone`  
Current: "Timeline normativa" / "Milestone attuale"  
Issue: Translation smell - English project terms in a public regulatory page.  
Suggested: "Cronologia normativa" / "Tappa attuale"

KEY: `regulations.resources[3]` / `regulations.resources[5]`  
Current: "Formazione AI literacy" / "Riferimento Annex III"  
Issue: Completeness - official Italian would use `IA` or explain AI, and `Allegato III`.  
Suggested: "Formazione sull'alfabetizzazione AI" / "Riferimento Allegato III"

KEY: `regulations.cards.dora.regulator`  
Current: "Autorità finanziaria"  
Issue: Local credibility - too generic for the Italian market.  
Suggested: "Banca d'Italia / IVASS / CONSOB, a seconda del soggetto"

KEY: `regulations.detail.appliesTitle`  
Current: "Impatto pratico per le PMI italiane."  
Issue: Local credibility - good for Italian pages, but dangerous if the same detail copy is used for all EU locales or generic Italian pages covering non-Italian obligations.  
Suggested: "Confirm route scope. If all detail pages are Italian-market pages, keep; otherwise use 'Impatto pratico per le PMI.'"

### onboarding

KEY: `onboarding.description`  
Current: "Cinque passaggi impostano profilo di base, framework, strumenti e prima integrazione consigliata."  
Issue: Translation smell - subjectless structure is unnatural.  
Suggested: "In cinque passaggi impostate profilo di base, framework, strumenti e prima integrazione consigliata."

KEY: `onboarding.steps.score` / `onboarding.score.label` / `onboarding.buttons.showScore`  
Current: "Score" / "Score iniziale" / "Mostra score"  
Issue: Completeness - English label where Italian UI already uses `Punteggio` elsewhere.  
Suggested: "Punteggio" / "Punteggio iniziale" / "Mostra punteggio"

KEY: `onboarding.company.locale`  
Current: "Locale"  
Issue: Translation smell - developer term in a user-facing form.  
Suggested: "Lingua"

KEY: `onboarding.jurisdictions.EU` / `onboarding.locales.en-EU`  
Current: "UE / English" / "English EU"  
Issue: Completeness - English inside Italian UI.  
Suggested: "UE / Inglese" / "Inglese UE"

### organisationSettings

KEY: `organisationSettings.workspace.clerkOrg`  
Current: "Clerk org"  
Issue: Register - implementation label shown to users/admins.  
Suggested: "Organizzazione Clerk"

### questionnairePage

KEY: `questionnairePage.eyebrow`  
Current: "Questionnaire AI"  
Issue: Completeness - untranslated module label.  
Suggested: "AI per questionari"

KEY: `questionnairePage.workbench.inputTitle`  
Current: "Input questionario"  
Issue: Translation smell - English noun used as Italian.  
Suggested: "Questionario in ingresso"

KEY: `questionnairePage.workbench.remaining` / `questionnairePage.workbench.reset`  
Current: "Residui" / "reset"  
Issue: Translation smell - `Residui` is wrong for quota remaining; `reset` is untranslated.  
Suggested: "Rimanenti" / "azzeramento"

KEY: `questionnairePage.workbench.artifact`  
Current: "Artefatto salvato"  
Issue: Translation smell - literal software term; not natural for users.  
Suggested: "Output salvato"

KEY: `questionnairePage.actionErrors.missingConfig`  
Current: "Questionnaire AI non è abilitata o il provider non è configurato."  
Issue: Translation smell - mixed English and awkward agreement.  
Suggested: "Il modulo AI per questionari non è abilitato o il provider non è configurato."

## Internal Consistency Issues

Inconsistency: Singular informal `tu` / imperative and plural formal `voi` are mixed.  
Affected keys: `home.titleLine1`, `home.mobileLead`, `home.lead`, `home.primaryCta`, `home.secondaryCta`, `leadCapture.cta`, `pricing.cards.free.cta`, `pricing.cards.business.cta`, plus many marketing strings using `voi`.  
Recommendation: Standardize marketing copy on `voi/vostro` for Italian B2B credibility; keep app buttons neutral where possible.

Inconsistency: `founder` and `fondatore` both appear.  
Affected keys: `marketing.earlyAccess.benefits.guidedOnboarding`, `home.trustLine`, `home.offerBody`, `home.trustBadges.onboarding`, while other keys use `fondatore`.  
Recommendation: Standardize on `fondatore`; keep `founder` only if it becomes a named product/program label.

Inconsistency: `assessment`, `valutazione`, and `gap assessment` are mixed.  
Affected keys: `frameworkWizard.*`, `frameworks.detail.*`, `vendorsPage.assessment.*`, `vendorAssessmentPage.*`.  
Recommendation: Use `valutazione` for generic UI actions; reserve `assessment` only for a named methodology such as `gap assessment`.

Inconsistency: `evidenze`, `evidence pack`, and `Evidence vault` are mixed.  
Affected keys: `evidence.*`, `home.features.documentsBody`, `pricing.cards.starter.features[3]`.  
Recommendation: Standardize on `evidenze`; use `Archivio evidenze` for the vault and `pacchetto di evidenze` for exports.

Inconsistency: Control status uses `Fallito` in some places and more neutral language elsewhere.  
Affected keys: `evidence.statuses.fail`, `controlsPage.statuses.fail`, `clientDetailPage.statuses.fail`.  
Recommendation: Use `Non superato` consistently for compliance controls.

Inconsistency: Active framework state is described with the enrollment metaphor `iscritto/iscrizione`.  
Affected keys: `frameworks.index.enrolledTitle`, `frameworks.index.enrolledSubtitle`, `frameworks.index.availableTitle`, `controlsPage.index.emptyActive`.  
Recommendation: Use `attivo/attivare` for tenant-enabled frameworks.

## Top 5 Most Impactful Fixes

1. Standardize Italian marketing register on `voi/vostro`. This directly affects first impressions on the homepage, pricing, and lead capture.
2. Remove or resolve public legal identity placeholders and unexplained `OSVČ` references. Italian buyers will treat unclear legal identity as a trust problem.
3. Replace English leftovers in app workflows (`Risk register`, `Access review`, `deadline`, `keep/revoke/modify`, `Questionnaire AI`). These make the product feel unfinished.
4. Fix the homepage headline and lead. `Compliance fluente` and `auditor locale si aspetta` are the most visible translation-smell phrases.
5. Standardize operational terminology: `valutazione`, `evidenze`, `framework attivi`, `Non superato`. This improves confidence during the primary app flow.

## Terminology Glossary

| Concept | Italian term | Notes |
|---|---|---|
| Compliance | compliance | Accepted in Italian B2B SaaS. Use with articles: `la compliance`, `della compliance`. |
| Framework | framework | Accepted product term. Avoid `iscritto`; use `attivo/attivare`. |
| Control | controllo | Use for framework/control objects. |
| Evidence | evidenza / evidenze | Use `Archivio evidenze`, `pacchetto di evidenze`. |
| Gap assessment | gap assessment / valutazione dei gap | Keep English only if it is a named method. |
| Assessment | valutazione | Prefer Italian in buttons and labels. |
| Request | richiesta | Use for access/document requests. |
| Document access request | richiesta di accesso ai documenti | Do not call this NDA unless an NDA workflow exists. |
| Submit | invia / inviare | Use neutral button form `Invia`; marketing can use plural imperative. |
| Save | salva | Standard UI verb. |
| Access review | revisione accessi | Avoid raw `Access review` in Italian UI. |
| Risk register | registro rischi | Avoid English in section labels. |
| Trust Center | Trust Center | Product name, keep English and title case. |
| Founder | fondatore | Avoid `founder` in Italian marketing copy. |
| Audit log | log attività / log audit | Pick one by context; avoid `record audit`. |

## Needs Human Review

- `marketing.footer.operator`, `marketing.footer.copyright`, `marketing.about.notYet.entity`: decide how the real operator identity should be presented to Italian buyers. The current `OSVČ` wording is legally specific but not locally understandable.
- `dashboard.nukib.*`: if the underlying production feed is still Czech NÚKIB-only, `Monitor UE` may still overstate the scope. If the feed aggregates multiple EU/Italian sources, it is acceptable.
- `frameworks.regulators.ai-act`: `AGCOM/MIMIT (da confermare)` is transparent, but should be updated once Italy's AI authority setup is final.
- English loanwords such as `framework`, `dashboard`, `onboarding`, `provider`, `workflow`, and `white-label` are acceptable for Italian SaaS users. Decide per component whether to preserve product familiarity or localize for readability.
