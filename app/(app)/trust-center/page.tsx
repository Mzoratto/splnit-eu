import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";
import { getLocale } from "next-intl/server";
import {
  CheckCircle2,
  ExternalLink,
  FileSignature,
  Globe2,
  XCircle,
} from "lucide-react";
import { DataModeNotice } from "@/components/app/data-mode-notice";
import { TrustCenterPreviewPanel } from "@/components/trust-center/trust-center-preview-panel";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { listOrgControlsForIndex } from "@/lib/db/queries/controls";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import {
  getTrustCenterClients,
  getTrustCenterSettings,
} from "@/lib/db/queries/trust-center";
import { evidence } from "@/lib/db/schema";
import { isLocalDemoDataEnabled } from "@/lib/demo-mode";
import { FLAGS, isFeatureEnabled } from "@/lib/features/flags";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";
import {
  approveTrustCenterRequestAction,
  declineTrustCenterRequestAction,
  updateTrustCenterSettingsAction,
} from "./actions";
import { ClientAccessSection } from "./client-access-section";

export const dynamic = "force-dynamic";
type DataMode = "demo" | "live" | "unavailable";

function getFallbackMode(): DataMode {
  return isLocalDemoDataEnabled() ? "demo" : "unavailable";
}

async function loadSettings() {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return {
      clientAccessClients: [],
      clientAccessEnabled: false,
      data: null,
      mode: getFallbackMode(),
      organisationLocale: null,
      organisationName: null,
      trustStats: null,
    };
  }

  const session = await auth();

  if (!session.orgId) {
    return {
      clientAccessClients: [],
      clientAccessEnabled: false,
      data: null,
      mode: getFallbackMode(),
      organisationLocale: null,
      organisationName: null,
      trustStats: null,
    };
  }

  try {
    const db = getDb();
    const [data, organisation, controls, evidenceRows, clientAccessEnabled] = await Promise.all([
      getTrustCenterSettings(session.orgId),
      getOrganisationByClerkOrgId(session.orgId),
      listOrgControlsForIndex(session.orgId),
      db
        .select({ value: sql<number>`count(*)::int` })
        .from(evidence)
        .where(eq(evidence.clerkOrgId, session.orgId)),
      isFeatureEnabled(session.orgId, FLAGS.CLIENT_TRUST_DASHBOARD),
    ]);
    const clientAccessClients =
      clientAccessEnabled && data.trustCenter
        ? await getTrustCenterClients(data.trustCenter.id)
        : [];
    const trustRelevantControls = controls.filter(
      (control) =>
        control.scopeStatus !== "out_of_scope" &&
        control.status !== "not_applicable",
    );

    return {
      clientAccessClients,
      clientAccessEnabled,
      data,
      mode: "live" as const,
      organisationLocale: organisation?.locale ?? null,
      organisationName: organisation?.name ?? null,
      trustStats: {
        evidenceCount: evidenceRows[0]?.value ?? 0,
        passedControls: trustRelevantControls.filter((control) => control.status === "pass").length,
        totalControls: trustRelevantControls.length,
      },
    };
  } catch {
    return {
      clientAccessClients: [],
      clientAccessEnabled: false,
      data: null,
      mode: "unavailable" as const,
      organisationLocale: null,
      organisationName: null,
      trustStats: null,
    };
  }
}

function formatDate(
  value: Date | string | null | undefined,
  locale: Locale,
  emptyLabel: string,
) {
  if (!value) {
    return emptyLabel;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function TrustCenterSettingsPage() {
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const {
    clientAccessClients,
    clientAccessEnabled,
    data,
    mode,
    organisationLocale,
    organisationName,
    trustStats,
  } = await loadSettings();
  const locale = normalizeLocale(organisationLocale) ?? requestLocale;
  const messages = getMessagesForLocale(locale);
  const copy = messages.trustCenterSettings;
  const notice =
    mode === "demo"
      ? {
          body: messages.appDataNotice.demoBody,
          title: messages.appDataNotice.demoTitle,
        }
      : mode === "unavailable"
        ? {
            body: messages.appDataNotice.unavailableBody,
            title: messages.appDataNotice.unavailableTitle,
          }
        : null;
  const trustCenter = data?.trustCenter ?? null;
  const visibleFrameworks = trustCenter?.visibleFrameworks ?? [];
  const enrolledFrameworks =
    data?.frameworks.length
      ? data.frameworks
      : mode === "demo"
        ? FRAMEWORK_LIBRARY.slice(0, 4).map((framework, index) => ({
            id: framework.slug,
            nameCs: framework.nameCs,
            nameEn: framework.nameEn,
            regulator: framework.regulator,
            score: [72, 64, 81, 55][index] ?? null,
            slug: framework.slug,
            status: "active",
          }))
        : [];
  const subdomain = trustCenter?.subdomain ?? (mode === "demo" ? "demo" : "");
  const publicUrl = subdomain && trustCenter?.isPublic ? `/trust/${subdomain}` : null;
  const clientAccessPublicUrl = subdomain && trustCenter?.isPublic
    ? `https://splnit.eu/trust/${subdomain}`
    : null;
  const liveStats = {
    accessRequests: data?.requests.length ?? 0,
    lastUpdatedLabel: formatDate(
      trustCenter?.lastUpdated,
      locale,
      copy.notPublished,
    ),
    publishLabel: trustCenter?.isPublic ? copy.published : copy.privatePreview,
    evidenceCount: trustStats?.evidenceCount ?? 0,
    passedControls: trustStats?.passedControls ?? 0,
    totalControls: trustStats?.totalControls ?? 0,
    visibleFrameworks: visibleFrameworks.length,
  };
  const canMutate = mode === "live" && Boolean(data);

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            {copy.eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            {copy.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/64">
            {copy.subtitle}
          </p>
        </div>
        {publicUrl ? (
          <Link
            href={publicUrl}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted"
          >
            {copy.openPublicPage}
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium text-foreground/50">
            {copy.publicPageUnavailable}
          </span>
        )}
      </div>

      {notice ? <DataModeNotice body={notice.body} title={notice.title} /> : null}

      <TrustCenterPreviewPanel
        organisationName={organisationName ?? copy.organisationFallback}
        publicUrl={publicUrl}
        liveStats={liveStats}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <section className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">{copy.configuration}</h2>
          </div>
          <form action={updateTrustCenterSettingsAction} className="mt-5 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm">
                {copy.publicSlug}
                <input
                  name="subdomain"
                  defaultValue={subdomain}
                  disabled={!canMutate}
                  className="rounded-md border border-border bg-background px-3 py-2"
                />
              </label>
              <label className="grid gap-2 text-sm">
                {copy.accentColour}
                <input
                  name="accentColor"
                  defaultValue={trustCenter?.accentColor ?? "#1b7f5a"}
                  disabled={!canMutate}
                  type="color"
                  className="h-10 rounded-md border border-border bg-background px-2 py-1"
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-md border border-border px-3 py-3 text-sm">
                <input
                  name="isPublic"
                  type="checkbox"
                  defaultChecked={trustCenter?.isPublic ?? false}
                  disabled={!canMutate}
                />
                {copy.publish}
              </label>
              <label className="flex items-center gap-3 rounded-md border border-border px-3 py-3 text-sm">
                <input
                  name="ndaRequired"
                  type="checkbox"
                  defaultChecked={trustCenter?.ndaRequired ?? false}
                  disabled={!canMutate}
                />
                {copy.requireApprovedDocumentAccess}
              </label>
              <label className="flex items-center gap-3 rounded-md border border-border px-3 py-3 text-sm">
                <input
                  name="showFrameworkDrilldown"
                  type="checkbox"
                  defaultChecked={trustCenter?.showFrameworkDrilldown ?? true}
                  disabled={!canMutate}
                />
                {copy.enableFrameworkDetail}
              </label>
              <label className="flex items-center gap-3 rounded-md border border-border px-3 py-3 text-sm">
                <input
                  name="showFrameworkPercentages"
                  type="checkbox"
                  defaultChecked={trustCenter?.showFrameworkPercentages ?? true}
                  disabled={!canMutate}
                />
                {copy.showPercentageScores}
              </label>
            </div>
            <div>
              <p className="text-sm font-medium">{copy.visibleFrameworks}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {enrolledFrameworks.length ? (
                  enrolledFrameworks.map((framework) => (
                    <label
                      key={framework.slug}
                      className="flex items-start gap-3 rounded-md border border-border px-3 py-3 text-sm"
                    >
                      <input
                        name="visibleFrameworks"
                        type="checkbox"
                        value={framework.slug}
                        defaultChecked={
                          visibleFrameworks.length === 0 ||
                          visibleFrameworks.includes(framework.slug)
                        }
                        disabled={!canMutate}
                      />
                      <span>
                        <span className="block font-medium">
                          {locale === "cs-CZ" ? framework.nameCs : framework.nameEn}
                        </span>
                        <span className="text-xs text-foreground/56">
                          {framework.regulator ?? copy.regulatorEmpty} ·{" "}
                          {copy.scoreLabel} {framework.score ?? 0}%
                        </span>
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="rounded-md border border-border px-3 py-3 text-sm text-foreground/58">
                    {copy.visibleFrameworksEmpty}
                  </p>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={!canMutate}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copy.saveSettings}
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-border bg-surface">
          <div className="flex items-center gap-2 border-b border-border p-5">
            <FileSignature className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">{copy.requestsTitle}</h2>
          </div>
          <div className="divide-y divide-border">
            {data?.requests.length ? (
              data.requests.map((request) => (
                <article
                  key={request.id}
                  className="grid gap-4 p-5 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{request.email}</p>
                      <span className="rounded-md bg-surface-muted px-2 py-1 text-xs">
                        {copy.requestStatuses[
                          request.status as keyof typeof copy.requestStatuses
                        ] ?? request.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-foreground/58">
                      {request.company ?? copy.companyEmpty} · {copy.created}{" "}
                      {formatDate(request.createdAt, locale, copy.never)}
                    </p>
                    <p className="mt-1 text-sm text-foreground/58">
                      {copy.accessExpires} {formatDate(request.expiresAt, locale, copy.never)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <form
                      action={approveTrustCenterRequestAction.bind(null, request.id)}
                    >
                      <button
                        type="submit"
                        disabled={request.status === "approved"}
                        className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {copy.approve}
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </form>
                    <form
                      action={declineTrustCenterRequestAction.bind(null, request.id)}
                    >
                      <button
                        type="submit"
                        disabled={request.status === "declined"}
                        className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-danger hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {copy.decline}
                        <XCircle className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </form>
                  </div>
                </article>
              ))
            ) : (
              <p className="p-5 text-sm text-foreground/58">
                {copy.requestsEmpty}
              </p>
            )}
          </div>
        </section>
      </div>

      {clientAccessEnabled ? (
        <ClientAccessSection
          clients={clientAccessClients.map((client) => ({
            accessToken: client.accessToken,
            clientName: client.clientName,
            id: client.id,
            lastViewedAt: client.lastViewedAt?.toISOString() ?? null,
            viewCount: client.viewCount,
            visibleFrameworks: client.visibleFrameworks,
          }))}
          enabled={Boolean(trustCenter?.isPublic)}
          frameworks={enrolledFrameworks.map((framework) => ({
            name: locale === "cs-CZ" ? framework.nameCs : framework.nameEn,
            regulator: framework.regulator,
            score: framework.score,
            slug: framework.slug,
          }))}
          publicUrl={clientAccessPublicUrl}
        />
      ) : null}
    </section>
  );
}
