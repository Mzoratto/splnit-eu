import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  FileLock2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { hasDatabaseUrl } from "@/lib/db";
import { getPublicTrustCenter } from "@/lib/db/queries/trust-center";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";
import { getTrustCenterSummary } from "@/lib/trust-center/renderer";
import { requestTrustCenterAccessAction } from "./actions";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ access?: string; requested?: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}): Promise<Metadata> {
  const { orgSlug } = await params;
  const trustData = await loadTrustCenter(orgSlug, null);

  if (!trustData) {
    return {
      title: "Trust Center",
    };
  }

  return {
    description: `Veřejné compliance skóre pro ${trustData.organisationName}.`,
    title: `${trustData.organisationName} Trust Center`,
  };
}

export default async function TrustCenterPage({
  params,
  searchParams,
}: PageProps) {
  const [{ orgSlug }, query] = await Promise.all([params, searchParams]);
  const trustData = await loadTrustCenter(orgSlug, query.access ?? null);

  if (!trustData) {
    notFound();
  }

  const locked = trustData.ndaRequired && !trustData.accessGranted;
  const summary = getTrustCenterSummary(locked ? [] : trustData.frameworks);

  return (
    <main className="min-h-screen bg-background">
      <section
        className="border-b border-border text-white"
        style={{ backgroundColor: trustData.accentColor }}
      >
        <div className="mx-auto max-w-6xl px-5 py-14">
          <div className="flex items-center gap-3">
            {trustData.logoUrl ? (
              <span
                aria-hidden="true"
                className="h-9 w-9 rounded-md bg-white/12 object-contain p-1"
                style={{
                  backgroundImage: `url(${trustData.logoUrl})`,
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "contain",
                }}
              />
            ) : (
              <ShieldCheck className="h-7 w-7 text-white" aria-hidden="true" />
            )}
            <span className="text-sm uppercase tracking-[0.16em] text-white/70">
              Trust Center
            </span>
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-normal">
            {trustData.organisationName}
          </h1>
          <p className="mt-3 max-w-2xl text-white/75">
            Veřejný přehled vybraných compliance frameworků, automatických testů
            a dostupných bezpečnostních důkazů.
          </p>
          <p className="mt-6 inline-flex rounded-md bg-white/12 px-3 py-2 text-sm text-white/78">
            Verified automatically · Last test:{" "}
            {formatRelativeTime(trustData.lastTestedAt)}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-8 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-sm text-foreground/58">Frameworky</p>
          <p className="mt-2 font-mono text-3xl font-semibold text-primary">
            {summary.frameworkCount}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-sm text-foreground/58">Průměrné skóre</p>
          <p className="mt-2 font-mono text-3xl font-semibold text-primary">
            {locked ? "NDA" : `${summary.averageScore ?? "-"}%`}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-sm text-foreground/58">NDA gate</p>
          <p className="mt-2 text-lg font-semibold">
            {trustData.ndaRequired ? "Vyžadováno" : "Nevyžadováno"}
          </p>
        </div>
      </section>

      {locked ? (
        <section className="mx-auto max-w-6xl px-5 pb-16">
          <div className="grid gap-4 rounded-lg border border-border bg-surface p-5 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <div className="flex items-center gap-2">
                <LockKeyhole className="h-5 w-5 text-primary" aria-hidden="true" />
                <h2 className="text-lg font-semibold">NDA přístup</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-foreground/64">
                Detailní skóre a frameworky jsou dostupné po schválení žádosti.
                Schválený odkaz platí 24 hodin.
              </p>
              {query.requested === "1" ? (
                <p className="mt-4 inline-flex rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  Žádost byla odeslána vlastníkovi Trust Center.
                </p>
              ) : null}
            </div>
            <form
              action={requestTrustCenterAccessAction.bind(null, orgSlug)}
              className="space-y-4"
            >
              <label className="grid gap-2 text-sm">
                Pracovní email
                <input
                  name="email"
                  required
                  type="email"
                  className="rounded-md border border-border bg-background px-3 py-2"
                />
              </label>
              <label className="grid gap-2 text-sm">
                Firma
                <input
                  name="company"
                  className="rounded-md border border-border bg-background px-3 py-2"
                />
              </label>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
              >
                Požádat o přístup
                <FileLock2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </section>
      ) : (
        <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-16 md:grid-cols-2">
          {trustData.frameworks.map((item) => (
            <article
              key={item.framework.slug}
              className="rounded-lg border border-border bg-surface p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-foreground/58">
                    {item.framework.regulator}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">
                    {item.framework.nameCs}
                  </h2>
                </div>
                <span className="rounded-md bg-surface-muted px-2 py-1 text-xs">
                  {item.status}
                </span>
              </div>
              <p className="mt-5 font-mono text-3xl font-semibold text-primary">
                {item.score ?? "-"}%
              </p>
              <div className="mt-4 h-2 rounded-full bg-surface-muted">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${item.score ?? 0}%` }}
                />
              </div>
              <p className="mt-4 flex items-center gap-2 text-sm text-foreground/58">
                <CheckCircle2 className="h-4 w-4 text-accent" aria-hidden="true" />
                Verified automatically where integrations are connected
              </p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

function loadDemoTrustCenter(orgSlug: string) {
  if (orgSlug !== "demo") {
    return null;
  }

  return {
    accessGranted: true,
    accentColor: "#1b7f5a",
    frameworks: FRAMEWORK_LIBRARY.slice(0, 3).map((framework, index) => ({
      framework,
      score: [72, 64, 81][index] ?? null,
      status: "active",
    })),
    lastTestedAt: new Date(Date.now() - 11 * 60 * 1000),
    logoUrl: null,
    ndaRequired: false,
    organisationName: "Demo organizace",
    subdomain: "demo",
  };
}

async function loadTrustCenter(orgSlug: string, accessToken: string | null) {
  if (!hasDatabaseUrl()) {
    return loadDemoTrustCenter(orgSlug);
  }

  const data = await getPublicTrustCenter({ accessToken, orgSlug }).catch(
    () => null,
  );

  return data ?? loadDemoTrustCenter(orgSlug);
}

function formatRelativeTime(value: Date | string | null | undefined) {
  if (!value) {
    return "not run yet";
  }

  const diffMinutes = Math.max(
    0,
    Math.round((Date.now() - new Date(value).getTime()) / 60_000),
  );

  if (diffMinutes < 1) {
    return "just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  return `${diffHours} h ago`;
}
