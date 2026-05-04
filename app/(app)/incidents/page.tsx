import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  ShieldAlert,
} from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill, type StatusPillTone } from "@/components/app/status-pill";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { hasDatabaseUrl } from "@/lib/db";
import {
  getIncidentForOrg,
  listIncidentsForOrg,
} from "@/lib/db/queries/incidents";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import {
  createIncidentAction,
  markIncidentReportedAction,
  updateIncidentStatusAction,
} from "./actions";

export const dynamic = "force-dynamic";

type Incident = Awaited<ReturnType<typeof listIncidentsForOrg>>[number];
type IncidentsCopy = ReturnType<typeof getMessagesForLocale>["incidents"];

async function loadIncidents(
  selectedIncidentId: string | undefined,
  requestLocale: Locale,
) {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return getDemoData(getMessagesForLocale(requestLocale).incidents);
  }

  const session = await auth();

  if (!session.orgId) {
    return getDemoData(getMessagesForLocale(requestLocale).incidents);
  }

  const [incidents, organisation] = await Promise.all([
    listIncidentsForOrg(session.orgId).catch(() => []),
    getOrganisationByClerkOrgId(session.orgId).catch(() => null),
  ]);
  const activeIncidentId = selectedIncidentId ?? incidents[0]?.id ?? null;
  const activeIncident = activeIncidentId
    ? await getIncidentForOrg({
        clerkOrgId: session.orgId,
        incidentId: activeIncidentId,
      }).catch(() => null)
    : null;

  return {
    activeIncident,
    canMutate: true,
    incidents,
    organisationLocale: organisation?.locale ?? null,
  };
}

function getDemoData(copy: IncidentsCopy): {
  activeIncident: Incident;
  canMutate: boolean;
  incidents: Incident[];
  organisationLocale: string | null;
} {
  const detectedAt = new Date(Date.now() - 61 * 60 * 60 * 1000);
  const incident = {
    affectsCriticalSystems: true,
    affectsPersonalData: true,
    clerkOrgId: "demo",
    createdAt: new Date(),
    description: copy.demo.description,
    detectedAt,
    id: "demo-incident",
    nukibReportedAt: null,
    reportedToNukib: false,
    reportedToUoou: false,
    resolvedAt: null,
    severity: "high",
    status: "investigating",
    title: copy.demo.title,
    uoouReportedAt: null,
  } satisfies Incident;

  return {
    activeIncident: incident,
    canMutate: false,
    incidents: [incident],
    organisationLocale: null,
  };
}

function formatDateTime(
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

function formatMessage(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (message, [key, value]) => message.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function severityTone(severity: string | null | undefined): StatusPillTone {
  if (severity === "critical") {
    return "fail";
  }

  if (severity === "high" || severity === "medium") {
    return "warn";
  }

  return "neutral";
}

function statusTone(status: string | null | undefined): StatusPillTone {
  if (status === "resolved") {
    return "pass";
  }

  if (status === "contained") {
    return "warn";
  }

  if (status === "investigating") {
    return "fail";
  }

  return "neutral";
}

function getCountdown(
  incident: Incident | null,
  locale: Locale,
  copy: IncidentsCopy,
) {
  if (!incident?.affectsPersonalData) {
    return {
      label: copy.countdown.notStarted,
      tone: "neutral",
    };
  }

  if (incident.reportedToUoou) {
    return {
      label: formatMessage(copy.countdown.reported, {
        date: formatDateTime(incident.uoouReportedAt, locale, copy.noDate),
      }),
      tone: "ok",
    };
  }

  const deadline = new Date(incident.detectedAt);
  deadline.setHours(deadline.getHours() + 72);
  const remainingMs = deadline.getTime() - Date.now();
  const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));

  if (remainingHours <= 0) {
    return {
      label: formatMessage(copy.countdown.overdue, {
        date: formatDateTime(deadline, locale, copy.noDate),
      }),
      tone: "danger",
    };
  }

  return {
    label: formatMessage(copy.countdown.remaining, {
      date: formatDateTime(deadline, locale, copy.noDate),
      hours: remainingHours,
    }),
    tone: remainingHours <= 12 ? "danger" : "warn",
  };
}

function countdownClass(tone: string) {
  if (tone === "danger") {
    return "border-[var(--status-fail-border)] bg-[var(--status-fail-subtle)] text-[var(--status-fail)]";
  }

  if (tone === "warn") {
    return "border-[var(--status-warn-border)] bg-[var(--status-warn-subtle)] text-[var(--status-warn)]";
  }

  if (tone === "ok") {
    return "border-[var(--status-pass-border)] bg-[var(--status-pass-subtle)] text-[var(--status-pass)]";
  }

  return "border-border bg-surface text-foreground/64";
}

function fieldClass(extra = "") {
  return `h-9 rounded-md border border-border-default bg-[var(--bg-input)] px-3 text-sm text-foreground ${extra}`;
}

function statusLabel(status: string | null | undefined, copy: IncidentsCopy) {
  if (!status) {
    return "n/a";
  }

  return copy.statuses[status as keyof typeof copy.statuses] ?? status;
}

function severityLabel(severity: string | null | undefined, copy: IncidentsCopy) {
  if (!severity) {
    return copy.severities.none;
  }

  return copy.severities[severity as keyof typeof copy.severities] ?? severity;
}

export default async function IncidentsPage({
  searchParams,
}: {
  searchParams: Promise<{ incidentId?: string }>;
}) {
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const { incidentId } = await searchParams;
  const {
    activeIncident,
    canMutate,
    incidents,
    organisationLocale,
  } = await loadIncidents(incidentId, requestLocale);
  const locale = normalizeLocale(organisationLocale) ?? requestLocale;
  const copy = getMessagesForLocale(locale).incidents;
  const countdown = getCountdown(activeIncident, locale, copy);
  const openIncidents = incidents.filter((incident) => incident.status !== "resolved");
  const defaultDetectedAt = new Date().toISOString().slice(0, 16);

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
        actions={
          activeIncident ? (
            <>
              <a
                href={`/api/incidents/${activeIncident.id}/nukib-report`}
                className="btn btn-nukib"
              >
                {copy.actions.nukibPdf}
                <Download className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
              </a>
              <a
                href={`/api/incidents/${activeIncident.id}/uoou-report`}
                className="btn btn-secondary"
              >
                {copy.actions.uoouPdf}
                <Download className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
              </a>
            </>
          ) : null
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="metric-card">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
            <h2 className="text-lg font-medium">{copy.metrics.openTitle}</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-medium">
            {openIncidents.length}
          </p>
          <p className="mt-2 text-sm text-foreground/58">
            {formatMessage(copy.metrics.totalIncidents, {
              count: incidents.length,
            })}
          </p>
        </article>
        <article
          className={`rounded-lg border p-5 ${countdownClass(countdown.tone)}`}
        >
          <div className="flex items-center gap-2">
            <Clock3 className="h-5 w-5" aria-hidden="true" strokeWidth={1.5} />
            <h2 className="text-lg font-medium">GDPR 72h</h2>
          </div>
          <p className="mt-4 text-sm font-medium">{countdown.label}</p>
          <p className="mt-2 text-sm opacity-75">{copy.metrics.gdprNotice}</p>
        </article>
        <article className="metric-card">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
            <h2 className="text-lg font-medium">{copy.metrics.severityTitle}</h2>
          </div>
          <div className="mt-4">
            <StatusPill tone={severityTone(activeIncident?.severity)}>
              {severityLabel(activeIncident?.severity, copy).toUpperCase()}
            </StatusPill>
          </div>
          <p className="mt-2 text-sm text-foreground/58">
            {formatMessage(copy.metrics.statusLine, {
              status: statusLabel(activeIncident?.status, copy),
            })}
          </p>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.4fr]">
        <section className="space-y-4">
          <article className="card">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
              <h2 className="text-lg font-medium">{copy.wizard.title}</h2>
            </div>
            <form action={createIncidentAction} className="mt-5 space-y-5">
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium">{copy.wizard.classification}</legend>
                <label className="grid gap-2 text-xs font-medium text-foreground/68">
                  {copy.wizard.name}
                  <input
                    name="title"
                    required
                    disabled={!canMutate}
                    className={fieldClass()}
                  />
                </label>
                <label className="grid gap-2 text-xs font-medium text-foreground/68">
                  {copy.wizard.severity}
                  <select
                    name="severity"
                    defaultValue="medium"
                    disabled={!canMutate}
                    className={fieldClass()}
                  >
                    <option value="low">{copy.severities.low}</option>
                    <option value="medium">{copy.severities.medium}</option>
                    <option value="high">{copy.severities.high}</option>
                    <option value="critical">{copy.severities.critical}</option>
                  </select>
                </label>
                <label className="grid gap-2 text-xs font-medium text-foreground/68">
                  {copy.wizard.detectedAt}
                  <input
                    name="detectedAt"
                    type="datetime-local"
                    defaultValue={defaultDetectedAt}
                    required
                    disabled={!canMutate}
                    className={fieldClass("font-mono")}
                  />
                </label>
              </fieldset>
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium">{copy.wizard.impact}</legend>
                <label className="flex items-start gap-3 rounded-md border border-border p-3 text-sm">
                  <input
                    name="affectsPersonalData"
                    type="checkbox"
                    disabled={!canMutate}
                    className="mt-1"
                  />
                  <span>{copy.wizard.affectsPersonalData}</span>
                </label>
                <label className="flex items-start gap-3 rounded-md border border-border p-3 text-sm">
                  <input
                    name="affectsCriticalSystems"
                    type="checkbox"
                    disabled={!canMutate}
                    className="mt-1"
                  />
                  <span>{copy.wizard.affectsCriticalSystems}</span>
                </label>
              </fieldset>
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium">{copy.wizard.description}</legend>
                <textarea
                  name="description"
                  rows={4}
                  disabled={!canMutate}
                  className="w-full rounded-md border border-border-default bg-[var(--bg-input)] px-3 py-2 text-sm text-foreground"
                />
              </fieldset>
              <button
                type="submit"
                disabled={!canMutate}
                className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copy.wizard.create}
                <AlertTriangle className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
              </button>
            </form>
          </article>

          <article className="overflow-hidden rounded-lg border border-border bg-surface">
            <div className="border-b border-border p-5">
              <h2 className="text-lg font-medium">{copy.log.title}</h2>
            </div>
            <div className="divide-y divide-border">
              {incidents.length ? (
                incidents.map((incident) => (
                  <Link
                    key={incident.id}
                    href={`/incidents?incidentId=${incident.id}`}
                    className="block p-4 hover:bg-bg-hover"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{incident.title}</p>
                      <StatusPill tone={severityTone(incident.severity)}>
                        {severityLabel(incident.severity, copy).toUpperCase()}
                      </StatusPill>
                    </div>
                    <p className="mt-1 text-sm text-foreground/58">
                      {statusLabel(incident.status, copy)} ·{" "}
                      {formatDateTime(incident.detectedAt, locale, copy.noDate)}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="p-5 text-sm text-foreground/58">
                  {copy.log.empty}
                </p>
              )}
            </div>
          </article>
        </section>

        <section className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="flex flex-col justify-between gap-3 border-b border-border p-5 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-medium">
                {activeIncident?.title ?? copy.detail.titleFallback}
              </h2>
              <p className="mt-1 text-sm text-foreground/58">
                {activeIncident
                  ? `${statusLabel(activeIncident.status, copy)} · ${severityLabel(activeIncident.severity, copy)}`
                  : copy.detail.selectOrCreate}
              </p>
              {activeIncident ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  <StatusPill tone={statusTone(activeIncident.status)}>
                    {statusLabel(activeIncident.status, copy).toUpperCase()}
                  </StatusPill>
                  <StatusPill tone={severityTone(activeIncident.severity)}>
                    {severityLabel(activeIncident.severity, copy).toUpperCase()}
                  </StatusPill>
                </div>
              ) : null}
            </div>
            {activeIncident ? (
              <form
                action={updateIncidentStatusAction.bind(null, activeIncident.id)}
                className="flex flex-wrap gap-2"
              >
                <select
                  name="status"
                  defaultValue={activeIncident.status}
                  disabled={!canMutate}
                  className={fieldClass()}
                >
                  <option value="open">{copy.statuses.open}</option>
                  <option value="investigating">{copy.statuses.investigating}</option>
                  <option value="contained">{copy.statuses.contained}</option>
                  <option value="resolved">{copy.statuses.resolved}</option>
                </select>
                <button
                  type="submit"
                  disabled={!canMutate}
                  className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {copy.detail.save}
                </button>
              </form>
            ) : null}
          </div>

          {activeIncident ? (
            <div className="space-y-5 p-5">
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  [
                    copy.detail.detected,
                    formatDateTime(activeIncident.detectedAt, locale, copy.noDate),
                  ],
                  [
                    copy.detail.created,
                    formatDateTime(activeIncident.createdAt, locale, copy.noDate),
                  ],
                  [
                    "NÚKIB",
                    activeIncident.reportedToNukib
                      ? formatDateTime(activeIncident.nukibReportedAt, locale, copy.noDate)
                      : copy.detail.notSent,
                  ],
                  [
                    "ÚOOÚ",
                    activeIncident.reportedToUoou
                      ? formatDateTime(activeIncident.uoouReportedAt, locale, copy.noDate)
                      : copy.detail.notSent,
                  ],
                  [
                    copy.detail.resolved,
                    formatDateTime(activeIncident.resolvedAt, locale, copy.noDate),
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md border border-border p-4">
                    <p className="text-xs font-medium text-foreground/50">
                      {label}
                    </p>
                    <p className="mt-2 text-sm font-medium">{value}</p>
                  </div>
                ))}
              </div>

              <article className="rounded-md border border-border p-4">
                <h3 className="font-medium">{copy.checklist.title}</h3>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-md bg-surface-muted p-3 text-sm">
                    <p className="font-medium">NIS2 / NÚKIB</p>
                    <p className="mt-1 text-foreground/62">
                      {activeIncident.affectsCriticalSystems
                        ? copy.checklist.nis2Required
                        : copy.checklist.nis2NotMarked}
                    </p>
                  </div>
                  <div className="rounded-md bg-surface-muted p-3 text-sm">
                    <p className="font-medium">GDPR / ÚOOÚ</p>
                    <p className="mt-1 text-foreground/62">
                      {activeIncident.affectsPersonalData
                        ? copy.checklist.gdprActive
                        : copy.checklist.gdprNotMarked}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <form
                    action={markIncidentReportedAction.bind(
                      null,
                      activeIncident.id,
                    )}
                  >
                    <input type="hidden" name="regulator" value="nukib" />
                    <button
                      type="submit"
                      disabled={
                        !canMutate ||
                        !activeIncident.affectsCriticalSystems ||
                        Boolean(activeIncident.reportedToNukib)
                      }
                      className="btn btn-nukib disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {copy.checklist.markNukib}
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
                    </button>
                  </form>
                  <form
                    action={markIncidentReportedAction.bind(
                      null,
                      activeIncident.id,
                    )}
                  >
                    <input type="hidden" name="regulator" value="uoou" />
                    <button
                      type="submit"
                      disabled={
                        !canMutate ||
                        !activeIncident.affectsPersonalData ||
                        Boolean(activeIncident.reportedToUoou)
                      }
                      className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {copy.checklist.markUoou}
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
                    </button>
                  </form>
                </div>
              </article>

              <article className="rounded-md border border-border p-4">
                <h3 className="font-medium">{copy.detail.description}</h3>
                <p className="mt-3 text-sm leading-6 text-foreground/64">
                  {activeIncident.description ?? copy.detail.noDescription}
                </p>
              </article>
            </div>
          ) : (
            <p className="p-5 text-sm text-foreground/58">
              {copy.detail.selectOrCreate}
            </p>
          )}
        </section>
      </div>
    </section>
  );
}
