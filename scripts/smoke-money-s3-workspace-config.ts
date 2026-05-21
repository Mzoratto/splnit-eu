/**
 * Smoke test: Money S3 workspace config.
 *
 * Verifies:
 *  1. All four layers are present (infrastructure, iam, backup_dr, api_connectivity).
 *  2. Every control in every layer has a non-empty nis2ArticleRef.
 *  3. Every control has NÚKIB-native ZoKB metadata.
 *  4. No control contains Pohoda-specific terminology
 *     (Pohoda, Stormware, Údržba databáze, mServer).
 *  5. Layer 4 (api_connectivity) controls reference e-commerce/REST integrations
 *     (Shoptet, WooCommerce, REST API, konektor).
 *
 * Static config check — no DB or server required.
 */

import assert from "node:assert/strict";
import { moneyS3Workspace } from "@/lib/workspaces/money-s3";

// ─── Assertions ───────────────────────────────────────────────────────────────

const { layers } = moneyS3Workspace;

// 1. All four expected layer ids are present.
const expectedLayerIds = ["infrastructure", "iam", "backup_dr", "api_connectivity"] as const;
const actualLayerIds = layers.map((l) => l.id);

for (const id of expectedLayerIds) {
  assert.ok(
    actualLayerIds.includes(id),
    `Layer "${id}" is missing from moneyS3Workspace.layers (found: ${actualLayerIds.join(", ")})`,
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

// 3. Every control has NÚKIB-native ZoKB metadata.
for (const layer of layers) {
  for (const control of layer.controls) {
    const zokbMapping = control.frameworkMappings?.find((mapping) => mapping.frameworkId === "zokb");

    assert.ok(
      zokbMapping?.reference.startsWith("§"),
      `Control "${control.controlKey}" in layer "${layer.id}" is missing ZoKB frameworkMappings metadata`,
    );
    assert.ok(
      control.officialBaselineRefs && control.officialBaselineRefs.length > 0,
      `Control "${control.controlKey}" in layer "${layer.id}" is missing officialBaselineRefs`,
    );
    assert.ok(
      control.nukibTier === "mandatory_minimum" || control.nukibTier === "assessable",
      `Control "${control.controlKey}" in layer "${layer.id}" is missing nukibTier`,
    );
  }
}

const backupLayer = layers.find((l) => l.id === "backup_dr");
assert.ok(backupLayer, "Layer backup_dr must exist (already checked above)");

for (const control of backupLayer.controls) {
  assert.equal(
    control.frameworkMappings?.find((mapping) => mapping.frameworkId === "zokb")?.reference,
    "§ 6",
    `Backup control "${control.controlKey}" must map to ZoKB § 6`,
  );
  assert.equal(
    control.nukibTier,
    "mandatory_minimum",
    `Backup control "${control.controlKey}" must be a mandatory minimum`,
  );
}

// 4. No control contains Pohoda-specific terminology.
const pohodaTermPatterns = [
  /\bPohoda\b/i,
  /\bStormware\b/i,
  /Údržba\s+databáze/i,
  /\bmServer\b/i,
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
      for (const pattern of pohodaTermPatterns) {
        if (pattern.test(value)) {
          failures.push(
            `Control "${control.controlKey}" layer "${layer.id}" field "${fieldName}": ` +
            `found Pohoda-specific term matching ${pattern}`,
          );
        }
      }
    }
  }
}

assert.deepEqual(
  failures,
  [],
  `Pohoda-specific terminology found in Money S3 config:\n${failures.join("\n")}`,
);

// 5. Layer 4 (api_connectivity) controls reference e-commerce/REST integrations.
const layer4 = layers.find((l) => l.id === "api_connectivity");
assert.ok(layer4, "Layer api_connectivity must exist (already checked above)");

const ecommercePattern = /Shoptet|WooCommerce|REST|konektor|e-commerce/i;

for (const control of layer4.controls) {
  const combinedText = `${control.question} ${control.guidance}`;
  assert.ok(
    ecommercePattern.test(combinedText),
    `Layer 4 control "${control.controlKey}" does not reference e-commerce/REST integrations. ` +
    `Expected at least one of: Shoptet, WooCommerce, REST, konektor, e-commerce`,
  );
}

// ─── Summary ──────────────────────────────────────────────────────────────────

const totalControls = layers.reduce((sum, l) => sum + l.controls.length, 0);

console.log("Money S3 workspace config smoke test passed.");
console.log(`  Layers: ${layers.length} (${actualLayerIds.join(", ")})`);
console.log(`  Controls: ${totalControls}`);
console.log(`  nis2ArticleRef: present on all ${totalControls} controls`);
console.log(`  ZoKB metadata: present on all ${totalControls} controls`);
console.log(`  Pohoda-specific terms: none found`);
console.log(`  Layer 4 e-commerce/REST refs: all ${layer4.controls.length} controls pass`);
