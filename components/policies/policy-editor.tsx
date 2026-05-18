import { FileText, Save } from "lucide-react";
import {
  generatePolicyAction,
  savePolicyDraftAction,
} from "@/app/(app)/policies/actions";
import type { PolicyDraftContent } from "@/lib/policies/policy-drafts";
import type { PolicyTemplateType } from "@/lib/policies/templates";

type PolicyEditorCopy = {
  bodyLabel: string;
  fieldsHelp: string;
  fieldsLabel: string;
  generateHelp: string;
  generatePdf: string;
  legalIdentifier: string;
  organisation: string;
  reviewDate: string;
  saveDraft: string;
  sectionTitleLabel: string;
  sourceCitation: string;
  statusDraft: string;
  title: string;
  titleLabel: string;
};

export function PolicyEditor({
  canGenerate,
  copy,
  draft,
  generateUnavailableReason,
  type,
}: {
  canGenerate: boolean;
  copy: PolicyEditorCopy;
  draft: PolicyDraftContent;
  generateUnavailableReason?: string;
  type: PolicyTemplateType;
}) {
  return (
    <form
      action={savePolicyDraftAction.bind(null, type)}
      className="rounded-lg border border-border bg-surface"
    >
      <div className="border-b border-border p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">
              {copy.statusDraft}
            </p>
            <h2 className="mt-2 text-lg font-semibold">{copy.title}</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted"
            >
              {copy.saveDraft}
              <Save className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="submit"
              formAction={generatePolicyAction.bind(null, type)}
              disabled={!canGenerate}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copy.generatePdf}
              <FileText className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        {!canGenerate ? (
          <p className="mt-3 text-sm text-foreground/58">
            {generateUnavailableReason ?? copy.generateHelp}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 border-b border-border p-5 md:grid-cols-2">
        <label className="block text-sm font-medium">
          {copy.titleLabel}
          <input
            className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            defaultValue={draft.title}
            maxLength={180}
            name="title"
            required
          />
        </label>
        <label className="block text-sm font-medium">
          {copy.reviewDate}
          <input
            className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            defaultValue={draft.reviewDate}
            name="reviewDate"
            required
            type="date"
          />
        </label>
        <div className="rounded-md border border-border bg-surface-muted p-3 text-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-foreground/58">
            {copy.organisation}
          </p>
          <p className="mt-1 font-medium">{draft.organisation.name}</p>
        </div>
        <div className="rounded-md border border-border bg-surface-muted p-3 text-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-foreground/58">
            {copy.legalIdentifier}
          </p>
          <p className="mt-1 font-medium">
            {draft.organisation.legalIdentifier ?? "N/A"}
          </p>
        </div>
        <div className="rounded-md border border-border bg-surface-muted p-3 text-sm md:col-span-2">
          <p className="text-xs uppercase tracking-[0.12em] text-foreground/58">
            {copy.sourceCitation}
          </p>
          <p className="mt-1 font-medium">{draft.sourceDocument.citation}</p>
        </div>
      </div>

      <div className="divide-y divide-border">
        {draft.sections.map((section, index) => (
          <fieldset key={`${section.title}-${index}`} className="space-y-4 p-5">
            <label className="block text-sm font-medium">
              {copy.sectionTitleLabel}
              <input
                className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                defaultValue={section.title}
                maxLength={180}
                name={`sectionTitle:${index}`}
                required
              />
            </label>
            <label className="block text-sm font-medium">
              {copy.bodyLabel}
              <textarea
                className="mt-2 min-h-32 w-full rounded-md border border-border bg-background px-3 py-2 text-sm leading-6 outline-none focus:border-primary"
                defaultValue={section.body}
                maxLength={5000}
                name={`sectionBody:${index}`}
              />
            </label>
            <label className="block text-sm font-medium">
              {copy.fieldsLabel}
              <textarea
                className="mt-2 min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm leading-6 outline-none focus:border-primary"
                defaultValue={section.fields.join("\n")}
                maxLength={1200}
                name={`sectionFields:${index}`}
              />
              <span className="mt-1 block text-xs text-foreground/58">
                {copy.fieldsHelp}
              </span>
            </label>
          </fieldset>
        ))}
      </div>
    </form>
  );
}
