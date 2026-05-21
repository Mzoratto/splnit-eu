import path from "node:path";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";

import type {
  BaselineDiff,
  NukibBaselineManifest,
} from "@/lib/compliance/nukib/types";
import { renderBaselineDiffMarkdown } from "@/lib/compliance/nukib/versioning/version-manager";

export const GENERATED_BASELINE_DIR = path.join(
  process.cwd(),
  "lib/compliance/nukib/generated",
);
export const CURRENT_BASELINE_PATH = path.join(
  GENERATED_BASELINE_DIR,
  "baseline-current.json",
);

export async function readCurrentBaselineManifest(): Promise<NukibBaselineManifest | null> {
  try {
    return await readBaselineManifest(CURRENT_BASELINE_PATH);
  } catch (error) {
    if (isMissingFileError(error)) {
      return null;
    }

    throw error;
  }
}

export async function readBaselineManifest(
  filePath: string,
): Promise<NukibBaselineManifest> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as NukibBaselineManifest;
}

export async function writeBaselineManifestArtifacts(input: {
  manifest: NukibBaselineManifest;
  diff?: BaselineDiff;
}): Promise<{ manifestPath: string; changelogPath?: string }> {
  await mkdir(GENERATED_BASELINE_DIR, { recursive: true });

  const safeDate = safeIsoForFilename(input.manifest.importedAt);
  const manifestPath = path.join(
    GENERATED_BASELINE_DIR,
    `baseline-manifest-${safeDate}.json`,
  );
  const content = `${JSON.stringify(input.manifest, null, 2)}\n`;

  await writeFile(manifestPath, content, "utf8");
  await writeFile(CURRENT_BASELINE_PATH, content, "utf8");
  await retainLastBaselineManifests(3);

  if (!input.diff) {
    return { manifestPath };
  }

  const changelogPath = path.join(
    GENERATED_BASELINE_DIR,
    `baseline-changelog-${safeDate}.md`,
  );
  await writeFile(changelogPath, `${renderBaselineDiffMarkdown(input.diff)}\n`, "utf8");

  return { manifestPath, changelogPath };
}

export async function listBaselineManifestPaths(): Promise<string[]> {
  try {
    const entries = await readdir(GENERATED_BASELINE_DIR);
    return entries
      .filter((entry) => /^baseline-manifest-.+\.json$/.test(entry))
      .sort()
      .map((entry) => path.join(GENERATED_BASELINE_DIR, entry));
  } catch (error) {
    if (isMissingFileError(error)) {
      return [];
    }

    throw error;
  }
}

export function safeIsoForFilename(iso: string): string {
  return iso.replace(/[:.]/g, "-");
}

async function retainLastBaselineManifests(count: number): Promise<void> {
  const manifestPaths = await listBaselineManifestPaths();
  const extra = manifestPaths.slice(0, Math.max(0, manifestPaths.length - count));

  await Promise.all(extra.map((filePath) => unlink(filePath)));
}

function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}
