import assert from "node:assert/strict";
import { getMessagesForLocale } from "../i18n/messages";
import type { Locale } from "../i18n/routing";

const requiredNamespaces = ["navigation", "shell", "onboarding"] as const;
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
  assert.ok(messages.shell.search, `${locale} should label shell search`);
  assert.ok(messages.onboarding.title, `${locale} should label onboarding`);
}

const en = getMessagesForLocale("en-EU");
assert.equal(en.shell.upgradePlan, "Upgrade plan");
assert.equal(en.navigation.evidence, "Evidence");
assert.notEqual(en.shell.freePlanBanner, getMessagesForLocale("cs-CZ").shell.freePlanBanner);

const it = getMessagesForLocale("it-IT");
assert.equal(it.shell.upgradePlan, "Aggiorna piano");
assert.equal(it.navigation.evidence, "Evidenze");
assert.notEqual(it.shell.freePlanBanner, getMessagesForLocale("cs-CZ").shell.freePlanBanner);

console.log("i18n shell smoke test passed.");
