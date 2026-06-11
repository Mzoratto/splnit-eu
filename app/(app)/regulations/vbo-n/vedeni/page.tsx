import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { ExternalLink, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { hasDatabaseUrl } from "@/lib/db";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { getVboVedeniData } from "@/lib/db/queries/vbo-vedeni";
import { isTrainingStale } from "@/lib/regulations/vbo-n/records";
import {
  createRecoveryPriorityAction,
  createResponsiblePersonAction,
  createTrainingAction,
  deleteRecoveryPriorityAction,
  deleteResponsiblePersonAction,
  deleteTrainingAction,
  setRecoveryApprovalAction,
  updateTrainingDatesAction,
} from "./actions";

export const dynamic = "force-dynamic";

const NUKIB_COURSES_URL = "https://osveta.nukib.gov.cz/";

async function loadVedeniData() {
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

  const organisation = await getOrganisationByClerkOrgId(session.orgId).catch(
    () => null,
  );

  if (organisation?.rezimPovinnosti !== "nizsi") {
    return null;
  }

  const data = await getVboVedeniData(session.orgId);

  return { ...data, organisationLocale: organisation.locale ?? null };
}

function formatDate(value: string | Date | null, locale: Locale, empty: string) {
  if (!value) {
    return empty;
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
    new Date(value),
  );
}

const inputClass =
  "rounded-md border border-border bg-background px-2.5 py-1.5 text-sm";

export default async function VedeniPage() {
  const data = await loadVedeniData();

  if (!data) {
    notFound();
  }

  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const locale = normalizeLocale(data.organisationLocale) ?? requestLocale;
  const copy = getMessagesForLocale(locale).vboN.vedeni;
  const staleTrainings = data.trainings.filter((training) =>
    isTrainingStale(training.lastRegularTrainingOn),
  );

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
      />

      {staleTrainings.length ? (
        <div className="rounded-lg border border-[var(--status-warn-border)] bg-[var(--status-warn-subtle)] px-4 py-3 text-sm text-[var(--status-warn)]">
          {copy.staleTrainingBanner.replace(
            "{names}",
            staleTrainings.map((training) => training.memberName).join(", "),
          )}
        </div>
      ) : null}

      {/* N-4-01: Pověřená osoba KB */}
      <section className="rounded-lg border border-border bg-surface p-5">
        <h2 className="text-lg font-semibold">{copy.person.title}</h2>
        <p className="mono mt-0.5 text-xs text-foreground/48">
          N-4-01 · § 4 VBO-N
        </p>
        {data.responsiblePersons.length ? (
          <div className="mt-3 divide-y divide-border">
            {data.responsiblePersons.map((person) => (
              <div
                key={person.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
              >
                <span>
                  <strong>{person.name}</strong> ·{" "}
                  {formatDate(person.designatedOn, locale, copy.noDate)}
                  {person.qualificationNote ? (
                    <span className="block text-xs text-foreground/58">
                      {copy.person.qualification}: {person.qualificationNote}
                    </span>
                  ) : null}
                </span>
                <form action={deleteResponsiblePersonAction}>
                  <input type="hidden" name="id" value={person.id} />
                  <button
                    type="submit"
                    className="btn btn-ghost h-9 px-2"
                    aria-label={copy.remove}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
                  </button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-foreground/58">{copy.person.empty}</p>
        )}
        <form
          action={createResponsiblePersonAction}
          className="mt-4 grid gap-2 md:grid-cols-2"
        >
          <input name="name" required placeholder={copy.person.name} className={inputClass} />
          <input
            name="designatedOn"
            type="date"
            required
            aria-label={copy.person.designatedOn}
            className={inputClass}
          />
          <input
            name="authorityDocUrl"
            placeholder={copy.person.authorityDocUrl}
            className={inputClass}
          />
          <label className="grid gap-1 text-xs text-foreground/58">
            {copy.person.authorityFile}
            <input name="authorityFile" type="file" className="text-sm" />
          </label>
          <input
            name="qualificationNote"
            placeholder={copy.person.qualificationNote}
            className={`${inputClass} md:col-span-2`}
          />
          <label className="grid gap-1 text-xs text-foreground/58">
            {copy.person.qualificationFile}
            <input name="qualificationFile" type="file" className="text-sm" />
          </label>
          <div>
            <button type="submit" className="btn btn-primary">
              {copy.add}
            </button>
          </div>
        </form>
      </section>

      {/* N-4-02: Školení vrcholného vedení */}
      <section className="rounded-lg border border-border bg-surface p-5">
        <h2 className="text-lg font-semibold">{copy.training.title}</h2>
        <p className="mono mt-0.5 text-xs text-foreground/48">
          N-4-02 · § 4 VBO-N
        </p>
        <p className="mt-2 text-sm text-foreground/58">
          {copy.training.nukibNote}{" "}
          <a
            href={NUKIB_COURSES_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[var(--accent)] underline underline-offset-2"
          >
            osveta.nukib.gov.cz
            <ExternalLink className="h-3 w-3" aria-hidden="true" strokeWidth={1.5} />
          </a>
        </p>
        {data.trainings.length ? (
          <div className="mt-3 divide-y divide-border">
            {data.trainings.map((training) => {
              const stale = isTrainingStale(training.lastRegularTrainingOn);

              return (
                <div key={training.id} className="py-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                      <strong>{training.memberName}</strong>
                      {training.memberRole ? ` · ${training.memberRole}` : ""}
                      {training.trainingSource ? (
                        <span className="block text-xs text-foreground/58">
                          {copy.training.source}: {training.trainingSource}
                        </span>
                      ) : null}
                    </span>
                    {stale ? (
                      <span className="mono rounded-full border border-[var(--status-warn-border)] bg-[var(--status-warn-subtle)] px-2.5 py-0.5 text-xs text-[var(--status-warn)]">
                        {copy.training.staleBadge}
                      </span>
                    ) : null}
                    <form action={deleteTrainingAction}>
                      <input type="hidden" name="id" value={training.id} />
                      <button
                        type="submit"
                        className="btn btn-ghost h-9 px-2"
                        aria-label={copy.remove}
                      >
                        <Trash2
                          className="h-4 w-4"
                          aria-hidden="true"
                          strokeWidth={1.5}
                        />
                      </button>
                    </form>
                  </div>
                  <form
                    action={updateTrainingDatesAction}
                    className="mt-2 flex flex-wrap items-end gap-2"
                  >
                    <input type="hidden" name="id" value={training.id} />
                    <label className="grid gap-1 text-xs text-foreground/58">
                      {copy.training.initialOn}
                      <input
                        name="initialTrainingOn"
                        type="date"
                        defaultValue={training.initialTrainingOn ?? ""}
                        className={inputClass}
                      />
                    </label>
                    <label className="grid gap-1 text-xs text-foreground/58">
                      {copy.training.lastRegularOn}
                      <input
                        name="lastRegularTrainingOn"
                        type="date"
                        defaultValue={training.lastRegularTrainingOn ?? ""}
                        className={inputClass}
                      />
                    </label>
                    <button type="submit" className="btn btn-secondary h-9 px-3">
                      {copy.training.updateDates}
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 text-sm text-foreground/58">{copy.training.empty}</p>
        )}
        <form action={createTrainingAction} className="mt-4 grid gap-2 md:grid-cols-2">
          <input
            name="memberName"
            required
            placeholder={copy.training.memberName}
            className={inputClass}
          />
          <input
            name="memberRole"
            placeholder={copy.training.memberRole}
            className={inputClass}
          />
          <label className="grid gap-1 text-xs text-foreground/58">
            {copy.training.initialOn}
            <input name="initialTrainingOn" type="date" className={inputClass} />
          </label>
          <label className="grid gap-1 text-xs text-foreground/58">
            {copy.training.lastRegularOn}
            <input name="lastRegularTrainingOn" type="date" className={inputClass} />
          </label>
          <input
            name="trainingSource"
            placeholder={copy.training.sourcePlaceholder}
            className={`${inputClass} md:col-span-2`}
          />
          <div>
            <button type="submit" className="btn btn-primary">
              {copy.add}
            </button>
          </div>
        </form>
      </section>

      {/* N-4-06: Priority obnovy */}
      <section className="rounded-lg border border-border bg-surface p-5">
        <h2 className="text-lg font-semibold">{copy.recovery.title}</h2>
        <p className="mono mt-0.5 text-xs text-foreground/48">
          N-4-06 · § 4 VBO-N
        </p>
        {data.priorities.length ? (
          <ol className="mt-3 divide-y divide-border">
            {data.priorities.map((priority) => (
              <li
                key={priority.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
              >
                <span>
                  <span className="mono text-xs text-foreground/58">
                    {priority.sortOrder}.
                  </span>{" "}
                  <strong>{priority.assetName}</strong>
                  {priority.note ? (
                    <span className="block text-xs text-foreground/58">
                      {priority.note}
                    </span>
                  ) : null}
                </span>
                <form action={deleteRecoveryPriorityAction}>
                  <input type="hidden" name="id" value={priority.id} />
                  <button
                    type="submit"
                    className="btn btn-ghost h-9 px-2"
                    aria-label={copy.remove}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
                  </button>
                </form>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-foreground/58">{copy.recovery.empty}</p>
        )}
        <form
          action={createRecoveryPriorityAction}
          className="mt-4 flex flex-wrap items-center gap-2"
        >
          <input
            name="sortOrder"
            type="number"
            required
            min={1}
            placeholder={copy.recovery.order}
            className={`${inputClass} w-24`}
          />
          <input
            name="assetName"
            required
            placeholder={copy.recovery.assetName}
            className={`${inputClass} min-w-0 flex-1`}
          />
          <input
            name="note"
            placeholder={copy.recovery.note}
            className={`${inputClass} min-w-0 flex-1`}
          />
          <button type="submit" className="btn btn-primary">
            {copy.add}
          </button>
        </form>
        <form
          action={setRecoveryApprovalAction}
          className="mt-4 flex flex-wrap items-end gap-2 border-t border-border pt-4"
        >
          <label className="grid gap-1 text-xs text-foreground/58">
            {copy.recovery.approvedOn}
            <input
              name="approvedOn"
              type="date"
              required
              defaultValue={data.approval?.approvedOn ?? ""}
              className={inputClass}
            />
          </label>
          <button type="submit" className="btn btn-secondary h-9 px-3">
            {copy.recovery.saveApproval}
          </button>
          {data.approval ? (
            <span className="text-xs text-[var(--status-pass)]">
              {copy.recovery.approvedLabel}:{" "}
              {formatDate(data.approval.approvedOn, locale, copy.noDate)}
            </span>
          ) : null}
        </form>
      </section>

      <p className="text-sm text-foreground/58">
        <Link
          href="/regulations/vbo-n"
          className="text-[var(--accent)] underline underline-offset-2"
        >
          {copy.backToCoverage}
        </Link>
      </p>
    </section>
  );
}
