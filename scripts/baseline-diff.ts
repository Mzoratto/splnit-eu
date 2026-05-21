import path from "node:path";
import { readFile } from "node:fs/promises";

import { parseNukibWorkbook } from "@/lib/compliance/nukib/parsing/workbook-parser";
import {
  computeFileSha256,
  diffBaselines,
  generateManifest,
  renderBaselineDiffMarkdown,
} from "@/lib/compliance/nukib/versioning/version-manager";
import {
  listBaselineManifestPaths,
  readBaselineManifest,
  readCurrentBaselineManifest,
} from "@/scripts/baseline-utils";

async function main() {
  const sourcePath = process.argv[2];

  if (sourcePath) {
    const current = await readCurrentBaselineManifest();
    if (!current) {
      throw new Error("No current baseline manifest exists. Run baseline:import first.");
    }

    const buffer = await readFile(sourcePath);
    const sourceSha256 = await computeFileSha256(buffer);
    const parsedControls = parseNukibWorkbook(buffer);
    const next = generateManifest(parsedControls, path.basename(sourcePath), sourceSha256);
    console.log(renderBaselineDiffMarkdown(diffBaselines(current, next)));
    return;
  }

  const manifestPaths = await listBaselineManifestPaths();
  if (manifestPaths.length < 2) {
    console.log("Není k dispozici dostatek baseline manifestů pro diff.");
    return;
  }

  const previous = await readBaselineManifest(manifestPaths[manifestPaths.length - 2]);
  const next = await readBaselineManifest(manifestPaths[manifestPaths.length - 1]);
  console.log(renderBaselineDiffMarkdown(diffBaselines(previous, next)));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
