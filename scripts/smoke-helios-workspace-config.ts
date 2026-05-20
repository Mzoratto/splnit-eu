/**
 * Smoke test: Helios workspace config.
 *
 * Verifies:
 *  1. All four layers are present (infrastructure, iam, backup_dr, api_connectivity).
 *  2. Every control in every layer has a non-empty nis2ArticleRef.
 *  3. Layer 2 (iam) contains manufacturing role hierarchy controls
 *     (výroba/MES, HR/mzdy, logistika, finance separation).
 *  4. Layer 4 (api_connectivity) references MES/SCADA/EDI integrations.
 *  5. No Pohoda-specific or Money S3-specific terminology appears anywhere in the config.
 *
 * Static config check — no DB or server required.
 */

import assert from "node:assert/strict";
import { heliosWorkspace } from "@/lib/workspaces/helios";

// ─── Assertions ───────────────────────────────────────────────────────────────

const { layers } = heliosWorkspace;

// 1. All four expected layer ids are present.
const expectedLayerIds = ["infrastructure", "iam", "backup_dr", "api_connectivity"] as const;
const actualLayerIds = layers.map((l) => l.id);

for (const id of expectedLayerIds) {
  assert.ok(
    actualLayerIds.includes(id),
    `Layer "${id}" is missing from heliosWorkspace.layers (found: ${actualLayerIds.join(", ")})`,
  );
}

assert.equal(
  layers.length,
  4,
  `Expected exactly 4 layers, got ${layers.length}: ${actualLayerIds.join(", ")}`,
);

// 2. Every control has a non-empty nis2ArticleRef.
for (const layer of layers) {
  for (const control of layer.controls) {
    assert.ok(
      typeof control.nis2ArticleRef === "string" && control.nis2ArticleRef.trim().length > 0,
      `Control "${control.controlKey}" in layer "${layer.id}" is missing nis2ArticleRef`,
    );
  }
}

// 3. Layer 2 (iam) contains manufacturing role hierarchy controls.
//    Must reference separation of: výroba/MES, HR/mzdy, logistika/sklady, účetnictví/finance.
const layer2 = layers.find((l) => l.id === "iam");
assert.ok(layer2, "Layer iam must exist (already checked above)");

const layer2CombinedText = layer2.controls
  .map((c) => `${c.controlKey} ${c.question} ${c.guidance}`)
  .join(" ");

const manufacturingRolePatterns: Array<[RegExp, string]> = [
  [/výrob|MES/i, "manufacturing/production (výroba/MES)"],
  [/HR|mzd/i, "HR/payroll (HR/mzdy)"],
  [/logistik|sklad/i, "logistics/warehouse (logistika/sklady)"],
  [/účetnictv|financ/i, "finance/accounting (účetnictví/finance)"],
];

for (const [pattern, description] of manufacturingRolePatterns) {
  assert.ok(
    pattern.test(layer2CombinedText),
    `Layer 2 (iam) does not contain manufacturing role hierarchy controls for ${description}`,
  );
}

// 4. Layer 4 (api_connectivity) references MES/SCADA/EDI integrations.
//    Each integration type must have at least one dedicated control in the layer.
const layer4 = layers.find((l) => l.id === "api_connectivity");
assert.ok(layer4, "Layer api_connectivity must exist (already checked above)");

const layer4CombinedText = layer4.controls
  .map((c) => `${c.controlKey} ${c.question} ${c.guidance}`)
  .join(" ");

const layer4IntegrationPatterns: Array<[RegExp, string]> = [
  [/\bMES\b/i, "MES (Manufacturing Execution System)"],
  [/\bSCADA\b/i, "SCADA"],
  [/\bEDI\b/i, "EDI (Electronic Data Interchange)"],
];

for (const [pattern, description] of layer4IntegrationPatterns) {
  assert.ok(
    pattern.test(layer4CombinedText),
    `Layer 4 (api_connectivity) does not reference ${description} integrations anywhere in its controls`,
  );
}

// 5. No Pohoda-specific or Money S3-specific terminology.
const forbiddenTermPatterns: Array<[RegExp, string]> = [
  [/\bPohoda\b/i, "Pohoda"],
  [/\bStormware\b/i, "Stormware"],
  [/Údržba\s+databáze/i, "Údržba databáze (Pohoda-specific)"],
  [/\bmServer\b/i, "mServer (Pohoda-specific)"],
  [/\bMoney\s+S3\b/i, "Money S3"],
  [/\bSoftware602\b/i, "Software602 (Money S3 vendor)"],
] as const;

const failures: string[] = [];

for (const layer of layers) {
  for (const control of layer.controls) {
    const fieldsToCheck: [string, string][] = [
      ["question", control.question],
      ["guidance", control.guidance],
      ["controlKey", control.controlKey],
    ];

    for (const [fieldName, value] of fieldsToCheck) {
      for (const [pattern, termName] of forbiddenTermPatterns) {
        if (pattern.test(value)) {
          failures.push(
            `Control "${control.controlKey}" layer "${layer.id}" field "${fieldName}": ` +
            `found forbidden term "${termName}" matching ${pattern}`,
          );
        }
      }
    }
  }
}

assert.deepEqual(
  failures,
  [],
  `Forbidden (Pohoda/Money S3) terminology found in Helios config:\n${failures.join("\n")}`,
);

// ─── Summary ──────────────────────────────────────────────────────────────────

const totalControls = layers.reduce((sum, l) => sum + l.controls.length, 0);
const layer2ControlCount = layer2.controls.length;
const layer4ControlCount = layer4.controls.length;

console.log("Helios workspace config smoke test passed.");
console.log(`  Layers: ${layers.length} (${actualLayerIds.join(", ")})`);
console.log(`  Controls: ${totalControls}`);
console.log(`  nis2ArticleRef: present on all ${totalControls} controls`);
console.log(`  Layer 2 (iam) manufacturing role hierarchy: all ${layer2ControlCount} controls reference correct roles`);
console.log(`  Layer 4 (api_connectivity) MES/SCADA/EDI refs: all three integration types present across ${layer4ControlCount} controls`);
console.log(`  Pohoda/Money S3-specific terms: none found`);
