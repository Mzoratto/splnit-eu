import assert from "node:assert/strict";
import { getMessagesForLocale } from "../i18n/messages";
import type { Locale } from "../i18n/routing";
import { AUTHORITATIVE_SOURCE_DOCUMENTS } from "../lib/regulations/authoritative-sources";
import {
  listResolvedPolicyTemplates,
  resolvePolicyTemplate,
} from "../lib/policies/resolve-template";
import { POLICY_TEMPLATE_TYPES, POLICY_TEMPLATES } from "../lib/policies/templates";
import { getPolicyUiCopy } from "../lib/policies/ui-copy";

type TenantScenario = {
  country: string;
  expectedTemplateJurisdiction: string;
  expectedTemplateLocale: Locale;
  locale: Locale;
  name: string;
  primaryJurisdiction: string;
  sourceDocumentScopes: Array<{
    jurisdiction: string;
    locale: Locale;
  }>;
};

const tenantScenarios: TenantScenario[] = [
  {
    country: "CZ",
    expectedTemplateJurisdiction: "CZ",
    expectedTemplateLocale: "cs-CZ",
    locale: "cs-CZ",
    name: "Smoke Czech Tenant",
    primaryJurisdiction: "CZ",
    sourceDocumentScopes: [{ jurisdiction: "CZ", locale: "cs-CZ" }],
  },
  {
    country: "DE",
    expectedTemplateJurisdiction: "EU",
    expectedTemplateLocale: "en-EU",
    locale: "en-EU",
    name: "Smoke English-EU Tenant",
    primaryJurisdiction: "EU",
    sourceDocumentScopes: [{ jurisdiction: "EU", locale: "en-EU" }],
  },
  {
    country: "IT",
    expectedTemplateJurisdiction: "EU",
    expectedTemplateLocale: "en-EU",
    locale: "it-IT",
    name: "Smoke Italian Tenant",
    primaryJurisdiction: "IT",
    sourceDocumentScopes: [
      { jurisdiction: "IT", locale: "it-IT" },
      { jurisdiction: "EU", locale: "en-EU" },
    ],
  },
];

function assertLocaleSmokeCopy(locale: Locale) {
  const messages = getMessagesForLocale(locale);
  const policyCopy = getPolicyUiCopy(locale);

  if (locale === "cs-CZ") {
    assert.equal(messages.dashboard.nukib.title, "Feed NÚKIB");
    assert.equal(messages.frameworks.index.title, "Regulace a standardy");
    assert.equal(policyCopy.list.title, "Compliance dokumenty");
    return;
  }

  if (locale === "en-EU") {
    assert.equal(messages.dashboard.nukib.title, "Regulatory feed");
    assert.equal(messages.frameworks.index.title, "Regulations and standards");
    assert.equal(policyCopy.list.title, "Compliance documents");
    return;
  }

  assert.equal(messages.dashboard.nukib.title, "Feed normativo");
  assert.equal(messages.frameworks.index.title, "Normative e standard");
  assert.equal(policyCopy.list.title, "Documenti di compliance");
}

function countSourceDocuments(scope: { jurisdiction: string; locale: Locale }) {
  return AUTHORITATIVE_SOURCE_DOCUMENTS.filter(
    (source) => source.jurisdiction === scope.jurisdiction && source.locale === scope.locale,
  ).length;
}

for (const scenario of tenantScenarios) {
  assert.equal(scenario.country.length, 2, `${scenario.name} should use ISO-like country code.`);
  assertLocaleSmokeCopy(scenario.locale);

  const resolvedTemplates = listResolvedPolicyTemplates({
    locale: scenario.locale,
    primaryJurisdiction: scenario.primaryJurisdiction,
  });

  assert.equal(resolvedTemplates.length, POLICY_TEMPLATE_TYPES.length);

  for (const family of POLICY_TEMPLATE_TYPES) {
    const template = resolvePolicyTemplate(family, {
      locale: scenario.locale,
      primaryJurisdiction: scenario.primaryJurisdiction,
    });

    assert.equal(
      template.jurisdiction,
      scenario.expectedTemplateJurisdiction,
      `${family} should resolve ${scenario.name} to ${scenario.expectedTemplateJurisdiction}/${scenario.expectedTemplateLocale}`,
    );
    assert.equal(template.locale, scenario.expectedTemplateLocale);
    assert.notEqual(
      template.jurisdiction,
      scenario.primaryJurisdiction === "CZ" ? "EU" : "CZ",
    );
  }

  for (const scope of scenario.sourceDocumentScopes) {
    assert.ok(
      countSourceDocuments(scope) > 0,
      `${scenario.name} should have source document metadata for ${scope.jurisdiction}/${scope.locale}.`,
    );
  }
}

const italianTemplates = POLICY_TEMPLATES.filter(
  (template) => template.jurisdiction === "IT" && template.locale === "it-IT",
);

assert.ok(italianTemplates.length > 0, "Italian policy templates should be represented.");
assert.equal(
  italianTemplates.every((template) => template.reviewStatus === "draft"),
  true,
  "Italian policy templates must remain draft/secondary until legal review promotes them.",
);

console.log("Tenant locale source smoke test passed.");
