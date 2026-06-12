import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { and, eq, ilike, or } from "drizzle-orm";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import {
  controls,
  incidents,
  policies,
  riskItems,
  vendors,
} from "@/lib/db/schema";
import { buildSearchPattern, isSearchableQuery } from "@/lib/search/query";

export type GlobalSearchResult = {
  href: string;
  subtitle: string | null;
  title: string;
};

export type GlobalSearchGroup = {
  category: "controls" | "vendors" | "incidents" | "risks" | "policies";
  results: GlobalSearchResult[];
};

const RESULTS_PER_CATEGORY = 5;

export async function GET(request: Request) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ groups: [] });
  }

  const session = await auth();

  if (!session.userId || !session.orgId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const query = new URL(request.url).searchParams.get("q") ?? "";

  if (!isSearchableQuery(query)) {
    return NextResponse.json({ groups: [] });
  }

  const pattern = buildSearchPattern(query);
  const db = getDb();
  const orgId = session.orgId;

  const [controlRows, vendorRows, incidentRows, riskRows, policyRows] =
    await Promise.all([
      db
        .select({ key: controls.key, titleCs: controls.titleCs, titleEn: controls.titleEn })
        .from(controls)
        .where(
          or(
            ilike(controls.titleCs, pattern),
            ilike(controls.titleEn, pattern),
            ilike(controls.key, pattern),
          ),
        )
        .limit(RESULTS_PER_CATEGORY),
      db
        .select({ id: vendors.id, name: vendors.name, website: vendors.website })
        .from(vendors)
        .where(and(eq(vendors.clerkOrgId, orgId), ilike(vendors.name, pattern)))
        .limit(RESULTS_PER_CATEGORY),
      db
        .select({ id: incidents.id, severity: incidents.severity, title: incidents.title })
        .from(incidents)
        .where(and(eq(incidents.clerkOrgId, orgId), ilike(incidents.title, pattern)))
        .limit(RESULTS_PER_CATEGORY),
      db
        .select({ category: riskItems.category, id: riskItems.id, title: riskItems.title })
        .from(riskItems)
        .where(and(eq(riskItems.clerkOrgId, orgId), ilike(riskItems.title, pattern)))
        .limit(RESULTS_PER_CATEGORY),
      db
        .select({ titleCs: policies.titleCs, type: policies.type })
        .from(policies)
        .where(and(eq(policies.clerkOrgId, orgId), ilike(policies.titleCs, pattern)))
        .limit(RESULTS_PER_CATEGORY),
    ]);

  const groups: GlobalSearchGroup[] = [
    {
      category: "controls" as const,
      results: controlRows.map((row) => ({
        href: `/controls/${row.key}`,
        subtitle: row.key,
        title: row.titleCs || row.titleEn,
      })),
    },
    {
      category: "vendors" as const,
      results: vendorRows.map((row) => ({
        href: `/vendors/${row.id}`,
        subtitle: row.website,
        title: row.name,
      })),
    },
    {
      category: "incidents" as const,
      results: incidentRows.map((row) => ({
        href: "/incidents",
        subtitle: row.severity,
        title: row.title,
      })),
    },
    {
      category: "risks" as const,
      results: riskRows.map((row) => ({
        href: "/risks",
        subtitle: row.category,
        title: row.title,
      })),
    },
    {
      category: "policies" as const,
      results: policyRows.map((row) => ({
        href: `/policies/${row.type}`,
        subtitle: null,
        title: row.titleCs,
      })),
    },
  ].filter((group) => group.results.length > 0);

  return NextResponse.json({ groups });
}
