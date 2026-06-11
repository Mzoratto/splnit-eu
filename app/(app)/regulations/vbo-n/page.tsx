import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { PageHeader } from "@/components/app/page-header";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale } from "@/i18n/routing";
import { hasDatabaseUrl } from "@/lib/db";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { getOrgStatusesByControlKey } from "@/lib/db/queries/vbo-n";
import {
  computeVboNCoverage,
  groupVboNCoverage,
  summarizeVboNCoverage,
  type VboNCoverageItem,
  type VboNCoverageStatus,
} from "@/lib/regulations/vbo-n/coverage";
import { VBO_N_SPEC } from "@/lib/regulations/vbo-n/spec";

export const dynamic = "force-dynamic";

const COVERAGE_CHIP_CLASS: Record<VboNCoverageStatus, string> = {
  covered:
    "border-[var(--status-pass-border)] bg-[var(--status-pass-subtle)] text-[var(--status-pass)]",
  partial:
    "border-[var(--status-warn-border)] bg-[var(--status-warn-subtle)] text-[var(--status-warn)]",
  missing:
    "border-[var(--status-fail-border)] bg-[var(--status-fail-subtle)] text-[var(--status-fail)]",
};

async function loadCoverage() {
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

  const statusesByControlKey = await getOrgStatusesByControlKey(session.orgId);
  const items = computeVboNCoverage({ statusesByControlKey });

  return { items, organisationLocale: organisation.locale ?? null };
}

function CoverageRow({
  item,
  copy,
}: {
  item: VboNCoverageItem;
  copy: ReturnType<typeof getMessagesForLocale>["vboN"];
}) {
  return (
    <div className="grid gap-2 border-t border-border py-3 text-sm md:grid-cols-[110px_1fr_120px]">
      <span className="mono text-xs text-foreground/58">{item.id}</span>
      <span>
        <span className="block leading-6">{item.control}</span>
        <span className="mono mt-1 block text-xs text-foreground/48">
          {item.ref}
        </span>
        {item.mappedControls.length ? (
          <span className="mt-1 block text-xs text-foreground/58">
            {copy.mappedControlsLabel}:{" "}
            {item.mappedControls.map((mapped) => mapped.controlKey).join(", ")}
          </span>
        ) : null}
      </span>
      <span
        className={`mono inline-flex h-fit items-center justify-self-start rounded-full border px-2.5 py-0.5 text-xs md:justify-self-end ${COVERAGE_CHIP_CLASS[item.coverage]}`}
      >
        {copy.coverage[item.coverage]}
      </span>
    </div>
  );
}

export default async function VboNCoveragePage() {
  const data = await loadCoverage();

  if (!data) {
    notFound();
  }

  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const locale = normalizeLocale(data.organisationLocale) ?? requestLocale;
  const copy = getMessagesForLocale(locale).vboN;
  const summary = summarizeVboNCoverage(data.items);
  const gaps = data.items.filter((item) => item.coverage === "missing");
  const grouped = groupVboNCoverage(data.items);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {(["covered", "partial", "missing"] as const).map((status) => (
          <div key={status} className="rounded-lg border border-border bg-surface p-4">
            <p className="text-xs text-foreground/52">{copy.coverage[status]}</p>
            <p className="mt-1 font-mono text-2xl font-semibold">
              {summary[status]}
              <span className="text-sm font-normal text-foreground/48">
                {" "}
                / {summary.total}
              </span>
            </p>
          </div>
        ))}
      </div>

      {gaps.length ? (
        <section className="rounded-lg border border-[var(--status-fail-border)] bg-surface p-5">
          <h2 className="text-lg font-semibold">{copy.gapsTitle}</h2>
          <p className="mt-1 text-sm text-foreground/58">{copy.gapsSubtitle}</p>
          <div className="mt-3">
            {gaps.map((item) => (
              <CoverageRow key={item.id} item={item} copy={copy} />
            ))}
          </div>
        </section>
      ) : null}

      {grouped.map((tierGroup) => (
        <section
          key={tierGroup.tier}
          className="rounded-lg border border-border bg-surface p-5"
        >
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">
              {copy.tiers[tierGroup.tier === "neopominutelné" ? "neopominutelne" : "vyhodnotitelne"].title}
            </h2>
            <span className="mono rounded-full border border-[var(--accent-border)] bg-[var(--accent-subtle)] px-2.5 py-0.5 text-xs text-[var(--accent)]">
              {copy.tiers[tierGroup.tier === "neopominutelné" ? "neopominutelne" : "vyhodnotitelne"].badge}
            </span>
          </div>
          {tierGroup.areas.map((areaGroup) => (
            <div key={areaGroup.area} className="mt-4">
              <h3 className="text-sm font-semibold text-foreground/72">
                {areaGroup.area}
              </h3>
              <div className="mt-2">
                {areaGroup.items.map((item) => (
                  <CoverageRow key={item.id} item={item} copy={copy} />
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}

      <p className="text-xs leading-5 text-foreground/52">
        {copy.sourceNote} {VBO_N_SPEC.meta.source}
      </p>
    </section>
  );
}
