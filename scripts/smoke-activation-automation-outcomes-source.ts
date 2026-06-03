import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const outcomeModelSource = readFileSync("lib/activation/automation-outcome.ts", "utf8");
const outcomeQuerySource = readFileSync("lib/db/queries/activation-automation-outcomes.ts", "utf8");
const dashboardQuerySource = readFileSync("lib/db/queries/dashboard.ts", "utf8");
const controlsQuerySource = readFileSync("lib/db/queries/controls.ts", "utf8");
const dashboardPageSource = readFileSync("app/(app)/dashboard/page.tsx", "utf8");
const controlsPageSource = readFileSync("app/(app)/controls/page.tsx", "utf8");
const evidencePageSource = readFileSync("app/(app)/evidence/page.tsx", "utf8");
const enMessagesSource = readFileSync("messages/en-EU.json", "utf8");
const csMessagesSource = readFileSync("messages/cs-CZ.json", "utf8");
const itMessagesSource = readFileSync("messages/it-IT.json", "utf8");

const appRenderSources = [
  ["dashboard page", dashboardPageSource],
  ["controls page", controlsPageSource],
  ["evidence page", evidencePageSource],
] as const;

const writeApiPatterns = [
  /upsertRemediationTask/,
  /updateRemediationTaskStatus/,
  /createManualEvidence/,
  /createManualAttestationEvidence/,
  /createHeliosCsvImportEvidence/,
  /\.insert\(/,
  /\.update\(/,
  /\.delete\(/,
  /onConflictDoUpdate/,
] as const;

assert.match(
  outcomeModelSource,
  /export function deriveActivationAutomationOutcome\(/,
  "Activation automation outcome model must expose a pure derivation function.",
);
assert.match(
  outcomeModelSource,
  /sourceLabel: "remediation_task"/,
  "The model must distinguish remediation-task-derived blocked states from evidence-derived states.",
);
assert.match(
  outcomeModelSource,
  /task\.sourceType !== "connector_blocked"/,
  "Only connector_blocked remediation tasks should become blocked automation outcomes.",
);
assert.match(
  outcomeModelSource,
  /lastKnownAssessmentResult: previousConfirmedEvidence\?\.assessmentResult \?\? null/,
  "Blocked latest evidence must preserve the previous confirmed pass/gap result.",
);

assert.match(
  outcomeQuerySource,
  /\.from\(evidence\)[\s\S]*eq\(evidence\.source, "connector"\)/,
  "Outcome query must read existing connector evidence only for evidence-derived outcomes.",
);
assert.match(
  outcomeQuerySource,
  /\.from\(remediationTasks\)[\s\S]*inArray\(remediationTasks\.status, \["open", "in_progress"\]\)/,
  "Outcome query must read only active remediation tasks.",
);
assert.match(
  outcomeQuerySource,
  /inArray\(remediationTasks\.sourceType, \["connector_blocked"\]\)/,
  "Outcome query must use connector_blocked tasks for blocked automation fallback copy.",
);
for (const pattern of writeApiPatterns) {
  assert.doesNotMatch(
    outcomeQuerySource,
    pattern,
    "Activation automation outcome query must stay read-only and never create remediation or evidence rows.",
  );
}

assert.match(
  dashboardQuerySource,
  /getActivationAutomationOutcomeForControlKeys/,
  "Dashboard query must load the read-only automation outcome for activation priority controls.",
);
assert.match(
  dashboardQuerySource,
  /activationAutomationOutcome,/,
  "Dashboard data contract must expose activationAutomationOutcome to the page.",
);
assert.match(
  controlsQuerySource,
  /listActivationAutomationOutcomesForControlKeys/,
  "Controls index query must load read-only automation outcomes for all listed controls.",
);
assert.match(
  controlsQuerySource,
  /automationOutcome: automationOutcomesByControlKey\.get\(control\.key\) \?\? null/,
  "Controls index rows must carry the outcome without deriving it in the render path.",
);

assert.match(
  dashboardPageSource,
  /activationAutomationOutcome && activationAutomationStatusState/,
  "Dashboard activation hero must render the read-only automation outcome when present.",
);
assert.match(
  dashboardPageSource,
  /copy\.activation\.automationOutcomeBody/,
  "Dashboard activation hero must explain that the outcome is existing read-only state.",
);
assert.match(
  controlsPageSource,
  /const automationInput = control\.automationOutcome \?\? null;/,
  "Controls cards must prefer the query-provided automation outcome.",
);
assert.match(
  controlsPageSource,
  /blockedReason: automationInput\?\.blockedReason \?\? control\.latestEvidenceBlockedReason \?\? undefined/,
  "Controls cards must derive blocked status from query-provided automation outcomes or latest evidence state.",
);
assert.match(
  controlsPageSource,
  /const automationBlocked = activationStatusState\.status === "blocked";/,
  "Controls cards must label derived blocked collection states separately from failed controls.",
);
assert.match(
  evidencePageSource,
  /getActivationAutomationOutcomeForControlKeys/,
  "Evidence page must load the same read-only outcome model for its empty-state CTA.",
);
assert.match(
  evidencePageSource,
  /activationAutomationOutcome\s*\?\s*`\/controls\/\$\{activationAutomationOutcome\.controlKey\}`\s*:\s*activationNextAction\.href/,
  "Evidence empty-state CTA must route to the affected control when an automation outcome exists.",
);
assert.match(
  evidencePageSource,
  /copy\.records\.emptyAutomationOutcome/,
  "Evidence empty state must explain connector automation state without pretending evidence was collected.",
);

for (const [label, source] of appRenderSources) {
  for (const pattern of writeApiPatterns) {
    assert.doesNotMatch(
      source,
      pattern,
      `${label} must not create evidence, remediation tasks, or other DB writes while rendering activation outcomes.`,
    );
  }
}

for (const [locale, source] of [
  ["en-EU", enMessagesSource],
  ["cs-CZ", csMessagesSource],
  ["it-IT", itMessagesSource],
] as const) {
  assert.match(
    source,
    /"automationOutcomeBody"/,
    `${locale} dashboard copy must include read-only automation outcome explanation.`,
  );
  assert.match(
    source,
    /"emptyAutomationOutcome"/,
    `${locale} evidence copy must include empty automation outcome explanation.`,
  );
  assert.match(
    source,
    /"emptyAutomationBlockedAction"/,
    `${locale} evidence copy must include blocked automation CTA copy.`,
  );
}

assert.doesNotMatch(
  enMessagesSource,
  /emptyAutomation(?:Outcome|BlockedAction)"\s*:\s*"[^"]*fail/i,
  "English evidence automation empty-state copy must say blocked/review, not failed.",
);
assert.doesNotMatch(
  csMessagesSource,
  /emptyAutomation(?:Outcome|BlockedAction)"\s*:\s*"[^"]*(?:selh|neusp)/i,
  "Czech evidence automation empty-state copy must say blocked/review, not failed.",
);
assert.doesNotMatch(
  itMessagesSource,
  /emptyAutomation(?:Outcome|BlockedAction)"\s*:\s*"[^"]*(?:fallit|errore)/i,
  "Italian evidence automation empty-state copy must say blocked/review, not failed.",
);

console.log("Activation automation outcome source smoke passed");
