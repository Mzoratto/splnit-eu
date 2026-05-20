import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const activationEventsSource = readFileSync("lib/activation/events.ts", "utf8");
const callbackSource = readFileSync("app/api/integrations/microsoft/callback/route.ts", "utf8");
const controlsActionsSource = readFileSync("app/(app)/controls/[controlId]/actions.ts", "utf8");
const evidenceSource = readFileSync("lib/integrations/evidence.ts", "utf8");
const microsoftStartSource = readFileSync("app/api/integrations/microsoft/start/route.ts", "utf8");
const onboardingActionsSource = readFileSync("app/(app)/onboarding/actions.ts", "utf8");
const runnerSource = readFileSync("lib/integrations/runner.ts", "utf8");

const expectedEvents = [
  "IntakeCompleted",
  "ConnectorRecommended",
  "ConnectorOAuthStarted",
  "ConnectorOAuthCompleted",
  "EvidenceCollectionQueued",
  "EvidenceCollected",
  "EvidenceBlocked",
  "AssessmentChanged",
  "ManualEvidenceAdded",
];

for (const eventName of expectedEvents) {
  assert.match(
    activationEventsSource,
    new RegExp(`\\"${eventName}\\"`),
    `${eventName} must be present in the typed activation event registry.`,
  );
  assert.match(
    activationEventsSource,
    new RegExp(`ActivationEventBase<\\s*\\n\\s*\\"${eventName}\\"`),
    `${eventName} must have a typed ActivationEvent variant.`,
  );
}

assert.match(
  activationEventsSource,
  /action:\s*`activation\.\$\{event\.name\}`/,
  "Activation events must be written with stable activation.<EventName> audit actions.",
);
assert.match(
  onboardingActionsSource,
  /name:\s*["']IntakeCompleted["']/,
  "IntakeCompleted must fire when the intake profile is saved.",
);
assert.match(
  onboardingActionsSource,
  /name:\s*["']ConnectorRecommended["']/,
  "ConnectorRecommended must fire from intake-selected tooling.",
);
assert.match(
  microsoftStartSource,
  /name:\s*["']ConnectorOAuthStarted["']/,
  "ConnectorOAuthStarted must fire before redirecting to Microsoft OAuth.",
);
assert.match(
  callbackSource,
  /name:\s*["']ConnectorOAuthCompleted["']/,
  "ConnectorOAuthCompleted must fire after the connector is upserted.",
);
assert.match(
  callbackSource,
  /firstRun\.enqueued[\s\S]*name:\s*["']EvidenceCollectionQueued["']/,
  "EvidenceCollectionQueued must fire only when the first collection run is enqueued.",
);
assert.match(
  evidenceSource,
  /collection_status === ["']collected["'][\s\S]*name:\s*["']EvidenceCollected["']/,
  "EvidenceCollected must fire for collected automated evidence.",
);
assert.match(
  evidenceSource,
  /collection_status === ["']blocked["'][\s\S]*collection_status === ["']failed["'][\s\S]*name:\s*["']EvidenceBlocked["']/,
  "EvidenceBlocked must fire for blocked or failed automated evidence.",
);
assert.match(
  runnerSource,
  /currentStatus\?\.status !== result\.status[\s\S]*name:\s*["']AssessmentChanged["']/,
  "AssessmentChanged must fire when automated collection changes a control assessment.",
);
assert.match(
  controlsActionsSource,
  /result\.previousStatus !== parsed\.status[\s\S]*name:\s*["']AssessmentChanged["']/,
  "AssessmentChanged must fire when a manual control status changes.",
);
assert.match(
  controlsActionsSource,
  /name:\s*["']ManualEvidenceAdded["']/,
  "ManualEvidenceAdded must fire after manual evidence is saved.",
);

console.log("Activation event source smoke passed");
