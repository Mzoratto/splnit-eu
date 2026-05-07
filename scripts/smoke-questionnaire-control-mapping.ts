import { strict as assert } from "node:assert";
import {
  buildQuestionnaireControlMapping,
  getQuestionnaireAnswerConfidence,
} from "../lib/questionnaires/control-mapping";

const activeControls = [
  {
    controlId: "ctrl-1",
    controlKey: "ctrl_mfa_all_users",
    description: "Multi-factor authentication is required for all users.",
    isAutomated: false,
    lastEvidenceAt: null,
    notes: null,
    status: "pass",
    title: "MFA for all users",
    updatedAt: null,
  },
  {
    controlId: "ctrl-2",
    controlKey: "ctrl_backup_tested",
    description: "Backups are restored and tested regularly.",
    isAutomated: false,
    lastEvidenceAt: null,
    notes: null,
    status: "unknown",
    title: "Backup restoration testing",
    updatedAt: null,
  },
];

const mappings = buildQuestionnaireControlMapping({
  controls: activeControls,
  questions: [
    "Is MFA enforced for every user account?",
    "Do you test restoring backups?",
    "Do you use submarines?",
  ],
});

assert.deepEqual(mappings[0]?.controlIds, ["ctrl-1"]);
assert.deepEqual(mappings[1]?.controlIds, ["ctrl-2"]);
assert.deepEqual(mappings[2]?.controlIds, []);

assert.equal(
  getQuestionnaireAnswerConfidence({
    evidenceCount: 1,
    mappedControlCount: 1,
    policyCount: 0,
  }),
  "supported",
);
assert.equal(
  getQuestionnaireAnswerConfidence({
    evidenceCount: 0,
    mappedControlCount: 1,
    policyCount: 1,
  }),
  "partial",
);
assert.equal(
  getQuestionnaireAnswerConfidence({
    evidenceCount: 0,
    mappedControlCount: 0,
    policyCount: 0,
  }),
  "no-context",
);

console.log("questionnaire control mapping smoke passed");
