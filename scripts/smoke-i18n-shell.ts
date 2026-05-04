import assert from "node:assert/strict";
import { getMessagesForLocale } from "../i18n/messages";
import type { Locale } from "../i18n/routing";

const requiredNamespaces = [
  "navigation",
  "shell",
  "dashboard",
  "evidence",
  "frameworks",
  "integrations",
  "onboarding",
  "organisationSettings",
  "trustCenterSettings",
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
  assert.ok(messages.dashboard.metrics.scoreTitle, `${locale} should label dashboard score`);
  assert.ok(messages.evidence.filters.apply, `${locale} should label evidence filters`);
  assert.ok(messages.frameworks.index.title, `${locale} should label frameworks`);
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
    messages.trustCenterSettings.saveSettings,
    `${locale} should label Trust Center settings save`,
  );
}

const en = getMessagesForLocale("en-EU");
assert.equal(en.shell.upgradePlan, "Upgrade plan");
assert.equal(en.dashboard.metrics.scoreTitle, "Compliance score");
assert.equal(en.evidence.filters.apply, "Apply filters");
assert.equal(en.frameworks.index.title, "Regulations and standards");
assert.equal(en.integrations.index.title, "Automated tests");
assert.equal(en.integrations.providerPages.aws.title, "AWS integration");
assert.equal(en.integrations.providerPages.github.repositories, "Repositories");
assert.equal(en.integrations.providerPages.microsoft365.connect, "Connect Microsoft 365");
assert.equal(en.navigation.evidence, "Evidence");
assert.equal(en.organisationSettings.profile.save, "Save changes");
assert.equal(en.trustCenterSettings.title, "Public compliance centre");
assert.equal(en.trustCenterSettings.saveSettings, "Save settings");
assert.notEqual(en.shell.freePlanBanner, getMessagesForLocale("cs-CZ").shell.freePlanBanner);

const it = getMessagesForLocale("it-IT");
assert.equal(it.shell.upgradePlan, "Aggiorna piano");
assert.equal(it.dashboard.metrics.scoreTitle, "Punteggio compliance");
assert.equal(it.evidence.filters.apply, "Applica filtri");
assert.equal(it.frameworks.index.title, "Normative e standard");
assert.equal(it.integrations.index.title, "Test automatici");
assert.equal(it.integrations.providerPages.aws.title, "Integrazione AWS");
assert.equal(it.integrations.providerPages.github.repositories, "Repository");
assert.equal(it.integrations.providerPages.microsoft365.connect, "Collega Microsoft 365");
assert.equal(it.navigation.evidence, "Evidenze");
assert.equal(it.organisationSettings.profile.save, "Salva modifiche");
assert.equal(it.trustCenterSettings.title, "Centro compliance pubblico");
assert.equal(it.trustCenterSettings.saveSettings, "Salva impostazioni");
assert.notEqual(it.shell.freePlanBanner, getMessagesForLocale("cs-CZ").shell.freePlanBanner);

console.log("i18n shell smoke test passed.");
