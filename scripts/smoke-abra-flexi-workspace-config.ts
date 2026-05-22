import assert from "node:assert/strict";
import { abraFlexiWorkspace } from "@/lib/workspaces/abra-flexi";

const expectedLayerIds = [
  "infrastructure",
  "iam",
  "backup_dr",
  "api_connectivity",
];

const layers = abraFlexiWorkspace.layers;
const allControls = layers.flatMap((layer) => layer.controls);
const actualLayerIds: string[] = layers.map((layer) => layer.id);

assert.equal(abraFlexiWorkspace.platformId, "abra-flexi");
assert.equal(layers.length, 4, "ABRA Flexi workspace must keep four layers.");

for (const id of expectedLayerIds) {
  assert.ok(
    actualLayerIds.includes(id),
    `Layer "${id}" is missing from ABRA Flexi workspace.`,
  );
}

for (const control of allControls) {
  assert.ok(
    typeof control.nis2ArticleRef === "string" && control.nis2ArticleRef.trim().length > 0,
    `Control "${control.controlKey}" is missing NIS2/compatibility reference.`,
  );
  assert.ok(
    control.frameworkMappings?.some((mapping) => mapping.frameworkId === "zokb"),
    `Control "${control.controlKey}" is missing ZoKB mapping.`,
  );
  assert.ok(
    control.nukibTier,
    `Control "${control.controlKey}" is missing nukibTier.`,
  );
}

const backupControls = allControls.filter((control) =>
  control.controlKey.startsWith("abra-flexi-backup-"),
);

assert.equal(backupControls.length, 3, "ABRA Flexi backup layer must keep three controls.");

for (const control of backupControls) {
  assert.ok(
    control.frameworkMappings?.some(
      (mapping) => mapping.frameworkId === "zokb" && mapping.reference === "§ 6",
    ),
    `Backup control "${control.controlKey}" must map to ZoKB § 6.`,
  );
  assert.equal(
    control.nukibTier,
    "mandatory_minimum",
    `Backup control "${control.controlKey}" must be mandatory minimum.`,
  );
}

console.log("ABRA Flexi workspace config smoke passed");
