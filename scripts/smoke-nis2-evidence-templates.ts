import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { CONTROL_LIBRARY } from "../lib/controls/library";
import { HELIOS_CANONICAL_CONTROL_KEYS } from "../lib/workspaces/control-seeds";

const nis2Mappings = CONTROL_LIBRARY.flatMap((control) =>
  control.frameworkMappings
    .filter((mapping) => mapping.frameworkSlug === "nis2")
    .map((mapping) => ({
      articleRef: mapping.articleRef,
      controlKey: control.key,
      evidenceRequirements: mapping.evidenceRequirements,
    })),
);

assert.ok(
  nis2Mappings.length > 0,
  "NIS2 framework-control mappings should be present before checking evidence templates.",
);

const missingEvidenceRequirements = nis2Mappings
  .filter((mapping) => !mapping.evidenceRequirements?.trim())
  .map(({ articleRef, controlKey }) => ({ articleRef, controlKey }))
  .sort((a, b) =>
    a.controlKey.localeCompare(b.controlKey) || a.articleRef.localeCompare(b.articleRef),
  );

assert.deepEqual(
  missingEvidenceRequirements,
  [],
  `NIS2 source framework-control mappings missing evidence requirements: ${JSON.stringify(
    missingEvidenceRequirements,
    null,
    2,
  )}`,
);

const heliosNis2Mappings = nis2Mappings.filter((mapping) =>
  (HELIOS_CANONICAL_CONTROL_KEYS as readonly string[]).includes(mapping.controlKey),
);

assert.equal(
  heliosNis2Mappings.length,
  HELIOS_CANONICAL_CONTROL_KEYS.length,
  "Every canonical Helios control should have one NIS2 source mapping.",
);

for (const controlKey of HELIOS_CANONICAL_CONTROL_KEYS) {
  const mapping = heliosNis2Mappings.find((candidate) => candidate.controlKey === controlKey);

  assert.ok(mapping, `${controlKey} should have a NIS2 source mapping.`);
  assert.ok(
    (mapping.evidenceRequirements?.length ?? 0) >= 80,
    `${controlKey} should have detailed evidence requirements, not a generic placeholder.`,
  );
  assert.match(
    mapping.evidenceRequirements ?? "",
    /Helios|network|backup|credential|contractor|session|role|offboarding|deployment|server-room|host|transport|EDI|MES|SCADA|API/i,
    `${controlKey} should have control-specific evidence requirements.`,
  );
}

const seedSource = readFileSync("scripts/seed.ts", "utf8");

assert.match(
  seedSource,
  /if \(!mapping\.evidenceRequirements\) \{\s*continue;\s*\}/,
  "Seed source should only create evidence templates for mappings with evidence requirements.",
);
assert.match(
  seedSource,
  /description:\s*mapping\.evidenceRequirements/,
  "Seed source should copy mapping evidence requirements into evidence template descriptions.",
);

console.log("NIS2 evidence template source smoke test passed.");
