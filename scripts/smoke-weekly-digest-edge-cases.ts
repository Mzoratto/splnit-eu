import * as assert from "node:assert/strict";
import {
  buildWeeklyDigestDataVariables,
  renderWeeklyDigestHtml,
  type WeeklyDigestModel,
} from "@/lib/regulations/digest";

const expectedVariableKeys = [
  "completedStepLabel",
  "currentScore",
  "evidenceDelta",
  "evidenceUploadedThisWeek",
  "htmlPreview",
  "organisationName",
  "primaryCtaUrl",
  "regulatoryNews",
  "scoreDelta",
  "topPriorities",
  "unresolvedPriorityCount",
  "unresolvedPriorityDelta",
  "updateCount",
  "updates",
].sort();

function baseModel(overrides: Partial<WeeklyDigestModel> = {}): WeeklyDigestModel {
  return {
    completedStepLabel: "Krok 2 ze 4 čeká na první důkaz",
    currentScore: 0,
    evidenceDeltaLabel: "→ 0",
    evidenceUploadedThisWeek: 0,
    organisationName: "Smoke org",
    primaryCtaUrl: "https://splnit.eu/controls",
    regulatoryNews: [
      {
        date: "19. 5. 2026",
        source: "NÚKIB",
        summary: "Relevantní aktualizace pro testovaný rámec.",
        title: "Testovací aktualizace",
        url: "https://example.com/update",
      },
    ],
    scoreDeltaLabel: "→ 0%",
    topPriorities: [
      {
        href: "https://splnit.eu/controls/access-control",
        reason: "Intake označil Microsoft 365 a externí dodavatele, proto začněte tady.",
        title: "Řízení přístupů",
      },
    ],
    unresolvedPriorityCount: 1,
    unresolvedPriorityDeltaLabel: "→ 0",
    updateCount: 1,
    ...overrides,
  };
}

function assertVariableParity(model: WeeklyDigestModel, updatesText: string) {
  const variables = buildWeeklyDigestDataVariables(model, updatesText);
  assert.deepEqual(Object.keys(variables).sort(), expectedVariableKeys);
  assert.equal(variables.organisationName, model.organisationName);
  assert.equal(variables.updateCount, model.updateCount);
  assert.equal(variables.evidenceUploadedThisWeek, model.evidenceUploadedThisWeek);
  assert.equal(variables.topPriorities, model.topPriorities);
  assert.equal(variables.regulatoryNews, model.regulatoryNews);
  assert.equal(typeof variables.htmlPreview, "string");
  assert.ok(!Object.keys(variables).some((key) => key.includes("_")), "Loops variables must stay camelCase.");
}

// 1. Completed intake, zero evidence uploaded: should render cleanly as 0, not throw.
const zeroEvidence = baseModel({
  evidenceDeltaLabel: "→ 0",
  evidenceUploadedThisWeek: 0,
});
const zeroEvidenceHtml = renderWeeklyDigestHtml(zeroEvidence);
assert.ok(zeroEvidenceHtml.includes("Důkazy"));
assert.ok(zeroEvidenceHtml.includes(">0</div>"));
assertVariableParity(zeroEvidence, "");

// 2. No matching regulatory updates: should show a graceful empty state.
const noUpdates = baseModel({
  regulatoryNews: [],
  updateCount: 0,
});
const noUpdatesHtml = renderWeeklyDigestHtml(noUpdates);
assert.ok(noUpdatesHtml.includes("neevidujeme novou regulatorní aktualizaci"));
assertVariableParity(noUpdates, "");

// 3. Free/no active integrations: priorities can still be populated from intake-only data.
const intakeOnlyPriorities = baseModel({
  currentScore: 12,
  topPriorities: [
    {
      href: "https://splnit.eu/controls/asset-inventory",
      reason: "Intake odpovědi určily tento krok jako prioritní i bez připojené integrace.",
      title: "Inventář aktiv",
    },
    {
      href: "https://splnit.eu/controls/vendor-risk",
      reason: "Doplňte vlastníka a první manuální důkaz.",
      title: "Rizika dodavatelů",
    },
    {
      href: "https://splnit.eu/controls/incident-process",
      reason: "Potvrďte incidentní postup a nahrajte existující dokument.",
      title: "Incidentní proces",
    },
  ],
  unresolvedPriorityCount: 3,
});
const intakeOnlyHtml = renderWeeklyDigestHtml(intakeOnlyPriorities);
assert.ok(intakeOnlyHtml.includes("Inventář aktiv"));
assert.ok(intakeOnlyHtml.includes("Rizika dodavatelů"));
assert.ok(intakeOnlyHtml.includes("Incidentní proces"));
assert.ok(!intakeOnlyHtml.includes("Zatím nejsou vybrané žádné intake priority"));
assertVariableParity(intakeOnlyPriorities, "19. 5. 2026 · NÚKIB · Testovací aktualizace");

// Extra guard: if intake somehow has no priority controls, the email still renders.
const noPriorities = baseModel({
  topPriorities: [],
  unresolvedPriorityCount: 0,
});
const noPrioritiesHtml = renderWeeklyDigestHtml(noPriorities);
assert.ok(noPrioritiesHtml.includes("Zatím nejsou vybrané žádné intake priority"));
assertVariableParity(noPriorities, "");

console.log("Weekly digest edge-case smoke passed.");
