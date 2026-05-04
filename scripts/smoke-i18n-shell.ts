import assert from "node:assert/strict";
import { getMessagesForLocale } from "../i18n/messages";
import type { Locale } from "../i18n/routing";

const requiredNamespaces = [
  "navigation",
  "shell",
  "dashboard",
  "evidence",
  "onboarding",
  "organisationSettings",
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
  assert.ok(messages.shell.demoOrganisation, `${locale} should label demo organisation`);
  assert.ok(messages.shell.search, `${locale} should label shell search`);
  assert.ok(messages.onboarding.title, `${locale} should label onboarding`);
  assert.ok(
    messages.organisationSettings.profile.save,
    `${locale} should label organisation settings save`,
  );
}

const en = getMessagesForLocale("en-EU");
assert.equal(en.shell.upgradePlan, "Upgrade plan");
assert.equal(en.dashboard.metrics.scoreTitle, "Compliance score");
assert.equal(en.evidence.filters.apply, "Apply filters");
assert.equal(en.navigation.evidence, "Evidence");
assert.equal(en.organisationSettings.profile.save, "Save changes");
assert.notEqual(en.shell.freePlanBanner, getMessagesForLocale("cs-CZ").shell.freePlanBanner);

const it = getMessagesForLocale("it-IT");
assert.equal(it.shell.upgradePlan, "Aggiorna piano");
assert.equal(it.dashboard.metrics.scoreTitle, "Punteggio compliance");
assert.equal(it.evidence.filters.apply, "Applica filtri");
assert.equal(it.navigation.evidence, "Evidenze");
assert.equal(it.organisationSettings.profile.save, "Salva modifiche");
assert.notEqual(it.shell.freePlanBanner, getMessagesForLocale("cs-CZ").shell.freePlanBanner);

console.log("i18n shell smoke test passed.");
