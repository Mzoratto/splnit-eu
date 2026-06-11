import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { Download, FileCheck2 } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { PrehledEntryForm } from "@/components/vbo-n/prehled-entry-form";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { hasDatabaseUrl } from "@/lib/db";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { getPrehledEntries, listPrehledVersions } from "@/lib/db/queries/prehled";
import { PREHLED_RETENTION_NOTE, REVIEW_DISCLAIMER } from "@/lib/export/constants";
import {
  getAllowedPrehledStatuses,
  isPrehledVersionStale,
  type PrehledStatus,
} from "@/lib/regulations/vbo-n/prehled";
import { VBO_N_CONTROLS } from "@/lib/regulations/vbo-n/spec";
import {
  generatePrehledVersionAction,
  savePrehledEntryAction,
} from "./actions";

export const dynamic = "force-dynamic";

async function loadPrehledData() {
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

  const [entries, versions] = await Promise.all([
    getPrehledEntries(session.orgId),
    listPrehledVersions(session.orgId),
  ]);

  return { entries, organisationLocale: organisation.locale ?? null, versions };
}

function formatDate(value: Date | string, locale: Locale) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export default async function PrehledPage() {
  const data = await loadPrehledData();

  if (!data) {
    notFound();
  }

  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const locale = normalizeLocale(data.organisationLocale) ?? requestLocale;
  const copy = getMessagesForLocale(locale).vboN.prehled;
  const entriesById = new Map(data.entries.map((entry) => [entry.baselineId, entry]));
  const newestVersion = data.versions[0] ?? null;
  const showStaleBanner = isPrehledVersionStale(newestVersion?.createdAt);
  const filledCount = data.entries.length;

  const tiers = (["neopominutelné", "vyhodnotitelné"] as const).map((tier) => ({
    areas: [
      ...new Set(
        VBO_N_CONTROLS.filter((control) => control.tier === tier).map(
          (control) => control.area,
        ),
      ),
    ].map((area) => ({
      area,
      controls: VBO_N_CONTROLS.filter(
        (control) => control.tier === tier && control.area === area,
      ),
    })),
    tier,
  }));

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
      />

      {showStaleBanner ? (
        <div className="rounded-lg border border-[var(--status-warn-border)] bg-[var(--status-warn-subtle)] px-4 py-3 text-sm text-[var(--status-warn)]">
          {copy.staleBanner}
        </div>
      ) : null}

      <section className="rounded-lg border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{copy.versionsTitle}</h2>
            <p className="mt-1 text-sm text-foreground/58">
              {copy.versionsFilled
                .replace("{filled}", String(filledCount))
                .replace("{total}", String(VBO_N_CONTROLS.length))}{" "}
              · {PREHLED_RETENTION_NOTE}
            </p>
          </div>
          <form action={generatePrehledVersionAction}>
            <button type="submit" className="btn btn-primary">
              {copy.generate}
              <FileCheck2 className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            </button>
          </form>
        </div>
        {data.versions.length ? (
          <div className="mt-4 divide-y divide-border">
            {data.versions.map((version) => (
              <div
                key={version.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
              >
                <span>
                  <span className="mono">v{version.versionNumber}</span> ·{" "}
                  {formatDate(version.createdAt, locale)}
                </span>
                <Link
                  href={`/api/vbo-n/prehled/versions/${version.id}`}
                  className="btn btn-secondary h-9 px-3"
                >
                  {copy.download}
                  <Download className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-foreground/58">{copy.noVersions}</p>
        )}
      </section>

      {tiers.map((tierGroup) => (
        <section
          key={tierGroup.tier}
          className="rounded-lg border border-border bg-surface p-5"
        >
          <h2 className="text-lg font-semibold">
            {tierGroup.tier === "neopominutelné"
              ? copy.tierNeopominutelne
              : copy.tierVyhodnotitelne}
          </h2>
          {tierGroup.tier === "neopominutelné" ? (
            <p className="mt-1 text-sm text-foreground/58">{copy.neopominutelneNote}</p>
          ) : null}
          {tierGroup.areas.map((areaGroup) => (
            <div key={areaGroup.area} className="mt-4">
              <h3 className="text-sm font-semibold text-foreground/72">
                {areaGroup.area}
              </h3>
              {areaGroup.controls.map((control) => {
                const entry = entriesById.get(control.id) ?? null;

                return (
                  <div key={control.id} className="border-t border-border py-3">
                    <p className="text-sm leading-6">
                      <span className="mono text-xs text-foreground/58">
                        {control.id}
                      </span>{" "}
                      · {control.control}
                    </p>
                    <p className="mono mt-0.5 text-xs text-foreground/48">
                      {control.ref}
                    </p>
                    <PrehledEntryForm
                      baselineId={control.id}
                      allowedStatuses={getAllowedPrehledStatuses(control.id)}
                      initial={{
                        implementationNote: entry?.implementationNote ?? null,
                        justification: entry?.justification ?? null,
                        plannedDate: entry?.plannedDate ?? null,
                        priority: entry?.priority ?? null,
                        responsiblePerson: entry?.responsiblePerson ?? null,
                        status: (entry?.status as PrehledStatus | undefined) ?? null,
                      }}
                      copy={copy.entryForm}
                      action={savePrehledEntryAction}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </section>
      ))}

      <p className="text-xs leading-5 text-foreground/52">{REVIEW_DISCLAIMER}</p>
    </section>
  );
}
