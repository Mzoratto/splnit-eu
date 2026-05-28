import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import {
  CalendarClock,
  CheckCircle2,
  GraduationCap,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill, type StatusPillTone } from "@/components/app/status-pill";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { hasDatabaseUrl } from "@/lib/db";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import {
  getTrainingGapSummary,
  summarizeTrainingRecords,
  type TrainingGapSummary,
  type TrainingGapStatus,
} from "@/lib/db/queries/training";
import type { EmployeeTrainingRecord } from "@/lib/db/schema";
import { createTrainingRecordAction } from "./actions";
import { DeleteTrainingRecordForm } from "./delete-record-form";

export const dynamic = "force-dynamic";

type TrainingCopy = ReturnType<typeof getMessagesForLocale>["trainingPage"];
type TrainingRecordWithStatus = TrainingGapSummary["records"][number];

const demoRecords: EmployeeTrainingRecord[] = [
  {
    clerkOrgId: "demo",
    createdAt: new Date(),
    createdBy: "demo-user",
    employeeEmail: "anna@example.com",
    employeeName: "Anna Novak",
    employeeRole: "security_owner",
    id: "demo-training-1",
    notes: "Annual security refresh.",
    provider: "Internal",
    trainingDate: "2026-03-12",
    trainingType: "security_awareness",
  },
  {
    clerkOrgId: "demo",
    createdAt: new Date(),
    createdBy: "demo-user",
    employeeEmail: "it@example.com",
    employeeName: "IT admin",
    employeeRole: "it_admin",
    id: "demo-training-2",
    notes: null,
    provider: "Czech national cybersecurity authority",
    trainingDate: "2025-07-02",
    trainingType: "incident_response",
  },
  {
    clerkOrgId: "demo",
    createdAt: new Date(),
    createdBy: "demo-user",
    employeeEmail: null,
    employeeName: "External accountant",
    employeeRole: "contractor",
    id: "demo-training-3",
    notes: null,
    provider: "External",
    trainingDate: "2025-02-10",
    trainingType: "privacy",
  },
];

async function loadTrainingData(requestLocale: Locale): Promise<{
  canMutate: boolean;
  mode: "live" | "demo";
  organisationLocale: string | null;
  summary: TrainingGapSummary;
}> {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return {
      canMutate: false,
      mode: "demo",
      organisationLocale: requestLocale,
      summary: summarizeTrainingRecords(demoRecords),
    };
  }

  const session = await auth();

  if (!session.orgId) {
    return {
      canMutate: false,
      mode: "demo",
      organisationLocale: requestLocale,
      summary: summarizeTrainingRecords(demoRecords),
    };
  }

  try {
    const [organisation, summary] = await Promise.all([
      getOrganisationByClerkOrgId(session.orgId),
      getTrainingGapSummary(session.orgId),
    ]);

    return {
      canMutate: true,
      mode: "live",
      organisationLocale: organisation?.locale ?? null,
      summary,
    };
  } catch {
    return {
      canMutate: false,
      mode: "demo",
      organisationLocale: requestLocale,
      summary: summarizeTrainingRecords(demoRecords),
    };
  }
}

function formatDate(value: string | Date | null | undefined, locale: Locale, empty: string) {
  if (!value) {
    return empty;
  }

  return new Intl.DateTimeFormat(locale).format(new Date(`${String(value).slice(0, 10)}T00:00:00.000Z`));
}

function statusTone(status: TrainingGapStatus): StatusPillTone {
  if (status === "current") {
    return "pass";
  }

  if (status === "expiring_soon") {
    return "warn";
  }

  return "fail";
}

function roleLabel(value: string, copy: TrainingCopy) {
  return copy.roles[value as keyof typeof copy.roles] ?? value;
}

function typeLabel(value: string, copy: TrainingCopy) {
  return copy.types[value as keyof typeof copy.types] ?? value;
}

function statusLabel(value: TrainingGapStatus, copy: TrainingCopy) {
  return copy.statuses[value] ?? value;
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <article className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.6} />
        <h2 className="text-sm font-medium text-foreground/70">{label}</h2>
      </div>
      <p className="mt-4 font-mono text-2xl font-semibold">{value}</p>
    </article>
  );
}

function AddTrainingRecordForm({
  canMutate,
  copy,
}: {
  canMutate: boolean;
  copy: TrainingCopy;
}) {
  const roleEntries = Object.entries(copy.roles);
  const typeEntries = Object.entries(copy.types);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center gap-2">
        <GraduationCap className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.6} />
        <h2 className="text-lg font-semibold">{copy.form.title}</h2>
      </div>
      <form action={createTrainingRecordAction} className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-foreground/72">{copy.form.employeeName}</span>
          <input
            name="employeeName"
            required
            disabled={!canMutate}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-foreground/72">{copy.form.employeeEmail}</span>
          <input
            name="employeeEmail"
            type="email"
            disabled={!canMutate}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-foreground/72">{copy.form.employeeRole}</span>
          <select
            name="employeeRole"
            defaultValue="employee"
            disabled={!canMutate}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            {roleEntries.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-foreground/72">{copy.form.trainingType}</span>
          <select
            name="trainingType"
            defaultValue="security_awareness"
            disabled={!canMutate}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            {typeEntries.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-foreground/72">{copy.form.trainingDate}</span>
          <input
            name="trainingDate"
            type="date"
            max={today}
            required
            disabled={!canMutate}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-foreground/72">{copy.form.provider}</span>
          <input
            name="provider"
            disabled={!canMutate}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
        <label className="grid gap-1.5 text-sm md:col-span-2">
          <span className="font-medium text-foreground/72">{copy.form.notes}</span>
          <textarea
            name="notes"
            rows={3}
            disabled={!canMutate}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={!canMutate}
            className="btn btn-primary"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" strokeWidth={1.7} />
            {copy.form.create}
          </button>
        </div>
      </form>
    </section>
  );
}

function TrainingRecordsTable({
  canMutate,
  copy,
  locale,
  records,
}: {
  canMutate: boolean;
  copy: TrainingCopy;
  locale: Locale;
  records: TrainingRecordWithStatus[];
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="border-b border-border p-5">
        <h2 className="text-lg font-semibold">{copy.table.title}</h2>
      </div>
      {records.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-[0.08em] text-foreground/52">
              <tr>
                <th className="px-4 py-3 font-medium">{copy.table.employee}</th>
                <th className="px-4 py-3 font-medium">{copy.table.role}</th>
                <th className="px-4 py-3 font-medium">{copy.table.type}</th>
                <th className="px-4 py-3 font-medium">{copy.table.date}</th>
                <th className="px-4 py-3 font-medium">{copy.table.provider}</th>
                <th className="px-4 py-3 font-medium">{copy.table.status}</th>
                <th className="px-4 py-3 text-right font-medium">{copy.table.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {records.map((record) => (
                <tr key={record.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{record.employeeName}</p>
                    <p className="text-xs text-foreground/52">
                      {record.employeeEmail || copy.emptyValue}
                    </p>
                  </td>
                  <td className="px-4 py-3">{roleLabel(record.employeeRole, copy)}</td>
                  <td className="px-4 py-3">{typeLabel(record.trainingType, copy)}</td>
                  <td className="px-4 py-3">{formatDate(record.trainingDate, locale, copy.noDate)}</td>
                  <td className="px-4 py-3">{record.provider || copy.emptyValue}</td>
                  <td className="px-4 py-3">
                    <StatusPill tone={statusTone(record.gapStatus)}>
                      {statusLabel(record.gapStatus, copy)}
                    </StatusPill>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      {canMutate ? (
                        <DeleteTrainingRecordForm
                          confirmLabel={copy.table.confirmDelete}
                          label={copy.table.delete}
                          recordId={record.id}
                        />
                      ) : (
                        <span className="text-xs text-foreground/42">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="p-5 text-sm text-foreground/62">{copy.table.empty}</p>
      )}
    </section>
  );
}

export default async function TrainingPage() {
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const { canMutate, mode, organisationLocale, summary } =
    await loadTrainingData(requestLocale);
  const locale = normalizeLocale(organisationLocale) ?? requestLocale;
  const copy = getMessagesForLocale(locale).trainingPage;

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
      />

      {mode === "demo" ? (
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground/64">
          {copy.demoMode}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={GraduationCap} label={copy.metrics.total} value={summary.total} />
        <MetricCard icon={CheckCircle2} label={copy.metrics.current} value={summary.current} />
        <MetricCard icon={CalendarClock} label={copy.metrics.expiringSoon} value={summary.expiringSoon} />
        <MetricCard icon={ShieldAlert} label={copy.metrics.expired} value={summary.expired} />
      </div>

      <div className="rounded-lg border border-border bg-surface-muted p-4 text-sm leading-6 text-foreground/62">
        {/* TODO: Compare trained employees against a reliable employee roster once employee counts are stored as exact integers. */}
        {copy.coverageNote}
      </div>

      <AddTrainingRecordForm canMutate={canMutate} copy={copy} />

      <TrainingRecordsTable
        canMutate={canMutate}
        copy={copy}
        locale={locale}
        records={summary.records}
      />
    </section>
  );
}
