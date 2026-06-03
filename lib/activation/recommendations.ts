import type { AccountingPlatform, WorkspaceRecommendation } from "@/lib/onboarding/intake-scope";

export type ActivationRecommendationKind = "connector" | "workspace";

export type IntegrationHubIconKey =
  | "cloud"
  | "database"
  | "git-branch"
  | "monitor"
  | "plug"
  | "server";

export type ActivationRecommendation = {
  href: string;
  key: string;
  kind: ActivationRecommendationKind;
  label: string;
  planned: boolean;
  providerKey: string | null;
  reason: string;
  supported: boolean;
  workspaceKey: string | null;
};

type RecommendationDefinition = ActivationRecommendation & {
  accountingPlatforms?: readonly AccountingPlatform[];
  aliases?: readonly string[];
  integrationHub: {
    badgeAbbreviation: string;
    badgeClassName: string;
    defaultTestCount: number;
    iconKey: IntegrationHubIconKey;
  };
};

export type IntegrationHubRecommendation = ActivationRecommendation & {
  badgeAbbreviation: string;
  badgeClassName: string;
  defaultTestCount: number;
  iconKey: IntegrationHubIconKey;
};

const RECOMMENDATIONS: readonly RecommendationDefinition[] = [
  {
    aliases: ["microsoft365", "microsoft-copilot"],
    href: "/integrations/microsoft365",
    key: "microsoft365",
    kind: "connector",
    label: "Microsoft 365",
    planned: false,
    providerKey: "microsoft365",
    reason: "Microsoft 365 is selected, so start with identity, MFA, guest access, and audit-log evidence.",
    supported: true,
    workspaceKey: null,
    integrationHub: {
      badgeAbbreviation: "MI",
      badgeClassName: "bg-sky-500",
      defaultTestCount: 6,
      iconKey: "monitor",
    },
  },
  {
    aliases: ["github", "github-copilot"],
    href: "/integrations/github",
    key: "github",
    kind: "connector",
    label: "GitHub",
    planned: false,
    providerKey: "github",
    reason: "GitHub is selected, so start with branch protection, code-review, and dependency evidence.",
    supported: true,
    workspaceKey: null,
    integrationHub: {
      badgeAbbreviation: "GH",
      badgeClassName: "bg-slate-800",
      defaultTestCount: 5,
      iconKey: "git-branch",
    },
  },
  {
    aliases: ["aws"],
    href: "/integrations/aws",
    key: "aws",
    kind: "connector",
    label: "AWS",
    planned: false,
    providerKey: "aws",
    reason: "AWS is selected, so start with cloud logging, storage, and identity evidence.",
    supported: true,
    workspaceKey: null,
    integrationHub: {
      badgeAbbreviation: "AW",
      badgeClassName: "bg-amber-500",
      defaultTestCount: 4,
      iconKey: "cloud",
    },
  },
  {
    aliases: ["hetzner", "hetzner-cloud"],
    href: "/integrations/hetzner",
    key: "hetzner",
    kind: "connector",
    label: "Hetzner Cloud",
    planned: false,
    providerKey: "hetzner",
    reason: "Hetzner Cloud is selected, so start with server, firewall, and snapshot evidence.",
    supported: true,
    workspaceKey: null,
    integrationHub: {
      badgeAbbreviation: "HE",
      badgeClassName: "bg-orange-500",
      defaultTestCount: 3,
      iconKey: "server",
    },
  },
  {
    aliases: ["ovh", "ovhcloud", "ovh-cloud"],
    href: "/integrations/ovhcloud",
    key: "ovhcloud",
    kind: "connector",
    label: "OVHcloud",
    planned: false,
    providerKey: "ovhcloud",
    reason: "OVHcloud is selected, so start with dedicated server, firewall, and backup-storage evidence.",
    supported: true,
    workspaceKey: null,
    integrationHub: {
      badgeAbbreviation: "OV",
      badgeClassName: "bg-indigo-600",
      defaultTestCount: 3,
      iconKey: "database",
    },
  },
  {
    aliases: ["google", "google-workspace", "google_workspace"],
    href: "/integrations/google-workspace",
    key: "google_workspace",
    kind: "connector",
    label: "Google Workspace",
    planned: true,
    providerKey: "google_workspace",
    reason: "Google Workspace is in the stack, but this connector is planned; use manual evidence until it is available.",
    supported: false,
    workspaceKey: null,
    integrationHub: {
      badgeAbbreviation: "GW",
      badgeClassName: "bg-slate-400",
      defaultTestCount: 0,
      iconKey: "plug",
    },
  },
  {
    accountingPlatforms: ["pohoda"],
    href: "/workspaces/pohoda",
    key: "pohoda",
    kind: "workspace",
    label: "Pohoda",
    planned: false,
    providerKey: null,
    reason: "Používáte Pohoda — doporučujeme propojit účetní data se sadou NIS2 kontrol specifických pro Pohoda (zálohování dat, přístup k mServeru, API credentials).",
    supported: true,
    workspaceKey: "pohoda",
    integrationHub: {
      badgeAbbreviation: "PO",
      badgeClassName: "bg-emerald-600",
      defaultTestCount: 4,
      iconKey: "database",
    },
  },
  {
    accountingPlatforms: ["abra_flexi"],
    href: "/workspaces/abra-flexi",
    key: "abra-flexi",
    kind: "workspace",
    label: "ABRA Flexi",
    planned: false,
    providerKey: null,
    reason: "Používáte ABRA Flexi — doporučujeme projít sadu NIS2/ZoKB kontrol pro REST API, uživatelské role, zálohy a bezpečný transport.",
    supported: true,
    workspaceKey: "abra-flexi",
    integrationHub: {
      badgeAbbreviation: "AB",
      badgeClassName: "bg-purple-600",
      defaultTestCount: 4,
      iconKey: "database",
    },
  },
  {
    accountingPlatforms: ["money_s3"],
    href: "/workspaces/money-s3",
    key: "money_s3",
    kind: "workspace",
    label: "Money S3 / S4 (Seyfor)",
    planned: false,
    providerKey: null,
    reason: "Používáte Money S3 / S4 — doporučujeme projít sadou NIS2/ZoKB kontrol specifických pro Money S3 (zálohy databáze, přístupy, SQL Server konfigurace, API connectivity).",
    supported: true,
    workspaceKey: "money_s3",
    integrationHub: {
      badgeAbbreviation: "MO",
      badgeClassName: "bg-teal-600",
      defaultTestCount: 4,
      iconKey: "database",
    },
  },
  {
    accountingPlatforms: ["helios"],
    href: "/workspaces/helios",
    key: "helios",
    kind: "workspace",
    label: "Helios (Asseco)",
    planned: false,
    providerKey: null,
    reason: "Používáte Helios — doporučujeme projít sadou NIS2/ZoKB kontrol specifických pro Helios (SQL Server zálohy, přístupy, MES/SCADA integrace, EDI zabezpečení).",
    supported: true,
    workspaceKey: "helios",
    integrationHub: {
      badgeAbbreviation: "HE",
      badgeClassName: "bg-cyan-700",
      defaultTestCount: 4,
      iconKey: "database",
    },
  },
];

export const ACTIVATION_RECOMMENDATIONS: readonly ActivationRecommendation[] = RECOMMENDATIONS.map(toPublicRecommendation);

export function getIntegrationHubRecommendations(): readonly IntegrationHubRecommendation[] {
  return RECOMMENDATIONS.map((definition) => ({
    ...toPublicRecommendation(definition),
    badgeAbbreviation: definition.integrationHub.badgeAbbreviation,
    badgeClassName: definition.integrationHub.badgeClassName,
    defaultTestCount: definition.integrationHub.defaultTestCount,
    iconKey: definition.integrationHub.iconKey,
  }));
}

function toPublicRecommendation(definition: RecommendationDefinition): ActivationRecommendation {
  return {
    href: definition.href,
    key: definition.key,
    kind: definition.kind,
    label: definition.label,
    planned: definition.planned,
    providerKey: definition.providerKey,
    reason: definition.reason,
    supported: definition.supported,
    workspaceKey: definition.workspaceKey,
  };
}

export function getActivationRecommendation(key: string | null | undefined): ActivationRecommendation | null {
  if (!key) {
    return null;
  }

  const normalizedKey = normalizeRecommendationKey(key);
  const definition = RECOMMENDATIONS.find(
    (item) =>
      item.key === normalizedKey ||
      item.providerKey === normalizedKey ||
      item.workspaceKey === normalizedKey ||
      item.aliases?.includes(normalizedKey),
  );

  return definition ? toPublicRecommendation(definition) : null;
}

export function getWorkspaceRecommendationForAccountingPlatform(
  accountingPlatform: AccountingPlatform | null | undefined,
): ActivationRecommendation | null {
  if (!accountingPlatform || accountingPlatform === "none" || accountingPlatform === "other") {
    return null;
  }

  const definition = RECOMMENDATIONS.find((item) => item.accountingPlatforms?.includes(accountingPlatform));

  return definition ? toPublicRecommendation(definition) : null;
}

export function getWorkspaceRecommendationFromDerivedScope(
  workspaceRecommendations: readonly WorkspaceRecommendation[] | null | undefined,
): ActivationRecommendation | null {
  for (const recommendation of workspaceRecommendations ?? []) {
    const match = getActivationRecommendation(recommendation.platformKey);

    if (match?.kind === "workspace") {
      return match;
    }
  }

  return null;
}

export function getConnectorRecommendationFromTools(
  toolKeys: readonly string[],
  options: { fallback?: boolean } = {},
): ActivationRecommendation | null {
  for (const toolKey of toolKeys) {
    const recommendation = getActivationRecommendation(toolKey);

    if (recommendation?.kind === "connector") {
      return recommendation;
    }
  }

  return options.fallback ? getActivationRecommendation("microsoft365") : null;
}

export function getRecommendedConnectorFromTools(toolKeys: readonly string[]) {
  return getConnectorRecommendationFromTools(toolKeys, { fallback: true })?.providerKey ?? "microsoft365";
}

export function getPrimaryActivationRecommendation(input: {
  accountingPlatform?: AccountingPlatform | null;
  fallbackConnector?: boolean;
  selectedTools?: readonly string[];
  workspaceRecommendations?: readonly WorkspaceRecommendation[] | null;
}) {
  const workspaceRecommendation =
    getWorkspaceRecommendationForAccountingPlatform(input.accountingPlatform) ??
    getWorkspaceRecommendationFromDerivedScope(input.workspaceRecommendations);

  if (workspaceRecommendation?.supported) {
    return workspaceRecommendation;
  }

  return getConnectorRecommendationFromTools(input.selectedTools ?? [], {
    fallback: input.fallbackConnector,
  });
}

export function toWorkspaceRecommendation(
  recommendation: ActivationRecommendation | null | undefined,
): WorkspaceRecommendation | null {
  if (!recommendation || recommendation.kind !== "workspace" || !recommendation.workspaceKey) {
    return null;
  }

  return {
    label: recommendation.label,
    platformKey: recommendation.workspaceKey,
    reason: recommendation.reason,
  };
}

function normalizeRecommendationKey(key: string) {
  if (key === "google-workspace") {
    return "google_workspace";
  }

  if (key === "abra_flexi") {
    return "abra-flexi";
  }

  if (key === "money-s3") {
    return "money_s3";
  }

  return key;
}
