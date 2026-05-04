import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { ArrowRight, FileText, Plus, ShieldAlert } from "lucide-react";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { hasDatabaseUrl } from "@/lib/db";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { listVendorsForOrg } from "@/lib/db/queries/vendors";
import { createVendorAction } from "./actions";

export const dynamic = "force-dynamic";

async function loadVendors() {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return null;
  }

  const session = await auth();

  if (!session.orgId) {
    return {
      organisationLocale: null,
      vendors: null,
    };
  }

  const [organisation, vendors] = await Promise.all([
    getOrganisationByClerkOrgId(session.orgId).catch(() => null),
    listVendorsForOrg(session.orgId).catch(() => null),
  ]);

  return {
    organisationLocale: organisation?.locale ?? null,
    vendors,
  };
}

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

function tierClass(tier: string | null) {
  if (tier === "low") {
    return "bg-emerald-50 text-emerald-800";
  }

  if (tier === "medium") {
    return "bg-blue-50 text-blue-800";
  }

  if (tier === "high") {
    return "bg-amber-50 text-amber-900";
  }

  if (tier === "critical") {
    return "bg-red-50 text-red-800";
  }

  return "bg-surface-muted text-foreground/58";
}

export default async function VendorsPage() {
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const data = await loadVendors();
  const locale = normalizeLocale(data?.organisationLocale) ?? requestLocale;
  const copy = getMessagesForLocale(locale).vendorsPage;
  const vendors = data?.vendors ?? null;
  const rows =
    vendors ?? [
      {
        category: "cloud",
        createdAt: new Date(),
        id: "demo-cloud",
        name: "Demo Cloud Provider",
        nextReviewAt: new Date().toISOString().slice(0, 10),
        riskTier: "medium",
        status: "assessed",
        website: "https://example.com",
        clerkOrgId: "demo",
        lastAssessedAt: new Date().toISOString().slice(0, 10),
      },
    ];
  const canMutate = Boolean(vendors);

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
        <a
          href="/api/vendors/supply-chain-report"
          className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted"
        >
          {copy.exportReport}
          <FileText className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.4fr]">
        <section className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">{copy.form.title}</h2>
          </div>
          <form action={createVendorAction} className="mt-5 space-y-4">
            <label className="grid gap-2 text-sm">
              {copy.form.name}
              <input
                name="name"
                required
                disabled={!canMutate}
                className="rounded-md border border-border bg-background px-3 py-2"
              />
            </label>
            <label className="grid gap-2 text-sm">
              {copy.form.website}
              <input
                name="website"
                type="url"
                disabled={!canMutate}
                className="rounded-md border border-border bg-background px-3 py-2"
              />
            </label>
            <label className="grid gap-2 text-sm">
              {copy.form.category}
              <select
                name="category"
                disabled={!canMutate}
                className="rounded-md border border-border bg-background px-3 py-2"
              >
                <option value="cloud">cloud</option>
                <option value="saas">saas</option>
                <option value="hr">hr</option>
                <option value="finance">finance</option>
                <option value="security">security</option>
              </select>
            </label>
            <button
              type="submit"
              disabled={!canMutate}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copy.form.create}
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-border bg-surface">
          <div className="flex items-center gap-2 border-b border-border p-5">
            <ShieldAlert className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">{copy.catalog.title}</h2>
          </div>
          <div className="divide-y divide-border">
            {rows.map((vendor) => (
              <Link
                key={vendor.id}
                href={`/vendors/${vendor.id}`}
                className="grid gap-4 p-5 hover:bg-surface-muted md:grid-cols-[1fr_auto]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{vendor.name}</p>
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-medium ${tierClass(
                        vendor.riskTier,
                      )}`}
                    >
                      {vendor.riskTier
                        ? copy.riskTiers[vendor.riskTier as keyof typeof copy.riskTiers] ?? vendor.riskTier
                        : copy.statuses.pending}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-foreground/58">
                    {vendor.category ?? copy.emptyValue} ·{" "}
                    {copy.statuses[vendor.status as keyof typeof copy.statuses] ??
                      vendor.status}
                  </p>
                  <p className="mt-1 text-sm text-foreground/58">
                    {copy.catalog.nextReview}{" "}
                    {formatDate(vendor.nextReviewAt, locale, copy.noDate)}
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-medium">
                  {copy.catalog.detail}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
