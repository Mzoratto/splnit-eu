import type { Integration } from "@/lib/db/schema";
import {
  checkBackupPresent,
  checkFirewallEnabled,
  checkServerStatus,
} from "@/lib/connectors/ovhcloud/checks";
import { getOvhcloudKeys } from "@/lib/integrations/ovhcloud/client";
import type { OVHcloudCheckResult } from "@/lib/workspaces/ovhcloud-checks";
import type { IntegrationAdapter, TestResult } from "../types";

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function checkResultToTestResult(
  result: OVHcloudCheckResult,
  passData: Record<string, unknown>,
  gapReason: string,
): TestResult {
  if (result === "pass") {
    return {
      data: {
        provider: "ovhcloud",
        ...passData,
      },
      status: "pass",
    };
  }

  if (result === "gap") {
    return {
      data: {
        provider: "ovhcloud",
      },
      failureReason: gapReason,
      status: "fail",
    };
  }

  return {
    data: {
      blockedReason: "collection_failed",
      provider: "ovhcloud",
    },
    failureReason:
      "Automatická kontrola OVHcloud selhala; pro toto opatření se má zobrazit manuální čestné prohlášení.",
    status: "error",
  };
}

function getServiceName(integration: Integration) {
  const config = asRecord(integration.config);
  const serviceName = config.serviceName;

  if (typeof serviceName !== "string" || !serviceName.trim()) {
    throw new Error("OVHcloud serviceName is required for dedicated-server checks.");
  }

  return serviceName.trim();
}

async function runOVHcloudCheck(
  checkLogic: string,
  integration: Integration,
): Promise<TestResult> {
  const keys = getOvhcloudKeys(integration);
  const serviceName = getServiceName(integration);

  switch (checkLogic) {
    case "ovhcloud_server_operational": {
      const result = await checkServerStatus(keys, serviceName);

      return checkResultToTestResult(
        result,
        {
          serverStatus: "operational",
          serviceName,
        },
        "Dedikovaný server OVHcloud není ve stavu operational.",
      );
    }
    case "ovhcloud_firewall_enabled": {
      const result = await checkFirewallEnabled(keys, serviceName);

      return checkResultToTestResult(
        result,
        {
          firewallEnabled: true,
          serviceName,
        },
        "Firewall OVHcloud není pro službu zapnutý.",
      );
    }
    case "ovhcloud_backup_present": {
      const result = await checkBackupPresent(keys, serviceName);

      return checkResultToTestResult(
        result,
        {
          backupPresent: true,
          serviceName,
        },
        "Backup storage pro službu OVHcloud nebylo nalezeno.",
      );
    }
    default:
      return {
        data: {},
        failureReason: `Neznámá kontrola OVHcloud: ${checkLogic}`,
        status: "not_applicable",
      };
  }
}

export const ovhcloudAdapter: IntegrationAdapter = {
  provider: "ovhcloud",

  async runTest(checkLogic: string, integration: Integration): Promise<TestResult> {
    // The per-org/provider execution lock is acquired by
    // lib/integrations/runner.ts runTestsForOrg via acquireIntegrationRunLock.
    return runOVHcloudCheck(checkLogic, integration);
  },
};
