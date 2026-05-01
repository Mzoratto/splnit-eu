import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
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
import { hasDatabaseUrl } from "@/lib/db";
import {
  getIncidentForOrg,
  listIncidentsForOrg,
} from "@/lib/db/queries/incidents";
import {
  createIncidentAction,
  markIncidentReportedAction,
  updateIncidentStatusAction,
} from "./actions";

export const dynamic = "force-dynamic";

type Incident = Awaited<ReturnType<typeof listIncidentsForOrg>>[number];

async function loadIncidents(selectedIncidentId?: string) {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return getDemoData();
  }

  const session = await auth();

  if (!session.orgId) {
    return getDemoData();
  }

  const incidents = await listIncidentsForOrg(session.orgId).catch(() => []);
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
  };
}

function getDemoData(): {
  activeIncident: Incident;
  canMutate: boolean;
  incidents: Incident[];
} {
  const detectedAt = new Date(Date.now() - 61 * 60 * 60 * 1000);
  const incident = {
    affectsCriticalSystems: true,
    affectsPersonalData: true,
    clerkOrgId: "demo",
    createdAt: new Date(),
    description:
      "Demo incident covering unauthorized access to a SaaS admin panel and potential personal data exposure.",
    detectedAt,
    id: "demo-incident",
    nukibReportedAt: null,
    reportedToNukib: false,
    reportedToUoou: false,
    resolvedAt: null,
    severity: "high",
    status: "investigating",
    title: "Suspicious admin access",
    uoouReportedAt: null,
  } satisfies Incident;

  return {
    activeIncident: incident,
    canMutate: false,
    incidents: [incident],
  };
}

function formatDateTime(value: Date | string | null | undefined) {
  if (!value) {
    return "nenastaveno";
  }

  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
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

function getCountdown(incident: Incident | null) {
  if (!incident?.affectsPersonalData) {
    return {
      label: "GDPR Art. 33 není spuštěn",
      tone: "neutral",
    };
  }

  if (incident.reportedToUoou) {
    return {
      label: `ÚOOÚ reportováno ${formatDateTime(incident.uoouReportedAt)}`,
      tone: "ok",
    };
  }

  const deadline = new Date(incident.detectedAt);
  deadline.setHours(deadline.getHours() + 72);
  const remainingMs = deadline.getTime() - Date.now();
  const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));

  if (remainingHours <= 0) {
    return {
      label: `Po termínu · deadline ${formatDateTime(deadline)}`,
      tone: "danger",
    };
  }

  return {
    label: `${remainingHours}h zbývá · deadline ${formatDateTime(deadline)}`,
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

export default async function IncidentsPage({
  searchParams,
}: {
  searchParams: Promise<{ incidentId?: string }>;
}) {
  const { incidentId } = await searchParams;
  const { activeIncident, canMutate, incidents } = await loadIncidents(incidentId);
  const countdown = getCountdown(activeIncident);
  const openIncidents = incidents.filter((incident) => incident.status !== "resolved");
  const defaultDetectedAt = new Date().toISOString().slice(0, 16);

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Incident management"
        title="Incidenty"
        subtitle="NIS2 a GDPR incident log s 72h countdownem, regulatorními checklisty a exporty oznámení."
        actions={
          activeIncident ? (
            <>
              <a
                href={`/api/incidents/${activeIncident.id}/nukib-report`}
                className="btn btn-nukib"
              >
                🇨🇿 NÚKIB PDF
                <Download className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
              </a>
              <a
                href={`/api/incidents/${activeIncident.id}/uoou-report`}
                className="btn btn-secondary"
              >
                ÚOOÚ PDF
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
            <h2 className="text-lg font-medium">Otevřené</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-medium">
            {openIncidents.length}
          </p>
          <p className="mt-2 text-sm text-foreground/58">
            Celkem {incidents.length} incidentů v logu.
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
          <p className="mt-2 text-sm opacity-75">GDPR Article 33 breach notice.</p>
        </article>
        <article className="metric-card">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
            <h2 className="text-lg font-medium">Severity</h2>
          </div>
          <div className="mt-4">
            <StatusPill tone={severityTone(activeIncident?.severity)}>
              {(activeIncident?.severity ?? "none").toUpperCase()}
            </StatusPill>
          </div>
          <p className="mt-2 text-sm text-foreground/58">
            Status {activeIncident?.status ?? "n/a"}.
          </p>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.4fr]">
        <section className="space-y-4">
          <article className="card">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
              <h2 className="text-lg font-medium">Incident wizard</h2>
            </div>
            <form action={createIncidentAction} className="mt-5 space-y-5">
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium">1. Klasifikace</legend>
                <label className="grid gap-2 text-xs font-medium text-foreground/68">
                  Název
                  <input
                    name="title"
                    required
                    disabled={!canMutate}
                    className={fieldClass()}
                  />
                </label>
                <label className="grid gap-2 text-xs font-medium text-foreground/68">
                  Severity
                  <select
                    name="severity"
                    defaultValue="medium"
                    disabled={!canMutate}
                    className={fieldClass()}
                  >
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                    <option value="critical">critical</option>
                  </select>
                </label>
                <label className="grid gap-2 text-xs font-medium text-foreground/68">
                  Detekováno
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
                <legend className="text-sm font-medium">2. Dopad</legend>
                <label className="flex items-start gap-3 rounded-md border border-border p-3 text-sm">
                  <input
                    name="affectsPersonalData"
                    type="checkbox"
                    disabled={!canMutate}
                    className="mt-1"
                  />
                  <span>Incident se týká osobních údajů</span>
                </label>
                <label className="flex items-start gap-3 rounded-md border border-border p-3 text-sm">
                  <input
                    name="affectsCriticalSystems"
                    type="checkbox"
                    disabled={!canMutate}
                    className="mt-1"
                  />
                  <span>Incident se týká kritických systémů nebo služby</span>
                </label>
              </fieldset>
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium">3. Popis</legend>
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
                Založit incident
                <AlertTriangle className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
              </button>
            </form>
          </article>

          <article className="overflow-hidden rounded-lg border border-border bg-surface">
            <div className="border-b border-border p-5">
              <h2 className="text-lg font-medium">Incident log</h2>
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
                        {incident.severity.toUpperCase()}
                      </StatusPill>
                    </div>
                    <p className="mt-1 text-sm text-foreground/58">
                      {incident.status} · {formatDateTime(incident.detectedAt)}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="p-5 text-sm text-foreground/58">
                  Incident log je zatím prázdný.
                </p>
              )}
            </div>
          </article>
        </section>

        <section className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="flex flex-col justify-between gap-3 border-b border-border p-5 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-medium">
                {activeIncident?.title ?? "Detail incidentu"}
              </h2>
              <p className="mt-1 text-sm text-foreground/58">
                {activeIncident
                  ? `${activeIncident.status} · ${activeIncident.severity}`
                  : "Vyberte nebo založte incident."}
              </p>
              {activeIncident ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  <StatusPill tone={statusTone(activeIncident.status)}>
                    {activeIncident.status.toUpperCase()}
                  </StatusPill>
                  <StatusPill tone={severityTone(activeIncident.severity)}>
                    {activeIncident.severity.toUpperCase()}
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
                  <option value="open">open</option>
                  <option value="investigating">investigating</option>
                  <option value="contained">contained</option>
                  <option value="resolved">resolved</option>
                </select>
                <button
                  type="submit"
                  disabled={!canMutate}
                  className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Uložit
                </button>
              </form>
            ) : null}
          </div>

          {activeIncident ? (
            <div className="space-y-5 p-5">
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  ["Detekováno", formatDateTime(activeIncident.detectedAt)],
                  ["Založeno", formatDateTime(activeIncident.createdAt)],
                  [
                    "NÚKIB",
                    activeIncident.reportedToNukib
                      ? formatDateTime(activeIncident.nukibReportedAt)
                      : "neodesláno",
                  ],
                  [
                    "ÚOOÚ",
                    activeIncident.reportedToUoou
                      ? formatDateTime(activeIncident.uoouReportedAt)
                      : "neodesláno",
                  ],
                  ["Vyřešeno", formatDateTime(activeIncident.resolvedAt)],
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
                <h3 className="font-medium">Regulatorní checklist</h3>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-md bg-surface-muted p-3 text-sm">
                    <p className="font-medium">NIS2 / NÚKIB</p>
                    <p className="mt-1 text-foreground/62">
                      {activeIncident.affectsCriticalSystems
                        ? "Vyžaduje posouzení a oznámení podle dopadu."
                        : "Neoznačeno jako kritický systém."}
                    </p>
                  </div>
                  <div className="rounded-md bg-surface-muted p-3 text-sm">
                    <p className="font-medium">GDPR / ÚOOÚ</p>
                    <p className="mt-1 text-foreground/62">
                      {activeIncident.affectsPersonalData
                        ? "72h countdown je aktivní."
                        : "Neoznačeno jako osobní údaje."}
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
                      Označit NÚKIB
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
                      Označit ÚOOÚ
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
                    </button>
                  </form>
                </div>
              </article>

              <article className="rounded-md border border-border p-4">
                <h3 className="font-medium">Popis</h3>
                <p className="mt-3 text-sm leading-6 text-foreground/64">
                  {activeIncident.description ?? "Bez popisu."}
                </p>
              </article>
            </div>
          ) : (
            <p className="p-5 text-sm text-foreground/58">
              Vyberte incident z logu nebo založte nový.
            </p>
          )}
        </section>
      </div>
    </section>
  );
}
