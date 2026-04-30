export type GitHubIntegrationConfig = {
  installationId?: string;
  owner?: string;
};

export function assertGitHubConfig(config: GitHubIntegrationConfig) {
  if (!config.installationId) {
    throw new Error("GitHub integration requires an installationId.");
  }
}
