# English-EU Localisation Audit - en-EU

Date: 2026-05-06  
Target language: English-EU  
Target market: European English-speaking SMBs  
File audited: `messages/en-EU.json`  
Scope: Full audit, all sections

Status: Pre-fix audit captured for traceability. The definitive findings below were applied in `messages/en-EU.json`; unresolved judgment calls remain under "Needs Human Review".

## Summary

Total keys audited: 1235

Total issues found: 25 grouped issue entries

Breakdown: 5 translation smell · 10 register · 3 local credibility · 3 completeness · 4 internal consistency

## Issues By Section

### app

Section `app`: ✓ No issues.

### navigation

Section `navigation`: ✓ No issues.

### shell

Section `shell`: ✓ No issues.

### appError

Section `appError`: ✓ No issues.

### authFallback

Section `authFallback`: ✓ No issues.

### appDataNotice

KEY: `appDataNotice.demoBody`  
Current: "This page is showing local demo data because ENABLE_LOCAL_DEMO_DATA is enabled outside production. Do not treat it as tenant data."  
Issue: Register - "tenant data" is internal architecture language, not buyer-facing English.  
Suggested: "This page is showing local demo data because ENABLE_LOCAL_DEMO_DATA is enabled outside production. Do not treat it as organisation data."

KEY: `appDataNotice.unavailableTitle` / `appDataNotice.unavailableBody`  
Current: "Workspace data unavailable" / "Live workspace data could not be loaded. Demo data is not shown in production."  
Issue: Internal consistency - the product mostly talks to users about their organisation; "workspace" is less clear here.  
Suggested: "Organisation data unavailable" / "Live organisation data could not be loaded. Demo data is not shown in production."

### billingSettings

KEY: `billingSettings.subtitle`  
Current: "Current plan and Stripe customer state for this Clerk organisation."  
Issue: Register - "Clerk organisation" leaks implementation detail into a billing page.  
Suggested: "Current plan and Stripe customer state for this organisation."

### frameworkWizard

KEY: `frameworkWizard.submit`  
Current: "Assess"  
Issue: Register - as a button label, "Assess" is terse to the point of ambiguity.  
Suggested: "Run assessment"

KEY: `frameworkWizard.questions.asset_inventory.help`  
Current: "Include SaaS, cloud, endpoints, applications, and responsible owners."  
Issue: Translation smell - "responsible owners" is not natural English; "responsible people" is clearer.  
Suggested: "Include SaaS, cloud, endpoints, applications, and responsible people."

### dashboard

KEY: `dashboard.summary.failedControls` / `dashboard.metrics.failedControls`  
Current: "controls failed" / "Failed controls"  
Issue: Internal consistency - control status language should match `Not passed` rather than "failed".  
Suggested: "controls not passed" / "Controls not passed"

### evidence

KEY: `evidence.statuses.fail`  
Current: "Failed"  
Issue: Internal consistency - the control/evidence status should use the same user-facing label across the app.  
Suggested: "Not passed"

### frameworks

KEY: `frameworks.index.enrolledTitle`, `availableTitle`, `availableSubtitle`, `emptyEnrolled`  
Current: "Enrolled frameworks" / "Available to enroll" / "Library frameworks are shown as setup options, not active tenant scope." / "No frameworks are enrolled yet."  
Issue: Register and internal consistency - "enrolled" and "tenant scope" are implementation terms; users need active vs available.  
Suggested: "Active frameworks" / "Available to activate" / "Library frameworks are shown as setup options, not active organisation scope." / "No frameworks are active yet."

### integrations

KEY: `integrations.planned.plannedChecksBody`, `dependencyBody`, `scopeItemStatus`, `providerPages.common.runResultsEmpty`  
Current: "runner registry", "adapter", "Production runner", "runner execution" phrasing.  
Issue: Register - these strings expose implementation concepts that do not help a buyer understand integration status.  
Suggested: "automated run history", "connector", "Production checks", and "first automated run" phrasing.

### incidents

KEY: `incidents.subtitle`  
Current: "NIS2 and GDPR incident log with a 72h countdown, regulatory checklists, and notification exports."  
Issue: Register - "countdown" sounds consumer/app-like; deadline tracking is more credible in compliance software.  
Suggested: "NIS2 and GDPR incident log with 72-hour deadline tracking, regulatory checklists, and notification exports."

KEY: `incidents.checklist.gdprActive`  
Current: "72h countdown is active."  
Issue: Register - same countdown issue in the detail checklist.  
Suggested: "72-hour deadline tracking is active."

### risks

KEY: `risks.seed.body` / `risks.seed.button`  
Current: "Seeds 10 common SMB risks when the register is empty." / "Seed register"  
Issue: Translation smell - "seed" is developer language.  
Suggested: "Add 10 common SMB risks when the register is empty." / "Add common risks"

### clientsPage

Section `clientsPage`: ✓ No issues.

### teamPage

KEY: `teamPage.modules.accessReviews.description`  
Current: "Quarterly keep/revoke/modify workflow for Microsoft 365 and GitHub users."  
Issue: Register - slash-heavy action labels read like an internal spec.  
Suggested: "Quarterly keep, revoke, or modify workflow for Microsoft 365 and GitHub users."

### vendorsPage

Section `vendorsPage`: ✓ No issues.

### vendorAssessmentPage

Section `vendorAssessmentPage`: ✓ No issues.

### controlsPage

KEY: `controlsPage.index.activeSubtitle`, `librarySubtitle`, `emptyActive`  
Current: "frameworks enrolled", "framework enrollment", "no framework is enrolled" wording.  
Issue: Internal consistency - framework state should be expressed as active/available, not enrolled.  
Suggested: "Controls mapped to frameworks active in this organisation." / "Reference controls available when a framework is activated." / "No controls are in scope yet because no framework is active."

KEY: `controlsPage.statuses.fail`  
Current: "Failed"  
Issue: Internal consistency - control status should match the evidence status label.  
Suggested: "Not passed"

### auditLogPage

KEY: `auditLogPage.subtitle`  
Current: "Append-only history of compliance actions for the active Clerk organisation."  
Issue: Register - "Clerk organisation" leaks implementation detail; "append-only" is unnecessarily technical here.  
Suggested: "Locked history of compliance actions for the active organisation."

### clientDetailPage

KEY: `clientDetailPage.statuses.fail`  
Current: "failed"  
Issue: Internal consistency - status label should match `Not passed`.  
Suggested: "not passed"

### accessReviews

KEY: `accessReviews.subtitle`  
Current: "Pull Entra ID and GitHub users, record keep/revoke/modify decisions, and export CSV evidence for ISO 27001 A.9.2.3."  
Issue: Register - slash-heavy action labels reduce clarity.  
Suggested: "Pull Entra ID and GitHub users, record keep, revoke, or modify decisions, and export CSV evidence for ISO 27001 A.9.2.3."

### trustCenterSettings

KEY: `trustCenterSettings.title`  
Current: "Public compliance centre"  
Issue: Internal consistency - product copy uses "Trust Center"; this page should keep the same spelling.  
Suggested: "Public compliance center"

KEY: `trustCenterSettings.visibleFrameworksEmpty`  
Current: "No enrolled frameworks are available yet."  
Issue: Internal consistency - use active framework terminology.  
Suggested: "No active frameworks are available yet."

### marketing

KEY: `marketing.footer.operator` / `marketing.footer.copyright`  
Current: "Splnit.eu — OSVČ Olomouc" / "© 2026 Splnit.eu · OSVČ Olomouc"  
Issue: Local credibility - OSVČ is a Czech legal acronym and is not self-explanatory to English-speaking European buyers.  
Suggested: "Splnit.eu — Czech sole-trader operator, Olomouc" / "© 2026 Splnit.eu · Czech sole-trader operator, Olomouc"

KEY: `marketing.about.photoPlaceholder`  
Current: "Founder photo before launch"  
Issue: Completeness - a build-time reminder is visible as product copy.  
Suggested: "Founder photo"

KEY: `marketing.about.notYet.entity`  
Current: "Final OSVČ identification details must be added before production launch."  
Issue: Completeness - this is a launch checklist item, not buyer-facing copy.  
Suggested: "Operator identification details are published on the legal pages before any contract is signed."

### home

KEY: `home.badge`, `home.titleLine1`  
Current: "EU-native compliance for European SMBs" / "Compliance fluent in your jurisdiction."  
Issue: Translation smell - "EU-native" and "compliance fluent" are cute metaphors, not direct B2B compliance copy.  
Suggested: "EU compliance for European SMBs" / "Compliance clear in your jurisdiction."

KEY: `home.mobileLead` / `home.lead`  
Current: "Native NIS2..." wording.  
Issue: Translation smell - "Native NIS2" is awkward English and can sound like a technical runtime claim.  
Suggested: "NIS2, EU AI Act, GDPR, and ISO 27001 with the regulatory citations your local auditor expects."

KEY: `home.featuresTitle`  
Current: "Compliance built for modern teams."  
Issue: Register - "modern teams" is generic SaaS filler.  
Suggested: "Compliance built for IT and compliance teams."

KEY: `home.partnerTag`, `home.offerTitle`, `home.trustBadges.onboarding`  
Current: "Founding cohort open" / "Founding customer offer for the first 10 companies." / "Founder-led onboarding"  
Issue: Register - startup shorthand is less credible for a compliance buyer than concrete early-access wording.  
Suggested: "Initial group open" / "Offer for the first 10 companies." / "Founder-guided onboarding"

### leadCapture

Section `leadCapture`: ✓ No issues.

### pricing

KEY: `pricing.cards.monthlySuffix` / `pricing.cards.annualSuffix`  
Current: "/ month" / "/ month annually"  
Issue: Register - pricing suffixes are visually awkward and less standard than compact SaaS pricing copy.  
Suggested: "/month" / "/month, billed annually"

KEY: `pricing.cards.starter.description`  
Current: "For companies taking compliance seriously."  
Issue: Register - mildly judgmental marketing copy; better to describe the stage of work.  
Suggested: "For companies starting structured compliance work."

KEY: `pricing.cards.business.description`  
Current: "Complete platform for the whole team."  
Issue: Register - generic SaaS phrase that does not say what the plan is for.  
Suggested: "For teams managing compliance across frameworks."

KEY: `pricing.comparison.features.ndaGate`  
Current: "Access request workflow"  
Issue: Completeness - it is specifically about document access, not generic access.  
Suggested: "Document access request workflow"

### regulations

Section `regulations`: ✓ No issues.

### onboarding

Section `onboarding`: ✓ No issues.

### organisationSettings

KEY: `organisationSettings.description`  
Current: "Basic organisation identity, classification, and Clerk workspace linkage."  
Issue: Register - "Clerk workspace linkage" is implementation copy.  
Suggested: "Basic organisation identity, classification, and Clerk organisation link."

KEY: `organisationSettings.workspace.title`  
Current: "Workspace links"  
Issue: Internal consistency - the page is about organisation settings, not a generic workspace.  
Suggested: "Organisation links"

### questionnairePage

KEY: `questionnairePage.eyebrow`, `disabledNotice`, `actionErrors.missingConfig`  
Current: "Questionnaire AI" phrasing.  
Issue: Register - "Questionnaire AI" is product-internal naming; "AI questionnaires" reads more naturally.  
Suggested: "AI questionnaires" / "AI questionnaires require..." / "AI questionnaires are not enabled..."

KEY: `questionnairePage.subtitle`  
Current: "Auto-answer inbound customer questionnaires..."  
Issue: Register - "Auto-answer" overclaims autonomy; the feature drafts answers for review.  
Suggested: "Draft answers to customer questionnaires using passing controls, evidence, and policies already stored in Splnit.eu."

KEY: `questionnairePage.history.subtitle`, `workbench.emptyBody`, `unsupported.summary`, `unsupported.answer`  
Current: repeated "workspace" phrasing.  
Issue: Internal consistency - customer-facing page should use organisation context.  
Suggested: "stored for this organisation" and "organisation data" phrasing.

KEY: `questionnairePage.workbench.artifact`  
Current: "Saved artifact"  
Issue: Register - "artifact" is developer/storage language.  
Suggested: "Saved output"

KEY: `questionnairePage.actionErrors.generationFailed`  
Current: "Answer generation failed."  
Issue: Register - terse system error; the user needs a natural failure message.  
Suggested: "Answers could not be generated."

## Top 5 Most Impactful Fixes

1. Replace `enrolled` / `tenant scope` / `runner` terminology. These are the clearest signs of implementation copy leaking into the app.
2. Remove launch placeholders from `marketing.about`. Visible "before launch" and "must be added" copy undermines buyer trust immediately.
3. Standardise failed control labels to `Not passed`. This prevents the same state from sounding different across dashboard, controls, evidence, and client views.
4. Rewrite the hero headline/lead. The homepage is the first credibility filter; direct compliance copy is stronger than "fluent/native" metaphors.
5. Rename "Questionnaire AI" to "AI questionnaires" in UI copy. It moves the feature from internal product naming to a natural user-facing label.

## Terminology Glossary

| Concept | English-EU term | Notes |
| --- | --- | --- |
| Compliance | compliance | Keep lower-case unless in heading context. |
| Framework | framework | Use for NIS2/GDPR/ISO packages; avoid "regulation" when ISO is included. |
| Control | control | Use consistently for mapped compliance/security controls. |
| Evidence | evidence | Use "evidence record" for stored items, "evidence pack" for exports. |
| Gap assessment | gap assessment / gap analysis | Use "Run assessment" for the button; "gap report" for output. |
| Organisation | organisation | Preferred customer-facing term over tenant/workspace. |
| Active framework | active framework | Preferred over enrolled framework. |
| Available framework | available to activate | Preferred over available to enroll. |
| Trust Center | Trust Center | Product name, keep US spelling. |
| Access review | access review | Decisions are keep, revoke, or modify. |
| Vendor risk | vendor risk | Use vendor, not supplier, for the module name. |
| Incident | incident | Use 72-hour deadline tracking, not countdown. |
| AI questionnaires | AI questionnaires | User-facing feature name. |
| Regulatory feed | regulatory feed | Generic English-EU label unless a specific authority is truly shown. |

## Needs Human Review

- `dashboard.nukib.badge` / `dashboard.nukib.title`: current generic "EU monitor" / "Regulatory feed" is acceptable only if the feed is not Czech NUKIB-only in production.
- Legal operator wording: "Czech sole-trader operator" is a clearer interim English rendering of OSVČ, but final public legal copy still needs the real operator identity.
