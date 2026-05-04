import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { generatePolicyAction } from "@/app/(app)/policies/actions";
import { hasDatabaseUrl } from "@/lib/db";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { listPoliciesForOrg } from "@/lib/db/queries/policies";
import { resolvePolicyTemplate } from "@/lib/policies/resolve-template";
import {
  POLICY_TEMPLATE_TYPES,
  type PolicyTemplateType,
} from "@/lib/policies/templates";

function isPolicyTemplateType(type: string): type is PolicyTemplateType {
  return POLICY_TEMPLATE_TYPES.includes(type as PolicyTemplateType);
}

async function loadPolicyDetail(type: PolicyTemplateType) {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return {
      policies: [],
      template: resolvePolicyTemplate(type, null),
    };
  }

  const session = await auth();

  if (!session.orgId) {
    return {
      policies: [],
      template: resolvePolicyTemplate(type, null),
    };
  }

  try {
    const [organisation, policies] = await Promise.all([
      getOrganisationByClerkOrgId(session.orgId),
      listPoliciesForOrg(session.orgId),
    ]);

    return {
      policies: policies.filter((policy) => policy.type === type),
      template: resolvePolicyTemplate(type, organisation),
    };
  } catch {
    return {
      policies: [],
      template: resolvePolicyTemplate(type, null),
    };
  }
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "bez data";
  }

  return new Intl.DateTimeFormat("cs-CZ").format(new Date(value));
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

  const { policies, template } = await loadPolicyDetail(type);

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            {template.sourceDocument}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            {template.titleCs}
          </h1>
          <p className="mt-3 text-base leading-7 text-foreground/68">
            {template.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/policies"
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Knihovna
          </Link>
          <form action={generatePolicyAction.bind(null, template.type)}>
            <button
              type="submit"
              disabled={!process.env.BLOB_READ_WRITE_TOKEN}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Vygenerovat PDF
              <FileText className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-lg border border-border bg-surface">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-semibold">Sekce dokumentu</h2>
          </div>
          <div className="divide-y divide-border">
            {template.sections.map((section) => (
              <article key={section.title} className="p-5">
                <h3 className="font-medium">{section.title}</h3>
                {section.body ? (
                  <p className="mt-2 text-sm leading-6 text-foreground/64">
                    {section.body}
                  </p>
                ) : null}
                {section.fields ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {section.fields.map((field) => (
                      <span
                        key={field}
                        className="rounded-md bg-surface-muted px-2 py-1 text-xs text-foreground/64"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-semibold">Vygenerované verze</h2>
          </div>
          <div className="divide-y divide-border">
            {policies.length > 0 ? (
              policies.map((policy) => (
                <article key={policy.id} className="p-5">
                  <p className="font-medium">{policy.titleCs}</p>
                  <p className="mt-1 text-sm text-foreground/58">
                    {policy.status} · přezkum {formatDate(policy.expiresAt)}
                  </p>
                  {policy.blobUrl ? (
                    <Link
                      href={`/api/policies/${policy.id}/download`}
                      className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-surface-muted"
                    >
                      Stáhnout PDF
                      <Download className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  ) : null}
                </article>
              ))
            ) : (
              <p className="p-5 text-sm text-foreground/58">
                Zatím není vygenerovaná žádná verze.
              </p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
