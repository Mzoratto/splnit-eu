import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { readFileSync } from "node:fs";
import type { Integration } from "../lib/db/schema";

const providerPath = "lib/discovery/providers/github.ts";
const providerSource = readFileSync(providerPath, "utf8");

assert.match(
  providerSource,
  /export const githubDiscoveryAdapter:\s*DiscoveryAdapter/,
  "GitHub discovery adapter exports the DiscoveryAdapter contract",
);
assert.match(providerSource, /provider:\s*"github"/, "GitHub discovery adapter declares provider github");
assert.match(
  providerSource,
  /from "@\/lib\/discovery\/cia-heuristics"/,
  "GitHub discovery adapter imports shared CIA heuristics",
);
assert.match(providerSource, /ciaFor\(/, "GitHub discovery adapter uses ciaFor for asset ratings");
assert.doesNotMatch(
  providerSource,
  /suggestedCia:\s*{[\s\S]*?availability:/,
  "GitHub discovery adapter does not hand-roll CIA ratings",
);
assert.match(
  providerSource,
  /createGitHubInstallationClient/,
  "GitHub discovery adapter reuses the existing installation client helper",
);
assert.match(
  providerSource,
  /listGitHubInstallationRepositories/,
  "GitHub discovery adapter reuses the existing repository listing helper",
);
assert.match(
  providerSource,
  /getGitHubConfig/,
  "GitHub discovery adapter reuses the existing GitHub config helper",
);
assert.match(
  providerSource,
  /github:repo:\$\{repo\.full_name\}/,
  "GitHub repository external keys are stable and repo-scoped",
);
assert.match(
  providerSource,
  /github:member:\$\{member\.id\}/,
  "GitHub privileged member external keys are stable and member-id scoped",
);
assert.match(providerSource, /isPermissionError/, "GitHub permission failures are handled explicitly");
assert.match(providerSource, /warnings\.push\(/, "GitHub partial failures are collected as warnings");

const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
process.env.GITHUB_APP_ID = "12345";
process.env.GITHUB_APP_PRIVATE_KEY = privateKey.export({ format: "pem", type: "pkcs8" }).toString();
process.env.GITHUB_APP_SLUG = "splnit-smoke";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status,
  });
}

function emptyResponse(status = 204) {
  return new Response(null, { status });
}

const calls: string[] = [];
const originalFetch = globalThis.fetch;

globalThis.fetch = async (input) => {
  const url = new URL(input.toString());
  calls.push(`${url.pathname}${url.search}`);

  if (url.pathname === "/app/installations/123/access_tokens") {
    return jsonResponse({ expires_at: "2030-01-01T00:00:00Z", token: "test-installation-token" });
  }

  if (url.pathname === "/installation/repositories") {
    return jsonResponse({
      repositories: [
        {
          archived: false,
          default_branch: "main",
          full_name: "octo/public-site",
          name: "public-site",
          private: false,
          security_and_analysis: { secret_scanning: { status: "enabled" } },
        },
        {
          archived: false,
          default_branch: "main",
          full_name: "octo/core-api",
          name: "core-api",
          private: true,
          security_and_analysis: { secret_scanning: { status: "disabled" } },
        },
        {
          archived: false,
          default_branch: "main",
          full_name: "octo/internal-tool",
          name: "internal-tool",
          private: true,
          security_and_analysis: { secret_scanning: { status: "enabled" } },
        },
      ],
      total_count: 3,
    });
  }

  if (url.pathname === "/repos/octo/core-api/branches/main/protection") {
    return jsonResponse({ message: "Branch not protected" }, 404);
  }

  if (
    url.pathname === "/repos/octo/public-site/branches/main/protection" ||
    url.pathname === "/repos/octo/internal-tool/branches/main/protection"
  ) {
    return emptyResponse();
  }

  if (url.pathname === "/orgs/octo/members") {
    const role = url.searchParams.get("role");

    if (role === "admin") {
      return jsonResponse([{ id: 101, login: "owner-one", type: "User" }]);
    }

    if (role === "member") {
      return jsonResponse([
        { id: 201, login: "member-one", type: "User" },
        { id: 202, login: "member-two", type: "User" },
      ]);
    }
  }

  if (url.pathname === "/orgs/octo/installations") {
    return jsonResponse({
      installations: [
        {
          app_id: 42,
          app_slug: "ci-bot",
          id: 9001,
          permissions: { contents: "read", metadata: "read" },
          repository_selection: "all",
          target_type: "Organization",
        },
      ],
      total_count: 1,
    });
  }

  if (url.pathname === "/orgs/octo/credential-authorizations") {
    return jsonResponse({ message: "Resource not accessible by integration" }, 403);
  }

  return jsonResponse({ message: `Unexpected smoke URL: ${url.pathname}` }, 500);
};

async function main() {
  try {
    const { githubDiscoveryAdapter } = await import("../lib/discovery/providers/github");
    assert.equal(githubDiscoveryAdapter.provider, "github", "adapter provider is github");

    const integration = {
      clerkOrgId: "org_smoke",
      config: {
        accountType: "Organization",
        installationId: "123",
        owner: "octo",
      },
      id: "00000000-0000-0000-0000-000000000123",
      provider: "github",
    } as unknown as Integration;

    const result = await githubDiscoveryAdapter.discover(integration);
    const assetsByKey = new Map(result.assets.map((asset) => [asset.externalKey, asset]));
    const vendorsByKey = new Map(result.vendors.map((vendor) => [vendor.externalKey, vendor]));

    assert.ok(calls.some((call) => call === "/app/installations/123/access_tokens"), "discover uses the GitHub installation token flow");
    assert.ok(calls.some((call) => call.startsWith("/installation/repositories")), "discover uses the installation repository endpoint");

    const service = assetsByKey.get("github:org:octo");
    assert.ok(service, "org primary service asset is emitted");
    assert.equal(service.category, "service", "org asset is a service");
    assert.equal(service.tier, "primary", "org asset is primary tier");
    assert.match(service.rationale, /Suggested from:/, "org CIA rationale comes from heuristics");

    const publicRepo = assetsByKey.get("github:repo:octo/public-site");
    assert.ok(publicRepo, "public repository asset has stable external key");
    assert.equal(publicRepo.category, "software", "repository assets are software");
    assert.notEqual(publicRepo.suggestedCia.confidentiality, "low", "public repo confidentiality floor is raised by internet exposure");
    assert.match(publicRepo.rationale, /internet-facing/, "public repo rationale explains internet exposure");

    const privateUnprotectedRepo = assetsByKey.get("github:repo:octo/core-api");
    assert.ok(privateUnprotectedRepo, "private unprotected repository asset has stable external key");
    assert.equal(privateUnprotectedRepo.metadata.branchProtected, false, "private unprotected repo records missing branch protection");
    assert.equal(privateUnprotectedRepo.suggestedCia.integrity, "high", "private unprotected repo gets privileged-production CIA signal");
    assert.match(privateUnprotectedRepo.rationale, /privileged changes affect production integrity/, "private unprotected repo rationale explains privileged-production risk");

    const owner = assetsByKey.get("github:member:101");
    assert.ok(owner, "owner/admin member is emitted individually with stable member-id external key");
    assert.equal(owner.tier, "primary", "owner/admin member is primary tier");
    assert.equal(owner.suggestedCia.integrity, "high", "owner/admin member gets privileged CIA signal");

    const standardMembers = assetsByKey.get("github:members:standard:octo");
    assert.ok(standardMembers, "standard members are grouped into one summary asset");
    assert.equal(standardMembers.metadata.count, 2, "standard member summary records count");

    const appVendor = vendorsByKey.get("github:vendor:app:9001");
    assert.ok(appVendor, "installed GitHub App is emitted as a vendor");
    assert.equal(appVendor.supplyType, "GitHub app with org access", "GitHub App vendor supply type matches contract");
    assert.equal(appVendor.suggestedCriticality, "high", "GitHub App vendor criticality is high");
    assert.match(appVendor.rationale, /repo\/org access/, "GitHub App vendor rationale mentions repo/org access");

    assert.ok(
      result.warnings.some((warning) => /credential authorizations|permission/i.test(warning)),
      "simulated permission failure is returned as a warning instead of throwing",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }

  console.log("discovery GitHub source smoke passed");
}

void main();
