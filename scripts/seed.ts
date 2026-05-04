import { and, eq } from "drizzle-orm";
import { loadEnvConfig } from "@next/env";
import { CONTROL_LIBRARY } from "../lib/controls/library";
import { getDb } from "../lib/db";
import {
  controls,
  frameworkControls,
  frameworks,
  sourceDocuments,
  tests,
} from "../lib/db/schema";
import { FRAMEWORK_LIBRARY } from "../lib/frameworks/registry";
import { ISO27001_ANNEX_A_MAPPINGS } from "../lib/frameworks/iso27001-annex-a";
import { AWS_TEST_DEFINITIONS } from "../lib/integrations/aws/test-definitions";
import { GITHUB_TEST_DEFINITIONS } from "../lib/integrations/github/test-definitions";
import { MICROSOFT365_TEST_DEFINITIONS } from "../lib/integrations/microsoft365/test-definitions";
import { POLICY_TEMPLATES } from "../lib/policies/templates";

loadEnvConfig(process.cwd());

const SOURCE_DOCUMENT_LIBRARY = [
  {
    citation: "Zákon č. 264/2025 Sb., o kybernetické bezpečnosti",
    effectiveDate: "2025-11-01",
    filename: "cz/zakon-264-2025-sb.html",
    jurisdiction: "CZ",
    locale: "cs-CZ",
    title: "Zákon č. 264/2025 Sb. - o kybernetické bezpečnosti",
    url: "https://public.psp.cz/sqw/sbirka.sqw?cz=264&r=2025",
  },
  {
    citation: "NÚKIB - Byl publikován nový zákon o kybernetické bezpečnosti",
    effectiveDate: "2025-08-04",
    filename: "cz/nukib-publikovan-novy-zakon-o-kyberneticke-bezpecnosti.html",
    jurisdiction: "CZ",
    locale: "cs-CZ",
    title: "NÚKIB - nový zákon o kybernetické bezpečnosti",
    url: "https://nukib.gov.cz/cs/infoservis/aktuality/2286-byl-publikovan-novy-zakon-o-kyberneticke-bezpecnosti",
  },
  {
    citation: "Regulation (EU) 2016/679, CELEX 32016R0679",
    effectiveDate: "2018-05-25",
    filename: "eu/gdpr-2016-679-cs.html",
    jurisdiction: "EU",
    locale: "cs-CZ",
    title: "GDPR - české znění EUR-Lex",
    url: "https://eur-lex.europa.eu/legal-content/cs/TXT/?uri=CELEX%3A32016R0679",
  },
  {
    citation: "ÚOOÚ - postavení úřadu a působnost podle GDPR",
    effectiveDate: null,
    filename: "cz/uoou-postaveni-uradu.html",
    jurisdiction: "CZ",
    locale: "cs-CZ",
    title: "ÚOOÚ - postavení úřadu",
    url: "https://uoou.gov.cz/urad/postaveni-uradu",
  },
  {
    citation: "D.Lgs. 4 settembre 2024, n. 138 (GU Serie Generale n. 230 del 01-10-2024)",
    effectiveDate: "2024-10-16",
    filename: "it/dlgs-138-2024.html",
    jurisdiction: "IT",
    locale: "it-IT",
    title: "D.Lgs. 138/2024 - Recepimento direttiva NIS2",
    url: "https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG",
  },
  {
    citation: "ACN, Determinazione NIS piattaforma 2024/38565",
    effectiveDate: null,
    filename: "it/acn-nis-piattaforma-2024-38565.pdf",
    jurisdiction: "IT",
    locale: "it-IT",
    title: "ACN - Determinazione NIS piattaforma",
    url: "https://www.acn.gov.it/portale/documents/d/guest/detacn_nis_piattaforma_2024_38565",
  },
  {
    citation: "Regolamento (UE) 2016/679, CELEX 32016R0679",
    effectiveDate: "2018-05-25",
    filename: "eu/gdpr-2016-679-it.html",
    jurisdiction: "EU",
    locale: "it-IT",
    title: "GDPR - testo italiano EUR-Lex",
    url: "https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX:32016R0679",
  },
  {
    citation: "D.Lgs. 30 giugno 2003, n. 196 - Codice in materia di protezione dei dati personali",
    effectiveDate: "2004-01-01",
    filename: "it/codice-privacy-dlgs-196-2003.pdf",
    jurisdiction: "IT",
    locale: "it-IT",
    title: "Codice Privacy - testo coordinato Garante",
    url: "https://www.garanteprivacy.it/documents/10160/0/Codice%2Bin%2Bmateria%2Bdi%2Bprotezione%2Bdei%2Bdati%2Bpersonali%2B%28Testo%2Bcoordinato%29.pdf/b1787d6b-6bce-07da-a38f-3742e3888c1d?version=5.0",
  },
  {
    citation: "Garante Privacy - Data Breach, violazioni di dati personali",
    effectiveDate: null,
    filename: "it/garante-data-breach.html",
    jurisdiction: "IT",
    locale: "it-IT",
    title: "Garante - Data breach e violazioni di dati personali",
    url: "https://www.garanteprivacy.it/data-breach",
  },
  {
    citation: "Garante Privacy - Valutazione d'impatto della protezione dei dati (DPIA)",
    effectiveDate: null,
    filename: "it/garante-dpia.html",
    jurisdiction: "IT",
    locale: "it-IT",
    title: "Garante - DPIA",
    url: "https://www.garanteprivacy.it/valutazione-d-impatto-della-protezione-dei-dati-dpia-",
  },
  {
    citation: "Garante Privacy - FAQ sul registro delle attività di trattamento",
    effectiveDate: null,
    filename: "it/garante-ropa-faq.html",
    jurisdiction: "IT",
    locale: "it-IT",
    title: "Garante - FAQ registro delle attività di trattamento",
    url: "https://www.garanteprivacy.it/home/faq/registro-delle-attivita-di-trattamento",
  },
] as const;

function getTemplateSourceDocumentTitle(template: (typeof POLICY_TEMPLATES)[number]) {
  if (template.locale === "cs-CZ") {
    return "Knihovna šablon Splnit";
  }

  if (template.locale === "it-IT") {
    return "Libreria modelli Splnit";
  }

  return "Splnit template library";
}

async function seedFrameworks() {
  const db = getDb();
  const ids = new Map<string, string>();

  for (const framework of FRAMEWORK_LIBRARY) {
    const [row] = await db
      .insert(frameworks)
      .values({
        slug: framework.slug,
        nameCs: framework.nameCs,
        nameEn: framework.nameEn,
        descriptionCs: framework.descriptionCs,
        regulator: framework.regulator,
        mandatoryDeadline: framework.mandatoryDeadline,
        version: framework.version,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: frameworks.slug,
        set: {
          nameCs: framework.nameCs,
          nameEn: framework.nameEn,
          descriptionCs: framework.descriptionCs,
          regulator: framework.regulator,
          mandatoryDeadline: framework.mandatoryDeadline,
          version: framework.version,
          isActive: true,
        },
      })
      .returning({ id: frameworks.id, slug: frameworks.slug });

    ids.set(row.slug, row.id);
  }

  return ids;
}

async function seedControls() {
  const db = getDb();
  const ids = new Map<string, string>();

  for (const control of CONTROL_LIBRARY) {
    const [row] = await db
      .insert(controls)
      .values({
        key: control.key,
        titleCs: control.titleCs,
        titleEn: control.titleEn,
        descriptionCs: control.descriptionCs,
        category: control.category,
        testType: control.testType,
        requiresEvidence: control.requiresEvidence,
        isAutomated: control.isAutomated,
      })
      .onConflictDoUpdate({
        target: controls.key,
        set: {
          titleCs: control.titleCs,
          titleEn: control.titleEn,
          descriptionCs: control.descriptionCs,
          category: control.category,
          testType: control.testType,
          requiresEvidence: control.requiresEvidence,
          isAutomated: control.isAutomated,
        },
      })
      .returning({ id: controls.id, key: controls.key });

    ids.set(row.key, row.id);
  }

  return ids;
}

async function seedFrameworkControls(
  frameworkIds: Map<string, string>,
  controlIds: Map<string, string>,
) {
  const db = getDb();
  let count = 0;

  for (const control of CONTROL_LIBRARY) {
    const controlId = controlIds.get(control.key);

    if (!controlId) {
      throw new Error(`Missing control id for ${control.key}`);
    }

    for (const [index, mapping] of control.frameworkMappings.entries()) {
      if (mapping.frameworkSlug === "iso27001") {
        continue;
      }

      const frameworkId = frameworkIds.get(mapping.frameworkSlug);

      if (!frameworkId) {
        throw new Error(`Missing framework id for ${mapping.frameworkSlug}`);
      }

      await db
        .insert(frameworkControls)
        .values({
          frameworkId,
          controlId,
          articleRef: mapping.articleRef,
          evidenceRequirements: mapping.evidenceRequirements,
          localizedDescription:
            mapping.localizedDescription ?? control.descriptionCs,
          localizedTitle: mapping.localizedTitle ?? control.titleCs,
          regulatorGuidance: mapping.regulatorGuidance,
          requirementLevel: mapping.level,
          sortOrder: index,
        })
        .onConflictDoUpdate({
          target: [
            frameworkControls.frameworkId,
            frameworkControls.controlId,
            frameworkControls.articleRef,
          ],
          set: {
            articleRef: mapping.articleRef,
            evidenceRequirements: mapping.evidenceRequirements,
            localizedDescription:
              mapping.localizedDescription ?? control.descriptionCs,
            localizedTitle: mapping.localizedTitle ?? control.titleCs,
            regulatorGuidance: mapping.regulatorGuidance,
            requirementLevel: mapping.level,
            sortOrder: index,
          },
        });

      count += 1;
    }
  }

  const isoFrameworkId = frameworkIds.get("iso27001");

  if (!isoFrameworkId) {
    throw new Error("Missing framework id for iso27001");
  }

  await db
    .delete(frameworkControls)
    .where(eq(frameworkControls.frameworkId, isoFrameworkId));

  for (const [index, mapping] of ISO27001_ANNEX_A_MAPPINGS.entries()) {
    const controlId = controlIds.get(mapping.controlKey);

    if (!controlId) {
      throw new Error(`Missing control id for ${mapping.controlKey}`);
    }

    await db
      .insert(frameworkControls)
      .values({
        articleRef: mapping.articleRef,
        controlId,
        frameworkId: isoFrameworkId,
        localizedTitle: mapping.title,
        requirementLevel: "mandatory",
        sortOrder: index,
      })
      .onConflictDoUpdate({
        target: [
          frameworkControls.frameworkId,
          frameworkControls.controlId,
          frameworkControls.articleRef,
        ],
        set: {
          localizedTitle: mapping.title,
          requirementLevel: "mandatory",
          sortOrder: index,
        },
      });

    count += 1;
  }

  return count;
}

async function seedSourceDocuments() {
  const db = getDb();
  const lastReviewed = new Date("2026-05-04T00:00:00.000Z");
  let count = 0;

  for (const template of POLICY_TEMPLATES) {
    await db
      .insert(sourceDocuments)
      .values({
        citation: template.description,
        filename: template.sourceDocument,
        jurisdiction: template.jurisdiction,
        lastReviewed,
        locale: template.locale,
        title: getTemplateSourceDocumentTitle(template),
      })
      .onConflictDoUpdate({
        target: sourceDocuments.filename,
        set: {
          citation: template.description,
          jurisdiction: template.jurisdiction,
          lastReviewed,
          locale: template.locale,
          title: getTemplateSourceDocumentTitle(template),
        },
      });

    count += 1;
  }

  for (const sourceDocument of SOURCE_DOCUMENT_LIBRARY) {
    await db
      .insert(sourceDocuments)
      .values({
        citation: sourceDocument.citation,
        effectiveDate: sourceDocument.effectiveDate
          ? new Date(`${sourceDocument.effectiveDate}T00:00:00.000Z`)
          : null,
        filename: sourceDocument.filename,
        jurisdiction: sourceDocument.jurisdiction,
        lastReviewed,
        locale: sourceDocument.locale,
        title: sourceDocument.title,
        url: sourceDocument.url,
      })
      .onConflictDoUpdate({
        target: sourceDocuments.filename,
        set: {
          citation: sourceDocument.citation,
          effectiveDate: sourceDocument.effectiveDate
            ? new Date(`${sourceDocument.effectiveDate}T00:00:00.000Z`)
            : null,
          jurisdiction: sourceDocument.jurisdiction,
          lastReviewed,
          locale: sourceDocument.locale,
          title: sourceDocument.title,
          url: sourceDocument.url,
        },
      });

    count += 1;
  }

  return count;
}

async function seedIntegrationTests(controlIds: Map<string, string>) {
  const db = getDb();
  let count = 0;
  const definitions = [
    ...MICROSOFT365_TEST_DEFINITIONS.map((definition) => ({
      ...definition,
      integrationType: "microsoft365",
    })),
    ...GITHUB_TEST_DEFINITIONS.map((definition) => ({
      ...definition,
      integrationType: "github",
    })),
    ...AWS_TEST_DEFINITIONS.map((definition) => ({
      ...definition,
      integrationType: "aws",
    })),
  ];

  for (const definition of definitions) {
    const controlId = controlIds.get(definition.controlKey);

    if (!controlId) {
      throw new Error(`Missing control id for ${definition.controlKey}`);
    }

    const existingRows = await db
      .select({ id: tests.id })
      .from(tests)
      .where(
        and(
          eq(tests.controlId, controlId),
          eq(tests.integrationType, definition.integrationType),
          eq(tests.checkLogic, definition.checkLogic),
        ),
      )
      .limit(1);
    const existing = existingRows[0] ?? null;

    if (existing) {
      await db
        .update(tests)
        .set({
          isActive: true,
          name: definition.name,
          passCriteria: definition.passCriteria,
        })
        .where(eq(tests.id, existing.id));
    } else {
      await db.insert(tests).values({
        checkLogic: definition.checkLogic,
        controlId,
        integrationType: definition.integrationType,
        isActive: true,
        name: definition.name,
        passCriteria: definition.passCriteria,
      });
    }

    count += 1;
  }

  return count;
}

async function main() {
  const frameworkIds = await seedFrameworks();
  const controlIds = await seedControls();
  const mappingCount = await seedFrameworkControls(frameworkIds, controlIds);
  const sourceDocumentCount = await seedSourceDocuments();
  const integrationTestCount = await seedIntegrationTests(controlIds);

  const db = getDb();
  const [frameworkRows, controlRows] = await Promise.all([
    db.select().from(frameworks),
    db.select().from(controls),
  ]);

  console.log(
    `Seeded ${frameworkRows.length} frameworks, ${controlRows.length} controls, ${mappingCount} framework-control mappings, ${sourceDocumentCount} source documents, ${integrationTestCount} integration tests.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
