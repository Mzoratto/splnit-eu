import { createSign } from "node:crypto";
import { createOAuthState } from "@/lib/integrations/oauth-state";
import type { Integration } from "@/lib/db/schema";
import { assertGitHubConfig, type GitHubIntegrationConfig } from "./client";

type GitHubInstallation = {
  account?: {
    login?: string;
    type?: string;
  };
  id: number;
};

type GitHubInstallationToken = {
  expires_at: string;
  token: string;
};

type GitHubRepository = {
  archived?: boolean;
  default_branch?: string;
  full_name: string;
  name: string;
  private?: boolean;
  security_and_analysis?: {
    secret_scanning?: {
      status?: string;
    };
  };
};

type GitHubListRepositoriesResponse = {
  repositories: GitHubRepository[];
  total_count: number;
};

function getPrivateKey() {
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("GITHUB_APP_PRIVATE_KEY is required.");
  }

  return privateKey.replace(/\\n/g, "\n");
}

function getAppId() {
  if (!process.env.GITHUB_APP_ID) {
    throw new Error("GITHUB_APP_ID is required.");
  }

  return process.env.GITHUB_APP_ID;
}

function base64url(input: string) {
  return Buffer.from(input).toString("base64url");
}

export function hasGitHubAppConfig() {
  return Boolean(
    process.env.GITHUB_APP_ID &&
      process.env.GITHUB_APP_PRIVATE_KEY &&
      process.env.GITHUB_APP_SLUG,
  );
}

export function getGitHubAppInstallUrl(clerkOrgId: string) {
  if (!process.env.GITHUB_APP_SLUG) {
    return null;
  }

  const params = new URLSearchParams({ state: createOAuthState(clerkOrgId, "github") });
  return `https://github.com/apps/${process.env.GITHUB_APP_SLUG}/installations/new?${params}`;
}

export function createGitHubAppJwt() {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      exp: now + 9 * 60,
      iat: now - 60,
      iss: getAppId(),
    }),
  );
  const unsignedToken = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");

  signer.update(unsignedToken);
  signer.end();

  return `${unsignedToken}.${signer.sign(getPrivateKey(), "base64url")}`;
}

async function githubAppRequest<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${createGitHubAppJwt()}`,
      "User-Agent": "splnit-eu",
      "X-GitHub-Api-Version": "2022-11-28",
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub App request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getGitHubInstallation(installationId: string | number) {
  return githubAppRequest<GitHubInstallation>(`/app/installations/${installationId}`);
}

export async function createGitHubInstallationToken(
  installationId: string | number,
) {
  return githubAppRequest<GitHubInstallationToken>(
    `/app/installations/${installationId}/access_tokens`,
    { method: "POST" },
  );
}

export function getGitHubConfig(integration: Integration) {
  const config = (integration.config ?? {}) as GitHubIntegrationConfig;
  assertGitHubConfig(config);

  return config;
}

export async function createGitHubInstallationClient(integration: Integration) {
  const config = getGitHubConfig(integration);
  const token = await createGitHubInstallationToken(config.installationId);

  async function request<T>(path: string, init: RequestInit = {}) {
    const response = await fetch(`https://api.github.com${path}`, {
      ...init,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token.token}`,
        "User-Agent": "splnit-eu",
        "X-GitHub-Api-Version": "2022-11-28",
        ...init.headers,
      },
    });

    if (response.status === 204) {
      return null as T;
    }

    if (!response.ok) {
      const error = new Error(`GitHub request failed: ${response.status}`);
      error.name = String(response.status);
      throw error;
    }

    return response.json() as Promise<T>;
  }

  return {
    config,
    request,
    tokenExpiresAt: token.expires_at,
  };
}

export async function listGitHubInstallationRepositories(integration: Integration) {
  const client = await createGitHubInstallationClient(integration);
  const repositories: GitHubRepository[] = [];
  let page = 1;

  while (true) {
    const response = await client.request<GitHubListRepositoriesResponse>(
      `/installation/repositories?per_page=100&page=${page}`,
    );

    repositories.push(...response.repositories);

    if (
      repositories.length >= response.total_count ||
      response.repositories.length === 0
    ) {
      return repositories;
    }

    page += 1;
  }
}
