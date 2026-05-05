import { writeFile } from "node:fs/promises";
import {
  listDraftPolicyTemplatesForReview,
  resolvePolicyTemplate,
} from "../lib/policies/resolve-template";
import type { PolicyTemplate } from "../lib/policies/templates";

function getArg(name: string) {
  const inlineValue = process.argv.find((arg) => arg.startsWith(`${name}=`));

  if (inlineValue) {
    return inlineValue.slice(name.length + 1) || null;
  }

  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

function escapeMarkdownTable(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
}

function renderTemplate(template: PolicyTemplate) {
  const lines = [
    `## ${template.titleCs}`,
    "",
    `- Family: \`${template.templateFamily}\``,
    `- Type: \`${template.type}\``,
    `- Jurisdiction: \`${template.jurisdiction}\``,
    `- Locale: \`${template.locale}\``,
    `- Review status: \`${template.reviewStatus ?? "reviewed"}\``,
    `- Source document: \`${template.sourceDocument}\``,
    `- Description: ${template.description}`,
    "",
    "Control keys:",
    "",
    ...template.controlKeys.map((key) => `- \`${key}\``),
    "",
    "Sections:",
    "",
  ];

  for (const [index, section] of template.sections.entries()) {
    lines.push(`### ${index + 1}. ${section.title}`, "");

    if (section.body) {
      lines.push(section.body, "");
    }

    if (section.fields?.length) {
      lines.push("| Field |", "| --- |");
      lines.push(...section.fields.map((field) => `| ${escapeMarkdownTable(field)} |`));
      lines.push("");
    }
  }

  return lines.join("\n");
}

function renderReviewPackage(templates: PolicyTemplate[]) {
  const generatedAt = new Date().toISOString();

  return [
    "# Italian Policy Template Review - Batch 1",
    "",
    `Generated: ${generatedAt}`,
    "",
    "Purpose: advisor/legal review of draft Italian templates. These templates are not customer-facing until their `reviewStatus` is changed from `draft` to `reviewed` in code after explicit approval.",
    "",
    "Reviewer question: is this template suitable as an Italian SMB starting point for the stated document family, and are the legal/regulatory references accurate enough for customer use?",
    "",
    "Allowed reviewer decisions:",
    "",
    "- `approved`: template can be promoted to customer-facing reviewed status.",
    "- `needs_changes`: template is directionally useful but needs edits before customer use.",
    "- `reject`: template should not be used; re-draft from scratch.",
    "",
    "## Summary",
    "",
    `- Total draft templates: ${templates.length}`,
    ...templates.map(
      (template) => `- ${template.templateFamily}: ${template.titleCs}`,
    ),
    "",
    "## Review Decisions",
    "",
    "| Template family | Reviewer decision | Reviewer note |",
    "| --- | --- | --- |",
    ...templates.map(
      (template) => `| ${template.templateFamily} |  |  |`,
    ),
    "",
    "## Draft Templates",
    "",
    ...templates.map(renderTemplate),
    "",
  ].join("\n");
}

async function main() {
  const outputPath =
    getArg("--output") ??
    "docs/legal-reviews/italian-policy-template-batch-1-review.md";
  const templates = listDraftPolicyTemplatesForReview({
    jurisdiction: "IT",
    locale: "it-IT",
  });

  if (templates.length === 0) {
    throw new Error("No Italian draft policy templates found for review.");
  }

  for (const template of templates) {
    const resolved = resolvePolicyTemplate(template.templateFamily, {
      locale: "it-IT",
      primaryJurisdiction: "IT",
    });

    if (resolved.reviewStatus === "draft") {
      throw new Error(
        `${template.templateFamily} resolved to the draft Italian template. Draft guard is broken.`,
      );
    }
  }

  await writeFile(outputPath, renderReviewPackage(templates));
  console.log(`Wrote ${templates.length} draft templates to ${outputPath}.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
