import { createAbraFlexiBasicAuthHeader } from "@/lib/connectors/abra-flexi/auth";
import {
  buildAbraFlexiUrl,
  validateAbraBaseUrl,
} from "@/lib/connectors/abra-flexi/url";
import type { AbraFlexiCredentialInput } from "@/lib/connectors/api-key-base/types";
import { decryptSecret } from "@/lib/crypto";
import type { Integration } from "@/lib/db/schema";
import type {
  DiscoveryAdapter,
  DiscoveryResult,
  DiscoveredVendor,
} from "@/lib/discovery/types";

const DEFAULT_TIMEOUT_MS = 10_000;

type FlexiAddress = Record<string, unknown> & {
  dic?: string;
  dodavatel?: boolean | string;
  id?: number | string;
  ic?: string;
  nazev?: string;
};

type PayableSummary = {
  invoiceCount: number;
  partnerId: string;
  totalPayable: number;
};

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function getStringConfig(config: Record<string, unknown>, key: string) {
  const value = config[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function credentialsFor(integration: Integration): AbraFlexiCredentialInput {
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

function withTimeout() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  return {
    cleanup: () => clearTimeout(timeout),
    signal: controller.signal,
  };
}

async function abraFlexiGet(
  credentials: AbraFlexiCredentialInput,
  path: string,
  params?: Record<string, string | number | boolean>,
) {
  await validateAbraBaseUrl(credentials.baseUrl);

  const timeout = withTimeout();

  try {
    return await fetch(buildAbraFlexiUrl(credentials, path, params), {
      headers: {
        accept: "application/json",
        authorization: createAbraFlexiBasicAuthHeader(credentials),
      },
      signal: timeout.signal,
    });
  } finally {
    timeout.cleanup();
  }
}

async function getJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function recordsFromWinstrom<T extends Record<string, unknown>>(
  value: unknown,
  key: string,
): T[] {
  const rows = asRecord(asRecord(value).winstrom)[key];
  return Array.isArray(rows)
    ? rows.filter((row): row is T =>
        typeof row === "object" && row !== null && !Array.isArray(row),
      )
    : [];
}

function stringValue(value: unknown) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

function numberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replaceAll(" ", "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function supplierIdFromInvoice(row: Record<string, unknown>) {
  const firma = row.firma;
  if (typeof firma === "string" || typeof firma === "number") {
    return stringValue(firma);
  }

  const firmaRecord = asRecord(firma);
  return stringValue(firmaRecord.id) ?? stringValue(firmaRecord.kod);
}

async function loadPayableSummaries(
  credentials: AbraFlexiCredentialInput,
): Promise<Map<string, PayableSummary>> {
  const response = await abraFlexiGet(credentials, "/faktura-prijata.json", {
    detail: "custom:id,firma,sumCelkem,sumCelkemMen,datVyst",
    limit: 500,
  });

  if (!response.ok) {
    throw new Error("ABRA Flexi payable invoices are not readable.");
  }

  const invoices = recordsFromWinstrom<Record<string, unknown>>(
    await getJson(response),
    "faktura-prijata",
  );
  const summaries = new Map<string, PayableSummary>();

  for (const invoice of invoices) {
    const partnerId = supplierIdFromInvoice(invoice);
    if (!partnerId) {
      continue;
    }

    const amount = numberValue(invoice.sumCelkem) ?? numberValue(invoice.sumCelkemMen) ?? 0;
    const current = summaries.get(partnerId) ?? {
      invoiceCount: 0,
      partnerId,
      totalPayable: 0,
    };
    current.invoiceCount += 1;
    current.totalPayable += amount;
    summaries.set(partnerId, current);
  }

  return summaries;
}

function criticalityFromSpend(
  spend: PayableSummary | undefined,
): DiscoveredVendor["suggestedCriticality"] {
  if (!spend) {
    return "standard";
  }

  if (spend.totalPayable >= 1_000_000 || spend.invoiceCount >= 24) {
    return "critical";
  }

  if (spend.totalPayable >= 100_000 || spend.invoiceCount >= 6) {
    return "high";
  }

  return "standard";
}

function formatCzk(amount: number) {
  return new Intl.NumberFormat("cs-CZ", {
    currency: "CZK",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount);
}

function isSupplier(address: FlexiAddress) {
  return address.dodavatel !== false && address.dodavatel !== "false";
}

export const abraFlexiDiscoveryAdapter: DiscoveryAdapter = {
  provider: "abra-flexi",

  async discover(integration: Integration): Promise<DiscoveryResult> {
    const credentials = credentialsFor(integration);
    await validateAbraBaseUrl(credentials.baseUrl);

    const warnings: string[] = [];
    let addresses: FlexiAddress[] = [];

    try {
      const response = await abraFlexiGet(credentials, "/adresar.json", {
        detail: "custom:id,nazev,ic,dic,dodavatel",
        limit: 500,
      });

      if (!response.ok) {
        warnings.push(
          "Could not read the ABRA Flexi address book. Check REST API permissions for adresar.",
        );
        return { assets: [], vendors: [], warnings };
      }

      addresses = recordsFromWinstrom<FlexiAddress>(await getJson(response), "adresar");
    } catch {
      warnings.push(
        "Could not read the ABRA Flexi address book. Check REST API permissions for adresar.",
      );
      return { assets: [], vendors: [], warnings };
    }

    let spendByPartner = new Map<string, PayableSummary>();
    try {
      spendByPartner = await loadPayableSummaries(credentials);
    } catch {
      warnings.push(
        "Payable invoice totals were unavailable; supplier criticality is estimated without spend data.",
      );
    }

    const vendors = addresses
      .filter(isSupplier)
      .map((address) => {
        const id = stringValue(address.id) ?? stringValue(address.ic) ?? stringValue(address.nazev);
        const name = stringValue(address.nazev) ?? `ABRA Flexi supplier ${id ?? "unknown"}`;
        const spend = id ? spendByPartner.get(id) : undefined;

        return {
          externalKey: `abra-flexi:vendor:${id ?? name}`,
          ico: stringValue(address.ic),
          metadata: {
            dic: stringValue(address.dic),
            invoiceCount: spend?.invoiceCount ?? null,
            totalPayableCzk: spend?.totalPayable ?? null,
          },
          name,
          provider: "abra-flexi" as const,
          rationale: spend
            ? `Active supplier in accounting: ${spend.invoiceCount} invoices, ~${formatCzk(spend.totalPayable)} in the readable invoice sample.`
            : "Listed as a supplier in the ABRA Flexi address book.",
          suggestedCriticality: criticalityFromSpend(spend),
          supplyType: "Supplier from ABRA Flexi accounting records",
        } satisfies DiscoveredVendor;
      });

    return { assets: [], vendors, warnings };
  },
};
