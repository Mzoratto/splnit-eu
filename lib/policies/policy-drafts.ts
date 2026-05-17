import { z } from "zod";
import type { PolicySourceDocument } from "@/lib/policies/source-documents";
import type { PolicyTemplate } from "@/lib/policies/templates";

export type PolicyDraftSection = {
  title: string;
  body: string;
  fields: string[];
};

export type PolicyDraftContent = {
  generatedAt: string;
  organisation: {
    legalIdentifier: string | null;
    name: string;
    jurisdiction: string;
  };
  reviewDate: string;
  sections: PolicyDraftSection[];
  sourceDocument: PolicySourceDocument;
  status: "draft";
  templateType: string;
  title: string;
};

const policyDraftSectionSchema = z.object({
  body: z.string(),
  fields: z.array(z.string()),
  title: z.string(),
});

const policyDraftContentSchema = z.object({
  generatedAt: z.string(),
  organisation: z.object({
    jurisdiction: z.string(),
    legalIdentifier: z.string().nullable(),
    name: z.string(),
  }),
  reviewDate: z.string(),
  sections: z.array(policyDraftSectionSchema),
  sourceDocument: z.custom<PolicySourceDocument>(),
  status: z.literal("draft"),
  templateType: z.string(),
  title: z.string(),
});

function trimToNull(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizeMultilineFields(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/\r?\n/)
    .map((field) => field.trim())
    .filter(Boolean);
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function buildInitialPolicyDraftContent(input: {
  generatedAt: Date;
  organisation: {
    ico: string | null;
    name: string;
    primaryJurisdiction: string;
  };
  reviewDate: string;
  sourceDocument: PolicySourceDocument;
  template: PolicyTemplate;
}): PolicyDraftContent {
  return {
    generatedAt: input.generatedAt.toISOString(),
    organisation: {
      jurisdiction: input.organisation.primaryJurisdiction,
      legalIdentifier: input.organisation.ico,
      name: input.organisation.name,
    },
    reviewDate: input.reviewDate,
    sections: input.template.sections.map((section) => ({
      body: section.body ?? "",
      fields: section.fields ?? [],
      title: section.title,
    })),
    sourceDocument: input.sourceDocument,
    status: "draft",
    templateType: input.template.type,
    title: input.template.titleCs,
  };
}

export function parsePolicyDraftContent(
  content: Record<string, unknown> | null | undefined,
): PolicyDraftContent | null {
  const parsed = policyDraftContentSchema.safeParse(content);

  return parsed.success ? parsed.data : null;
}

export function parsePolicyDraftFormData(input: {
  currentDraft: PolicyDraftContent;
  formData: FormData;
}): PolicyDraftContent {
  const title = trimToNull(input.formData.get("title"));
  const reviewDate = trimToNull(input.formData.get("reviewDate"));

  if (!title) {
    throw new Error("Policy title is required.");
  }

  if (!isIsoDate(reviewDate)) {
    throw new Error("Review date must use YYYY-MM-DD format.");
  }

  return {
    ...input.currentDraft,
    reviewDate,
    sections: input.currentDraft.sections.map((section, index) => {
      const sectionTitle = trimToNull(input.formData.get(`sectionTitle:${index}`));
      return {
        body: trimToNull(input.formData.get(`sectionBody:${index}`)),
        fields: normalizeMultilineFields(input.formData.get(`sectionFields:${index}`)),
        title: sectionTitle || section.title,
      };
    }),
    status: "draft",
    title,
  };
}

export function buildPolicyTemplateFromDraft(input: {
  draft: PolicyDraftContent;
  template: PolicyTemplate;
}): PolicyTemplate {
  return {
    ...input.template,
    reviewStatus: "draft",
    sections: input.draft.sections.map((section) => ({
      body: section.body,
      fields: section.fields,
      title: section.title,
    })),
    titleCs: input.draft.title,
  };
}
