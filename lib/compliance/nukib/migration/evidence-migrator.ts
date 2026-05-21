import type { BaselineDiff } from "@/lib/compliance/nukib/types";
import { textSimilarity } from "@/lib/compliance/nukib/versioning/version-manager";

export interface MigrationPlan {
  autoMapped: Array<{ oldControlKey: string; newControlKey: string }>;
  requiresReview: Array<{ oldControlKey: string; reason: string }>;
  archived: Array<{ oldControlKey: string; archivedAt: string }>;
}

export function planEvidenceMigration(
  diff: BaselineDiff,
  existingControlKeys: string[],
): MigrationPlan {
  const existing = new Set(existingControlKeys);
  const archivedAt = new Date().toISOString();
  const autoMapped: MigrationPlan["autoMapped"] = [];
  const requiresReview: MigrationPlan["requiresReview"] = [];
  const archived: MigrationPlan["archived"] = [];

  for (const control of diff.unchanged) {
    const key = resolveExistingControlKey(control.exactReference, existing);
    if (key) {
      autoMapped.push({
        oldControlKey: key,
        newControlKey: key,
      });
    }
  }

  for (const item of diff.modified) {
    const oldControlKey = resolveExistingControlKey(
      item.previous.exactReference,
      existing,
    );
    if (!oldControlKey) {
      continue;
    }

    const newControlKey = controlKeyFromReference(item.next.exactReference);
    const similarEnough = textSimilarity(item.previous.text, item.next.text) > 0.8;
    const referenceChanged = item.previous.exactReference !== item.next.exactReference;

    if (!referenceChanged && similarEnough) {
      autoMapped.push({
        oldControlKey,
        newControlKey,
      });
    } else {
      requiresReview.push({
        oldControlKey,
        reason: referenceChanged
          ? "Změnila se právní reference nebo význam opatření."
          : "Text opatření se významně změnil.",
      });
    }
  }

  for (const control of diff.removed) {
    const oldControlKey = resolveExistingControlKey(control.exactReference, existing);
    if (oldControlKey) {
      archived.push({
        oldControlKey,
        archivedAt,
      });
    }
  }

  return {
    autoMapped,
    requiresReview,
    archived,
  };
}

export function renderMigrationPlanMarkdown(plan: MigrationPlan): string {
  const lines = [
    "# Plán migrace důkazů NÚKIB baseline",
    "",
    `- Automaticky mapováno: ${plan.autoMapped.length}`,
    `- Vyžaduje kontrolu: ${plan.requiresReview.length}`,
    `- Archivováno: ${plan.archived.length}`,
    "",
  ];

  if (plan.autoMapped.length > 0) {
    lines.push("## Automaticky mapováno", "");
    for (const item of plan.autoMapped) {
      lines.push(`- ${item.oldControlKey} → ${item.newControlKey}`);
    }
    lines.push("");
  }

  if (plan.requiresReview.length > 0) {
    lines.push("## Vyžaduje kontrolu", "");
    for (const item of plan.requiresReview) {
      lines.push(`- ${item.oldControlKey}: ${item.reason}`);
    }
    lines.push("");
  }

  if (plan.archived.length > 0) {
    lines.push("## Archivováno", "");
    for (const item of plan.archived) {
      lines.push(`- ${item.oldControlKey} (${item.archivedAt})`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function resolveExistingControlKey(
  exactReference: string,
  existingControlKeys: Set<string>,
): string | undefined {
  if (existingControlKeys.has(exactReference)) {
    return exactReference;
  }

  const generated = controlKeyFromReference(exactReference);
  return existingControlKeys.has(generated) ? generated : undefined;
}

function controlKeyFromReference(reference: string): string {
  return reference
    .toLocaleLowerCase("cs-CZ")
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/§/g, "paragraf")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
