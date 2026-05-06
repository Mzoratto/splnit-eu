# Czech Localisation Audit - cs-CZ

Date: 2026-05-06  
Target language: Czech  
Target market: Czech SMBs  
File audited: `messages/cs-CZ.json`  
Scope: Full audit, all sections

Status: Pre-fix audit captured for traceability. The definitive findings below were applied in `messages/cs-CZ.json`; unresolved judgment calls remain under "Needs Human Review".

## Summary

Total keys audited: 1235 expected keys (1121 present before fix; framework assessment questions were missing)

Total issues found: 38 grouped issue entries

Breakdown: 11 translation smell · 9 register · 4 local credibility · 8 completeness · 6 internal consistency

## Issues By Section

### app

KEY: `app.tagline`  
Current: "Compliance automatizace pro evropské SMB týmy"  
Issue: Translation smell - Czech market copy should not use "SMB týmy" when "MSP" is the local business term.  
Suggested: "Automatizace compliance pro evropské MSP"

### navigation

Section `navigation`: ✓ No issues.

### shell

KEY: `shell.plan`  
Current: "Plan"  
Issue: Completeness - untranslated English.  
Suggested: "Plán"

KEY: `shell.trustCenter`  
Current: "Trust centrum"  
Issue: Internal consistency - product naming should stay `Trust Center`.  
Suggested: "Trust Center"

### appError

Section `appError`: ✓ No issues.

### authFallback

Section `authFallback`: ✓ No issues.

### appDataNotice

KEY: `appDataNotice.demoBody`, `unavailableTitle`, `unavailableBody`  
Current: "tenantů" / "workspace" wording.  
Issue: Register - internal architecture terms leak into user-facing notices.  
Suggested: Use "data organizace" and "živá data organizace" wording.

### billingSettings

KEY: `billingSettings.subtitle`  
Current: "Aktuální plán a stav Stripe zákazníka pro tuto Clerk organizaci."  
Issue: Register - Clerk should not be exposed in billing copy.  
Suggested: "Aktuální plán a stav Stripe zákazníka pro tuto organizaci."

KEY: `billingSettings.stripeConfigured`, `monthlyCheckout`, `annualCheckout`  
Current: "checkout" wording.  
Issue: Translation smell - English checkout is unnecessary in Czech billing UI.  
Suggested: Use "platby" / "Měsíční platba" / "Roční platba".

KEY: `billingSettings.plans.consultant.description`  
Current: "Neomezené klientské workspace a white-label reporting."  
Issue: Translation smell - mixed Czech/English without need.  
Suggested: "Neomezené klientské pracovní prostory a white-label reporting."

### frameworkWizard

KEY: `frameworkWizard.questions`  
Current: `{}`  
Issue: Completeness - Czech had no translated framework assessment questions, while EN and IT had the full question set.  
Suggested: Add Czech text/help for all 57 framework assessment questions.

KEY: `frameworkWizard.resultTitle`, `scoreStatus`, `intro`, `submit`  
Current: "Gap assessment hotový" / "Baseline" / "gap report" / "Vyhodnotit"  
Issue: Translation smell and register - mixed English terms plus an ambiguous CTA.  
Suggested: "Vyhodnocení gapů dokončeno" / "Výchozí stav" / "report gapů" / "Spustit vyhodnocení"

### dashboard

KEY: `dashboard.summary.failedControls`, `metrics.failedControls`  
Current: "kontrol selhalo" / "Selhané kontroly"  
Issue: Internal consistency - control statuses elsewhere use `Nesplněno`, not "selhalo".  
Suggested: "nesplněných kontrol" / "Nesplněné kontroly"

KEY: `dashboard.aiActWizardCta`  
Current: "Spustit AI Act wizard"  
Issue: Translation smell - "wizard" is unnecessary English in a high-visibility CTA.  
Suggested: "Spustit průvodce EU AI Act"

KEY: `dashboard.nukib.exclusive`, `dashboard.nukib.title`  
Current: "Exclusive" / "NÚKIB feed"  
Issue: Completeness - visible English remains in Czech UI.  
Suggested: "Sledováno" / "Feed NÚKIB"

### evidence

KEY: `evidence.title`, `subtitle`, `filters.status`  
Current: "Evidence vault" / "uploadů" / "snapshotů" / "Status"  
Issue: Translation smell - core evidence page copy mixes English product and developer terms.  
Suggested: "Archiv evidence", "ručně nahraných a automaticky vytvořených záznamů", "Stav"

### frameworks

KEY: `frameworks.index.subtitle`, `enrolledTitle`, `availableSubtitle`, `emptyEnrolled`, `assessment`  
Current: "assessment", "Zapsané frameworky", "tenant scope", "zapsaný", "Assessment"  
Issue: Translation smell and internal consistency - active/available framework terminology should match English and Italian.  
Suggested: Use "vyhodnocení", "Aktivní frameworky", "rozsah organizace", "aktivní".

KEY: `frameworks.detail.runAssessment`, `csrdQuestionnaireTitle`  
Current: "Spustit assessment" / "supply-chain"  
Issue: Translation smell.  
Suggested: "Spustit vyhodnocení" / "Šablona dotazníku pro dodavatelský řetězec"

### integrations

KEY: `integrations.index.lastSync`, `planned.plannedChecksBody`, `dependencyBody`, `scopeItemStatus`, `providerPages.common.runResultsEmpty`  
Current: sync/runner/adapter wording.  
Issue: Register - internal execution concepts and unnecessary English.  
Suggested: "Poslední synchronizace", "historie automatických běhů", "konektor", "produkční kontroly", "první automatický běh".

KEY: `integrations.providerPages.aws.subtitle`, `github.subtitle`  
Current: "Cross-account read-only role..." / "Read-only GitHub App..."  
Issue: Translation smell - English technical adjectives are copied into Czech sentence structure.  
Suggested: "Role jen pro čtení napříč účty..." / "GitHub App jen pro čtení..."

### incidents

KEY: `incidents.subtitle`, `countdown.overdue`, `countdown.remaining`, `checklist.gdprActive`  
Current: "72h countdown", "deadline" wording.  
Issue: Translation smell - countdown/deadline mix reads like translated product-internal copy.  
Suggested: "sledování 72hodinové lhůty", "lhůta".

### risks

KEY: `risks.metrics.averageBody`  
Current: "Likelihood × impact."  
Issue: Completeness - untranslated English.  
Suggested: "Pravděpodobnost × dopad."

KEY: `risks.demoRisks[*].owner` and related descriptions  
Current: "IT owner", "Operations", "Procurement", "Security owner", "AI owner"; "assessment"; "incident response"; "72h".  
Issue: Translation smell - demo risk data mixes English role labels and process names.  
Suggested: Czech role labels and "bezpečnostní hodnocení", "řízení incidentů", "72 hodin".

### clientsPage

Section `clientsPage`: ✓ No issues after the billing/workspace terminology pass.

### teamPage

KEY: `teamPage.modules.accessReviews.description`  
Current: "Kvartální workflow keep/revoke/modify..."  
Issue: Completeness - English decision values are visible in Czech UI.  
Suggested: "Kvartální workflow pro ponechání, odebrání nebo úpravu přístupu..."

### vendorsPage

Section `vendorsPage`: ✓ No issues.

### vendorAssessmentPage

Section `vendorAssessmentPage`: ✓ No issues.

### controlsPage

KEY: `controlsPage.index.activeTitle`, `activeSubtitle`, `librarySubtitle`, `emptyActive`  
Current: "scope", "zapsané/zápis frameworků" wording.  
Issue: Translation smell and internal consistency - use Czech "rozsah" and active framework wording.  
Suggested: "Kontroly v rozsahu" and "frameworky aktivní v této organizaci".

KEY: `controlsPage.detail.statusLabel`, `saveStatus`, `noHistory`, `activityStatusChanged`  
Current: "Status" / "statusu" / "uploadu".  
Issue: Translation smell - status/upload terminology should be Czech in UI microcopy.  
Suggested: "Stav", "Uložit stav", "nahrání souboru".

KEY: `controlsPage.categories.ai_governance`, `governance`, `esg_governance`  
Current: English governance labels.  
Issue: Completeness - visible English remains.  
Suggested: "Správa AI", "Řízení", "ESG řízení".

### auditLogPage

KEY: `auditLogPage.subtitle`, `actions.control_status_changed`  
Current: "Clerk organizaci" / "Status kontroly změněn"  
Issue: Register and translation smell - internal provider and English status term leak into audit copy.  
Suggested: "aktivní organizaci" / "Stav kontroly změněn"

### clientDetailPage

KEY: `clientDetailPage.trustCenterColour`, `frameworkScores`, `regulatorEmpty`, `logoUrl`  
Current: English word order / untranslated labels.  
Issue: Translation smell.  
Suggested: "Barva Trust Center", "Skóre frameworků", "regulátor neuveden", "URL loga"

KEY: `clientDetailPage.categories.*governance`  
Current: English governance labels.  
Issue: Completeness - visible English remains.  
Suggested: "Správa AI", "Řízení", "ESG řízení"

### accessReviews

KEY: `accessReviews.subtitle`  
Current: "rozhodnutí ponechat/odebrat/upravit"  
Issue: Register - slash-heavy phrasing reads like an internal spec.  
Suggested: "zaznamenejte rozhodnutí ponechat, odebrat nebo upravit..."

### trustCenterSettings

KEY: `trustCenterSettings.visibleFrameworksEmpty`  
Current: "zapsané frameworky"  
Issue: Internal consistency - use active framework terminology.  
Suggested: "aktivní frameworky"

### marketing

KEY: `marketing.nav.regulations`  
Current: "EU Předpisy"  
Issue: Register - incorrect Czech capitalisation.  
Suggested: "EU předpisy"

KEY: `marketing.footer.status`, `privacy`  
Current: "Status" / "Privacy"  
Issue: Completeness - English remains in Czech footer.  
Suggested: "Stav" / "Soukromí"

KEY: `marketing.earlyAccess.body`, `marketing.about.body`, `marketing.about.realToday.solo`  
Current: "fondátorem veden..." wording.  
Issue: Translation smell - "fondátor" is unnatural Czech in this B2B context.  
Suggested: Use "vedený zakladatelem".

KEY: `marketing.about.photoPlaceholder`, `notYet.entity`  
Current: "před spuštěním" / "musí být doplněné před produkčním spuštěním"  
Issue: Completeness - build-time launch reminder copy is visible.  
Suggested: "Foto zakladatele" and a buyer-facing note that operator details are published before contract.

KEY: `marketing.about.whyP1`  
Current: "SMB týmy"  
Issue: Local credibility - Czech buyers expect MSP terminology.  
Suggested: "evropské MSP"

### home

KEY: `home.titleLine1`, `mobileLead`, `lead`  
Current: "plynulá", "nativně", "SMB" wording.  
Issue: Translation smell and local credibility - direct Czech compliance copy should avoid awkward metaphors and SMB.  
Suggested: "Compliance srozumitelná ve vaší jurisdikci..." and "evropské MSP".

KEY: `home.stepsTitle`, `stepsBody`, `featuresTitle`, `offerTitle`  
Current: "Funguje navždy", "evidence pack", "moderní týmy", "Founding customer offer"  
Issue: Register and completeness - generic/English marketing phrasing.  
Suggested: "Průběžně sledujte", "balíček evidence", "IT a compliance týmy", "Nabídka pro prvních 10 firem".

KEY: `home.features.documentsBody`, `trustBadges.onboarding`  
Current: "evidence packy" / "Founder-led onboarding"  
Issue: Completeness - English remains.  
Suggested: "balíčky evidence" / "Onboarding se zakladatelem"

### leadCapture

Section `leadCapture`: ✓ No issues.

### pricing

KEY: `pricing.cards.monthlySuffix`, `annualSuffix`  
Current: "/ měsíc" / "/ měsíc ročně"  
Issue: Register - awkward pricing typography.  
Suggested: "/měsíc" / "/měsíc při roční fakturaci"

KEY: `pricing.cards.starter.description`, `business.description`  
Current: generic or judgemental plan descriptions.  
Issue: Register - needs specific B2B product copy.  
Suggested: "Pro firmy, které začínají se strukturovanou compliance." / "Pro týmy, které řídí compliance napříč frameworky."

KEY: `pricing.cards.starter.features`, `business.features`, `comparison.features.scheduler`, `ndaGate`  
Current: "Evidence vault", "Vendor risk modul", "Access reviews", "Incident log", "Scheduler", generic access workflow.  
Issue: Completeness - English remains in visible pricing copy.  
Suggested: Czech product module labels and "Workflow žádostí o přístup k dokumentům".

### regulations

KEY: `regulations.timeline[3].title`  
Current: "High-risk AI systémy musí být v souladu"  
Issue: Completeness - English adjective remains.  
Suggested: "Vysoce rizikové AI systémy musí být v souladu"

### onboarding

KEY: `onboarding.company.locale`, `jurisdictions.EU`, `locales.en-EU`, `locales.it-IT`  
Current: "Locale", "EU / English", "English EU", "Italiano"  
Issue: Completeness - language selector copy not localised.  
Suggested: "Jazyk", "EU / angličtina", "Angličtina (EU)", "Italština"

### organisationSettings

KEY: `organisationSettings.description`, `profile.locale`, `workspace.title`, `workspace.plan`  
Current: "Clerk workspace", "Locale", "Vazby workspace", "Plan"  
Issue: Register and completeness - implementation and English copy remain.  
Suggested: "Clerk organizaci", "Jazyk", "Vazby organizace", "Plán"

### questionnairePage

KEY: `questionnairePage.eyebrow`, `disabledNotice`, `actionErrors.missingConfig`  
Current: "Questionnaire AI" / "provider" wording.  
Issue: Translation smell and completeness.  
Suggested: "AI dotazníky" and "poskytovatel".

KEY: `questionnairePage.history.subtitle`, `workbench.emptyBody`, `unsupported.summary`, `unsupported.answer`  
Current: "pracovní prostor" wording.  
Issue: Internal consistency - organisation context is clearer and aligns with English/Italian.  
Suggested: Use "organizace" wording.

KEY: `questionnairePage.workbench.reset`, `artifact`, `history.kinds.gapAnalysis`  
Current: "reset", "artefakt", "Gap report"  
Issue: Translation smell - developer/storage terms.  
Suggested: "obnovení", "Uložený výstup", "Report gapů"

## Top 5 Most Impactful Fixes

1. Add Czech `frameworkWizard.questions`. This was the largest functional localisation gap and affects the primary assessment flow.
2. Replace English/internal terms across app UI (`tenant`, `workspace`, `runner`, `scope`, `status`, `upload`). These were the most visible signs of unfinished Czech localisation.
3. Clean the Czech homepage and early-access copy. The old copy mixed English marketing phrases and unnatural Czech like "fondátorem vedená".
4. Standardise active framework/control terminology. It keeps `/frameworks` and `/controls` aligned with the org-aware product model.
5. Fix pricing module labels. Pricing is buyer-facing and had several English product terms still visible.

## Terminology Glossary

| Concept | Czech term | Notes |
| --- | --- | --- |
| Compliance | compliance | Acceptable loanword in Czech B2B context. |
| SMB | MSP | Use MSP for Czech market business size. |
| Framework | framework | Acceptable product term; keep consistent. |
| Control | kontrola | Use for mapped compliance/security controls. |
| Evidence | evidence | Use "Archiv evidence" for the page, "balíček evidence" for exports. |
| Gap assessment | vyhodnocení gapů | "Report gapů" for output. |
| Organisation | organizace | Preferred over tenant/workspace. |
| Active framework | aktivní framework | Preferred over zapsaný framework. |
| Trust Center | Trust Center | Product name, do not translate to Trust centrum. |
| Access review | přístupová revize | Use with decisions ponechat/odebrat/upravit. |
| Vendor risk | riziko dodavatelů | Module label. |
| Incident log | log incidentů | Use 72hodinová lhůta, not countdown. |
| AI questionnaires | AI dotazníky | User-facing feature name. |
| Regulator | regulátor / dohled | Use authority names for Czech market where known. |

## Needs Human Review

- Czech remains tertiary per project strategy. The copy is now coherent, but a native Czech product reviewer should still review marketing tone before Czech outreach.
- `marketing.footer.operator` still cannot include final IČO/ARES details until legal identity closeout provides them.
