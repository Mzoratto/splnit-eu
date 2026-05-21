import assert from "node:assert/strict";
import { hetznerWorkspace } from "@/lib/workspaces/hetzner";
import { HETZNER_LAYER1_CHECKS } from "@/lib/workspaces/hetzner-checks";

const controls = hetznerWorkspace.layers.flatMap((layer) =>
  layer.controls.map((control) => ({
    ...control,
    layerId: layer.id,
  })),
);

assert.equal(hetznerWorkspace.platformId, "hetzner");
assert.equal(hetznerWorkspace.layers.length, 4);

for (const control of controls) {
  assert.match(
    control.nis2ArticleRef,
    /^Article 21\(2\)\([chij]\)$/,
    `${control.controlKey} must include a NIS2 article mapping.`,
  );
  assert.ok(control.guidance.length > 40, `${control.controlKey} must include Czech guidance.`);
}

const layer1 = controls.filter((control) => control.layerId === "infrastructure");
assert.equal(layer1.length, 3);

for (const control of layer1) {
  assert.equal(control.automatable, true, `${control.controlKey} must be automatable.`);
  assert.ok(control.apiEndpoint, `${control.controlKey} must document the API endpoint.`);
  assert.ok(control.apiField, `${control.controlKey} must document the response field.`);
  assert.ok(control.apiExpected, `${control.controlKey} must document the expected value.`);
  assert.equal(
    control.evidenceType,
    "both",
    `${control.controlKey} must retain manual fallback evidence collection.`,
  );
}

assert.deepEqual(
  HETZNER_LAYER1_CHECKS.map((check) => check.controlKey),
  layer1.map((control) => control.controlKey),
);

console.log("hetzner workspace config smoke passed");
