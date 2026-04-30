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

function severityClass(severity: string) {
  if (severity === "critical") {
    return "bg-red-50 text-red-800";
  }

  if (severity === "high") {
    return "bg-amber-50 text-amber-900";
  }

  if (severity === "medium") {
    return "bg-blue-50 text-blue-800";
  }

  return "bg-surface-muted text-foreground/64";
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
    return "border-red-200 bg-red-50 text-red-900";
  }

  if (tone === "warn") {
    return "border-amber-200 bg-amber-50 text-amber-950";
  }

  if (tone === "ok") {
    return "border-emerald-200 bg-emerald-50 text-emerald-900";
  }

  return "border-border bg-surface text-foreground/64";
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
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            Incident management
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            Incidenty
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/64">
            NIS2 a GDPR incident log s 72h countdownem, regulatorními checklisty a exporty oznámení.
          </p>
        </div>
        {activeIncident ? (
          <div className="flex flex-wrap gap-2">
            <a
              href={`/api/incidents/${activeIncident.id}/nukib-report`}
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted"
            >
              NÚKIB PDF
              <Download className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href={`/api/incidents/${activeIncident.id}/uoou-report`}
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted"
            >
              ÚOOÚ PDF
              <Download className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Otevřené</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-semibold">
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
            <Clock3 className="h-5 w-5" aria-hidden="true" />
            <h2 className="text-lg font-semibold">GDPR 72h</h2>
          </div>
          <p className="mt-4 text-sm font-medium">{countdown.label}</p>
          <p className="mt-2 text-sm opacity-75">GDPR Article 33 breach notice.</p>
        </article>
        <article className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Severity</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-semibold">
            {activeIncident?.severity ?? "none"}
          </p>
          <p className="mt-2 text-sm text-foreground/58">
            Status {activeIncident?.status ?? "n/a"}.
          </p>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.4fr]">
        <section className="space-y-4">
          <article className="rounded-lg border border-border bg-surface p-5">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-semibold">Incident wizard</h2>
            </div>
            <form action={createIncidentAction} className="mt-5 space-y-5">
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium">1. Klasifikace</legend>
                <label className="grid gap-2 text-sm">
                  Název
                  <input
                    name="title"
                    required
                    disabled={!canMutate}
                    className="rounded-md border border-border bg-background px-3 py-2"
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  Severity
                  <select
                    name="severity"
                    defaultValue="medium"
                    disabled={!canMutate}
                    className="rounded-md border border-border bg-background px-3 py-2"
                  >
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                    <option value="critical">critical</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm">
                  Detekováno
                  <input
                    name="detectedAt"
                    type="datetime-local"
                    defaultValue={defaultDetectedAt}
                    required
                    disabled={!canMutate}
                    className="rounded-md border border-border bg-background px-3 py-2"
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
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </fieldset>
              <button
                type="submit"
                disabled={!canMutate}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                Založit incident
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </article>

          <article className="rounded-lg border border-border bg-surface">
            <div className="border-b border-border p-5">
              <h2 className="text-lg font-semibold">Incident log</h2>
            </div>
            <div className="divide-y divide-border">
              {incidents.length ? (
                incidents.map((incident) => (
                  <Link
                    key={incident.id}
                    href={`/incidents?incidentId=${incident.id}`}
                    className="block p-5 hover:bg-surface-muted"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{incident.title}</p>
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-medium ${severityClass(
                          incident.severity,
                        )}`}
                      >
                        {incident.severity}
                      </span>
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

        <section className="rounded-lg border border-border bg-surface">
          <div className="flex flex-col justify-between gap-3 border-b border-border p-5 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-semibold">
                {activeIncident?.title ?? "Detail incidentu"}
              </h2>
              <p className="mt-1 text-sm text-foreground/58">
                {activeIncident
                  ? `${activeIncident.status} · ${activeIncident.severity}`
                  : "Vyberte nebo založte incident."}
              </p>
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
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="open">open</option>
                  <option value="investigating">investigating</option>
                  <option value="contained">contained</option>
                  <option value="resolved">resolved</option>
                </select>
                <button
                  type="submit"
                  disabled={!canMutate}
                  className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
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
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-foreground/50">
                      {label}
                    </p>
                    <p className="mt-2 text-sm font-medium">{value}</p>
                  </div>
                ))}
              </div>

              <article className="rounded-md border border-border p-4">
                <h3 className="font-semibold">Mandatory notification checklist</h3>
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
                      className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Označit NÚKIB
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
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
                      className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Označit ÚOOÚ
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </form>
                </div>
              </article>

              <article className="rounded-md border border-border p-4">
                <h3 className="font-semibold">Popis</h3>
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
