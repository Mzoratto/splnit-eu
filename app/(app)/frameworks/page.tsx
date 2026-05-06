import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import { DataModeNotice } from "@/components/app/data-mode-notice";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill, type StatusPillTone } from "@/components/app/status-pill";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { hasDatabaseUrl } from "@/lib/db";
import { listOrgFrameworksForIndex } from "@/lib/db/queries/frameworks";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import {
  getFrameworkDisplayDescription,
  getFrameworkDisplayName,
  getFrameworkDisplayRegulator,
} from "@/lib/frameworks/localization";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";

type EnrolledFramework = Awaited<ReturnType<typeof listOrgFrameworksForIndex>>[number];

async function loadFrameworkIndexData() {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return { enrolledFrameworks: [], mode: "unavailable" as const, organisationLocale: null };
  }

  const session = await auth();

  if (!session.orgId) {
    return { enrolledFrameworks: [], mode: "unavailable" as const, organisationLocale: null };
  }

  try {
    const [enrolledFrameworks, organisation] = await Promise.all([
      listOrgFrameworksForIndex(session.orgId),
      getOrganisationByClerkOrgId(session.orgId),
    ]);

    return {
      enrolledFrameworks,
      mode: "live" as const,
      organisationLocale: organisation?.locale ?? null,
    };
  } catch {
    return { enrolledFrameworks: [], mode: "unavailable" as const, organisationLocale: null };
  }
}

function statusTone(status: string | null, score: number | null): StatusPillTone {
  if (status === "completed") {
    return "pass";
  }

  if (status === "setup" || status === "in_progress") {
    return "warn";
  }

  if (typeof score === "number") {
    if (score >= 80) {
      return "pass";
    }
    if (score >= 60) {
      return "warn";
    }
  }

  return "neutral";
}

function statusLabel(status: string | null) {
  return status ? status.replaceAll("_", " ").toUpperCase() : "PENDING";
}

function FrameworkCard({
  framework,
  locale,
}: {
  framework: EnrolledFramework;
  locale: Locale;
}) {
  const seedFramework = FRAMEWORK_LIBRARY.find((item) => item.slug === framework.slug);
  const displayFramework = seedFramework ?? framework;
  const copy = getMessagesForLocale(locale).frameworks;
  const score = framework.score ?? 0;

  return (
    <article className="card interactive-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-foreground/58">
            {getFrameworkDisplayRegulator(
              displayFramework,
              locale,
              copy.regulators,
            )}
          </p>
          <h2 className="mt-1 text-lg font-medium">
            {getFrameworkDisplayName(displayFramework, locale)}
          </h2>
        </div>
        <StatusPill tone={statusTone(framework.status, framework.score)}>
          {statusLabel(framework.status)}
        </StatusPill>
      </div>
      <p className="mt-3 min-h-16 text-sm leading-6 text-foreground/64">
        {getFrameworkDisplayDescription(
          displayFramework,
          locale,
          copy.descriptions,
        )}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 rounded-md bg-surface-muted p-3 text-sm">
        <div>
          <p className="text-xs text-foreground/52">{copy.index.scoreLabel}</p>
          <p className="mt-1 font-mono text-lg font-medium">{score}%</p>
        </div>
        <div>
          <p className="text-xs text-foreground/52">{copy.index.statusLabel}</p>
          <p className="mt-1 text-sm font-medium">{statusLabel(framework.status)}</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href={`/frameworks/${framework.slug}`} className="btn btn-secondary">
          {copy.index.open}
          <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
        </Link>
        <Link
          href={`/frameworks/${framework.slug}/setup`}
          className="btn btn-primary"
        >
          {copy.index.assessment}
          <ClipboardCheck className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
        </Link>
      </div>
    </article>
  );
}

export default async function FrameworksPage() {
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const { enrolledFrameworks, mode, organisationLocale } =
    await loadFrameworkIndexData();
  const locale = normalizeLocale(organisationLocale) ?? requestLocale;
  const messages = getMessagesForLocale(locale);
  const copy = messages.frameworks;
  const enrolledSlugs = new Set(enrolledFrameworks.map((framework) => framework.slug));
  const availableFrameworks = FRAMEWORK_LIBRARY.filter(
    (framework) => !enrolledSlugs.has(framework.slug),
  );
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
          <h2 className="text-lg font-medium">{copy.index.enrolledTitle}</h2>
          <p className="mt-1 text-sm text-foreground/58">
            {copy.index.enrolledSubtitle}
          </p>
        </div>
        {enrolledFrameworks.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {enrolledFrameworks.map((framework) => (
              <FrameworkCard
                key={framework.slug}
                framework={framework}
                locale={locale}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-border bg-surface p-5 text-sm text-foreground/58">
            {copy.index.emptyEnrolled}
          </p>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-medium">{copy.index.availableTitle}</h2>
          <p className="mt-1 text-sm text-foreground/58">
            {copy.index.availableSubtitle}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {availableFrameworks.map((framework) => (
            <article key={framework.slug} className="card interactive-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-foreground/58">
                    {getFrameworkDisplayRegulator(
                      framework,
                      locale,
                      copy.regulators,
                    )}
                  </p>
                  <h2 className="mt-1 text-lg font-medium">
                    {getFrameworkDisplayName(framework, locale)}
                  </h2>
                </div>
                <ClipboardCheck
                  className="h-5 w-5 text-primary"
                  aria-hidden="true"
                  strokeWidth={1.5}
                />
              </div>
              <p className="mt-3 min-h-16 text-sm leading-6 text-foreground/64">
                {getFrameworkDisplayDescription(
                  framework,
                  locale,
                  copy.descriptions,
                )}
              </p>
              <Link
                href={`/frameworks/${framework.slug}/setup`}
                className="btn btn-secondary mt-5"
              >
                {copy.index.setup}
                <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
