import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";
import { getMessagesForLocale } from "../i18n/messages";
import type { Locale } from "../i18n/routing";
import {
  listResolvedPolicyTemplates,
  resolvePolicyTemplate,
} from "../lib/policies/resolve-template";
import { POLICY_TEMPLATE_TYPES } from "../lib/policies/templates";
import { getPolicyUiCopy } from "../lib/policies/ui-copy";

loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL?.trim();

assert.ok(databaseUrl, "DATABASE_URL is required for Italian tenant smoke test.");

type TenantScenario = {
  clerkOrgIdPrefix: string;
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
    clerkOrgIdPrefix: "smoke_cz",
    country: "CZ",
    expectedTemplateJurisdiction: "CZ",
    expectedTemplateLocale: "cs-CZ",
    locale: "cs-CZ",
    name: "Smoke Czech Tenant",
    primaryJurisdiction: "CZ",
    sourceDocumentScopes: [{ jurisdiction: "CZ", locale: "cs-CZ" }],
  },
  {
    clerkOrgIdPrefix: "smoke_eu",
    country: "DE",
    expectedTemplateJurisdiction: "EU",
    expectedTemplateLocale: "en-EU",
    locale: "en-EU",
    name: "Smoke English-EU Tenant",
    primaryJurisdiction: "EU",
    sourceDocumentScopes: [{ jurisdiction: "EU", locale: "en-EU" }],
  },
  {
    clerkOrgIdPrefix: "smoke_it",
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
    assert.equal(messages.dashboard.nukib.title, "NÚKIB feed");
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

async function main() {
  const pool = new Pool({ connectionString: databaseUrl, max: 1 });
  const client = await pool.connect();
  let transactionOpen = false;

  try {
    await client.query("BEGIN");
    transactionOpen = true;

    for (const scenario of tenantScenarios) {
      const clerkOrgId = `${scenario.clerkOrgIdPrefix}_${Date.now()}`;

      await client.query(
        `
        INSERT INTO organisations (
          clerk_org_id,
          country,
          locale,
          name,
          primary_jurisdiction
        )
        VALUES ($1, $2, $3, $4, $5)
      `,
        [
          clerkOrgId,
          scenario.country,
          scenario.locale,
          scenario.name,
          scenario.primaryJurisdiction,
        ],
      );

      const tenantResult = await client.query<{
        country: string;
        locale: Locale;
        primary_jurisdiction: string;
      }>(
        `
        SELECT country, locale, primary_jurisdiction
        FROM organisations
        WHERE clerk_org_id = $1
      `,
        [clerkOrgId],
      );
      const tenant = tenantResult.rows[0];

      assert.ok(tenant, `${scenario.name} should be inserted.`);
      assert.equal(tenant.country, scenario.country);
      assert.equal(tenant.locale, scenario.locale);
      assert.equal(tenant.primary_jurisdiction, scenario.primaryJurisdiction);

      const resolvedTemplates = listResolvedPolicyTemplates({
        locale: tenant.locale,
        primaryJurisdiction: tenant.primary_jurisdiction,
      });

      assert.equal(resolvedTemplates.length, POLICY_TEMPLATE_TYPES.length);

      for (const family of POLICY_TEMPLATE_TYPES) {
        const template = resolvePolicyTemplate(family, {
          locale: tenant.locale,
          primaryJurisdiction: tenant.primary_jurisdiction,
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

      const sourceDocumentCounts = await client.query<{
        count: string;
        jurisdiction: string;
        locale: Locale;
      }>(
        `
        SELECT jurisdiction, locale, count(*)::text
        FROM source_documents
        WHERE (${scenario.sourceDocumentScopes
          .map((_, index) => `(jurisdiction = $${index * 2 + 1} AND locale = $${index * 2 + 2})`)
          .join(" OR ")})
        GROUP BY jurisdiction, locale
      `,
        scenario.sourceDocumentScopes.flatMap((scope) => [
          scope.jurisdiction,
          scope.locale,
        ]),
      );
      const countByScope = new Map(
        sourceDocumentCounts.rows.map((row) => [
          `${row.jurisdiction}/${row.locale}`,
          Number(row.count),
        ]),
      );

      for (const scope of scenario.sourceDocumentScopes) {
        assert.ok(
          (countByScope.get(`${scope.jurisdiction}/${scope.locale}`) ?? 0) > 0,
          `${scenario.name} should have source documents for ${scope.jurisdiction}/${scope.locale}.`,
        );
      }

      assertLocaleSmokeCopy(scenario.locale);
    }

    await client.query("ROLLBACK");
    transactionOpen = false;
  } finally {
    if (transactionOpen) {
      await client.query("ROLLBACK");
    }
    client.release();
    await pool.end();
  }
}

main()
  .then(() => {
    console.log("Tenant locale smoke test passed.");
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
