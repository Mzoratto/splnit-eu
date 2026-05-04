import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight, Download, FileText } from "lucide-react";
import { generatePolicyAction } from "@/app/(app)/policies/actions";
import { hasDatabaseUrl } from "@/lib/db";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { listPoliciesForOrg } from "@/lib/db/queries/policies";
import { listResolvedPolicyTemplates } from "@/lib/policies/resolve-template";

async function loadPolicies() {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return {
      policies: [],
      templates: listResolvedPolicyTemplates(null),
    };
  }

  const session = await auth();

  if (!session.orgId) {
    return {
      policies: [],
      templates: listResolvedPolicyTemplates(null),
    };
  }

  try {
    const [organisation, policies] = await Promise.all([
      getOrganisationByClerkOrgId(session.orgId),
      listPoliciesForOrg(session.orgId),
    ]);

    return {
      policies,
      templates: listResolvedPolicyTemplates(organisation),
    };
  } catch {
    return {
      policies: [],
      templates: listResolvedPolicyTemplates(null),
    };
  }
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "bez data";
  }

  return new Intl.DateTimeFormat("cs-CZ").format(new Date(value));
}

export default async function PoliciesPage() {
  const { policies, templates } = await loadPolicies();
  const latestByType = new Map<string, (typeof policies)[number]>();

  for (const policy of policies) {
    if (!latestByType.has(policy.type)) {
      latestByType.set(policy.type, policy);
    }
  }

  return (
    <section className="space-y-6">
      <div className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
          Policy library
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">
          Compliance dokumenty
        </h1>
        <p className="mt-3 text-base leading-7 text-foreground/68">
          Šablony se vyplní údaji organizace, uloží jako PDF a připomenou roční přezkum.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((template) => {
          const latestPolicy = latestByType.get(template.type);

          return (
            <article
              key={template.type}
              className="rounded-lg border border-border bg-surface p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-foreground/58">
                    {template.sourceDocument}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">
                    {template.titleCs}
                  </h2>
                </div>
                <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <p className="mt-3 text-sm leading-6 text-foreground/64">
                {template.description}
              </p>
              {latestPolicy ? (
                <p className="mt-4 text-sm text-foreground/58">
                  Poslední verze: {latestPolicy.status} · přezkum{" "}
                  {formatDate(latestPolicy.expiresAt)}
                </p>
              ) : (
                <p className="mt-4 text-sm text-foreground/58">
                  Dokument zatím není vygenerovaný.
                </p>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/policies/${template.type}`}
                  className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted"
                >
                  Detail
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                {latestPolicy?.blobUrl ? (
                  <Link
                    href={`/api/policies/${latestPolicy.id}/download`}
                    className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted"
                  >
                    PDF
                    <Download className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : null}
                <form action={generatePolicyAction.bind(null, template.type)}>
                  <button
                    type="submit"
                    disabled={!process.env.BLOB_READ_WRITE_TOKEN}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Vygenerovat
                    <FileText className="h-4 w-4" aria-hidden="true" />
                  </button>
                </form>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
