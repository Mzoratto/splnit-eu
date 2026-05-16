import * as assert from "node:assert/strict";

import {
  getDocumentsForFramework,
  getLocalizedDocuments,
  getLocalizedDocumentsForFramework,
} from "../lib/trust-center/public-model";
import {
  getLockedDocuments,
  getSplnitDocuments,
} from "../lib/trust-center/public-documents";
import {
  POLICY_TEMPLATES,
  POLICY_TEMPLATE_TYPES,
  isPolicyTemplateType,
} from "../lib/policies/templates";

const expectedTemplateOrder = [
  "CZ:cs-CZ:ai_policy",
  "CZ:cs-CZ:security_policy",
  "CZ:cs-CZ:gdpr_privacy_notice",
  "CZ:cs-CZ:training_log",
  "CZ:cs-CZ:record_of_use",
  "CZ:cs-CZ:incident_response",
  "EU:en-EU:ai_policy",
  "EU:en-EU:security_policy",
  "EU:en-EU:gdpr_privacy_notice",
  "EU:en-EU:training_log",
  "EU:en-EU:record_of_use",
  "EU:en-EU:incident_response",
  "IT:it-IT:security_policy",
  "IT:it-IT:incident_response",
  "IT:it-IT:record_of_processing",
  "IT:it-IT:dpia",
  "IT:it-IT:data_processing_agreement",
  "IT:it-IT:subprocessor_list",
  "IT:it-IT:asset_inventory",
  "IT:it-IT:risk_assessment",
  "IT:it-IT:acceptable_use",
  "IT:it-IT:vendor_questionnaire",
  "IT:it-IT:business_continuity",
  "IT:it-IT:access_control",
];

assert.deepEqual(
  POLICY_TEMPLATES.map(
    (template) =>
      `${template.jurisdiction}:${template.locale}:${template.templateFamily}`,
  ),
  expectedTemplateOrder,
  "policy template facade should preserve the pre-split jurisdiction and family order",
);

assert.deepEqual(
  POLICY_TEMPLATE_TYPES,
  [
    "ai_policy",
    "security_policy",
    "gdpr_privacy_notice",
    "training_log",
    "record_of_use",
    "incident_response",
  ],
  "customer-facing policy template families should stay stable",
);

assert.equal(isPolicyTemplateType("security_policy"), true);
assert.equal(isPolicyTemplateType("access_control"), false);
assert.equal(isPolicyTemplateType("missing_template"), false);

const publicDocuments = getLocalizedDocuments("en-EU");

assert.deepEqual(
  publicDocuments.map((document) => document.id),
  [
    "soc2",
    "iso-soa",
    "pentest",
    "privacy-policy",
    "dpa",
    "subprocessors",
    "whitepaper",
    "sla",
  ],
  "public Trust Center document order should stay stable",
);

assert.equal(
  publicDocuments.find((document) => document.id === "soc2")?.description,
  "Shared only if it is available for this organisation.",
  "localized document descriptions should be exposed through the public model facade",
);

assert.deepEqual(
  getDocumentsForFramework("gdpr").map((document) => document.id),
  ["privacy-policy", "dpa", "subprocessors"],
  "framework document filtering should remain stable through the public model facade",
);

assert.deepEqual(
  getLocalizedDocumentsForFramework("nis2", "it-IT").map(
    (document) => document.id,
  ),
  ["soc2", "pentest", "subprocessors", "whitepaper", "sla"],
  "localized framework document filtering should remain stable",
);

const lockedDocuments = getLockedDocuments("en-EU");
assert.equal(
  lockedDocuments.every((document) => document.isLocked),
  true,
  "locked document helper should lock every public document",
);
assert.deepEqual(
  new Set(lockedDocuments.map((document) => document.href)),
  new Set(["mailto:hello@splnit.eu?subject=Trust%20Center%20access%20request"]),
  "locked document helper should replace every href with the generic access request link",
);

assert.deepEqual(
  getSplnitDocuments("cs-CZ").map((document) => document.id),
  [
    "splnit-security-whitepaper",
    "splnit-dpa",
    "splnit-subprocessors",
    "splnit-privacy",
    "splnit-terms",
  ],
  "Splnit demo documents should stay category-level and ordered",
);

console.log("Public module seam smoke passed.");
