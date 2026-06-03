import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  getIntegrationHubRecommendations,
  getPrimaryActivationRecommendation,
  getRecommendedConnectorFromTools,
  getWorkspaceRecommendationForAccountingPlatform,
} from "../lib/activation/recommendations";

const erpFirst = getPrimaryActivationRecommendation({
  accountingPlatform: "helios",
  selectedTools: ["microsoft-copilot", "github-copilot"],
});
assert.equal(erpFirst?.kind, "workspace");
assert.equal(erpFirst?.key, "helios");
assert.equal(erpFirst?.href, "/workspaces/helios");

const microsoft = getPrimaryActivationRecommendation({
  selectedTools: ["microsoft-copilot"],
});
assert.equal(microsoft?.kind, "connector");
assert.equal(microsoft?.key, "microsoft365");
assert.equal(microsoft?.href, "/integrations/microsoft365");

const github = getPrimaryActivationRecommendation({
  selectedTools: ["github-copilot"],
});
assert.equal(github?.key, "github");
assert.equal(github?.href, "/integrations/github");

const aws = getPrimaryActivationRecommendation({
  selectedTools: ["aws"],
});
assert.equal(aws?.key, "aws");
assert.equal(aws?.href, "/integrations/aws");

const unsupportedErpFallsBack = getPrimaryActivationRecommendation({
  accountingPlatform: "other",
  selectedTools: ["github-copilot"],
});
assert.equal(unsupportedErpFallsBack?.key, "github");

assert.equal(getRecommendedConnectorFromTools(["google-workspace"]), "google_workspace");
assert.equal(getRecommendedConnectorFromTools(["unknown-tool"]), "microsoft365");

assert.deepEqual(getWorkspaceRecommendationForAccountingPlatform("pohoda"), {
  href: "/workspaces/pohoda",
  key: "pohoda",
  kind: "workspace",
  label: "Pohoda",
  planned: false,
  providerKey: null,
  reason: "Používáte Pohoda — doporučujeme propojit účetní data se sadou NIS2 kontrol specifických pro Pohoda (zálohování dat, přístup k mServeru, API credentials).",
  supported: true,
  workspaceKey: "pohoda",
});

assert.deepEqual(
  getIntegrationHubRecommendations().map((recommendation) => recommendation.key),
  [
    "microsoft365",
    "github",
    "aws",
    "hetzner",
    "ovhcloud",
    "google_workspace",
    "pohoda",
    "abra-flexi",
    "money_s3",
    "helios",
  ],
);

const integrationsPageSource = readFileSync("app/(app)/integrations/page.tsx", "utf8");
assert.match(integrationsPageSource, /getIntegrationHubRecommendations/);
assert.doesNotMatch(integrationsPageSource, /const providers\s*=\s*\[/);

console.log("Activation recommendation registry smoke passed.");
