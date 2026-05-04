import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { hasDatabaseUrl, getDb } from "@/lib/db";
import { getPublicTrustCenter } from "@/lib/db/queries/trust-center";
import {
  controls,
  frameworkControls,
  integrationRuns,
  orgControlStatuses,
} from "@/lib/db/schema";
import {
  CATEGORY_META,
  normalizeControlCategory,
  type CategoryStatus,
  type PublicControlCategory,
} from "@/lib/frameworks/categories";
import { FRAMEWORK_LIBRARY, type FrameworkSeed } from "@/lib/frameworks/registry";

export type PublicTrustDocument = {
  description: string;
  frameworkSlugs: string[];
  href: string;
  id: string;
  isLocked: boolean;
  title: string;
};

export type TrustSignal = {
  icon: "server" | "shield" | "badge" | "radar" | "activity";
  label: string;
  value: string;
};

export type TrustFrameworkCategory = {
  category: PublicControlCategory;
  description: string;
  icon: string;
  inProgress: number;
  name: string;
  notApplicable: number;
  status: CategoryStatus;
  total: number;
  verified: number;
};

export type PublicFrameworkRecord = {
  descriptionCs?: string | null;
  id?: string;
  mandatoryDeadline?: Date | string | null;
  nameCs: string;
  nameEn: string;
  regulator?: string | null;
  slug: string;
  version?: string | null;
};

export type TrustFramework = {
  categories: TrustFrameworkCategory[];
  effectiveDate: string;
  framework: PublicFrameworkRecord;
  inProgress: number;
  lastAssessedAt: Date | null;
  law: string;
  maxPenalty: string;
  notApplicable: number;
  regulator: string;
  score: number | null;
  statusLabel: "VERIFIED" | "IN PROGRESS" | "MONITORED";
  statusTone: "pass" | "warn" | "neutral";
  totalControls: number;
  verified: number;
};

export type PublicTrustCenterModel = {
  accentColor: string;
  documents: PublicTrustDocument[];
  frameworks: TrustFramework[];
  lastTestedAt: Date | null;
  logoUrl: string | null;
  nextTestAt: Date | null;
  organisationName: string;
  orgSlug: string;
  showFrameworkDrilldown: boolean;
  showFrameworkPercentages: boolean;
  trustSignals: TrustSignal[];
  uptimePct: number | null;
};

type ControlStatusRow = {
  category: string | null;
  frameworkId: string;
  lastTestedAt: Date | null;
  status: string | null;
};

const PUBLIC_DOCUMENTS: PublicTrustDocument[] = [
  {
    description: "Nezávislé ověření kontrol a provozních procesů.",
    frameworkSlugs: ["iso27001", "nis2"],
    href: "mailto:hello@splnit.eu?subject=Request%20SOC%202%20report",
    id: "soc2",
    isLocked: true,
    title: "SOC 2 report",
  },
  {
    description: "Statement of Applicability pro ISO 27001.",
    frameworkSlugs: ["iso27001"],
    href: "mailto:hello@splnit.eu?subject=Request%20ISO%2027001%20SoA",
    id: "iso-soa",
    isLocked: true,
    title: "ISO 27001 SoA",
  },
  {
    description: "Souhrn posledního penetračního testu.",
    frameworkSlugs: ["nis2", "iso27001"],
    href: "mailto:hello@splnit.eu?subject=Request%20penetration%20test%20summary",
    id: "pentest",
    isLocked: true,
    title: "Pen test summary",
  },
  {
    description: "Veřejné informace o zpracování osobních údajů.",
    frameworkSlugs: ["gdpr"],
    href: "/soukromi",
    id: "privacy-policy",
    isLocked: false,
    title: "Privacy Policy",
  },
  {
    description: "Vzor smlouvy o zpracování osobních údajů.",
    frameworkSlugs: ["gdpr"],
    href: "/dpa",
    id: "dpa",
    isLocked: false,
    title: "DPA template",
  },
  {
    description: "Aktuální seznam hlavních subdodavatelů.",
    frameworkSlugs: ["gdpr", "nis2", "iso27001"],
    href: "/soukromi#subprocessors",
    id: "subprocessors",
    isLocked: false,
    title: "Sub-processor list",
  },
  {
    description: "Přehled bezpečnostní architektury a provozních opatření.",
    frameworkSlugs: ["nis2", "iso27001"],
    href: "mailto:hello@splnit.eu?subject=Security%20Whitepaper",
    id: "whitepaper",
    isLocked: false,
    title: "Security Whitepaper",
  },
  {
    description: "Dostupnost služby, reakční časy a provozní odpovědnosti.",
    frameworkSlugs: ["nis2", "iso27001"],
    href: "mailto:hello@splnit.eu?subject=SLA",
    id: "sla",
    isLocked: false,
    title: "SLA",
  },
];

const REGULATION_META: Record<
  string,
  { effectiveDate: string; law: string; maxPenalty: string; regulator: string }
> = {
  "ai-act": {
    effectiveDate: "Srpen 2026",
    law: "Nařízení (EU) 2024/1689",
    maxPenalty: "Až €35M nebo 7% obratu",
    regulator: "ČTÚ",
  },
  csrd: {
    effectiveDate: "Leden 2024",
    law: "Směrnice (EU) 2022/2464",
    maxPenalty: "Dle národní transpozice",
    regulator: "MŽP",
  },
  gdpr: {
    effectiveDate: "Květen 2018",
    law: "GDPR + zákon č. 110/2019 Sb.",
    maxPenalty: "Až €20M nebo 4% obratu",
    regulator: "ÚOOÚ",
  },
  iso27001: {
    effectiveDate: "Říjen 2022",
    law: "ISO/IEC 27001:2022",
    maxPenalty: "Není zákonná pokuta",
    regulator: "ISO",
  },
  nis2: {
    effectiveDate: "Říjen 2024",
    law: "Zákon č. 264/2025 Sb.",
    maxPenalty: "Až €10M nebo 2% obratu",
    regulator: "NÚKIB",
  },
};

export async function getPublicTrustCenterModel(input: {
  accessToken?: string | null;
  orgSlug: string;
}): Promise<PublicTrustCenterModel | null> {
  if (hasDatabaseUrl()) {
    const model = await loadDatabaseTrustCenter(input).catch(() => null);

    if (model) {
      return model;
    }
  }

  return input.orgSlug === "demo" ? getDemoTrustCenterModel(input.orgSlug) : null;
}

export async function getPublicFrameworkDetailModel(input: {
  frameworkSlug: string;
  orgSlug: string;
}): Promise<{
  framework: TrustFramework;
  trustCenter: PublicTrustCenterModel;
} | null> {
  const trustCenter = await getPublicTrustCenterModel({ orgSlug: input.orgSlug });

  if (!trustCenter?.showFrameworkDrilldown) {
    return null;
  }

  const framework = trustCenter.frameworks.find(
    (item) => item.framework.slug === input.frameworkSlug,
  );

  return framework ? { framework, trustCenter } : null;
}

export function getDocumentsForFramework(frameworkSlug: string) {
  return PUBLIC_DOCUMENTS.filter((document) =>
    document.frameworkSlugs.includes(frameworkSlug),
  );
}

async function loadDatabaseTrustCenter(input: {
  accessToken?: string | null;
  orgSlug: string;
}): Promise<PublicTrustCenterModel | null> {
  const data = await getPublicTrustCenter(input);

  if (!data) {
    return null;
  }

  const db = getDb();
  const frameworkIds = data.frameworks.map((row) => row.framework.id);
  const [controlRows, uptimeRows] = await Promise.all([
    frameworkIds.length > 0
      ? db
          .select({
            category: controls.category,
            frameworkId: frameworkControls.frameworkId,
            lastTestedAt: orgControlStatuses.lastTestedAt,
            status: orgControlStatuses.status,
          })
          .from(frameworkControls)
          .innerJoin(controls, eq(frameworkControls.controlId, controls.id))
          .leftJoin(
            orgControlStatuses,
            and(
              eq(orgControlStatuses.controlId, controls.id),
              eq(orgControlStatuses.clerkOrgId, data.clerkOrgId),
            ),
          )
          .where(inArray(frameworkControls.frameworkId, frameworkIds))
      : Promise.resolve([]),
    db
      .select({
        successful: sql<number>`count(*) filter (where ${integrationRuns.status} <> 'error')::int`,
        total: sql<number>`count(*)::int`,
      })
      .from(integrationRuns)
      .where(
        and(
          eq(integrationRuns.clerkOrgId, data.clerkOrgId),
          gte(integrationRuns.ranAt, new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)),
        ),
      ),
  ]);
  const uptimePct = calculateUptime(uptimeRows[0]?.successful, uptimeRows[0]?.total);
  const frameworks = data.frameworks.map((row) =>
    buildTrustFramework(
      row.framework,
      row.score,
      controlRows.filter((control) => control.frameworkId === row.framework.id),
      data.lastTestedAt,
    ),
  );

  return {
    accentColor: data.accentColor,
    documents: PUBLIC_DOCUMENTS,
    frameworks,
    lastTestedAt: data.lastTestedAt,
    logoUrl: data.logoUrl,
    nextTestAt: getNextTestAt(data.lastTestedAt),
    organisationName: data.organisationName,
    orgSlug: data.subdomain ?? input.orgSlug,
    showFrameworkDrilldown: data.trustCenter.showFrameworkDrilldown,
    showFrameworkPercentages: data.trustCenter.showFrameworkPercentages,
    trustSignals: buildTrustSignals(frameworks, data.lastTestedAt, uptimePct),
    uptimePct,
  };
}

function getDemoTrustCenterModel(orgSlug: string): PublicTrustCenterModel {
  const lastTestedAt = new Date(Date.now() - 11 * 60 * 1000);
  const frameworks = [
    buildDemoFramework("nis2", 78, 31, 8, 4, lastTestedAt),
    buildDemoFramework("gdpr", 86, 18, 3, 2, lastTestedAt),
    buildDemoFramework("iso27001", 62, 26, 12, 6, lastTestedAt),
  ];

  return {
    accentColor: "#1d4ed8",
    documents: PUBLIC_DOCUMENTS,
    frameworks,
    lastTestedAt,
    logoUrl: null,
    nextTestAt: getNextTestAt(lastTestedAt),
    organisationName: "Demo workspace",
    orgSlug,
    showFrameworkDrilldown: true,
    showFrameworkPercentages: true,
    trustSignals: buildTrustSignals(frameworks, lastTestedAt, 99.9),
    uptimePct: 99.9,
  };
}

function buildDemoFramework(
  slug: FrameworkSeed["slug"],
  score: number,
  verified: number,
  inProgress: number,
  notApplicable: number,
  lastAssessedAt: Date,
): TrustFramework {
  const framework = FRAMEWORK_LIBRARY.find((item) => item.slug === slug);

  if (!framework) {
    throw new Error(`Unknown demo framework: ${slug}`);
  }

  const categoryKeys =
    slug === "nis2"
      ? (Object.keys(CATEGORY_META) as PublicControlCategory[])
      : (["iam", "cryptography", "incident", "supply_chain"] as PublicControlCategory[]);
  const categories = categoryKeys.map((category, index) => {
    const total = index % 3 === 0 ? 5 : 4;
    const categoryVerified =
      index % 5 === 0 ? total : Math.max(1, total - (index % 3));
    const categoryNotApplicable = index === categoryKeys.length - 1 ? 1 : 0;

    return buildCategorySummary({
      category,
      inProgress: Math.max(0, total - categoryVerified - categoryNotApplicable),
      notApplicable: categoryNotApplicable,
      total,
      verified: categoryVerified,
    });
  });

  return withFrameworkMeta({
    categories,
    framework,
    inProgress,
    lastAssessedAt,
    notApplicable,
    score,
    totalControls: verified + inProgress + notApplicable,
    verified,
  });
}

function buildTrustFramework(
  framework: PublicFrameworkRecord,
  score: number | null,
  rows: ControlStatusRow[],
  fallbackAssessedAt: Date | null,
): TrustFramework {
  const counts = countControlRows(rows);
  const categories = buildCategorySummaries(rows);

  return withFrameworkMeta({
    categories,
    framework,
    inProgress: counts.inProgress,
    lastAssessedAt: getLastAssessedAt(rows, fallbackAssessedAt),
    notApplicable: counts.notApplicable,
    score: score ?? scoreFromCounts(counts),
    totalControls: counts.total,
    verified: counts.verified,
  });
}

function withFrameworkMeta(input: {
  categories: TrustFrameworkCategory[];
  framework: PublicFrameworkRecord;
  inProgress: number;
  lastAssessedAt: Date | null;
  notApplicable: number;
  score: number | null;
  totalControls: number;
  verified: number;
}): TrustFramework {
  const meta = REGULATION_META[input.framework.slug] ?? {
    effectiveDate: formatMandatoryDeadline(input.framework.mandatoryDeadline),
    law: input.framework.version ?? "Příslušný předpis",
    maxPenalty: "Dle příslušného předpisu",
    regulator: input.framework.regulator ?? "Regulátor",
  };
  const statusTone = input.score == null ? "neutral" : input.score >= 80 ? "pass" : "warn";

  return {
    ...input,
    effectiveDate: meta.effectiveDate,
    law: meta.law,
    maxPenalty: meta.maxPenalty,
    regulator: meta.regulator,
    statusLabel:
      statusTone === "pass"
        ? "VERIFIED"
        : input.totalControls > 0
          ? "IN PROGRESS"
          : "MONITORED",
    statusTone,
  };
}

function formatMandatoryDeadline(value: Date | string | null | undefined) {
  if (!value) {
    return "Dle předpisu";
  }

  if (value instanceof Date) {
    return new Intl.DateTimeFormat("cs-CZ", {
      dateStyle: "medium",
    }).format(value);
  }

  return value;
}

function countControlRows(rows: ControlStatusRow[]) {
  return rows.reduce(
    (counts, row) => {
      const bucket = getControlBucket(row.status);

      counts.total += 1;
      counts[bucket] += 1;

      return counts;
    },
    {
      inProgress: 0,
      notApplicable: 0,
      total: 0,
      verified: 0,
    },
  );
}

function buildCategorySummaries(rows: ControlStatusRow[]) {
  const categories = new Map<
    PublicControlCategory,
    { inProgress: number; notApplicable: number; total: number; verified: number }
  >();

  for (const row of rows) {
    const category = normalizeControlCategory(row.category);
    const counts =
      categories.get(category) ??
      {
        inProgress: 0,
        notApplicable: 0,
        total: 0,
        verified: 0,
      };
    const bucket = getControlBucket(row.status);

    counts.total += 1;
    counts[bucket] += 1;
    categories.set(category, counts);
  }

  return Array.from(categories.entries()).map(([category, counts]) =>
    buildCategorySummary({ category, ...counts }),
  );
}

function buildCategorySummary(input: {
  category: PublicControlCategory;
  inProgress: number;
  notApplicable: number;
  total: number;
  verified: number;
}): TrustFrameworkCategory {
  const meta = CATEGORY_META[input.category];
  const status =
    input.notApplicable === input.total
      ? "na"
      : input.verified === input.total
        ? "pass"
        : "warn";

  return {
    ...input,
    description: meta.desc.cs,
    icon: meta.icon,
    name: meta.name.cs,
    status,
  };
}

function getControlBucket(status: string | null): "verified" | "inProgress" | "notApplicable" {
  if (status === "pass") {
    return "verified";
  }

  if (status === "not_applicable") {
    return "notApplicable";
  }

  return "inProgress";
}

function scoreFromCounts(counts: {
  inProgress: number;
  notApplicable: number;
  total: number;
  verified: number;
}) {
  const applicable = counts.total - counts.notApplicable;

  if (applicable <= 0) {
    return counts.total > 0 ? 100 : null;
  }

  return Math.round((counts.verified / applicable) * 100);
}

function getLastAssessedAt(rows: ControlStatusRow[], fallback: Date | null) {
  return rows.reduce<Date | null>((latest, row) => {
    if (!row.lastTestedAt) {
      return latest;
    }

    if (!latest || row.lastTestedAt > latest) {
      return row.lastTestedAt;
    }

    return latest;
  }, fallback);
}

function getNextTestAt(lastTestedAt: Date | null) {
  if (!lastTestedAt) {
    return null;
  }

  const next = new Date(lastTestedAt.getTime() + 60 * 60 * 1000);

  return next > new Date() ? next : new Date(Date.now() + 60 * 60 * 1000);
}

function calculateUptime(successful: number | undefined, total: number | undefined) {
  if (!total) {
    return null;
  }

  return Math.round((Number(successful ?? 0) / Number(total)) * 1000) / 10;
}

function buildTrustSignals(
  frameworks: TrustFramework[],
  lastTestedAt: Date | null,
  uptimePct: number | null,
): TrustSignal[] {
  const gdpr = frameworks.find((item) => item.framework.slug === "gdpr");
  const iso = frameworks.find((item) => item.framework.slug === "iso27001");
  const nis2 = frameworks.find((item) => item.framework.slug === "nis2");
  const gdprYear = gdpr?.lastAssessedAt?.getFullYear() ?? 2026;

  return [
    { icon: "server", label: "Hosting", value: "EU · Frankfurt" },
    {
      icon: "shield",
      label: "GDPR",
      value: gdpr ? `Compliant od ${gdprYear}` : "Připraveno",
    },
    {
      icon: "badge",
      label: "ISO 27001",
      value: iso?.score && iso.score >= 80 ? "Sledováno" : "Příprava · Q3 2026",
    },
    {
      icon: "radar",
      label: "NÚKIB feed",
      value: nis2 || lastTestedAt ? "Monitorováno 24/7" : "Čeká na první běh",
    },
    {
      icon: "activity",
      label: "Uptime",
      value: uptimePct == null ? "n/a · 90 dní" : `${uptimePct}% · 90 dní`,
    },
  ];
}
