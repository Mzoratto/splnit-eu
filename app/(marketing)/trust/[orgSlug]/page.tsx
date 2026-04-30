import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ShieldCheck } from "lucide-react";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import {
  frameworks,
  organisations,
  orgFrameworks,
  trustCenters,
} from "@/lib/db/schema";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";
import { getTrustCenterSummary } from "@/lib/trust-center/renderer";

export const dynamic = "force-dynamic";

export default async function TrustCenterPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const trustData = hasDatabaseUrl()
    ? await loadTrustCenterFromDb(orgSlug)
    : loadDemoTrustCenter(orgSlug);

  if (!trustData) {
    notFound();
  }

  const summary = getTrustCenterSummary(trustData.frameworks);

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-[#102019] text-white">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-[#72d8b6]" aria-hidden="true" />
            <span className="text-sm uppercase tracking-[0.16em] text-white/64">
              Trust Center
            </span>
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-normal">
            {trustData.organisationName}
          </h1>
          <p className="mt-3 max-w-2xl text-white/70">
            Veřejný přehled vybraných compliance frameworků, které organizace
            zpřístupnila zákazníkům a partnerům.
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
            {summary.averageScore ?? "-"}%
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-sm text-foreground/58">NDA gate</p>
          <p className="mt-2 text-lg font-semibold">
            {trustData.ndaRequired ? "Vyžadováno" : "Nevyžadováno"}
          </p>
        </div>
      </section>
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
          </article>
        ))}
      </section>
    </main>
  );
}

function loadDemoTrustCenter(orgSlug: string) {
  if (orgSlug !== "demo") {
    return null;
  }

  return {
    organisationName: "Demo organizace",
    ndaRequired: false,
    frameworks: FRAMEWORK_LIBRARY.slice(0, 3).map((framework, index) => ({
      framework,
      status: "active",
      score: [72, 64, 81][index] ?? null,
    })),
  };
}

async function loadTrustCenterFromDb(orgSlug: string) {
  const db = getDb();
  const rows = await db
    .select({
      trustCenter: trustCenters,
      organisation: organisations,
    })
    .from(trustCenters)
    .innerJoin(
      organisations,
      eq(trustCenters.clerkOrgId, organisations.clerkOrgId),
    )
    .where(eq(trustCenters.subdomain, orgSlug))
    .limit(1);

  const row = rows[0];
  if (!row || !row.trustCenter.isPublic) {
    return null;
  }

  const enrolled = await db
    .select({
      framework: frameworks,
      score: orgFrameworks.score,
      status: orgFrameworks.status,
    })
    .from(orgFrameworks)
    .innerJoin(frameworks, eq(orgFrameworks.frameworkId, frameworks.id))
    .where(eq(orgFrameworks.clerkOrgId, row.trustCenter.clerkOrgId));

  return {
    organisationName: row.organisation.name,
    ndaRequired: row.trustCenter.ndaRequired,
    frameworks: enrolled.map((item) => ({
      framework: {
        slug: item.framework.slug as (typeof FRAMEWORK_LIBRARY)[number]["slug"],
        nameCs: item.framework.nameCs,
        nameEn: item.framework.nameEn,
        descriptionCs: item.framework.descriptionCs ?? "",
        regulator: (item.framework.regulator ?? "ISO") as (typeof FRAMEWORK_LIBRARY)[number]["regulator"],
        mandatoryDeadline: item.framework.mandatoryDeadline,
        version: item.framework.version ?? "",
      },
      score: item.score,
      status: item.status,
    })),
  };
}
