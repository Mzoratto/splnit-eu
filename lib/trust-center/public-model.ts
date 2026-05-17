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
  type PublicControlCategory,
} from "@/lib/frameworks/categories";
import { FRAMEWORK_LIBRARY, type FrameworkSeed } from "@/lib/frameworks/registry";
import type { Locale } from "@/i18n/routing";
import {
  getLocalizedDocuments,
  getLockedDocuments,
  getSplnitDocuments,
} from "@/lib/trust-center/public-documents";
import type {
  PublicFrameworkRecord,
  PublicTrustCenterModel,
  TrustFramework,
  TrustFrameworkCategory,
  TrustSignal,
} from "@/lib/trust-center/public-types";
export {
  getDocumentsForFramework,
  getLocalizedDocuments,
  getLocalizedDocumentsForFramework,
} from "@/lib/trust-center/public-documents";
export type {
  PublicFrameworkRecord,
  PublicTrustCenterModel,
  PublicTrustDocument,
  TrustFramework,
  TrustFrameworkCategory,
  TrustSignal,
} from "@/lib/trust-center/public-types";

type ControlStatusRow = {
  category: string | null;
  frameworkId: string;
  lastTestedAt: Date | null;
  status: string | null;
};

const CATEGORY_META_IT: Record<
  PublicControlCategory,
  { desc: string; name: string }
> = {
  architecture: {
    desc: "Segmentazione, inventario sistemi, configurazione sicura e ownership tecnica",
    name: "Architettura sicura",
  },
  awareness: {
    desc: "Formazione del personale, responsabilità, regole di sicurezza e verifiche di comprensione",
    name: "Consapevolezza sicurezza",
  },
  backup: {
    desc: "Backup, ripristino, continuità operativa e test di recupero",
    name: "Backup e ripristino",
  },
  cryptography: {
    desc: "Cifratura dati, gestione chiavi, classificazione dati e condivisione sicura",
    name: "Crittografia e protezione dati",
  },
  iam: {
    desc: "MFA, accesso condizionale, ruoli privilegiati e accesso ospiti",
    name: "Identity and access management",
  },
  incident: {
    desc: "Incident response, escalation, scadenze legali e lezioni apprese",
    name: "Incident response",
  },
  logging: {
    desc: "Logging, monitoring, alert anomalie e tracciabilità eventi",
    name: "Logging e monitoring",
  },
  ot: {
    desc: "Separazione delle tecnologie operative, accesso remoto e controllo cambiamenti",
    name: "Sistemi OT",
  },
  supply_chain: {
    desc: "Rischio fornitori, requisiti contrattuali, questionari e revisione continua",
    name: "Sicurezza supply chain",
  },
  vulnerability: {
    desc: "Patch management, vulnerability scanning, remediation e prioritizzazione",
    name: "Gestione vulnerabilità",
  },
};

const REGULATION_META: Record<
  Locale,
  Record<
    string,
    { effectiveDate: string; law: string; maxPenalty: string; regulator: string }
  >
> = {
  "cs-CZ": {
    "ai-act": {
      effectiveDate: "Srpen 2026",
      law: "Nařízení (EU) 2024/1689",
      maxPenalty: "Až €35M nebo 7% obratu",
      regulator: "EU / národní orgány (bude potvrzeno)",
    },
    csrd: {
      effectiveDate: "Leden 2024",
      law: "Směrnice (EU) 2022/2464",
      maxPenalty: "Dle národní transpozice",
      regulator: "Národní ESG dohled",
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
      effectiveDate: "Listopad 2025",
      law: "Zákon č. 264/2025 Sb.",
      maxPenalty: "Až €10M nebo 2% obratu",
      regulator: "NÚKIB",
    },
  },
  "en-EU": {
    "ai-act": {
      effectiveDate: "August 2026",
      law: "Regulation (EU) 2024/1689",
      maxPenalty: "Up to €35M or 7% of turnover",
      regulator: "EU / národní orgány (bude potvrzeno)",
    },
    csrd: {
      effectiveDate: "January 2024",
      law: "Directive (EU) 2022/2464",
      maxPenalty: "According to national transposition",
      regulator: "Národní ESG dohled",
    },
    gdpr: {
      effectiveDate: "May 2018",
      law: "GDPR + Act No. 110/2019 Coll.",
      maxPenalty: "Up to €20M or 4% of turnover",
      regulator: "ÚOOÚ",
    },
    iso27001: {
      effectiveDate: "October 2022",
      law: "ISO/IEC 27001:2022",
      maxPenalty: "No statutory fine",
      regulator: "ISO",
    },
    nis2: {
      effectiveDate: "November 2025",
      law: "Act No. 264/2025 Coll.",
      maxPenalty: "Up to €10M or 2% of turnover",
      regulator: "NÚKIB",
    },
  },
  "it-IT": {
    "ai-act": {
      effectiveDate: "Agosto 2026",
      law: "Regolamento (UE) 2024/1689",
      maxPenalty: "Fino a €35M o 7% del fatturato",
      regulator: "EU / národní orgány (bude potvrzeno)",
    },
    csrd: {
      effectiveDate: "Gennaio 2024",
      law: "Direttiva (UE) 2022/2464",
      maxPenalty: "Secondo la trasposizione nazionale",
      regulator: "Národní ESG dohled",
    },
    gdpr: {
      effectiveDate: "Maggio 2018",
      law: "GDPR + Codice Privacy italiano (D.Lgs. 196/2003)",
      maxPenalty: "Fino a €20M o 4% del fatturato",
      regulator: "Garante per la protezione dei dati personali",
    },
    iso27001: {
      effectiveDate: "Ottobre 2022",
      law: "ISO/IEC 27001:2022",
      maxPenalty: "Nessuna sanzione legale",
      regulator: "ISO",
    },
    nis2: {
      effectiveDate: "Ottobre 2024",
      law: "D.Lgs. 138/2024",
      maxPenalty: "Fino a €10M o 2% del fatturato",
      regulator: "ACN / CSIRT Italia",
    },
  },
};

export async function getPublicTrustCenterModel(input: {
  accessToken?: string | null;
  locale?: Locale;
  orgSlug: string;
}): Promise<PublicTrustCenterModel | null> {
  const locale = input.locale ?? "cs-CZ";

  if (input.orgSlug === "splnit") {
    return getSplnitTrustCenterModel(locale);
  }

  if (hasDatabaseUrl()) {
    const model = await loadDatabaseTrustCenter({ ...input, locale }).catch(() => null);

    if (model) {
      return model;
    }
  }

  return input.orgSlug === "demo"
    ? getDemoTrustCenterModel(input.orgSlug, locale)
    : null;
}

export async function getPublicFrameworkDetailModel(input: {
  accessToken?: string | null;
  frameworkSlug: string;
  locale?: Locale;
  orgSlug: string;
}): Promise<{
  framework: TrustFramework;
  trustCenter: PublicTrustCenterModel;
} | null> {
  const trustCenter = await getPublicTrustCenterModel({
    accessToken: input.accessToken,
    locale: input.locale,
    orgSlug: input.orgSlug,
  });

  if (!trustCenter?.showFrameworkDrilldown) {
    return null;
  }

  const framework = trustCenter.frameworks.find(
    (item) => item.framework.slug === input.frameworkSlug,
  );

  return framework ? { framework, trustCenter } : null;
}

async function loadDatabaseTrustCenter(input: {
  accessToken?: string | null;
  locale: Locale;
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
  const accessGranted = data.accessGranted;
  const requiresAccess = data.ndaRequired && !accessGranted;
  const frameworks = requiresAccess
    ? []
    : data.frameworks.map((row) =>
        buildTrustFramework(
          row.framework,
          row.score,
          controlRows.filter((control) => control.frameworkId === row.framework.id),
          null,
          input.locale,
        ),
      );

  return {
    accessGranted,
    accentColor: data.accentColor,
    documents: requiresAccess ? getLockedDocuments(input.locale) : getLocalizedDocuments(input.locale),
    frameworks,
    lastTestedAt: null,
    logoUrl: data.logoUrl,
    ndaRequired: data.ndaRequired,
    nextTestAt: null,
    organisationName: data.organisationName,
    orgSlug: data.subdomain ?? input.orgSlug,
    showFrameworkDrilldown: !requiresAccess && data.trustCenter.showFrameworkDrilldown,
    showFrameworkPercentages: !requiresAccess && data.trustCenter.showFrameworkPercentages,
    showLiveIndicator: false,
    trustSignals: buildTrustSignals(frameworks, null, requiresAccess ? null : uptimePct, input.locale),
    uptimePct: requiresAccess ? null : uptimePct,
  };
}

function getSplnitTrustCenterModel(locale: Locale): PublicTrustCenterModel {
  const frameworks = [
    buildSplnitFramework("gdpr", 4, locale),
    buildSplnitFramework("nis2", 5, locale),
    buildSplnitFramework("iso27001", 6, locale),
  ];
  const copy = splnitTrustCopy(locale);

  return {
    accessGranted: true,
    accentColor: "#1d4ed8",
    contactEmails: {
      privacy: "privacy@splnit.eu",
      security: "security@splnit.eu",
      vendor: "privacy@splnit.eu",
    },
    descriptionOverride: copy.description,
    documents: getSplnitDocuments(locale),
    frameworks,
    heroEyebrowOverride: copy.eyebrow,
    heroTitleOverride: copy.title,
    lastTestedAt: null,
    logoUrl: null,
    ndaRequired: false,
    nextTestAt: null,
    organisationName: "Splnit.eu",
    orgSlug: "splnit",
    showFrameworkDrilldown: true,
    showFrameworkPercentages: false,
    showLiveIndicator: false,
    trustSignals: [
      { icon: "server", label: "Hosting", value: copy.hosting },
      { icon: "shield", label: "GDPR", value: copy.gdpr },
      { icon: "badge", label: "ISO 27001", value: copy.iso },
      { icon: "radar", label: "Security", value: copy.security },
      { icon: "activity", label: "Uptime", value: copy.uptime },
    ],
    uptimePct: null,
  };
}

function buildSplnitFramework(
  slug: FrameworkSeed["slug"],
  totalControls: number,
  locale: Locale,
): TrustFramework {
  const framework = FRAMEWORK_LIBRARY.find((item) => item.slug === slug);

  if (!framework) {
    throw new Error(`Unknown Splnit framework: ${slug}`);
  }

  const categoryKeys =
    slug === "gdpr"
      ? (["iam", "cryptography", "incident", "supply_chain"] as PublicControlCategory[])
      : slug === "iso27001"
        ? ([
            "iam",
            "cryptography",
            "logging",
            "backup",
            "vulnerability",
            "supply_chain",
          ] as PublicControlCategory[])
        : (["iam", "incident", "logging", "backup", "supply_chain"] as PublicControlCategory[]);

  return withFrameworkMeta({
    categories: categoryKeys.map((category) =>
      buildCategorySummary({
        category,
        inProgress: 1,
        locale,
        notApplicable: 0,
        total: 1,
        verified: 0,
      }),
    ),
    framework,
    inProgress: totalControls,
    lastAssessedAt: null,
    notApplicable: 0,
    score: null,
    totalControls,
    locale,
    verified: 0,
  });
}

function getDemoHeroEyebrow(locale: Locale) {
  switch (locale) {
    case "en-EU":
      return "SAMPLE TRUST CENTER · DEMO DATA";
    case "it-IT":
      return "TRUST CENTER DI ESEMPIO · DATI DEMO";
    default:
      return "UKÁZKOVÝ TRUST CENTER · DEMO DATA";
  }
}

function getDemoHeroTitle(locale: Locale) {
  switch (locale) {
    case "en-EU":
      return "Demo workspace shows a sample public Trust Center, not live compliance proof.";
    case "it-IT":
      return "Demo workspace mostra un Trust Center pubblico di esempio, non una prova compliance reale.";
    default:
      return "Demo workspace ukazuje veřejný Trust Center s ukázkovými daty, ne skutečný důkaz souladu.";
  }
}

function getDemoTrustCenterModel(
  orgSlug: string,
  locale: Locale,
): PublicTrustCenterModel {
  const lastTestedAt = new Date(Date.now() - 11 * 60 * 1000);
  const frameworks = [
    buildDemoFramework("nis2", 78, 31, 8, 4, lastTestedAt, locale),
    buildDemoFramework("gdpr", 86, 18, 3, 2, lastTestedAt, locale),
    buildDemoFramework("iso27001", 62, 26, 12, 6, lastTestedAt, locale),
  ];

  return {
    accessGranted: true,
    accentColor: "#1d4ed8",
    documents: getLocalizedDocuments(locale),
    frameworks,
    lastTestedAt: null,
    logoUrl: null,
    heroEyebrowOverride: getDemoHeroEyebrow(locale),
    heroTitleOverride: getDemoHeroTitle(locale),
    isDemo: true,
    ndaRequired: false,
    nextTestAt: null,
    organisationName: "Demo workspace",
    orgSlug,
    showFrameworkDrilldown: true,
    showFrameworkPercentages: true,
    showLiveIndicator: false,
    trustSignals: buildTrustSignals(frameworks, null, null, locale),
    uptimePct: null,
  };
}

function buildDemoFramework(
  slug: FrameworkSeed["slug"],
  score: number,
  verified: number,
  inProgress: number,
  notApplicable: number,
  lastAssessedAt: Date,
  locale: Locale,
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
      locale,
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
    locale,
    verified,
  });
}

function buildTrustFramework(
  framework: PublicFrameworkRecord,
  score: number | null,
  rows: ControlStatusRow[],
  fallbackAssessedAt: Date | null,
  locale: Locale,
): TrustFramework {
  const counts = countControlRows(rows);
  const categories = buildCategorySummaries(rows, locale);

  return withFrameworkMeta({
    categories,
    framework,
    inProgress: counts.inProgress,
    lastAssessedAt: getLastAssessedAt(rows, fallbackAssessedAt),
    notApplicable: counts.notApplicable,
    score: score ?? scoreFromCounts(counts),
    totalControls: counts.total,
    locale,
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
  locale: Locale;
  verified: number;
}): TrustFramework {
  const meta = REGULATION_META[input.locale]?.[input.framework.slug] ?? {
    effectiveDate: formatMandatoryDeadline(input.framework.mandatoryDeadline),
    law: input.framework.version ?? fallbackRegulationText(input.locale).law,
    maxPenalty: fallbackRegulationText(input.locale).maxPenalty,
    regulator: input.framework.regulator ?? fallbackRegulationText(input.locale).regulator,
  };
  const statusTone = input.score == null ? "neutral" : input.score >= 80 ? "pass" : "warn";

  return {
    categories: input.categories,
    effectiveDate: meta.effectiveDate,
    framework: input.framework,
    inProgress: input.inProgress,
    lastAssessedAt: input.lastAssessedAt,
    law: meta.law,
    maxPenalty: meta.maxPenalty,
    notApplicable: input.notApplicable,
    regulator: meta.regulator,
    score: input.score,
    statusLabel:
      statusTone === "pass"
        ? "VERIFIED"
        : input.totalControls > 0
          ? "IN PROGRESS"
          : "MONITORED",
    statusTone,
    totalControls: input.totalControls,
    verified: input.verified,
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

function fallbackRegulationText(locale: Locale) {
  if (locale === "en-EU") {
    return {
      law: "Applicable regulation",
      maxPenalty: "According to the applicable regulation",
      regulator: "Regulator",
    };
  }

  if (locale === "it-IT") {
    return {
      law: "Normativa applicabile",
      maxPenalty: "Secondo la normativa applicabile",
      regulator: "Regolatore",
    };
  }

  return {
    law: "Příslušný předpis",
    maxPenalty: "Dle příslušného předpisu",
    regulator: "Regulátor",
  };
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

function buildCategorySummaries(rows: ControlStatusRow[], locale: Locale) {
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
    buildCategorySummary({ category, locale, ...counts }),
  );
}

function buildCategorySummary(input: {
  category: PublicControlCategory;
  inProgress: number;
  notApplicable: number;
  total: number;
  locale: Locale;
  verified: number;
}): TrustFrameworkCategory {
  const meta = getCategoryMeta(input.category, input.locale);
  const status =
    input.notApplicable === input.total
      ? "na"
      : input.verified === input.total
        ? "pass"
        : "warn";

  return {
    category: input.category,
    description: meta.desc,
    icon: meta.icon,
    inProgress: input.inProgress,
    name: meta.name,
    notApplicable: input.notApplicable,
    status,
    total: input.total,
    verified: input.verified,
  };
}

function getCategoryMeta(category: PublicControlCategory, locale: Locale) {
  const meta = CATEGORY_META[category];

  if (locale === "it-IT") {
    return {
      ...CATEGORY_META_IT[category],
      icon: meta.icon,
    };
  }

  if (locale === "en-EU") {
    return {
      desc: meta.desc.en,
      icon: meta.icon,
      name: meta.name.en,
    };
  }

  return {
    desc: meta.desc.cs,
    icon: meta.icon,
    name: meta.name.cs,
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
  locale: Locale,
): TrustSignal[] {
  const gdpr = frameworks.find((item) => item.framework.slug === "gdpr");
  const iso = frameworks.find((item) => item.framework.slug === "iso27001");
  const nis2 = frameworks.find((item) => item.framework.slug === "nis2");
  const gdprYear = gdpr?.lastAssessedAt?.getFullYear() ?? 2026;

  const copy = trustSignalCopy(locale);

  return [
    { icon: "server", label: "Hosting", value: "EU · Frankfurt" },
    {
      icon: "shield",
      label: "GDPR",
      value: gdpr ? copy.gdprCompliant(gdprYear) : copy.ready,
    },
    {
      icon: "badge",
      label: "ISO 27001",
      value: iso?.score && iso.score >= 80 ? copy.monitored : copy.preparation,
    },
    {
      icon: "radar",
      label: "NÚKIB feed",
      value: nis2 || lastTestedAt ? copy.monitored247 : copy.waiting,
    },
    {
      icon: "activity",
      label: "Uptime",
      value: uptimePct == null ? `n/a · ${copy.ninetyDays}` : `${uptimePct}% · ${copy.ninetyDays}`,
    },
  ];
}

function trustSignalCopy(locale: Locale) {
  if (locale === "en-EU") {
    return {
      gdprCompliant: (year: number) => `Compliant since ${year}`,
      monitored: "Monitored",
      monitored247: "Monitored 24/7",
      ninetyDays: "90 days",
      preparation: "Preparation · Q3 2026",
      ready: "Ready",
      waiting: "Waiting for first run",
    };
  }

  if (locale === "it-IT") {
    return {
      gdprCompliant: (year: number) => `Compliant dal ${year}`,
      monitored: "Monitorato",
      monitored247: "Monitorato 24/7",
      ninetyDays: "90 giorni",
      preparation: "Preparazione · Q3 2026",
      ready: "Pronto",
      waiting: "In attesa del primo run",
    };
  }

  return {
    gdprCompliant: (year: number) => `Compliant od ${year}`,
    monitored: "Sledováno",
    monitored247: "Monitorováno 24/7",
    ninetyDays: "90 dní",
    preparation: "Příprava · Q3 2026",
    ready: "Připraveno",
    waiting: "Čeká na první běh",
  };
}

function splnitTrustCopy(locale: Locale) {
  if (locale === "en-EU") {
    return {
      description:
        "This page publishes the current Splnit.eu security posture, legal documents, and sub-processor information. Splnit.eu is in early access, so certifications that are not complete are shown as in progress rather than claimed.",
      eyebrow: "SPLNIT.EU TRUST CENTER · EARLY ACCESS",
      gdpr: "Privacy docs published",
      hosting: "Vercel · Neon",
      iso: "In progress · 2026",
      security: "security@splnit.eu",
      title:
        "Splnit.eu publishes its own Trust Center for security posture, sub-processors, and legal documents.",
      uptime: "Status page linked",
    };
  }

  if (locale === "it-IT") {
    return {
      description:
        "Questa pagina pubblica la postura di sicurezza attuale di Splnit.eu, i documenti legali e le informazioni sui sub-responsabili. Splnit.eu è in accesso anticipato: certificazioni non completate sono indicate come in corso, non come ottenute.",
      eyebrow: "TRUST CENTER SPLNIT.EU · ACCESSO ANTICIPATO",
      gdpr: "Documenti privacy pubblicati",
      hosting: "Vercel · Neon",
      iso: "In corso · 2026",
      security: "security@splnit.eu",
      title:
        "Splnit.eu pubblica il proprio Trust Center per postura sicurezza, sub-responsabili e documenti legali.",
      uptime: "Status page collegata",
    };
  }

  return {
    description:
      "Tato stránka publikuje aktuální bezpečnostní postoj Splnit.eu, právní dokumenty a informace o subdodavatelích. Splnit.eu je v early access, takže nedokončené certifikace uvádíme jako rozpracované, ne jako získané.",
    eyebrow: "SPLNIT.EU TRUST CENTER · EARLY ACCESS",
    gdpr: "Privacy dokumenty publikovány",
    hosting: "Vercel · Neon",
    iso: "Probíhá · 2026",
    security: "security@splnit.eu",
    title:
      "Splnit.eu publikuje vlastní Trust Center pro bezpečnostní postoj, subdodavatele a právní dokumenty.",
    uptime: "Status page propojena",
  };
}
