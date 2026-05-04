import { hasDatabaseUrl } from "@/lib/db";
import {
  getSourceDocumentByFilename,
  listSourceDocumentsByFilenames,
  type SourceDocument,
} from "@/lib/db/queries/source-documents";
import type { PolicyTemplate } from "@/lib/policies/templates";

export type PolicySourceDocument = {
  citation: string;
  filename: string;
  title: string;
  url: string | null;
};

function toPolicySourceDocument(
  sourceDocument: SourceDocument,
): PolicySourceDocument {
  return {
    citation: sourceDocument.citation,
    filename: sourceDocument.filename ?? "",
    title: sourceDocument.title,
    url: sourceDocument.url,
  };
}

export function getFallbackPolicySourceDocument(
  template: PolicyTemplate,
): PolicySourceDocument {
  return {
    citation: template.description,
    filename: template.sourceDocument,
    title: template.titleCs,
    url: null,
  };
}

export async function resolvePolicySourceDocument(
  template: PolicyTemplate,
): Promise<PolicySourceDocument> {
  if (!hasDatabaseUrl()) {
    return getFallbackPolicySourceDocument(template);
  }

  try {
    const sourceDocument = await getSourceDocumentByFilename(
      template.sourceDocument,
    );

    return sourceDocument
      ? toPolicySourceDocument(sourceDocument)
      : getFallbackPolicySourceDocument(template);
  } catch {
    return getFallbackPolicySourceDocument(template);
  }
}

export async function resolvePolicySourceDocuments(
  templates: PolicyTemplate[],
): Promise<Map<string, PolicySourceDocument>> {
  const fallbacks = new Map(
    templates.map((template) => [
      template.sourceDocument,
      getFallbackPolicySourceDocument(template),
    ]),
  );

  if (!hasDatabaseUrl() || templates.length === 0) {
    return fallbacks;
  }

  try {
    const rows = await listSourceDocumentsByFilenames(
      templates.map((template) => template.sourceDocument),
    );

    for (const row of rows) {
      if (row.filename) {
        fallbacks.set(row.filename, toPolicySourceDocument(row));
      }
    }
  } catch {
    return fallbacks;
  }

  return fallbacks;
}
