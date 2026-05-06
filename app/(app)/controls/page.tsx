import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { DataModeNotice } from "@/components/app/data-mode-notice";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill, type StatusPillTone } from "@/components/app/status-pill";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import {
  getControlDisplayDescription,
  getControlDisplayTitle,
} from "@/lib/controls/localization";
import { CONTROL_LIBRARY } from "@/lib/controls/library";
import { hasDatabaseUrl } from "@/lib/db";
import { listOrgControlsForIndex } from "@/lib/db/queries/controls";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";

type ControlsCopy = ReturnType<typeof getMessagesForLocale>["controlsPage"];
type OrgControl = Awaited<ReturnType<typeof listOrgControlsForIndex>>[number];

async function loadControlsIndexData() {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return { controls: [], mode: "unavailable" as const, organisationLocale: null };
  }

  const session = await auth();

  if (!session.orgId) {
    return { controls: [], mode: "unavailable" as const, organisationLocale: null };
  }

  try {
    const [controls, organisation] = await Promise.all([
      listOrgControlsForIndex(session.orgId),
      getOrganisationByClerkOrgId(session.orgId),
    ]);

    return {
      controls,
      mode: "live" as const,
      organisationLocale: organisation?.locale ?? null,
    };
  } catch {
    return { controls: [], mode: "unavailable" as const, organisationLocale: null };
  }
}

function getCategoryLabel(category: string, copy: ControlsCopy) {
  return copy.categories[category as keyof typeof copy.categories] ?? category;
}

function getStatusTone(status: string | null): StatusPillTone {
  if (status === "pass" || status === "not_applicable") {
    return "pass";
  }

  if (status === "fail") {
    return "fail";
  }

  if (status === "manual_review" || status === "warning") {
    return "warn";
  }

  return "neutral";
}

function getStatusLabel(status: string | null, copy: ControlsCopy) {
  if (!status) {
    return copy.statuses.unknown;
  }

  return copy.statuses[status as keyof typeof copy.statuses] ?? status;
}

function getFrameworkNames(control: OrgControl, locale: Locale) {
  return control.frameworks
    .map((framework) => (locale === "cs-CZ" ? framework.nameCs : framework.nameEn))
    .join(", ");
}

export default async function ControlsPage() {
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const { controls, mode, organisationLocale } = await loadControlsIndexData();
  const locale = normalizeLocale(organisationLocale) ?? requestLocale;
  const messages = getMessagesForLocale(locale);
  const copy = messages.controlsPage;
  const notice =
    mode === "unavailable"
      ? {
          body: messages.appDataNotice.unavailableBody,
          title: messages.appDataNotice.unavailableTitle,
        }
      : null;

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={copy.index.eyebrow}
        title={copy.index.title}
        subtitle={copy.index.subtitle}
      />

      {notice ? <DataModeNotice body={notice.body} title={notice.title} /> : null}

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-medium">{copy.index.activeTitle}</h2>
          <p className="mt-1 text-sm text-foreground/58">
            {copy.index.activeSubtitle}
          </p>
        </div>
        {controls.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {controls.map((control) => (
              <article key={control.key} className="card interactive-card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs text-foreground/52">
                      {control.key}
                    </p>
                    <h2 className="mt-1 text-lg font-medium">
                      {getControlDisplayTitle(control, locale)}
                    </h2>
                    <p className="mt-1 text-xs text-foreground/52">
                      {getCategoryLabel(control.category ?? "unknown", copy)}
                    </p>
                  </div>
                  <StatusPill tone={getStatusTone(control.status)}>
                    {getStatusLabel(control.status, copy)}
                  </StatusPill>
                </div>
                <p className="mt-3 text-sm leading-6 text-foreground/64">
                  {getControlDisplayDescription(control, locale)}
                </p>
                <div className="mt-4 rounded-md bg-surface-muted p-3 text-sm">
                  <p className="text-xs text-foreground/52">
                    {copy.index.frameworksLabel}
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {getFrameworkNames(control, locale)}
                  </p>
                </div>
                <Link
                  href={`/controls/${control.key}`}
                  className="btn btn-secondary mt-5"
                >
                  {copy.index.openControl}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-border bg-surface p-5 text-sm text-foreground/58">
            {copy.index.emptyActive}
          </p>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-medium">{copy.index.libraryTitle}</h2>
          <p className="mt-1 text-sm text-foreground/58">
            {copy.index.librarySubtitle}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {CONTROL_LIBRARY.map((control) => (
            <article key={control.key} className="card interactive-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs text-foreground/52">
                    {control.key}
                  </p>
                  <h2 className="mt-1 text-lg font-medium">
                    {getControlDisplayTitle(control, locale)}
                  </h2>
                  <p className="mt-1 text-xs text-foreground/52">
                    {getCategoryLabel(control.category, copy)}
                  </p>
                </div>
                <ShieldCheck
                  className="h-5 w-5 text-primary"
                  aria-hidden="true"
                  strokeWidth={1.5}
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-foreground/64">
                {getControlDisplayDescription(control, locale)}
              </p>
              <div className="mt-4 inline-flex rounded-sm bg-surface-muted px-2 py-1 text-xs text-foreground/58">
                {control.isAutomated ? copy.index.automated : copy.index.manual}
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
