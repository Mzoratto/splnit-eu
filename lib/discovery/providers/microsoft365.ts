import type { Integration } from "@/lib/db/schema";
import { ciaFor } from "@/lib/discovery/cia-heuristics";
import type {
  DiscoveryAdapter,
  DiscoveryResult,
  DiscoveredAsset,
  DiscoveredVendor,
} from "@/lib/discovery/types";
import { getGraphClient } from "@/lib/integrations/microsoft365/client";

type GraphRequest = {
  get: () => Promise<unknown>;
};

type GraphClient = {
  api: (path: string) => GraphRequest;
};

type GraphUser = {
  accountEnabled?: boolean;
  displayName?: string;
  id: string;
  userPrincipalName?: string;
};

type GraphDirectoryRole = {
  displayName?: string;
  id: string;
  members?: unknown;
};

type GraphDirectoryMember = {
  displayName?: string;
  id: string;
};

type GraphServicePrincipal = {
  appDisplayName: string;
  id: string;
  publisherName?: string;
};

function graphCollection(value: unknown): Record<string, unknown>[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }

  const rows = (value as { value?: unknown }).value;
  return Array.isArray(rows)
    ? rows.filter((row): row is Record<string, unknown> =>
        typeof row === "object" && row !== null && !Array.isArray(row),
      )
    : [];
}

async function safeGraphCollection<T extends Record<string, unknown>>(
  client: GraphClient,
  path: string,
): Promise<T[]> {
  const response = await client.api(path).get();
  return graphCollection(response) as T[];
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function boolValue(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

function toUser(row: Record<string, unknown>): GraphUser | null {
  const id = stringValue(row.id);
  if (!id) {
    return null;
  }

  return {
    accountEnabled: boolValue(row.accountEnabled) ?? undefined,
    displayName: stringValue(row.displayName) ?? undefined,
    id,
    userPrincipalName: stringValue(row.userPrincipalName) ?? undefined,
  };
}

function toDirectoryRole(row: Record<string, unknown>): GraphDirectoryRole | null {
  const id = stringValue(row.id);
  if (!id) {
    return null;
  }

  return {
    displayName: stringValue(row.displayName) ?? undefined,
    id,
    members: row.members,
  };
}

function membersFromRole(role: GraphDirectoryRole): GraphDirectoryMember[] {
  const rawMembers = Array.isArray(role.members)
    ? role.members
    : typeof role.members === "object" && role.members !== null
      ? (role.members as { value?: unknown }).value
      : [];

  return Array.isArray(rawMembers)
    ? rawMembers
        .filter((member): member is Record<string, unknown> =>
          typeof member === "object" && member !== null && !Array.isArray(member),
        )
        .map((member) => ({
          displayName: stringValue(member.displayName) ?? undefined,
          id: stringValue(member.id) ?? "",
        }))
        .filter((member) => member.id)
    : [];
}

function toServicePrincipal(row: Record<string, unknown>): GraphServicePrincipal | null {
  const id = stringValue(row.id);
  const appDisplayName = stringValue(row.appDisplayName);

  if (!id || !appDisplayName) {
    return null;
  }

  return {
    appDisplayName,
    id,
    publisherName: stringValue(row.publisherName) ?? undefined,
  };
}

export const microsoft365DiscoveryAdapter: DiscoveryAdapter = {
  provider: "microsoft365",

  async discover(integration: Integration): Promise<DiscoveryResult> {
    const graph = await getGraphClient(integration) as GraphClient;
    const warnings: string[] = [];
    const assets: DiscoveredAsset[] = [
      {
        category: "service",
        externalKey: `microsoft365:tenant:${integration.id}`,
        metadata: { integrationId: integration.id },
        name: "Microsoft 365 tenant",
        provider: "microsoft365",
        suggestedOwner: "",
        tier: "primary",
        ...ciaFor({
          blastRadius: 100,
          handlesSensitiveData: true,
          internetFacing: true,
          privileged: false,
          production: true,
        }),
      },
    ];
    const vendors: DiscoveredVendor[] = [];
    const adminUserIds = new Set<string>();

    try {
      const roles = (
        await safeGraphCollection<Record<string, unknown>>(
          graph,
          "/directoryRoles?$expand=members($select=id,displayName)&$select=id,displayName",
        )
      )
        .map(toDirectoryRole)
        .filter((role): role is GraphDirectoryRole => Boolean(role));

      for (const role of roles) {
        if (!/admin/i.test(role.displayName ?? "")) {
          continue;
        }

        for (const member of membersFromRole(role)) {
          adminUserIds.add(member.id);
        }
      }
    } catch {
      warnings.push(
        "Could not read Microsoft 365 directory roles; privileged accounts may be incomplete. Check Directory.Read.All permission.",
      );
    }

    try {
      const users = (
        await safeGraphCollection<Record<string, unknown>>(
          graph,
          "/users?$select=id,displayName,userPrincipalName,accountEnabled&$top=999",
        )
      )
        .map(toUser)
        .filter((user): user is GraphUser => Boolean(user));
      const enabled = users.filter((user) => user.accountEnabled !== false);
      const standardCount = Math.max(
        0,
        enabled.filter((user) => !adminUserIds.has(user.id)).length,
      );

      if (standardCount > 0) {
        assets.push({
          category: "data",
          externalKey: "microsoft365:users:standard",
          metadata: { count: standardCount },
          name: `Standard user accounts (${standardCount})`,
          provider: "microsoft365",
          suggestedOwner: "",
          tier: "supporting",
          ...ciaFor({
            blastRadius: standardCount,
            handlesSensitiveData: true,
            internetFacing: true,
            privileged: false,
            production: true,
          }),
        });
      }

      for (const user of enabled.filter((item) => adminUserIds.has(item.id))) {
        assets.push({
          category: "data",
          externalKey: `microsoft365:admin:${user.id}`,
          metadata: { upn: user.userPrincipalName ?? null },
          name: `Privileged account: ${user.displayName ?? user.userPrincipalName ?? user.id}`,
          provider: "microsoft365",
          suggestedOwner: user.userPrincipalName ?? "",
          tier: "primary",
          ...ciaFor({
            blastRadius: 100,
            handlesSensitiveData: true,
            internetFacing: true,
            privileged: true,
            production: true,
          }),
        });
      }
    } catch {
      warnings.push("Could not enumerate Microsoft 365 users; draft asset register is incomplete.");
    }

    try {
      const servicePrincipals = (
        await safeGraphCollection<Record<string, unknown>>(
          graph,
          "/servicePrincipals?$select=id,appDisplayName,publisherName&$top=100",
        )
      )
        .map(toServicePrincipal)
        .filter((servicePrincipal): servicePrincipal is GraphServicePrincipal =>
          Boolean(servicePrincipal),
        );

      for (const sp of servicePrincipals) {
        if (/microsoft/i.test(sp.publisherName ?? "")) {
          continue;
        }

        assets.push({
          category: "software",
          externalKey: `microsoft365:app:${sp.id}`,
          metadata: { publisher: sp.publisherName ?? null },
          name: `Connected app: ${sp.appDisplayName}`,
          provider: "microsoft365",
          suggestedOwner: "",
          tier: "supporting",
          ...ciaFor({
            blastRadius: 0,
            handlesSensitiveData: true,
            internetFacing: true,
            privileged: false,
            production: true,
          }),
        });
        vendors.push({
          externalKey: `microsoft365:vendor:${sp.id}`,
          metadata: { publisher: sp.publisherName ?? null },
          name: sp.appDisplayName,
          provider: "microsoft365",
          rationale:
            "Third-party application granted access to the Microsoft 365 tenant; treat as a candidate supplier/data processor for review.",
          suggestedCriticality: "high",
          supplyType: "SaaS application with tenant data access",
        });
      }
    } catch {
      warnings.push("Could not read Microsoft 365 connected applications.");
    }

    return { assets, vendors, warnings };
  },
};
