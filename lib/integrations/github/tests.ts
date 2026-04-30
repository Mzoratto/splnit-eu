import type { IntegrationAdapter, TestResult } from "../types";
import {
  createGitHubInstallationClient,
  listGitHubInstallationRepositories,
} from "./app";
import { getGitHubConfig } from "./app";

type GitHubOrg = {
  two_factor_requirement_enabled?: boolean;
};

function isNotFound(error: unknown) {
  return error instanceof Error && error.name === "404";
}

function summarizeRepos(repos: { full_name: string }[]) {
  return repos
    .slice(0, 5)
    .map((repo) => repo.full_name)
    .join(", ");
}

export const githubAdapter: IntegrationAdapter = {
  provider: "github",

  async runTest(checkLogic, integration): Promise<TestResult> {
    const client = await createGitHubInstallationClient(integration);
    const config = getGitHubConfig(integration);

    switch (checkLogic) {
      case "check_2fa_enforced": {
        if (!config.owner || config.accountType === "User") {
          return {
            data: { accountType: config.accountType ?? null, owner: config.owner ?? null },
            failureReason: "2FA enforcement is only available for GitHub organisations.",
            status: "manual_review",
          };
        }

        const org = await client.request<GitHubOrg>(`/orgs/${config.owner}`);

        return org.two_factor_requirement_enabled
          ? {
              data: { owner: config.owner, twoFactorRequirementEnabled: true },
              status: "pass",
            }
          : {
              data: { owner: config.owner, twoFactorRequirementEnabled: false },
              failureReason: "GitHub organisation does not require 2FA.",
              status: "fail",
            };
      }

      case "check_branch_protection": {
        const repos = (await listGitHubInstallationRepositories(integration)).filter(
          (repo) => !repo.archived && repo.default_branch,
        );
        const unprotected = [];

        for (const repo of repos.slice(0, 50)) {
          try {
            await client.request(
              `/repos/${repo.full_name}/branches/${repo.default_branch}/protection`,
            );
          } catch (error) {
            if (isNotFound(error)) {
              unprotected.push(repo);
              continue;
            }

            throw error;
          }
        }

        return unprotected.length === 0
          ? {
              data: { checkedRepositories: Math.min(repos.length, 50) },
              status: "pass",
            }
          : {
              data: {
                checkedRepositories: Math.min(repos.length, 50),
                unprotectedCount: unprotected.length,
              },
              failureReason: `Default branch protection missing: ${summarizeRepos(
                unprotected,
              )}`,
              status: "fail",
            };
      }

      case "check_secret_scanning": {
        const repos = (await listGitHubInstallationRepositories(integration)).filter(
          (repo) => !repo.archived,
        );
        const missing = repos.filter(
          (repo) => repo.security_and_analysis?.secret_scanning?.status !== "enabled",
        );

        return missing.length === 0
          ? { data: { checkedRepositories: repos.length }, status: "pass" }
          : {
              data: {
                checkedRepositories: repos.length,
                missingCount: missing.length,
              },
              failureReason: `Secret scanning is not enabled: ${summarizeRepos(
                missing,
              )}`,
              status: "warning",
            };
      }

      case "check_dependency_alerts": {
        const repos = (await listGitHubInstallationRepositories(integration)).filter(
          (repo) => !repo.archived,
        );
        const disabled = [];

        for (const repo of repos.slice(0, 50)) {
          try {
            await client.request(`/repos/${repo.full_name}/vulnerability-alerts`);
          } catch (error) {
            if (isNotFound(error)) {
              disabled.push(repo);
              continue;
            }

            throw error;
          }
        }

        return disabled.length === 0
          ? {
              data: { checkedRepositories: Math.min(repos.length, 50) },
              status: "pass",
            }
          : {
              data: {
                checkedRepositories: Math.min(repos.length, 50),
                disabledCount: disabled.length,
              },
              failureReason: `Dependency alerts are disabled: ${summarizeRepos(
                disabled,
              )}`,
              status: "warning",
            };
      }

      case "check_code_scanning": {
        const repos = (await listGitHubInstallationRepositories(integration)).filter(
          (repo) => !repo.archived,
        );
        const unavailable = [];

        for (const repo of repos.slice(0, 50)) {
          try {
            await client.request(
              `/repos/${repo.full_name}/code-scanning/alerts?per_page=1&state=open`,
            );
          } catch (error) {
            if (isNotFound(error)) {
              unavailable.push(repo);
              continue;
            }

            throw error;
          }
        }

        return unavailable.length === 0
          ? {
              data: { checkedRepositories: Math.min(repos.length, 50) },
              status: "pass",
            }
          : {
              data: {
                checkedRepositories: Math.min(repos.length, 50),
                unavailableCount: unavailable.length,
              },
              failureReason: `Code scanning is unavailable: ${summarizeRepos(
                unavailable,
              )}`,
              status: "manual_review",
            };
      }

      default:
        return {
          data: {},
          failureReason: `Unknown check: ${checkLogic}`,
          status: "not_applicable",
        };
    }
  },
};
