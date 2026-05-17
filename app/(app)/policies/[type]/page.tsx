import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { PolicyEditor } from "@/components/policies/policy-editor";
import { hasDatabaseUrl } from "@/lib/db";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import {
  getLatestPolicyDraftForOrg,
  listPoliciesForOrg,
} from "@/lib/db/queries/policies";
import { getJurisdictionContext } from "@/lib/jurisdictions/context";
import {
  buildInitialPolicyDraftContent,
  parsePolicyDraftContent,
} from "@/lib/policies/policy-drafts";
import { resolvePolicyTemplate } from "@/lib/policies/resolve-template";
import { resolvePolicySourceDocument } from "@/lib/policies/source-documents";
import {
  POLICY_TEMPLATE_TYPES,
  type PolicyTemplateType,
} from "@/lib/policies/templates";
import {
  getPolicyStatusLabel,
  getPolicyUiCopy,
} from "@/lib/policies/ui-copy";

function isPolicyTemplateType(type: string): type is PolicyTemplateType {
  return POLICY_TEMPLATE_TYPES.includes(type as PolicyTemplateType);
}

function addYears(date: Date, years: number) {
  const nextDate = new Date(date);
  nextDate.setUTCFullYear(nextDate.getUTCFullYear() + years);
  return nextDate;
}

function formatIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function loadPolicyDetail(type: PolicyTemplateType) {
  const defaultContext = getJurisdictionContext("CZ", "cs-CZ");
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);
  const fallbackOrganisation = {
    ico: null,
    name: "Demo organisation",
    primaryJurisdiction: "CZ",
  };

  if (!clerkConfigured || !hasDatabaseUrl()) {
    const template = resolvePolicyTemplate(type, null);
    const sourceDocument = await resolvePolicySourceDocument(template);
    const generatedAt = new Date();

    return {
      context: defaultContext,
      draft: buildInitialPolicyDraftContent({
        generatedAt,
        organisation: fallbackOrganisation,
        reviewDate: formatIsoDate(addYears(generatedAt, 1)),
        sourceDocument,
        template,
      }),
      policies: [],
      sourceDocument,
      template,
    };
  }

  const session = await auth();

  if (!session.orgId) {
    const template = resolvePolicyTemplate(type, null);
    const sourceDocument = await resolvePolicySourceDocument(template);
    const generatedAt = new Date();

    return {
      context: defaultContext,
      draft: buildInitialPolicyDraftContent({
        generatedAt,
        organisation: fallbackOrganisation,
        reviewDate: formatIsoDate(addYears(generatedAt, 1)),
        sourceDocument,
        template,
      }),
      policies: [],
      sourceDocument,
      template,
    };
  }

  try {
    const [organisation, policies, storedDraft] = await Promise.all([
      getOrganisationByClerkOrgId(session.orgId),
      listPoliciesForOrg(session.orgId),
      getLatestPolicyDraftForOrg({ clerkOrgId: session.orgId, type }),
    ]);
    const template = resolvePolicyTemplate(type, organisation);
    const sourceDocument = await resolvePolicySourceDocument(template);
    const generatedAt = new Date();
    const initialDraft = buildInitialPolicyDraftContent({
      generatedAt,
      organisation: organisation ?? fallbackOrganisation,
      reviewDate: formatIsoDate(addYears(generatedAt, 1)),
      sourceDocument,
      template,
    });

    return {
      context: organisation
        ? getJurisdictionContext(
            organisation.primaryJurisdiction,
            organisation.locale,
          )
        : defaultContext,
      draft: parsePolicyDraftContent(storedDraft?.content) ?? initialDraft,
      policies: policies.filter(
        (policy) => policy.type === type && Boolean(policy.blobUrl),
      ),
      sourceDocument,
      template,
    };
  } catch {
    const template = resolvePolicyTemplate(type, null);
    const sourceDocument = await resolvePolicySourceDocument(template);
    const generatedAt = new Date();

    return {
      context: defaultContext,
      draft: buildInitialPolicyDraftContent({
        generatedAt,
        organisation: fallbackOrganisation,
        reviewDate: formatIsoDate(addYears(generatedAt, 1)),
        sourceDocument,
        template,
      }),
      policies: [],
      sourceDocument,
      template,
    };
  }
}

function formatDate(
  value: Date | string | null | undefined,
  locale: string,
  emptyLabel: string,
) {
  if (!value) {
    return emptyLabel;
  }

  return new Intl.DateTimeFormat(locale).format(new Date(value));
}

export default async function PolicyDetailPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;

  if (!isPolicyTemplateType(type)) {
    notFound();
  }

  const { context, draft, policies, sourceDocument, template } =
    await loadPolicyDetail(type);
  const copy = getPolicyUiCopy(context.locale);

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            {sourceDocument.title}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            {template.titleCs}
          </h1>
          <p className="mt-3 text-base leading-7 text-foreground/68">
            {template.description}
          </p>
          <p className="mt-2 text-sm leading-6 text-foreground/58">
            {copy.detail.source}: {sourceDocument.citation}
          </p>
        </div>
        <Link
          href="/policies"
          className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {copy.actions.library}
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <PolicyEditor
          canGenerate={Boolean(process.env.BLOB_READ_WRITE_TOKEN)}
          copy={copy.editor}
          draft={draft}
          type={template.type as PolicyTemplateType}
        />

        <section className="rounded-lg border border-border bg-surface">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-semibold">
              {copy.detail.generatedVersions}
            </h2>
          </div>
          <div className="divide-y divide-border">
            {policies.length > 0 ? (
              policies.map((policy) => (
                <article key={policy.id} className="p-5">
                  <p className="font-medium">{policy.titleCs}</p>
                  <p className="mt-1 text-sm text-foreground/58">
                    {getPolicyStatusLabel(policy.status, context.locale)} ·{" "}
                    {copy.list.review}{" "}
                    {formatDate(
                      policy.expiresAt,
                      context.dateLocale,
                      copy.list.emptyDate,
                    )}
                  </p>
                  {policy.blobUrl ? (
                    <Link
                      href={`/api/policies/${policy.id}/download`}
                      className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-surface-muted"
                    >
                      {copy.actions.downloadPdf}
                      <Download className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  ) : null}
                </article>
              ))
            ) : (
              <p className="p-5 text-sm text-foreground/58">
                {copy.detail.emptyVersions}
              </p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
