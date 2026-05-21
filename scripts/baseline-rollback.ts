import { readFile, writeFile } from "node:fs/promises";

import type { PlatformWorkspace } from "@/lib/workspaces/types";
import {
  CURRENT_BASELINE_PATH,
  listBaselineManifestPaths,
  readBaselineManifest,
} from "@/scripts/baseline-utils";

async function main() {
  const manifestPaths = await listBaselineManifestPaths();

  if (manifestPaths.length < 2) {
    console.log("Rollback nelze provést: není k dispozici předchozí baseline manifest.");
    return;
  }

  const rollbackPath = manifestPaths[manifestPaths.length - 2];
  const currentPath = manifestPaths[manifestPaths.length - 1];
  const rollbackManifest = await readBaselineManifest(rollbackPath);
  const content = await readFile(rollbackPath, "utf8");

  await writeFile(CURRENT_BASELINE_PATH, content.endsWith("\n") ? content : `${content}\n`, "utf8");

  console.warn(
    `NÚKIB baseline-current.json byl vrácen z ${currentPath} na ${rollbackPath}. Databáze ani důkazy nebyly změněny.`,
  );

  const workspaceReferences = await collectWorkspaceReferences();
  const missing = rollbackManifest.controls.filter(
    (control) => !workspaceReferences.has(control.exactReference),
  );

  if (missing.length > 0) {
    console.warn(
      `Upozornění: ${missing.length} opatření z obnoveného manifestu není přímo navázáno v aktuálních workspace konfiguracích.`,
    );
    for (const control of missing.slice(0, 20)) {
      console.warn(`- ${control.exactReference} — ${control.title}`);
    }
    if (missing.length > 20) {
      console.warn(`... a dalších ${missing.length - 20} opatření.`);
    }
  }
}

async function collectWorkspaceReferences(): Promise<Set<string>> {
  const [
    { pohodaWorkspace },
    { moneyS3Workspace },
    { heliosWorkspace },
    { hetznerWorkspace },
    { ovhcloudWorkspace },
  ] = await Promise.all([
    import("@/lib/workspaces/pohoda"),
    import("@/lib/workspaces/money-s3"),
    import("@/lib/workspaces/helios"),
    import("@/lib/workspaces/hetzner"),
    import("@/lib/workspaces/ovhcloud"),
  ]);

  return new Set(
    [
      pohodaWorkspace,
      moneyS3Workspace,
      heliosWorkspace,
      hetznerWorkspace,
      ovhcloudWorkspace,
    ].flatMap((workspace) => workspaceReferenceList(workspace)),
  );
}

function workspaceReferenceList(workspace: PlatformWorkspace): string[] {
  return workspace.layers.flatMap((layer) =>
    layer.controls.flatMap((control) => {
      const extended = control as {
        officialBaselineRefs?: string[];
        zobkSectionRef?: string;
      };

      return [
        ...(extended.officialBaselineRefs ?? []),
        extended.zobkSectionRef,
      ].filter((reference): reference is string => Boolean(reference));
    }),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
