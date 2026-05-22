import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { AgencySignupForm } from "@/app/(app)/agency/signup/signup-form";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale } from "@/i18n/routing";
import { getAgencyByClerkOrgId } from "@/lib/db/queries/agencies";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function AgencySignupPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session.userId) {
    redirect("/sign-in");
  }

  if (!session.orgId) {
    redirect("/dashboard");
  }

  const existingAgency = await getAgencyByClerkOrgId(session.orgId);

  if (existingAgency) {
    redirect("/agency/settings");
  }

  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const copy = getMessagesForLocale(requestLocale).agency.signup;
  const organisation = await getOrganisationByClerkOrgId(session.orgId);
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const canceled = getParam(resolvedSearchParams, "canceled") === "true";

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">
          {copy.eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">
          {copy.headline}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/64">
          {copy.subtitle}
        </p>
      </div>

      {canceled ? (
        <p className="max-w-xl rounded-md border border-border bg-surface p-3 text-sm text-foreground/70">
          {copy.canceled}
        </p>
      ) : null}

      <AgencySignupForm
        copy={copy.form}
        initialName={organisation?.name ?? copy.defaultName}
      />
    </section>
  );
}
