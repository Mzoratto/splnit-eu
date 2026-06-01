import type { ControlCategory, ControlSeed } from "@/lib/controls/library";
import type { ComplianceLayer, WorkspaceControl } from "@/lib/workspaces/types";
import { heliosWorkspace } from "@/lib/workspaces/helios";

// helios-* keys are permanent evidence identifiers. Renames, splits, or removals
// require an explicit migration/backfill for previously collected evidence.
export const HELIOS_CANONICAL_CONTROL_KEYS = [
  "helios-infra-deployment-type",
  "helios-infra-physical-server-room",
  "helios-infra-encryption-at-rest",
  "helios-infra-os-patch-management",
  "helios-infra-network-segmentation",
  "helios-iam-user-accounts",
  "helios-iam-module-role-hierarchy",
  "helios-iam-contractor-access-management",
  "helios-iam-inactive-session-audit",
  "helios-iam-offboarding",
  "helios-backup-sql-agent-jobs",
  "helios-backup-encryption",
  "helios-backup-offsite-immutable",
  "helios-backup-restoration-test",
  "helios-api-mes-scada-integration",
  "helios-api-edi-supplier-customer",
  "helios-api-credential-rotation",
  "helios-api-network-access-control",
  "helios-api-tls-enforcement",
] as const;

function inferCategory(layer: ComplianceLayer, control: WorkspaceControl): ControlCategory {
  if (control.controlKey.includes("physical-server-room")) {
    return "physical";
  }

  if (control.controlKey.includes("encryption") || control.controlKey.includes("tls")) {
    return "data_protection";
  }

  if (layer.id === "iam" || control.controlKey.includes("credential")) {
    return "access_control";
  }

  if (layer.id === "backup_dr") {
    return "business_continuity";
  }

  if (control.controlKey.includes("contractor") || control.controlKey.includes("supplier")) {
    return "supplier";
  }

  return "asset_management";
}

function technicalFallbackTitle(controlKey: string) {
  const suffix = controlKey
    .replace(/^helios-/, "")
    .split("-")
    .map((part) => part.toUpperCase() === "TLS" ? "TLS" : part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return `Helios manual control - ${suffix}`;
}

function buildRegulatorGuidance(control: WorkspaceControl) {
  const zokbMapping = control.frameworkMappings?.find((mapping) => mapping.frameworkId === "zokb");
  const parts = [
    control.zobkSectionRef ? `ZoKB section: ${control.zobkSectionRef}.` : null,
    zokbMapping ? `NÚKIB/ZoKB baseline: ${zokbMapping.reference} (${zokbMapping.title}).` : null,
    control.nukibTier ? `NÚKIB tier: ${control.nukibTier}.` : null,
    control.nukibPriority ? `NÚKIB priority: ${control.nukibPriority}.` : null,
    control.officialBaselineRefs?.length ? `Official baseline refs: ${control.officialBaselineRefs.join(", ")}.` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" ") : undefined;
}

export function workspaceControlToControlSeed(
  layer: ComplianceLayer,
  control: WorkspaceControl,
): ControlSeed {
  return {
    key: control.controlKey,
    titleCs: control.title ?? control.question,
    titleEn: technicalFallbackTitle(control.controlKey),
    descriptionCs: control.guidance,
    category: inferCategory(layer, control),
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      {
        frameworkSlug: "nis2",
        articleRef: control.nis2ArticleRef,
        regulatorGuidance: buildRegulatorGuidance(control),
        localizedTitle: control.title ?? control.question,
        localizedDescription: control.guidance,
        level: "mandatory",
      },
    ],
  };
}

export function workspaceControlsToControlSeeds(layers: readonly ComplianceLayer[]) {
  return layers.flatMap((layer) => layer.controls.map((control) => workspaceControlToControlSeed(layer, control)));
}

export function assertHeliosCanonicalControlSeeds(seeds: readonly ControlSeed[]) {
  const keys = seeds.map((seed) => seed.key);
  const duplicateKeys = [...new Set(keys.filter((key, index) => keys.indexOf(key) !== index))].sort();

  if (duplicateKeys.length > 0) {
    throw new Error(`Duplicate Helios canonical control keys: ${duplicateKeys.join(", ")}`);
  }

  const expected: string[] = [...HELIOS_CANONICAL_CONTROL_KEYS].sort();
  const actual = [...keys].sort();
  const missing = expected.filter((key) => !actual.includes(key));
  const unexpected = actual.filter((key) => !expected.includes(key));

  if (missing.length > 0 || unexpected.length > 0) {
    throw new Error(
      [
        "Generated Helios canonical control seeds do not exactly match current workspace control keys.",
        missing.length > 0 ? `Missing current Helios workspace control keys: ${missing.join(", ")}` : null,
        unexpected.length > 0 ? `Unexpected Helios control keys: ${unexpected.join(", ")}` : null,
        "helios-* keys are permanent evidence identifiers; rename/split requires migration/backfill.",
      ]
        .filter(Boolean)
        .join(" "),
    );
  }
}

export const HELIOS_CONTROL_SEEDS = workspaceControlsToControlSeeds(heliosWorkspace.layers);

assertHeliosCanonicalControlSeeds(HELIOS_CONTROL_SEEDS);
