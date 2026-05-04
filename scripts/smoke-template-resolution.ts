import assert from "node:assert/strict";
import {
  listResolvedPolicyTemplates,
  resolvePolicyTemplate,
  TemplateNotFoundError,
} from "../lib/policies/resolve-template";
import {
  POLICY_TEMPLATE_TYPES,
  type PolicyTemplateType,
} from "../lib/policies/templates";

type TenantContext = {
  locale: string;
  primaryJurisdiction: string;
};

const czTenant = {
  locale: "cs-CZ",
  primaryJurisdiction: "CZ",
} satisfies TenantContext;

const euTenant = {
  locale: "en-EU",
  primaryJurisdiction: "EU",
} satisfies TenantContext;

const itTenant = {
  locale: "it-IT",
  primaryJurisdiction: "IT",
} satisfies TenantContext;

function collectTemplateText(template: ReturnType<typeof resolvePolicyTemplate>) {
  const values = [template.titleCs, template.description];

  for (const section of template.sections) {
    values.push(section.title);

    if (section.body) {
      values.push(section.body);
    }

    if (section.fields) {
      values.push(...section.fields);
    }
  }

  return values.join("\n");
}

function assertResolvedSet(
  label: string,
  tenant: TenantContext,
  expected: { jurisdiction: string; locale: string },
) {
  const templates = listResolvedPolicyTemplates(tenant);

  assert.equal(
    templates.length,
    POLICY_TEMPLATE_TYPES.length,
    `${label}: every template family should resolve`,
  );
  assert.deepEqual(
    new Set(templates.map((template) => template.templateFamily)),
    new Set(POLICY_TEMPLATE_TYPES),
    `${label}: resolved templates should cover each family exactly once`,
  );

  for (const template of templates) {
    assert.equal(
      template.jurisdiction,
      expected.jurisdiction,
      `${label}: ${template.templateFamily} should resolve to ${expected.jurisdiction}`,
    );
    assert.equal(
      template.locale,
      expected.locale,
      `${label}: ${template.templateFamily} should resolve to ${expected.locale}`,
    );
    assert.doesNotMatch(
      collectTemplateText(template),
      /\{\{/,
      `${label}: ${template.templateFamily} should not leak unresolved placeholders`,
    );
  }
}

assertResolvedSet("Czech tenant", czTenant, {
  jurisdiction: "CZ",
  locale: "cs-CZ",
});

assertResolvedSet("English-EU tenant", euTenant, {
  jurisdiction: "EU",
  locale: "en-EU",
});

assertResolvedSet("Italian tenant", itTenant, {
  jurisdiction: "EU",
  locale: "en-EU",
});

for (const family of POLICY_TEMPLATE_TYPES) {
  const template = resolvePolicyTemplate(family, itTenant);
  assert.notEqual(
    template.jurisdiction,
    "CZ",
    `Italian tenant must not fall back to Czech for ${family}`,
  );
  assert.notEqual(
    template.locale,
    "cs-CZ",
    `Italian tenant must not receive Czech locale for ${family}`,
  );
}

const czAiPolicy = resolvePolicyTemplate("ai_policy", czTenant);
assert.match(
  collectTemplateText(czAiPolicy),
  /IČO/,
  "Czech templates should materialize tenant legal identifier labels",
);

const czGdprNotice = resolvePolicyTemplate("gdpr_privacy_notice", czTenant);
assert.match(
  collectTemplateText(czGdprNotice),
  /ÚOOÚ/,
  "Czech GDPR templates should materialize the Czech data protection authority",
);

const czRecordOfUse = resolvePolicyTemplate("record_of_use", czTenant);
assert.match(
  collectTemplateText(czRecordOfUse),
  /ČTÚ/,
  "Czech AI Act templates should materialize the Czech telecom authority",
);

assert.throws(
  () =>
    resolvePolicyTemplate("missing_template" as PolicyTemplateType, itTenant),
  TemplateNotFoundError,
  "unknown template families should fail loudly",
);

console.log("Policy template resolution smoke test passed.");
