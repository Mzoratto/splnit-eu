import "server-only";

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const ABRA_FLEXI_DISCOVERY_FLAG = "SPLNIT_DISCOVERY_ABRA_FLEXI_ENABLED";

function boolEnv(name: string, fallback = false) {
  const value = process.env[name];
  if (value === undefined) {
    return fallback;
  }

  return TRUE_VALUES.has(value.trim().toLowerCase());
}

function csvEnv(name: string) {
  return (process.env[name] ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function providerFlagName(provider: string) {
  return `SPLNIT_DISCOVERY_${provider.replaceAll("-", "_").toUpperCase()}_ENABLED`;
}

export function isDiscoveryGloballyEnabled() {
  return boolEnv("SPLNIT_DISCOVERY_ENABLED", false);
}

export function isDiscoveryEnabledForOrg(clerkOrgId: string) {
  if (isDiscoveryGloballyEnabled()) {
    return true;
  }

  return csvEnv("SPLNIT_DISCOVERY_ALLOWED_ORG_IDS").includes(clerkOrgId);
}

export function isDiscoveryProviderEnabled(provider: string) {
  if (provider === "abra-flexi") {
    return boolEnv(ABRA_FLEXI_DISCOVERY_FLAG, false);
  }

  return boolEnv(providerFlagName(provider), true);
}

export function assertDiscoveryEnabledForOrg(clerkOrgId: string) {
  if (!isDiscoveryEnabledForOrg(clerkOrgId)) {
    throw new Error("Discovery is disabled for this organisation.");
  }
}
