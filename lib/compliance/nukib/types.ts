export type NukibControlTier =
  | "mandatory_minimum"
  | "assessable";

export type NukibComplianceState =
  | "implemented"
  | "planned"
  | "not_implemented"
  | "not_applicable";

export type NukibPriority = "high" | "medium" | "low" | "unset";

export type NukibDeadlineType =
  | "absolute"
  | "relative"
  | "ongoing"
  | "unknown";

export interface NukibDeadline {
  raw: string;
  type: NukibDeadlineType;
  date?: Date;
  relativeMonths?: number;
}

export interface FrameworkMapping {
  frameworkId: "zokb" | "nis2";
  reference: string;
  title?: string;
}

export interface NukibBaselineControl {
  paragraph: string;
  odstavec?: string;
  pismeno?: string;
  exactReference: string;

  title: string;
  text: string;

  tier: NukibControlTier;
  priority: NukibPriority;
  deadline: NukibDeadline;
  owners: string[];

  defaultState: NukibComplianceState;
  implementationDescription?: string;
  notImplementedJustification?: string;

  frameworkMappings: FrameworkMapping[];

  archived: boolean;
  sourceRow: number;
}

export interface NukibBaselineManifest {
  version: string;
  sourceFile: string;
  sourceSha256: string;
  importedAt: string;
  controlCount: number;
  controls: NukibBaselineControl[];
}

export interface NukibWorkspaceExtensions {
  frameworkMappings?: FrameworkMapping[];
  officialBaselineRefs?: string[];
  nukibPriority?: NukibPriority;
  nukibComplianceState?: NukibComplianceState;
  nukibBaselineVersion?: string;
  nukibTier?: NukibControlTier;
  notImplementedJustification?: string;
  archived?: boolean;
  deprecatedMapping?: {
    oldControlKey: string;
    migratedAt: string;
  };
}

export interface BaselineDiff {
  added: NukibBaselineControl[];
  removed: NukibBaselineControl[];
  modified: Array<{
    previous: NukibBaselineControl;
    next: NukibBaselineControl;
    changes: Array<"text" | "reference" | "tier" | "priority" | "deadline">;
  }>;
  unchanged: NukibBaselineControl[];
}
