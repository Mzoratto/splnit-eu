import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Download, FileUp, History, ShieldCheck, Upload } from "lucide-react";
import {
  updateControlStatusAction,
  uploadEvidenceAction,
} from "@/app/(app)/controls/[controlId]/actions";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { CONTROL_LIBRARY } from "@/lib/controls/library";
import { hasDatabaseUrl } from "@/lib/db";
import { getControlDetailByKey } from "@/lib/db/queries/controls";

const statusValues = [
  "unknown",
  "pass",
  "fail",
  "manual_review",
  "not_applicable",
] as const;

type ControlsCopy = ReturnType<typeof getMessagesForLocale>["controlsPage"];

function formatDate(
  value: Date | string | null | undefined,
  locale: Locale,
  emptyLabel: string,
) {
  if (!value) {
    return emptyLabel;
  }

  return new Intl.DateTimeFormat(locale).format(new Date(value));
}

async function loadControlDetail(controlKey: string) {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return null;
  }

  const session = await auth();

  if (!session.orgId) {
    return null;
  }

  try {
    return getControlDetailByKey({
      clerkOrgId: session.orgId,
      controlKey,
    });
  } catch {
    return null;
  }
}

function getCategoryLabel(category: string | null | undefined, copy: ControlsCopy) {
  if (!category) {
    return copy.emptyValue;
  }

  return copy.categories[category as keyof typeof copy.categories] ?? category;
}

function getControlTitle(
  control: { titleCs: string; titleEn: string },
  locale: Locale,
) {
  return locale === "cs-CZ" ? control.titleCs : control.titleEn;
}

function getControlDescription(
  control: { descriptionCs?: string | null; titleEn: string },
  locale: Locale,
) {
  if (locale === "cs-CZ") {
    return control.descriptionCs ?? control.titleEn;
  }

  return control.titleEn;
}

function getStatusLabel(status: string, copy: ControlsCopy) {
  return copy.statuses[status as keyof typeof copy.statuses] ?? status;
}

function interpolate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

export default async function ControlDetailPage({
  params,
}: {
  params: Promise<{ controlId: string }>;
}) {
  const { controlId } = await params;
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const copy = getMessagesForLocale(locale).controlsPage;
  const seedControl = CONTROL_LIBRARY.find((item) => item.key === controlId);

  if (!seedControl) {
    notFound();
  }

  const detail = await loadControlDetail(controlId);
  const control = detail?.control ?? {
    category: seedControl.category,
    descriptionCs: seedControl.descriptionCs ?? null,
    isAutomated: seedControl.isAutomated,
    key: seedControl.key,
    requiresEvidence: seedControl.requiresEvidence,
    testType: seedControl.testType,
    titleCs: seedControl.titleCs,
    titleEn: seedControl.titleEn,
  };
  const currentStatus = detail?.status?.status ?? "unknown";
  const notes = detail?.status?.notes ?? "";
  const frameworkRows =
    detail?.frameworks ??
    seedControl.frameworkMappings.map((mapping) => ({
      articleRef: mapping.articleRef,
      frameworkName: mapping.frameworkSlug,
      frameworkSlug: mapping.frameworkSlug,
      requirementLevel: mapping.level,
    }));
  const evidenceRows = detail?.evidence ?? [];
  const testRows = detail?.tests ?? [];
  const canMutate = Boolean(detail);
  const canUpload = canMutate && Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  const activityRows = [
    ...(detail?.status?.updatedAt
      ? [
          {
            date: detail.status.updatedAt,
            label: interpolate(copy.detail.activityStatusChanged, {
              status: getStatusLabel(detail.status.status, copy),
            }),
          },
        ]
      : []),
    ...evidenceRows.map((item) => ({
      date: item.collectedAt,
      label: interpolate(copy.detail.activityEvidenceUploaded, {
        evidence: item.description ?? item.type,
      }),
    })),
  ].sort((left, right) => {
    const leftTime = left.date ? new Date(left.date).getTime() : 0;
    const rightTime = right.date ? new Date(right.date).getTime() : 0;
    return rightTime - leftTime;
  });

  return (
    <section className="space-y-8">
      <div className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
          {getCategoryLabel(control.category, copy)}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">
          {getControlTitle(control, locale)}
        </h1>
        <p className="mt-3 text-base leading-7 text-foreground/68">
          {getControlDescription(control, locale)}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">{copy.detail.statusTitle}</h2>
          </div>
          <form
            action={updateControlStatusAction.bind(null, control.key)}
            className="mt-5 space-y-4"
          >
            <label className="grid gap-2 text-sm">
              {copy.detail.statusLabel}
              <select
                name="status"
                defaultValue={currentStatus}
                disabled={!canMutate}
                className="rounded-md border border-border bg-background px-3 py-2"
              >
                {statusValues.map((value) => (
                  <option key={value} value={value}>
                    {getStatusLabel(value, copy)}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              {copy.detail.notes}
              <textarea
                name="notes"
                defaultValue={notes}
                disabled={!canMutate}
                rows={5}
                className="rounded-md border border-border bg-background px-3 py-2"
              />
            </label>
            <button
              type="submit"
              disabled={!canMutate}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copy.detail.saveStatus}
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <FileUp className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">{copy.detail.uploadTitle}</h2>
          </div>
          <form
            action={uploadEvidenceAction.bind(null, control.key)}
            className="mt-5 space-y-4"
          >
            <label className="grid gap-2 text-sm">
              {copy.detail.file}
              <input
                name="file"
                type="file"
                disabled={!canUpload}
                className="rounded-md border border-border bg-background px-3 py-2"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm">
                {copy.detail.source}
                <input
                  name="source"
                  defaultValue="manual_upload"
                  disabled={!canUpload}
                  className="rounded-md border border-border bg-background px-3 py-2"
                />
              </label>
              <label className="grid gap-2 text-sm">
                {copy.detail.expires}
                <input
                  name="expiresAt"
                  type="date"
                  disabled={!canUpload}
                  className="rounded-md border border-border bg-background px-3 py-2"
                />
              </label>
            </div>
            <label className="grid gap-2 text-sm">
              {copy.detail.description}
              <textarea
                name="description"
                disabled={!canUpload}
                rows={3}
                className="rounded-md border border-border bg-background px-3 py-2"
              />
            </label>
            <button
              type="submit"
              disabled={!canUpload}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copy.detail.uploadFile}
              <Upload className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </section>
      </div>

      <section className="rounded-lg border border-border bg-surface">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-semibold">{copy.detail.frameworksTitle}</h2>
        </div>
        <div className="grid gap-0 md:grid-cols-2">
          <div className="border-b border-border p-5 md:border-b-0 md:border-r">
            <h3 className="text-sm font-medium text-foreground/58">
              {copy.detail.mappings}
            </h3>
            <div className="mt-4 space-y-3">
              {frameworkRows.map((mapping) => (
                <div
                  key={`${mapping.frameworkSlug}-${mapping.articleRef}`}
                  className="rounded-md bg-surface-muted p-3 text-sm"
                >
                  <p className="font-medium">{mapping.frameworkName}</p>
                  <p className="mt-1 text-foreground/58">
                    {mapping.articleRef} · {mapping.requirementLevel}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="p-5">
            <h3 className="text-sm font-medium text-foreground/58">
              {copy.detail.linkedTests}
            </h3>
            <div className="mt-4 space-y-3">
              {testRows.length > 0 ? (
                testRows.map((test) => (
                  <div key={test.id} className="rounded-md bg-surface-muted p-3 text-sm">
                    <p className="font-medium">{test.name}</p>
                    <p className="mt-1 text-foreground/58">
                      {test.integrationType} · {test.passCriteria ?? test.checkLogic}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-foreground/58">
                  {copy.detail.noLinkedTests}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-lg border border-border bg-surface">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-semibold">{copy.detail.evidenceTitle}</h2>
          </div>
          <div className="divide-y divide-border">
            {evidenceRows.length > 0 ? (
              evidenceRows.map((item) => (
                <article key={item.id} className="p-5">
                  <div className="flex flex-col justify-between gap-3 md:flex-row">
                    <div>
                      <p className="font-medium">
                        {item.description ?? item.source ?? item.type}
                      </p>
                      <p className="mt-1 text-sm text-foreground/58">
                        {item.type} · {copy.detail.uploaded}{" "}
                        {formatDate(item.collectedAt, locale, copy.noDate)}
                      </p>
                    </div>
                    <span className="rounded-md bg-surface-muted px-2 py-1 text-xs text-foreground/64">
                      {copy.detail.expires}{" "}
                      {formatDate(item.expiresAt, locale, copy.noDate)}
                    </span>
                  </div>
                  {item.blobUrl ? (
                    <a
                      href={`/api/evidence/${item.id}/download`}
                      className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-surface-muted"
                    >
                      {copy.detail.downloadFile}
                      <Download className="h-4 w-4" aria-hidden="true" />
                    </a>
                  ) : null}
                </article>
              ))
            ) : (
              <p className="p-5 text-sm text-foreground/58">
                {copy.detail.noEvidence}
              </p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface">
          <div className="flex items-center gap-2 border-b border-border p-5">
            <History className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">{copy.detail.historyTitle}</h2>
          </div>
          <div className="divide-y divide-border">
            {activityRows.length > 0 ? (
              activityRows.map((item) => (
                <article key={`${item.label}-${item.date}`} className="p-5">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="mt-1 text-xs text-foreground/52">
                    {formatDate(item.date, locale, copy.noDate)}
                  </p>
                </article>
              ))
            ) : (
              <p className="p-5 text-sm text-foreground/58">
                {copy.detail.noHistory}
              </p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
