import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  controls,
  frameworkControls,
  frameworks,
  organisations,
  orgControlStatuses,
  orgFrameworks,
  profiles,
  vendorAssessments,
  vendors,
} from "@/lib/db/schema";

export type OrgDocumentMetadata = Awaited<ReturnType<typeof getOrgDocumentMetadata>>;
export type GapAnalysisRow = Awaited<ReturnType<typeof getGapAnalysisData>>[number];
export type SoAData = Awaited<ReturnType<typeof getSoAData>>;
export type VendorReportRow = Awaited<ReturnType<typeof getVendorReportData>>[number];

export async function getOrgDocumentMetadata(orgId: string) {
  const db = getDb();
  const [organisationRows, responsibleRows] = await Promise.all([
    db
      .select({
        country: organisations.country,
        dic: organisations.dic,
        employeeCount: organisations.employeeCount,
        ico: organisations.ico,
        name: organisations.name,
        sector: organisations.sector,
        sidlo: organisations.sidlo,
      })
      .from(organisations)
      .where(eq(organisations.clerkOrgId, orgId))
      .limit(1),
    db
      .select({
        email: profiles.email,
        fullName: profiles.fullName,
      })
      .from(profiles)
      .where(
        and(
          eq(profiles.clerkOrgId, orgId),
          inArray(profiles.role, ["admin", "owner", "org:admin"]),
        ),
      )
      .limit(1),
  ]);
  const organisation = organisationRows[0] ?? null;
  const responsiblePerson = responsibleRows[0] ?? null;

  return {
    country: organisation?.country ?? null,
    dic: organisation?.dic ?? null,
    employeeCount: organisation?.employeeCount ?? null,
    ico: organisation?.ico ?? null,
    name: organisation?.name ?? orgId,
    responsiblePerson: responsiblePerson?.email || responsiblePerson?.fullName
      ? {
          email: responsiblePerson.email,
          fullName: responsiblePerson.fullName,
        }
      : null,
    sector: organisation?.sector ?? null,
    sidlo: organisation?.sidlo ?? null,
  };
}

export async function getGapAnalysisData(orgId: string, frameworkSlug: string) {
  const db = getDb();

  return db
    .select({
      assignedTo: sql<string>`coalesce(${orgControlStatuses.assignedTo}, '')`,
      category: controls.category,
      controlKey: controls.key,
      lastTestedAt: orgControlStatuses.lastTestedAt,
      notes: sql<string>`coalesce(${orgControlStatuses.notes}, '')`,
      status: sql<string>`coalesce(${orgControlStatuses.status}, 'not_started')`,
      title: sql<string>`coalesce(${frameworkControls.localizedTitle}, ${controls.titleCs})`,
    })
    .from(frameworkControls)
    .innerJoin(frameworks, eq(frameworkControls.frameworkId, frameworks.id))
    .innerJoin(controls, eq(frameworkControls.controlId, controls.id))
    .leftJoin(
      orgControlStatuses,
      and(
        eq(orgControlStatuses.controlId, controls.id),
        eq(orgControlStatuses.clerkOrgId, orgId),
      ),
    )
    .where(eq(frameworks.slug, frameworkSlug))
    .orderBy(frameworkControls.sortOrder);
}

export async function getSoAData(orgId: string) {
  const db = getDb();
  const [controlsData, orgFrameworkRows] = await Promise.all([
    getGapAnalysisData(orgId, "iso27001"),
    db
      .select({
        score: orgFrameworks.score,
        status: orgFrameworks.status,
      })
      .from(orgFrameworks)
      .innerJoin(frameworks, eq(orgFrameworks.frameworkId, frameworks.id))
      .where(
        and(
          eq(orgFrameworks.clerkOrgId, orgId),
          eq(frameworks.slug, "iso27001"),
        ),
      )
      .limit(1),
  ]);

  return {
    controls: controlsData,
    framework: orgFrameworkRows[0] ?? null,
  };
}

export async function getVendorReportData(orgId: string) {
  const db = getDb();
  const vendorRows = await db
    .select({
      category: vendors.category,
      id: vendors.id,
      lastAssessedAt: vendors.lastAssessedAt,
      name: vendors.name,
      nextReviewAt: vendors.nextReviewAt,
      riskTier: vendors.riskTier,
      status: vendors.status,
      website: vendors.website,
    })
    .from(vendors)
    .where(eq(vendors.clerkOrgId, orgId))
    .orderBy(
      desc(sql<number>`case ${vendors.riskTier}
        when 'critical' then 4
        when 'high' then 3
        when 'medium' then 2
        when 'low' then 1
        else 0
      end`),
      asc(vendors.name),
    );

  if (vendorRows.length === 0) {
    return [];
  }

  const assessmentRows = await db
    .select({
      assessedAt: vendorAssessments.assessedAt,
      score: vendorAssessments.score,
      status: vendorAssessments.status,
      vendorId: vendorAssessments.vendorId,
    })
    .from(vendorAssessments)
    .where(
      and(
        eq(vendorAssessments.clerkOrgId, orgId),
        inArray(vendorAssessments.vendorId, vendorRows.map((vendor) => vendor.id)),
      ),
    )
    .orderBy(desc(vendorAssessments.assessedAt));
  const latestAssessmentByVendorId = new Map<
    string,
    {
      assessedAt: Date | null;
      score: number | null;
      status: string;
    }
  >();

  for (const assessment of assessmentRows) {
    if (!latestAssessmentByVendorId.has(assessment.vendorId)) {
      latestAssessmentByVendorId.set(assessment.vendorId, {
        assessedAt: assessment.assessedAt,
        score: assessment.score,
        status: assessment.status,
      });
    }
  }

  return vendorRows.map((vendor) => ({
    ...vendor,
    latestAssessment: latestAssessmentByVendorId.get(vendor.id) ?? null,
  }));
}
