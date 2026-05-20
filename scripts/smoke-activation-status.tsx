import assert from "node:assert/strict";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ActivationStatus,
  deriveActivationStatusState,
  type ActivationStatusState,
} from "@/components/activation/activation-status";

function render(state: ActivationStatusState) {
  return renderToStaticMarkup(<ActivationStatus confidence="high" state={state} />);
}

function assertContains(markup: string, expected: string, message: string) {
  assert.ok(
    markup.includes(expected),
    `${message}\nExpected to find: ${expected}\nMarkup: ${markup}`,
  );
}

const queued = render(deriveActivationStatusState({ collectionStatus: "pending" }));
assertContains(queued, "Queued", "pending evidence should render as queued");
assertContains(queued, "Waiting for the next collection run.", "queued state should explain that it is waiting");

const running = render(deriveActivationStatusState({ collectionStatus: "running" }));
assertContains(running, "Running", "running collection should render as running");
assertContains(running, "Collection is running now.", "running state should explain active collection");

const blocked = render(
  deriveActivationStatusState({
    blockedReason: "missing_permission",
    collectionStatus: "blocked",
  }),
);
assertContains(blocked, "Blocked", "blocked collection should render as blocked");
assertContains(blocked, "Reason: Permission missing.", "blocked state should render the blocked reason");

const confirmedPass = render(
  deriveActivationStatusState({
    assessmentResult: "pass",
    collectionStatus: "collected",
  }),
);
assertContains(confirmedPass, "Confirmed pass", "pass result should render as confirmed pass");

const confirmedGap = render(
  deriveActivationStatusState({
    assessmentResult: "gap",
    collectionStatus: "collected",
  }),
);
assertContains(confirmedGap, "Confirmed gap", "gap result should render as confirmed gap");

const blockedWithPreservedPass = render(
  deriveActivationStatusState({
    blockedReason: "missing_permission",
    collectionStatus: "blocked",
    lastKnownAssessmentResult: "pass",
  }),
);
assertContains(
  blockedWithPreservedPass,
  "Last confirmed result is still passing while collection is blocked.",
  "blocked state should express a preserved last-known passing result",
);

console.log("activation status component smoke passed");
