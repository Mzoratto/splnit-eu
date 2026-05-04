import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";
import { getMessagesForLocale } from "../i18n/messages";
import {
  listResolvedPolicyTemplates,
  resolvePolicyTemplate,
} from "../lib/policies/resolve-template";
import { POLICY_TEMPLATE_TYPES } from "../lib/policies/templates";
import { getPolicyUiCopy } from "../lib/policies/ui-copy";

loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL?.trim();

assert.ok(databaseUrl, "DATABASE_URL is required for Italian tenant smoke test.");

async function main() {
  const pool = new Pool({ connectionString: databaseUrl, max: 1 });
  const client = await pool.connect();
  let transactionOpen = false;

  try {
    await client.query("BEGIN");
    transactionOpen = true;

    const clerkOrgId = `smoke_it_${Date.now()}`;

    await client.query(
      `
      INSERT INTO organisations (
        clerk_org_id,
        country,
        locale,
        name,
        primary_jurisdiction
      )
      VALUES ($1, 'IT', 'it-IT', 'Smoke Italian Tenant', 'IT')
    `,
      [clerkOrgId],
    );

    const tenantResult = await client.query<{
      country: string;
      locale: string;
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

    assert.equal(tenant.country, "IT");
    assert.equal(tenant.locale, "it-IT");
    assert.equal(tenant.primary_jurisdiction, "IT");

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
        "EU",
        `${family} should fall back to EU templates until Italian legal templates are advisor-reviewed`,
      );
      assert.equal(template.locale, "en-EU");
      assert.notEqual(template.jurisdiction, "CZ");
    }

    const sourceDocumentCounts = await client.query<{
      count: string;
      jurisdiction: string;
      locale: string;
    }>(
      `
      SELECT jurisdiction, locale, count(*)::text
      FROM source_documents
      WHERE (jurisdiction = 'IT' AND locale = 'it-IT')
         OR (jurisdiction = 'EU' AND locale = 'en-EU')
      GROUP BY jurisdiction, locale
    `,
    );
    const countByScope = new Map(
      sourceDocumentCounts.rows.map((row) => [
        `${row.jurisdiction}/${row.locale}`,
        Number(row.count),
      ]),
    );

    assert.ok(
      (countByScope.get("IT/it-IT") ?? 0) > 0,
      "Italian source documents should be seeded.",
    );
    assert.ok(
      (countByScope.get("EU/en-EU") ?? 0) > 0,
      "EU/EN source documents should be available for template fallback.",
    );

    const itMessages = getMessagesForLocale("it-IT");
    const itPolicyCopy = getPolicyUiCopy("it-IT");
    assert.equal(itMessages.dashboard.nukib.title, "Feed normativo");
    assert.equal(itMessages.frameworks.index.title, "Normative e standard");
    assert.equal(itPolicyCopy.list.title, "Documenti di compliance");

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
    console.log("Italian tenant smoke test passed.");
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
