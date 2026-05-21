import { createHash } from "node:crypto";

import type {
  BaselineDiff,
  NukibBaselineControl,
  NukibBaselineManifest,
} from "@/lib/compliance/nukib/types";

export async function computeFileSha256(buffer: Buffer): Promise<string> {
  return createHash("sha256").update(buffer).digest("hex");
}

export function generateManifest(
  controls: NukibBaselineControl[],
  sourceFile: string,
  sourceSha256: string,
): NukibBaselineManifest {
  const importedAt = new Date().toISOString();

  return {
    version: importedAt,
    sourceFile,
    sourceSha256,
    importedAt,
    controlCount: controls.length,
    controls,
  };
}

export function diffBaselines(
  previous: NukibBaselineManifest,
  next: NukibBaselineManifest,
): BaselineDiff {
  const previousActive = previous.controls.filter((control) => !control.archived);
  const nextActive = next.controls.filter((control) => !control.archived);
  const nextByReference = new Map(
    nextActive.map((control) => [control.exactReference, control]),
  );
  const consumedNextReferences = new Set<string>();
  const added: NukibBaselineControl[] = [];
  const removed: NukibBaselineControl[] = [];
  const modified: BaselineDiff["modified"] = [];
  const unchanged: NukibBaselineControl[] = [];

  for (const previousControl of previousActive) {
    const sameReferenceNext = nextByReference.get(previousControl.exactReference);

    if (sameReferenceNext) {
      consumedNextReferences.add(sameReferenceNext.exactReference);
      const changes = diffControlFields(previousControl, sameReferenceNext);

      if (changes.length > 0) {
        modified.push({
          previous: previousControl,
          next: sameReferenceNext,
          changes,
        });
      } else {
        unchanged.push(sameReferenceNext);
      }

      continue;
    }

    const similarNext = nextActive.find(
      (candidate) =>
        !consumedNextReferences.has(candidate.exactReference) &&
        textSimilarity(previousControl.text, candidate.text) > 0.8,
    );

    if (similarNext) {
      consumedNextReferences.add(similarNext.exactReference);
      const changes = diffControlFields(previousControl, similarNext);
      if (!changes.includes("reference")) {
        changes.unshift("reference");
      }

      modified.push({
        previous: previousControl,
        next: similarNext,
        changes,
      });
      continue;
    }

    removed.push({
      ...previousControl,
      archived: true,
    });
  }

  for (const nextControl of nextActive) {
    if (!consumedNextReferences.has(nextControl.exactReference)) {
      added.push(nextControl);
    }
  }

  return {
    added,
    removed,
    modified,
    unchanged,
  };
}

export function renderBaselineDiffMarkdown(diff: BaselineDiff): string {
  const lines = [
    "# Změny NÚKIB baseline",
    "",
    `- Přidáno: ${diff.added.length}`,
    `- Archivováno: ${diff.removed.length}`,
    `- Změněno: ${diff.modified.length}`,
    `- Beze změny: ${diff.unchanged.length}`,
    "",
  ];

  if (diff.added.length > 0) {
    lines.push("## Přidaná opatření", "");
    for (const control of diff.added) {
      lines.push(`- ${control.exactReference} — ${control.title}`);
    }
    lines.push("");
  }

  if (diff.removed.length > 0) {
    lines.push("## Archivovaná opatření", "");
    for (const control of diff.removed) {
      lines.push(`- ${control.exactReference} — ${control.title}`);
    }
    lines.push("");
  }

  if (diff.modified.length > 0) {
    lines.push("## Změněná opatření", "");
    for (const item of diff.modified) {
      lines.push(
        `- ${item.previous.exactReference} → ${item.next.exactReference}: ${item.changes.join(
          ", ",
        )}`,
      );
    }
    lines.push("");
  }

  return lines.join("\n");
}

export function hasBaselineDiffChanges(diff: BaselineDiff): boolean {
  return (
    diff.added.length > 0 ||
    diff.removed.length > 0 ||
    diff.modified.length > 0
  );
}

export function textSimilarity(first: string, second: string): number {
  const firstTokens = tokenize(first);
  const secondTokens = tokenize(second);

  if (firstTokens.size === 0 && secondTokens.size === 0) {
    return 1;
  }

  const intersection = new Set(
    [...firstTokens].filter((token) => secondTokens.has(token)),
  );
  const union = new Set([...firstTokens, ...secondTokens]);

  return union.size === 0 ? 0 : intersection.size / union.size;
}

function diffControlFields(
  previous: NukibBaselineControl,
  next: NukibBaselineControl,
): Array<"text" | "reference" | "tier" | "priority" | "deadline"> {
  const changes: Array<"text" | "reference" | "tier" | "priority" | "deadline"> =
    [];

  if (previous.text !== next.text) {
    changes.push("text");
  }

  if (previous.exactReference !== next.exactReference) {
    changes.push("reference");
  }

  if (previous.tier !== next.tier) {
    changes.push("tier");
  }

  if (previous.priority !== next.priority) {
    changes.push("priority");
  }

  if (serializeDeadline(previous) !== serializeDeadline(next)) {
    changes.push("deadline");
  }

  return changes;
}

function serializeDeadline(control: NukibBaselineControl): string {
  const dateValue = control.deadline.date as unknown;
  const date =
    dateValue instanceof Date
      ? dateValue.toISOString()
      : typeof dateValue === "string"
        ? dateValue
        : "";

  return JSON.stringify({
    raw: control.deadline.raw,
    type: control.deadline.type,
    date,
    relativeMonths: control.deadline.relativeMonths,
  });
}

function tokenize(value: string): Set<string> {
  return new Set(
    value
      .toLocaleLowerCase("cs-CZ")
      .normalize("NFKD")
      .replace(/\p{Diacritic}/gu, "")
      .split(/[^a-z0-9]+/i)
      .filter((token) => token.length > 2),
  );
}
