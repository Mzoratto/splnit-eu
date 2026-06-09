import type { Integration } from "@/lib/db/schema";
import {
  checkFirewallPresent,
  checkServerStatus,
  checkSnapshotRecency,
} from "@/lib/connectors/hetzner/checks";
import { getHetznerApiKey } from "@/lib/integrations/hetzner/client";
import type { HetznerCheckResult } from "@/lib/workspaces/hetzner-checks";
import type { IntegrationAdapter, TestResult } from "../types";

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function checkResultToTestResult(
  result: HetznerCheckResult,
  passData: Record<string, unknown>,
  gapReason: string,
): TestResult {
  if (result === "pass") {
    return {
      data: {
        provider: "hetzner",
        ...passData,
      },
      status: "pass",
    };
  }

  if (result === "gap") {
    return {
      data: {
        provider: "hetzner",
      },
      failureReason: gapReason,
      status: "fail",
    };
  }

  return {
    data: {
      blockedReason: "collection_failed",
      provider: "hetzner",
    },
    failureReason:
      "Automatická kontrola Hetzner Cloud selhala; pro toto opatření se má zobrazit manuální čestné prohlášení.",
    status: "error",
  };
}

function getServerId(integration: Integration) {
  const config = asRecord(integration.config);
  const serverId = config.serverId;

  return typeof serverId === "string" && serverId.trim() ? serverId : undefined;
}

async function runHetznerCheck(
  checkLogic: string,
  integration: Integration,
): Promise<TestResult> {
  const apiKey = getHetznerApiKey(integration);

  switch (checkLogic) {
    case "hetzner_server_running": {
      const serverId = getServerId(integration);
      const result = await checkServerStatus(apiKey, serverId);

      return checkResultToTestResult(
        result,
        {
          serverId: serverId ?? null,
          serverStatus: "running",
        },
        "Nebyl nalezen žádný běžící produkční server v Hetzner Cloud.",
      );
    }
    case "hetzner_firewall_present": {
      const result = await checkFirewallPresent(apiKey);

      return checkResultToTestResult(
        result,
        {
          firewallRulesPresent: true,
        },
        "V Hetzner Cloud nebyla nalezena neprázdná sada firewall pravidel.",
      );
    }
    case "hetzner_snapshot_recent": {
      const result = await checkSnapshotRecency(apiKey, 7);

      return checkResultToTestResult(
        result,
        {
          snapshotWindowDays: 7,
          snapshotWithinWindow: true,
        },
        "Nebyl nalezen snapshot vytvořený v posledních 7 dnech.",
      );
    }
    default:
      return {
        data: {},
        failureReason: `Neznámá kontrola Hetzner Cloud: ${checkLogic}`,
        status: "not_applicable",
      };
  }
}

export const hetznerAdapter: IntegrationAdapter = {
  provider: "hetzner",

  async runTest(checkLogic: string, integration: Integration): Promise<TestResult> {
    // The per-org/provider execution lock is acquired by
    // lib/integrations/runner.ts runTestsForOrg via acquireIntegrationRunLock.
    return runHetznerCheck(checkLogic, integration);
  },
};
