import assert from "node:assert/strict";
import { getMessagesForLocale } from "../i18n/messages";
import type { Locale } from "../i18n/routing";

const requiredNamespaces = [
  "navigation",
  "shell",
  "accessReviews",
  "controlsPage",
  "dashboard",
  "clientsPage",
  "evidence",
  "frameworks",
  "incidents",
  "integrations",
  "onboarding",
  "organisationSettings",
  "risks",
  "teamPage",
  "trustCenterSettings",
  "vendorsPage",
] as const;
const locales: Locale[] = ["cs-CZ", "en-EU", "it-IT"];

for (const locale of locales) {
  const messages = getMessagesForLocale(locale);

  for (const namespace of requiredNamespaces) {
    assert.ok(
      messages[namespace],
      `${locale} should include ${namespace} messages`,
    );
  }

  assert.ok(messages.navigation.dashboard, `${locale} should label dashboard`);
  assert.ok(
    messages.accessReviews.form.start,
    `${locale} should label access reviews`,
  );
  assert.ok(messages.controlsPage.index.openControl, `${locale} should label controls`);
  assert.ok(messages.dashboard.metrics.scoreTitle, `${locale} should label dashboard score`);
  assert.ok(messages.clientsPage.form.save, `${locale} should label clients page`);
  assert.ok(messages.evidence.filters.apply, `${locale} should label evidence filters`);
  assert.ok(messages.frameworks.index.title, `${locale} should label frameworks`);
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
  assert.ok(messages.risks.form.add, `${locale} should label risks`);
  assert.ok(messages.teamPage.open, `${locale} should label team page`);
  assert.ok(
    messages.trustCenterSettings.saveSettings,
    `${locale} should label Trust Center settings save`,
  );
  assert.ok(messages.vendorsPage.form.create, `${locale} should label vendors`);
}

const en = getMessagesForLocale("en-EU");
assert.equal(en.shell.upgradePlan, "Upgrade plan");
assert.equal(en.accessReviews.title, "Access reviews");
assert.equal(en.accessReviews.form.start, "Load users");
assert.equal(en.controlsPage.index.title, "Control library");
assert.equal(en.controlsPage.detail.saveStatus, "Save status");
assert.equal(en.dashboard.metrics.scoreTitle, "Compliance score");
assert.equal(en.clientsPage.title, "Client dashboard");
assert.equal(en.clientsPage.form.save, "Save link");
assert.equal(en.evidence.filters.apply, "Apply filters");
assert.equal(en.frameworks.index.title, "Regulations and standards");
assert.equal(en.incidents.title, "Incidents");
assert.equal(en.incidents.wizard.create, "Create incident");
assert.equal(en.integrations.index.title, "Automated tests");
assert.equal(en.integrations.providerPages.aws.title, "AWS integration");
assert.equal(en.integrations.providerPages.github.repositories, "Repositories");
assert.equal(en.integrations.providerPages.microsoft365.connect, "Connect Microsoft 365");
assert.equal(en.navigation.evidence, "Evidence");
assert.equal(en.organisationSettings.profile.save, "Save changes");
assert.equal(en.risks.title, "Risks");
assert.equal(en.risks.form.add, "Add risk");
assert.equal(en.teamPage.title, "Access and training");
assert.equal(en.teamPage.open, "Open");
assert.equal(en.trustCenterSettings.title, "Public compliance centre");
assert.equal(en.trustCenterSettings.saveSettings, "Save settings");
assert.equal(en.vendorsPage.title, "Vendor risk");
assert.equal(en.vendorsPage.form.create, "Create");
assert.notEqual(en.shell.freePlanBanner, getMessagesForLocale("cs-CZ").shell.freePlanBanner);

const it = getMessagesForLocale("it-IT");
assert.equal(it.shell.upgradePlan, "Aggiorna piano");
assert.equal(it.accessReviews.title, "Revisioni accessi");
assert.equal(it.accessReviews.form.start, "Carica utenti");
assert.equal(it.controlsPage.index.title, "Libreria controlli");
assert.equal(it.controlsPage.detail.saveStatus, "Salva stato");
assert.equal(it.dashboard.metrics.scoreTitle, "Punteggio compliance");
assert.equal(it.clientsPage.title, "Dashboard clienti");
assert.equal(it.clientsPage.form.save, "Salva collegamento");
assert.equal(it.evidence.filters.apply, "Applica filtri");
assert.equal(it.frameworks.index.title, "Normative e standard");
assert.equal(it.incidents.title, "Incidenti");
assert.equal(it.incidents.wizard.create, "Crea incidente");
assert.equal(it.integrations.index.title, "Test automatici");
assert.equal(it.integrations.providerPages.aws.title, "Integrazione AWS");
assert.equal(it.integrations.providerPages.github.repositories, "Repository");
assert.equal(it.integrations.providerPages.microsoft365.connect, "Collega Microsoft 365");
assert.equal(it.navigation.evidence, "Evidenze");
assert.equal(it.organisationSettings.profile.save, "Salva modifiche");
assert.equal(it.risks.title, "Rischi");
assert.equal(it.risks.form.add, "Aggiungi rischio");
assert.equal(it.teamPage.title, "Accessi e formazione");
assert.equal(it.teamPage.open, "Apri");
assert.equal(it.trustCenterSettings.title, "Centro compliance pubblico");
assert.equal(it.trustCenterSettings.saveSettings, "Salva impostazioni");
assert.equal(it.vendorsPage.title, "Rischio fornitori");
assert.equal(it.vendorsPage.form.create, "Crea");
assert.notEqual(it.shell.freePlanBanner, getMessagesForLocale("cs-CZ").shell.freePlanBanner);

console.log("i18n shell smoke test passed.");
