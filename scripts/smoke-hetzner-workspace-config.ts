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

const expectedZokbRefs: Record<string, { reference: string; tier: "mandatory_minimum" | "assessable" }> = {
  "hetzner-api-key-rotation-schedule": { reference: "§ 8", tier: "assessable" },
  "hetzner-backup-snapshot-schedule": { reference: "§ 6", tier: "mandatory_minimum" },
  "hetzner-iam-api-key-scopes": { reference: "§ 7", tier: "assessable" },
  "hetzner-infra-firewall-present": { reference: "§ 11", tier: "assessable" },
  "hetzner-infra-server-running": { reference: "§ 6", tier: "mandatory_minimum" },
  "hetzner-infra-snapshot-recent": { reference: "§ 6", tier: "mandatory_minimum" },
};

for (const [controlKey, expected] of Object.entries(expectedZokbRefs)) {
  const control = controls.find((candidate) => candidate.controlKey === controlKey);
  assert.ok(control, `${controlKey} must exist.`);
  assert.equal(control.nukibTier, expected.tier, `${controlKey} must carry NÚKIB tier.`);
  assert.ok(
    control.frameworkMappings?.some(
      (mapping) => mapping.frameworkId === "zokb" && mapping.reference === expected.reference,
    ),
    `${controlKey} must carry primary ZoKB ${expected.reference} mapping.`,
  );
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
