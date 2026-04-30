export type GitHubIntegrationConfig = {
  accountType?: string;
  installationId?: string;
  owner?: string;
};

export function assertGitHubConfig(
  config: GitHubIntegrationConfig,
): asserts config is GitHubIntegrationConfig & { installationId: string } {
  if (!config.installationId) {
    throw new Error("GitHub integration requires an installationId.");
  }
}
