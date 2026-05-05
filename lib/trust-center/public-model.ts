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
import type { Locale } from "@/i18n/routing";

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
  contactEmails?: {
    privacy?: string;
    security?: string;
    vendor?: string;
  };
  descriptionOverride?: string;
  documents: PublicTrustDocument[];
  frameworks: TrustFramework[];
  heroEyebrowOverride?: string;
  heroTitleOverride?: string;
  lastTestedAt: Date | null;
  logoUrl: string | null;
  nextTestAt: Date | null;
  organisationName: string;
  orgSlug: string;
  showFrameworkDrilldown: boolean;
  showFrameworkPercentages: boolean;
  showLiveIndicator?: boolean;
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
    description: "Sdílí se pouze tehdy, pokud je pro organizaci k dispozici.",
    frameworkSlugs: ["iso27001", "nis2"],
    href: "mailto:hello@splnit.eu?subject=Request%20SOC%202%20report",
    id: "soc2",
    isLocked: true,
    title: "SOC 2 report",
  },
  {
    description: "Sdílí se pouze tehdy, pokud je pro organizaci k dispozici.",
    frameworkSlugs: ["iso27001"],
    href: "mailto:hello@splnit.eu?subject=Request%20ISO%2027001%20SoA",
    id: "iso-soa",
    isLocked: true,
    title: "ISO 27001 SoA",
  },
  {
    description: "Sdílí se pouze tehdy, pokud je pro organizaci k dispozici.",
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

const DOCUMENT_DESCRIPTIONS: Record<
  Locale,
  Record<PublicTrustDocument["id"], string>
> = {
  "cs-CZ": {
    dpa: "Vzor smlouvy o zpracování osobních údajů.",
    "iso-soa": "Sdílí se pouze tehdy, pokud je pro organizaci k dispozici.",
    pentest: "Sdílí se pouze tehdy, pokud je pro organizaci k dispozici.",
    "privacy-policy": "Veřejné informace o zpracování osobních údajů.",
    sla: "Dostupnost služby, reakční časy a provozní odpovědnosti.",
    soc2: "Sdílí se pouze tehdy, pokud je pro organizaci k dispozici.",
    subprocessors: "Aktuální seznam hlavních subdodavatelů.",
    whitepaper: "Přehled bezpečnostní architektury a provozních opatření.",
  },
  "en-EU": {
    dpa: "Template data processing agreement.",
    "iso-soa": "Shared only if it is available for this organisation.",
    pentest: "Shared only if it is available for this organisation.",
    "privacy-policy": "Public information about personal data processing.",
    sla: "Service availability, response times, and operating responsibilities.",
    soc2: "Shared only if it is available for this organisation.",
    subprocessors: "Current list of main sub-processors.",
    whitepaper: "Overview of security architecture and operating measures.",
  },
  "it-IT": {
    dpa: "Modello di accordo per il trattamento dei dati.",
    "iso-soa": "Condiviso solo se disponibile per questa organizzazione.",
    pentest: "Condiviso solo se disponibile per questa organizzazione.",
    "privacy-policy": "Informazioni pubbliche sul trattamento dei dati personali.",
    sla: "Disponibilità del servizio, tempi di risposta e responsabilità operative.",
    soc2: "Condiviso solo se disponibile per questa organizzazione.",
    subprocessors: "Elenco aggiornato dei principali sub-responsabili.",
    whitepaper: "Panoramica di architettura di sicurezza e misure operative.",
  },
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
  },
  "en-EU": {
    "ai-act": {
      effectiveDate: "August 2026",
      law: "Regulation (EU) 2024/1689",
      maxPenalty: "Up to €35M or 7% of turnover",
      regulator: "ČTÚ",
    },
    csrd: {
      effectiveDate: "January 2024",
      law: "Directive (EU) 2022/2464",
      maxPenalty: "According to national transposition",
      regulator: "MŽP",
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
      effectiveDate: "October 2024",
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
      regulator: "ČTÚ",
    },
    csrd: {
      effectiveDate: "Gennaio 2024",
      law: "Direttiva (UE) 2022/2464",
      maxPenalty: "Secondo la trasposizione nazionale",
      regulator: "MŽP",
    },
    gdpr: {
      effectiveDate: "Maggio 2018",
      law: "GDPR + legge n. 110/2019 Coll.",
      maxPenalty: "Fino a €20M o 4% del fatturato",
      regulator: "ÚOOÚ",
    },
    iso27001: {
      effectiveDate: "Ottobre 2022",
      law: "ISO/IEC 27001:2022",
      maxPenalty: "Nessuna sanzione legale",
      regulator: "ISO",
    },
    nis2: {
      effectiveDate: "Ottobre 2024",
      law: "Legge n. 264/2025 Coll.",
      maxPenalty: "Fino a €10M o 2% del fatturato",
      regulator: "NÚKIB",
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
  frameworkSlug: string;
  locale?: Locale;
  orgSlug: string;
}): Promise<{
  framework: TrustFramework;
  trustCenter: PublicTrustCenterModel;
} | null> {
  const trustCenter = await getPublicTrustCenterModel({
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

export function getDocumentsForFramework(frameworkSlug: string) {
  return PUBLIC_DOCUMENTS.filter((document) =>
    document.frameworkSlugs.includes(frameworkSlug),
  );
}

export function getLocalizedDocuments(locale: Locale) {
  const descriptions = DOCUMENT_DESCRIPTIONS[locale] ?? DOCUMENT_DESCRIPTIONS["cs-CZ"];

  return PUBLIC_DOCUMENTS.map((document) => ({
    ...document,
    description: descriptions[document.id] ?? document.description,
  }));
}

export function getLocalizedDocumentsForFramework(
  frameworkSlug: string,
  locale: Locale,
) {
  return getLocalizedDocuments(locale).filter((document) =>
    document.frameworkSlugs.includes(frameworkSlug),
  );
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
  const frameworks = data.frameworks.map((row) =>
    buildTrustFramework(
      row.framework,
      row.score,
      controlRows.filter((control) => control.frameworkId === row.framework.id),
      data.lastTestedAt,
      input.locale,
    ),
  );

  return {
    accentColor: data.accentColor,
    documents: getLocalizedDocuments(input.locale),
    frameworks,
    lastTestedAt: data.lastTestedAt,
    logoUrl: data.logoUrl,
    nextTestAt: getNextTestAt(data.lastTestedAt),
    organisationName: data.organisationName,
    orgSlug: data.subdomain ?? input.orgSlug,
    showFrameworkDrilldown: data.trustCenter.showFrameworkDrilldown,
    showFrameworkPercentages: data.trustCenter.showFrameworkPercentages,
    trustSignals: buildTrustSignals(frameworks, data.lastTestedAt, uptimePct, input.locale),
    uptimePct,
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

function getSplnitDocuments(locale: Locale): PublicTrustDocument[] {
  const copy = splnitDocumentCopy(locale);

  return [
    {
      description: copy.securityWhitepaperDescription,
      frameworkSlugs: ["nis2", "iso27001", "gdpr"],
      href: "/security",
      id: "splnit-security-whitepaper",
      isLocked: false,
      title: copy.securityWhitepaper,
    },
    {
      description: copy.dpaDescription,
      frameworkSlugs: ["gdpr"],
      href: "/dpa",
      id: "splnit-dpa",
      isLocked: false,
      title: copy.dpa,
    },
    {
      description: copy.subprocessorsDescription,
      frameworkSlugs: ["gdpr", "nis2", "iso27001"],
      href: "/dpa#subprocessors",
      id: "splnit-subprocessors",
      isLocked: false,
      title: copy.subprocessors,
    },
    {
      description: copy.privacyDescription,
      frameworkSlugs: ["gdpr"],
      href: "/soukromi",
      id: "splnit-privacy",
      isLocked: false,
      title: copy.privacy,
    },
    {
      description: copy.termsDescription,
      frameworkSlugs: ["nis2", "iso27001"],
      href: "/podminky",
      id: "splnit-terms",
      isLocked: false,
      title: copy.terms,
    },
  ];
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
    accentColor: "#1d4ed8",
    documents: getLocalizedDocuments(locale),
    frameworks,
    lastTestedAt,
    logoUrl: null,
    nextTestAt: getNextTestAt(lastTestedAt),
    organisationName: "Demo workspace",
    orgSlug,
    showFrameworkDrilldown: true,
    showFrameworkPercentages: true,
    trustSignals: buildTrustSignals(frameworks, lastTestedAt, null, locale),
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
      hosting: "EU · Frankfurt",
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
      hosting: "UE · Francoforte",
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
    hosting: "EU · Frankfurt",
    iso: "Probíhá · 2026",
    security: "security@splnit.eu",
    title:
      "Splnit.eu publikuje vlastní Trust Center pro bezpečnostní postoj, subdodavatele a právní dokumenty.",
    uptime: "Status page propojena",
  };
}

function splnitDocumentCopy(locale: Locale) {
  if (locale === "en-EU") {
    return {
      dpa: "DPA",
      dpaDescription: "Public data processing terms and processor commitments.",
      privacy: "Privacy Policy",
      privacyDescription: "Public information about Splnit.eu personal data processing.",
      securityWhitepaper: "Security Whitepaper",
      securityWhitepaperDescription:
        "Current early-access security posture, hosting, access, and incident-response summary.",
      subprocessors: "Sub-processor list",
      subprocessorsDescription:
        "Main sub-processors and processing context maintained in the public DPA page.",
      terms: "Terms of Service",
      termsDescription: "Public service terms for Splnit.eu.",
    };
  }

  if (locale === "it-IT") {
    return {
      dpa: "DPA",
      dpaDescription: "Termini pubblici di trattamento dati e impegni del responsabile.",
      privacy: "Privacy Policy",
      privacyDescription: "Informazioni pubbliche sul trattamento dei dati personali da parte di Splnit.eu.",
      securityWhitepaper: "Security Whitepaper",
      securityWhitepaperDescription:
        "Sintesi aggiornata di sicurezza early-access, hosting, accessi e risposta agli incidenti.",
      subprocessors: "Lista sub-responsabili",
      subprocessorsDescription:
        "Principali sub-responsabili e contesto di trattamento mantenuti nella pagina DPA pubblica.",
      terms: "Termini di servizio",
      termsDescription: "Termini pubblici del servizio Splnit.eu.",
    };
  }

  return {
    dpa: "DPA",
    dpaDescription: "Veřejné podmínky zpracování dat a závazky zpracovatele.",
    privacy: "Privacy Policy",
    privacyDescription: "Veřejné informace o zpracování osobních údajů ve Splnit.eu.",
    securityWhitepaper: "Security Whitepaper",
    securityWhitepaperDescription:
      "Aktuální early-access přehled bezpečnosti, hostingu, přístupů a incident response.",
    subprocessors: "Seznam subdodavatelů",
    subprocessorsDescription:
      "Hlavní subdodavatelé a kontext zpracování udržovaný na veřejné DPA stránce.",
    terms: "Podmínky služby",
    termsDescription: "Veřejné podmínky služby Splnit.eu.",
  };
}
