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
type ScopeFilter = "in-scope" | "priority" | "gaps" | "out-of-scope";

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

function getScopeLabel(control: OrgControl, copy: ControlsCopy) {
  if (control.scopeStatus === "out_of_scope") {
    return copy.index.outOfScope;
  }

  if (control.scopeStatus === "not_applicable") {
    return getStatusLabel("not_applicable", copy);
  }

  return copy.index.scopeLabel;
}

function normalizeScopeFilter(value: string | string[] | undefined): ScopeFilter {
  const raw = Array.isArray(value) ? value[0] : value;

  if (raw === "priority" || raw === "gaps" || raw === "out-of-scope") {
    return raw;
  }

  return "in-scope";
}

function filterControlsByScope(controls: OrgControl[], scopeFilter: ScopeFilter) {
  if (scopeFilter === "priority") {
    return controls.filter((control) => control.isIntakePriority);
  }

  if (scopeFilter === "gaps") {
    return controls.filter(
      (control) =>
        control.scopeStatus !== "out_of_scope" &&
        control.scopeStatus !== "not_applicable" &&
        ["fail", "manual_review", "unknown", null].includes(control.status),
    );
  }

  if (scopeFilter === "out-of-scope") {
    return controls.filter(
      (control) => control.scopeStatus === "out_of_scope" || control.scopeStatus === "not_applicable",
    );
  }

  return controls.filter(
    (control) => control.scopeStatus !== "out_of_scope" && control.scopeStatus !== "not_applicable",
  );
}

export default async function ControlsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const { controls, mode, organisationLocale } = await loadControlsIndexData();
  const locale = normalizeLocale(organisationLocale) ?? requestLocale;
  const messages = getMessagesForLocale(locale);
  const copy = messages.controlsPage;
  const scopeFilter = normalizeScopeFilter(resolvedSearchParams.scope);
  const filteredControls = filterControlsByScope(controls, scopeFilter);
  const scopeFilters: { href: string; label: string; value: ScopeFilter }[] = [
    { href: "/controls", label: copy.index.allScope, value: "in-scope" },
    { href: "/controls?scope=priority", label: copy.index.priorityScope, value: "priority" },
    { href: "/controls?scope=gaps", label: copy.index.gapScope, value: "gaps" },
    { href: "/controls?scope=out-of-scope", label: copy.index.outOfScope, value: "out-of-scope" },
  ];
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
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs font-medium text-foreground/52">
            {copy.index.scopeFiltersTitle}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {scopeFilters.map((filter) => (
              <Link
                key={filter.value}
                href={filter.href}
                className={
                  filter.value === scopeFilter
                    ? "rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                    : "rounded-sm border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground/72 hover:text-foreground"
                }
              >
                {filter.label}
              </Link>
            ))}
          </div>
        </div>
        {controls.length ? (
          filteredControls.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredControls.map((control) => (
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
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-sm bg-surface-muted px-2 py-1 text-xs font-medium text-foreground/64">
                      {getScopeLabel(control, copy)}
                    </span>
                    {control.isIntakePriority ? (
                      <span className="rounded-sm bg-status-fail/10 px-2 py-1 text-xs font-medium text-status-fail">
                        {copy.index.priorityLabel}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-foreground/64">
                    {getControlDisplayDescription(control, locale)}
                  </p>
                  {control.intakeRationale ? (
                    <div className="mt-4 rounded-md border border-border bg-background p-3 text-sm">
                      <p className="text-xs text-foreground/52">
                        {copy.index.rationaleLabel}
                      </p>
                      <p className="mt-1 leading-6 text-foreground/64">
                        {control.intakeRationale}
                      </p>
                    </div>
                  ) : null}
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
            <div className="rounded-lg border border-border bg-surface p-5">
              <p className="text-sm leading-6 text-foreground/64">
                {copy.index.emptyFiltered}
              </p>
            </div>
          )
        ) : (
          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="text-sm leading-6 text-foreground/64">
              {copy.index.emptyActive}
            </p>
            <Link href="/frameworks" className="btn btn-primary mt-4">
              {copy.index.emptyActiveAction}
              <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            </Link>
          </div>
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
