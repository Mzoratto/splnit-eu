import type { Integration } from "@/lib/db/schema";
import { listConnectedIntegrations } from "@/lib/db/queries/integrations";
import type { AccessReviewSourceItem } from "@/lib/db/queries/access-reviews";
import { createGitHubInstallationClient, getGitHubConfig } from "@/lib/integrations/github/app";
import { getGraphClient } from "@/lib/integrations/microsoft365/client";

export type AccessReviewProvider = "all" | "github" | "microsoft365";

type GraphUsersResponse = {
  value?: {
    accountEnabled?: boolean;
    displayName?: string;
    mail?: string | null;
    userPrincipalName?: string | null;
    userType?: string;
  }[];
};

type GitHubMember = {
  login?: string;
  type?: string;
};

export async function collectAccessReviewItems(input: {
  clerkOrgId: string;
  provider: AccessReviewProvider;
}) {
  const integrations = await listConnectedIntegrations(input.clerkOrgId);
  const requestedProviders =
    input.provider === "all" ? ["microsoft365", "github"] : [input.provider];
  const items: AccessReviewSourceItem[] = [];

  for (const provider of requestedProviders) {
    const integration = integrations.find((row) => row.provider === provider);

    if (!integration) {
      continue;
    }

    if (provider === "microsoft365") {
      items.push(...(await listMicrosoftEntraUsers(integration)));
    }

    if (provider === "github") {
      items.push(...(await listGitHubOrgMembers(integration)));
    }
  }

  return dedupeItems(items);
}

async function listMicrosoftEntraUsers(integration: Integration) {
  const client = getGraphClient(integration);
  const response = (await client
    .api("/users")
    .select("displayName,userPrincipalName,mail,accountEnabled,userType")
    .top(999)
    .get()) as GraphUsersResponse;

  return (response.value ?? []).map((user) => {
    const email = user.mail ?? user.userPrincipalName ?? null;
    const status = user.accountEnabled === false ? "disabled" : "enabled";
    const userType = user.userType ?? "member";

    return {
      accessLevel: `${userType} · ${status}`,
      resource: "Microsoft Entra ID",
      userEmail: email,
      userName: user.displayName ?? email ?? "Unknown Microsoft user",
    };
  });
}

async function listGitHubOrgMembers(integration: Integration) {
  const config = getGitHubConfig(integration);

  if (!config.owner || config.accountType !== "Organization") {
    return [];
  }

  const client = await createGitHubInstallationClient(integration);
  const members: GitHubMember[] = [];
  const owner = encodeURIComponent(config.owner);

  for (let page = 1; page <= 5; page += 1) {
    const pageMembers = await client.request<GitHubMember[]>(
      `/orgs/${owner}/members?per_page=100&page=${page}`,
    );

    members.push(...pageMembers);

    if (pageMembers.length < 100) {
      break;
    }
  }

  return members.map((member) => ({
    accessLevel: member.type ?? "member",
    resource: `GitHub: ${config.owner}`,
    userEmail: null,
    userName: member.login ?? "Unknown GitHub member",
  }));
}

function dedupeItems(items: AccessReviewSourceItem[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = [
      item.resource,
      item.userEmail?.toLowerCase() ?? item.userName.toLowerCase(),
    ].join(":");

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
