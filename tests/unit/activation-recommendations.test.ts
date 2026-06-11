import { describe, expect, it } from "vitest";
import {
  getActivationRecommendation,
  getConnectorRecommendationFromTools,
  getPrimaryActivationRecommendation,
  getRecommendedConnectorFromTools,
  getWorkspaceRecommendationForAccountingPlatform,
  toWorkspaceRecommendation,
} from "@/lib/activation/recommendations";

describe("getActivationRecommendation", () => {
  it("resolves canonical keys", () => {
    expect(getActivationRecommendation("microsoft365")?.key).toBe("microsoft365");
    expect(getActivationRecommendation("pohoda")?.kind).toBe("workspace");
  });

  it("resolves aliases", () => {
    expect(getActivationRecommendation("microsoft-copilot")?.key).toBe("microsoft365");
    expect(getActivationRecommendation("github-copilot")?.key).toBe("github");
    expect(getActivationRecommendation("ovh")?.key).toBe("ovhcloud");
  });

  it("normalizes key variants across dash/underscore spellings", () => {
    expect(getActivationRecommendation("google-workspace")?.key).toBe("google_workspace");
    expect(getActivationRecommendation("abra_flexi")?.key).toBe("abra-flexi");
    expect(getActivationRecommendation("money-s3")?.key).toBe("money_s3");
  });

  it("returns null for unknown or missing keys", () => {
    expect(getActivationRecommendation("sap")).toBeNull();
    expect(getActivationRecommendation(null)).toBeNull();
    expect(getActivationRecommendation(undefined)).toBeNull();
  });
});

describe("getWorkspaceRecommendationForAccountingPlatform", () => {
  it("maps accounting platforms to their workspaces", () => {
    expect(getWorkspaceRecommendationForAccountingPlatform("pohoda")?.workspaceKey).toBe("pohoda");
    expect(getWorkspaceRecommendationForAccountingPlatform("helios")?.workspaceKey).toBe("helios");
  });

  it("returns null for none, other, and missing platforms", () => {
    expect(getWorkspaceRecommendationForAccountingPlatform("none")).toBeNull();
    expect(getWorkspaceRecommendationForAccountingPlatform("other")).toBeNull();
    expect(getWorkspaceRecommendationForAccountingPlatform(null)).toBeNull();
  });
});

describe("getConnectorRecommendationFromTools", () => {
  it("returns the first connector match in tool order", () => {
    expect(
      getConnectorRecommendationFromTools(["github", "microsoft365"])?.key,
    ).toBe("github");
  });

  it("skips workspace keys when looking for connectors", () => {
    expect(getConnectorRecommendationFromTools(["pohoda"])).toBeNull();
  });

  it("falls back to microsoft365 only when requested", () => {
    expect(getConnectorRecommendationFromTools([])).toBeNull();
    expect(getConnectorRecommendationFromTools([], { fallback: true })?.key).toBe(
      "microsoft365",
    );
  });
});

describe("getRecommendedConnectorFromTools", () => {
  it("always returns a provider key, defaulting to microsoft365", () => {
    expect(getRecommendedConnectorFromTools(["aws"])).toBe("aws");
    expect(getRecommendedConnectorFromTools([])).toBe("microsoft365");
    expect(getRecommendedConnectorFromTools(["unknown-tool"])).toBe("microsoft365");
  });
});

describe("getPrimaryActivationRecommendation", () => {
  it("prefers a supported workspace over connectors", () => {
    const recommendation = getPrimaryActivationRecommendation({
      accountingPlatform: "pohoda",
      selectedTools: ["microsoft365"],
    });

    expect(recommendation?.kind).toBe("workspace");
    expect(recommendation?.workspaceKey).toBe("pohoda");
  });

  it("uses derived workspace recommendations when no accounting platform is set", () => {
    const recommendation = getPrimaryActivationRecommendation({
      workspaceRecommendations: [
        { label: "Helios", platformKey: "helios", reason: "derived" },
      ],
    });

    expect(recommendation?.workspaceKey).toBe("helios");
  });

  it("falls back to connector recommendations from tools", () => {
    const recommendation = getPrimaryActivationRecommendation({
      accountingPlatform: "none",
      selectedTools: ["github"],
    });

    expect(recommendation?.kind).toBe("connector");
    expect(recommendation?.key).toBe("github");
  });
});

describe("toWorkspaceRecommendation", () => {
  it("converts workspace recommendations and rejects connectors", () => {
    const workspace = getActivationRecommendation("pohoda");
    const connector = getActivationRecommendation("microsoft365");

    expect(toWorkspaceRecommendation(workspace)?.platformKey).toBe("pohoda");
    expect(toWorkspaceRecommendation(connector)).toBeNull();
    expect(toWorkspaceRecommendation(null)).toBeNull();
  });
});
