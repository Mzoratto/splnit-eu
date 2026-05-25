import type { CategoryStatus, PublicControlCategory } from "@/lib/frameworks/categories";

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
  lastAssessedAt: string | null;
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
  isDemo?: boolean;
  lastTestedAt: string | null;
  logoUrl: string | null;
  nextTestAt: Date | null;
  organisationName: string;
  orgSlug: string;
  accessGranted: boolean;
  ndaRequired: boolean;
  showFrameworkDrilldown: boolean;
  showFrameworkPercentages: boolean;
  showLiveIndicator?: boolean;
  trustSignals: TrustSignal[];
  uptimePct: number | null;
};
