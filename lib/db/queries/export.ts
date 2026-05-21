import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  controls,
  evidence,
  integrations,
  integrationRuns,
  organisations,
  orgIntakeProfiles,
} from "@/lib/db/schema";
import type { EvidenceSource } from "@/lib/activation/evidence-state";
import type { EvidenceRecord, ReportContext } from "@/lib/export/report-template";
import type {
  FrameworkMapping,
  NukibControlTier,
} from "@/lib/compliance/nukib/types";
import { isDesignatedPersonTrainingGap } from "@/lib/workspaces/attestation";
import type { NukibControlBlock, PlatformWorkspace } from "@/lib/workspaces/types";
import { heliosWorkspace } from "@/lib/workspaces/helios";
import { hetznerWorkspace } from "@/lib/workspaces/hetzner";
import { moneyS3Workspace } from "@/lib/workspaces/money-s3";
import { ovhcloudWorkspace } from "@/lib/workspaces/ovhcloud";
import { pohodaWorkspace } from "@/lib/workspaces/pohoda";

type SnapshotData = Record<string, unknown> | null;

const WORKSPACES = [
  pohodaWorkspace,
  moneyS3Workspace,
  heliosWorkspace,
  hetznerWorkspace,
  ovhcloudWorkspace,
] as const;

const PROVIDER_LABELS: Record<string, string> = {
  aws: "AWS",
  github: "GitHub",
  google_workspace: "Google Workspace",
  hetzner: "Konektor Hetzner Cloud",
  microsoft365: "Microsoft 365",
  ovhcloud: "Konektor OVHcloud",
};

const CATEGORY_BLOCKS: Record<string, NukibControlBlock> = {
  access_control: {
    blockTitle: "§ Technická opatření",
    sectionTitle: "Správa přístupových oprávnění",
  },
  asset_management: {
    blockTitle: "§ Organizační bezpečnost",
    sectionTitle: "Řízení rizik",
  },
  business_continuity: {
    blockTitle: "§ Technická opatření",
    sectionTitle: "Zajištění úrovně dostupnosti",
  },
  data_protection: {
    blockTitle: "§ Technická opatření",
    sectionTitle: "Kryptografické prostředky",
  },
  governance: {
    blockTitle: "§ Organizační bezpečnost",
    sectionTitle: "Bezpečnostní politiky",
  },
  incident: {
    blockTitle: "§ Organizační bezpečnost",
    sectionTitle: "Řízení rizik",
  },
  physical: {
    blockTitle: "§ Technická opatření",
    sectionTitle: "Zajištění úrovně dostupnosti",
  },
  supplier: {
    blockTitle: "§ Organizační bezpečnost",
    sectionTitle: "Řízení rizik",
  },
  training: {
    blockTitle: "§ Organizační bezpečnost",
    sectionTitle: "Bezpečnost lidských zdrojů",
  },
};

const DEFAULT_BLOCK: NukibControlBlock = {
  blockTitle: "§ Organizační bezpečnost",
  sectionTitle: "Řízení rizik",
};

function workspaceControlLookup(workspaces: readonly PlatformWorkspace[]) {
  const lookup = new Map<
    string,
    {
      block: NukibControlBlock;
      frameworkMappings?: FrameworkMapping[];
      legacyNis2ArticleRef: string;
      legacyZobkSectionRef?: string;
      nukibTier?: NukibControlTier;
      recommendation: string;
      workspaceName: string;
    }
  >();

  for (const workspace of workspaces) {
    for (const layer of workspace.layers) {
	      for (const control of layer.controls) {
	        lookup.set(control.controlKey, {
	          block: control.nukibBlock ?? layer.nukibBlock,
          frameworkMappings: control.frameworkMappings,
          legacyNis2ArticleRef: control.nis2ArticleRef,
          legacyZobkSectionRef: control.zobkSectionRef,
          nukibTier: control.nukibTier,
          recommendation: control.guidance,
          workspaceName: workspace.platformName,
        });
      }
    }
  }

  return lookup;
}

const WORKSPACE_CONTROL_LOOKUP = workspaceControlLookup(WORKSPACES);
const WORKSPACE_BY_PLATFORM_ID = new Map(
  WORKSPACES.map((workspace) => [workspace.platformId, workspace]),
);

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function providerLabel(provider: string | null | undefined): string | null {
  if (!provider) {
    return null;
  }

  return PROVIDER_LABELS[provider] ?? provider;
}

function providerFromSnapshot(snapshotData: SnapshotData): string | null {
  const snapshot = asRecord(snapshotData);
  const provider = snapshot.provider;

  if (typeof provider === "string") {
    return provider;
  }

  const nestedProvider = asRecord(snapshot.resultData).provider;

  return typeof nestedProvider === "string" ? nestedProvider : null;
}

function formatAutomatedFinding(snapshotData: SnapshotData): string {
  const provider = providerFromSnapshot(snapshotData);
  const resultData = asRecord(asRecord(snapshotData).resultData);
  const mfaEnabled = resultData.mfaEnabled;
  const totalUsers = resultData.totalUsers;
  const serverStatus = resultData.serverStatus;
  const firewallRulesPresent = resultData.firewallRulesPresent;
  const firewallEnabled = resultData.firewallEnabled;
  const snapshotWithinWindow = resultData.snapshotWithinWindow;
  const snapshotWindowDays = resultData.snapshotWindowDays;
  const backupPresent = resultData.backupPresent;

  if (provider === "hetzner" && typeof serverStatus === "string") {
    return `Konektor Hetzner Cloud ověřil stav serveru: ${serverStatus}.`;
  }

  if (provider === "hetzner" && firewallRulesPresent === true) {
    return "Konektor Hetzner Cloud ověřil, že firewall obsahuje pravidla.";
  }

  if (
    provider === "hetzner" &&
    snapshotWithinWindow === true &&
    typeof snapshotWindowDays === "number"
  ) {
    return `Konektor Hetzner Cloud ověřil snapshot vytvořený v posledních ${snapshotWindowDays} dnech.`;
  }

  if (provider === "ovhcloud" && typeof serverStatus === "string") {
    return `Konektor OVHcloud ověřil stav serveru: ${serverStatus}.`;
  }

  if (provider === "ovhcloud" && firewallEnabled === true) {
    return "Konektor OVHcloud ověřil, že firewall je zapnutý.";
  }

  if (provider === "ovhcloud" && backupPresent === true) {
    return "Konektor OVHcloud ověřil dostupnost backup storage.";
  }

  if (typeof mfaEnabled === "number" && typeof totalUsers === "number") {
    return `Zjištěno ${mfaEnabled} z ${totalUsers} účtů s vícefaktorovým ověřením.`;
  }

  return "Automatická kontrola potvrdila splnění opatření.";
}

function formatGapDescription(input: {
  snapshotData: SnapshotData;
  source: EvidenceSource;
}): string {
  const attestationAnswers = asRecord(asRecord(input.snapshotData).attestationAnswers);

  if (isDesignatedPersonTrainingGap(attestationAnswers)) {
    return "Školení pověřené osoby je starší než 12 měsíců nebo nebylo absolvováno.";
  }

  if (input.source === "connector") {
    return "Automatická kontrola identifikovala nesoulad proti požadovanému opatření.";
  }

  return "Manuální sebehodnocení označilo opatření jako nesplněné nebo nedoložené.";
}

function formatAttestationText(): string {
  return "Zástupce organizace doložil splnění opatření v manuálním sebehodnocení.";
}

function blockForControl(category: string | null, controlKey: string): NukibControlBlock {
  return (
    WORKSPACE_CONTROL_LOOKUP.get(controlKey)?.block ??
    (category ? CATEGORY_BLOCKS[category] : null) ??
    DEFAULT_BLOCK
  );
}

function workspaceNamesFromIntake(value: unknown): string[] {
  const recommendations = asRecord(value).workspaceRecommendations;

  if (!Array.isArray(recommendations)) {
    return [];
  }

  return recommendations.flatMap((recommendation) => {
    const item = asRecord(recommendation);
    const platformKey = item.platformKey;
    const label = item.label;

    if (typeof platformKey === "string") {
      const workspace = WORKSPACE_BY_PLATFORM_ID.get(platformKey);

      if (workspace) {
        return [workspace.platformName];
      }
    }

    return typeof label === "string" && label.trim() ? [label] : [];
  });
}

function unique(values: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value))),
  );
}

export async function getOrgWithEvidence(orgId: string): Promise<ReportContext> {
  const db = getDb();
  const [organisationRows, evidenceRows, integrationRows, intakeRows] =
    await Promise.all([
      db
        .select()
        .from(organisations)
        .where(eq(organisations.clerkOrgId, orgId))
        .limit(1),
      db
        .select({
          assessmentResult: evidence.assessmentResult,
          category: controls.category,
          collectedAt: evidence.collectedAt,
          controlId: evidence.controlId,
          controlKey: controls.key,
          controlName: controls.titleCs,
          description: evidence.description,
          evidenceId: evidence.id,
          integrationProvider: integrations.provider,
          snapshotData: evidence.snapshotData,
          source: evidence.source,
        })
        .from(evidence)
        .innerJoin(controls, eq(evidence.controlId, controls.id))
        .leftJoin(integrationRuns, eq(evidence.integrationRunId, integrationRuns.id))
        .leftJoin(integrations, eq(integrationRuns.integrationId, integrations.id))
        .where(eq(evidence.clerkOrgId, orgId))
        .orderBy(desc(evidence.collectedAt)),
      db
        .select({
          provider: integrations.provider,
        })
        .from(integrations)
        .where(eq(integrations.clerkOrgId, orgId)),
      db
        .select({
          derivedScope: orgIntakeProfiles.derivedScope,
        })
        .from(orgIntakeProfiles)
        .where(eq(orgIntakeProfiles.clerkOrgId, orgId))
        .limit(1),
    ]);
  const organisation = organisationRows[0] ?? null;

  if (!organisation) {
    throw new Error("Organisation not found.");
  }

  const latestByControl = new Map<string, (typeof evidenceRows)[number]>();

  for (const row of evidenceRows) {
    if (!latestByControl.has(row.controlId)) {
      latestByControl.set(row.controlId, row);
    }
  }

  const evidenceRecords: EvidenceRecord[] = Array.from(latestByControl.values()).map(
    (row) => {
      const workspaceControl = WORKSPACE_CONTROL_LOOKUP.get(row.controlKey);
      const provider = row.integrationProvider ?? providerFromSnapshot(row.snapshotData);
      const connectorName = providerLabel(provider);
      const isGap = row.assessmentResult === "gap";
      const isPass = row.assessmentResult === "pass";
      const isConnector = row.source === "connector";

      return {
        assessmentResult: row.assessmentResult,
        assessedAt: row.collectedAt,
        attestationText: row.source === "manual" && isPass ? formatAttestationText() : null,
        collectedAt: row.collectedAt,
        connectorName,
        controlId: row.controlId,
        controlKey: row.controlKey,
        controlName: row.controlName,
        evidenceId: row.evidenceId,
        frameworkMappings: workspaceControl?.frameworkMappings,
        finding: isConnector && isPass ? formatAutomatedFinding(row.snapshotData) : null,
        gapDescription: isGap
          ? formatGapDescription({
              snapshotData: row.snapshotData,
              source: row.source,
            })
          : null,
        nukibBlock: blockForControl(row.category, row.controlKey),
        legacyNis2ArticleRef: workspaceControl?.legacyNis2ArticleRef ?? null,
        legacyZobkSectionRef: workspaceControl?.legacyZobkSectionRef ?? null,
        nukibTier: workspaceControl?.nukibTier,
        recommendation: workspaceControl?.recommendation ?? null,
        source: row.source,
      };
    },
  );

  const workspaceNames = unique([
    ...workspaceNamesFromIntake(intakeRows[0]?.derivedScope),
    ...evidenceRecords.map((record) =>
      WORKSPACE_CONTROL_LOOKUP.get(record.controlKey)?.workspaceName,
    ),
  ]);
  const connectorNames = unique([
    ...integrationRows.map((row) => providerLabel(row.provider)),
    ...evidenceRecords.map((record) => record.connectorName),
  ]);

  return {
    connectorNames,
    evidenceRecords,
    generatedAt: new Date(),
    org: {
      brandingConfig: {
        displayName: organisation.brandingDisplayName,
        footerText: organisation.brandingFooterText,
        logoUrl: organisation.brandingLogoUrl,
      },
      clerkOrgId: organisation.clerkOrgId,
      dic: organisation.dic,
      ico: organisation.ico,
      name: organisation.name,
      rezimPovinnosti: organisation.rezimPovinnosti,
      sidlo: organisation.sidlo,
      tier: organisation.tier,
    },
    workspaceNames,
  };
}
