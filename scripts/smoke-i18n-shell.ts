import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import {
  getLocalizedMarketingPath,
  toInternalMarketingPath,
} from "../i18n/marketing-paths";
import { getMessagesForLocale } from "../i18n/messages";
import type { Locale } from "../i18n/routing";
import sitemap from "../app/sitemap";
import { getControlDisplayTitle } from "../lib/controls/localization";
import { CONTROL_LIBRARY } from "../lib/controls/library";
import {
  getFrameworkDisplayDescription,
  getFrameworkDisplayRegulator,
} from "../lib/frameworks/localization";
import { FRAMEWORK_LIBRARY } from "../lib/frameworks/registry";
import { FRAMEWORK_QUESTIONS } from "../lib/frameworks/questions";

const requiredNamespaces = [
  "navigation",
  "shell",
  "accessReviews",
  "activation",
  "appError",
  "auditLogPage",
  "billingSettings",
  "clientDetailPage",
  "complianceReport",
  "controlsPage",
  "dashboard",
  "clientsPage",
  "evidence",
  "frameworks",
  "frameworkWizard",
  "incidents",
  "integrations",
  "onboarding",
  "organisationSettings",
  "questionnairePage",
  "risks",
  "teamPage",
  "trustCenterPreview",
  "trustCenterSettings",
  "vendorsPage",
  "workspace",
] as const;
const locales: Locale[] = ["cs-CZ", "en-EU", "it-IT"];

function formatMessage(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (message, [key, value]) => message.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

assert.equal(
  existsSync("messages/en.json"),
  false,
  "messages/en.json must not exist; en-EU is the English master copy",
);
assert.equal(
  existsSync("messages/cs.json"),
  false,
  "messages/cs.json must not exist; cs-CZ is the active Czech locale",
);

for (const locale of locales) {
  const messages = getMessagesForLocale(locale);

  for (const namespace of requiredNamespaces) {
    assert.ok(
      messages[namespace],
      `${locale} should include ${namespace} messages`,
    );
  }

  assert.ok(messages.navigation.dashboard, `${locale} should label dashboard`);
  assert.ok(messages.appError.retry, `${locale} should label app error retry`);
  assert.ok(
    messages.accessReviews.form.start,
    `${locale} should label access reviews`,
  );
  assert.ok(messages.activation.states.pass.label, `${locale} should label activation state`);
  assert.ok(messages.auditLogPage.filters.apply, `${locale} should label audit log`);
  assert.ok(messages.billingSettings.monthSuffix, `${locale} should label billing`);
  assert.ok(messages.clientDetailPage.back, `${locale} should label client detail`);
  assert.ok(messages.complianceReport.download, `${locale} should label compliance report download`);
  assert.ok(messages.controlsPage.index.openControl, `${locale} should label controls`);
  assert.ok(messages.dashboard.metrics.scoreTitle, `${locale} should label dashboard score`);
  assert.ok(messages.clientsPage.form.save, `${locale} should label clients page`);
  assert.ok(messages.evidence.filters.apply, `${locale} should label evidence filters`);
  assert.ok(messages.frameworks.index.title, `${locale} should label frameworks`);
  assert.ok(messages.frameworkWizard.next, `${locale} should label framework wizard`);
  assert.ok(messages.incidents.wizard.create, `${locale} should label incidents`);
  assert.ok(messages.integrations.index.title, `${locale} should label integrations`);
  assert.ok(
    messages.integrations.providerPages.common.runResults,
    `${locale} should label integration provider pages`,
  );
  assert.ok(messages.shell.demoOrganisation, `${locale} should label demo organisation`);
  assert.ok(messages.shell.search, `${locale} should label shell search`);
  assert.ok(messages.onboarding.title, `${locale} should label onboarding`);
  assert.ok(
    messages.organisationSettings.profile.save,
    `${locale} should label organisation settings save`,
  );
  assert.ok(
    messages.questionnairePage.workbench.generate,
    `${locale} should label questionnaires`,
  );
  assert.ok(messages.risks.form.add, `${locale} should label risks`);
  assert.ok(messages.teamPage.open, `${locale} should label team page`);
  assert.ok(
    messages.trustCenterSettings.saveSettings,
    `${locale} should label Trust Center settings save`,
  );
  assert.ok(messages.trustCenterPreview.previewTab, `${locale} should label Trust Center preview`);
  assert.ok(messages.vendorsPage.form.create, `${locale} should label vendors`);
  assert.ok(messages.workspace.backToControls, `${locale} should label workspace navigation`);
}

const en = getMessagesForLocale("en-EU");
const frameworkQuestionIds = Array.from(
  new Set(Object.values(FRAMEWORK_QUESTIONS).flat().map((question) => question.id)),
);
assert.equal(en.shell.upgradePlan, "Upgrade plan");
assert.equal(en.shell.trustCenter, "Trust Center");
assert.equal(en.appError.retry, "Try again");
assert.equal(en.accessReviews.title, "Access reviews");
assert.equal(en.accessReviews.form.start, "Load users");
assert.equal(en.activation.blockedReasons.invalid_key, "Invalid key");
assert.equal(en.auditLogPage.records.title, "Records");
assert.equal(en.billingSettings.monthSuffix, "/month");
assert.equal(en.clientDetailPage.back, "Back to clients");
assert.equal(en.clientDetailPage.eyebrow, "Client view");
assert.equal(en.complianceReport.title, "Cybersecurity posture assessment report");
assert.equal(en.complianceReport.download, "Download compliance report (PDF)");
assert.equal(en.complianceReport.fields.sidlo, "Registered address");
assert.equal(en.controlsPage.index.title, "Control library");
assert.equal(en.controlsPage.report.title, "Cybersecurity posture assessment report");
assert.equal(en.controlsPage.detail.saveStatus, "Save status");
assert.equal(en.controlsPage.statuses.fail, "Not passed");
assert.equal(en.dashboard.metrics.scoreTitle, "Compliance score");
assert.equal(en.dashboard.nukib.title, "Regulatory feed");
assert.doesNotMatch(en.dashboard.nukib.title, /NÚKIB|ÚOOÚ/);
assert.doesNotMatch(en.dashboard.demoUpdates.nukibMethodology.title, /NÚKIB|ÚOOÚ/);
assert.equal(en.clientsPage.title, "Client dashboard");
assert.equal(en.clientsPage.form.save, "Save link");
assert.equal(en.evidence.filters.apply, "Apply filters");
assert.equal(en.evidence.statuses.fail, "Not passed");
assert.equal(en.frameworks.index.title, "Regulations and standards");
assert.equal(en.frameworks.index.enrolledTitle, "Active frameworks");
assert.equal(en.frameworks.regulators.nis2, "National cybersecurity authority");
assert.equal(en.frameworkWizard.submit, "Run assessment");
for (const questionId of frameworkQuestionIds) {
  assert.ok(
    (en.frameworkWizard.questions as Record<string, { text: string }>)[questionId]?.text,
    `en-EU should translate framework wizard question ${questionId}`,
  );
}
assert.equal(en.incidents.title, "Incidents");
assert.equal(en.incidents.wizard.create, "Create incident");
assert.equal(
  formatMessage(en.incidents.actions.cybersecurityPdf, {
    authority: "Cybersecurity authority",
  }),
  "Cybersecurity authority PDF",
);
assert.doesNotMatch(
  formatMessage(en.incidents.actions.cybersecurityPdf, {
    authority: "Cybersecurity authority",
  }),
  /NÚKIB|ÚOOÚ/,
);
assert.doesNotMatch(en.incidents.checklist.markDataProtection, /NÚKIB|ÚOOÚ/);
assert.equal(en.integrations.index.title, "Automated tests");
assert.equal(en.integrations.index.recommendationTitle, "Connect the first evidence source");
assert.equal(en.integrations.index.manualUpload, "Upload evidence manually");
assert.equal(en.integrations.providerPages.aws.title, "AWS integration");
assert.equal(en.integrations.providerPages.github.repositories, "Repositories");
assert.equal(en.integrations.providerPages.microsoft365.connect, "Connect Microsoft 365");
assert.equal(en.navigation.evidence, "Evidence");
assert.equal(en.organisationSettings.profile.save, "Save changes");
assert.equal(en.questionnairePage.title, "Security questionnaires");
assert.equal(en.questionnairePage.workbench.generate, "Generate answers");
assert.equal(en.questionnairePage.workbench.sampleQuestions[0], "Do you enforce MFA for all users?");
assert.equal(
  (en.frameworkWizard.questions as Record<string, { text: string }>).mfa.text,
  "Is MFA required for all user accounts?",
);
assert.equal(en.risks.title, "Risks");
assert.equal(en.risks.form.add, "Add risk");
assert.equal(en.teamPage.title, "Access and training");
assert.equal(en.teamPage.open, "Open");
assert.equal(en.trustCenterSettings.title, "Public compliance center");
assert.equal(en.trustCenterSettings.saveSettings, "Save settings");
assert.equal(en.trustCenterPreview.previewTab, "Preview");
assert.equal(en.vendorsPage.title, "Vendor risk");
assert.equal(en.vendorsPage.form.create, "Create");
assert.equal(en.workspace.backToControls, "Back to controls overview");
assert.equal(en.workspace.attestation.save, "Save attestation");
assert.notEqual(en.shell.freePlanBanner, getMessagesForLocale("cs-CZ").shell.freePlanBanner);
assert.equal(
  "pendingEntity" in en.marketing.footer,
  false,
  "marketing footer must not expose pending legal-entity placeholder copy",
);

const it = getMessagesForLocale("it-IT");
assert.equal(it.shell.upgradePlan, "Aggiorna piano");
assert.equal(it.appError.retry, "Riprova");
assert.equal(it.accessReviews.title, "Revisioni accessi");
assert.equal(it.accessReviews.form.start, "Carica utenti");
assert.equal(it.activation.blockedReasons.invalid_key, "Chiave non valida");
assert.equal(it.auditLogPage.records.title, "Voci del log");
assert.equal(it.billingSettings.monthSuffix, "/mese");
assert.equal(it.clientDetailPage.back, "Torna ai clienti");
assert.equal(it.complianceReport.title, "Report di valutazione della postura cybersecurity");
assert.equal(it.complianceReport.download, "Scarica report compliance (PDF)");
assert.equal(it.complianceReport.fields.sidlo, "Sede legale");
assert.doesNotMatch(it.complianceReport.title, /Zpráva|hodnocení|kybernetické/);
assert.doesNotMatch(it.complianceReport.download, /Stáhnout|zprávu|shodě/);
assert.equal(it.controlsPage.index.title, "Libreria controlli");
assert.equal(it.controlsPage.report.title, "Report di valutazione della postura cybersecurity");
assert.equal(it.controlsPage.index.focusStartTitle, "Iniziate qui");
assert.equal(
  it.controlsPage.index.focusStartSubtitle,
  "La vista predefinita mostra i gap più importanti emersi dall’intake. Aprite l’intera libreria con il selettore Tutti.",
);
assert.equal(it.controlsPage.index.focusView, "Focus");
assert.equal(it.controlsPage.index.allView, "Tutti");
assert.equal(it.controlsPage.index.effortLabel, "Stima sforzo");
assert.equal(it.controlsPage.index.effortWithIntegration, "~10 min con integrazione");
assert.equal(it.controlsPage.index.loadMore, "Carica altri 5");
assert.equal(
  it.controlsPage.index.demoMode,
  "Modalità demo: dati di esempio senza organizzazione autenticata",
);
assert.equal(
  it.controlsPage.index.emptyFocus,
  "L’intake non ha ancora prodotto gap prioritari per questo filtro. Passate a Tutti oppure modificate il filtro.",
);
assert.equal(it.controlsPage.detail.saveStatus, "Salva stato");
assert.equal(it.controlsPage.statuses.fail, "Non superato");
assert.equal(it.dashboard.metrics.scoreTitle, "Punteggio compliance");
assert.equal(it.dashboard.nukib.badge, "Monitor UE");
assert.equal(it.dashboard.nukib.title, "Feed normativo");
assert.doesNotMatch(it.dashboard.nukib.title, /NÚKIB|ÚOOÚ/);
assert.doesNotMatch(it.dashboard.nukib.badge, /Italia/);
assert.doesNotMatch(it.dashboard.demoUpdates.nukibMethodology.title, /NÚKIB|ÚOOÚ/);
assert.equal(it.clientsPage.title, "Dashboard clienti");
assert.equal(it.clientsPage.form.save, "Salva collegamento");
assert.equal(it.evidence.filters.apply, "Applica filtri");
assert.equal(it.evidence.statuses.fail, "Non superato");
assert.equal(it.frameworks.index.title, "Normative e standard");
assert.equal(
  it.frameworks.regulators.nis2,
  "ACN — Agenzia per la Cybersicurezza Nazionale",
);
assert.equal(it.frameworkWizard.submit, "Valuta");
for (const questionId of frameworkQuestionIds) {
  assert.ok(
    (it.frameworkWizard.questions as Record<string, { text: string }>)[questionId]?.text,
    `it-IT should translate framework wizard question ${questionId}`,
  );
}
assert.equal(it.incidents.title, "Incidenti");
assert.equal(it.incidents.wizard.create, "Crea incidente");
assert.equal(
  formatMessage(it.incidents.actions.cybersecurityPdf, {
    authority: "ACN / CSIRT Italia",
  }),
  "ACN / CSIRT Italia PDF",
);
assert.doesNotMatch(
  formatMessage(it.incidents.actions.cybersecurityPdf, {
    authority: "ACN / CSIRT Italia",
  }),
  /NÚKIB|ÚOOÚ/,
);
assert.doesNotMatch(it.incidents.checklist.markDataProtection, /NÚKIB|ÚOOÚ/);
assert.equal(it.integrations.index.title, "Test automatici");
assert.equal(it.integrations.index.recommendationTitle, "Collegate la prima fonte di evidenze");
assert.equal(it.integrations.index.manualUpload, "Carica evidenza manualmente");
assert.doesNotMatch(it.integrations.index.manualUpload, /Ruční|nahrání/);
assert.equal(it.integrations.providerPages.aws.title, "Integrazione AWS");
assert.equal(it.integrations.providerPages.github.repositories, "Repository");
assert.equal(it.integrations.providerPages.microsoft365.connect, "Collega Microsoft 365");
assert.equal(it.navigation.evidence, "Evidenze");
assert.equal(it.organisationSettings.profile.save, "Salva modifiche");
assert.equal(it.questionnairePage.title, "Questionari di sicurezza");
assert.equal(it.questionnairePage.workbench.generate, "Genera risposte");
assert.equal(it.questionnairePage.workbench.sampleQuestions[0], "Richiedete MFA per tutti gli utenti?");
assert.equal(
  (it.frameworkWizard.questions as Record<string, { text: string }>).mfa.text,
  "La MFA è obbligatoria per tutti gli account utente?",
);
assert.equal(it.risks.title, "Rischi");
assert.equal(it.risks.form.add, "Aggiungi rischio");
assert.equal(it.teamPage.title, "Accessi e formazione");
assert.equal(it.teamPage.open, "Apri");
assert.equal(it.trustCenterSettings.title, "Centro compliance pubblico");
assert.equal(it.trustCenterSettings.saveSettings, "Salva impostazioni");
assert.equal(it.trustCenterPreview.previewTab, "Anteprima");
assert.doesNotMatch(it.trustCenterPreview.unlockNote, /Každá|zamčená|důkaz/);
assert.equal(it.vendorsPage.title, "Rischio fornitori");
assert.equal(it.vendorsPage.form.create, "Crea");
assert.equal(it.workspace.backToControls, "Torna alla panoramica controlli");
assert.equal(it.workspace.attestation.save, "Salva attestazione");
assert.doesNotMatch(it.workspace.platformGuide, /Průvodce|projděte|důkazy/);
assert.notEqual(it.shell.freePlanBanner, getMessagesForLocale("cs-CZ").shell.freePlanBanner);
assert.equal(
  "pendingEntity" in it.marketing.footer,
  false,
  "marketing footer must not expose pending legal-entity placeholder copy",
);

const cs = getMessagesForLocale("cs-CZ");
assert.equal(cs.app.tagline, "Automatizace práce na souladu pro evropské MSP");
assert.equal(cs.shell.trustCenter, "Trust Center");
assert.equal(cs.marketing.nav.regulations, "EU Předpisy");
assert.equal(cs.marketing.footer.operator, "Splnit.eu — OSVČ, Olomouc");
assert.equal(cs.marketing.footer.copyright, "© 2026 Splnit.eu · OSVČ, Olomouc");
assert.equal(cs.marketing.about.tag, "O nás");
assert.equal(cs.marketing.about.whyTag, "Proč");
assert.equal(
  cs.marketing.about.whyTitle,
  "Compliance postavená vývojářem, respektující lokální legislativu.",
);
assert.equal(cs.home.trustBadges.onboarding, "Onboarding se zakladatelem");
assert.equal(cs.evidence.title, "Archiv evidence");
assert.equal(cs.frameworkWizard.submit, "Spustit vyhodnocení");
for (const questionId of frameworkQuestionIds) {
  assert.ok(
    (cs.frameworkWizard.questions as Record<string, { text: string }>)[questionId]?.text,
    `cs-CZ should translate framework wizard question ${questionId}`,
  );
}
assert.equal(
  (cs.frameworkWizard.questions as Record<string, { text: string }>).mfa.text,
  "Je MFA povinná pro všechny uživatelské účty?",
);
assert.equal(cs.auditLogPage.title, "Log aktivit");
assert.equal(cs.trustCenterSettings.requestsTitle, "Žádosti o přístup k dokumentům");
assert.equal(cs.frameworks.detail.breadcrumb, "Dashboard / Frameworky");
assert.equal(
  "pendingEntity" in cs.marketing.footer,
  false,
  "marketing footer must not expose pending legal-entity placeholder copy",
);

const untranslatedItalianControls = CONTROL_LIBRARY.filter(
  (control) => getControlDisplayTitle(control, "it-IT") === control.titleEn,
);
assert.deepEqual(
  untranslatedItalianControls.map((control) => control.key),
  [],
  "it-IT should not fall back to English control titles",
);
const mfaControl = CONTROL_LIBRARY.find(
  (control) => control.key === "ctrl_mfa_all_users",
);
assert.ok(mfaControl, "MFA control should exist");
assert.equal(
  getControlDisplayTitle(mfaControl, "it-IT"),
  "MFA abilitata per tutti gli account utente",
);
const nis2Framework = FRAMEWORK_LIBRARY.find((framework) => framework.slug === "nis2");
assert.ok(nis2Framework, "NIS2 framework should exist");
assert.equal(
  getFrameworkDisplayDescription(
    nis2Framework,
    "it-IT",
    it.frameworks.descriptions,
  ),
  "Cybersecurity, gestione del rischio, incident reporting e responsabilità del management.",
);
assert.equal(
  getFrameworkDisplayRegulator(nis2Framework, "it-IT", it.frameworks.regulators),
  "ACN — Agenzia per la Cybersicurezza Nazionale",
);

assert.equal(getLocalizedMarketingPath("/", "it-IT"), "/it");
assert.equal(getLocalizedMarketingPath("/about", "it-IT"), "/it/chi-siamo");
assert.equal(
  getLocalizedMarketingPath("/early-access", "it-IT"),
  "/it/accesso-anticipato",
);
assert.equal(getLocalizedMarketingPath("/predpisy", "it-IT"), "/it/normative");
assert.equal(
  getLocalizedMarketingPath("/predpisy/nis2", "it-IT"),
  "/it/normative/nis2",
);
assert.equal(getLocalizedMarketingPath("/cenik", "it-IT"), "/it/prezzi");
assert.equal(getLocalizedMarketingPath("/security", "it-IT"), "/it/sicurezza");
assert.equal(getLocalizedMarketingPath("/about", "en-EU"), "/en/about");
assert.equal(getLocalizedMarketingPath("/predpisy", "en-EU"), "/en/regulations");
assert.equal(getLocalizedMarketingPath("/cenik", "en-EU"), "/en/pricing");
assert.equal(toInternalMarketingPath("/it/chi-siamo"), "/about");
assert.equal(toInternalMarketingPath("/it/accesso-anticipato"), "/early-access");
assert.equal(toInternalMarketingPath("/it/normative/nis2"), "/predpisy/nis2");
assert.equal(toInternalMarketingPath("/it/prezzi"), "/cenik");
assert.equal(toInternalMarketingPath("/it/sicurezza"), "/security");

const sitemapUrls = sitemap().map((entry) => entry.url);
assert.ok(
  sitemapUrls.includes("https://splnit.eu/it/chi-siamo"),
  "sitemap should include Italian about alias",
);
assert.ok(
  sitemapUrls.includes("https://splnit.eu/it/normative/nis2"),
  "sitemap should include available Italian framework pages",
);
assert.ok(
  !sitemapUrls.some((url) => url.includes("/dora")),
  "sitemap should not link coming-soon framework pages",
);

console.log("i18n shell smoke test passed.");
