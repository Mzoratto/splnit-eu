import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  controls,
  evidence,
  integrations,
  organisations,
} from "@/lib/db/schema";
import { getOrgWithEvidence } from "@/lib/db/queries/export";
import {
  generateComplianceReport,
  getComplianceReportFilename,
} from "@/lib/export/pdf";
import {
  generateScopeStatement,
  renderReportTemplate,
  type EvidenceRecord,
  type Org,
  type ReportContext,
} from "@/lib/export/report-template";

loadEnvConfig(process.cwd());

const db = getDb();
const runId = `smoke_compliance_report_${Date.now()}`;
const generatedAt = new Date("2026-05-21T08:30:00+02:00");

async function ensureControl(input: {
  category: string;
  key: string;
  titleCs: string;
  titleEn: string;
}) {
  const existingRows = await db
    .select({ id: controls.id })
    .from(controls)
    .where(eq(controls.key, input.key))
    .limit(1);
  const existing = existingRows[0];

  if (existing) {
    return existing.id;
  }

  const insertedRows = await db
    .insert(controls)
    .values({
      category: input.category,
      isAutomated: input.category === "access_control",
      key: input.key,
      titleCs: input.titleCs,
      titleEn: input.titleEn,
    })
    .returning({ id: controls.id });
  const inserted = insertedRows[0];

  assert.ok(inserted, `Control ${input.key} should be inserted.`);

  return inserted.id;
}

function fixtureOrg(rezimPovinnosti: "nizsi" | "vyssi"): Org {
  return {
    brandingConfig: {
      displayName: null,
      footerText: null,
      logoUrl: null,
    },
    clerkOrgId: "org_fixture",
    dic: "CZ12345678",
    ico: "12345678",
    name: "Testovací společnost s.r.o.",
    rezimPovinnosti,
    sidlo: "Václavské náměstí 1, Praha",
    tier: "standard",
  };
}

function fixtureEvidence(): EvidenceRecord[] {
  return [
    {
      assessmentResult: "pass",
      assessedAt: generatedAt,
      collectedAt: generatedAt,
      connectorName: "Microsoft 365",
      controlId: "ctrl_api",
      controlKey: "ctrl_mfa_all_users",
      controlName: "MFA povoleno pro všechny uživatele",
      evidenceId: "ev_api",
      finding: "Zjištěno 4 z 4 účtů s vícefaktorovým ověřením.",
      nukibBlock: {
        blockTitle: "§ Technická opatření",
        sectionTitle: "Správa přístupových oprávnění",
      },
      source: "api",
    },
    {
      assessmentResult: "pass",
      assessedAt: generatedAt,
      attestationText: "Každý zaměstnanec má samostatný účet.",
      collectedAt: generatedAt,
      controlId: "ctrl_manual",
      controlKey: "pohoda-iam-user-accounts",
      controlName: "Samostatné uživatelské účty v Pohodě",
      evidenceId: "ev_manual",
      nukibBlock: {
        blockTitle: "§ Technická opatření",
        sectionTitle: "Správa přístupových oprávnění",
      },
      source: "manual",
    },
    {
      assessmentResult: "gap",
      assessedAt: generatedAt,
      collectedAt: generatedAt,
      controlId: "ctrl_gap",
      controlKey: "pohoda-backup-restoration-test",
      controlName: "Test obnovy databáze Pohody",
      evidenceId: "ev_gap",
      gapDescription: "Chybí doložený test obnovy.",
      nukibBlock: {
        blockTitle: "§ Technická opatření",
        sectionTitle: "Zajištění úrovně dostupnosti",
      },
      recommendation: "Proveďte dokumentovaný test obnovy.",
      source: "manual",
    },
  ];
}

function fixtureContext(rezimPovinnosti: "nizsi" | "vyssi"): ReportContext {
  return {
    connectorNames: ["Microsoft 365"],
    evidenceRecords: fixtureEvidence(),
    generatedAt,
    org: fixtureOrg(rezimPovinnosti),
    workspaceNames: ["Pohoda EKO"],
  };
}

async function seedDatabaseFixture() {
  const [apiControlId, manualControlId, gapControlId] = await Promise.all([
    ensureControl({
      category: "access_control",
      key: "ctrl_mfa_all_users",
      titleCs: "MFA povoleno pro všechny uživatele",
      titleEn: "MFA enabled for all users",
    }),
    ensureControl({
      category: "access_control",
      key: "pohoda-iam-user-accounts",
      titleCs: "Samostatné uživatelské účty v Pohodě",
      titleEn: "Individual user accounts in Pohoda",
    }),
    ensureControl({
      category: "business_continuity",
      key: "pohoda-backup-restoration-test",
      titleCs: "Test obnovy databáze Pohody",
      titleEn: "Pohoda database restoration test",
    }),
  ]);

  await db.insert(organisations).values({
    clerkOrgId: runId,
    country: "CZ",
    dic: "CZ12345678",
    ico: "12345678",
    locale: "cs-CZ",
    name: "Testovací společnost s.r.o.",
    primaryJurisdiction: "CZ",
    rezimPovinnosti: "nizsi",
    sector: "technology",
    sidlo: "Václavské náměstí 1, Praha",
  });

  await db.insert(integrations).values({
    clerkOrgId: runId,
    config: {},
    provider: "microsoft365",
    status: "connected",
  });

  await db.insert(evidence).values([
    {
      assessmentResult: "pass",
      clerkOrgId: runId,
      collectedAt: generatedAt,
      collectionStatus: "collected",
      confidence: "high",
      controlId: apiControlId,
      snapshotData: {
        provider: "microsoft365",
        resultData: {
          mfaEnabled: 4,
          totalUsers: 4,
        },
      },
      source: "connector",
      type: "automated_snapshot",
    },
    {
      assessmentResult: "pass",
      clerkOrgId: runId,
      collectedAt: generatedAt,
      collectionStatus: "collected",
      confidence: "medium",
      controlId: manualControlId,
      snapshotData: {
        attestationAnswers: { done: true },
      },
      source: "manual",
      type: "attestation_answers",
    },
    {
      assessmentResult: "gap",
      clerkOrgId: runId,
      collectedAt: generatedAt,
      collectionStatus: "collected",
      confidence: "medium",
      controlId: gapControlId,
      snapshotData: {
        attestationAnswers: { done: false },
      },
      source: "manual",
      type: "attestation_answers",
    },
  ]);
}

function assertHtml(html: string) {
  assert.match(html, /12345678/, "Rendered HTML contains org.ico value on cover page.");
  assert.match(html, /IČO/, "HTML contains Czech IČO label.");
  assert.match(html, /DIČ/, "HTML contains Czech DIČ label.");
  assert.match(html, /Sídlo/, "HTML contains Czech registered address label.");
  assert.match(html, /Datum vygenerování/, "HTML contains Czech generated date label.");
  assert.match(html, /Verze dokumentu/, "HTML contains Czech document version label.");
  assert.match(html, /Režim povinností/, "HTML contains Czech obligation regime label.");
  assert.match(html, /Celková shoda/, "HTML contains Czech compliance summary label.");
  assert.match(html, /Počet splněných opatření/, "HTML contains Czech passed controls label.");
  assert.match(html, /Počet kritických mezer/, "HTML contains Czech gap count label.");
  assert.match(html, /Zdroj/, "HTML contains Czech source label.");
  assert.match(html, /Stav/, "HTML contains Czech status label.");
  assert.match(html, /Právní ref\./, "HTML contains Czech legal reference label.");
  assert.match(html, /Doporučení/, "HTML contains Czech recommendation label.");
  assert.match(html, /evidence-pass-api/, "HTML contains green block class.");
  assert.match(html, /evidence-pass-manual/, "HTML contains grey block class.");
  assert.match(html, /evidence-gap/, "HTML contains amber block class.");
  assert.match(html, /Splněno/, "HTML contains Czech pass status.");
  assert.match(html, /Deklarováno/, "HTML contains Czech manual declaration status.");
  assert.match(html, /Nesplněno/, "HTML contains Czech gap status.");
  assert.doesNotMatch(html, /Source:|Status:|Legal ref:/, "HTML contains no English labels.");
}

async function main() {
  await seedDatabaseFixture();

  try {
    const pdf = await generateComplianceReport(runId);

    assert.ok(Buffer.isBuffer(pdf), "generateComplianceReport returns a Buffer.");
    assert.equal(pdf.subarray(0, 4).toString("utf8"), "%PDF", "Buffer starts with %PDF.");

    const nizsiHtml = renderReportTemplate(fixtureContext("nizsi"));
    const vyssiHtml = renderReportTemplate(fixtureContext("vyssi"));
    const connectorWorkspaceScope = generateScopeStatement(
      ["Pohoda EKO"],
      ["Microsoft 365"],
    );
    const workspaceOnlyScope = generateScopeStatement(["Money S3"], []);

    assert.match(
      connectorWorkspaceScope,
      /Microsoft 365.*Pohoda EKO/,
      "Scope statement includes active connector and workspace names.",
    );
    assert.notEqual(
      connectorWorkspaceScope,
      workspaceOnlyScope,
      "Scope statement changes when active workspaces and connectors differ.",
    );
    assertHtml(nizsiHtml);
    assert.match(
      nizsiHtml,
      /vyhláška č\. 410\/2025 Sb\./,
      "HTML contains lower-obligation vyhláška reference.",
    );
    assert.match(
      vyssiHtml,
      /vyhláška č\. 409\/2025 Sb\./,
      "HTML contains higher-obligation vyhláška reference.",
    );

    assert.equal(
      getComplianceReportFilename("12345678", generatedAt),
      "zprava-kyberneticka-bezpecnost-12345678-2026-05-21.pdf",
      "Filename includes IČO and ISO date.",
    );
  } finally {
    await db.delete(organisations).where(eq(organisations.clerkOrgId, runId));
  }

  console.log("Compliance report smoke passed");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
