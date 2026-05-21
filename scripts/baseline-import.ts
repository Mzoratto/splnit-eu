import path from "node:path";
import { readFile } from "node:fs/promises";

import { parseNukibWorkbook } from "@/lib/compliance/nukib/parsing/workbook-parser";
import {
  computeFileSha256,
  diffBaselines,
  generateManifest,
  hasBaselineDiffChanges,
} from "@/lib/compliance/nukib/versioning/version-manager";
import {
  readCurrentBaselineManifest,
  writeBaselineManifestArtifacts,
} from "@/scripts/baseline-utils";

async function main() {
  const sourcePath = process.argv[2];

  if (!sourcePath) {
    throw new Error("Usage: npm run baseline:import -- <path-to-xlsx>");
  }

  const buffer = await readFile(sourcePath);
  const sourceSha256 = await computeFileSha256(buffer);
  const current = await readCurrentBaselineManifest();

  if (current?.sourceSha256 === sourceSha256) {
    console.log("NÚKIB baseline import skipped: source SHA256 matches current manifest.");
    return;
  }

  const parsedControls = parseNukibWorkbook(buffer);
  let manifest = generateManifest(
    parsedControls,
    path.basename(sourcePath),
    sourceSha256,
  );
  const diff = current ? diffBaselines(current, manifest) : undefined;

  if (current && diff) {
    const existingArchived = current.controls.filter((control) => control.archived);
    const archivedReferences = new Set(
      [...existingArchived, ...diff.removed].map((control) => control.exactReference),
    );
    const archivedControls = [...existingArchived, ...diff.removed].filter(
      (control, index, all) =>
        archivedReferences.has(control.exactReference) &&
        all.findIndex((candidate) => candidate.exactReference === control.exactReference) ===
          index,
    );

    manifest = {
      ...manifest,
      controls: [...parsedControls, ...archivedControls],
      controlCount: parsedControls.length + archivedControls.length,
    };
  }

  const artifacts = await writeBaselineManifestArtifacts({
    manifest,
    diff: diff && hasBaselineDiffChanges(diff) ? diff : undefined,
  });

  console.log(`NÚKIB baseline imported: ${manifest.controlCount} controls.`);
  console.log(`Manifest: ${artifacts.manifestPath}`);

  if (artifacts.changelogPath) {
    console.log(`Changelog: ${artifacts.changelogPath}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
