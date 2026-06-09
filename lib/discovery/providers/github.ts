import type { Integration } from "@/lib/db/schema";
import { ciaFor } from "@/lib/discovery/cia-heuristics";
import type {
  DiscoveryAdapter,
  DiscoveryResult,
  DiscoveredAsset,
  DiscoveredVendor,
} from "@/lib/discovery/types";
import {
  createGitHubInstallationClient,
  getGitHubConfig,
  listGitHubInstallationRepositories,
} from "@/lib/integrations/github/app";

const BRANCH_PROTECTION_CHECK_LIMIT = 50;

type GitHubRepository = {
  archived?: boolean;
  default_branch?: string;
  full_name: string;
  name?: string;
  private?: boolean;
  security_and_analysis?: {
    secret_scanning?: {
      status?: string;
    };
  };
};

type GitHubMember = {
  id?: number | string;
  login?: string;
  type?: string;
};

type GitHubInstallation = {
  app_id?: number;
  app_slug?: string;
  id?: number | string;
  permissions?: Record<string, unknown>;
  repository_selection?: string;
  target_type?: string;
};

type GitHubInstallationsResponse = {
  installations?: GitHubInstallation[];
  total_count?: number;
};

type GitHubCredentialAuthorization = {
  authorized_credential_id?: number | string;
  credential_id?: number | string;
  id?: number | string;
  login?: string;
  scopes?: string[];
};

type GitHubClient = Awaited<ReturnType<typeof createGitHubInstallationClient>>;

function isNotFound(error: unknown) {
  return error instanceof Error && error.name === "404";
}

function isPermissionError(error: unknown) {
  return error instanceof Error && (error.name === "403" || error.name === "404");
}

function stringValue(value: unknown) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

function collectionFromArray<T extends Record<string, unknown>>(value: unknown): T[] {
  return Array.isArray(value)
    ? value.filter((row): row is T =>
        typeof row === "object" && row !== null && !Array.isArray(row),
      )
    : [];
}

async function readBranchProtection(
  client: GitHubClient,
  repo: GitHubRepository,
  warnings: string[],
) {
  if (!repo.default_branch) {
    return null;
  }

  try {
    await client.request(
      `/repos/${repo.full_name}/branches/${repo.default_branch}/protection`,
    );
    return true;
  } catch (error) {
    if (isNotFound(error)) {
      return false;
    }

    if (isPermissionError(error)) {
      warnings.push(
        `Could not read branch protection for ${repo.full_name}; repository CIA may be incomplete.`,
      );
      return null;
    }

    warnings.push(
      `Could not read branch protection for ${repo.full_name}; repository CIA may be incomplete.`,
    );
    return null;
  }
}

async function readMembers(
  client: GitHubClient,
  owner: string,
  warnings: string[],
) {
  const admins: GitHubMember[] = [];
  const members: GitHubMember[] = [];

  try {
    admins.push(
      ...collectionFromArray<GitHubMember>(
        await client.request(`/orgs/${owner}/members?role=admin&per_page=100`),
      ),
    );
  } catch (error) {
    if (isPermissionError(error)) {
      warnings.push(
        "Could not enumerate GitHub organisation owners/admins; privileged account drafts may be incomplete.",
      );
    } else {
      warnings.push(
        "Could not enumerate GitHub organisation owners/admins; privileged account drafts may be incomplete.",
      );
    }
  }

  try {
    members.push(
      ...collectionFromArray<GitHubMember>(
        await client.request(`/orgs/${owner}/members?role=member&per_page=100`),
      ),
    );
  } catch (error) {
    if (isPermissionError(error)) {
      warnings.push(
        "Could not enumerate standard GitHub organisation members; member summary may be incomplete.",
      );
    } else {
      warnings.push(
        "Could not enumerate standard GitHub organisation members; member summary may be incomplete.",
      );
    }
  }

  return { admins, members };
}

async function readInstalledApps(
  client: GitHubClient,
  owner: string,
  warnings: string[],
) {
  try {
    const response = await client.request<GitHubInstallationsResponse>(
      `/orgs/${owner}/installations?per_page=100`,
    );
    return Array.isArray(response.installations) ? response.installations : [];
  } catch (error) {
    if (isPermissionError(error)) {
      warnings.push(
        "Could not read installed GitHub Apps for the organisation; vendor drafts may be incomplete.",
      );
      return [];
    }

    warnings.push(
      "Could not read installed GitHub Apps for the organisation; vendor drafts may be incomplete.",
    );
    return [];
  }
}

async function readCredentialAuthorizations(
  client: GitHubClient,
  owner: string,
  warnings: string[],
) {
  try {
    return collectionFromArray<GitHubCredentialAuthorization>(
      await client.request(`/orgs/${owner}/credential-authorizations?per_page=100`),
    );
  } catch (error) {
    if (isPermissionError(error)) {
      warnings.push(
        "Could not read GitHub OAuth credential authorizations; permission is often owner-only, so vendor drafts may be incomplete.",
      );
      return [];
    }

    warnings.push(
      "Could not read GitHub OAuth credential authorizations; vendor drafts may be incomplete.",
    );
    return [];
  }
}

function repositoryAsset(repo: GitHubRepository, branchProtected: boolean | null): DiscoveredAsset {
  const isPublic = repo.private === false;
  const privateWithoutBranchProtection = repo.private !== false && branchProtected === false;

  return {
    category: "software",
    externalKey: `github:repo:${repo.full_name}`,
    metadata: {
      archived: repo.archived === true,
      branchProtected,
      defaultBranch: repo.default_branch ?? null,
      private: repo.private !== false,
      secretScanningStatus: repo.security_and_analysis?.secret_scanning?.status ?? null,
    },
    name: `GitHub repository: ${repo.full_name}`,
    provider: "github",
    suggestedOwner: repo.full_name.split("/")[0] ?? "",
    tier: privateWithoutBranchProtection || isPublic ? "primary" : "supporting",
    ...ciaFor({
      blastRadius: privateWithoutBranchProtection || isPublic ? 25 : 1,
      handlesSensitiveData: repo.private !== false,
      internetFacing: isPublic,
      privileged: privateWithoutBranchProtection,
      production: true,
    }),
  };
}

function adminMemberAsset(member: GitHubMember): DiscoveredAsset | null {
  const id = stringValue(member.id);
  if (!id) {
    return null;
  }

  return {
    category: "data",
    externalKey: `github:member:${member.id}`,
    metadata: {
      login: stringValue(member.login),
      type: stringValue(member.type),
    },
    name: `GitHub organisation owner/admin: ${member.login ?? id}`,
    provider: "github",
    suggestedOwner: stringValue(member.login) ?? "",
    tier: "primary",
    ...ciaFor({
      blastRadius: 100,
      handlesSensitiveData: true,
      internetFacing: true,
      privileged: true,
      production: true,
    }),
  };
}

function installedAppVendor(app: GitHubInstallation): DiscoveredVendor | null {
  const id = stringValue(app.id) ?? stringValue(app.app_id);
  if (!id) {
    return null;
  }

  const name = app.app_slug ? `GitHub App: ${app.app_slug}` : `GitHub App ${id}`;

  return {
    externalKey: `github:vendor:app:${id}`,
    metadata: {
      appId: app.app_id ?? null,
      permissions: app.permissions ?? {},
      repositorySelection: app.repository_selection ?? null,
      targetType: app.target_type ?? null,
    },
    name,
    provider: "github",
    rationale:
      "Installed GitHub App has repo/org access in the connected organisation; treat as a candidate supplier/data processor for review.",
    suggestedCriticality: "high",
    supplyType: "GitHub app with org access",
  };
}

function oauthVendor(authorization: GitHubCredentialAuthorization): DiscoveredVendor | null {
  const id = stringValue(authorization.id)
    ?? stringValue(authorization.authorized_credential_id)
    ?? stringValue(authorization.credential_id)
    ?? stringValue(authorization.login);

  if (!id) {
    return null;
  }

  const login = stringValue(authorization.login) ?? `OAuth credential ${id}`;

  return {
    externalKey: `github:vendor:oauth:${id}`,
    metadata: {
      scopes: Array.isArray(authorization.scopes) ? authorization.scopes : [],
    },
    name: login,
    provider: "github",
    rationale:
      "OAuth application/credential is authorized against the GitHub organisation and may hold repo/org access; treat as a candidate supplier/data processor for review.",
    suggestedCriticality: "high",
    supplyType: "GitHub app with org access",
  };
}

export const githubDiscoveryAdapter: DiscoveryAdapter = {
  provider: "github",

  async discover(integration: Integration): Promise<DiscoveryResult> {
    const config = getGitHubConfig(integration);
    const client = await createGitHubInstallationClient(integration);
    const warnings: string[] = [];
    const assets: DiscoveredAsset[] = [];
    const vendors: DiscoveredVendor[] = [];
    const owner = config.owner?.trim();

    if (!owner) {
      warnings.push(
        "GitHub installation owner is missing from the integration config; organisation discovery is incomplete.",
      );
    }

    const repositories = (await listGitHubInstallationRepositories(integration)) as GitHubRepository[];
    const activeRepositories = repositories.filter((repo) => !repo.archived);
    const orgKey = owner ?? config.installationId;

    assets.push({
      category: "service",
      externalKey: `github:org:${orgKey}`,
      metadata: {
        accountType: config.accountType ?? null,
        installationId: config.installationId,
        owner: owner ?? null,
        repositoryCount: activeRepositories.length,
      },
      name: owner ? `GitHub organisation: ${owner}` : "GitHub installation",
      provider: "github",
      suggestedOwner: owner ?? "",
      tier: "primary",
      ...ciaFor({
        blastRadius: Math.max(activeRepositories.length, 1),
        handlesSensitiveData: true,
        internetFacing: true,
        privileged: false,
        production: true,
      }),
    });

    let branchProtectionLimitWarningAdded = false;
    for (const [index, repo] of activeRepositories.entries()) {
      const branchProtected = index < BRANCH_PROTECTION_CHECK_LIMIT
        ? await readBranchProtection(client, repo, warnings)
        : null;

      if (index >= BRANCH_PROTECTION_CHECK_LIMIT && !branchProtectionLimitWarningAdded) {
        warnings.push(
          `Skipped branch-protection checks after ${BRANCH_PROTECTION_CHECK_LIMIT} repositories; repository CIA may be incomplete.`,
        );
        branchProtectionLimitWarningAdded = true;
      }

      assets.push(repositoryAsset(repo, branchProtected));
    }

    if (owner && config.accountType !== "User") {
      const { admins, members } = await readMembers(client, owner, warnings);
      const adminIds = new Set(admins.map((member) => stringValue(member.id)).filter(Boolean));

      for (const member of admins) {
        const asset = adminMemberAsset(member);
        if (asset) {
          assets.push(asset);
        }
      }

      const standardCount = members.filter((member) => {
        const id = stringValue(member.id);
        return id ? !adminIds.has(id) : true;
      }).length;

      if (standardCount > 0) {
        assets.push({
          category: "data",
          externalKey: `github:members:standard:${owner}`,
          metadata: { count: standardCount },
          name: `Standard GitHub organisation members (${standardCount})`,
          provider: "github",
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

      for (const app of await readInstalledApps(client, owner, warnings)) {
        const vendor = installedAppVendor(app);
        if (vendor) {
          vendors.push(vendor);
        }
      }

      for (const authorization of await readCredentialAuthorizations(client, owner, warnings)) {
        const vendor = oauthVendor(authorization);
        if (vendor) {
          vendors.push(vendor);
        }
      }
    } else {
      warnings.push(
        "GitHub organisation member and app discovery requires an organisation installation; skipped org-only inventory.",
      );
    }

    return { assets, vendors, warnings };
  },
};
