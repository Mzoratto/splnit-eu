import { decryptSecret } from "@/lib/crypto";
import type { Integration } from "@/lib/db/schema";
import type { AbraFlexiCredentialInput } from "@/lib/connectors/api-key-base/types";
import {
  checkBackupApiFallback,
  checkConfigurationReadable,
  checkHttpsTransport,
  checkUserListAccessible,
} from "@/lib/connectors/abra-flexi/checks";
import type { AbraFlexiCheckResult } from "@/lib/connectors/abra-flexi/types";
import type { IntegrationAdapter, TestResult } from "../types";

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function getStringConfig(config: Record<string, unknown>, key: string) {
  const value = config[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function getCredentials(integration: Integration): AbraFlexiCredentialInput {
  const config = asRecord(integration.config);
  const baseUrl = getStringConfig(config, "baseUrl");
  const companyName = getStringConfig(config, "companyName");
  const usernameEnc = getStringConfig(config, "usernameEnc");

  if (!integration.accessTokenEnc || !baseUrl || !companyName || !usernameEnc) {
    throw new Error("ABRA Flexi credentials are missing.");
  }

  return {
    baseUrl,
    companyName,
    password: decryptSecret(integration.accessTokenEnc, integration.clerkOrgId),
    username: decryptSecret(usernameEnc, integration.clerkOrgId),
  };
}

function checkResultToTestResult(
  result: AbraFlexiCheckResult,
  passData: Record<string, unknown>,
  gapReason: string,
  manualReviewReason?: string,
): TestResult {
  if (result === "pass") {
    return {
      data: {
        provider: "abra-flexi",
        ...passData,
      },
      status: "pass",
    };
  }

  if (result === "gap") {
    return {
      data: {
        provider: "abra-flexi",
      },
      failureReason: gapReason,
      status: "fail",
    };
  }

  if (result === "manual_review") {
    return {
      data: {
        blockedReason: "needs_manual_upload",
        provider: "abra-flexi",
      },
      failureReason:
        manualReviewReason ??
        "ABRA Flexi API neposkytlo dostatek dat pro automatické rozhodnutí; doložte opatření ručně.",
      status: "manual_review",
    };
  }

  return {
    data: {
      blockedReason: "collection_failed",
      provider: "abra-flexi",
    },
    failureReason:
      "Automatická kontrola ABRA Flexi selhala; zkontrolujte oprávnění REST API uživatele nebo doložte opatření ručně.",
    status: "error",
  };
}

async function runAbraFlexiCheck(
  checkLogic: string,
  integration: Integration,
): Promise<TestResult> {
  const credentials = getCredentials(integration);

  switch (checkLogic) {
    case "abra_flexi_user_list_accessible": {
      const result = await checkUserListAccessible(credentials);

      return checkResultToTestResult(
        result,
        { userListAccessible: true },
        "ABRA Flexi API nevrátilo žádné aktivní uživatele k posouzení.",
      );
    }
    case "abra_flexi_https_transport": {
      const result = checkHttpsTransport(credentials);

      return checkResultToTestResult(
        result,
        { baseUrlProtocol: new URL(credentials.baseUrl).protocol.replace(":", "") },
        "ABRA Flexi připojení používá HTTP; zvažte HTTPS nebo VPN kompenzační opatření.",
      );
    }
    case "abra_flexi_backup_api_fallback": {
      const result = await checkBackupApiFallback(credentials);

      return checkResultToTestResult(
        result,
        { backupApiChecked: true },
        "ABRA Flexi backup endpoint není dostupný.",
        "Stav záloh ABRA Flexi vyžaduje ruční doložení plánu zálohování a posledního testu obnovy.",
      );
    }
    case "abra_flexi_configuration_readable": {
      const result = await checkConfigurationReadable(credentials);

      return checkResultToTestResult(
        result,
        { configurationReadable: true },
        "ABRA Flexi konfigurační evidence není čitelná přes REST API.",
        "Konfigurační evidence ABRA Flexi není přes REST API dostatečně čitelná; doložte nastavení ručně.",
      );
    }
    default:
      return {
        data: {},
        failureReason: `Neznámá kontrola ABRA Flexi: ${checkLogic}`,
        status: "not_applicable",
      };
  }
}

export const abraFlexiAdapter: IntegrationAdapter = {
  provider: "abra-flexi",

  async runTest(checkLogic: string, integration: Integration): Promise<TestResult> {
    return runAbraFlexiCheck(checkLogic, integration);
  },
};
