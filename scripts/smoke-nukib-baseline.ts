import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import JSZip from "jszip";

import { enrichComplianceControl, nukibControlToWorkspaceExtensions } from "@/lib/compliance/nukib/adapter";
import { planEvidenceMigration } from "@/lib/compliance/nukib/migration/evidence-migrator";
import { parseDeadline } from "@/lib/compliance/nukib/parsing/deadline-parser";
import {
  NukibWorkbookParseError,
  parseNukibWorkbook,
} from "@/lib/compliance/nukib/parsing/workbook-parser";
import type { NukibBaselineControl } from "@/lib/compliance/nukib/types";
import {
  computeFileSha256,
  diffBaselines,
  generateManifest,
} from "@/lib/compliance/nukib/versioning/version-manager";
import type { WorkspaceControl } from "@/lib/workspaces/types";

const OFFICIAL_WORKBOOK = path.join(
  process.cwd(),
  "docs/compliance/official-baselines/prehled-bezpecnostnich-opatreni_v10_uid_69cbcd208cab4.xlsx",
);

async function main() {
  assertDeadlineParser();
  await assertWorkbookParser();
  assertAdapter();
  assertVersioningAndMigration();

  console.log("NÚKIB baseline smoke passed");
}

function assertDeadlineParser() {
  const absolute = parseDeadline("31.12.2025");
  assert.equal(absolute.type, "absolute");
  assert.equal(absolute.date?.getFullYear(), 2025);
  assert.equal(absolute.date?.getMonth(), 11);
  assert.equal(absolute.date?.getDate(), 31);

  assert.equal(parseDeadline("Průběžně").type, "ongoing");

  const relative = parseDeadline("Do 3 měsíců od schválení");
  assert.equal(relative.type, "relative");
  assert.equal(relative.relativeMonths, 3);

  const unknown = parseDeadline("Ihned po registraci");
  assert.equal(unknown.type, "unknown");
  assert.equal(unknown.raw, "Ihned po registraci");
}

async function assertWorkbookParser() {
  const workbookBuffer = existsSync(OFFICIAL_WORKBOOK)
    ? readFileSync(OFFICIAL_WORKBOOK)
    : await createFixtureWorkbook();
  const controls = parseNukibWorkbook(workbookBuffer);
  const controlsByReference = new Map(
    controls.map((control) => [control.exactReference, control]),
  );

  assert.ok(controls.length >= 6, `Expected parsed controls, got ${controls.length}`);

  for (const reference of [
    "§ 3 odst. 1 písm. a)",
    "§ 4 písm. a)",
    "§ 6 písm. a)",
    "§ 7 odst. 1 písm. a)",
    "§ 8 odst. 1 písm. a)",
    "§ 9 odst. 1 písm. a)",
  ]) {
    assert.ok(
      controlsByReference.has(reference),
      `Parsed workbook is missing known reference ${reference}`,
    );
  }

  const states = new Set(controls.map((control) => control.defaultState));
  for (const state of ["implemented", "planned", "not_implemented", "not_applicable"] as const) {
    assert.ok(states.has(state), `Parsed controls are missing state ${state}`);
  }

  const priorities = new Set(controls.map((control) => control.priority));
  assert.ok(priorities.has("high"), "Parsed controls are missing high priority");
  assert.ok(priorities.has("medium"), "Parsed controls are missing medium priority");

  for (const reference of [
    "§ 3 odst. 1 písm. a)",
    "§ 4 písm. a)",
    "§ 6 písm. a)",
  ]) {
    assert.equal(
      controlsByReference.get(reference)?.tier,
      "mandatory_minimum",
      `${reference} must be mandatory_minimum`,
    );
  }

  for (const reference of [
    "§ 7 odst. 1 písm. a)",
    "§ 8 odst. 1 písm. a)",
    "§ 9 odst. 1 písm. a)",
  ]) {
    assert.equal(
      controlsByReference.get(reference)?.tier,
      "assessable",
      `${reference} must be assessable`,
    );
  }

  const sha = await computeFileSha256(workbookBuffer);
  assert.match(sha, /^[a-f0-9]{64}$/);

  assert.throws(
    () => parseNukibWorkbook(Buffer.from("not an xlsx")),
    NukibWorkbookParseError,
  );
}

function assertAdapter() {
  const baseline = sampleControl({
    exactReference: "§ 6 písm. c)",
    text: "Provádí zálohování a obnovu regulované služby.",
    frameworkMappings: [
      { frameworkId: "zokb", reference: "§ 6 písm. c)", title: "Řízení kontinuity činností" },
      { frameworkId: "nis2", reference: "Article 21(2)(c)" },
    ],
  });
  const extensions = nukibControlToWorkspaceExtensions(baseline);

  assert.deepEqual(extensions.officialBaselineRefs, ["§ 6 písm. c)"]);
  assert.equal(extensions.nukibTier, "mandatory_minimum");
  assert.equal(extensions.frameworkMappings?.[0]?.frameworkId, "zokb");

  const warnings: string[] = [];
  const originalWarn = console.warn;
  console.warn = (message?: unknown) => {
    warnings.push(String(message));
  };

  try {
    const enriched = enrichComplianceControl(
      {
        controlKey: "backup-control",
        question: "Je záloha ověřená?",
        guidance: "Doložte poslední test obnovy.",
        nis2ArticleRef: "Article 21(2)(x)",
        nukibBlock: {
          blockTitle: "§ Technická opatření",
          sectionTitle: "Zajištění úrovně dostupnosti",
        },
        requiresFileUpload: true,
      } as unknown as WorkspaceControl,
      baseline,
    );

    assert.equal(enriched.evidenceType, "both");
    assert.equal(enriched.frameworkMappings?.[0]?.reference, "§ 6 písm. c)");
    assert.ok(warnings.some((warning) => warning.includes("frameworkMappings take priority")));
  } finally {
    console.warn = originalWarn;
  }
}

function assertVersioningAndMigration() {
  const unchanged = sampleControl({
    exactReference: "§ 6 písm. a)",
    text: "Zajistí kontinuitu činností.",
  });
  const removed = sampleControl({
    exactReference: "§ 7 odst. 1 písm. a)",
    text: "Řídí přístup uživatelů.",
  });
  const modifiedPrevious = sampleControl({
    exactReference: "§ 8 odst. 1 písm. a)",
    text: "Řídí identity uživatelů.",
  });
  const modifiedNext = sampleControl({
    exactReference: "§ 8 odst. 1 písm. b)",
    text: "Řídí identity uživatelů.",
  });
  const added = sampleControl({
    exactReference: "§ 9 odst. 1 písm. a)",
    text: "Zajišťuje detekci událostí.",
  });
  const previous = generateManifest(
    [unchanged, removed, modifiedPrevious],
    "previous.xlsx",
    "a".repeat(64),
  );
  const next = generateManifest(
    [unchanged, modifiedNext, added],
    "next.xlsx",
    "b".repeat(64),
  );

  const diff = diffBaselines(previous, next);
  assert.equal(diff.added.length, 1);
  assert.equal(diff.removed.length, 1);
  assert.equal(diff.removed[0]?.archived, true);
  assert.equal(diff.modified.length, 1);
  assert.ok(diff.modified[0]?.changes.includes("reference"));

  const plan = planEvidenceMigration(diff, [
    "§ 6 písm. a)",
    "§ 7 odst. 1 písm. a)",
    "§ 8 odst. 1 písm. a)",
  ]);

  assert.deepEqual(plan.autoMapped, [
    { oldControlKey: "§ 6 písm. a)", newControlKey: "§ 6 písm. a)" },
  ]);
  assert.equal(plan.requiresReview.length, 1);
  assert.equal(plan.archived.length, 1);
}

function sampleControl(
  overrides: Partial<NukibBaselineControl> & Pick<NukibBaselineControl, "exactReference" | "text">,
): NukibBaselineControl {
  const { exactReference, text, ...rest } = overrides;

  return {
    paragraph: exactReference.match(/§\s*\d+/)?.[0] ?? "§ 6",
    exactReference,
    title: "Řízení kontinuity činností",
    text,
    tier: "mandatory_minimum",
    priority: "high",
    deadline: { raw: "Průběžně", type: "ongoing" },
    owners: ["Vlastník služby"],
    defaultState: "planned",
    frameworkMappings: [
      {
        frameworkId: "zokb",
        reference: exactReference,
        title: "Řízení kontinuity činností",
      },
    ],
    archived: false,
    sourceRow: 1,
    ...rest,
  };
}

async function createFixtureWorkbook(): Promise<Buffer> {
  const zip = new JSZip();
  zip.file(
    "xl/workbook.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
    <workbook xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
      <sheets>
        <sheet name="Přehled bezpečnostních opatření" sheetId="1" r:id="rId1"/>
        <sheet name="Legenda" sheetId="2" r:id="rId2"/>
      </sheets>
    </workbook>`,
  );
  zip.file(
    "xl/_rels/workbook.xml.rels",
    `<?xml version="1.0" encoding="UTF-8"?>
    <Relationships>
      <Relationship Id="rId1" Target="worksheets/sheet1.xml"/>
      <Relationship Id="rId2" Target="worksheets/sheet2.xml"/>
    </Relationships>`,
  );
  zip.file("xl/sharedStrings.xml", "<sst/>");
  zip.file(
    "xl/worksheets/sheet1.xml",
    `<worksheet><sheetData>
      ${controlRow(5, "§ 3", "Minimum security system", "1", "a", "", "Základní požadavek.", "V procesu", "Do 31.12.2025", "Kritická")}
      ${controlRow(6, "§ 4", "Top management", "", "a", "", "Pověřená osoba.", "Zavedeno", "Průběžně", "Vysoká")}
      ${controlRow(7, "§ 6", "Continuity", "", "a", "", "Zálohování.", "Nezavedeno", "Do 3 měsíců od schválení", "Střední")}
      ${controlRow(8, "§ 7", "Access", "1", "a", "", "Přístupová práva.", "Nerelevantní", "Průběžně", "Nízká")}
      ${controlRow(9, "§ 8", "Identity", "1", "a", "", "Identity.", "Zavedeno", "Průběžně", "Střední")}
      ${controlRow(10, "§ 9", "Events", "1", "a", "", "Události.", "Zavedeno", "Průběžně", "Vysoká")}
    </sheetData></worksheet>`,
  );
  zip.file(
    "xl/worksheets/sheet2.xml",
    `<worksheet><sheetData>
      ${legendRow(2, "Zavedeno")}
      ${legendRow(3, "V procesu")}
      ${legendRow(4, "Nezavedeno")}
      ${legendRow(5, "Nerelevantní")}
      ${legendRow(34, "Kritická")}
      ${legendRow(35, "Vysoká")}
      ${legendRow(36, "Střední")}
      ${legendRow(37, "Nízká")}
    </sheetData></worksheet>`,
  );

  return zip.generateAsync({ type: "nodebuffer" });
}

function controlRow(
  row: number,
  paragraph: string,
  title: string,
  subsection: string,
  letter: string,
  point: string,
  text: string,
  state: string,
  deadline: string,
  priority: string,
): string {
  return `<row r="${row}">
    ${cell(`A${row}`, paragraph)}
    ${cell(`B${row}`, title)}
    ${cell(`C${row}`, subsection)}
    ${cell(`D${row}`, letter)}
    ${cell(`E${row}`, point)}
    ${cell(`F${row}`, text)}
    ${cell(`G${row}`, state)}
    ${cell(`H${row}`, "Popis")}
    ${cell(`I${row}`, deadline)}
    ${cell(`J${row}`, priority)}
    ${cell(`K${row}`, "Vlastník / IT")}
  </row>`;
}

function legendRow(row: number, value: string): string {
  return `<row r="${row}">${cell(`A${row}`, value)}</row>`;
}

function cell(ref: string, value: string): string {
  return `<c r="${ref}" t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
