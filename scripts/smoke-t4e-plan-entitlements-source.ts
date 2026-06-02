import * as assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { PLANS } from "../lib/stripe/plans";

function read(filePath: string) {
  return readFileSync(filePath, "utf8");
}

function assertIncludes(source: string, needle: string, label: string) {
  assert.ok(source.includes(needle), `${label}: missing ${needle}`);
}

function assertMatches(source: string, pattern: RegExp, label: string) {
  assert.ok(pattern.test(source), `${label}: pattern ${pattern} not found`);
}

function walkFiles(root: string): string[] {
  const entries = readdirSync(root).flatMap((entry) => {
    const fullPath = path.join(root, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if ([".next", "node_modules", ".git"].includes(entry)) {
        return [];
      }

      return walkFiles(fullPath);
    }

    return [fullPath];
  });

  return entries;
}

function assertPricingMessagesUseCanonicalPlanNames(localePath: string) {
  const json = JSON.parse(read(localePath));
  const publicPricing = JSON.stringify(
    {
      billingSettings: json.billingSettings,
      pricing: json.pricing,
    },
    null,
    2,
  );

  for (const legacyName of ["Business", "Starter", "Consultant"]) {
    assert.doesNotMatch(
      publicPricing,
      new RegExp(`\\b${legacyName}\\b`),
      `${localePath}: public billing/pricing copy must not expose ${legacyName} as a plan name`,
    );
  }

  assert.strictEqual(json.billingSettings.planNames.sme, PLANS.sme.name, `${localePath}: billing SME plan name matches runtime`);
  assert.strictEqual(json.billingSettings.planNames.agency, PLANS.agency.name, `${localePath}: billing Agency plan name matches runtime`);
  assert.strictEqual(json.billingSettings.plans.sme.name, PLANS.sme.name, `${localePath}: billing SME card name matches runtime`);
  assert.strictEqual(json.billingSettings.plans.agency.name, PLANS.agency.name, `${localePath}: billing Agency card name matches runtime`);
  assert.strictEqual(json.pricing.cards.sme.name, PLANS.sme.name, `${localePath}: public SME card name matches runtime`);
  assert.strictEqual(json.pricing.cards.agency.name, PLANS.agency.name, `${localePath}: public Agency card name matches runtime`);
}

const planMatrixPath = "docs/product/plan-entitlement-matrix.md";
assert.ok(existsSync(planMatrixPath), "current Free/SME/Agency plan entitlement matrix must exist");

const planMatrix = read(planMatrixPath);
assertIncludes(planMatrix, "Runtime source: `lib/stripe/plans.ts`", "plan matrix identifies runtime source");
assertIncludes(planMatrix, "Business, Starter, and Consultant are legacy aliases only", "plan matrix records legacy alias boundary");
assertIncludes(planMatrix, "## Runtime plan limits", "plan matrix has runtime limits section");
assertIncludes(planMatrix, "## Buyer-proof/report/export entitlement surfaces", "plan matrix has buyer-proof surface matrix");
assertIncludes(planMatrix, "## Stripe webhook idempotency plan", "plan matrix has Stripe idempotency plan");
assertIncludes(planMatrix, "keyed by Stripe event id", "Stripe idempotency plan is event-id keyed");

for (const plan of ["free", "sme", "agency"] as const) {
  assertIncludes(planMatrix, `| ${PLANS[plan].name} |`, `plan matrix includes ${PLANS[plan].name}`);
  assertIncludes(planMatrix, PLANS[plan].displayPrice, `plan matrix price matches ${PLANS[plan].name}`);
  assertIncludes(
    planMatrix,
    `clients=${PLANS[plan].limits.clients}; frameworks=${PLANS[plan].limits.frameworks}; integrations=${PLANS[plan].limits.integrations}; users=${PLANS[plan].limits.users}`,
    `plan matrix limits match runtime ${PLANS[plan].name}`,
  );
}

const oldBusinessMatrix = read("docs/product/business-entitlement-matrix.md");
assertMatches(oldBusinessMatrix.slice(0, 600), /ARCHIVED|SUPERSEDED/, "old Business matrix is visibly archived at top");
assertIncludes(
  oldBusinessMatrix.slice(0, 900),
  "docs/product/plan-entitlement-matrix.md",
  "old Business matrix points to current plan matrix",
);

for (const localePath of ["messages/cs-CZ.json", "messages/en-EU.json", "messages/it-IT.json"]) {
  assertPricingMessagesUseCanonicalPlanNames(localePath);
}

const publicDocs = walkFiles("docs/product")
  .filter((filePath) => /\.(md|mdx)$/.test(filePath))
  .filter((filePath) => filePath !== "docs/product/business-entitlement-matrix.md")
  .filter((filePath) => filePath !== "docs/product/plan-entitlement-matrix.md")
  .filter((filePath) => filePath !== "docs/product/implementation-gap-audit.md");

for (const filePath of publicDocs) {
  const source = read(filePath);
  for (const legacyName of ["Business", "Starter", "Consultant"]) {
    assert.doesNotMatch(
      source,
      new RegExp(`\\b${legacyName}\\b`),
      `${filePath}: docs outside explicit archive/audit contexts must not use legacy public plan name ${legacyName}`,
    );
  }
}

const buyerProofSurfaces = [
  {
    label: "compliance report",
    path: "app/api/export/compliance-report/route.ts",
    required: ["requireActiveSubscription(orgId)", "subscription_required", "status: 402"],
  },
  {
    label: "workspace archive",
    path: "app/api/exports/workspace/archive/route.ts",
    required: ["getWorkspaceExport(session.orgId)", "withPrivateNoStore", "privateJson({ error: \"Unauthorized\" }, { status: 401 })"],
  },
  {
    label: "evidence metadata export",
    path: "app/api/exports/evidence-metadata/route.ts",
    required: ["listEvidenceMetadataForExport(session.orgId)", "withPrivateNoStore", "privateJson({ error: \"Unauthorized\" }, { status: 401 })"],
  },
  {
    label: "audit log export",
    path: "app/api/audit-log/export/route.ts",
    required: ["listAuditLogPage", "MAX_AUDIT_LOG_EXPORT_LIMIT", "withPrivateNoStore"],
  },
  {
    label: "vendor risk report",
    path: "app/api/vendors/supply-chain-report/route.ts",
    required: ["listVendorsForOrg(session.orgId)", "withPrivateNoStore", "privateJson({ error: \"Unauthorized\" }, { status: 401 })"],
  },
  {
    label: "risk register report",
    path: "app/api/risks/register-report/route.ts",
    required: ["listRiskItemsForOrg(session.orgId)", "withPrivateNoStore", "privateJson({ error: \"Unauthorized\" }, { status: 401 })"],
  },
  {
    label: "questionnaire PDF export",
    path: "app/api/questionnaires/export/pdf/route.ts",
    required: ["getGeneratedArtifactForOrg", "getQuestionnaireExportEligibility", "withPrivateNoStore", "privateJson({ error: \"Unauthorized\" }, { status: 401 })"],
  },
  {
    label: "questionnaire XLSX export",
    path: "app/api/questionnaires/export/xlsx/route.ts",
    required: ["getGeneratedArtifactForOrg", "getQuestionnaireExportEligibility", "withPrivateNoStore", "privateJson({ error: \"Unauthorized\" }, { status: 401 })"],
  },
  {
    label: "agency layout",
    path: "app/(app)/agency/layout.tsx",
    required: ["requireActiveSubscription", "entitlement.plan !== \"agency\"", "/settings/billing?required=agency"],
  },
  {
    label: "client create action",
    path: "app/(app)/clients/actions.ts",
    required: ["requirePlan(organisation?.plan, \"agency\")"],
  },
] as const;

for (const surface of buyerProofSurfaces) {
  const source = read(surface.path);
  for (const needle of surface.required) {
    assertIncludes(source, needle, `${surface.label} source gate/scope`);
  }
  assertIncludes(planMatrix, `| ${surface.label} |`, `plan matrix documents ${surface.label}`);
}

const webhookRoute = read("app/api/webhooks/stripe/route.ts");
assertIncludes(webhookRoute, "switch (event.type)", "Stripe webhook source dispatches verified events");
assertIncludes(planMatrix, "No durable event-id ledger is implemented in this tranche", "plan matrix states idempotency implementation status");

console.log("T4-E plan entitlement source smoke passed.");
